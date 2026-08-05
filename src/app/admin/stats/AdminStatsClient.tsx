"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ConfirmModal from "@/components/ConfirmModal";
import { BarChart3, Plus, Edit, Trash2, X, Save, CheckCircle2, Eye, ShieldCheck } from "lucide-react";
import type { Stat } from "@/generated/prisma/client";

export default function AdminStatsClient({ initialStats }: { initialStats: Stat[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);

  // Form State
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteStatId, setDeleteStatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingStat(null);
    setValue("");
    setLabel("");
    setOrder(stats.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stat: Stat) => {
    setEditingStat(stat);
    setValue(stat.value);
    setLabel(stat.label);
    setOrder(stat.order);
    setIsActive(stat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = { value, label, order: Number(order), isActive };
      const url = editingStat ? `/api/admin/stats/${editingStat.id}` : "/api/admin/stats";
      const method = editingStat ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("İstatistik kaydedilemedi.");
      }

      setIsModalOpen(false);
      showToast(editingStat ? "İstatistik başarıyla güncellendi!" : "Yeni istatistik eklendi!", "success");
      router.refresh();
      
      // Re-fetch stats
      const fetchRes = await fetch("/api/admin/stats");
      const fetchData = await fetchRes.json();
      if (fetchData.stats) setStats(fetchData.stats);

    } catch (err: any) {
      showToast(err.message || "İşlem sırasında hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteStatId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/stats/${deleteStatId}`, { method: "DELETE" });
      if (res.ok) {
        setStats(prev => prev.filter(s => s.id !== deleteStatId));
        showToast("İstatistik silindi.", "info");
        router.refresh();
      } else {
        showToast("Silme işlemi başarısız.", "error");
      }
    } catch (err) {
      showToast("Silme işlemi başarısız.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteStatId(null);
    }
  };

  const activeStats = stats.filter(s => s.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-primary-50 text-primary-600 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">İstatistikler & Güven Bandı</h1>
              <p className="text-xs text-gray-500 font-medium">
                Ana sayfadaki lacivert güven bandında gösterilen başarı rakamlarını yönetin.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Yeni İstatistik Ekle
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-primary-600" />
          Ana Sayfa Canlı Önizleme
        </div>

        <div className="bg-primary-700 text-white rounded-2xl p-4 md:p-6 shadow-md border border-white/10 overflow-x-auto">
          <div className="flex items-center justify-center gap-6 md:gap-12 text-center whitespace-nowrap">
            {activeStats.length === 0 ? (
              <p className="text-xs text-primary-200">Aktif istatistik bulunmuyor.</p>
            ) : (
              activeStats.map((stat, idx) => (
                <div key={stat.id} className="flex items-center gap-6 md:gap-12">
                  <div>
                    <div className="text-xl md:text-2xl font-black">{stat.value}</div>
                    <div className="text-[10px] md:text-xs text-primary-100 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                  {idx < activeStats.length - 1 && (
                    <div className="w-px h-6 bg-white/20"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
              stat.isActive ? "border-gray-100 hover:shadow-md" : "border-gray-200 opacity-60 bg-gray-50"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Sıra: #{stat.order}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {stat.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900 pt-1">{stat.value}</div>
              <div className="text-xs font-bold text-gray-500 uppercase">{stat.label}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleOpenEditModal(stat)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors cursor-pointer"
                title="Düzenle"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteStatId(stat.id)}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full z-10 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-black text-lg text-gray-900">
                {editingStat ? "İstatistiği Düzenle" : "Yeni İstatistik Ekle"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Rakam / Değer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 outline-none"
                  placeholder="Örn: 10.000+ veya %98"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Etiket / Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 outline-none"
                  placeholder="Örn: ÖĞRENCİ veya ATANMA ORANI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sıra No
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded-sm"
                    />
                    <span>Aktif Göster</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Kaydediliyor..." : "İstatistiği Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteStatId !== null}
        onClose={() => setDeleteStatId(null)}
        onConfirm={handleConfirmDelete}
        title="İstatistiği Silmek İstiyor Musunuz?"
        description="Bu sayaç istatistiği ana sayfa vitrininden ve veritabanından kalıcı olarak silinecektir."
        isLoading={isDeleting}
      />
    </div>
  );
}
