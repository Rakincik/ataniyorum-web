'use client';

import React, { useState, useRef } from 'react';
import styles from './DragDropUploader.module.css';

export default function DragDropUploader({ onUploadSuccess, initialValue }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(initialValue || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yükleme başarısız.');
      }

      setPreview(data.url);
      onUploadSuccess(data.url);
    } catch (err) {
      setError(err.message || 'Dosya yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-3">
      <label className="form-label small fw-semibold">Ürün Görseli (Sürükle - Bırak)</label>
      
      <div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${preview ? styles.hasPreview : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="d-none"
          accept="image/*"
          onChange={handleFileChange}
        />

        {uploading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
            <span className="d-block small text-muted">Dosya yükleniyor...</span>
          </div>
        ) : preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Önizleme" className={styles.previewImg} />
            <div className={styles.overlay}>
              <i className="bi bi-cloud-arrow-up fs-4 mb-1"></i>
              <span className="small">Görseli Değiştir (Sürükle veya Tıkla)</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 px-2">
            <i className="bi bi-cloud-arrow-up fs-2 text-primary mb-2 d-block"></i>
            <span className="d-block small fw-medium">Görseli Buraya Sürükleyin</span>
            <span className="d-block text-muted small" style={{ fontSize: '0.75rem' }}>veya dosya seçmek için tıklayın</span>
          </div>
        )}
      </div>

      {error && <span className="text-danger small mt-1 d-block">{error}</span>}
    </div>
  );
}
