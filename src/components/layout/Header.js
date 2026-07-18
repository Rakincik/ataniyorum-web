'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { cartCount, cart, removeFromCart, cartTotal, isCartOpen, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Fetch settings for countdown and check admin session
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load settings', err));

    fetch('/api/auth')
      .then((res) => {
        if (res.ok) setIsAdminLoggedIn(true);
      })
      .catch(() => setIsAdminLoggedIn(false));
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!settings || !settings.countdownDate) return;

    const targetDate = new Date(settings.countdownDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={styles.header}>
      {/* 1. Countdown Top Bar */}
      {settings && settings.countdownActive !== false && (
        <div className={styles.topCountdown}>
          <div className="container d-flex flex-wrap justify-content-center align-items-center gap-3 py-2 text-white font-weight-bold">
            <span className={styles.countdownTitle}>{settings.countdownTitle || 'ÖABT SINAVI'} SÜRESİ:</span>
            <div className={styles.timerGrid}>
              <div className={styles.timerItem}>
                <span className={styles.timerNumber}>{timeLeft.days}</span>
                <span className={styles.timerLabel}>Gün</span>
              </div>
              <div className={styles.timerItem}>
                <span className={styles.timerNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={styles.timerLabel}>Saat</span>
              </div>
              <div className={styles.timerItem}>
                <span className={styles.timerNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={styles.timerLabel}>Dakika</span>
              </div>
              <div className={styles.timerItem}>
                <span className={styles.timerNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className={styles.timerLabel}>Saniye</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Navbar */}
      <nav className={`${styles.navbar} py-3 shadow-sm`}>
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-3">
          
          {/* Brand Logo */}
          <Link href="/" className="d-flex align-items-center text-decoration-none">
            <img src="/logo.png" alt="Atanıyorum Hocam" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ne Aramıştınız?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-3">
            <a
              href="https://ataniyorumhocam.okinar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-danger font-weight-bold"
              style={{ backgroundColor: '#dc3545', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '600' }}
            >
              Ders Paneline Giriş
            </a>

            {/* Profile icon */}
            <Link href={isAdminLoggedIn ? "/admin/dashboard" : "/giris"} className={styles.iconBtn} title={isAdminLoggedIn ? "Yönetici Paneli" : "Giriş Yap / Üye Ol"}>
              <i className={isAdminLoggedIn ? "bi bi-shield-lock-fill" : "bi bi-person"}></i>
            </Link>

            {/* Theme Toggle icon */}
            <button
              onClick={() => {
                toggleTheme();
                showToast(theme === 'light' ? 'Karanlık tema aktif edildi!' : 'Aydınlık tema aktif edildi!', 'info');
              }}
              className={styles.iconBtn}
              title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
            >
              <i className={theme === 'light' ? 'bi bi-moon' : 'bi bi-sun'}></i>
            </button>

            {/* Cart icon */}
            <button className={`${styles.iconBtn} ${styles.cartBtn}`} onClick={() => setCartOpen(!isCartOpen)}>
              <i className="bi bi-cart"></i>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Modern Sidebar Cart Drawer */}
      {isCartOpen && (
        <>
          <div className={styles.cartOverlay} onClick={() => setCartOpen(false)}></div>
          <div className={`${styles.cartDrawer} p-4 d-flex flex-column`}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="mb-0">Sepetiniz ({cartCount})</h4>
              <button className="btn-close" onClick={() => setCartOpen(false)}></button>
            </div>

            <div className={`${styles.cartItems} flex-grow-1 overflow-y-auto mb-3`}>
              {cart.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cart-x fs-1 d-block mb-3"></i>
                  <span>Sepetiniz henüz boş.</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="d-flex gap-3 pb-3 mb-3 border-bottom align-items-center">
                    <img src={item.imageUrl} alt={item.title} className={styles.cartItemImg} />
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fs-6">{item.title}</h6>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-success fw-bold">
                          ₺{(item.price * (1 - item.discountRate / 100)).toLocaleString('tr-TR')}
                        </span>
                        <button
                          className="btn btn-sm text-danger p-0 border-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Toplam Tutar:</span>
                  <span className="fs-4 fw-bold text-primary">₺{cartTotal.toLocaleString('tr-TR')}</span>
                </div>
                <Link
                  href="/checkout"
                  className="btn btn-primary w-100 py-2.5 fw-bold"
                  onClick={() => setCartOpen(false)}
                  style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}
                >
                  Güvenli Satın Al
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
