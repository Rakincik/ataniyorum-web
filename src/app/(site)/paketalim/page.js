'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PaketAlimPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-6 fw-bold text-dark mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>Paket Satın Alımı</h1>
        <span className="text-secondary small">Eğitim paketi satın alma ve indirim kuponu uygulama rehber videoları</span>
      </div>

      {/* Guide Videos Grid Section */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {/* Purchase Video Player */}
          <div className="col-md-6">
            <div className="card p-4 h-100 bg-white shadow-sm border rounded-4">
              <h5 className="fw-bold mb-3 text-dark text-center" style={{ fontFamily: 'var(--font-display)' }}>Üyelik ve Satın Alma Adımları</h5>
              {settings?.purchaseVideoUrl ? (
                <div className="ratio ratio-16x9 rounded-3 overflow-hidden border">
                  <video 
                    src={settings.purchaseVideoUrl} 
                    controls 
                    className="w-100 h-100"
                    style={{ background: '#000' }}
                  />
                </div>
              ) : (
                <div className="bg-light rounded-3 d-flex flex-column align-items-center justify-content-center py-5 text-muted small" style={{ minHeight: '260px' }}>
                  <i className="bi bi-play-btn-fill display-4 mb-3 text-secondary"></i>
                  <span>Rehber video henüz eklenmedi.</span>
                </div>
              )}
            </div>
          </div>

          {/* Coupon Video Player */}
          <div className="col-md-6">
            <div className="card p-4 h-100 bg-white shadow-sm border rounded-4">
              <h5 className="fw-bold mb-3 text-dark text-center" style={{ fontFamily: 'var(--font-display)' }}>İndirim Kodu Nasıl Uygulanır?</h5>
              {settings?.couponVideoUrl ? (
                <div className="ratio ratio-16x9 rounded-3 overflow-hidden border">
                  <video 
                    src={settings.couponVideoUrl} 
                    controls 
                    className="w-100 h-100"
                    style={{ background: '#000' }}
                  />
                </div>
              ) : (
                <div className="bg-light rounded-3 d-flex flex-column align-items-center justify-content-center py-5 text-muted small" style={{ minHeight: '260px' }}>
                  <i className="bi bi-play-btn-fill display-4 mb-3 text-secondary"></i>
                  <span>Rehber video henüz eklenmedi.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step by Step Text Guide Section */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="bg-white p-5 border rounded-4 shadow-sm">
            <h2 className="fs-4 fw-bold text-primary mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>Paket Alım Bilgilendirmesi</h2>
            
            <div className="d-flex flex-column gap-4">
              <section>
                <h4 className="fs-5 fw-bold text-dark border-bottom pb-2 mb-3">1. Paket Seçimi & Sepete Ekleme</h4>
                <p className="text-muted small">
                  Ana sayfamızda bulunan eğitim paketlerinden size en uygun olanını (Canlı Ders, Video Ders veya Yayınlarımız) seçerek <strong>SEPETE EKLE</strong> butonu ile sepetinize ekleyin. Sağ üstteki sepet simgesine tıklayarak sepetinizi görebilirsiniz.
                </p>
              </section>

              <section>
                <h4 className="fs-5 fw-bold text-dark border-bottom pb-2 mb-3">2. Fatura ve İletişim Bilgileri</h4>
                <p className="text-muted small">
                  Sepetinizde <strong>Güvenli Satın Al</strong> butonuna tıkladıktan sonra açılan checkout sayfasında Ad, Soyad, E-posta ve Telefon numarası bilgilerinizi doğru ve eksiksiz bir şekilde doldurun. Sistemimiz, ödeme sonrasında eğitim ders panelinize bu bilgiler doğrultusunda erişim yetkisi tanımlar.
                </p>
              </section>

              <section>
                <h4 className="fs-5 fw-bold text-dark border-bottom pb-2 mb-3">3. Sanal POS Güvenli Ödeme</h4>
                <p className="text-muted small">
                  Ödeme ekranında kredi kartı veya banka kartı bilgilerinizi girerek 3D Secure onay kodunuzla ödemeyi tamamlayabilirsiniz. Ödemeleriniz BDDK onaylı güvenli ödeme altyapısı ile şifrelenmiş olarak gerçekleştirilir. Kartınıza peşin fiyatına taksit imkanlarından faydalanabilirsiniz.
                </p>
              </section>

              <section>
                <h4 className="fs-5 fw-bold text-dark border-bottom pb-2 mb-3">4. Eğitim Paneline Erişim</h4>
                <p className="text-muted small">
                  Ödemeniz onaylandığı anda, belirttiğiniz e-posta adresi ile ders panelimiz (`https://ataniyorumhocam.okinar.com`) üzerinde üyeliğiniz otomatik olarak oluşturulur. Sistem tarafından e-postanıza gönderilecek şifre ile sisteme hemen giriş yapıp eğitim içeriklerinize, canlı ders takvimine ve dökümanlara erişebilirsiniz.
                </p>
              </section>
            </div>

            <div className="text-center mt-5">
              <Link href="/" className="btn btn-primary px-5 py-2.5 fw-bold" style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}>
                Eğitim Paketlerini İncele
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
