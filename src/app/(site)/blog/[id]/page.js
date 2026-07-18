import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog Detayı - Atanıyorum Hocam',
};

export default async function BlogPostPage({ params }) {
  const { id } = await params;

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link href="/blog" className="btn btn-sm btn-outline-secondary mb-4 gap-1 d-inline-flex align-items-center">
            <i className="bi bi-arrow-left"></i> Blog Listesine Dön
          </Link>

          <article>
            <header className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                <i className="bi bi-calendar3"></i>
                <span>15 Ekim 2025</span>
                <span className="mx-2">•</span>
                <i className="bi bi-person"></i>
                <span>Türker Hoca</span>
              </div>
              <h1 className="display-6 fw-bold text-primary mb-3">
                ÖABT KONU ANLATIM SETLERİMİZ ÖĞRETMENLERİMİZE ULAŞIYOR
              </h1>
            </header>

            <img
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"
              alt="Konu Anlatım Setleri"
              className="img-fluid rounded-4 mb-4 w-100"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />

            <div className="rich-text fs-6 text-dark leading-relaxed">
              <p>
                Değerli öğretmen adaylarımız, uzun ve titiz bir çalışmanın ürünü olan <strong>2026 Edebiyat ve Türkçe ÖABT Konu Anlatım Setlerimiz</strong> nihayet basım süreçlerini tamamladı. Depolarımıza giren kitaplarımızın paketlenme işlemleri tamamlanarak, sipariş sırasına göre kargolanmaya başlanmıştır.
              </p>
              <p>
                Kitap setlerimiz, son yıllardaki ÖSYM ÖABT soru kalıpları, MEB müfredat güncellemeleri ve akademik kaynaklardaki yeni görüşler dikkate alınarak sıfırdan revize edilmiştir. Özellikle Eski Türk Dili, Divan Edebiyatı şerhleri ve Yeni Türk Edebiyatı bölümlerinde nokta atışı bilgiler içermektedir.
              </p>
              <p>
                <strong>Kargo Takip Bilgileri Hakkında:</strong> Kitaplarınız kargoya verildiğinde, kayıtlı telefon numaranıza Yurtiçi Kargo tarafından kargo takip numaranızı içeren bir SMS gönderilecektir. Ayrıca ders panelinizdeki &quot;Siparişlerim&quot; sekmesi altından kargonuzun durumunu anlık olarak sorgulayabilirsiniz.
              </p>
              <p>
                Bu zorlu ve keyifli hazırlık sürecinde hazırladığımız bu setin atama hedefinize giden yolda en büyük yardımcınız olmasını diliyor, tüm adaylarımıza başarılar diliyoruz!
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
