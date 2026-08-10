import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      title,
      slug,
      description,
      content,
      basePrice,
      categoryId,
      promoVideoUrl,
      image,
      shopierUrl,
      variants,
      addons,
      features,
      images,
      crossSellTargetIds,
      isActive,
      isStockOut,
      isFree
    } = data;

    if (!title || !slug || !categoryId) {
      return NextResponse.json({ error: "Başlık, Slug ve Kategori zorunludur." }, { status: 400 });
    }

    // Eğitim ve ilişkili verileri tek bir transaction ile oluştur
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        content,
        basePrice,
        categoryId,
        promoVideoUrl,
        image,
        shopierUrl: shopierUrl || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isStockOut: Boolean(isStockOut),
        isFree: Boolean(isFree),
        variants: {
          create: variants.map((v: any) => ({
            name: v.name,
            price: v.price,
            shopierUrl: v.shopierUrl || null
          }))
        },
        addons: {
          create: addons.map((a: any) => ({
            name: a.name,
            price: a.price,
            shopierUrl: a.shopierUrl || null
          }))
        },
        features: {
          create: (features || []).map((f: any, index: number) => ({
            name: f.name,
            order: index
          }))
        },
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            order: index
          }))
        }
      }
    });

    if (crossSellTargetIds && Array.isArray(crossSellTargetIds) && crossSellTargetIds.length > 0) {
      await prisma.productCrossSell.createMany({
        data: crossSellTargetIds.map((targetId: string) => ({
          productId: product.id,
          targetProductId: targetId
        }))
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product creation error:", error);
    // Benzersiz kısıtlaması (Slug) ihlali kontrolü
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: "Bu SEO URL (Slug) zaten kullanılıyor. Lütfen farklı bir isim girin." }, { status: 400 });
    }
    return NextResponse.json({ error: "Eğitim oluşturulurken sunucu hatası oluştu." }, { status: 500 });
  }
}
