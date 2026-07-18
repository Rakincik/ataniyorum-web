'use client';

import React, { useState, useEffect } from 'react';
import { confirmDelete, showSuccess } from '@/lib/swal';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalCategories: 0, totalProducts: 0, mainCategories: 0, subCategories: 0 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch category tree and stats
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
        setStats(data.stats);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = (parent = null) => {
    setName('');
    setParentId(parent ? parent.id.toString() : '');
    setError('');
    setSuccess('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setName(category.name);
    setParentId(category.parentId ? category.parentId.toString() : '');
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: parentId ? parseInt(parentId) : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kategori eklenirken hata oluştu.');
      } else {
        setShowAddModal(false);
        showSuccess('Kategori başarıyla oluşturuldu.');
        fetchData();
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: parentId ? parseInt(parentId) : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kategori güncellenirken hata oluştu.');
      } else {
        setShowEditModal(false);
        showSuccess('Kategori başarıyla güncellendi.');
        fetchData();
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete('Bu kategoriyi (varsa tüm alt kategorileriyle birlikte) silmek istediğinize emin misiniz?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showSuccess('Kategori başarıyla silindi.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    color: '#0f172a'
  };

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.95rem',
    color: '#0f172a',
  };

  const labelStyle = {
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#475569',
    fontWeight: '700',
    marginBottom: '6px'
  };

  return (
    <div className="fade-in text-dark">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div>
          <h2 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Kategori Yönetimi</h2>
          <p className="text-secondary small m-0">Ürünlerinizi sınıflandırmak için kategori hiyerarşisini ve alt sekmeleri yapılandırın.</p>
        </div>
        <button onClick={() => handleOpenAdd(null)} className="btn btn-primary d-flex align-items-center gap-2 fw-semibold shadow-sm px-4 py-2.5" style={{ borderRadius: '10px' }}>
          <i className="bi bi-folder-plus"></i>
          <span>Yeni Ana Kategori Ekle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3 col-md-6">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-folder-fill text-primary"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Kategori</span>
                <h4 className="fw-bold m-0 text-dark">{stats.totalCategories}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-box-seam-fill text-success"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Ürün</span>
                <h4 className="fw-bold m-0 text-dark">{stats.totalProducts}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-diagram-2-fill text-warning"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Ana Kategori</span>
                <h4 className="fw-bold m-0 text-dark">{stats.mainCategories}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-diagram-3-fill text-danger"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Alt Kategori</span>
                <h4 className="fw-bold m-0 text-dark">{stats.subCategories}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tree Card */}
      <div className="card p-4 mb-5" style={glassCardStyle}>
        <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom" style={{ fontFamily: 'var(--font-display)', borderColor: '#e2e8f0' }}>Kategori Ağaç Hiyerarşisi</h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-folder2-open fs-1"></i>
            <h5 className="mt-3">Kayıtlı kategori bulunmamaktadır.</h5>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {categories.map((parent) => (
              <div key={parent.id} className="p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                {/* Main Category Node Row */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-folder-fill text-primary fs-5"></i>
                    <span className="fw-bold text-dark">{parent.name}</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill small ms-2 px-2.5 py-1.5" style={{ fontSize: '0.75rem', border: '1px solid rgba(37, 99, 235, 0.1)' }}>{parent._count?.products || 0} Ürün</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() => handleOpenAdd(parent)}
                      className="btn btn-sm btn-link text-decoration-none fw-semibold p-1 transition"
                      style={{ fontSize: '0.825rem', color: '#2563eb' }}
                    >
                      <i className="bi bi-plus-circle-fill"></i> Alt Kategori Ekle
                    </button>
                    <button
                      onClick={() => handleOpenEdit(parent)}
                      className="btn btn-sm btn-outline-secondary px-2.5 py-1.5"
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-pencil-square"></i> Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="btn btn-sm btn-outline-danger px-2.5 py-1.5"
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-trash"></i> Sil
                    </button>
                  </div>
                </div>

                {/* Subcategories Children block */}
                {parent.children && parent.children.length > 0 && (
                  <div className="mt-3 ms-4 ps-3 border-start d-flex flex-column gap-2" style={{ borderColor: '#cbd5e1' }}>
                    {parent.children.map((child) => (
                      <div key={child.id} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-arrow-return-right text-secondary small ms-1"></i>
                          <i className="bi bi-folder2 text-secondary"></i>
                          <span className="fw-semibold text-dark small">{child.name}</span>
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill small ms-1" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>{child._count?.products || 0} Ürün</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(child)}
                            className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <i className="bi bi-pencil-square"></i> Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(child.id)}
                            className="btn btn-sm btn-link text-danger p-1 text-decoration-none"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <i className="bi bi-trash"></i> Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050, overflowY: 'auto' }} onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog modal-dialog-centered my-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 p-4" style={modalStyle}>
              <div className="modal-header border-bottom-0 pb-3 pt-2 px-2 d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Yeni Kategori Ekle</h4>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-2">
                  {error && <div className="alert alert-danger p-2.5 small mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-2.5 small mb-4">{success}</div>}

                  <div className="mb-4">
                    <label className="form-label" style={labelStyle}>Kategori Adı</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Örn: ÖABT Video Dersler"
                      style={inputStyle}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={labelStyle}>Üst Kategori</label>
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                    >
                      <option value="">Yok (Ana Kategori Yap)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-4 pb-2 px-2 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px' }} onClick={() => setShowAddModal(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary px-4 py-2" style={{ borderRadius: '8px' }}>Kategoriyi Oluştur</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050, overflowY: 'auto' }} onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog modal-dialog-centered my-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 p-4" style={modalStyle}>
              <div className="modal-header border-bottom-0 pb-3 pt-2 px-2 d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Kategoriyi Düzenle</h4>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body p-2">
                  {error && <div className="alert alert-danger p-2.5 small mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-2.5 small mb-4">{success}</div>}

                  <div className="mb-4">
                    <label className="form-label" style={labelStyle}>Kategori Adı</label>
                    <input
                      type="text"
                      className="form-control"
                      style={inputStyle}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={labelStyle}>Üst Kategori</label>
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                    >
                      <option value="">Yok (Ana Kategori Yap)</option>
                      {categories
                        .filter(c => c.id !== selectedCategory?.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-4 pb-2 px-2 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px' }} onClick={() => setShowEditModal(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary px-4 py-2" style={{ borderRadius: '8px' }}>Değişiklikleri Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
