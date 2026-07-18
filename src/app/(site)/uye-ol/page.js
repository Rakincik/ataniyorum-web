'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function UyeOlPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Girdiğiniz şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate signup
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="bg-white p-5 border rounded-4 shadow-sm">
            <h2 className="fs-3 fw-bold text-center text-primary mb-4">Yeni Üyelik Oluştur</h2>

            {success ? (
              <div className="text-center py-4">
                <i className="bi bi-person-check-fill text-success fs-1 mb-3 d-block"></i>
                <h4 className="fw-bold">Üyeliğiniz Başarıyla Oluşturuldu!</h4>
                <p className="text-muted small mt-2">
                  Eğitim paneline giriş yapabilmeniz için hesabınız aktif edilmiştir. Eğitim portalı üzerinden derslerinizi takip etmeye başlayabilirsiniz.
                </p>
                <a
                  href="https://ataniyorumhocam.okinar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-4 px-4 py-2.5 fw-bold"
                  style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}
                >
                  Ders Paneline Giriş Yap
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger small py-2">{error}</div>}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Adınız</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Soyadınız</label>
                    <input
                      type="text"
                      name="surname"
                      className="form-control"
                      required
                      value={formData.surname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">E-posta Adresiniz</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Telefon Numaranız</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      required
                      placeholder="05xx xxx xx xx"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Şifre</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Şifre Tekrarı</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2.5 fw-bold"
                      style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}
                    >
                      {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : 'Kayıt Ol'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {!success && (
              <div className="text-center mt-4">
                <span className="text-muted small">Zaten hesabınız var mı?</span>{' '}
                <Link href="/giris" className="small text-primary fw-semibold text-decoration-none">
                  Giriş Yapın
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
