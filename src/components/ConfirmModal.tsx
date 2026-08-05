"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Silmek İstediğinize Emin Misiniz?",
  description = "Bu işlem veritabanından kalıcı olarak silinecektir. Geri alınamaz.",
  confirmText = "Evet, Sil",
  cancelText = "Vazgeç",
  isLoading = false,
  variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xs ${
          variant === "danger" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
        }`}>
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-3 px-4 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
              variant === "danger" 
                ? "bg-rose-600 hover:bg-rose-700" 
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
