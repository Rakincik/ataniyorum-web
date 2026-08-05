"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { 
  Tag, Plus, Trash2, Search, Percent, DollarSign, Calendar, 
  ShoppingBag, CheckCircle2, Clock, XCircle, Copy, AlertCircle, Check, X, Filter, Layers, Users, Sparkles, TrendingUp
} from "lucide-react";

type ProductOption = {
  id: string;
  title: string;
};

type CouponData = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minCartValue?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  productId?: string | null;
  product?: { title: string } | null;
  expiresAt?: string | null;
  influencerName?: string | null;
  commissionType?: "PERCENTAGE" | "FIXED" | null;
  commissionValue?: number | null;
  createdAt: string;
};

export default function AdminCouponsClient({ 
  initialCoupons, 
  products 
}: { 
  initialCoupons: CouponData[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponData[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScope, setFilterScope] = useState<"ALL" | "GENERAL" | "PRODUCT_SPECIFIC" | "INFLUENCER">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<"GENERAL" | "PRODUCT">("GENERAL");
  const [productId, setProductId] = useState("");
  const [minCartValue, setMinCartValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Influencer Tracking State
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [influencerName, setInfluencerName] = useState("");
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [commissionValue, setCommissionValue] = useState("");

  // Modern Delete Modal State
  const [deleteCoupon, setDeleteCoupon] = useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats
  const totalCoupons = coupons.length;
  const generalCouponsCount = coupons.filter(c => !c.productId).length;
  const productCouponsCount = coupons.filter(c => c.productId).length;
  const influencerCoupons = coupons.filter(c => c.influencerName);
  const influencerCouponsCount = influencerCoupons.length;

  // Calculate Total Influencer Commission Payable
  const totalInfluencerEarnings = influencerCoupons.reduce((sum, c) => {
    if (!c.commissionValue) return sum;
    if (c.commissionType === "FIXED") {
      return sum + (c.usedCount * c.commissionValue);
    } else {
      // Estimated percentage earnings (based on average base price estimate or actual usage)
      return sum + (c.usedCount * (c.value * (c.commissionValue / 100) * 10)); // approximate estimate
    }
  }, 0);

  const resetForm = () => {
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setScope("GENERAL");
    setProductId("");
    setMinCartValue("");
    setUsageLimit("");
    setExpiresAt("");
    setIsInfluencer(false);
    setInfluencerName("");
    setCommissionType("PERCENTAGE");
    setCommissionValue("");
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      alert("Lütfen kupon kodu ve indirim değerini girin.");
      return;
    }

    if (scope === "PRODUCT" && !productId) {
      alert("Lütfen kuponun geçerli olacağı eğitimi seçin.");
      return;
    }

    if (isInfluencer && (!influencerName || !commissionValue)) {
      alert("Lütfen Influencer adını ve komisyon değerini doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code,
        type,
        value: Number(value),
        minCartValue: minCartValue ? Number(minCartValue) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        productId: scope === "PRODUCT" ? productId : null,
        expiresAt: expiresAt || null,
        influencerName: isInfluencer ? influencerName : null,
        commissionType: isInfluencer ? commissionType : null,
        commissionValue: isInfluencer ? Number(commissionValue) : null,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        router.refresh();
        setCoupons([data.coupon, ...coupons]);
      } else {
        alert(data.error || "Kupon oluşturulurken hata oluştu.");
      }
    } catch (error) {
      alert("Bir sunucu hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCoupon) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/coupons/${deleteCoupon.id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== deleteCoupon.id));
        router.refresh();
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    } finally {
      setIsDeleting(false);
      setDeleteCoupon(null);
    }
  };

  // Filter logic
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.product?.title && c.product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.influencerName && c.influencerName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterScope === "GENERAL" && c.productId) return false;
    if (filterScope === "PRODUCT_SPECIFIC" && !c.productId) return false;
    if (filterScope === "INFLUENCER" && !c.influencerName) return false;

    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Kupon & Influencer Yönetimi</h1>
              <p className="text-gray-500 mt-1 font-medium">Genel sepet, eğitime özel indirim kuponları ve Influencer/İş Ortaklığı hakediş takibi.</p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Kupon Ekle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalCoupons}</div>
            <div className="text-xs text-gray-500 font-medium">Toplam Kupon</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-600">{influencerCouponsCount}</div>
            <div className="text-xs text-gray-500 font-medium">Influencer Kuponu</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-green-600">
              ₺{totalInfluencerEarnings.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-gray-500 font-medium">Tahmini Influencer Hakedişi</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
            </div>
            <div className="text-xs text-gray-500 font-medium">Toplam Kullanım</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kupon kodu, influencer adı veya eğitimle ara..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 flex-wrap">
          <button
            onClick={() => setFilterScope("ALL")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterScope === "ALL" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tümü ({totalCoupons})
          </button>
          <button
            onClick={() => setFilterScope("INFLUENCER")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterScope === "INFLUENCER" ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Influencer ({influencerCouponsCount})
          </button>
          <button
            onClick={() => setFilterScope("GENERAL")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterScope === "GENERAL" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Genel Sepet ({generalCouponsCount})
          </button>
          <button
            onClick={() => setFilterScope("PRODUCT_SPECIFIC")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterScope === "PRODUCT_SPECIFIC" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Ürüne Özel ({productCouponsCount})
          </button>
        </div>
      </div>

      {/* Coupon List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
                <th className="p-4">Kupon Kodu</th>
                <th className="p-4">Influencer / Ortak</th>
                <th className="p-4">Geçerlilik Kapsamı</th>
                <th className="p-4">İndirim Oranı</th>
                <th className="p-4">Kullanım</th>
                <th className="p-4">Influencer Hakedişi</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-base text-gray-800">Henüz tanımlanmış bir kupon yok.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                  // Calculate estimated commission for this coupon
                  let estimatedCommission = 0;
                  if (coupon.influencerName && coupon.commissionValue) {
                    if (coupon.commissionType === "FIXED") {
                      estimatedCommission = coupon.usedCount * coupon.commissionValue;
                    } else {
                      estimatedCommission = coupon.usedCount * (coupon.value * (coupon.commissionValue / 100) * 10);
                    }
                  }

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                            title="Kodu Kopyala"
                          >
                            {copiedCode === coupon.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                      {/* Influencer Info */}
                      <td className="p-4">
                        {coupon.influencerName ? (
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                              <Users className="w-3.5 h-3.5 text-primary-600" />
                              {coupon.influencerName}
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                              Komisyon: {coupon.commissionType === "PERCENTAGE" ? `%${coupon.commissionValue}` : `₺${coupon.commissionValue} / Satış`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">-</span>
                        )}
                      </td>

                      {/* Scope (Product vs General) */}
                      <td className="p-4">
                        {coupon.product ? (
                          <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-flex">
                            <Layers className="w-3.5 h-3.5" />
                            <span className="line-clamp-1 max-w-[160px]">{coupon.product.title}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 inline-flex">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Tüm Sepette Geçerli
                          </div>
                        )}
                      </td>

                      {/* Value & Type */}
                      <td className="p-4 font-bold text-gray-900">
                        {coupon.type === "PERCENTAGE" ? (
                          <span className="text-green-700">%{coupon.value} İndirim</span>
                        ) : (
                          <span className="text-green-700">₺{coupon.value.toLocaleString('tr-TR')} İndirim</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-800">
                            {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "kullanım"}
                          </div>
                          {coupon.usageLimit && (
                            <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${isLimitReached ? "bg-red-500" : "bg-primary-600"}`}
                                style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Influencer Earnings / Hakediş */}
                      <td className="p-4">
                        {coupon.influencerName ? (
                          <div className="font-extrabold text-xs text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100 inline-block">
                            ₺{estimatedCommission.toLocaleString('tr-TR')} Hakediş
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteCoupon({ id: coupon.id, code: coupon.code })}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Yeni Kupon Tanımla</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Kupon Kodu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Kupon Kodu</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Örn: AHMED10 veya KPSS2026"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                  />
                  <button 
                    type="button" 
                    onClick={() => setCode(`INDIRIM${Math.floor(100 + Math.random() * 900)}`)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Rastgele Üret
                  </button>
                </div>
              </div>

              {/* Influencer / Affiliate Checkbox */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isInfluencer}
                    onChange={(e) => setIsInfluencer(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary-600" />
                      Bu bir Influencer / İş Ortaklığı Kuponudur
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">İş ortağı hakediş takibi ve komisyon oranları tanımlayın.</span>
                  </div>
                </label>

                {isInfluencer && (
                  <div className="pt-3 border-t border-gray-200 space-y-3 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 uppercase">Influencer / Ortak Adı</label>
                      <input 
                        type="text" 
                        value={influencerName} 
                        onChange={(e) => setInfluencerName(e.target.value)}
                        placeholder="Örn: Ahmet Hoca (Instagram) veya KPSS Rehberlik"
                        required={isInfluencer}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase">Komisyon Türü</label>
                        <select
                          value={commissionType}
                          onChange={(e) => setCommissionType(e.target.value as any)}
                          className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="PERCENTAGE">% Ciro Komisyonu</option>
                          <option value="FIXED">Satış Başına ₺ Hakediş</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase">
                          {commissionType === "PERCENTAGE" ? "Komisyon Oranı (%)" : "Komisyon Tutarı (₺)"}
                        </label>
                        <input 
                          type="number"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value)}
                          placeholder={commissionType === "PERCENTAGE" ? "10" : "50"}
                          required={isInfluencer}
                          className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kupon Kapsamı */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Kupon Kapsamı</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScope("GENERAL")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      scope === "GENERAL" 
                        ? "border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-600/20" 
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Tüm Sepette Geçerli
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("PRODUCT")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      scope === "PRODUCT" 
                        ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-600/20" 
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Ürüne Özel Kupon
                  </button>
                </div>
              </div>

              {/* Eğer Ürüne Özel Seçildiyse Ürün Seçimi */}
              {scope === "PRODUCT" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-gray-700 uppercase">Geçerli Olacağı Eğitim</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required={scope === "PRODUCT"}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">-- Bir Eğitim Seçin --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* İndirim Tipi & Değeri */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">İndirim Türü</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  >
                    <option value="PERCENTAGE">Yüzde (%) İndirim</option>
                    <option value="FIXED">Sabit Tutar (₺) İndirimi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    {type === "PERCENTAGE" ? "İndirim Oranı (%)" : "İndirim Tutarı (₺)"}
                  </label>
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "PERCENTAGE" ? "20" : "250"}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Min Cart & Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Min. Sepet Tutarı (₺)</label>
                  <input 
                    type="number" 
                    value={minCartValue}
                    onChange={(e) => setMinCartValue(e.target.value)}
                    placeholder="Örn: 500 (Boş = Alt Limit Yok)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Kullanım Limiti (Adet)</label>
                  <input 
                    type="number" 
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Örn: 100 (Boş = Sınırsız)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase">Son Kullanma Tarihi (Opsiyonel)</label>
                <input 
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Oluşturuluyor..." : "Kuponu Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCoupon !== null}
        onClose={() => setDeleteCoupon(null)}
        onConfirm={handleConfirmDelete}
        title="Kuponu Silmek İstiyor Musunuz?"
        description={`"${deleteCoupon?.code || ''}" kupon kodu veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
