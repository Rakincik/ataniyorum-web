'use client';

import React, { useState, useEffect } from 'react';
import { confirmDelete, showSuccess } from '@/lib/swal';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form inputs
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setExpireDate('');
    setError('');
    setSuccess('');
    setShowAddModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          expireDate: expireDate || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kupon eklenirken hata oluştu.');
      } else {
        setShowAddModal(false);
        showSuccess('Kupon başarıyla oluşturuldu.');
        fetchCoupons();
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (res.ok) {
        showSuccess('Kupon durumu güncellendi.');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete('Bu kupon kodunu silmek istediğinize emin misiniz?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showSuccess('Kupon başarıyla silindi.');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const activeCouponsCount = coupons.filter(c => c.isActive).length;
  const maxDiscountValue = coupons.length > 0
    ? Math.max(...coupons.map(c => c.discountValue))
    : 0;

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
          <h2 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Kupon Yönetimi</h2>
          <p className="text-secondary small m-0">Sepette geçerli indirim kuponu kampanyaları ve hediye kodları tanımlayabilirsiniz.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary d-flex align-items-center gap-2 fw-semibold shadow-sm px-4 py-2.5" style={{ borderRadius: '10px' }}>
          <i className="bi bi-ticket-perforated"></i>
          <span>Yeni İndirim Kuponu Ekle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-ticket-detailed-fill text-primary"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Aktif Kupon</span>
                <h4 className="fw-bold m-0 text-dark">{activeCouponsCount} Kupon</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-percent text-success"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">En Yüksek İndirim Değeri</span>
                <h4 className="fw-bold m-0 text-dark">{maxDiscountValue}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-4 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', background: '#f1f5f9' }}>
                <i className="bi bi-info-circle-fill text-warning"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Kampanya Kodları</span>
                <h4 className="fw-bold m-0 text-dark">{coupons.length} Kod</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="card mb-5 overflow-hidden" style={glassCardStyle}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-ticket-perforated fs-1"></i>
            <h5 className="mt-3">Herhangi bir kampanya kuponu bulunmamaktadır.</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-dark" style={{ background: 'transparent' }}>
              <thead className="text-secondary" style={{ fontSize: '0.85rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="px-4 py-3 border-0">Oluşturma Tarihi</th>
                  <th className="py-3 border-0">Kupon Kodu</th>
                  <th className="py-3 border-0">İndirim Türü</th>
                  <th className="py-3 border-0">İndirim Miktarı</th>
                  <th className="py-3 border-0">Son Kullanma Tarihi</th>
                  <th className="py-3 border-0">Durum</th>
                  <th className="px-4 py-3 text-end border-0">İşlemler</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {coupons.map((c) => {
                  const isExpired = c.expireDate && new Date(c.expireDate) < new Date();
                  const regDate = new Date(c.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="px-4 text-secondary small">{regDate}</td>
                      <td>
                        <span className="badge bg-light border text-dark fw-bold px-3 py-1.5 font-monospace fs-7" style={{ letterSpacing: '0.5px' }}>
                          {c.code}
                        </span>
                      </td>
                      <td>
                        {c.discountType === 'PERCENTAGE' ? (
                          <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">Yüzdelik İndirim (%)</span>
                        ) : (
                          <span className="badge bg-success-subtle text-success fw-semibold px-2 py-1">Sabit Tutar İndirimi (₺)</span>
                        )}
                      </td>
                      <td className="fw-semibold text-dark">
                        {c.discountType === 'PERCENTAGE' ? `%${c.discountValue}` : `₺${c.discountValue}`}
                      </td>
                      <td>
                        {c.expireDate ? (
                          <span className={isExpired ? 'text-danger fw-semibold small' : 'text-secondary small'}>
                            {new Date(c.expireDate).toLocaleDateString('tr-TR')}
                            {isExpired && ' (Süresi Doldu)'}
                          </span>
                        ) : (
                          <span className="text-secondary small" style={{ opacity: 0.6 }}>Sınırsız</span>
                        )}
                      </td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            checked={c.isActive}
                            onChange={() => handleToggleActive(c)}
                          />
                          <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'} ms-1`}>
                            {c.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-end">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn btn-sm btn-outline-danger px-2.5 py-1.5"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-trash"></i> Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050, overflowY: 'auto' }} onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog modal-dialog-centered my-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 p-4" style={modalStyle}>
              <div className="modal-header border-bottom-0 pb-3 pt-2 px-2 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Yeni İndirim Kuponu Ekle</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-2">
                  {error && <div className="alert alert-danger p-2.5 small mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-2.5 small mb-4">{success}</div>}

                  <div className="mb-4">
                    <label className="form-label" style={labelStyle}>Kupon Kodu</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="Örn: YENIYIL50"
                      style={inputStyle}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{ ...inputStyle, textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label" style={labelStyle}>İndirim Türü</label>
                      <select
                        className="form-select border-secondary"
                        style={inputStyle}
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="PERCENTAGE">Yüzdelik (%)</option>
                        <option value="AMOUNT">Tutar (₺)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={labelStyle}>İndirim Değeri</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Örn: 20"
                        style={inputStyle}
                        required
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={labelStyle}>Son Kullanma Tarihi (İsteğe Bağlı)</label>
                    <input
                      type="date"
                      className="form-control"
                      style={inputStyle}
                      value={expireDate}
                      onChange={(e) => setExpireDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-4 pb-2 px-2 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px' }} onClick={() => setShowAddModal(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary px-4 py-2" style={{ borderRadius: '8px' }}>Kuponu Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
