import NavbarClient from "@/components/NavbarClient";
import { Mail, Phone, MapPin, Send, Camera, MessageCircle, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ContactPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <NavbarClient categories={categories} />
      
      {/* Hero Section */}
      <div className="bg-[#102a43] text-white pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute top-12 -left-24 w-72 h-72 bg-blue-400/10 rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Bize Ulaşın</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Eğitimlerimiz hakkında bilgi almak, destek talebinde bulunmak veya önerilerinizi paylaşmak için bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-apple border border-gray-100">
              <h3 className="text-2xl font-bold mb-8">İletişim Bilgileri</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/50 font-medium mb-1">Müşteri Hizmetleri</p>
                    <a href="tel:+908500000000" className="text-lg font-bold hover:text-primary-600 transition-colors">
                      0850 000 00 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/50 font-medium mb-1">E-Posta Adresi</p>
                    <a href="mailto:destek@ataniyorumhocam.com" className="text-lg font-bold hover:text-primary-600 transition-colors">
                      destek@ataniyorumhocam.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/50 font-medium mb-1">Merkez Ofis</p>
                    <p className="text-lg font-medium">
                      Eğitim Mahallesi, Akademi Sokak No:1, Çankaya / Ankara
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-100">
                <p className="text-sm font-bold mb-4 text-foreground/70">Sosyal Medyada Biz</p>
                <div className="flex items-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-foreground hover:bg-primary-600 hover:text-white transition-colors">
                    <Camera className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-foreground hover:bg-primary-600 hover:text-white transition-colors">
                    <PlayCircle className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-foreground hover:bg-primary-600 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-apple border border-gray-100">
              <h2 className="text-3xl font-bold mb-2">Mesaj Gönderin</h2>
              <p className="text-foreground/60 mb-8">
                Tüm soru, görüş ve önerileriniz için aşağıdaki formu doldurarak bize ulaşabilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.
              </p>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Adınız Soyadınız</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/30 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">E-Posta Adresiniz</label>
                    <input 
                      type="email" 
                      placeholder="Örn: ahmet@ornek.com"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/30 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Konu</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none">
                    <option value="">Lütfen bir konu seçin</option>
                    <option value="bilgi">Eğitimler Hakkında Bilgi</option>
                    <option value="destek">Teknik Destek</option>
                    <option value="satis">Satış ve Fatura</option>
                    <option value="diger">Diğer Konular</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Mesajınız</label>
                  <textarea 
                    rows={5}
                    placeholder="Mesajınızı buraya yazabilirsiniz..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/30 font-medium resize-none"
                  ></textarea>
                </div>

                <button 
                  type="button"
                  className="w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 group"
                >
                  Mesajı Gönder
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
