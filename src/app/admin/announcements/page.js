'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { confirmDelete, showAlert, showSuccess } from '@/lib/swal';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useSearchParams } from 'next/navigation';

function AdminAnnouncementsPageContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    if (initialAction === 'new') {
      openCreateModal();
    }
  }, [initialAction]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements?all=true', { cache: 'no-store' });
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAnn(null);
    setFormData({
      title: '',
      content: '',
      isActive: true,
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      isActive: ann.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditorChange = (html) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.content || formData.content === '<br>' || formData.content === '') {
      setFormError('Lütfen başlık ve duyuru içeriğini doldurun.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingAnn ? `/api/announcements/${editingAnn.id}` : '/api/announcements';
      const method = editingAnn ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kaydetme işlemi başarısız.');
      }

      setShowModal(false);
      loadAnnouncements();
      showSuccess(editingAnn ? 'Duyuru başarıyla güncellendi.' : 'Duyuru başarıyla oluşturuldu.');
    } catch (err) {
      setFormError(err.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (annId) => {
    const confirmed = await confirmDelete('Bu duyuruyu silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/announcements/${annId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Silme işlemi başarısız.');
      }

      loadAnnouncements();
      showSuccess('Duyuru başarıyla silindi.');
    } catch (err) {
      showAlert('Hata', err.message || 'Duyuru silinirken bir hata oluştu.', 'error');
    }
  };

  const glassCardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
    transition: 'all 0.3s ease',
  };

  const modalStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    color: '#0f172a'
  };

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#0f172a',
  };

  return (
    <div className="fade-in text-dark">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Duyuru Yönetimi</h2>
          <span className="text-secondary small">Ana sayfadaki duyuruları ve kampanyaları düzenleyin</span>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary fw-semibold d-flex align-items-center gap-2 px-4 py-2.5"
          style={{ borderRadius: '10px' }}
        >
          <i className="bi bi-plus-circle"></i> Yeni Duyuru Ekle
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card p-5 text-center" style={glassCardStyle}>
          <i className="bi bi-megaphone display-4 text-muted"></i>
          <h5 className="mt-3">Kayıtlı duyuru bulunamadı.</h5>
        </div>
      ) : (
        <div className="card overflow-hidden" style={glassCardStyle}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-dark" style={{ background: 'transparent' }}>
              <thead className="text-secondary" style={{ fontSize: '0.85rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="px-4 py-3 border-0">Başlık</th>
                  <th className="py-3 border-0">Tarih</th>
                  <th className="py-3 border-0">Durum</th>
                  <th className="px-4 py-3 text-end border-0">İşlemler</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {announcements.map((ann) => (
                  <tr key={ann.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="px-4 py-3 fw-semibold text-dark small">{ann.title}</td>
                    <td className="py-3 text-secondary small">
                      {new Date(ann.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${ann.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small px-2 py-1`}>
                        {ann.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => openEditModal(ann)}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-pencil"></i> Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="btn btn-sm btn-outline-danger"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-trash"></i> Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal overlay */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1100, overflowY: 'auto' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card shadow-lg p-4 w-100 my-4"
            style={{ ...modalStyle, maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
              <h4 className="mb-0 fw-bold text-dark fs-5" style={{ fontFamily: 'var(--font-display)' }}>
                {editingAnn ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Ekle'}
              </h4>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            {formError && (
              <div className="alert alert-danger small py-2.5 mb-3" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">Duyuru Başlığı</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    style={inputStyle}
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12 text-dark">
                  <div style={{ background: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid #cbd5e1' }}>
                    <RichTextEditor
                      label="Duyuru Detayı (Zengin Metin)"
                      value={formData.content}
                      onChange={handleEditorChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-check form-switch mt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="form-check-input"
                      id="annIsActiveCheck"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label small text-secondary fw-semibold" htmlFor="annIsActiveCheck">
                      Bu Duyuru Yayında (Aktif) Olsun
                    </label>
                  </div>
                </div>

                <div className="col-12 mt-4 d-flex justify-content-end gap-2 border-top pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary px-4 fw-semibold"
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}>
      <AdminAnnouncementsPageContent />
    </Suspense>
  );
}
