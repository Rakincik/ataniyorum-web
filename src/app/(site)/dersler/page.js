import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Örnek Dersler - Atanıyorum Hocam',
};

export default function DerslerPage() {
  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center py-5">
          <div className="bg-white p-5 border rounded-4 shadow-sm">
            <i className="bi bi-play-circle-fill text-danger d-block mb-4" style={{ fontSize: '4.5rem' }}></i>
            <h1 className="display-6 fw-bold text-primary mb-3">Örnek Derslerimiz</h1>
            <p className="lead text-muted mb-4">
              Türker Hoca\'nın Eski Türk Dili, Yeni Türk Edebiyatı ve Halk Edebiyatı alanlarında hazırladığı örnek ders videoları çok yakında burada listelenecektir!
            </p>
            <p className="text-muted small mb-4">
              Derslerimize hemen göz atmak isterseniz ana sayfadaki <strong>Ücretsiz İçerik</strong> butonunu kullanarak hediye video arşivimize anında erişim sağlayabilirsiniz.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link href="/ucretsiz-icerik" className="btn btn-warning fw-bold text-dark px-4 py-2.5" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', borderRadius: '6px' }}>
                Ücretsiz İçerik Al
              </Link>
              <Link href="/" className="btn btn-outline-secondary px-4 py-2.5" style={{ borderRadius: '6px' }}>
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
