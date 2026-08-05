"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/context/ToastContext";

export default function DeleteProductButton({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Eğitim veritabanından silindi.", "info");
        router.refresh();
      } else {
        const data = await res.json();
        showToast("Hata: " + (data.error || "Silinemedi"), "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu.", "error");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        title="Sil"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eğitimi Silmek İstiyor Musunuz?"
        description={title ? `"${title}" eğitimi ve ilişkili tüm içerikleri veritabanından silinecektir.` : "Bu eğitim ve ilişkili tüm veriler kalıcı olarak silinecektir. Bu işlem geri alınamaz."}
        isLoading={isDeleting}
      />
    </>
  );
}
