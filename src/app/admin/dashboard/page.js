'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    announcements: 0,
    messages: 0,
    users: 0,
    categories: 0,
    coupons: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [prodRes, annRes, msgRes, userRes, catRes, coupRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/announcements?all=true'),
          fetch('/api/messages'),
          fetch('/api/admin/users').catch(() => null),
          fetch('/api/admin/categories').catch(() => null),
          fetch('/api/admin/coupons').catch(() => null)
        ]);

        const prods = await prodRes.json();
        const anns = await annRes.json();
        const msgs = await msgRes.json();
        
        let userCount = 0;
        let catCount = 0;
        let coupCount = 0;

        if (userRes && userRes.ok) {
          const users = await userRes.json();
          userCount = Array.isArray(users) ? users.length : 0;
        }
        if (catRes && catRes.ok) {
          const cats = await catRes.json();
          catCount = cats.stats?.totalCategories || 0;
        }
        if (coupRes && coupRes.ok) {
          const coups = await coupRes.json();
          coupCount = Array.isArray(coups) ? coups.length : 0;
        }

        setStats({
          products: Array.isArray(prods) ? prods.length : 0,
          announcements: Array.isArray(anns) ? anns.length : 0,
          messages: Array.isArray(msgs) ? msgs.length : 0,
          users: userCount,
          categories: catCount,
          coupons: coupCount
        });

        setRecentMessages(Array.isArray(msgs) ? msgs.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Premium Colorful KPI Themes
  const statCards = [
    { 
      title: 'Öğrenciler', 
      value: stats.users, 
      icon: 'bi-people-fill', 
      link: '/admin/users',
      bgColor: 'rgba(37, 99, 235, 0.04)', // soft blue
      textColor: '#1e40af',
      borderColor: 'rgba(37, 99, 235, 0.15)',
      hoverBorderColor: '#2563eb',
      iconColor: '#3b82f6',
      shadowColor: 'rgba(37, 99, 235, 0.08)'
    },
    { 
      title: 'Kategoriler', 
      value: stats.categories, 
      icon: 'bi-folder-symlink-fill', 
      link: '/admin/categories',
      bgColor: 'rgba(16, 185, 129, 0.04)', // soft emerald
      textColor: '#065f46',
      borderColor: 'rgba(16, 185, 129, 0.15)',
      hoverBorderColor: '#10b981',
      iconColor: '#10b981',
      shadowColor: 'rgba(16, 185, 129, 0.08)'
    },
    { 
      title: 'Ürünler', 
      value: stats.products, 
      icon: 'bi-grid-3x3-gap-fill', 
      link: '/admin/products',
      bgColor: 'rgba(139, 92, 246, 0.04)', // soft purple
      textColor: '#5b21b6',
      borderColor: 'rgba(139, 92, 246, 0.15)',
      hoverBorderColor: '#8b5cf6',
      iconColor: '#8b5cf6',
      shadowColor: 'rgba(139, 92, 246, 0.08)'
    },
    { 
      title: 'Kuponlar', 
      value: stats.coupons, 
      icon: 'bi-ticket-perforated-fill', 
      link: '/admin/coupons',
      bgColor: 'rgba(245, 158, 11, 0.04)', // soft amber
      textColor: '#92400e',
      borderColor: 'rgba(245, 158, 11, 0.15)',
      hoverBorderColor: '#f59e0b',
      iconColor: '#f59e0b',
      shadowColor: 'rgba(245, 158, 11, 0.08)'
    },
    { 
      title: 'Duyurular', 
      value: stats.announcements, 
      icon: 'bi-megaphone-fill', 
      link: '/admin/announcements',
      bgColor: 'rgba(239, 68, 68, 0.04)', // soft red
      textColor: '#991b1b',
      borderColor: 'rgba(239, 68, 68, 0.15)',
      hoverBorderColor: '#ef4444',
      iconColor: '#ef4444',
      shadowColor: 'rgba(239, 68, 68, 0.08)'
    },
    { 
      title: 'Mesajlar', 
      value: stats.messages, 
      icon: 'bi-envelope-fill', 
      link: '/admin/settings',
      bgColor: 'rgba(6, 182, 212, 0.04)', // soft cyan
      textColor: '#075985',
      borderColor: 'rgba(6, 182, 212, 0.15)',
      hoverBorderColor: '#06b6d4',
      iconColor: '#06b6d4',
      shadowColor: 'rgba(6, 182, 212, 0.08)'
    },
  ];

  return (
    <div className="fade-in text-dark">
      <div className="mb-5">
        <h2 className="fw-bold mb-1 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>Kontrol Paneli Özet</h2>
        <span className="text-secondary small">Atanıyorum Hocam genel durum raporu ve modüller</span>
      </div>

      {/* Grid of Stats - Unified Borderless Premium Status Bar */}
      <div 
        className="bg-white border p-4 mb-5 shadow-sm" 
        style={{ borderRadius: '16px', borderColor: '#e2e8f0' }}
      >
        <div className="row g-4 align-items-center">
          {statCards.map((card, index) => (
            <div 
              key={index}
              className="col-lg-2 col-md-4 col-6 cursor-pointer"
              style={{
                transition: 'all 0.2s ease',
                borderRight: index < statCards.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
              onClick={() => router.push(card.link)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="px-2">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span 
                    className="rounded-circle" 
                    style={{ width: '8px', height: '8px', backgroundColor: card.iconColor }}
                  ></span>
                  <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.6px', opacity: 0.8 }}>
                    {card.title}
                  </span>
                </div>
                <h3 className="mb-0 fw-bold text-dark fs-2 mt-1" style={{ fontFamily: 'var(--font-display)', fontWeight: '800' }}>
                  {card.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Recent Messages Card */}
        <div className="col-lg-8">
          <div 
            className="card p-4 h-100 bg-white" 
            style={{ 
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
            }}
          >
            <h5 className="fw-bold mb-4 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>Son Gelen İletişim Mesajları</h5>
            {recentMessages.length === 0 ? (
              <div className="text-center py-5 text-secondary" style={{ opacity: 0.7 }}>
                <i className="bi bi-envelope-open fs-2 text-muted"></i>
                <p className="mt-2 small">Henüz mesaj bulunmuyor.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-4 d-flex align-items-start gap-3 transition-all" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div 
                      className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        flexShrink: 0, 
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {msg.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-semibold text-dark text-truncate small">{msg.name} {msg.surname}</h6>
                        <span className="text-secondary" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{new Date(msg.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <span className="text-secondary d-block mb-2" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{msg.email} | {msg.phone}</span>
                      <p className="text-dark small mb-0 leading-relaxed" style={{ opacity: 0.9 }}>{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-lg-4">
          <div 
            className="card p-4 h-100 bg-white" 
            style={{ 
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
            }}
          >
            <h5 className="fw-bold mb-4 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>Hızlı İşlemler</h5>
            <div className="d-flex flex-column gap-3">
              <Link 
                href="/admin/products?action=new" 
                className="text-decoration-none text-dark p-3.5 d-flex align-items-center justify-content-between rounded-4 transition-all" 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37, 99, 235, 0.04)'; e.currentTarget.style.borderColor = '#2563eb'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-plus-lg fs-5"></i>
                  </div>
                  <span className="fw-semibold small">Yeni Ürün Ekle</span>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </Link>

              <Link 
                href="/admin/announcements" 
                className="text-decoration-none text-dark p-3.5 d-flex align-items-center justify-content-between rounded-4 transition-all" 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)'; e.currentTarget.style.borderColor = '#10b981'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-megaphone fs-5"></i>
                  </div>
                  <span className="fw-semibold small">Yeni Duyuru Yayınla</span>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </Link>

              <Link 
                href="/admin/settings" 
                className="text-decoration-none text-dark p-3.5 d-flex align-items-center justify-content-between rounded-4 transition-all" 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.04)'; e.currentTarget.style.borderColor = '#f59e0b'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning-subtle text-warning rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-calendar-event fs-5"></i>
                  </div>
                  <span className="fw-semibold small">Sayaç Süresini Güncelle</span>
                </div>
                <i className="bi bi-chevron-right small text-muted"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
