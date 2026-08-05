import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let platformOrderId = "";
    let status = "success";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      // Shopier REST Webhook format
      platformOrderId = body.platform_order_id || body.custom_order_id || body.id || "";
      status = body.status === "failed" ? "failed" : "success";
    } else {
      // Standard Form / OSB Callback format
      const formData = await req.formData();
      status = (formData.get("status") as string) || "success";
      platformOrderId = (formData.get("platform_order_id") as string) || "";
    }

    if (status === "success" && platformOrderId) {
      const order = await prisma.order.findUnique({
        where: { id: platformOrderId }
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            shopierOrderId: `SHOP-${Math.floor(100000 + Math.random() * 900000)}`
          }
        });

        if (order.couponCode) {
          await prisma.coupon.updateMany({
            where: { code: order.couponCode },
            data: { usedCount: { increment: 1 } }
          });
        }
      }

      if (contentType.includes("application/json")) {
        return NextResponse.json({ success: true, message: "Webhook received" });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/checkout/success?orderId=${platformOrderId}`, 303);
    } else {
      if (platformOrderId) {
        await prisma.order.update({
          where: { id: platformOrderId },
          data: { status: "FAILED" }
        });
      }

      if (contentType.includes("application/json")) {
        return NextResponse.json({ success: false, message: "Payment failed" }, { status: 400 });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/cart?error=payment_failed`, 303);
    }
  } catch (error: any) {
    console.error("Shopier Callback Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
