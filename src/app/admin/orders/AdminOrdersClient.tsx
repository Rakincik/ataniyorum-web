"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Receipt,
  User,
  Tag,
  Calendar,
  X,
  AlertTriangle
} from "lucide-react";

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  addonName?: string;
  addonPrice?: number;
  variant: {
    name: string;
    product: {
      title: string;
      image?: string;
    }
  }
}

interface Order {
  id: string;
  shopierOrderId?: string;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  status: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
}

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "FAILED">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modern Delete Modal State
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistics
  const totalRevenue = orders
    .filter(o => o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPaidOrders = orders.filter(o => o.status === "PAID").length;
  const totalPendingOrders = orders.filter(o => o.status === "PENDING").length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shopierOrderId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: "PAID" | "PENDING" | "FAILED") => {
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
        showToast("Sipariş durumu güncellendi", "success");
      }
    } catch (err) {
      showToast("Sipariş durumu güncellenirken hata oluştu.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrderId) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/orders/${deleteOrderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== deleteOrderId));
        if (selectedOrder?.id === deleteOrderId) setSelectedOrder(null);
        showToast("Sipariş kaydı veritabanından silindi.", "info");
      } else {
        showToast("Silme işlemi başarısız oldu.", "error");
      }
    } catch (err) {
      showToast("Sipariş silinirken bir hata oluştu.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ ÖDENDİ (Shopier Onaylı)
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-300">
            <Clock className="w-4 h-4 text-amber-600" /> ⏳ ÖDEME BEKLİYOR
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-black rounded-full border border-rose-300">
            <XCircle className="w-4 h-4 text-rose-600" /> ❌ ÖDEME BAŞARISIZ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
            Siparişler & Satış Takibi
          </h1>
          <p className="text-gray-500 mt-1">
            Platformdaki tüm öğrenci alışverişlerini, Shopier ödeme durumlarını ve hakedişleri takip edin.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Toplam Ciro</span>
            <h3 className="text-2xl font-black text-gray-900">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Başarılı Satış</span>
            <h3 className="text-2xl font-black text-gray-900">{totalPaidOrders} Sipariş</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bekleyen Ödeme</span>
            <h3 className="text-2xl font-black text-gray-900">{totalPendingOrders} Sipariş</h3>
          </div>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Tabs */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Öğrenci adı, e-posta, sipariş veya Shopier No ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
            {(["ALL", "PAID", "PENDING", "FAILED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab === "ALL" && `Tümü (${orders.length})`}
                {tab === "PAID" && `Başarılı (${totalPaidOrders})`}
                {tab === "PENDING" && `Bekleyen (${totalPendingOrders})`}
                {tab === "FAILED" && `Başarısız`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Sipariş Bulunamadı</h3>
            <p className="text-gray-400 text-sm mt-1">Arama kriterlerinize uygun henüz kayıtlı bir sipariş yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Sipariş ID / Tarih</th>
                  <th className="py-4 px-6">Müşteri / Öğrenci</th>
                  <th className="py-4 px-6">Alınan Ürünler</th>
                  <th className="py-4 px-6">Tutar</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-gray-900 text-xs">
                        #{order.id.slice(-8).toUpperCase()}
                      </div>
                      {order.shopierOrderId && (
                        <div className="text-[11px] text-primary-600 font-semibold mt-0.5">
                          Shopier: #{order.shopierOrderId}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">
                        {order.user?.name || ((order.user as any)?.firstName ? `${(order.user as any).firstName} ${(order.user as any).lastName || ''}`.trim() : "İsimsiz Kullanıcı")}
                      </div>
                      <div className="text-xs text-gray-400">{order.user?.email}</div>
                    </td>

                    <td className="py-4 px-6 max-w-md">
                      <div className="space-y-2.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50/90 rounded-2xl border border-gray-100 space-y-1 shadow-2xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-gray-900 text-xs">
                                {item.variant?.product?.title || "Eğitim Paketi"}
                              </span>
                              {item.variant?.name && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200/60 text-[11px]">
                                  {item.variant.name}
                                </span>
                              )}
                              {item.quantity > 1 && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-900 text-white rounded-md">
                                  {item.quantity}x
                                </span>
                              )}
                            </div>
                            
                            {item.addonName && (
                              <div className="text-[11px] text-purple-700 font-bold bg-purple-50/80 px-2 py-0.5 rounded-lg border border-purple-200/60 inline-flex items-center gap-1 mt-0.5">
                                <span>+ Ekstra:</span> {item.addonName} (+₺{item.addonPrice})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-black text-gray-900 text-base">
                        ₺{order.totalAmount.toLocaleString('tr-TR')}
                      </div>
                      {order.couponCode && (
                        <div className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded inline-block mt-1 border border-green-200">
                          Kupon: {order.couponCode} (-₺{order.discountAmount || 0})
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Detay Göster"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteOrderId(order.id)}
                          className="p-2 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Siparişi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Sipariş Detayı</h3>
                  <p className="text-xs text-gray-400 font-mono">#{selectedOrder.id}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                  {(selectedOrder.user?.name || "Ö").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {selectedOrder.user?.name || ((selectedOrder.user as any)?.firstName ? `${(selectedOrder.user as any).firstName} ${(selectedOrder.user as any).lastName || ''}`.trim() : "İsimsiz Kullanıcı")}
                  </h4>
                  <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sipariş Durumunu Güncelle</label>
                <div className="flex items-center gap-2">
                  {(["PAID", "PENDING", "FAILED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      disabled={loadingId === selectedOrder.id}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedOrder.status === st 
                          ? st === "PAID" ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                            : st === "PENDING" ? "bg-amber-500 text-white border-amber-500 shadow-md"
                            : "bg-rose-600 text-white border-rose-600 shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {st === "PAID" && "Tamamlandı (Ödendi)"}
                      {st === "PENDING" && "Ödeme Bekliyor"}
                      {st === "FAILED" && "Başarısız / İptal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Satın Alınan İçerikler</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between bg-white shadow-xs">
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">{item.variant?.product?.title}</h5>
                        <div className="text-xs text-gray-500 mt-0.5">Paket: {item.variant?.name}</div>
                        {item.addonName && (
                          <div className="text-xs text-purple-600 font-semibold mt-1">
                            + Ekstra: {item.addonName} (+₺{item.addonPrice})
                          </div>
                        )}
                      </div>
                      <div className="font-black text-gray-900 text-base">
                        ₺{item.price.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Info */}
              {selectedOrder.couponCode && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <Tag className="w-4 h-4" /> İndirim Kuponu: {selectedOrder.couponCode}
                  </div>
                  <span className="font-bold text-emerald-700 text-sm">-₺{selectedOrder.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500">Ödenen Toplam Tutar</span>
              <span className="text-2xl font-black text-gray-900">₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Sleek Delete Confirmation Modal */}
      {deleteOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">Siparişi Silmek İstiyor Musunuz?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Bu sipariş kaydı veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteOrderId(null)}
                disabled={isDeleting}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Siliniyor..." : "Evet, Siparişi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
