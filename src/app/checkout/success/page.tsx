import Navbar from "@/components/Navbar";
import { CheckCircle2, ArrowRight, ShieldCheck, GraduationCap } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams;

  let order: any = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      <div className="pt-32 px-6 max-w-2xl mx-auto text-center space-y-8">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-bounce duration-1000">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase rounded-full border border-emerald-200">
            Ödeme Başarıyla Tamamlandı
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Tebrikler! Eğitiminiz Hesabınıza Tanımlandı 🎉
          </h1>
          <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-md mx-auto">
            Ödemeniz Shopier güvencesiyle onaylandı. Hemen eğitimlerinize erişebilir ve KPSS hazırlığına başlayabilirsiniz.
          </p>
        </div>

        {order && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">Sipariş Numarası</span>
              <span className="font-mono text-xs font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
            </div>

            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl">
                  <div>
                    <div className="font-bold text-gray-900">{item.variant?.product?.title}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{item.variant?.name}</div>
                  </div>
                  <div className="font-black text-emerald-600">₺{item.price.toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-sm font-black text-gray-900 border-t border-gray-100">
              <span>Toplam Ödenen Tutar</span>
              <span className="text-lg text-primary-600">₺{order.totalAmount.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5" /> Eğitimlerime Başla
          </Link>
        </div>

        <div className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> %100 SSL & Shopier Güvenli Alışveriş
        </div>
      </div>
    </main>
  );
}
