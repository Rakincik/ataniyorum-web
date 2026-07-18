import React from 'react';
import styles from './Skeleton.module.css';

export function ProductSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.image} ${styles.shimmer}`}></div>
      <div className="p-3">
        <div className={`${styles.category} ${styles.shimmer} mb-2`}></div>
        <div className={`${styles.title} ${styles.shimmer} mb-3`}></div>
        <div className={`${styles.price} ${styles.shimmer} mb-3`}></div>
        <div className={`${styles.button} ${styles.shimmer}`}></div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 6 }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col">
          <ProductSkeleton />
        </div>
      ))}
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className={`${styles.announcement} d-flex align-items-center gap-4 p-3 mb-3`}>
      <div className={`${styles.dateBadge} ${styles.shimmer}`}></div>
      <div className="flex-grow-1">
        <div className={`${styles.title} ${styles.shimmer} mb-2`}></div>
        <div className={`${styles.text} ${styles.shimmer}`}></div>
      </div>
    </div>
  );
}

export function AnnouncementSkeletonList({ count = 4 }) {
  return (
    <div className="row g-4 justify-content-center">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-6">
          <AnnouncementSkeleton />
        </div>
      ))}
    </div>
  );
}
