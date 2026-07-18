'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Giriş işlemi başarısız.');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Geçersiz giriş bilgileri.');
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="card shadow-lg border-0 rounded-4 p-4 w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
          </div>
          <h2 className="fw-bold text-dark fs-4">Yönetici Girişi</h2>
          <span className="text-muted small">Atanıyorum Hocam Kontrol Paneli</span>
        </div>

        {error && (
          <div className="alert alert-danger small py-2.5 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-1"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">E-posta Adresi</label>
            <input
              type="email"
              name="email"
              className="form-control"
              required
              placeholder="admin@ataniyorum.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Parola</label>
            <input
              type="password"
              name="password"
              className="form-control"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2.5 fw-bold"
            style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}
          >
            {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
