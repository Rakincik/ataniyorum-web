'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { confirmDelete, showAlert, showSuccess } from '@/lib/swal';
import DragDropUploader from '@/components/admin/DragDropUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useSearchParams } from 'next/navigation';

function AdminProductsPageContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [products, setProducts] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState(null);
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    price: '',
    oldPrice: '',
    imageUrl: '',
    description: '',
    isActive: true,
    instructorName: '',
    badges: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
    if (initialAction === 'new' || initialAction === 'true') {
      openCreateModal();
    }
  }, [initialAction]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = [];
        data.categories.forEach(parent => {
          list.push({ id: parent.id, name: parent.name });
          if (parent.children) {
            parent.children.forEach(child => {
              list.push({ id: child.id, name: `└─ ${child.name} (${parent.name})` });
            });
          }
        });
        setFlatCategories(list);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        console.error('API did not return an array:', data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedId === null) return;

    const sourceIndex = products.findIndex((p) => p.id === draggedId);
    if (sourceIndex === targetIndex || sourceIndex === -1) return;

    const reordered = [...products];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Optimistically update the state
    setProducts(reordered);
    setDraggedId(null);

    // Save order in backend
    try {
      const ids = reordered.map((p) => p.id);
      const res = await fetch('/api/products/sort', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        showSuccess('Sıralama başarıyla güncellendi.');
      } else {
        showAlert('Hata', 'Sıralama güncellenemedi.', 'error');
        loadProducts(); // revert
      }
    } catch (err) {
      console.error(err);
      showAlert('Hata', 'Sıralama güncellenirken bağlantı hatası oluştu.', 'error');
      loadProducts(); // revert
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      categoryId: flatCategories[0]?.id.toString() || '',
      price: '',
      oldPrice: '',
      imageUrl: '',
      description: '',
      isActive: true,
      instructorName: '',
      badges: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    let priceVal = product.price;
    let oldPriceVal = '';

    if (product.discountRate > 0) {
      priceVal = product.price * (1 - product.discountRate / 100);
      oldPriceVal = product.price;
    }

    setFormData({
      title: product.title,
      categoryId: product.categoryId ? product.categoryId.toString() : '',
      price: priceVal.toString(),
      oldPrice: oldPriceVal ? oldPriceVal.toString() : '',
      imageUrl: product.imageUrl,
      description: product.description || '',
      isActive: product.isActive,
      instructorName: product.instructorName || '',
      badges: product.badges || '',
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
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleUploadSuccess = (url) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.imageUrl) {
      setFormError('Lütfen ürün için sürükle-bırak veya seçerek görsel yükleyin.');
      return;
    }

    if (!formData.categoryId) {
      setFormError('Lütfen bir kategori seçin.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const sellingPrice = parseFloat(formData.price);
      const oldPrice = formData.oldPrice ? parseFloat(formData.oldPrice) : null;

      if (oldPrice && oldPrice <= sellingPrice) {
        throw new Error('Eski fiyat, satış fiyatından büyük olmalıdır.');
      }

      let priceToSend = sellingPrice;
      let discountRateToSend = 0;

      if (oldPrice) {
        priceToSend = oldPrice;
        discountRateToSend = Math.round(((oldPrice - sellingPrice) / oldPrice) * 100);
      }

      const payload = {
        title: formData.title,
        categoryId: parseInt(formData.categoryId),
        price: priceToSend,
        discountRate: discountRateToSend,
        imageUrl: formData.imageUrl,
        description: formData.description,
        isActive: formData.isActive,
        instructorName: formData.instructorName || null,
        badges: formData.badges || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kaydetme işlemi başarısız.');
      }

      setShowModal(false);
      loadProducts();
      showSuccess(editingProduct ? 'Ürün başarıyla güncellendi.' : 'Ürün başarıyla oluşturuldu.');
    } catch (err) {
      setFormError(err.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = await confirmDelete('Bu ürünü silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Silme işlemi başarısız.');
      }

      loadProducts();
      showSuccess('Ürün başarıyla silindi.');
    } catch (err) {
      showAlert('Hata', err.message || 'Ürün silinirken bir hata oluştu.', 'error');
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Ürün Yönetimi</h2>
          <span className="text-secondary small">Eğitim paketlerinizi ve kitaplarınızı oluşturabilir, fiyatlandırabilir ve düzenleyebilirsiniz.</span>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-4 py-2.5"
          style={{ borderRadius: '10px' }}
        >
          <i className="bi bi-plus-circle-fill"></i> Yeni Ürün Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-5 text-center" style={glassCardStyle}>
          <i className="bi bi-box-seam display-4 text-muted"></i>
          <h5 className="mt-3">Kayıtlı ürün bulunmuyor.</h5>
          <p className="text-muted small">İlk ürününüzü eklemek için sağ üstteki butonu kullanın.</p>
        </div>
      ) : (
        <div className="card overflow-hidden" style={glassCardStyle}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-dark" style={{ background: 'transparent' }}>
              <thead className="text-secondary" style={{ fontSize: '0.85rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="px-3 py-3 border-0 text-center" style={{ width: '50px' }}></th>
                  <th className="px-4 py-3 border-0" style={{ width: '80px' }}>Resim</th>
                  <th className="py-3 border-0">Ürün Başlığı</th>
                  <th className="py-3 border-0">Kategori</th>
                  <th className="py-3 border-0">Fiyat</th>
                  <th className="py-3 border-0">İndirim Oranı</th>
                  <th className="py-3 border-0">Durum</th>
                  <th className="px-4 py-3 text-end border-0">İşlemler</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {products.map((prod, index) => (
                  <tr
                    key={prod.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, prod.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      opacity: prod.id === draggedId ? 0.4 : 1,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <td className="px-3 py-3 text-center" style={{ cursor: 'grab' }} title="Sürükleyip sıralamayı değiştirin">
                      <i className="bi bi-grip-vertical text-secondary" style={{ fontSize: '1.2rem' }}></i>
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="rounded object-fit-cover border border-secondary"
                        width="50"
                        height="50"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </td>
                    <td className="py-3 fw-semibold text-dark small">{prod.title}</td>
                    <td className="py-3 text-secondary small">
                      {prod.category?.parent ? `${prod.category.parent.name} > ${prod.category.name}` : prod.category?.name || '-'}
                    </td>
                    <td className="py-3 fw-bold text-dark small">
                      ₺{prod.price.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 text-danger small font-weight-bold">
                      {prod.discountRate > 0 ? `%${prod.discountRate}` : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${prod.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small px-2 py-1`}>
                        {prod.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-pencil"></i> Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
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

      {/* Dynamic Modal overlay */}
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
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
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
                  <label className="form-label" style={labelStyle}>Ürün Başlığı</label>
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

                <div className="col-12">
                  <label className="form-label" style={labelStyle}>Kategori</label>
                  <select
                    name="categoryId"
                    className="form-select border-secondary"
                    style={inputStyle}
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seçiniz...</option>
                    {flatCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" style={labelStyle}>Satış Fiyatı (TL)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    className="form-control"
                    style={inputStyle}
                    required
                    placeholder="Müşterinin ödeyeceği tutar"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" style={labelStyle}>Eski Fiyat (TL) - Opsiyonel</label>
                  <input
                    type="number"
                    name="oldPrice"
                    step="0.01"
                    className="form-control"
                    style={inputStyle}
                    placeholder="İndirim öncesi normal tutar"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Instructor Name & Badges Fields */}
                <div className="col-md-6">
                  <label className="form-label" style={labelStyle}>Eğitmen Adı (Opsiyonel)</label>
                  <input
                    type="text"
                    name="instructorName"
                    className="form-control"
                    style={inputStyle}
                    placeholder="Örn: Türker Hoca"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" style={labelStyle}>Hızlı Etiketler (Opsiyonel, Virgülle Ayırın)</label>
                  <input
                    type="text"
                    name="badges"
                    className="form-control"
                    style={inputStyle}
                    placeholder="Örn: Canlı Ders, 250+ Saat"
                    value={formData.badges}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-12">
                  <DragDropUploader
                    onUploadSuccess={handleUploadSuccess}
                    initialValue={formData.imageUrl}
                  />
                </div>

                {/* Rich Text Editor for Product Description */}
                <div className="col-12 text-dark">
                  <div style={{ background: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid #cbd5e1' }}>
                    <RichTextEditor
                      label="Ürün Detaylı Açıklaması (Zengin Metin)"
                      value={formData.description}
                      onChange={handleEditorChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="isActiveSwitch"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label small text-secondary fw-semibold" htmlFor="isActiveSwitch">
                      Ürün Aktif / Satışta
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>{editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}>
      <AdminProductsPageContent />
    </Suspense>
  );
}
