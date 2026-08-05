"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ConfirmModal from "@/components/ConfirmModal";
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  CheckCircle2, 
  Zap, 
  Brain, 
  Target, 
  Shield, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Award,
  Video,
  Eye
} from "lucide-react";
import type { Feature } from "@/generated/prisma/client";

const availableIcons = [
  { name: "Zap", label: "Yıldırım / Hız", icon: Zap },
  { name: "Brain", label: "Beyin / Zeka", icon: Brain },
  { name: "Target", label: "Hedef / Odak", icon: Target },
  { name: "Shield", label: "Kalkan / Güven", icon: Shield },
  { name: "Users", label: "Öğrenciler", icon: Users },
  { name: "GraduationCap", label: "Kep / Mezuniyet", icon: GraduationCap },
  { name: "BookOpen", label: "Kitap / Yayın", icon: BookOpen },
  { name: "Clock", label: "Saat / 7-24", icon: Clock },
  { name: "Award", label: "Ödül / Başarı", icon: Award },
  { name: "Video", label: "Video / Canlı", icon: Video }
];

export default function AdminFeaturesClient({ initialFeatures }: { initialFeatures: Feature[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Zap");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteFeatureId, setDeleteFeatureId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingFeature(null);
    setTitle("");
    setDescription("");
    setIcon("Zap");
    setOrder(features.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f: Feature) => {
    setEditingFeature(f);
    setTitle(f.title);
    setDescription(f.description);
    setIcon(f.icon || "Zap");
    setOrder(f.order);
    setIsActive(f.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = { title, description, icon, order: Number(order), isActive };
      const url = editingFeature ? `/api/admin/features/${editingFeature.id}` : "/api/admin/features";
      const method = editingFeature ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Özellik kaydedilemedi.");
      }

      setIsModalOpen(false);
      showToast(editingFeature ? "Özellik güncellendi!" : "Yeni özellik eklendi!", "success");
      router.refresh();

      // Refresh features list
      const fetchRes = await fetch("/api/admin/features");
      const fetchData = await fetchRes.json();
      if (fetchData.features) setFeatures(fetchData.features);

    } catch (err: any) {
      showToast(err.message || "İşlem başarısız oldu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteFeatureId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/features/${deleteFeatureId}`, { method: "DELETE" });
      if (res.ok) {
        setFeatures(prev => prev.filter(f => f.id !== deleteFeatureId));
        showToast("Özellik silindi.", "info");
        router.refresh();
      } else {
        showToast("Silme işlemi başarısız.", "error");
      }
    } catch (err) {
      showToast("Silme işlemi başarısız.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteFeatureId(null);
    }
  };

  const renderIcon = (iconName?: string | null) => {
    const found = availableIcons.find(i => i.name === iconName);
    const IconComp = found ? found.icon : Zap;
    return <IconComp className="w-6 h-6" />;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Ana Sayfa Özellikleri (Neden Biz?)</h1>
            <p className="text-gray-500 mt-1 font-medium text-sm">Ana sayfada kartlar halinde sergilenen platform avantajlarını düzenleyin.</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yeni Özellik Ekle
        </button>
      </div>

      {/* Live Preview Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-8 rounded-3xl text-white space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-purple-300">Ana Sayfada Görünecek Canlı Önizleme</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full border border-white/10">
            {features.filter(f => f.isActive).length} Aktif Kart
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.filter(f => f.isActive).map((f) => (
            <div key={f.id} className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-3">
              <div className="p-2.5 bg-white/10 rounded-xl text-amber-400 w-fit">
                {renderIcon(f.icon)}
              </div>
              <h4 className="font-bold text-sm text-white">{f.title}</h4>
              <p className="text-xs text-white/70 font-medium leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-base">Tüm Özellik Kartları ({features.length})</h3>
        </div>

        {features.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-2">
            <Sparkles className="w-8 h-8 mx-auto opacity-30" />
            <p className="font-medium">Henüz eklenmiş bir özellik bulunmuyor.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {features.map((f) => (
              <div key={f.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0">
                    {renderIcon(f.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                        Sıra: {f.order}
                      </span>
                      {f.isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                          🟢 Yayında
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                          ⚪ Pasif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{f.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditModal(f)}
                    className="p-2 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteFeatureId(f.id)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900">
                {editingFeature ? "Özelliği Düzenle" : "Yeni Özellik Ekle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-700 uppercase">Özellik Başlığı</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Nokta Atışı KPSS Müfredatı"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-700 uppercase">Açıklama</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Tüm konular çıkmış soru analizleriyle desteklenmiştir."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Icon Picker Grid */}
              <div className="space-y-2">
                <label className="font-extrabold text-gray-700 uppercase">İkon Seçin</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map((ic) => {
                    const IconC = ic.icon;
                    const isSelected = icon === ic.name;
                    return (
                      <button
                        key={ic.name}
                        type="button"
                        onClick={() => setIcon(ic.name)}
                        className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-600/30" 
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                        title={ic.label}
                      >
                        <IconC className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-700 uppercase">Sıralama No</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-700 uppercase">Yayın Durumu</label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="true">🟢 Yayında (Aktif)</option>
                    <option value="false">⚪ Pasif (Gizli)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteFeatureId !== null}
        onClose={() => setDeleteFeatureId(null)}
        onConfirm={handleConfirmDelete}
        title="Özelliği Silmek İstiyor Musunuz?"
        description="Bu özellik kartı ana sayfa vitrininden ve veritabanından tamamen silinecektir."
        isLoading={isDeleting}
      />
    </div>
  );
}
