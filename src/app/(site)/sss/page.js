'use client';

import React, { useState } from 'react';
import styles from './SSS.module.css';

export default function SSSPage() {
  const faqs = [
    {
      q: 'Paketleri satın aldıktan sonra derslere ne zaman erişim sağlayabilirim?',
      a: 'Satın alma işleminiz gerçekleştiği anda hesabınız otomatik olarak aktif edilir ve "Ders Paneline Giriş" butonu üzerinden hemen öğrenci panelinize giriş yaparak derslere başlayabilirsiniz.'
    },
    {
      q: 'Canlı dersleri kaçırırsam sonradan izleyebilir miyim?',
      a: 'Evet, yaptığımız tüm canlı dersler otomatik olarak kayıt edilmektedir. Sınav tarihine kadar tüm canlı derslerin kayıtlarını sınırsız bir şekilde, hızlandırma seçeneğiyle tekrar tekrar izleyebilirsiniz.'
    },
    {
      q: 'Yayınlarınız kargo ile gönderiliyor mu?',
      a: 'Evet, basılı yayın paketlerimiz ve kitaplarımız anlaşmalı kargo firmaları aracılığıyla adresinize gönderilir. 1000 TL ve üzeri alışverişlerinizde kargo tamamen ücretsizdir.'
    },
    {
      q: 'Sınav güncellemeleri ve ek dersler paketlere dahil mi?',
      a: 'Evet, dönem içerisinde MEB veya ÖSYM tarafından yapılacak müfredat değişiklikleri ve güncellemeler kapsamında yapılacak tüm ek dersler ve revizyonlar paketlerimize ücretsiz olarak yansıtılır.'
    },
    {
      q: 'Hangi ödeme yöntemleri geçerlidir?',
      a: 'Kredi kartı veya banka kartınız ile Sanal POS altyapımız üzerinden 3D Secure güvenli ödeme yöntemiyle veya banka havalesi/EFT ile ödeme yapabilirsiniz.'
    },
    {
      q: 'Kredi kartına taksit seçeneği bulunuyor mu?',
      a: 'Evet, anlaşmalı olduğumuz tüm bankaların kredi kartlarına 9 aya varan taksit seçeneklerimiz mevcuttur. Ödeme aşamasında taksit seçeneklerini görebilirsiniz.'
    },
    {
      q: 'Teknik destek hizmetiniz var mı?',
      a: 'Evet, platformumuzda yaşayabileceğiniz her türlü sistemsel veya teknik sorun için WhatsApp destek hattımız üzerinden veya e-posta yoluyla teknik ekibimize doğrudan ulaşabilir, destek alabilirsiniz.'
    },
    {
      q: 'İptal ve iade koşullarınız nelerdir?',
      a: 'Tüketici Kanunu kapsamında satın aldığınız dijital hizmet ve basılı yayın paketlerini, yasal süreç olan 7 iş günü içerisinde koşulsuz olarak iade edebilir veya iptal talebinde bulunabilirsiniz.'
    },
    {
      q: '2026 ÖABT Edebiyat ve MEB-AGS dersleri ne zaman başlayacak?',
      a: 'Yeni dönem eğitim gruplarımız ve ders programlarımız 1 Kasım itibarıyla başlayacaktır. Detaylı haftalık ders programı kayıt sonrasında öğrenci panelinizde paylaşılmaktadır.'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <span className="text-muted text-uppercase tracking-wider small fw-bold">Sıkça Sorulan Sorular</span>
        <h1 className="display-6 fw-bold mt-1 text-primary">Aklınıza Takılan Sorular</h1>
        <p className="lead text-muted max-w-2xl mx-auto mt-2">
          Uzaktan eğitim sistemimiz, yayınlarımız, ödeme ve üyelik süreçleri hakkında en sık aldığımız soruların yanıtları.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`${styles.accordionItem} ${activeIndex === idx ? styles.active : ''}`}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion(idx)}>
                  <span className="fw-semibold text-dark text-start">{faq.q}</span>
                  <i className={`bi bi-chevron-${activeIndex === idx ? 'up' : 'down'} ms-2`}></i>
                </button>
                <div className={styles.accordionBody}>
                  <p className="text-muted mb-0">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
