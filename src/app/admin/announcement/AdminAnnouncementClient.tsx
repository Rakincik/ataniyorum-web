"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Megaphone, Save, CheckCircle2, Sparkles, Globe, Link2, Eye } from "lucide-react";
import type { Announcement } from "@/generated/prisma/client";

export default function AdminAnnouncementClient({ initialData }: { initialData: Announcement }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [text, setText] = useState(initialData.text || "");
  const [linkText, setLinkText] = useState(initialData.linkText || "");
  const [linkUrl, setLinkUrl] = useState(initialData.linkUrl || "");
  const [isActive, setIsActive] = useState(initialData.isActive);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          linkText,
          linkUrl,
          isActive
        })
      });

      if (!res.ok) {
        throw new Error("Duyuru güncellenemedi.");
      }

      showToast("Duyuru bandı başarıyla güncellendi!", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Güncelleme sırasında hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-primary-50 text-primary-600 rounded-2xl">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Üst Duyuru Bandı Yönetimi</h1>
              <p className="text-xs text-gray-500 font-medium">
                Sitenin en üstünde yer alan Apple tarzı duyuru ve kampanya yazısını düzenleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isActive ? "Duyuru Aktif" : "Duyuru Pasif"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-primary-600" />
          Canlı Önizleme (Sitede Nasıl Görünecek?)
        </div>

        {isActive ? (
          <div className="bg-[#f5f5f7] py-3.5 px-6 rounded-2xl border border-gray-200 text-center shadow-xs">
            <p className="text-xs sm:text-sm font-semibold text-[#1d1d1f]">
              {text || "Duyuru metniniz buraya gelecek..."}
              {linkText && (
                <span className="text-primary-600 font-bold hover:underline ml-1 inline-flex items-center gap-1 cursor-pointer">
                  {linkText} <span className="text-[10px]">⊕</span>
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs font-bold text-gray-400">
            🚫 Duyuru bandı şu an pasif durumda (Sitede gizli).
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">

        <div className="space-y-2">
          <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-600" />
            Duyuru / Kampanya Metni <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
            placeholder="Örn: Şimdi 2026 KPSS ÖABT eğitimlerini erken kayıt fiyatlarıyla satın alabilirsiniz."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Link Etiketi (Buton Metni)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
              placeholder="Örn: Daha fazla bilgi veya İncele"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary-600" />
              Yönlendirilecek Hedef Link (URL)
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
              placeholder="Örn: /#courses veya /course/2026-tarih"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Kaydediliyor..." : "Duyuru Ayarlarını Kaydet"}
        </button>
      </form>
    </div>
  );
}
