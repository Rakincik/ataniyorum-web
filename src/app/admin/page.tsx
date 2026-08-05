import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Tag, 
  Megaphone, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  UserPlus
} from "lucide-react";

export default async function AdminDashboard() {
  const [
    userCount, 
    orderCount, 
    productCount,
    recentOrders,
    recentUsers,
    totalRevenueAgg,
    topProducts
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { role: "STUDENT" }
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" }
    }),
    prisma.product.findMany({
      take: 4,
      include: {
        category: true,
        variants: {
          include: {
            orderItems: true
          }
        }
      }
    })
  ]);

  const revenue = totalRevenueAgg._sum.totalAmount || 0;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102a43] to-[#1e3a8a] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full text-xs font-bold text-primary-200 border border-white/10">
              Atanıyorum Hocam Kontrol Paneli
            </div>
            <h1 className="text-3xl font-black tracking-tight">Yönetim Paneline Hoş Geldiniz</h1>
            <p className="text-sm text-white/70 max-w-xl font-medium">
              Platformunuzun anlık durumunu, son satışları, yeni üye kayıtlarını ve ciro raporlarını buradan takip edin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/admin/products/new"
              className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Yeni Eğitim Ekle
            </Link>
            <Link 
              href="/admin/coupons"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs transition-all border border-white/20 flex items-center gap-2"
            >
              <Tag className="w-4 h-4" /> Kupon Tanımla
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Toplam Ciro</span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">₺{revenue.toLocaleString('tr-TR')}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Başarılı ödemeler dahil
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Kayıtlı Öğrenci</span>
            <div className="p-3 rounded-2xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{userCount}</div>
          <div className="text-[11px] text-gray-500 font-medium mt-2 flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-primary-600" /> Aktif platform öğrencisi
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Aktif Eğitimler</span>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{productCount}</div>
          <div className="text-[11px] text-purple-600 font-bold mt-2">
            Yayındaki tüm kurslar
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Toplam Sipariş</span>
            <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{orderCount}</div>
          <div className="text-[11px] text-gray-500 font-medium mt-2">
            İşlem gören siparişler
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left (2 Columns): Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-600" />
                  Son Siparişler ve İşlemler
                </h3>
                <p className="text-xs text-gray-500 font-medium">Sistemde gerçekleşen son 5 satın alma kaydı.</p>
              </div>

              <Link 
                href="/admin/orders"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-medium">Henüz gerçekleşmiş bir sipariş kaydı bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const firstItemTitle = order.items[0]?.variant?.product?.title || "Eğitim Paketi";
                  return (
                    <div key={order.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {order.user?.firstName?.[0] || "Ö"}{order.user?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-[11px] font-semibold text-gray-600 mt-0.5">
                            {firstItemTitle}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.status === "PAID" ? "ÖDENDİ" : "BEKLİYOR"}
                        </span>
                        <span className="font-black text-sm text-gray-900">
                          ₺{order.totalAmount.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right (1 Column): Recent Registrations & Shortcuts */}
        <div className="space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Hızlı İşlemler</h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/announcement"
                className="p-3 bg-gray-50 hover:bg-primary-50 rounded-2xl border border-gray-100 text-center space-y-2 group transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Megaphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Duyuru Bandı</span>
              </Link>

              <Link
                href="/admin/about"
                className="p-3 bg-gray-50 hover:bg-purple-50 rounded-2xl border border-gray-100 text-center space-y-2 group transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Hakkımızda</span>
              </Link>

              <Link
                href="/admin/stats"
                className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-2xl border border-gray-100 text-center space-y-2 group transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Güven Bandı</span>
              </Link>

              <Link
                href="/admin/users"
                className="p-3 bg-gray-50 hover:bg-amber-50 rounded-2xl border border-gray-100 text-center space-y-2 group transition-colors"
              >
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Öğrenciler</span>
              </Link>
            </div>
          </div>

          {/* Recent Registrations Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary-600" />
                Son Katılan Öğrenciler
              </h3>
              <Link href="/admin/users" className="text-xs font-bold text-primary-600 hover:underline">
                Tümü
              </Link>
            </div>

            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium text-center py-4">Henüz kayıtlı öğrenci yok.</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {u.firstName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{u.email}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
