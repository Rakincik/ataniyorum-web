'use client';

import React, { useState } from 'react';
import styles from './Iletisim.module.css';

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    message: '',
    kvkk: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kvkk) {
      setError('Lütfen KVKK bilgilendirme onayını işaretleyin.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mesaj gönderilemedi.');
      }

      setSuccess(true);
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        message: '',
        kvkk: false,
      });
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row g-5 align-items-center">
        {/* Left Column: Contact details */}
        <div className="col-lg-5">
          <span className="text-muted text-uppercase tracking-wider small fw-bold">Bizimle İletişime Geçin</span>
          <h1 className="display-6 fw-bold mt-1 text-primary">Sorularınız İçin Buradayız</h1>
          <p className="text-muted mt-3 mb-4">
            Eğitim programlarımız, yayınlarımız ve özel kampanyalarımız hakkında bilgi almak için aşağıdaki formu doldurarak bize ulaşabilirsiniz. En kısa sürede yanıtlayacağız.
          </p>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className={styles.iconBox}>
                <i className="bi bi-geo-alt"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">Adres</h6>
                <span className="text-muted small">Ankara, Türkiye</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className={styles.iconBox}>
                <i className="bi bi-telephone"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">Telefon</h6>
                <span className="text-muted small">+90 500 000 00 00</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className={styles.iconBox}>
                <i className="bi bi-envelope"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">E-posta</h6>
                <span className="text-muted small">iletisim@ataniyorumhocam.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="col-lg-7">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="fs-4 mb-4">İletişim Formu</h3>

            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                <div>Mesajınız başarıyla iletildi. Teşekkür ederiz!</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                <div className="col-md-6">
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
                <div className="col-md-6">
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
                  <label className="form-label small fw-semibold">Mesajınız</label>
                  <textarea
                    name="message"
                    rows="4"
                    className="form-control"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="kvkk"
                      id="kvkkCheck"
                      className="form-check-input"
                      checked={formData.kvkk}
                      onChange={handleChange}
                    />
                    <label htmlFor="kvkkCheck" className="form-check-label small text-muted">
                      KVKK bilgilendirme metnini okudum, kişisel verilerimin işlenmesini onaylıyorum.
                    </label>
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-2.5 fw-bold"
                    style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Mesajı Gönder'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
