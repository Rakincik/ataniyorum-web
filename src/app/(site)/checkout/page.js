'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const [customer, setCustomer] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Geçersiz kupon kodu.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponSuccess(`"${data.code}" kuponu başarıyla uygulandı!`);
      }
    } catch (err) {
      setCouponError('Kupon doğrulanırken teknik bir hata oluştu.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map((item) => ({ id: item.id, title: item.title, quantity: item.quantity })),
          customer,
          couponCode: appliedCoupon ? appliedCoupon.code : null
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ödeme işlemi başarısız.');
      }

      // Success
      setSuccessData(data);
      clearCart();
    } catch (err) {
      setError(err.message || 'Ödeme sırasında sistemsel bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate final discounted price
  let finalTotal = cartTotal;
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      couponDiscountAmount = cartTotal * (appliedCoupon.discountValue / 100);
    } else {
      couponDiscountAmount = appliedCoupon.discountValue;
    }
    finalTotal = Math.max(0, cartTotal - couponDiscountAmount);
  }

  if (successData) {
    return (
      <div className="container py-5 fade-in text-center">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="bg-white p-5 border rounded-4 shadow-sm">
              <i className="bi bi-shield-check text-success" style={{ fontSize: '4.5rem' }}></i>
              <h2 className="fw-bold text-success mt-3 mb-2">Ödemeniz Başarıyla Tamamlandı!</h2>
              <p className="text-muted small">Siparişiniz işleme alınmış ve ödemeniz güvenli bir şekilde tahsil edilmiştir.</p>
              
              <div className="bg-light p-3 rounded-3 my-4 text-start">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">İşlem Numarası:</span>
                  <span className="fw-semibold small">{successData.transactionId}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Ödenen Tutar:</span>
                  <span className="fw-bold text-primary small">₺{successData.amount.toLocaleString('tr-TR')}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Müşteri:</span>
                  <span className="fw-semibold small">{customer.name} {customer.surname}</span>
                </div>
              </div>

              <div className="alert alert-success small text-start py-3 mb-4">
                <div className="d-flex gap-2 align-items-start">
                  <i className="bi bi-info-circle-fill mt-0.5"></i>
                  <div>
                    <h6 className="fw-bold mb-1">Üyelik Bilgileriniz (Test Amaçlı Açık Gösterim)</h6>
                    <div>Kullanıcı Adı: <strong>{customer.email}</strong></div>
                    <div>Geçici Şifre: <strong className="font-monospace">{successData.user?.password || '123456'}</strong></div>
                    <span className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Bu bilgilerle ders paneline giriş yapabilirsiniz.</span>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <Link href="/" className="btn btn-primary px-5 py-2.5 fw-bold" style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '6px' }}>
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row g-4">
        {/* Cart items review (Left) */}
        <div className="col-lg-7">
          <div className="bg-white p-4 border rounded-4 shadow-sm mb-4">
            <h3 className="fs-4 mb-4 fw-bold">Sepetinizdeki Ürünler</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-cart-x fs-1 text-muted d-block mb-3"></i>
                <h5>Sepetiniz boş.</h5>
                <Link href="/" className="btn btn-primary mt-3" style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}>
                  Hemen Paket Al
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="d-flex align-items-center justify-content-between border-bottom pb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid var(--border-color)', padding: '2px', borderRadius: '6px' }}
                      />
                      <div>
                        <h6 className="mb-0 fw-semibold fs-6">{item.title}</h6>
                        <span className="text-muted small">{item.category?.name}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-4">
                      {/* Quantity Controller */}
                      <div className="input-group input-group-sm" style={{ width: '90px' }}>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="form-control text-center py-1">{item.quantity}</span>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>

                      <div className="text-end">
                        <span className="fw-bold d-block text-success">
                          ₺{(item.price * (1 - item.discountRate / 100) * item.quantity).toLocaleString('tr-TR')}
                        </span>
                        <button className="btn btn-sm text-danger p-0 border-0 mt-1" onClick={() => removeFromCart(item.id)}>
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Billing & Payment form (Right) */}
        {cart.length > 0 && (
          <div className="col-lg-5">
            <div className="bg-white p-4 border rounded-4 shadow-sm">
              <h3 className="fs-4 mb-4 fw-bold">Ödeme ve Fatura Bilgileri</h3>

              {error && (
                <div className="alert alert-danger small py-2.5 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handlePayment}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Adınız</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      required
                      value={customer.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Soyadınız</label>
                    <input
                      type="text"
                      name="surname"
                      className="form-control"
                      required
                      value={customer.surname}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">E-posta Adresiniz</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      value={customer.email}
                      onChange={handleInputChange}
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
                      value={customer.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="mb-4 pt-3 border-top">
                  <label className="form-label small fw-semibold">İndirim Kuponu</label>
                  {!appliedCoupon ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Kupon Kodunu Girin"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        style={{ textTransform: 'uppercase' }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="btn btn-outline-primary"
                        type="button"
                      >
                        Uygula
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between p-2.5 bg-success-subtle text-success border border-success rounded-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-ticket-perforated-fill"></i>
                        <span className="fw-bold small">{appliedCoupon.code}</span>
                        <span className="small">({appliedCoupon.discountType === 'PERCENTAGE' ? `%${appliedCoupon.discountValue} İndirim` : `₺${appliedCoupon.discountValue} İndirim`})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-bold"
                      >
                        İptal Et
                      </button>
                    </div>
                  )}
                  {couponError && <div className="text-danger small mt-1"><i className="bi bi-x-circle-fill me-1"></i>{couponError}</div>}
                  {couponSuccess && <div className="text-success small mt-1"><i className="bi bi-check-circle-fill me-1"></i>{couponSuccess}</div>}
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex flex-column gap-1.5 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Ara Toplam:</span>
                      <span className="text-dark fw-semibold">₺{cartTotal.toLocaleString('tr-TR')}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="d-flex justify-content-between align-items-center text-success">
                        <span className="small">Kupon İndirimi:</span>
                        <span>-₺{couponDiscountAmount.toLocaleString('tr-TR')}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                      <span className="text-muted fw-bold">Genel Toplam:</span>
                      <span className="fs-3 fw-bold text-primary">₺{finalTotal.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-3 fw-bold"
                    style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock-fill me-1"></i>
                        Ödemeyi Tamamla
                      </>
                    )}
                  </button>
                  
                  <span className="text-muted d-block text-center mt-2 small">
                    <i className="bi bi-lock-fill me-1"></i>
                    256-bit SSL Güvenli Altyapı ile Korunmaktadır.
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
