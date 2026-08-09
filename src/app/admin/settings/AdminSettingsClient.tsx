"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Settings, ShieldAlert, Save, UploadCloud, Trash2, Eye, Wrench, CheckCircle2, AlertTriangle, Sparkles, Image as ImageIcon } from "lucide-react";
import MaintenanceView from "@/components/MaintenanceView";

export default function AdminSettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isMaintenance, setIsMaintenance] = useState<boolean>(initialSettings.isMaintenance ?? false);
  const [maintenanceImage, setMaintenanceImage] = useState<string>(initialSettings.maintenanceImage || "");
  const [maintenanceTitle, setMaintenanceTitle] = useState<string>(initialSettings.maintenanceTitle || "Sistemimizde Bakım Yapılmaktadır");
  const [maintenanceDesc, setMaintenanceDesc] = useState<string>(initialSettings.maintenanceDesc || "Sizlere daha iyi bir deneyim sunmak için altyapı güncellemesi yürütüyoruz. Kısa süre içinde tekrar yayında olacağız.");
  const [sliderAspectRatio, setSliderAspectRatio] = useState<string>(initialSettings.sliderAspectRatio || "16:9");
  const [logo, setLogo] = useState<string>(initialSettings.logo || "");
  const [favicon, setFavicon] = useState<string>(initialSettings.favicon || "");
  const [siteTitle, setSiteTitle] = useState<string>(initialSettings.siteTitle || "Atanıyorum Hocam");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "maintenance" | "logo" | "favicon") => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "maintenance") {
          setMaintenanceImage(data.url);
          showToast("Bakım modu afişi yüklendi.", "success");
        } else if (target === "logo") {
          setLogo(data.url);
          showToast("Site logosu yüklendi.", "success");
        } else if (target === "favicon") {
          setFavicon(data.url);
          showToast("Favicon yüklendi.", "success");
        }
      } else {
        showToast(data.error || "Görsel yüklenemedi.", "error");
      }
    } catch (err) {
      showToast("Görsel yüklenirken bir hata oluştu.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isMaintenance,
          maintenanceImage,
          maintenanceTitle,
          maintenanceDesc,
          sliderAspectRatio,
          logo,
          favicon,
          siteTitle
        })
      });

      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.");

      showToast(
        isMaintenance 
          ? "🚨 Bakım Modu AKTİF edildi! Öğrenciler bakım sayfasını görecek." 
          : "🟢 Bakım Modu kapatıldı! Site tekrar tüm kullanıcılara yayında.", 
        isMaintenance ? "info" : "success"
      );

      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Kaydetme sırasında bir hata oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Site & Bakım Modu Ayarları</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium pt-1">
            Siteyi bakıma alabilir, öğrencilerin göreceği bakım ekranını ve afişini özelleştirebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Önizle
          </button>
        </div>
      </div>

      {/* Main Status Card */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
        isMaintenance 
          ? "bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-950/5" 
          : "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-950/5"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl flex-shrink-0 ${
              isMaintenance ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
            }`}>
              {isMaintenance ? <AlertTriangle className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                  isMaintenance ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                  {isMaintenance ? "🔴 BAKIM MODU AKTİF" : "🟢 SİTE YAYINDA"}
                </span>
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mt-2">
                {isMaintenance 
                  ? "Site şu an tüm öğrenciler için kapalı (Bakım Ekranı Gösteriliyor)" 
                  : "Site normal seyrinde yayında. Tüm öğrenciler erişebilir."}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {isMaintenance 
                  ? "Yöneticiler admin paneline ve yönetici işlemlerine erişmeye devam edebilir." 
                  : "Bakım modunu açtığınızda yüklediğiniz özel bakım afişi ve duyuru yazısı gösterilecektir."}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
            <input 
              type="checkbox" 
              checked={isMaintenance} 
              onChange={(e) => setIsMaintenance(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          Temel Site Ayarları
        </h3>

        {/* Site Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Site Başlığı (Tarayıcı Sekme Yazısı)
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="Örn: Atanıyorum Hocam"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
          />
          <p className="text-xs text-gray-400">
            Tarayıcı sekmesinde ve arama motorlarında sitenizin başlığı olarak gösterilir.
          </p>
        </div>

        {/* Logo and Favicon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Site Logosu
              </label>
              <p className="text-xs text-gray-400 mt-0.5">Sitenin sol üst köşesinde ve e-postalarda gösterilecek ana logo.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {logo ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm group bg-black/5">
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Görseli Kaldır"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <span className="text-xs font-medium">Yüklenmedi</span>
                </div>
              )}
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary-300 transition-all">
                <UploadCloud className="w-6 h-6 mb-1 text-primary-500" />
                <span className="text-xs font-bold text-gray-700">Logo Yükle</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} className="hidden" disabled={isUploading} />
              </label>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Site Favicon (Sekme İkonu)
              </label>
              <p className="text-xs text-gray-400 mt-0.5">Tarayıcı sekmesinde site başlığının solunda gösterilecek küçük ikon.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              {favicon ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm group bg-black/5">
                  <img src={favicon} alt="Favicon" className="w-full h-full object-contain p-4" />
                  <button
                    type="button"
                    onClick={() => setFavicon("")}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Görseli Kaldır"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <span className="text-xs font-medium">Yüklenmedi</span>
                </div>
              )}
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary-300 transition-all">
                <UploadCloud className="w-6 h-6 mb-1 text-primary-500" />
                <span className="text-xs font-bold text-gray-700">Favicon Yükle</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "favicon")} className="hidden" disabled={isUploading} />
              </label>
            </div>
          </div>
        </div>

        <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2 pt-4">
          <Wrench className="w-5 h-5 text-primary-600" />
          Bakım Ekranı Özelleştirme
        </h3>

        {/* Maintenance Image Upload */}
        <div className="space-y-2">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Bakım Modu Afişi / Özel Görsel
            </label>
            <p className="text-xs text-gray-400 mt-0.5">
              Bakım esnasında öğrencilerin ekranında ortada gösterilecek olan kampanya veya bilgilendirme görseli.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            {maintenanceImage ? (
              <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm group bg-black/5">
                <img src={maintenanceImage} alt="Bakım Görseli" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setMaintenanceImage("")}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Görseli Kaldır"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="w-full sm:w-64 aspect-video rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                <span className="text-xs font-medium">Görsel Yüklenmedi</span>
              </div>
            )}

            <label className="w-full flex-1 cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary-300 transition-all">
              <UploadCloud className="w-8 h-8 mb-2 text-primary-500" />
              <span className="text-sm font-bold text-gray-700">
                {isUploading ? "Görsel Yükleniyor..." : "Bakım Görseli Yükle (Tıklayın)"}
              </span>
              <span className="text-xs text-gray-400 mt-1">Önerilen: 1920x1080 yatay görsel (PNG, JPG, WEBP)</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "maintenance")} className="hidden" disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Bakım Ekranı Başlığı
          </label>
          <input
            type="text"
            value={maintenanceTitle}
            onChange={(e) => setMaintenanceTitle(e.target.value)}
            placeholder="Örn: Sistemimizde Bakım Yapılmaktadır"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Bakım Ekranı Açıklama Yazısı
          </label>
          <textarea
            rows={3}
            value={maintenanceDesc}
            onChange={(e) => setMaintenanceDesc(e.target.value)}
            placeholder="Örn: Sizlere daha iyi hizmet verebilmek için güncellemeler yapıyoruz."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 outline-none focus:border-primary-600"
          />
        </div>

        <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2 pt-6">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          Ana Sayfa Slider Özelleştirme
        </h3>

        {/* Aspect Ratio Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Slider En-Boy Oranı & Düzeni
          </label>
          <select
            value={sliderAspectRatio}
            onChange={(e) => setSliderAspectRatio(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary-600"
          >
            <option value="16:9">Tam Ekran (16:9 Standardı - Kırpılmasız Afişler İçin)</option>
            <option value="21:9">Sinematik Banner (21:9 İnce Şerit)</option>
            <option value="boxed">Kutulu Tasarım (Kenarları Boş, Yuvarlatılmış Köşeli)</option>
          </select>
          <p className="text-xs text-gray-400">
            * Seçilen oran tüm ana sayfa slider alanında anında uygulanır. Tam ekran formatları yanlarda boşluk bırakmaz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet ve Uygula"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[99999]">
          <div className="absolute top-4 right-4 z-[100000]">
            <button
              onClick={() => setShowPreview(false)}
              className="px-5 py-2.5 bg-white text-gray-900 font-extrabold text-xs rounded-full shadow-2xl hover:bg-gray-100 cursor-pointer"
            >
              ✕ Önizlemeyi Kapat
            </button>
          </div>
          <MaintenanceView 
            image={maintenanceImage} 
            title={maintenanceTitle} 
            desc={maintenanceDesc} 
          />
        </div>
      )}
    </div>
  );
}
