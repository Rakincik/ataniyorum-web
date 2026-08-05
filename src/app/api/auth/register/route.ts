import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, tcNo, phone, address } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Lütfen zorunlu alanları doldurun." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu e-posta adresi ile kayıtlı bir hesap zaten var." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password, // Stored in plain text as requested by the client!
        tcNo,
        phone,
        address,
      },
    });

    return NextResponse.json(
      { message: "Kayıt başarılı", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
