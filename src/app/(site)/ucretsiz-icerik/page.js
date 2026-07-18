'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function UcretsizIcerikPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
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
    setLoading(true);
    setError('');

    // Simulate free content registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', surname: '', email: '', phone: '', password: '' });
    }, 1500);
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="bg-white p-5 border rounded-4 shadow-sm">
            <div className="text-center mb-4">
              <span className="badge bg-warning text-dark px-3 py-2 fs-7 mb-2">Hediye İçerik</span>
              <h1 className="fs-3 fw-bold text-primary">Ücretsiz İçerik Kaydı</h1>
              <p className="text-muted small">
                Türker Hoca\'nın hazırladığı ücretsiz PDF dokümanları, deneme sınavları ve video ders örneklerine hemen erişmek için kaydolun!
              </p>
            </div>

            {success ? (
              <div className="text-center py-4">
                <i className="bi bi-patch-check-fill text-success fs-1 mb-3 d-block"></i>
                <h4 className="fw-bold">Kaydınız Başarıyla Alındı!</h4>
                <p className="text-muted small mt-2">
                  Ücretsiz eğitim içerikleri panelinize erişim şifreniz e-posta adresinize gönderilmiştir. Ders paneline giriş yaparak hemen izlemeye başlayabilirsiniz.
                </p>
                <a
                  href="https://ataniyorumhocam.okinar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-4 px-4 py-2.5 fw-bold"
                  style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}
                >
                  Eğitim Paneline Giriş Yap
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
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Şifre Belirleyin</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-warning w-100 py-2.5 fw-bold text-dark"
                      style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        'Ücretsiz Katıl & Başla'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
