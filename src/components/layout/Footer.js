import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Trust Badges */}
      <div className={styles.trustBadges}>
        <div className="container d-flex flex-wrap justify-content-center gap-5 py-4 text-center">
          <div className="d-flex flex-column align-items-center gap-1">
            <i className="bi bi-shield-check fs-2 text-primary"></i>
            <span className="fw-semibold">256 Bit SSL</span>
            <span className="text-muted small">ile güvende alışveriş</span>
          </div>
          <div className="d-flex flex-column align-items-center gap-1">
            <i className="bi bi-truck fs-2 text-primary"></i>
            <span className="fw-semibold">Ücretsiz Kargo</span>
            <span className="text-muted small">1000 TL üzeri kitap siparişlerinde</span>
          </div>
          <div className="d-flex flex-column align-items-center gap-1">
            <i className="bi bi-arrow-counterclockwise fs-2 text-primary"></i>
            <span className="fw-semibold">7 Gün İade</span>
            <span className="text-muted small">Koşulsuz iade hakkı</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-dark small tracking-wider">Kategoriler</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/" className={styles.link}>Anasayfa</Link></li>
              <li><Link href="/?category=ÖABT Paketlerimiz" className={styles.link}>ÖABT Paketlerimiz</Link></li>
              <li><Link href="/?category=Yayınlarımız" className={styles.link}>Yayınlarımız</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-dark small tracking-wider">Hesabım</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/giris" className={styles.link}>Giriş Yap</Link></li>
              <li><Link href="/uye-ol" className={styles.link}>Kayıt Ol</Link></li>
              <li><Link href="/admin/login" className={styles.link}>Yönetici Girişi</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-dark small tracking-wider">Hakkımızda</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/kadro" className={styles.link}>Kadro</Link></li>
              <li><Link href="/iletisim" className={styles.link}>İletişim</Link></li>
              <li><Link href="/sss" className={styles.link}>S.S.S</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-dark small tracking-wider">Sözleşmeler</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link href="/mesafeli-satis-sozlesmesi" className={styles.link}>Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/gizlilik-politikasi" className={styles.link}>Gizlilik Politikası</Link></li>
              <li><Link href="/teslimat-iade" className={styles.link}>İade Politikası</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center">
          <div>
            <p className="mb-0 text-muted small">&copy; {new Date().getFullYear()} Atanıyorum Hocam. Tüm Hakları Saklıdır.</p>
          </div>

          {/* Social Icons & Payments */}
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex gap-3">
              <a href="https://www.instagram.com/turkerhocaedb" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://wa.me/905000000000" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>

            <div className={styles.payments}>
              {/* Simple stylized text representing card payments */}
              <span className="text-muted small border rounded px-2 py-1 bg-white me-1 fw-semibold">Visa</span>
              <span className="text-muted small border rounded px-2 py-1 bg-white me-1 fw-semibold">MasterCard</span>
              <span className="text-muted small border rounded px-2 py-1 bg-white fw-semibold">Troy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
