import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Prepare variants. 
    // We separate variants that have an existing ID (to update) and ones without (to create).
    const existingVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        content,
        basePrice,
        categoryId,
        promoVideoUrl,
        image,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isStockOut: Boolean(isStockOut),
        isFree: Boolean(isFree),
        
        // Handling Addons: Delete all and recreate to be simple (no strict FK constraints)
        addons: {
          deleteMany: {},
          create: addons.map((a: any) => ({
            name: a.name,
            price: a.price
          }))
        },

        features: {
          deleteMany: {},
          create: (features || []).map((f: any, index: number) => ({
            name: f.name,
            order: index
          }))
        },

        // Handling Images: Delete all and recreate to preserve order
        images: {
          deleteMany: {},
          create: images.map((url: string, index: number) => ({
            url,
            order: index
          }))
        }
      }
    });

    // Handle Cross Sells
    if (crossSellTargetIds && Array.isArray(crossSellTargetIds)) {
      await prisma.productCrossSell.deleteMany({
        where: { productId: id }
      });
      if (crossSellTargetIds.length > 0) {
        await prisma.productCrossSell.createMany({
          data: crossSellTargetIds.map((targetId: string) => ({
            productId: id,
            targetProductId: targetId
          }))
        });
      }
    }

    // Handle Variants manually to avoid deleting variants that might be in an Order
    // 1. Delete variants that were removed from the UI (and hope they aren't ordered yet)
    await prisma.productVariant.deleteMany({
      where: {
        productId: id,
        id: { notIn: existingVariantIds }
      }
    });

    // 2. Upsert (Update or Create) the ones passed from UI
    for (const v of variants) {
      if (v.id) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { name: v.name, price: v.price, shopierUrl: v.shopierUrl || null }
        });
      } else {
        await prisma.productVariant.create({
          data: { name: v.name, price: v.price, shopierUrl: v.shopierUrl || null, productId: id }
        });
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product update error:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: "Bu SEO URL (Slug) zaten kullanılıyor. Lütfen farklı bir isim girin." }, { status: 400 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Bu eğitime ait bazı paketler satılmış durumda. Satılmış paketleri silemezsiniz." }, { status: 400 });
    }
    return NextResponse.json({ error: "Eğitim güncellenirken sunucu hatası oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Bu eğitime ait satış kayıtları mevcut olduğu için silinemez." }, { status: 400 });
    }
    return NextResponse.json({ error: "Silme işlemi sırasında sunucu hatası oluştu." }, { status: 500 });
  }
}
