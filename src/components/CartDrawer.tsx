"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  ShoppingBasket,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

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

  if (!isCartOpen) return null;

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  const handleCheckout = () => {
    closeCart();
    if (cart.length === 0) return;

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

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dark Overlay */}
      <div 
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900">Alışveriş Sepetim</h2>
              <p className="text-[11px] font-semibold text-gray-400">({cartCount} Eğitim)</p>
            </div>
          </div>

          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <ShoppingBasket className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">Sepetiniz Boş</h3>
                <p className="text-xs text-gray-400">Henüz bir eğitim eklemediniz.</p>
              </div>
              <button 
                onClick={closeCart}
                className="px-6 py-2.5 bg-primary-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-primary-700 transition-colors"
              >
                Eğitimleri İncele
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => {
                const singlePrice = item.basePrice + item.variantPrice + item.addons.reduce((sum, a) => sum + a.price, 0);
                const totalItemPrice = singlePrice * item.quantity;
                const displayImg = item.image && item.image !== "" ? item.image : "/logo.png";

                return (
                  <div key={item.cartItemId} className="pt-4 first:pt-0 flex items-start gap-3">
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center p-1">
                      <img 
                        src={displayImg} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/logo.png";
                        }} 
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                      <h4 className="font-extrabold text-xs text-gray-900 leading-snug">{item.title}</h4>
                      <p className="text-[11px] font-medium text-gray-500">Paket: {item.variantName}</p>

                      {item.addons.length > 0 && (
                        <div className="text-[10px] text-primary-700 font-semibold space-y-0.5">
                          {item.addons.map(a => (
                            <div key={a.id}>+ {a.name}</div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="px-1.5 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="px-1.5 py-1 hover:bg-gray-200 text-gray-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-gray-900">
                            ₺{totalItemPrice.toLocaleString('tr-TR')}
                          </span>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CROSS-SELL RECOMMENDATIONS ("BUNU ALANLAR BUNU DA ALDI") */}
              {recommendations.length > 0 && (
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Bunu Alanlar Bunu da Aldı
                  </div>

                  <div className="space-y-2.5">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id}
                        className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={rec.image} 
                            alt={rec.title} 
                            className="w-12 h-12 rounded-xl object-cover border border-amber-200/80 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.png";
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-gray-900 truncate">{rec.title}</h5>
                            <p className="text-[11px] font-black text-primary-700">₺{rec.price.toLocaleString('tr-TR')}</p>
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
                          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[11px] font-black whitespace-nowrap transition-colors shadow-xs flex-shrink-0 cursor-pointer"
                        >
                          + Ekle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-600">Toplam Tutar</span>
              <span className="font-black text-2xl text-primary-600">₺{cartTotal.toLocaleString('tr-TR')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/cart"
                onClick={closeCart}
                className="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 rounded-xl font-bold text-xs text-center transition-all shadow-xs"
              >
                Sepete Git
              </Link>
              <button 
                onClick={handleCheckout}
                className="py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs text-center transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                Ödemeye Geç <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] text-gray-400 font-medium text-center flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> %100 Güvenli Ödeme & SSL
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
