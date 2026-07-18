import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - Atanıyorum Hocam',
};

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: 'ÖABT KONU ANLATIM SETLERİMİZ ÖĞRETMENLERİMİZE ULAŞIYOR',
      excerpt: '2026 ÖABT Edebiyat ve Türkçe hazırlık setlerimiz basımdan çıkarak kargolanmaya başladı. Detaylar ve kargo süreçleri hakkında bilgilendirme.',
      date: '2025-10-15',
      author: 'Türker Hoca',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=350',
    }
  ];

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <span className="text-muted text-uppercase tracking-wider small fw-bold">Atanıyorum Hocam Güncel</span>
        <h1 className="display-6 fw-bold mt-1 text-primary">Blog & Haberler</h1>
        <p className="lead text-muted max-w-2xl mx-auto mt-2">
          Sınav taktikleri, güncel ders duyuruları ve eğitim dünyasından en son haberler.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {posts.map((post) => (
          <div key={post.id} className="col-md-8 col-lg-6">
            <div className="card h-100 border rounded-4 overflow-hidden shadow-sm hover-shadow transition">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="card-img-top"
                style={{ height: '240px', objectFit: 'cover' }}
              />
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                  <i className="bi bi-calendar3"></i>
                  <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
                  <span className="mx-2">•</span>
                  <i className="bi bi-person"></i>
                  <span>{post.author}</span>
                </div>
                <h3 className="card-title fs-4 fw-bold mb-3">{post.title}</h3>
                <p className="card-text text-muted small mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.id}`}
                  className="btn btn-outline-primary fw-semibold px-4 py-2"
                  style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', borderRadius: '6px' }}
                >
                  Devamını Oku
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
