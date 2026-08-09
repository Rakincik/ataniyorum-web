import Navbar from "@/components/Navbar";
import { GraduationCap, Award, Users, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let about = await prisma.aboutPage.findUnique({
    where: { id: "default" }
  });

  if (!about) {
    about = {
      id: "default",
      badgeText: "2026 Sezonu Başlıyor",
      title: "Geleceğinize Açılan Kapı: Atanıyorum Hocam",
      subtitle: "Türkiye'nin en seçkin öğretmen kadrosu ve yeni nesil eğitim teknolojileriyle, hayalinizdeki kadroya yerleşmeniz için yanınızdayız.",
      stat1Value: "10+",
      stat1Label: "Uzman Eğitmen",
      stat2Value: "500+",
      stat2Label: "Saat Video",
      stat3Value: "%95",
      stat3Label: "Memnuniyet",
      stat4Value: "7/24",
      stat4Label: "Rehberlik",
      founderName: "Türker Tola",
      founderTitle: "Kurucu & Eğitim Koordinatörü",
      founderQuote: "Eğitimde fırsat eşitliği ve kaliteli içerik, her öğretmenin hakkıdır. Atanıyorum Hocam platformunu kurarken tek bir hayalimiz vardı: Türkiye'nin dört bir yanındaki meslektaşlarımızı en iyi şartlarda sınavlara hazırlamak ve atanma sevincini hep birlikte yaşamak.",
      founderImage: null,
      missionTitle: "Misyonumuz",
      missionDesc: "En güncel müfredata uygun, nokta atışı bilgilerle adayları doğrudan başarıya odaklamak.",
      visionTitle: "Vizyonumuz",
      visionDesc: "ÖABT ve Eğitim Bilimleri alanında Türkiye'nin tartışmasız en çok kazandıran dijital akademisi olmak.",
      updatedAt: new Date()
    };
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary-400 opacity-20 blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {about.badgeText}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-[#1d1d1f] leading-tight">
            {about.title}
          </h1>
          
          <p className="text-lg md:text-xl text-[#1d1d1f]/70 leading-relaxed max-w-2xl mx-auto mb-12 font-medium">
            {about.subtitle}
          </p>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-3xl font-black text-[#1d1d1f] mb-1">{about.stat1Value}</div>
              <div className="text-xs text-[#1d1d1f]/60 font-semibold uppercase tracking-wider">{about.stat1Label}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-3xl font-black text-[#1d1d1f] mb-1">{about.stat2Value}</div>
              <div className="text-xs text-[#1d1d1f]/60 font-semibold uppercase tracking-wider">{about.stat2Label}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-3xl font-black text-[#1d1d1f] mb-1">{about.stat3Value}</div>
              <div className="text-xs text-[#1d1d1f]/60 font-semibold uppercase tracking-wider">{about.stat3Label}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="text-3xl font-black text-[#1d1d1f] mb-1">{about.stat4Value}</div>
              <div className="text-xs text-[#1d1d1f]/60 font-semibold uppercase tracking-wider">{about.stat4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex-shrink-0 relative">
            {about.founderImage ? (
              <img src={about.founderImage} alt={about.founderName} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary-50 text-primary-600">
                <Users className="w-20 h-20 opacity-50" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black text-gray-900">{about.founderName}</h2>
            <p className="text-primary-600 font-bold text-sm">{about.founderTitle}</p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-medium pt-2">
              "{about.founderQuote}"
            </p>
          </div>
        </div>
      </section>

      {/* Features / Vision Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Box 1: Misyon */}
          <div className="bg-[#fbfbfd] p-6 rounded-3xl border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#1d1d1f]" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1d1d1f]">{about.missionTitle}</h3>
            <p className="text-sm text-[#1d1d1f]/70 leading-relaxed font-medium">
              {about.missionDesc}
            </p>
          </div>
          
          {/* Box 2: Vizyon */}
          <div className="bg-[#1d1d1f] p-6 rounded-3xl border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-white">{about.visionTitle}</h3>
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              {about.visionDesc}
            </p>
          </div>

          {/* Box 3: Uzman Kadro */}
          <div className="bg-white p-6 rounded-3xl border border-black/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 shadow-sm">
            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6 text-[#1d1d1f]" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1d1d1f]">Uzman Kadro</h3>
            <p className="text-sm text-[#1d1d1f]/70 leading-relaxed font-medium">
              Sınav sistemini ve soru mantığını ezbere bilen tecrübeli eğitimciler.
            </p>
          </div>

          {/* Box 4: Öğrenci Odaklı */}
          <div className="bg-[#f5f5f7] p-6 rounded-3xl border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary-600" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1d1d1f]">Öğrenci Odaklı</h3>
            <p className="text-sm text-[#1d1d1f]/70 leading-relaxed font-medium">
              Sürekli rehberlik, motivasyon desteği ve birebir takip ile daima yanınızdayız.
            </p>
          </div>
          
        </div>
      </section>

    </main>
  );
}
