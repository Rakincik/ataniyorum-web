'use client';

import React from 'react';
import styles from './Kadro.module.css';

export default function KadroPage() {
  const instructors = [
    {
      name: 'Türker Tola',
      title: 'Eski Türk Dili & Türk Halk Edebiyatı',
      bio: 'Yılların akademik ve sınav hazırlık tecrübesiyle, Türkçe ve Türk Dili ve Edebiyatı ÖABT sınavlarında yüzlerce adayın atanmasına rehberlik etmiştir.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    {
      name: 'Nilüfer Ömeroğlu',
      title: 'Yeni Türk Edebiyatı',
      bio: 'Modern Türk Edebiyatı akımları, roman ve hikaye çözümlemelerinde getirdiği özgün yaklaşımlarla adayların sınavda tam isabet kaydetmesini sağlamaktadır.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    },
    {
      name: 'Dr. İlker Hayat',
      title: 'Divan Edebiyatı',
      bio: 'Klasik Türk Edebiyatı metin şerhleri ve beyit analizlerindeki uzmanlığıyla, ÖABT sınavının en zorlayıcı bölümlerini anlaşılır kılmaktadır.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    },
  ];

  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <span className="text-muted text-uppercase tracking-wider small fw-bold">Eğitim Kadromuz</span>
        <h1 className="display-5 fw-bold mt-1 text-primary">Alanında Uzman Hocalarımız</h1>
        <p className="lead text-muted max-w-2xl mx-auto mt-2">
          Sınav yolculuğunuzda size rehberlik edecek ve en güncel soru formatlarıyla hazırlayacak öğretmen kadromuz.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {instructors.map((ins, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <div className={`${styles.card} h-100 p-4 text-center`}>
              <div className={styles.imgWrapper}>
                <img src={ins.imageUrl} alt={ins.name} className={styles.profileImg} />
              </div>
              <h3 className="fs-4 mt-3 mb-1">{ins.name}</h3>
              <span className={`${styles.title} d-block mb-3`}>{ins.title}</span>
              <p className="text-muted small mb-0">{ins.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
