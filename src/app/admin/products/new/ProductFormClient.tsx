"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Package, 
  Sparkles, 
  Tag, 
  Eye,
  FileText
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import Link from "next/link";
import type { Category, Product, ProductVariant, ProductAddon, ProductImage } from "@/generated/prisma/client";

type ProductWithRelations = Product & {
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  features?: { id: string; name: string; order: number }[];
  images?: ProductImage[];
  crossSellFrom?: { targetProductId: string }[];
};

type ProductFormClientProps = {
  categories: Category[];
  product?: ProductWithRelations | null;
  allProducts?: { id: string; title: string }[];
};

export default function ProductFormClient({ categories, product, allProducts = [] }: ProductFormClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"GENERAL" | "MEDIA" | "PACKAGES" | "CROSS_SELL">("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [content, setContent] = useState(product?.content || "");
  const [basePrice, setBasePrice] = useState(product?.basePrice || 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || "");
  const [coverImage, setCoverImage] = useState(product?.image || "");
  
  // Status & Stock States
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isStockOut, setIsStockOut] = useState(product?.isStockOut ?? false);
  const [isFree, setIsFree] = useState(product?.isFree ?? false);

  // Cross Sell Targets
  const [crossSellTargetIds, setCrossSellTargetIds] = useState<string[]>(
    product?.crossSellFrom?.length ? product.crossSellFrom.map(cs => cs.targetProductId) : []
  );

  // Variants
  const [variants, setVariants] = useState<{ id?: string; name: string; price: number }[]>(
    product?.variants?.length ? product.variants.map(v => ({ id: v.id, name: v.name, price: v.price })) : [{ name: "Online Katılım", price: 0 }]
  );
  
  // Addons
  const [addons, setAddons] = useState<{ id?: string; name: string; price: number }[]>(
    product?.addons?.length ? product.addons.map(a => ({ id: a.id, name: a.name, price: a.price })) : []
  );

  // Features
  const [features, setFeatures] = useState<{ id?: string; name: string }[]>(
    product?.features?.length ? product.features.map(f => ({ id: f.id, name: f.name })) : [
      { name: "Sınav odaklı nokta atışı canlı dersler" },
      { name: "Yıl sonuna kadar sınırsız HD video tekrar hakkı" },
      { name: "İndirilebilir PDF ders notları ve soru bankası" }
    ]
  );

  // Images
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    product?.images?.length ? product.images.map(img => img.url) : []
  );

  // Form State
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Title -> Slug Auto generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto update slug if creating new product or slug is empty
    if (!product || !slug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Variants management
  const addVariant = () => setVariants([...variants, { name: "", price: 0 }]);
  const updateVariant = (index: number, field: "name" | "price", val: any) => {
    const newVariants = [...variants];
    if (field === "name") {
      newVariants[index].name = val as string;
    } else {
      newVariants[index].price = Number(val) || 0;
    }
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      showToast("En az 1 paket varyantı olmak zorundadır.", "error");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Addons management
  const addAddon = () => setAddons([...addons, { name: "", price: 0 }]);
  const updateAddon = (index: number, field: "name" | "price", val: any) => {
    const newAddons = [...addons];
    if (field === "name") {
      newAddons[index].name = val as string;
    } else {
      newAddons[index].price = Number(val) || 0;
    }
    setAddons(newAddons);
  };
  const removeAddon = (index: number) => setAddons(addons.filter((_, i) => i !== index));

  // Features management
  const addFeature = () => setFeatures([...features, { name: "" }]);
  const updateFeature = (index: number, name: string) => {
    const newFeatures = [...features];
    newFeatures[index].name = name;
    setFeatures(newFeatures);
  };
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  // Upload handler
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        if (target === "cover") setCoverImage(data.url);
        else setGalleryUrls([...galleryUrls, data.url]);
        showToast("Görsel yüklendi", "success");
      } else {
        showToast(data.error || "Görsel yüklenemedi", "error");
      }
    } catch (err) {
      showToast("Görsel yüklenirken hata oluştu.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index: number) => setGalleryUrls(galleryUrls.filter((_, i) => i !== index));

  const toggleCrossSell = (targetId: string) => {
    if (crossSellTargetIds.includes(targetId)) {
      setCrossSellTargetIds(crossSellTargetIds.filter(id => id !== targetId));
    } else {
      setCrossSellTargetIds([...crossSellTargetIds, targetId]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !slug || !categoryId) {
      showToast("Lütfen Eğitim Adı ve Kategoriyi doldurun.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title, slug, description, content, basePrice: isFree ? 0 : basePrice, categoryId, promoVideoUrl: null, image: coverImage,
        variants: isFree ? variants.map(v => ({ ...v, price: 0 })) : variants, 
        addons, features, images: galleryUrls, crossSellTargetIds,
        isActive, isStockOut, isFree
      };

      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(product ? "Eğitim başarıyla güncellendi!" : "Yeni eğitim oluşturuldu!", "success");
        router.push("/admin/products");
        router.refresh();
      } else {
        const error = await res.json();
        showToast(error.error || "Eğitim kaydedilemedi.", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Pinned Sticky Control Header Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/products"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Eğitimlere Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">
              {product ? `Eğitimi Düzenle: "${title || product.title}"` : "Yeni Eğitim Ekle Studio"}
            </h1>
            <p className="text-xs text-gray-500 font-medium">Değişiklikleri dilediğiniz an sağdaki butonla kaydedebilirsiniz.</p>
          </div>
        </div>

        {/* Tab Selector Shortcuts */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setTab("GENERAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "GENERAL" ? "bg-white text-primary-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            1. Genel & İçerik
          </button>
          <button
            onClick={() => setTab("MEDIA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "MEDIA" ? "bg-white text-primary-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            2. Görseller
          </button>
          <button
            onClick={() => setTab("PACKAGES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "PACKAGES" ? "bg-white text-primary-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            3. Paketler & Ekler ({variants.length})
          </button>
          <button
            onClick={() => setTab("CROSS_SELL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "CROSS_SELL" ? "bg-white text-primary-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            4. Çapraz Satış ({crossSellTargetIds.length})
          </button>
        </div>

        {/* Action Save Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>

      {/* Main Studio Viewport */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8">
        
        {/* TAB 1: GENERAL INFO & RICH TEXT */}
        {tab === "GENERAL" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Status Toggles Bar */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Eğitim Satış & Kontenjan Ayarları</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  isActive ? "bg-emerald-50/80 border-emerald-300 text-emerald-900" : "bg-gray-100 border-gray-300 text-gray-600"
                }`}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-emerald-600 cursor-pointer" />
                  <div>
                    <span className="text-xs font-bold block">{isActive ? "🟢 Yayında (Satışta)" : "⚪ Pasif (Gizli)"}</span>
                    <span className="text-[10px] text-gray-500 block font-medium">Sitede gösterilsin mi?</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  isStockOut ? "bg-rose-50/80 border-rose-300 text-rose-900" : "bg-white border-gray-200 text-gray-700"
                }`}>
                  <input type="checkbox" checked={isStockOut} onChange={(e) => setIsStockOut(e.target.checked)} className="w-4 h-4 accent-rose-600 cursor-pointer" />
                  <div>
                    <span className="text-xs font-bold block">{isStockOut ? "🔴 Kontenjan Doldu" : "🟢 Kontenjan Açık"}</span>
                    <span className="text-[10px] text-gray-500 block font-medium">Satış butonunu kapat</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  isFree ? "bg-purple-50/80 border-purple-300 text-purple-900" : "bg-white border-gray-200 text-gray-700"
                }`}>
                  <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 accent-purple-600 cursor-pointer" />
                  <div>
                    <span className="text-xs font-bold block">{isFree ? "🎁 Ücretsiz Paket (0 TL)" : "💳 Ücretli Paket"}</span>
                    <span className="text-[10px] text-gray-500 block font-medium">Shopier'ı atla (0 TL)</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase">Eğitim Adı</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={handleTitleChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500" 
                  placeholder="Örn: 2026 KPSS Eğitim Bilimleri" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase">Kategori</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase">SEO URL (Slug)</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-mono font-semibold text-gray-600 outline-none" 
                  placeholder="2026-kpss-egitim" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase">Taban Fiyat (₺)</label>
                <input 
                  type="number" 
                  disabled={isFree}
                  value={isFree ? 0 : (basePrice === 0 ? "" : basePrice)} 
                  onChange={(e) => setBasePrice(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)} 
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase">Kısa Açıklama (Kart Metni)</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={2} 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 resize-none" 
                placeholder="Eğitim kartında görünecek kısa açıklama..." 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase">Detaylı İçerik (Eğitim Sayfasında Görünecek Açıklama)</label>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <RichTextEditor 
                  value={content} 
                  onChange={setContent} 
                  placeholder="Eğitim içeriğini ve öğrencilere sunulan imkanları yazın..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA & GALLERY */}
        {tab === "MEDIA" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 mb-1">Kapak Görseli</h3>
              <p className="text-xs text-gray-500">Ana sayfa ve kurs kartlarında görünecek ana kapak görseli. (Önerilen: 1920x1080)</p>
              
              <div className="mt-4 flex items-start gap-6">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}>
                  <ImageIcon className="w-4 h-4" />
                  {isUploading ? "Yükleniyor..." : "Kapak Görseli Seç"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "cover")} disabled={isUploading} />
                </label>

                {coverImage && (
                  <div className="relative w-72 aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={coverImage} alt="Kapak" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setCoverImage("")} 
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur text-rose-600 p-1.5 rounded-xl shadow-xs hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 mb-1">Görsel Galerisi</h3>
                <p className="text-xs text-gray-500">Kurs detay sayfasında kaydırarak inceleyecekleri ilave ders/materyal görselleri.</p>
              </div>

              <div className="flex items-center gap-4">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'}`}>
                  <Plus className="w-4 h-4" />
                  Galeriye Görsel Ekle
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "gallery")} disabled={isUploading} />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group shadow-xs">
                    <img src={url} alt={`Galeri ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur text-rose-600 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VARIANTS & ADDONS */}
        {tab === "PACKAGES" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Left: Variants */}
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-600" />
                    Paket Varyantları (Katılım Seçenekleri)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Örn: "Online Katılım" (+₺0), "Hibrit Katılım" (+₺1.500)</p>
                </div>
                <button 
                  type="button" 
                  onClick={addVariant}
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Varyant Ekle
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
                    <input 
                      type="text" 
                      value={v.name} 
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      placeholder="Paket Adı (Örn: Canlı + Video)"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="w-32 flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-400">₺</span>
                      <input 
                        type="number" 
                        disabled={isFree}
                        value={isFree ? 0 : (v.price === 0 ? "" : v.price)} 
                        onChange={(e) => updateVariant(i, "price", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeVariant(i)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Addons */}
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    Ek Hizmetler (İsteğe Bağlı Paket Seçenekleri)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Örn: "Basılı Soru Bankası Seti Kargo" (+₺450)</p>
                </div>
                <button 
                  type="button" 
                  onClick={addAddon}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Ek Hizmet Ekle
                </button>
              </div>

              <div className="space-y-3">
                {addons.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium py-4 text-center">Ek hizmet tanımlanmadı.</p>
                ) : (
                  addons.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
                      <input 
                        type="text" 
                        value={a.name} 
                        onChange={(e) => updateAddon(i, "name", e.target.value)}
                        placeholder="Ek Hizmet Adı (Örn: Kargo Seti)"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="w-32 flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-400">₺</span>
                        <input 
                          type="number" 
                          value={a.price === 0 ? "" : a.price} 
                          onChange={(e) => updateAddon(i, "price", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAddon(i)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURES & CROSS SELL */}
        {tab === "CROSS_SELL" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Left: Features Checklist */}
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Öne Çıkan Özellik Maddeleri (Kart Tıkları)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Kurs kartında yeşil tik ikonu ile çıkacak kısa özellikler.</p>
                </div>
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Madde Ekle
                </button>
              </div>

              <div className="space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <input 
                      type="text" 
                      value={f.name} 
                      onChange={(e) => updateFeature(i, e.target.value)}
                      placeholder="Örn: 7/24 Rehberlik ve Canlı Destek"
                      className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeFeature(i)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cross-Sell Selector */}
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Çapraz Satış Önerileri ("Bunu Alanlar Bunu Da Aldı")
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Bu eğitim sepete eklendiğinde altında tavsiye edilecek diğer paketler.</p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {allProducts
                  .filter(p => p.id !== product?.id)
                  .map((p) => {
                    const isSelected = crossSellTargetIds.includes(p.id);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => toggleCrossSell(p.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                          isSelected 
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs" 
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="line-clamp-1">{p.title}</span>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
