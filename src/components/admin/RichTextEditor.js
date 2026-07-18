'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './RichTextEditor.module.css';

export default function RichTextEditor({ value, onChange, label }) {
  const editorRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync initial value to contentEditable on mount
  useEffect(() => {
    if (editorRef.current && isMounted && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isMounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Bağlantı adresini girin (Örn: https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="mb-3">
      {label && <label className="form-label small fw-semibold">{label}</label>}
      
      <div className={styles.editorContainer}>
        {/* Formatting Toolbar */}
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('bold')}
            title="Kalın"
          >
            <i className="bi bi-type-bold"></i>
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('italic')}
            title="İtalik"
          >
            <i className="bi bi-type-italic"></i>
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('underline')}
            title="Altı Çizili"
          >
            <i className="bi bi-type-underline"></i>
          </button>
          <div className={styles.separator}></div>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('insertUnorderedList')}
            title="Madde İşaretli Liste"
          >
            <i className="bi bi-list-task"></i>
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('insertOrderedList')}
            title="Numaralı Liste"
          >
            <i className="bi bi-list-ol"></i>
          </button>
          <div className={styles.separator}></div>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={addLink}
            title="Bağlantı Ekle"
          >
            <i className="bi bi-link-45deg"></i>
          </button>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => executeCommand('removeFormat')}
            title="Biçimlendirmeyi Temizle"
          >
            <i className="bi bi-eraser"></i>
          </button>
        </div>

        {/* contentEditable editor */}
        <div
          ref={editorRef}
          className={styles.editorArea}
          contentEditable
          onInput={handleInput}
          placeholder="İçeriği buraya yazın..."
        ></div>
      </div>
    </div>
  );
}
