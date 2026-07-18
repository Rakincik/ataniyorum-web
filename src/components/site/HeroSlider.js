'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
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
        console.error('Failed to load settings in HeroSlider', err);
        setLoading(false);
      });
  }, []);

  const slides = [
    {
      title: '2026 Edebiyat ÖABT Canlı Dersleri Başlıyor!',
      subtitle: 'Türker Hoca koordinatörlüğünde sınav hazırlık maratonuna başlayın.',
      badge: 'YENİ SEZON',
      buttonText: 'Kayıt Ol & Yerini Ayır',
      buttonLink: '/#products-grid',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    },
    {
      title: 'Cumhuriyetimizin 102. Yılına Özel Büyük Kampanya!',
      subtitle: 'Tüm Canlı ve Video Ders Paketlerinde %50 İndirim Seçenekleri.',
      badge: 'SINIRLI SÜRE',
      buttonText: 'Kampanyalı Paketleri İncele',
      buttonLink: '/#products-grid',
      bgGradient: 'linear-gradient(135deg, #581c87 0%, #311042 100%)',
    },
    {
      title: 'MEB-AGS Hazırlık Akademisi Yayında!',
      subtitle: 'Milli Eğitim Bakanlığı Akademi Giriş Sınavı için en kapsamlı hazırlık seti.',
      badge: 'YENİ MÜFREDAT',
      buttonText: 'Hemen Başvur',
      buttonLink: '/ucretsiz-icerik',
      bgGradient: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
    }
  ];

  useEffect(() => {
    if (loading || !settings || settings.sliderActive === false) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, loading, settings]);

  if (loading) return null;
  if (settings && settings.sliderActive === false) return null;

  return (
    <div className={`${styles.slider} mb-4 shadow-sm overflow-hidden`}>
      {slides.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={idx}
            className={`${styles.slide} ${isActive ? styles.active : ''}`}
            style={{ background: slide.bgGradient }}
          >
            <div className={`${styles.slideContent} d-flex flex-column justify-content-center h-100 px-5`}>
              <div>
                <span className={`${styles.badge} mb-2.5 d-inline-block`}>{slide.badge}</span>
              </div>
              <h2 className={`${styles.title} text-white mb-2`}>{slide.title}</h2>
              <p className={`${styles.subtitle} text-light mb-4`}>{slide.subtitle}</p>
              <div>
                <Link
                  href={slide.buttonLink}
                  className="btn btn-warning px-4 py-2.5 fw-bold text-dark"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    borderColor: 'var(--accent-color)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                  }}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Indicators */}
      <div className={styles.indicators}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`${styles.indicatorDot} ${idx === currentSlide ? styles.activeDot : ''}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
