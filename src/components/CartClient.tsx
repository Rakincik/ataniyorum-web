"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Ticket, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ShoppingBasket
} from "lucide-react";

export default function CartClient() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ amount: number, code: string, influencer?: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Fetch Cross-Sell recommendations
  useEffect(() => {
    if (cart.length > 0) {
      const productIds = cart.map(item => item.productId);
      fetch("/api/cart/cross-sells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds })
      })
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      })
      .catch(() => {});
    } else {
      setRecommendations([]);
    }
  }, [cart]);

  const rawTotal = getCartTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: rawTotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kupon uygulanamadı.");
      }

      setDiscount({
        amount: data.coupon.discountAmount,
        code: data.coupon.code,
        influencer: data.coupon.influencerName
      });
    } catch (err: any) {
      setCouponError(err.message);
      setDiscount(null);
    } finally {
      setIsApplying(false);
    }
  };

  const finalTotal = Math.max(0, rawTotal - (discount?.amount || 0));

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    
    // Pick primary variant ID for checkout
    const firstItem = cart[0];
    let checkoutUrl = `/checkout/${firstItem.variantId}`;

    const allAddonIds = cart.flatMap(item => item.addons.map(a => a.id));
    if (allAddonIds.length > 0) {
      checkoutUrl += `?addons=${allAddonIds.join(',')}`;
    }

    if (!session) {
      router.push(`/auth/register?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-6 my-8">
        <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBasket className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Sepetiniz Henüz Boş</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm font-medium">
            Sepetinize henüz bir eğitim eklemediniz. Hemen eğitimlerimizi inceleyin ve KPSS hazırlığına başlayın!
          </p>
        </div>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-600/20"
        >
          Eğitimleri İncele <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
            Alışveriş Sepetim
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Sepetinizdeki eğitimleri ve seçenekleri gözden geçirin.
          </p>
        </div>

        <button 
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Sepeti Temizle
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart Items & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {cart.map((item) => {
              const singlePrice = item.basePrice + item.variantPrice + item.addons.reduce((sum, a) => sum + a.price, 0);
              const totalItemPrice = singlePrice * item.quantity;
              const displayImg = item.image && item.image !== "" ? item.image : "/logo.png";

              return (
                <div 
                  key={item.cartItemId}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center p-1">
                      <img 
                        src={displayImg} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/logo.png";
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                        {item.categoryName || "Eğitim"}
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900">{item.title}</h3>
                      <p className="text-xs font-semibold text-gray-600">Paket: {item.variantName}</p>
                      
                      {item.addons.length > 0 && (
                        <div className="pt-1 space-y-1">
                          {item.addons.map((a) => (
                            <div key={a.id} className="text-xs font-semibold text-primary-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                              + {a.name} (+₺{a.price.toLocaleString('tr-TR')})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Quantity & Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 gap-4">
                    <div className="font-black text-xl text-gray-900">
                      ₺{totalItemPrice.toLocaleString('tr-TR')}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CROSS-SELL RECOMMENDATIONS ("BUNU ALANLAR BUNU DA ALDI") */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900 uppercase tracking-wider">Bunu Alanlar Bunu da Aldı</h3>
                <p className="text-xs text-gray-500 font-medium">Sepetinizdeki eğitimlerle en çok tercih edilen tamamlayıcı paketler.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id}
                    className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={rec.image} 
                        alt={rec.title} 
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/logo.png";
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-gray-900 truncate">{rec.title}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold block">{rec.categoryName}</span>
                        <p className="text-xs font-black text-primary-700 mt-0.5">₺{rec.price.toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart({
                          productId: rec.id,
                          productSlug: rec.slug,
                          title: rec.title,
                          image: rec.image,
                          categoryName: rec.categoryName,
                          variantId: rec.variantId,
                          variantName: rec.variantName,
                          basePrice: rec.basePrice,
                          variantPrice: rec.variantPrice,
                          addons: [],
                          quantity: 1
                        });
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-xs flex-shrink-0 cursor-pointer"
                    >
                      + Sepete Ekle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Coupon */}
        <div className="space-y-6">
          
          {/* Coupon Form Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-600" />
              İndirim Kuponu Var mı?
            </h3>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Kupon kodunuzu yazın"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-primary-600 transition-all uppercase"
              />
              <button 
                type="submit"
                disabled={isApplying}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isApplying ? "..." : "Uygula"}
              </button>
            </form>

            {couponError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                {couponError}
              </p>
            )}

            {discount && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Kupon ({discount.code}) Uygulandı
                </span>
                <span>-₺{discount.amount.toLocaleString('tr-TR')}</span>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900">Sipariş Özeti</h3>

            <div className="space-y-3 text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>Ara Toplam</span>
                <span className="font-bold text-gray-900">₺{rawTotal.toLocaleString('tr-TR')}</span>
              </div>

              {discount && (
                <div className="flex justify-between items-center text-green-600 font-bold">
                  <span>İndirim Tutarı</span>
                  <span>-₺{discount.amount.toLocaleString('tr-TR')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Toplam Tutar</span>
                <span className="text-3xl font-black text-primary-600">₺{finalTotal.toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Ödemeye Geç <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-2 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              256-bit SSL İle Güvenli Ödeme
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
