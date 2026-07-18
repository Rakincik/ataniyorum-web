require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const crypto = require('crypto');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database with updated modules...');

  // 1. Clear existing data in correct order
  await prisma.purchase.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.setting.deleteMany({});

  // 2. Create Admin User
  const adminPassword = process.env.ADMIN_PASSWORD || 'TT.123.';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ataniyorum.com';
  const hashedPassword = hashPassword(adminPassword);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Türker Hoca',
    },
  });
  console.log('Admin user created:', admin.email);

  // 3. Create Default Settings
  const settings = await prisma.setting.create({
    data: {
      id: 1,
      countdownTitle: 'ÖABT EDEBİYAT SINAVI',
      countdownDate: new Date('2026-08-16T09:30:00.000Z'),
      whatsappNumber: '905000000000',
      instagramUrl: 'https://www.instagram.com/turkerhocaedb',
      contactEmail: 'iletisim@ataniyorumhocam.com',
      countdownActive: true,
      sliderActive: true,
    },
  });
  console.log('Default settings created:', settings.countdownTitle);

  // 4. Create Category Tree
  const oabtParent = await prisma.category.create({
    data: { name: 'ÖABT Paketlerimiz' },
  });
  const yayinParent = await prisma.category.create({
    data: { name: 'Yayınlarımız' },
  });

  const catCanli = await prisma.category.create({
    data: { name: 'Canlı Ders', parentId: oabtParent.id },
  });
  const catVideo = await prisma.category.create({
    data: { name: 'Video Ders', parentId: oabtParent.id },
  });
  const catCanliHizli = await prisma.category.create({
    data: { name: 'CANLI ve HIZLI DERSLER', parentId: oabtParent.id },
  });
  const catSadeceHizli = await prisma.category.create({
    data: { name: 'SADECE HIZLI', parentId: oabtParent.id },
  });

  console.log('Categories seeded.');

  // 5. Create Initial Products linked to Categories
  const productData = [
    {
      title: '1000 Soru Sezon Finali Kampı',
      categoryId: catCanli.id,
      price: 1500.0,
      discountRate: 50,
      imageUrl: '/uploads/product-1.jpg',
      description: '<p>Edebiyat ÖABT için <strong>1000 soru çözümü</strong> sezon finali kampı. Kaçırılmayacak fırsat!</p>',
      isActive: true,
    },
    {
      title: 'Temel Paket - Canlı',
      categoryId: catCanli.id,
      price: 14300.0,
      discountRate: 35,
      imageUrl: '/uploads/product-2.jpg',
      description: '<p>Türker Tola ile 2026 ÖABT Edebiyat <strong>Temel Paket Canlı Ders</strong> programı.</p>',
      isActive: true,
    },
    {
      title: 'Temel Paket - Video',
      categoryId: catVideo.id,
      price: 12200.0,
      discountRate: 29,
      imageUrl: '/uploads/product-3.jpg',
      description: '<p>Tüm derslerin video kayıtları, PDF dokümanları ve soru çözümleri.</p>',
      isActive: true,
    },
    {
      title: 'Premium Paket - Canlı',
      categoryId: catCanli.id,
      price: 19300.0,
      discountRate: 36,
      imageUrl: '/uploads/product-4.jpg',
      description: '<p>Canlı dersler + Video kayıtları + Birebir rehberlik + Özel Soru Bankası kitapları.</p>',
      isActive: true,
    },
    {
      title: 'Türk Halk Edebiyatı Soru Çözüm Kampı',
      categoryId: catVideo.id,
      price: 2750.0,
      discountRate: 35,
      imageUrl: '/uploads/product-5.jpg',
      description: '<p>Türk Halk Edebiyatı ünite ünite detaylı soru çözüm paketi.</p>',
      isActive: true,
    }
  ];

  const products = [];
  for (const item of productData) {
    const p = await prisma.product.create({ data: item });
    products.push(p);
  }
  console.log(`${products.length} products seeded.`);

  // 6. Create Initial Customer Users (with visible testing passwords)
  const users = [
    {
      name: 'Fatmanur',
      surname: 'Demir Demir',
      email: 'fatmanur@example.com',
      password: 'fatmanur.123',
      phone: '5418432693',
      tc: '11122233344',
      birthDate: '1998-05-14',
    },
    {
      name: 'Ahmet',
      surname: 'Unutkan',
      email: 'ahmet@example.com',
      password: 'ahmet.123',
      phone: '5056287627',
      tc: '22233344455',
      birthDate: '1995-10-22',
    },
    {
      name: 'Bayram',
      surname: 'Öz',
      email: 'bayram@example.com',
      password: 'bayram.123',
      phone: '5558908568',
      tc: '14525947412',
      birthDate: '1992-07-14',
    }
  ];

  const seededUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({ data: u });
    seededUsers.push(user);
  }
  console.log(`${seededUsers.length} users seeded.`);

  // 7. Create Purchases / Orders
  await prisma.purchase.create({
    data: {
      userId: seededUsers[0].id,
      productId: products[0].id, // 1000 Soru Sezon Finali (1500TL, 50% = 750TL)
      pricePaid: 750.0,
    },
  });

  await prisma.purchase.create({
    data: {
      userId: seededUsers[1].id,
      productId: products[2].id, // Temel Paket Video (12200TL, 29% = 8662TL)
      pricePaid: 8662.0,
    },
  });
  console.log('Purchases seeded.');

  // 8. Create Coupons
  const coupons = [
    { code: 'ATANIYORUM50', discountType: 'PERCENTAGE', discountValue: 50 },
    { code: 'TURKERHOCA100', discountType: 'AMOUNT', discountValue: 100.0 },
    { code: 'YENIDONEM10', discountType: 'PERCENTAGE', discountValue: 10 },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }
  console.log('Coupons seeded.');

  // 9. Create Initial Announcements
  const announcements = [
    {
      title: 'Cumhuriyetimizin 102. Yaşında "Cumhuriyet" İndirimi Sizlerle !',
      content: '<p>Cumhuriyetimizin yeni yaşında tüm canlı ve video ders paketlerinde <strong>%50 net indirim</strong> başlamıştır. Son gün 29 Ekim!</p>',
      date: new Date('2025-10-28'),
      isActive: true,
    },
    {
      title: 'CANLI SINIF KONTENJANLARIMIZIN %80\'i DOLMUŞTUR!',
      content: '<p>Sınırlı kontenjana sahip canlı ders gruplarımızda doluluk oranı <strong>%80\'e ulaşmıştır</strong>. Kayıtları kaçırmamak için acele edin.</p>',
      date: new Date('2025-10-25'),
      isActive: true,
    },
    {
      title: '2026 MEB-AGS DERSLERİMİZ BAŞLIYOR !',
      content: '<p>Milli Eğitim Bakanlığı Akademi Giriş Sınavı (MEB-AGS) hazırlık derslerimiz alanında uzman kadromuzla başlıyor.</p>',
      date: new Date('2025-10-24'),
      isActive: true,
    },
    {
      title: '2026 ÖABT EDEBİYAT DERSLERİMİZ BAŞLIYOR!',
      content: '<p>ÖABT Edebiyat 2026 dönem eğitimleri Türker Tola koordinatörlüğünde 1 Kasım itibarıyla başlamaktadır.</p>',
      date: new Date('2025-10-21'),
      isActive: true,
    }
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement });
  }
  console.log(`${announcements.length} announcements seeded.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
