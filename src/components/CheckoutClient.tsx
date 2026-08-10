"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Ticket, Lock, UserCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Product, ProductVariant, ProductAddon, ProductImage } from "@/generated/prisma/client";

type CheckoutClientProps = {
  course: Product & { images?: ProductImage[], category?: { name: string } };
  variant: ProductVariant;
  selectedAddons: ProductAddon[];
};

export default function CheckoutClient({ course, variant, selectedAddons }: CheckoutClientProps) {
  const { data: session } = useSession();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ amount: number, code: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  const rawTotal = course.basePrice + variant.price + selectedAddons.reduce((sum, a) => sum + a.price, 0);
  
  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplying(true);
    setError("");
    
    try {
      if (couponCode.toUpperCase() === "HOCAM20") {
        setDiscount({ amount: rawTotal * 0.2, code: "HOCAM20" });
      } else if (couponCode.toUpperCase() === "INDIRIM100") {
        setDiscount({ amount: 100, code: "INDIRIM100" });
      } else {
        setError("Geçersiz veya süresi dolmuş kupon kodu.");
      }
    } catch (err) {
      setError("Kupon uygulanamadı.");
    } finally {
      setIsApplying(false);
    }
  };

  const finalPrice = Math.max(0, rawTotal - (discount?.amount || 0));
  const displayImage = course.images?.[0]?.url || course.image;

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      alert("Lütfen önce öğrenci hesabınızla giriş yapın veya kayıt olun.");
      return;
    }

    const redirectUrl = variant.shopierUrl || (course as any).shopierUrl;
    if (redirectUrl) {
      setIsProcessing(true);
      window.location.href = redirectUrl;
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          addonIds: selectedAddons.map(a => a.id),
          couponCode: discount?.code || couponCode
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ödeme oluşturulamadı.");
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.freeSuccess) {
          window.location.href = `/checkout/success?orderId=${data.orderId}`;
          return;
        }
      }

      const html = await res.text();
      document.open();
      document.write(html);
      document.close();
    } catch (err: any) {
      alert(err.message || "Ödeme başlatılırken bir hata oluştu.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
      {/* Left Column: Order Summary */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Özet ve Ödeme</h1>
          <p className="text-foreground/60">Siparişinizi tamamlamak için bilgileri kontrol edin.</p>
        </div>

        {!session && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Öğrenci Girişi Yapılmadı</h4>
                <p className="text-xs text-gray-600 font-medium">Satın alma yapmak ve içeriklere erişmek için hesap açmalısınız.</p>
              </div>
            </div>
            <Link 
              href={`/auth/register?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`}
              className="px-5 py-2.5 bg-primary-600 text-white font-bold text-xs rounded-xl hover:bg-primary-700 transition-colors text-center whitespace-nowrap"
            >
              30 Sn'de Ücretsiz Kayıt Ol
            </Link>
          </div>
        )}

        <div className="glass p-6 md:p-8 rounded-3xl space-y-8">
          <div className="flex gap-6 items-start border-b border-gray-200 dark:border-white/10 pb-8">
            <div className="w-32 h-24 bg-gray-100 dark:bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10">
              {displayImage ? (
                <img src={displayImage} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-foreground/50">{course.category?.name || "Eğitim"}</span>
              )}
            </div>
            <div className="flex-grow pt-1">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md mb-2 inline-block">
                {course.category?.name || "Kategori"}
              </span>
              <h3 className="font-bold text-xl">{course.title}</h3>
              <p className="text-foreground/60 text-sm mt-2 font-medium">Paket: {variant.name}</p>
              
              {selectedAddons.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedAddons.map(a => (
                    <div key={a.id} className="text-xs text-foreground/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-purple-50/20 dark:bg-purple-900/10 p-2 rounded-xl border border-purple-100/20">
                      <p className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                        + {a.name} (₺{a.price.toLocaleString('tr-TR')})
                      </p>
                      {(a as any).shopierUrl && (
                        <a 
                          href={(a as any).shopierUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[10px] font-bold transition-all text-center whitespace-nowrap cursor-pointer"
                        >
                          Ek Hizmeti Shopier'den Al ➔
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center text-foreground/70 font-medium text-lg">
              <span>Ara Toplam</span>
              <span>₺{rawTotal.toLocaleString('tr-TR')}</span>
            </div>
            
            {discount && (
              <div className="flex justify-between items-center text-green-600 font-semibold text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> İndirim ({discount.code})</span>
                <span>-₺{discount.amount.toLocaleString('tr-TR')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-2xl font-black pt-6 border-t border-gray-200 dark:border-white/10">
              <span>Ödenecek Tutar</span>
              <span className="text-primary-600">₺{finalPrice.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-3xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary-600" />
            İndirim Kuponunuz Var Mı?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Örn: HOCAM20"
                className="w-full pl-5 pr-4 py-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase font-medium placeholder:normal-case placeholder:font-normal placeholder:text-foreground/40"
              />
            </div>
            <button
              onClick={applyCoupon}
              disabled={isApplying || !couponCode}
              className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
            >
              Kuponu Uygula
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
          {discount && <p className="text-green-600 text-sm mt-3 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Kupon başarıyla uygulandı!</p>}
        </div>
      </div>

      {/* Right Column: User Info & Payment Button */}
      <div>
        <div className="glass rounded-3xl p-8 sticky top-32">
          <h3 className="text-xl font-bold mb-6">Ödeme Adımı</h3>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Ödeme işlemine devam ettiğinizde 256-bit SSL korumalı <strong className="text-foreground/80">güvenli ödeme</strong> sayfasına yönlendirileceksiniz. Kredi kartı bilgileriniz sistemimizde kesinlikle tutulmaz.
          </p>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="relative w-full py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 group mb-4 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              {isProcessing ? "Shopier'e Yönlendiriliyor..." : "Güvenli Ödeme Yap"}
              {!isProcessing && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-foreground/40 text-xs">
            <span>SSL Korumalı Güvenli Ödeme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
