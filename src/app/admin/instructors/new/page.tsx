"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ImageIcon, Trash2, Check } from "lucide-react";
import { createInstructor } from "../actions";
import { useToast } from "@/context/ToastContext";

const COLOR_OPTIONS = [
  { label: "Mavi", value: "bg-blue-500", bgClass: "bg-blue-500" },
  { label: "Mor", value: "bg-purple-500", bgClass: "bg-purple-500" },
  { label: "Pembe", value: "bg-pink-500", bgClass: "bg-pink-500" },
  { label: "Yeşil", value: "bg-emerald-500", bgClass: "bg-emerald-500" },
  { label: "Turuncu", value: "bg-amber-500", bgClass: "bg-amber-500" },
  { label: "Kırmızı", value: "bg-rose-500", bgClass: "bg-rose-500" },
  { label: "Lacivert", value: "bg-indigo-600", bgClass: "bg-indigo-600" }
];

export default function NewInstructorPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const form = new FormData();
    form.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        showToast("Fotoğraf yüklendi.", "success");
      } else {
        showToast(data.error || "Dosya yüklenirken hata oluştu.", "error");
      }
    } catch (error) {
      showToast("Görsel yüklenirken bir hata oluştu.", "error");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageUrl) {
      showToast("Lütfen eğitmen fotoğrafı yükleyin.", "error");
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      subject: formData.get("subject") as string,
      quote: formData.get("quote") as string,
      description: formData.get("description") as string,
      image: imageUrl,
      color: selectedColor,
      order: Number(formData.get("order") || 0),
      isActive: formData.get("isActive") === "on",
    };

    try {
      await createInstructor(data);
      showToast("Yeni eğitmen başarıyla eklendi.", "success");
      router.push("/admin/instructors");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Bir hata oluştu", "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/instructors" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yeni Eğitmen Ekle</h1>
          <p className="text-sm text-gray-500 mt-1">Sisteme yeni bir eğitmen profili oluşturun.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">İsim Soyisim</label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="Örn: Türker Tola"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Branş / Ünvan</label>
              <input 
                name="subject"
                type="text" 
                required
                placeholder="Örn: Eğitim Bilimleri Uzmanı"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Fotoğraf Upload */}
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Fotoğraf</label>
              <p className="text-xs text-gray-500 mt-0.5">Önerilen boyut: <span className="font-semibold text-gray-700">600x600</span> (Kare Profil Formatı)</p>
            </div>
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                  <img src={imageUrl} alt="Eğitmen" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImageUrl("")} 
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                <span className="text-sm font-medium">{uploading ? "Yükleniyor..." : "Bilgisayardan Fotoğraf Seç (Tıklayın)"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kısa Söz / Slogan</label>
            <input 
              name="quote"
              type="text" 
              placeholder="Örn: Eğitimde sınırları zorlayan..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Detaylı Açıklama</label>
            <textarea 
              name="description"
              rows={4}
              placeholder="Eğitmen hakkında detaylı bilgi..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sıralama (Öncelik)</label>
              <input 
                name="order"
                type="number" 
                defaultValue="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
            
            {/* Görsel Tema Rengi Seçici */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kart Vurgu Rengi</label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-8 h-8 rounded-full ${c.bgClass} flex items-center justify-center text-white transition-transform ${
                      selectedColor === c.value ? "ring-2 ring-offset-2 ring-primary-600 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {selectedColor === c.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Durum</label>
              <label className="flex items-center gap-3 cursor-pointer mt-3">
                <input type="checkbox" name="isActive" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700">Aktif Olarak Göster</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Kaydediliyor...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Eğitmeni Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
