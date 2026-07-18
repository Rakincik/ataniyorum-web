import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// POST /api/upload - Drag & Drop Image Uploader (Admin Only)
export async function POST(request) {
  try {
    // Check admin authentication
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, GIF, WEBP, SVG).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Normalize filename and path
    const sanitizedFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure the folder exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, sanitizedFilename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${sanitizedFilename}`,
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
