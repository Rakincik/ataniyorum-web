"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant, Category, ProductAddon, ProductImage } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

type CourseDetailProduct = Product & {
  category?: Category | null;
  variants: ProductVariant[];
  addons?: ProductAddon[];
  images?: ProductImage[];
  features?: any[];
  imageUrl?: string | null;
};

interface CourseDetailClientProps {
  course: CourseDetailProduct;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    course.variants.length > 0 ? course.variants[0] : null
  );
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart({
      productId: course.id,
      productSlug: course.slug,
      title: course.title,
      image: (course.images && course.images.length > 0) ? course.images[0].url : (course.image || undefined),
      categoryName: course.category?.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      basePrice: course.basePrice,
      variantPrice: selectedVariant.price,
      addons: selectedAddons.map(a => ({ id: a.id, name: a.name, price: a.price })),
      quantity: 1
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };
  
  // Image Gallery State
  const defaultImage = course.image || (course.images && course.images.length > 0 ? course.images[0].url : null);
  const [activeImage, setActiveImage] = useState<string | null>(defaultImage);

  const allImages = [
    ...(course.image ? [{ id: 'cover', url: course.image }] : []),
    ...(course.images || [])
  ];

  const handleCheckout = () => {
    if (!selectedVariant) return;
    let url = `/checkout/${selectedVariant.id}`;
    if (selectedAddons.length > 0) {
      url += `?addons=${selectedAddons.map(a => a.id).join(',')}`;
    }

    if (!session) {
      router.push(`/auth/register?redirect=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  const totalPrice = course.basePrice + (selectedVariant?.price || 0) + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-12">
      {/* Top Header: Title & Desc */}
      <div className="mb-4">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{course.title}</h1>
        <p className="text-lg text-foreground/60 leading-relaxed max-w-4xl">
          {course.description}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column (Images, Video, Content) */}
        <div className="lg:col-span-2 min-w-0 space-y-12">
          
          {/* Image Gallery */}
          <div className="space-y-4 flex flex-col items-center">
            {activeImage ? (
              <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-md bg-white dark:bg-black inline-block">
                <img 
                  src={activeImage} 
                  alt={course.title} 
                  className="max-h-[560px] w-auto h-auto object-contain rounded-3xl" 
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-3xl flex items-center justify-center border border-gray-200">
                <span className="text-gray-400">Görsel Yok</span>
              </div>
            )}
            
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img.url 
                        ? "border-primary-600 opacity-100" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Promo Video */}
          {course.promoVideoUrl && (
            <div className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Örnek Ders Videosu</h2>
              <div className="aspect-video bg-black/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 relative shadow-sm">
                <iframe 
                  src={course.promoVideoUrl} 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Features / Özellikler */}
          {course.features && course.features.length > 0 && (
            <div className="pt-6 border-t border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold mb-6">Bu Eğitimde Neler Var?</h2>
              <ul className="space-y-4">
                {course.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-lg text-foreground/80 leading-relaxed font-medium">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rich Text Content */}
          {course.content && (
            <div className="pt-6 border-t border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold mb-6">Program İçeriği</h2>
              <div 
                className="prose prose-lg dark:prose-invert max-w-none prose-primary [word-break:break-word] overflow-hidden"
                dangerouslySetInnerHTML={{ __html: course.content }}
              />
            </div>
          )}

        </div>

        {/* Right Column (Pricing & Actions) */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 lg:p-8 sticky top-24 shadow-sm border border-gray-200 dark:border-white/10">
            {/* STEP 1: Eğitim Modeli */}
            <h3 className="text-lg font-bold mb-4">1. Eğitim Modeli Seçin:</h3>
            
            <div className="grid grid-cols-1 gap-3 mb-8">
              {course.variants.map((variant) => (
                <label 
                  key={variant.id}
                  className={`relative flex items-center justify-between cursor-pointer rounded-2xl border p-4 transition-all duration-300 transform ${
                    selectedVariant?.id === variant.id 
                      ? "border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-md ring-1 ring-primary-600/20" 
                      : "border-gray-300 bg-white dark:bg-transparent dark:border-white/20 hover:border-gray-400 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <input
                    type="radio"
                    name="variant"
                    className="sr-only"
                    checked={selectedVariant?.id === variant.id}
                    onChange={() => setSelectedVariant(variant)}
                  />
                  <span className={`font-semibold text-sm transition-colors ${selectedVariant?.id === variant.id ? "text-primary-700" : "text-gray-700"}`}>{variant.name}</span>
                  {variant.price > 0 && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                      selectedVariant?.id === variant.id ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-600"
                    }`}>
                      +₺{variant.price.toLocaleString('tr-TR')}
                    </span>
                  )}
                  
                  {selectedVariant?.id === variant.id && (
                    <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-0.5 shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </label>
              ))}
            </div>

            {course.addons && course.addons.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-4">2. Paketinize Ekleyin (İsteğe Bağlı):</h3>
                <div className="space-y-3 mb-8">
                  {course.addons.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <label 
                        key={addon.id}
                        className={`relative flex items-center gap-3 cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                          isSelected 
                            ? "border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-sm" 
                            : "border-gray-300 bg-white dark:bg-transparent dark:border-white/20 hover:border-gray-400 hover:bg-gray-50 shadow-sm"
                        }`}
                      >
                        {/* Toggle Switch */}
                        <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${isSelected ? 'bg-primary-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isSelected ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        
                        <input
                          type="checkbox"
                          name="addon"
                          className="sr-only"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddons([...selectedAddons, addon]);
                            } else {
                              setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
                            }
                          }}
                        />
                        <span className={`font-medium text-sm flex-grow transition-colors leading-tight ${isSelected ? "text-primary-800" : "text-gray-700"}`}>
                          {addon.name}
                        </span>
                        <span className={`font-bold text-xs px-2 py-1 rounded-full transition-colors whitespace-nowrap ${
                          isSelected ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          +₺{addon.price.toLocaleString('tr-TR')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-end mb-6">
                <span className="text-foreground/60 font-medium">Toplam Tutar</span>
                <div className="flex flex-col items-end">
                  {selectedVariant && selectedVariant.price > 0 && (
                    <span className="text-sm text-foreground/40 line-through mb-1 font-medium">
                      ₺{(course.basePrice).toLocaleString('tr-TR')}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary-600 tracking-tight">
                    ₺{totalPrice.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Toast Feedback */}
              {addedToast && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-bounce">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Eğitim başariyla sepetinize eklendi!
                  </span>
                  <button onClick={() => router.push('/cart')} className="underline text-emerald-900 hover:text-emerald-700">
                    Sepete Git &rarr;
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.isStockOut ? (
                  <div className="sm:col-span-2 w-full py-4 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl font-black text-sm text-center shadow-xs flex items-center justify-center gap-2">
                    🔴 Kontenjan Dolmuştur
                  </div>
                ) : course.isFree ? (
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedVariant}
                    className="sm:col-span-2 relative w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-black text-base transition-all duration-300 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 group overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      🎁 Ücretsiz Hemen Katıl (0 TL)
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedVariant}
                      className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-primary-600" />
                      Sepete Ekle
                    </button>

                    <button
                      onClick={handleCheckout}
                      disabled={!selectedVariant}
                      className="relative w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 group overflow-hidden cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        Hemen Al
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-center text-xs font-medium text-foreground/40 mt-4 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                256-bit SSL korumalı
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
