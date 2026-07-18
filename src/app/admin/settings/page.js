'use client';

import React, { useState, useEffect } from 'react';
import { confirmDelete, showAlert, showSuccess } from '@/lib/swal';

export default function AdminSettingsPage() {
  // Settings States
  const [settings, setSettings] = useState({
    countdownTitle: '',
    countdownDate: '',
    whatsappNumber: '',
    instagramUrl: '',
    contactEmail: '',
    purchaseVideoUrl: '',
    couponVideoUrl: '',
    countdownActive: true,
    sliderActive: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsUpdating, setSettingsUpdating] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Messages States
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadSettings();
    loadMessages();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      
      // Format date for datetime-local input
      let formattedDate = '';
      if (data.countdownDate) {
        const dateObj = new Date(data.countdownDate);
        const offset = dateObj.getTimezoneOffset();
        const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);
        formattedDate = localDate.toISOString().slice(0, 16);
      }

      setSettings({
        countdownTitle: data.countdownTitle || '',
        countdownDate: formattedDate,
        whatsappNumber: data.whatsappNumber || '',
        instagramUrl: data.instagramUrl || '',
        contactEmail: data.contactEmail || '',
        purchaseVideoUrl: data.purchaseVideoUrl || '',
        couponVideoUrl: data.couponVideoUrl || '',
        countdownActive: data.countdownActive !== undefined ? data.countdownActive : true,
        sliderActive: data.sliderActive !== undefined ? data.sliderActive : true,
      });
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadMessages = async () => {
    messagesLoading || setMessagesLoading(true);
    try {
      const res = await fetch('/api/messages', { cache: 'no-store' });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsUpdating(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          countdownDate: new Date(settings.countdownDate).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Ayarlar güncellenemedi.');
      }

      setSettingsSuccess(true);
      showSuccess('Ayarlar başarıyla kaydedildi.');
    } catch (err) {
      showAlert('Hata', err.message || 'Ayarlar kaydedilirken hata oluştu.', 'error');
    } finally {
      setSettingsUpdating(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    const confirmed = await confirmDelete('Bu mesajı silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Mesaj silinemedi.');
      }

      setSelectedMessage(null);
      loadMessages();
      showSuccess('Mesaj başarıyla silindi.');
    } catch (err) {
      showAlert('Hata', err.message || 'Mesaj silinirken hata oluştu.', 'error');
    }
  };

  const glassCardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
    transition: 'all 0.3s ease',
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
          <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Ayarlar & Gelen Kutusu</h2>
          <span className="text-secondary small">Sayaç süresini, sosyal medya bağlantılarını ve gelen mesajları yönetin</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Global Settings Panel */}
        <div className="col-lg-5">
          <div className="card p-4 h-100 bg-white" style={glassCardStyle}>
            <h4 className="fs-5 fw-bold mb-4 text-dark" style={{ fontFamily: 'var(--font-display)' }}>Site Genel Ayarları</h4>

            {settingsLoading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : (
              <form onSubmit={handleSettingsSubmit}>
                {settingsSuccess && (
                  <div className="alert alert-success small py-2 mb-3" role="alert">
                    <i className="bi bi-check-circle-fill me-1"></i> Ayarlar başarıyla güncellendi.
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="me-3">
                    <label className="fw-bold text-dark small cursor-pointer mb-1" htmlFor="countdownActive" style={{ userSelect: 'none' }}>
                      Geri Sayım Banner'ını Göster
                    </label>
                    <div className="text-secondary small" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      Aktif edilirse, sitenin en üst kısmında geri sayım sayacı gösterilir.
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id="countdownActive"
                      name="countdownActive"
                      style={{ marginLeft: 0, scale: '1.3', cursor: 'pointer' }}
                      checked={settings.countdownActive}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 mb-4 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="me-3">
                    <label className="fw-bold text-dark small cursor-pointer mb-1" htmlFor="sliderActive" style={{ userSelect: 'none' }}>
                      Görsel Slider'ı (Duyuru Banner'ı) Göster
                    </label>
                    <div className="text-secondary small" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      Aktif edilirse, ana sayfada büyük görsel geçişli duyuru slider'ı gösterilir.
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id="sliderActive"
                      name="sliderActive"
                      style={{ marginLeft: 0, scale: '1.3', cursor: 'pointer' }}
                      checked={settings.sliderActive}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Geri Sayım Başlığı</label>
                  <input
                    type="text"
                    name="countdownTitle"
                    className="form-control"
                    style={inputStyle}
                    required
                    value={settings.countdownTitle}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Geri Sayım Sınav Tarihi</label>
                  <input
                    type="datetime-local"
                    name="countdownDate"
                    className="form-control"
                    style={inputStyle}
                    required
                    value={settings.countdownDate}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>WhatsApp Destek Hattı (Ülke kodu ile)</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    className="form-control"
                    style={inputStyle}
                    placeholder="905000000000"
                    value={settings.whatsappNumber}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Instagram Sayfası Linki</label>
                  <input
                    type="url"
                    name="instagramUrl"
                    className="form-control"
                    style={inputStyle}
                    placeholder="https://instagram.com/..."
                    value={settings.instagramUrl}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>İletişim E-posta Adresi</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    style={inputStyle}
                    value={settings.contactEmail}
                    onChange={handleSettingsChange}
                  />
                </div>

                {/* Video URLs inputs */}
                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Satın Alma Rehber Videosu (URL / Yol)</label>
                  <input
                    type="text"
                    name="purchaseVideoUrl"
                    className="form-control"
                    style={inputStyle}
                    placeholder="Örn: /purchase-guide.mp4 veya harici link"
                    value={settings.purchaseVideoUrl}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" style={labelStyle}>Kupon Uygulama Rehber Videosu (URL / Yol)</label>
                  <input
                    type="text"
                    name="couponVideoUrl"
                    className="form-control"
                    style={inputStyle}
                    placeholder="Örn: /coupon-guide.mp4 veya harici link"
                    value={settings.couponVideoUrl}
                    onChange={handleSettingsChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsUpdating}
                  className="btn btn-primary w-100 py-3 fw-bold"
                  style={{ borderRadius: '8px' }}
                >
                  {settingsUpdating ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    'Ayarları Kaydet'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Messages Panel */}
        <div className="col-lg-7">
          <div className="card p-4 h-100 bg-white" style={glassCardStyle}>
            <h4 className="fs-5 fw-bold mb-4 text-dark" style={{ fontFamily: 'var(--font-display)' }}>Gelen İletişim Mesajları ({messages.length})</h4>

            {messagesLoading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-5 text-secondary" style={{ opacity: 0.7 }}>
                <i className="bi bi-envelope fs-1 d-block mb-3 text-muted"></i>
                <span>Gelen kutunuz boş.</span>
              </div>
            ) : (
              <div className="row g-3">
                {/* Messages List */}
                <div className="col-md-5 border-end pr-3" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '480px' }}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className="p-2.5 rounded-3 cursor-pointer transition"
                        style={{
                          background: selectedMessage?.id === msg.id ? '#eff6ff' : '#f8fafc',
                          border: selectedMessage?.id === msg.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                        }}
                      >
                        <span className="fw-bold text-dark small d-block">
                          {msg.name} {msg.surname}
                        </span>
                        <span className="text-secondary text-truncate d-block small" style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                          {msg.message}
                        </span>
                        <span className="text-secondary d-block text-end" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '6px' }}>
                          {new Date(msg.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Message Detail view */}
                <div className="col-md-7 ps-3">
                  {selectedMessage ? (
                    <div className="d-flex flex-column h-100 justify-content-between p-2">
                      <div>
                        <div className="border-bottom pb-3 mb-4" style={{ borderColor: '#e2e8f0' }}>
                          <h5 className="fs-6 fw-bold mb-2 text-primary" style={{ fontSize: '1.05rem' }}>
                            {selectedMessage.name} {selectedMessage.surname}
                          </h5>
                          <span className="text-secondary small d-block mb-1" style={{ fontSize: '0.8rem' }}>
                            <strong>E-posta:</strong> {selectedMessage.email}
                          </span>
                          <span className="text-secondary small d-block mb-1" style={{ fontSize: '0.8rem' }}>
                            <strong>Telefon:</strong> {selectedMessage.phone}
                          </span>
                          <span className="text-secondary small d-block" style={{ fontSize: '0.8rem' }}>
                            <strong>Tarih:</strong> {new Date(selectedMessage.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        
                        <p className="text-dark small leading-relaxed whitespace-pre-line p-3 rounded-3" style={{ minHeight: '160px', background: '#f8fafc', border: '1px solid #e2e8f0', opacity: 0.9 }}>
                          {selectedMessage.message}
                        </p>
                      </div>

                      <div className="mt-4 text-end">
                        <button
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                          className="btn btn-sm btn-outline-danger px-3 py-2"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="bi bi-trash"></i> Mesajı Sil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5 text-secondary small d-flex flex-column align-items-center justify-content-center h-100" style={{ opacity: 0.7 }}>
                      <i className="bi bi-chat-text fs-2 mb-2 text-muted"></i>
                      Detayını görmek istediğiniz mesajı sol taraftan seçin.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
