'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  const discountedPrice = product.price * (1 - product.discountRate / 100);

  return (
    <div className={`${styles.card} h-100 d-flex flex-column`}>
      {/* Image container */}
      <Link href={`/urun/${product.id}`} className="w-100 text-decoration-none">
        <div className={styles.imageContainer}>
          {product.discountRate > 0 && (
            <span className={styles.discountBadge}>%{product.discountRate}</span>
          )}
          <img
            src={product.imageUrl || '/images/placeholder.jpg'}
            alt={product.title}
            className={styles.image}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300';
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className={`${styles.body} p-3 d-flex flex-column flex-grow-1`}>
        <span className={styles.categoryLabel}>{product.category?.name || ''}</span>
        <Link href={`/urun/${product.id}`} className="text-decoration-none text-dark">
          <h5 className={`${styles.title} mt-1 mb-3`}>{product.title}</h5>
        </Link>

        {/* Pricing & Add Button */}
        <div className="mt-auto pt-2">
          <div className="d-flex align-items-baseline gap-2 mb-3">
            {product.discountRate > 0 ? (
              <>
                <span className={styles.oldPrice}>₺{product.price.toLocaleString('tr-TR')}</span>
                <span className={styles.newPrice}>₺{discountedPrice.toLocaleString('tr-TR')}</span>
              </>
            ) : (
              <span className={styles.newPrice}>₺{product.price.toLocaleString('tr-TR')}</span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="btn btn-outline-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            style={{
              borderColor: 'var(--primary-color)',
              color: 'var(--primary-color)',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--primary-color)';
            }}
          >
            <i className="bi bi-cart-plus"></i>
            SEPETE EKLE
          </button>
        </div>
      </div>
    </div>
  );
}
