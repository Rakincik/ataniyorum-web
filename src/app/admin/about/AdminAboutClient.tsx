"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { BookOpen, Save, CheckCircle2, Eye, User, Sparkles, Target, Award, ImageIcon, UploadCloud, Trash2 } from "lucide-react";
import type { AboutPage } from "@/generated/prisma/client";

export default function AdminAboutClient({ initialData }: { initialData: AboutPage }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    badgeText: initialData.badgeText || "2026 Sezonu Başlıyor",
    title: initialData.title || "Geleceğinize Açılan Kapı: Atanıyorum Hocam",
    subtitle: initialData.subtitle || "",
    stat1Value: initialData.stat1Value || "10+",
    stat1Label: initialData.stat1Label || "Uzman Eğitmen",
    stat2Value: initialData.stat2Value || "500+",
    stat2Label: initialData.stat2Label || "Saat Video",
    stat3Value: initialData.stat3Value || "%95",
    stat3Label: initialData.stat3Label || "Memnuniyet",
    stat4Value: initialData.stat4Value || "7/24",
    stat4Label: initialData.stat4Label || "Rehberlik",
    founderName: initialData.founderName || "Türker Tola",
    founderTitle: initialData.founderTitle || "Kurucu & Eğitim Koordinatörü",
    founderQuote: initialData.founderQuote || "",
    founderImage: initialData.founderImage || "",
    missionTitle: initialData.missionTitle || "Misyonumuz",
    missionDesc: initialData.missionDesc || "",
    visionTitle: initialData.visionTitle || "Vizyonumuz",
    visionDesc: initialData.visionDesc || ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFounder, setUploadingFounder] = useState(false);

  const handleFounderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    setUploadingFounder(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, founderImage: data.url }));
        showToast("Kurucu fotoğrafı yüklendi.", "success");
      } else {
        showToast(data.error || "Görsel yüklenemedi.", "error");
      }
    } catch (err) {
      showToast("Görsel yüklenirken bir hata oluştu.", "error");
    } finally {
      setUploadingFounder(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      showToast("Hakkımızda sayfası başarıyla güncellendi!", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Güncelleme sırasında bir hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3.5 bg-primary-50 text-primary-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">"Hakkımızda" Sayfası Yönetimi</h1>
            <p className="text-xs text-gray-500 font-medium">
              Sitedeki Hakkımızda sayfasının başlıklarını, sayaçlarını ve kurucu mesajını düzenleyin.
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-primary-600" />
          Canlı Sayfa Üst Alan Önizleme
        </div>

        <div className="bg-gray-50 p-6 md:p-10 rounded-2xl border border-gray-200 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-bold uppercase tracking-wider">
            ● {formData.badgeText}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {formData.title}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            {formData.subtitle}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xl font-extrabold text-gray-900">{formData.stat1Value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{formData.stat1Label}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xl font-extrabold text-gray-900">{formData.stat2Value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{formData.stat2Label}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xl font-extrabold text-gray-900">{formData.stat3Value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{formData.stat3Label}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xl font-extrabold text-gray-900">{formData.stat4Value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{formData.stat4Label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Hero Titles */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            1. Hero (Üst Karşılama) Alanı
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Üst Etiket (Rozet)
              </label>
              <input
                type="text"
                name="badgeText"
                value={formData.badgeText}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ana Başlık
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Alt Açıklama Metni
              </label>
              <textarea
                name="subtitle"
                rows={3}
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Hero Stats */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            2. Hero Rakam & Sayaç Kartları (4 Adet)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400">Kart 1</span>
              <input type="text" name="stat1Value" value={formData.stat1Value} onChange={handleChange} placeholder="Rakam (Örn: 10+)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <input type="text" name="stat1Label" value={formData.stat1Label} onChange={handleChange} placeholder="Etiket (Örn: Uzman Eğitmen)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400">Kart 2</span>
              <input type="text" name="stat2Value" value={formData.stat2Value} onChange={handleChange} placeholder="Rakam (Örn: 500+)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <input type="text" name="stat2Label" value={formData.stat2Label} onChange={handleChange} placeholder="Etiket (Örn: Saat Video)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400">Kart 3</span>
              <input type="text" name="stat3Value" value={formData.stat3Value} onChange={handleChange} placeholder="Rakam (Örn: %95)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <input type="text" name="stat3Label" value={formData.stat3Label} onChange={handleChange} placeholder="Etiket (Örn: Memnuniyet)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400">Kart 4</span>
              <input type="text" name="stat4Value" value={formData.stat4Value} onChange={handleChange} placeholder="Rakam (Örn: 7/24)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <input type="text" name="stat4Label" value={formData.stat4Label} onChange={handleChange} placeholder="Etiket (Örn: Rehberlik)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>
          </div>
        </div>

        {/* Section 3: Founder */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            3. Kurucu & Mesajı Bölümü
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kurucu Adı Soyadı
              </label>
              <input
                type="text"
                name="founderName"
                value={formData.founderName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kurucu Unvanı
              </label>
              <input
                type="text"
                name="founderTitle"
                value={formData.founderTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Kurucu Fotoğrafı
            </label>
            <div className="flex items-center gap-4 pt-1">
              {formData.founderImage ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm group">
                  <img src={formData.founderImage} alt="Kurucu Fotoğrafı" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, founderImage: "" }))}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Fotoğrafı Kaldır"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-gray-400 opacity-50" />
                </div>
              )}

              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary-300 transition-all">
                <UploadCloud className="w-6 h-6 mb-1 text-primary-500" />
                <span className="text-xs font-bold text-gray-700">
                  {uploadingFounder ? "Fotoğraf Yükleniyor..." : "Kurucu Fotoğrafı Seç (Tıklayın)"}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG veya WEBP formatında profil fotoğrafı</span>
                <input type="file" accept="image/*" onChange={handleFounderImageUpload} className="hidden" disabled={uploadingFounder} />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Kurucu Mesajı / Sözü
            </label>
            <textarea
              name="founderQuote"
              rows={4}
              value={formData.founderQuote}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 outline-none focus:border-primary-600"
            />
          </div>
        </div>

        {/* Section 4: Mission & Vision */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            4. Misyon & Vizyon Kartları
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Misyon Kartı</span>
              <input type="text" name="missionTitle" value={formData.missionTitle} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <textarea name="missionDesc" rows={3} value={formData.missionDesc} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Vizyon Kartı</span>
              <input type="text" name="visionTitle" value={formData.visionTitle} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold" />
              <textarea name="visionDesc" rows={3} value={formData.visionDesc} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Kaydediliyor..." : "Hakkımızda Tüm Ayarlarını Kaydet"}
        </button>
      </form>
    </div>
  );
}
