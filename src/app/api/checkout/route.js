import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/checkout - Process checkout with Coupon validation and Purchase logging
export async function POST(request) {
  try {
    const { cart, customer, couponCode } = await request.json();

    if (!cart || cart.length === 0 || !customer) {
      return NextResponse.json(
        { error: 'Sepet ve müşteri bilgileri gereklidir.' },
        { status: 400 }
      );
    }

    const { name, surname, email, phone } = customer;
    if (!name || !surname || !email || !phone) {
      return NextResponse.json(
        { error: 'Lütfen tüm fatura ve iletişim bilgilerini doldurun.' },
        { status: 400 }
      );
    }

    // Verify products and calculate base total price
    let calculatedTotal = 0;
    const itemsToPay = [];

    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Ürün bulunamadı veya pasif durumda: ${item.title}` },
          { status: 404 }
        );
      }

      const discountedPrice = product.price * (1 - product.discountRate / 100);
      calculatedTotal += discountedPrice * item.quantity;

      itemsToPay.push({
        id: product.id,
        title: product.title,
        baseDiscountedPrice: discountedPrice,
        quantity: item.quantity
      });
    }

    const calculatedTotalBeforeCoupon = calculatedTotal;

    // Apply coupon if valid
    let coupon = null;
    if (couponCode) {
      const codeUpper = couponCode.toUpperCase().trim();
      coupon = await prisma.coupon.findUnique({
        where: { code: codeUpper }
      });

      if (coupon && coupon.isActive) {
        // Expiry check
        const isNotExpired = !coupon.expireDate || new Date(coupon.expireDate) > new Date();
        if (isNotExpired) {
          if (coupon.discountType === 'PERCENTAGE') {
            calculatedTotal = calculatedTotal * (1 - coupon.discountValue / 100);
          } else {
            calculatedTotal = Math.max(0, calculatedTotal - coupon.discountValue);
          }
        } else {
          return NextResponse.json({ error: 'Kullanılan kupon kodunun süresi dolmuş.' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Geçersiz veya pasif kupon kodu.' }, { status: 400 });
      }
    }

    // SIMULATED VIRTUAL POS TRANSACTION SKELETON
    console.log(`[Virtual POS Checkout] Simulating payment for ${name} ${surname}. Total: ₺${calculatedTotal}`);

    // Create or find customer user account
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          surname,
          phone,
          password: 'uye' + Math.floor(1000 + Math.random() * 9000), // Simple plain-text testing password
        }
      });
    }

    // Log the purchases in database
    for (const item of itemsToPay) {
      let finalPricePaid = item.baseDiscountedPrice;
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          finalPricePaid = finalPricePaid * (1 - coupon.discountValue / 100);
        } else {
          // Pro-rate fixed amount discount
          const ratio = item.baseDiscountedPrice / calculatedTotalBeforeCoupon;
          finalPricePaid = Math.max(0, item.baseDiscountedPrice - (coupon.discountValue * ratio));
        }
      }

      await prisma.purchase.create({
        data: {
          userId: user.id,
          productId: item.id,
          pricePaid: parseFloat(finalPricePaid.toFixed(2))
        }
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Ödeme başarıyla alındı ve siparişiniz oluşturuldu.',
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      amount: parseFloat(calculatedTotal.toFixed(2)),
      user: {
        email: user.email,
        password: user.password // returning the auto-generated password so they can see it in client UI!
      }
    });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Ödeme işlemi sırasında teknik bir hata oluştu.' },
      { status: 500 }
    );
  }
}
