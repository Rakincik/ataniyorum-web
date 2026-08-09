"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import ConfirmModal from "@/components/ConfirmModal";

type Slider = {
  id: string;
  image: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  isActive: boolean;
  textAlignment: string;
  textPosition: string;
  buttonStyle: string;
  imageFit: string;
  imageZoom: number;
  imagePosition: string;
};

export default function AdminSliderClient() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    order: 0,
    isActive: true,
    textAlignment: "left",
    textPosition: "center",
    buttonStyle: "filled",
    imageFit: "cover",
    imageZoom: 100,
    imagePosition: "center",
  });

  const [uploading, setUploading] = useState(false);
  const [deleteSliderId, setDeleteSliderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/admin/sliders");
      const data = await res.json();
      setSliders(data);
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const form = new FormData();
    form.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert("Dosya yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Lütfen bir görsel yükleyin.");
      return;
    }

    try {
      const url = editingId ? `/api/admin/sliders/${editingId}` : "/api/admin/sliders";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        fetchSliders();
      }
    } catch (error) {
      console.error("Error saving slider:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteSliderId) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/sliders/${deleteSliderId}`, { method: "DELETE" });
      if (res.ok) {
        fetchSliders();
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
    } finally {
      setIsDeleting(false);
      setDeleteSliderId(null);
    }
  };

  const openEditForm = (slider: Slider) => {
    setFormData({
      image: slider.image,
      title: slider.title,
      subtitle: slider.subtitle || "",
      buttonText: slider.buttonText || "",
      buttonLink: slider.buttonLink || "",
      order: slider.order,
      isActive: slider.isActive,
      textAlignment: slider.textAlignment || "left",
      textPosition: slider.textPosition || "center",
      buttonStyle: slider.buttonStyle || "filled",
      imageFit: slider.imageFit || "cover",
      imageZoom: slider.imageZoom ?? 100,
      imagePosition: slider.imagePosition || "center",
    });
    setEditingId(slider.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      image: "",
      title: "",
      subtitle: "",
      buttonText: "",
      buttonLink: "",
      order: 0,
      isActive: true,
      textAlignment: "left",
      textPosition: "center",
      buttonStyle: "filled",
      imageFit: "cover",
      imageZoom: 100,
      imagePosition: "center",
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Slider Yönetimi</h1>
          <p className="text-foreground/60">Ana sayfadaki dönen afişleri buradan düzenleyebilirsiniz.</p>
        </div>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Slider
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6">{editingId ? "Slider Düzenle" : "Yeni Slider Ekle"}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Görsel (Upload)</label>
                    <p className="text-xs text-gray-500 mt-0.5">Önerilen boyut: <span className="font-semibold text-gray-700">1920x800</span> (Geniş Ekran)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <Image src={formData.image} alt="Preview" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                      <ImageIcon className="w-6 h-6 mb-2" />
                      <span className="text-sm">{uploading ? "Yükleniyor..." : "Bilgisayardan Seç (Tıklayın)"}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Başlık (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Alt Başlık (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Buton Yazısı (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={e => setFormData({...formData, buttonText: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Buton Linki (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={e => setFormData({...formData, buttonLink: e.target.value})}
                    placeholder="/course/oabt"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Sıra (Opsiyonel)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Metin Hizalaması</label>
                  <select
                    value={formData.textAlignment}
                    onChange={e => setFormData({...formData, textAlignment: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="left">Sola Hizala</option>
                    <option value="center">Ortala</option>
                    <option value="right">Sağa Hizala</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Metin Dikey Konumu</label>
                  <select
                    value={formData.textPosition}
                    onChange={e => setFormData({...formData, textPosition: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="top">Üst (Top)</option>
                    <option value="center">Orta (Center)</option>
                    <option value="bottom">Alt (Bottom)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Buton Stili</label>
                  <select
                    value={formData.buttonStyle}
                    onChange={e => setFormData({...formData, buttonStyle: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="filled">Dolu Buton</option>
                    <option value="outline">İçi Boş / Çerçeveli</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Görsel Yerleşimi (Fit)</label>
                  <select
                    value={formData.imageFit}
                    onChange={e => setFormData({...formData, imageFit: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="cover">Alanı Kapla (Kırparak Sığdır)</option>
                    <option value="contain">Görseli Sığdır (Kırpmadan Göster)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Yakınlaştırma (Zoom)</label>
                  <select
                    value={formData.imageZoom}
                    onChange={e => setFormData({...formData, imageZoom: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={80}>%80 (Uzaklaştır)</option>
                    <option value={90}>%90 (Uzaklaştır)</option>
                    <option value={100}>%100 (Orijinal)</option>
                    <option value={105}>%105 (Yakınlaştır)</option>
                    <option value={110}>%110 (Yakınlaştır)</option>
                    <option value={115}>%115 (Yakınlaştır)</option>
                    <option value={120}>%120 (Yakınlaştır)</option>
                    <option value={130}>%130 (Yakınlaştır)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Görsel Konum Hizalaması</label>
                  <select
                    value={formData.imagePosition}
                    onChange={e => setFormData({...formData, imagePosition: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="center">Ortala (Center)</option>
                    <option value="top">Üste Hizala (Top)</option>
                    <option value="bottom">Alta Hizala (Bottom)</option>
                    <option value="left">Sola Hizala (Left)</option>
                    <option value="right">Sağa Hizala (Right)</option>
                  </select>
                </div>

                <div className="space-y-1 flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  İptal
                </button>
              </div>
            </form>

            {/* Live Preview Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
                    Canlı Önizleme (Live Preview)
                  </h3>
                  <span className="text-[9px] bg-primary-50 text-primary-600 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Masaüstü Modu</span>
                </div>
                
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-950 border border-gray-200 shadow-md flex items-center justify-center">
                  {formData.image ? (
                    <>
                      {/* Main Image under preview scale */}
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full transition-all duration-300"
                        style={{
                          objectFit: formData.imageFit as any,
                          objectPosition: formData.imagePosition,
                          transform: `scale(${formData.imageZoom / 100})`,
                        }}
                      />
                      
                      {/* Gradient overlay if text is present */}
                      {((formData.title?.trim() && formData.title !== "Atanıyorum Hocam") || formData.subtitle?.trim() || formData.buttonText?.trim()) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10 transition-opacity duration-300" />
                      )}

                      {/* Texts overlay */}
                      <div className={`absolute inset-0 z-20 p-6 flex flex-col text-white select-none ${
                        formData.textPosition === "top" ? "justify-start pt-10" :
                        formData.textPosition === "bottom" ? "justify-end pb-10" :
                        "justify-center"
                      } ${
                        formData.textAlignment === "center" ? "items-center text-center" :
                        formData.textAlignment === "right" ? "items-end text-right" :
                        "items-start text-left"
                      }`}>
                        {formData.title?.trim() && formData.title !== "Atanıyorum Hocam" && (
                          <h4 className="text-sm md:text-base font-bold tracking-tight mb-1 max-w-[90%] leading-tight drop-shadow-md">
                            {formData.title}
                          </h4>
                        )}
                        
                        {formData.subtitle?.trim() && (
                          <p className="text-[10px] text-white/80 max-w-[85%] mb-3 font-medium line-clamp-2">
                            {formData.subtitle}
                          </p>
                        )}
                        
                        {formData.buttonText?.trim() && (
                          <div className={`px-4 py-1.5 text-[9px] font-bold rounded-lg shadow-sm transition-all ${
                            formData.buttonStyle === "outline"
                              ? "bg-transparent border border-white text-white"
                              : "bg-primary-600 text-white"
                          }`}>
                            {formData.buttonText}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-gray-500">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                      <p className="text-xs font-bold">Önizleme için görsel yükleyin</p>
                      <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Görsel yüklediğinizde, uyguladığınız ayarlar anlık olarak burada görüntülenecektir.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : sliders.length === 0 && !isFormOpen ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Henüz slider eklenmemiş</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">Ana sayfada dönecek olan afişleri (slider) eklemek için hemen yeni bir tane oluşturun.</p>
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            İlk Slider'ı Ekle
          </button>
        </div>
      ) : sliders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-sm text-gray-600">Görsel</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Başlık</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Sıra</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Durum</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {sliders.map(slider => (
                <tr key={slider.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="relative w-24 h-12 rounded-md overflow-hidden bg-gray-100">
                      <Image src={slider.image} alt={slider.title} fill className="object-cover" unoptimized />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{slider.title}</div>
                    {slider.subtitle && <div className="text-xs text-foreground/60">{slider.subtitle}</div>}
                  </td>
                  <td className="p-4">{slider.order}</td>
                  <td className="p-4">
                    {slider.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4"/> Aktif</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><XCircle className="w-4 h-4"/> Pasif</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditForm(slider)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteSliderId(slider.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Sil">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Modern Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteSliderId !== null}
        onClose={() => setDeleteSliderId(null)}
        onConfirm={handleConfirmDelete}
        title="Slider'ı Silmek İstiyor Musunuz?"
        description="Bu manşet görseli ana sayfa slider alanından ve veritabanından kalıcı olarak silinecektir."
        isLoading={isDeleting}
      />
    </div>
  );
}
