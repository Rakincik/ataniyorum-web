"use client";

import { useState } from "react";
import type { Category } from "@/generated/prisma/client";
import { Plus, Edit2, Trash2, Check, X, ImageIcon, UploadCloud } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import ConfirmModal from "@/components/ConfirmModal";

const COLOR_PRESETS = [
  { label: "Koyu Lacivert", value: "#102a43" },
  { label: "Gece Mavisi", value: "#1e3a8a" },
  { label: "Mor", value: "#581c87" },
  { label: "Zümrüt Yeşil", value: "#064e3b" },
  { label: "Bordo", value: "#881337" },
  { label: "Koyu Amber", value: "#78350f" },
  { label: "Kömür Gri", value: "#18181b" },
];

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Modern Delete Modal State
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Local States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#102a43");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const generateSlug = (text: string) => {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'I': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u'
    };
    return text
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlug(val));
    }
  };

  const openModal = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setColor(category.color || "#102a43");
      setIsFeatured(category.isFeatured);
      setImageUrl(category.image || "");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setColor("#102a43");
      setIsFeatured(false);
      setImageUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

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
      } else {
        alert(data.error || "Dosya yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Explicitly append custom state variables
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("color", color);
    formData.set("image", imageUrl);
    if (isFeatured) {
      formData.set("isFeatured", "on");
    } else {
      formData.delete("isFeatured");
    }
    
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await createCategory(formData);
    }
    
    closeModal();
    window.location.reload();
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategoryId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteCategoryId);
      window.location.reload();
    } catch (err) {
      alert("Kategori silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
      setDeleteCategoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Ana sayfa ve katalogdaki tüm branşları buradan düzenleyebilirsiniz.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-4">Kategori Adı</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-center">Öne Çıkan</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: category.color || '#102a43' }}></div>
                    <span className="font-bold text-gray-900">{category.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-xs font-mono">{category.slug}</td>
                <td className="p-4 text-center">
                  {category.isFeatured ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" /> Evet
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                      <X className="w-3.5 h-3.5" /> Hayır
                    </span>
                  )}
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => openModal(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteCategoryId(category.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Kategoriyi Sil">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Adı *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Eğitim Bilimleri"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL (Slug) *</label>
                <input 
                  type="text" 
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Açıklama</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kategori açıklaması..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tema / Kart Rengi</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input 
                      type="text" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setColor(preset.value)}
                        className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: preset.value }}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">Ana Sayfada Öne Çıkar</span>
                  </label>
                </div>
              </div>

              {/* Görsel Yükleme Alanı */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Kapak / İkon Görseli</label>
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={imageUrl} alt="Kategori Kapak" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
                    <UploadCloud className="w-4 h-4 text-primary-600" />
                    <span>{uploading ? "Yükleniyor..." : "Görsel Seç / Yükle"}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 font-semibold text-xs hover:bg-gray-100 rounded-xl">İptal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white font-semibold text-xs rounded-xl hover:bg-primary-700">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleConfirmDelete}
        title="Kategoriyi Silmek İstiyor Musunuz?"
        description="Bu kategori silindiğinde veritabanından tamamen kaldırılacaktır. Bu işlem geri alınamaz."
        isLoading={isDeleting}
      />
    </div>
  );
}
