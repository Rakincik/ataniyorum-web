'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './SidebarMenu.module.css';

export default function SidebarMenu({ activeCategory, activeSubCategory, onFilterChange }) {
  const [oabtExpanded, setOabtExpanded] = useState(true);

  const handleCategoryClick = (cat) => {
    if (cat === 'ÖABT Paketlerimiz') {
      setOabtExpanded(!oabtExpanded);
    }
    onFilterChange(cat, null);
  };

  const handleSubCategoryClick = (cat, subCat, e) => {
    e.stopPropagation();
    onFilterChange(cat, subCat);
  };

  return (
    <div className={styles.sidebar}>
      <h5 className="mb-3 px-3 fs-5 text-dark fw-bold">Menü</h5>
      
      <div className={styles.menuList}>
        {/* 1. Ürünler (All products) */}
        <div
          className={`${styles.menuItem} ${!activeCategory ? styles.active : ''}`}
          onClick={() => onFilterChange(null, null)}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-grid-fill"></i>
            <span>Ürünler</span>
          </div>
        </div>

        {/* 2. ÖABT Paketlerimiz (Expandable Category) */}
        <div className={styles.categoryGroup}>
          <div
            className={`${styles.menuItem} ${activeCategory === 'ÖABT Paketlerimiz' ? styles.active : ''} d-flex justify-content-between align-items-center`}
            onClick={() => handleCategoryClick('ÖABT Paketlerimiz')}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-journal-bookmark-fill"></i>
              <span>ÖABT Paketlerimiz</span>
            </div>
            <i className={`bi bi-chevron-${oabtExpanded ? 'down' : 'right'} ${styles.expandIcon}`}></i>
          </div>

          {/* Subcategories (Visible when expanded) */}
          {oabtExpanded && (
            <div className={styles.subMenuList}>
              <div
                className={`${styles.subMenuItem} ${activeCategory === 'ÖABT Paketlerimiz' && activeSubCategory === 'Canlı Ders' ? styles.subActive : ''}`}
                onClick={(e) => handleSubCategoryClick('ÖABT Paketlerimiz', 'Canlı Ders', e)}
              >
                <span>Canlı Ders</span>
              </div>
              <div
                className={`${styles.subMenuItem} ${activeCategory === 'ÖABT Paketlerimiz' && activeSubCategory === 'Video Ders' ? styles.subActive : ''}`}
                onClick={(e) => handleSubCategoryClick('ÖABT Paketlerimiz', 'Video Ders', e)}
              >
                <span>Video Ders</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Yayınlarımız */}
        <div
          className={`${styles.menuItem} ${activeCategory === 'Yayınlarımız' ? styles.active : ''}`}
          onClick={() => onFilterChange('Yayınlarımız', null)}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-book-fill"></i>
            <span>Yayınlarımız</span>
          </div>
        </div>

        {/* Separator line */}
        <hr className="my-3 mx-3" style={{ borderColor: 'var(--border-color)' }} />

        {/* 4. Static Page Links */}
        <Link href="/dersler" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-play-btn-fill"></i>
            <span>Örnek Dersler</span>
          </div>
        </Link>

        <Link href="/kadro" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-people-fill"></i>
            <span>Kadro</span>
          </div>
        </Link>

        <Link href="/iletisim" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-envelope-fill"></i>
            <span>İletişim</span>
          </div>
        </Link>

        <Link href="/sss" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-question-circle-fill"></i>
            <span>S.S.S</span>
          </div>
        </Link>

        <Link href="/blog" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-newspaper"></i>
            <span>Blog</span>
          </div>
        </Link>

        <Link href="/paketalim" className={styles.navLink}>
          <div className={`${styles.menuItem} d-flex align-items-center gap-2`}>
            <i className="bi bi-info-circle-fill"></i>
            <span>Paket Alım Bilgilendirmesi</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
