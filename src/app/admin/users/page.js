'use client';

import React, { useState, useEffect } from 'react';
import { confirmDelete, showSuccess } from '@/lib/swal';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [tc, setTc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setName(user.name);
    setSurname(user.surname);
    setEmail(user.email);
    setPassword(user.password);
    setPhone(user.phone || '');
    setTc(user.tc || '');
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleOpenAdd = () => {
    setName('');
    setSurname('');
    setEmail('');
    setPassword('');
    setPhone('');
    setTc('');
    setError('');
    setSuccess('');
    setShowAddModal(true);
  };

  // Create User
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, email, password, phone, tc })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kullanıcı eklenirken hata oluştu.');
      } else {
        setShowAddModal(false);
        showSuccess('Kullanıcı başarıyla eklendi.');
        fetchUsers();
      }
    } catch (err) {
      setError('Bir bağlantı hatası oluştu.');
    }
  };

  // Update User
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, email, password, phone, tc })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kullanıcı güncellenirken hata oluştu.');
      } else {
        setShowEditModal(false);
        showSuccess('Kullanıcı bilgileri başarıyla güncellendi.');
        fetchUsers();
      }
    } catch (err) {
      setError('Bir bağlantı hatası oluştu.');
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete('Bu kullanıcıyı silmek istediğinize emin misiniz?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showSuccess('Kullanıcı başarıyla silindi.');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase();
    const fullName = `${u.name} ${u.surname}`.toLowerCase();
    return fullName.includes(term) || u.email.toLowerCase().includes(term) || (u.phone && u.phone.includes(term));
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted Users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'name') {
      aValue = (a.name || '').toLowerCase();
      bValue = (b.name || '').toLowerCase();
    } else if (sortField === 'surname') {
      aValue = (a.surname || '').toLowerCase();
      bValue = (b.surname || '').toLowerCase();
    } else if (sortField === 'email') {
      aValue = (a.email || '').toLowerCase();
      bValue = (b.email || '').toLowerCase();
    } else if (sortField === 'phone') {
      aValue = (a.phone || '');
      bValue = (b.phone || '');
    } else if (sortField === 'tc') {
      aValue = (a.tc || '');
      bValue = (b.tc || '');
    } else if (sortField === 'createdAt') {
      aValue = new Date(a.createdAt || 0).getTime();
      bValue = new Date(b.createdAt || 0).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortHeader = (label, field, extraClasses = '') => {
    const isCurrent = sortField === field;
    return (
      <th 
        className={`py-3 border-0 cursor-pointer select-none ${extraClasses}`} 
        onClick={() => handleSort(field)}
        style={{ whiteSpace: 'nowrap' }}
      >
        <div className="d-flex align-items-center gap-1">
          <span>{label}</span>
          {isCurrent ? (
            sortDirection === 'asc' ? <i className="bi bi-arrow-up-short text-primary fs-6"></i> : <i className="bi bi-arrow-down-short text-primary fs-6"></i>
          ) : (
            <i className="bi bi-arrow-down-up text-secondary opacity-50" style={{ fontSize: '0.7rem' }}></i>
          )}
        </div>
      </th>
    );
  };

  // Stats calculation
  const totalUsersCount = users.length;
  const payingUsersCount = users.filter(u => u.purchases?.length > 0).length;
  const totalRevenue = users.reduce((sum, u) => {
    const userPaid = u.purchases?.reduce((s, p) => s + p.pricePaid, 0) || 0;
    return sum + userPaid;
  }, 0);

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
    transition: 'all 0.2s',
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
          <h2 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Kullanıcı Yönetimi</h2>
          <p className="text-secondary small m-0">Satın alım yapan öğrencileri listeleyebilir, düzenleyebilir ve şifrelerini görüntüleyebilirsiniz.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary d-flex align-items-center gap-2 fw-semibold shadow-sm px-4 py-2.5" style={{ borderRadius: '10px' }}>
          <i className="bi bi-person-plus-fill"></i>
          <span>Yeni Öğrenci Ekle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: '#f1f5f9' }}>
                <i className="bi bi-people-fill text-primary"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Öğrenci</span>
                <h3 className="fw-bold m-0 text-dark">{totalUsersCount}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: '#f1f5f9' }}>
                <i className="bi bi-cash-stack text-success"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Aktif Alıcılar</span>
                <h3 className="fw-bold m-0 text-dark">{payingUsersCount} Öğrenci</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4" style={glassCardStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', background: '#f1f5f9' }}>
                <i className="bi bi-currency-exchange text-warning"></i>
              </div>
              <div>
                <span className="text-secondary small d-block mb-0.5">Toplam Sipariş Hacmi</span>
                <h3 className="fw-bold m-0 text-dark">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort Filter Card */}
      <div className="card p-4 mb-5" style={glassCardStyle}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="input-group shadow-none" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-transparent border-end-0 border-secondary" style={{ borderRadius: '8px 0 0 8px' }}><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control bg-transparent border-start-0 border-secondary text-dark placeholder-secondary shadow-none"
              placeholder="İsim, e-posta veya telefon ara..."
              style={{ borderRadius: '0 8px 8px 0' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2.5 align-items-center">
            <span className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>Sırala:</span>
            <select
              className="form-select border-secondary text-dark shadow-none"
              style={{ width: '220px', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem' }}
              value={`${sortField}_${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('_');
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <option value="createdAt_desc">En Yeni Üyeler</option>
              <option value="createdAt_asc">En Eski Üyeler</option>
              <option value="name_asc">Ad (A - Z)</option>
              <option value="name_desc">Ad (Z - A)</option>
              <option value="surname_asc">Soyad (A - Z)</option>
              <option value="surname_desc">Soyad (Z - A)</option>
              <option value="email_asc">E-posta (A - Z)</option>
              <option value="email_desc">E-posta (Z - A)</option>
              <option value="phone_asc">Telefon (Artan)</option>
              <option value="phone_desc">Telefon (Azalan)</option>
              <option value="tc_asc">T.C. Kimlik (Artan)</option>
              <option value="tc_desc">T.C. Kimlik (Azalan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card mb-5 overflow-hidden" style={glassCardStyle}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-secondary mt-2 small">Kullanıcı verileri yükleniyor...</p>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-people fs-1"></i>
            <h5 className="mt-3">Herhangi bir öğrenci bulunamadı.</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-dark" style={{ background: 'transparent' }}>
              <thead className="text-secondary" style={{ fontSize: '0.85rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  {renderSortHeader('Kayıt Tarihi', 'createdAt', 'px-4')}
                  {renderSortHeader('TC Kimlik No', 'tc')}
                  {renderSortHeader('Adı', 'name')}
                  {renderSortHeader('Soyadı', 'surname')}
                  {renderSortHeader('Telefon', 'phone')}
                  {renderSortHeader('E-posta', 'email')}
                  <th className="py-3 border-0">Şifre (Açık)</th>
                  <th className="py-3 border-0">Satın Alımlar</th>
                  <th className="px-4 py-3 text-end border-0">İşlemler</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {sortedUsers.map((u) => {
                  const regDate = new Date(u.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="px-4 text-secondary small">{regDate}</td>
                      <td>{u.tc || <span className="text-secondary small">-</span>}</td>
                      <td className="fw-semibold text-dark">{u.name}</td>
                      <td className="fw-semibold text-dark">{u.surname}</td>
                      <td>{u.phone || <span className="text-secondary small">-</span>}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 font-monospace fs-7" style={{ letterSpacing: '0.5px' }}>
                          {u.password}
                        </span>
                      </td>
                      <td>
                        {u.purchases && u.purchases.length > 0 ? (
                          <div className="d-flex flex-column gap-1">
                            {u.purchases.map((p) => (
                              <span key={p.id} className="badge bg-success-subtle text-success text-start px-2.5 py-1.5 small text-truncate" style={{ maxWidth: '180px', border: '1px solid rgba(25, 135, 84, 0.1)' }}>
                                <i className="bi bi-check-circle-fill me-1"></i>
                                {p.product.title} (₺{p.pricePaid})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-secondary small">-</span>
                        )}
                      </td>
                      <td className="px-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 px-2.5 py-1.5"
                            style={{ borderRadius: '6px' }}
                          >
                            <i className="bi bi-pencil-square"></i> Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2.5 py-1.5"
                            style={{ borderRadius: '6px' }}
                          >
                            <i className="bi bi-trash"></i> Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1050, overflowY: 'auto' }} onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog modal-dialog-centered my-4" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 p-4" style={modalStyle}>
              <div className="modal-header border-bottom-0 pb-3 pt-2 px-2 d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Yeni Öğrenci Ekle</h4>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-2">
                  {error && <div className="alert alert-danger p-2.5 small mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-2.5 small mb-4">{success}</div>}

                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label" style={labelStyle}>Adı</label>
                      <input type="text" className="form-control" style={inputStyle} required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={labelStyle}>Soyadı</label>
                      <input type="text" className="form-control" style={inputStyle} required value={surname} onChange={(e) => setSurname(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>E-posta Adresi</label>
                      <input type="email" className="form-control" style={inputStyle} required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>Parola (Açık Şifre)</label>
                      <input type="text" className="form-control" style={inputStyle} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>TC Kimlik Numarası</label>
                      <input type="text" className="form-control" style={inputStyle} maxLength="11" value={tc} onChange={(e) => setTc(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>Telefon</label>
                      <input type="text" className="form-control" style={inputStyle} placeholder="05xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-4 pb-2 px-2 d-flex gap-3 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '8px' }} onClick={() => setShowAddModal(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary px-4 py-2" style={{ borderRadius: '8px' }}>Öğrenciyi Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050, overflowY: 'auto' }} onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog modal-dialog-centered my-4" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 p-4" style={modalStyle}>
              <div className="modal-header border-bottom-0 pb-3 pt-2 px-2 d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-dark m-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Kullanıcı Bilgilerini Düzenle</h4>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body p-2">
                  {error && <div className="alert alert-danger p-2.5 small mb-4">{error}</div>}
                  {success && <div className="alert alert-success p-2.5 small mb-4">{success}</div>}

                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label" style={labelStyle}>Adı</label>
                      <input type="text" className="form-control" style={inputStyle} required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={labelStyle}>Soyadı</label>
                      <input type="text" className="form-control" style={inputStyle} required value={surname} onChange={(e) => setSurname(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>E-posta Adresi</label>
                      <input type="email" className="form-control" style={inputStyle} required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>Parola</label>
                      <input type="text" className="form-control" style={inputStyle} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>TC Kimlik Numarası</label>
                      <input type="text" className="form-control" style={inputStyle} maxLength="11" value={tc} onChange={(e) => setTc(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={labelStyle}>Telefon</label>
                      <input type="text" className="form-control" style={inputStyle} placeholder="05xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
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
