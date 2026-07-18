'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementSkeletonList } from '@/components/common/Skeleton';
import styles from './AnnouncementsList.module.css';

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    fetch('/api/announcements?limit=4')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load announcements', err);
        setLoading(false);
      });
  }, []);

  const getMonthAbbr = (dateString) => {
    const date = new Date(dateString);
    const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
    return months[date.getMonth()];
  };

  const getDay = (dateString) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  if (loading) {
    return <AnnouncementSkeletonList count={4} />;
  }

  return (
    <div className="py-5">
      <h2 className="text-center text-uppercase mb-5" style={{ fontSize: '2rem', letterSpacing: '1px' }}>Duyurular</h2>
      
      <div className="row g-4 justify-content-center">
        {announcements.length === 0 ? (
          <div className="col-12 text-center text-muted">Henüz duyuru eklenmemiş.</div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="col-md-6">
              <div
                className={`${styles.item} d-flex align-items-center gap-4 p-3 bg-white`}
                onClick={() => setSelectedAnn(ann)}
              >
                {/* Date Badge */}
                <div className={styles.dateBadge}>
                  <span className={styles.day}>{getDay(ann.date)}</span>
                  <span className={styles.month}>{getMonthAbbr(ann.date)}</span>
                </div>

                {/* Content info */}
                <div className="flex-grow-1">
                  <h5 className={`${styles.title} mb-0`}>{ann.title}</h5>
                  <span className="text-muted small">Detayları görmek için tıklayın</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Announcement Modal */}
      {selectedAnn && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAnn(null)}>
          <div className={`${styles.modalContent} p-4 fade-in`} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
              <div className="d-flex align-items-center gap-3">
                <div className={styles.modalDateBadge}>
                  <span>{getDay(selectedAnn.date)}</span>
                  <span className="small">{getMonthAbbr(selectedAnn.date)}</span>
                </div>
                <h4 className="mb-0 fs-5">{selectedAnn.title}</h4>
              </div>
              <button className="btn-close" onClick={() => setSelectedAnn(null)}></button>
            </div>
            
            <div
              className={`${styles.modalBody} rich-text`}
              dangerouslySetInnerHTML={{ __html: selectedAnn.content }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
