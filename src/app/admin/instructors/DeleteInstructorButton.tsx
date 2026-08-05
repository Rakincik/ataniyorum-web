"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInstructor } from "./actions";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/context/ToastContext";

export default function DeleteInstructorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInstructor(id);
      showToast(`${name} kadrodan silindi.`, "info");
      router.refresh();
    } catch (error) {
      showToast("Eğitmen silinirken hata oluştu.", "error");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        title="Eğitmeni Sil"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eğitmeni Silmek İstiyor Musunuz?"
        description={`"${name}" isimli eğitmen profili kadromuz listesinden ve veritabanından kalıcı olarak silinecektir.`}
        isLoading={isDeleting}
      />
    </>
  );
}
