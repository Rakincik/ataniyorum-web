'use client';

import React, { createContext, useContext, useState } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast List Container */}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} fade-in`}
          >
            <div className="d-flex align-items-center gap-2">
              <i className={
                toast.type === 'success' ? 'bi bi-check-circle-fill' :
                toast.type === 'error' ? 'bi bi-exclamation-triangle-fill' :
                toast.type === 'warning' ? 'bi bi-exclamation-circle-fill' :
                'bi bi-info-circle-fill'
              }></i>
              <span className="small font-weight-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={styles.closeBtn}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
