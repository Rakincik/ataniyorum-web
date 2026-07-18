'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show admin sidebar/header on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Özet (Dashboard)', icon: 'bi-speedometer2', color: '#3b82f6' },
    { href: '/admin/users', label: 'Kullanıcı Yönetimi', icon: 'bi-people-fill', color: '#10b981' },
    { href: '/admin/categories', label: 'Kategori Yönetimi', icon: 'bi-folder-symlink-fill', color: '#8b5cf6' },
    { href: '/admin/products', label: 'Ürün Yönetimi', icon: 'bi-grid-3x3-gap-fill', color: '#ec4899' },
    { href: '/admin/coupons', label: 'İndirim Kuponları', icon: 'bi-ticket-perforated-fill', color: '#f59e0b' },
    { href: '/admin/announcements', label: 'Duyuru Yönetimi', icon: 'bi-megaphone-fill', color: '#ef4444' },
    { href: '/admin/settings', label: 'Ayarlar & Mesajlar', icon: 'bi-gear-fill', color: '#06b6d4' },
  ];

  return (
    <div className={`${styles.container}`}>
      {/* Modernized Light Sidebar */}
      <aside className={`${styles.sidebar} d-flex flex-column p-4`}>
        <div className="d-flex align-items-center justify-content-center mb-5 px-1 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Link href="/admin/dashboard" className="text-decoration-none d-flex justify-content-center w-100">
            <img src="/logo.png" alt="Atanıyorum Hocam" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link d-flex align-items-center gap-3 px-3.5 py-3 rounded-3 transition-all ${
                  isActive ? styles.activeLink : styles.navLink
                }`}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '500',
                }}
              >
                <i className={`bi ${link.icon}`} style={{ fontSize: '1.15rem', color: isActive ? 'inherit' : link.color, transition: 'color 0.2s ease' }}></i>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-top pt-4 d-flex flex-column gap-2" style={{ borderColor: '#e2e8f0' }}>
          <Link
            href="/"
            className="nav-link d-flex align-items-center gap-3 px-3.5 py-2.5 rounded-3 text-secondary"
            style={{ fontSize: '0.85rem', transition: 'all 0.2s ease', opacity: 0.8 }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--bs-secondary)'}
          >
            <i className="bi bi-globe"></i>
            <span>Siteyi Görüntüle</span>
          </Link>
          <button
            onClick={handleLogout}
            className="nav-link text-danger d-flex align-items-center gap-3 px-3.5 py-2.5 rounded-3 text-start border-0 bg-transparent"
            style={{ fontSize: '0.85rem', transition: 'all 0.2s ease', opacity: 0.8 }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-x-hidden" style={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <header className="navbar px-5 py-3 d-flex justify-content-between align-items-center" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h1 className="fs-5 mb-0 fw-bold text-dark" style={{ fontFamily: 'var(--font-display)' }}>Yönetim Paneli</h1>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
              T
            </div>
            <div>
              <span className="fw-semibold text-dark small d-block">Türker Hoca</span>
              <span className="text-secondary small d-block" style={{ fontSize: '0.7rem', marginTop: '-2px', opacity: 0.8 }}>Sistem Yöneticisi</span>
            </div>
          </div>
        </header>

        {/* Content wrapper */}
        <main className="p-5 flex-grow-1">
          {children}
        </main>
      </div>
    </div>
  );
}
