import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/settings - Fetch global settings
export async function GET() {
  try {
    let settings = await prisma.setting.findUnique({
      where: { id: 1 },
    });

    // If settings don't exist yet, create default settings
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: 1,
          countdownTitle: 'ÖABT EDEBİYAT SINAVI',
          countdownDate: new Date('2026-08-16T09:30:00.000Z'),
          whatsappNumber: '905000000000',
          instagramUrl: 'https://www.instagram.com/turkerhocaedb',
          contactEmail: 'iletisim@ataniyorumhocam.com',
          purchaseVideoUrl: '',
          couponVideoUrl: '',
          countdownActive: true,
          sliderActive: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get Settings API Error:', error);
    return NextResponse.json(
      { error: 'Site ayarları yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update global settings (Admin Only)
export async function PUT(request) {
  try {
    // Check admin authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
      || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      countdownTitle, 
      countdownDate, 
      whatsappNumber, 
      instagramUrl, 
      contactEmail,
      purchaseVideoUrl,
      couponVideoUrl,
      countdownActive,
      sliderActive
    } = data;

    const settings = await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        countdownTitle: countdownTitle !== undefined ? countdownTitle : undefined,
        countdownDate: countdownDate ? new Date(countdownDate) : undefined,
        whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
        contactEmail: contactEmail !== undefined ? contactEmail : undefined,
        purchaseVideoUrl: purchaseVideoUrl !== undefined ? purchaseVideoUrl : undefined,
        couponVideoUrl: couponVideoUrl !== undefined ? couponVideoUrl : undefined,
        countdownActive: countdownActive !== undefined ? countdownActive : undefined,
        sliderActive: sliderActive !== undefined ? sliderActive : undefined,
      },
      create: {
        id: 1,
        countdownTitle: countdownTitle || 'ÖABT EDEBİYAT SINAVI',
        countdownDate: countdownDate ? new Date(countdownDate) : new Date('2026-08-16T09:30:00.000Z'),
        whatsappNumber: whatsappNumber || '905000000000',
        instagramUrl: instagramUrl || 'https://www.instagram.com/turkerhocaedb',
        contactEmail: contactEmail || 'iletisim@ataniyorumhocam.com',
        purchaseVideoUrl: purchaseVideoUrl || '',
        couponVideoUrl: couponVideoUrl || '',
        countdownActive: countdownActive !== undefined ? countdownActive : true,
        sliderActive: sliderActive !== undefined ? sliderActive : true,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update Settings API Error:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
