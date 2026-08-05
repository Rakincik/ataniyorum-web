import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productIds } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // 1. Fetch explicit cross-sells configured by admin for products in cart
    const explicitCrossSells = await prisma.productCrossSell.findMany({
      where: {
        productId: { in: productIds },
        targetProductId: { notIn: productIds } // Exclude products already in cart
      },
      include: {
        targetProduct: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
            variants: { take: 1, orderBy: { price: "asc" } },
            category: true
          }
        }
      }
    });

    let recommendedProducts = explicitCrossSells.map(cs => cs.targetProduct);

    // 2. If fewer than 2 recommendations, fallback to other products not in cart
    if (recommendedProducts.length < 2) {
      const existingIds = [...productIds, ...recommendedProducts.map(p => p.id)];
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds }
        },
        take: 3 - recommendedProducts.length,
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          variants: { take: 1, orderBy: { price: "asc" } },
          category: true
        }
      });

      recommendedProducts = [...recommendedProducts, ...fallbackProducts];
    }

    // Format output
    const formatted = recommendedProducts.map(p => {
      const primaryVariant = p.variants[0];
      const displayPrice = p.basePrice + (primaryVariant ? primaryVariant.price : 0);
      const imageUrl = p.images[0]?.url || p.image || "/logo.png";

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        image: imageUrl,
        categoryName: p.category?.name,
        price: displayPrice,
        variantId: primaryVariant?.id || "",
        variantName: primaryVariant?.name || "Standart Paket",
        variantPrice: primaryVariant?.price || 0,
        basePrice: p.basePrice
      };
    });

    return NextResponse.json({ recommendations: formatted });
  } catch (error) {
    console.error("Cross sell API error", error);
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
