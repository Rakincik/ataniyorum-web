"use client";

import { useState } from "react";
import { 
  Search, Users, ShoppingBag, CreditCard, CheckCircle2, 
  Clock, XCircle, ChevronRight, Eye, Calendar, Mail, User as UserIcon, Shield, Package, X, MapPin, Phone
} from "lucide-react";

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
  addonName?: string | null;
  addonPrice?: number | null;
  variant: {
    name: string;
    product: {
      title: string;
      image?: string | null;
    };
  };
};

type Order = {
  id: string;
  shopierOrderId?: string | null;
  couponCode?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  tcNo?: string | null;
  phone?: string | null;
  email: string;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  role: string;
  createdAt: string;
  orders: Order[];
};

export default function AdminUsersClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WITH_PURCHASE" | "NO_PURCHASE">("ALL");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Stats
  const totalStudents = initialUsers.filter(u => u.role === "STUDENT").length;
  const paidUsersCount = initialUsers.filter(u => u.orders.some(o => o.status === "PAID")).length;
  const totalRevenue = initialUsers.reduce((sum, u) => {
    return sum + u.orders.filter(o => o.status === "PAID").reduce((oSum, o) => oSum + o.totalAmount, 0);
  }, 0);
  const totalOrdersCount = initialUsers.reduce((sum, u) => sum + u.orders.length, 0);

  // Filtering
  const filteredUsers = initialUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.tcNo && user.tcNo.includes(searchTerm));

    const hasPaidOrder = user.orders.some(o => o.status === "PAID");
    if (filterType === "WITH_PURCHASE" && !hasPaidOrder) return false;
    if (filterType === "NO_PURCHASE" && hasPaidOrder) return false;

    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Öğrenci Yönetimi</h1>
                <p className="text-gray-500 mt-1 font-medium">Kayıtlı öğrenciler, satın aldıkları eğitimler ve sipariş geçmişi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalStudents}</div>
            <div className="text-xs text-gray-500 font-medium">Kayıtlı Öğrenci</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-green-600">₺{totalRevenue.toLocaleString('tr-TR')}</div>
            <div className="text-xs text-gray-500 font-medium">Toplam Hasılat</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{paidUsersCount}</div>
            <div className="text-xs text-gray-500 font-medium">Aktif Eğitim Alan Öğrenci</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalOrdersCount}</div>
            <div className="text-xs text-gray-500 font-medium">Toplam İşlem / Sipariş</div>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Öğrenci adı, e-posta veya TC No ile ara..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === "ALL" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tüm Öğrenciler ({initialUsers.length})
          </button>
          <button
            onClick={() => setFilterType("WITH_PURCHASE")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === "WITH_PURCHASE" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Satın Alanlar ({paidUsersCount})
          </button>
          <button
            onClick={() => setFilterType("NO_PURCHASE")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === "NO_PURCHASE" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Siparişi Olmayanlar ({initialUsers.length - paidUsersCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
                <th className="p-4">Öğrenci Bilgisi</th>
                <th className="p-4">TC Kimlik No</th>
                <th className="p-4">Kayıt Tarihi</th>
                <th className="p-4">Satın Alınan Eğitimler</th>
                <th className="p-4">Toplam Harcama</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-base text-gray-800">Arama kriterlerine uygun öğrenci bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const paidOrders = user.orders.filter(o => o.status === "PAID");
                  const userTotalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                  // Extract all purchased course titles
                  const purchasedCourses = paidOrders.flatMap(o => 
                    o.items.map(item => item.variant?.product?.title).filter(Boolean)
                  );
                  const uniqueCourseTitles = Array.from(new Set(purchasedCourses));

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              {user.role === "ADMIN" && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-extrabold uppercase">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {user.email}
                            </div>

                            {user.phone && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-mono text-gray-600 font-semibold">
                                  +90 {user.phone}
                                </span>
                                
                                <a
                                  href={`https://wa.me/90${user.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors"
                                  title="WhatsApp Sohbet Başlat"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* TC No */}
                      <td className="p-4 font-mono text-xs text-gray-600">
                        {user.tcNo || "-"}
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Purchased Courses */}
                      <td className="p-4">
                        {uniqueCourseTitles.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                              <span className="font-semibold text-gray-800 text-xs line-clamp-1 max-w-[240px]">
                                {uniqueCourseTitles[0]}
                              </span>
                            </div>
                            {uniqueCourseTitles.length > 1 && (
                              <div className="text-[11px] text-gray-500 font-medium pl-3">
                                + {uniqueCourseTitles.length - 1} diğer paket
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Henüz sipariş yok</span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="p-4 font-bold text-gray-900">
                        {userTotalSpent > 0 ? (
                          <span className="text-green-700">₺{userTotalSpent.toLocaleString('tr-TR')}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">₺0</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.phone && (
                            <>
                              <a
                                href={`https://wa.me/90${user.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors flex items-center justify-center"
                                title="WhatsApp'tan Mesaj At"
                              >
                                <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                </svg>
                              </a>

                              <a
                                href={`tel:+90${user.phone.replace(/\D/g, '')}`}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                                title="Numarayı Ara"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detaylar ({user.orders.length})
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM 2.0 User Detail & Order History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header Banner */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-[#102a43] to-[#1e3a8a] text-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    {selectedUser.role === "ADMIN" && (
                      <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black uppercase">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 font-medium flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-primary-300" />
                    {selectedUser.email}
                  </p>
                  {selectedUser.city && (
                    <div className="text-[11px] font-semibold text-primary-200 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {selectedUser.city} {selectedUser.district ? `/ ${selectedUser.district}` : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10 self-start sm:self-center">
                {selectedUser.phone && (
                  <a
                    href={`https://wa.me/90${selectedUser.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    WhatsApp'tan Yaz
                  </a>
                )}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              
              {/* Summary KPI Cards */}
              {(() => {
                const paidOrders = selectedUser.orders.filter(o => o.status === "PAID");
                const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                const totalCoursesCount = new Set(paidOrders.flatMap(o => o.items.map(i => i.variant?.product?.title).filter(Boolean))).size;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Toplam Harcama</div>
                        <div className="text-lg font-black text-emerald-600">₺{totalSpent.toLocaleString('tr-TR')}</div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Satın Alınan Paketler</div>
                        <div className="text-lg font-black text-gray-900">{totalCoursesCount} Eğitim</div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Kayıt Tarihi</div>
                        <div className="text-xs font-black text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Personal & Address Info Grid */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-primary-600" /> Kişisel & Adres Bilgileri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Telefon Numarası</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {selectedUser.phone ? `+90 ${selectedUser.phone}` : "Belirtilmedi"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">TC Kimlik No</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedUser.tcNo || "Belirtilmedi"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">İl / İlçe</span>
                    <span className="font-bold text-gray-900">
                      {selectedUser.city ? `${selectedUser.city} / ${selectedUser.district || ''}` : "Belirtilmedi"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-gray-100">
                    <span className="text-gray-400 block font-medium">Fatura & Açık Adres</span>
                    <span className="font-semibold text-gray-800 leading-relaxed block mt-0.5">
                      {selectedUser.address || "Açık adres girilmemiş."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order History Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                    Sipariş ve Satın Alma Geçmişi
                  </h4>
                  <span className="text-xs font-extrabold px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                    {selectedUser.orders.length} İşlem Kaydı
                  </span>
                </div>

                {selectedUser.orders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
                    <p className="font-medium">Bu öğrenciye ait herhangi bir sipariş veya satın alma kaydı bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedUser.orders.map((order) => (
                      <div key={order.id} className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                          <div>
                            <div className="font-black text-xs text-gray-900 flex items-center gap-2">
                              Sipariş #{order.id.slice(-6).toUpperCase()}
                              {order.shopierOrderId && (
                                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md font-bold">
                                  Shopier: {order.shopierOrderId}
                                </span>
                              )}
                              {order.couponCode && (
                                <span className="text-[10px] font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold">
                                  Kupon: {order.couponCode}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium mt-1">
                              {new Date(order.createdAt).toLocaleString('tr-TR')}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                              order.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                              order.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {order.status === "PAID" ? "✓ ÖDENDİ" : order.status === "PENDING" ? "BEKLİYOR" : "BAŞARISIZ"}
                            </span>
                            <span className="font-black text-gray-900 text-base">
                              ₺{order.totalAmount.toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                              <div>
                                <div className="font-extrabold text-gray-900">
                                  {item.variant?.product?.title || "Eğitim Paketi"}
                                </div>
                                <div className="text-gray-500 font-medium text-[11px] mt-0.5">
                                  Paket: <span className="text-primary-700 font-bold">{item.variant?.name}</span>
                                  {item.addonName && (
                                    <span className="ml-2 text-purple-700 font-bold">+ {item.addonName} (+₺{item.addonPrice})</span>
                                  )}
                                </div>
                              </div>
                              <div className="font-black text-gray-900 text-sm">
                                ₺{item.price.toLocaleString('tr-TR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Pencereyi Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
