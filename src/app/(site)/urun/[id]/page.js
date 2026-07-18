'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './UrunDetay.module.css';

export default function UrunDetayPage({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Unwrap params for Next.js 16 compatibility
  useEffect(() => {
    params.then((p) => setUnwrappedParams(p));
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams) return;
    
    fetch(`/api/products/${unwrappedParams.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ürün bulunamadı.');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [unwrappedParams]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center fade-in">
        <i className="bi bi-exclamation-octagon text-danger display-1 mb-3"></i>
        <h3>Aradığınız Ürün Bulunamadı</h3>
        <p className="text-muted small">Ürün silinmiş veya adresi hatalı olabilir.</p>
        <Link href="/" className="btn btn-primary mt-3" style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discountRate / 100);

  return (
    <div className="container py-5 fade-in">
      {/* Back button */}
      <Link href="/" className="btn btn-sm btn-outline-secondary mb-4 gap-1 d-inline-flex align-items-center" style={{ borderRadius: '6px' }}>
        <i className="bi bi-arrow-left"></i> Ürün Listesine Dön
      </Link>

      <div className="row g-5">
        {/* Left: Product Image */}
        <div className="col-md-6 text-center">
          <div className={styles.imageCard}>
            {product.discountRate > 0 && (
              <span className={styles.discountBadge}>%{product.discountRate} İNDİRİM</span>
            )}
            <img
              src={product.imageUrl}
              alt={product.title}
              className={styles.productImg}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
              }}
            />
          </div>
        </div>

        {/* Right: Info & Pricing */}
        <div className="col-md-6 d-flex flex-column justify-content-between">
          <div>
            {/* Category Breadcrumbs */}
            {(() => {
              const parentName = product.category?.parent ? product.category.parent.name : product.category?.name || '';
              const subName = product.category?.parent ? product.category.name : '';
              return (
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-2">
                    <li className="breadcrumb-item"><Link href="/" className="small text-muted text-decoration-none">Anasayfa</Link></li>
                    {parentName && (
                      <li className="breadcrumb-item">
                        <Link href={`/?category=${encodeURIComponent(parentName)}`} className="small text-muted text-decoration-none">
                          {parentName}
                        </Link>
                      </li>
                    )}
                    {subName && (
                      <li className="breadcrumb-item active small text-primary" aria-current="page">
                        {subName}
                      </li>
                    )}
                  </ol>
                </nav>
              );
            })()}

            {/* Dynamic Badges */}
            {product.badges && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {product.badges.split(',').map((badge, idx) => (
                  <span key={idx} className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1.5 small" style={{ border: '1px solid rgba(37, 99, 235, 0.1)', fontSize: '0.75rem' }}>
                    {badge.trim()}
                  </span>
                ))}
              </div>
            )}

            <h1 className="display-6 fw-bold text-dark mb-3">{product.title}</h1>
            
            {/* Instructor Name & Review details wrapper */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              {product.instructorName && (
                <span className="badge bg-secondary-subtle text-secondary px-3 py-1.5 rounded-pill small" style={{ fontSize: '0.8rem' }}>
                  <i className="bi bi-person-fill me-1"></i> Eğitmen: {product.instructorName}
                </span>
              )}
              <div className="d-flex align-items-center gap-2">
                <div className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                </div>
                <span className="text-muted small fw-semibold">(128+ Değerlendirme)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className={`${styles.priceBox} p-3 rounded-3 mb-4`}>
              <span className="text-muted small d-block mb-1">Paket Satış Fiyatı:</span>
              <div className="d-flex align-items-baseline gap-3">
                {product.discountRate > 0 ? (
                  <>
                    <span className={styles.oldPrice}>₺{product.price.toLocaleString('tr-TR')}</span>
                    <span className={styles.newPrice}>₺{discountedPrice.toLocaleString('tr-TR')}</span>
                  </>
                ) : (
                  <span className={styles.newPrice}>₺{product.price.toLocaleString('tr-TR')}</span>
                )}
              </div>
            </div>

            {/* Features list */}
            <ul className="list-unstyled d-flex flex-column gap-2.5 my-4 text-muted small">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success"></i>
                <span>Sınav tarihine kadar sınırsız video kaydı tekrarı</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success"></i>
                <span>İndirilebilir PDF ders notları ve kaynak dökümanlar</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success"></i>
                <span>Türker Hoca ile soru-cevap ve özel rehberlik grupları</span>
              </li>
            </ul>
          </div>

          {/* Add to Cart button */}
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              className={`btn btn-primary w-100 py-3 fw-bold fs-5 d-flex align-items-center justify-content-center gap-2 transition ${added ? 'btn-success' : ''}`}
              style={added ? {} : { backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}
            >
              {added ? (
                <>
                  <i className="bi bi-check-lg fs-4"></i>
                  SEPETE EKLENDİ!
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus fs-4"></i>
                  SEPETE EKLE
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Description / Content Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="bg-white p-4 border rounded-4 shadow-sm">
            <h4 className="fs-5 fw-bold text-dark border-bottom pb-2 mb-3">Paket Hakkında Detaylı Bilgi</h4>
            <div
              className="rich-text text-dark"
              dangerouslySetInnerHTML={{ __html: product.description || '<p>Bu ürün için detaylı açıklama bulunmuyor.</p>' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
