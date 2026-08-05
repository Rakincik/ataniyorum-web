import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import Link from "next/link";
import { ArrowRight, Video, Book, CheckCircle2, Brain, Users, Target, Shield, GraduationCap, Zap } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, sort?: string, page?: string }> }) {
  const { category, sort = "newest", page: pageStr = "1" } = await searchParams;
  const page = parseInt(pageStr, 10) || 1;
  const ITEMS_PER_PAGE = 6;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { basePrice: "asc" };
  if (sort === "price-desc") orderBy = { basePrice: "desc" };

  const whereClause = { isActive: true, ...(category ? { category: { slug: category } } : {}) };

  const [categories, totalCount, courses, sliders, siteFeatures, featuredCategories, stats] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.product.count({
      where: whereClause
    }),
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        features: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.slider.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.feature.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    }),
    prisma.category.findMany({
      where: { isFeatured: true },
      orderBy: { name: "asc" }
    }),
    prisma.stat.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })
  ]);

  const displayStats = stats.length > 0 ? stats : [
    { id: "1", value: "10.000+", label: "ÖĞRENCİ", order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "2", value: "%98", label: "ATANMA ORANI", order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "3", value: "1 Numara", label: "EĞİTMEN KADROSU", order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "4", value: "7/24", label: "REHBERLİK", order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Helper to get correct icon component based on string name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-8 h-8 text-primary-600" />;
      case 'Users': return <Users className="w-8 h-8 text-primary-600" />;
      case 'Target': return <Target className="w-8 h-8 text-primary-600" />;
      case 'Shield': return <Shield className="w-8 h-8 text-primary-600" />;
      case 'GraduationCap': return <GraduationCap className="w-8 h-8 text-primary-600" />;
      case 'Zap': return <Zap className="w-8 h-8 text-primary-600" />;
      default: return <CheckCircle2 className="w-8 h-8 text-primary-600" />;
    }
  };

  // Helper to build URLs preserving current params
  const getUrl = (updates: { category?: string | null, sort?: string, page?: number }) => {
    const params = new URLSearchParams();
    
    const newCategory = updates.category !== undefined ? updates.category : category;
    if (newCategory) params.set("category", newCategory);
    
    const newSort = updates.sort !== undefined ? updates.sort : sort;
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    
    const newPage = updates.page !== undefined ? updates.page : page;
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    return qs ? `/?${qs}#courses` : "/#courses";
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      <HeroSlider sliders={sliders as any} />

      {/* İstatistikler & Güven Bandı */}
      {displayStats.length > 0 && (
        <div className="bg-primary-700 text-white border-y border-white/10 relative z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 flex flex-wrap items-center justify-center gap-6 md:gap-16 text-center">
            {displayStats.map((stat, index) => (
              <div key={stat.id} className="flex items-center gap-6 md:gap-16">
                <div>
                  <div className="text-2xl md:text-3xl font-black">{stat.value}</div>
                  <div className="text-xs md:text-sm text-primary-100 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
                {index < displayStats.length - 1 && (
                  <div className="hidden md:block w-px h-8 bg-white/20"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neden Biz? (Features) */}
      {siteFeatures.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Neden Atanıyorum Hocam?</h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Sıradan bir dershane değil, tamamen senin başarına odaklanmış bir yapay zeka ve rehberlik ekosistemi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {siteFeatures.map((feature) => (
              <div key={feature.id} className="glass p-8 rounded-3xl text-center flex flex-col items-center shadow-sm hover:shadow-apple-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-white/5">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-6">
                  {getIcon(feature.icon)}
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Öne Çıkan Kategoriler (Featured Categories) */}
      {featuredCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Senin Alanın Hangisi?</h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Branşını seç ve sana özel hazırlanmış en kapsamlı içeriklere anında ulaş.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCategories.map((fc) => (
              <Link 
                href={`/?category=${fc.slug}#courses`} 
                key={fc.id}
                className="group relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden flex flex-col justify-end p-8 shadow-sm hover:shadow-apple-hover transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: fc.color || '#102a43' }}
              >
                {fc.image && (
                  <div className="absolute inset-0 z-0">
                    <img src={fc.image} alt={fc.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  </div>
                )}
                <div className="relative z-10 text-white">
                  <h3 className="text-2xl md:text-3xl font-black mb-2">{fc.name}</h3>
                  {fc.description && (
                    <p className="text-white/80 line-clamp-2 text-sm md:text-base mb-6">
                      {fc.description}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-2 font-medium text-primary-300 group-hover:text-white transition-colors">
                    Paketleri İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Vitrin (Storefront) */}
      <section id="courses" className="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Eğitim Programları
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Seni hedefine ulaştıracak, uzman kadromuz tarafından hazırlanan premium paketler.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Sol Kısım: Kategoriler (Sidebar) */}
          <aside className="w-full lg:w-1/4 flex-shrink-0 lg:sticky lg:top-32 glass rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Kategoriler</h3>
            <div className="flex flex-col gap-2">
              <Link 
                href={getUrl({ category: null, page: 1 })}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  !category 
                    ? "bg-primary-600 text-white shadow-md" 
                    : "text-foreground/70 hover:bg-white dark:hover:bg-black/20"
                }`}
              >
                Tüm Eğitimler
              </Link>
              {categories.map(c => (
                <Link
                  key={c.id}
                  href={getUrl({ category: c.slug, page: 1 })}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    category === c.slug 
                      ? "bg-primary-600 text-white shadow-md" 
                      : "text-foreground/70 hover:bg-white dark:hover:bg-black/20 hover:text-primary-600"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </aside>

          {/* Sağ Kısım: Ürünler Grid */}
          <div className="w-full lg:w-3/4">
            
            {/* Toolbar (Sıralama ve Sonuç Sayısı) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 glass px-6 py-4 rounded-2xl">
              <span className="text-sm font-medium text-foreground/60">
                Toplam <strong className="text-foreground">{totalCount}</strong> eğitim bulundu
              </span>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/60">Sıralama:</span>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={getUrl({ sort: "newest", page: 1 })} 
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${sort === "newest" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}
                  >
                    En Yeniler
                  </Link>
                  <Link 
                    href={getUrl({ sort: "price-asc", page: 1 })} 
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${sort === "price-asc" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}
                  >
                    Fiyat (Artan)
                  </Link>
                  <Link 
                    href={getUrl({ sort: "price-desc", page: 1 })} 
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${sort === "price-desc" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"}`}
                  >
                    Fiyat (Azalan)
                  </Link>
                </div>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl border border-dashed border-gray-300 dark:border-white/20">
                <p className="text-foreground/60 text-lg">Arama kriterlerinize uygun eğitim bulunmuyor.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {courses.map((course) => {
                      const cardImage = course.image;

                      return (
                        <Link 
                          key={course.id} 
                          href={`/course/${course.slug}`}
                          className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200/80 transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            {cardImage ? (
                              <img 
                                src={cardImage} 
                                alt={course.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                            ) : (
                              <Video className="w-12 h-12 text-primary-200 group-hover:scale-110 transition-transform duration-500" />
                            )}
                            
                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 text-primary-700 shadow-md rounded-full text-[10px] font-bold uppercase tracking-wider z-20">
                              {course.category.name}
                            </div>

                            {course.isStockOut ? (
                              <div className="absolute top-4 right-4 px-3 py-1 bg-rose-600 text-white shadow-md rounded-full text-[10px] font-black uppercase tracking-wider z-20 animate-pulse">
                                🔴 Kontenjan Doldu
                              </div>
                            ) : course.isFree ? (
                              <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white shadow-md rounded-full text-[10px] font-black uppercase tracking-wider z-20">
                                🎁 Ücretsiz Paket
                              </div>
                            ) : null}
                          </div>

                      <div className="p-6 flex flex-col flex-grow bg-white">
                        <h3 className="font-extrabold text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed font-medium">
                          {course.description}
                        </p>

                        {course.features && course.features.length > 0 && (
                          <ul className="mb-5 space-y-2.5 flex-grow">
                            {course.features.slice(0, 3).map((feature: any, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-gray-800 leading-snug">
                                <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span>{feature.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium mb-0.5">
                              {course.isFree ? "Erişim Ücreti" : "Başlangıç Fiyatı"}
                            </span>
                            <span className={`font-black text-2xl tracking-tight ${course.isFree ? "text-purple-600" : course.isStockOut ? "text-gray-400" : "text-primary-600"}`}>
                              {course.isFree 
                                ? "ÜCRETSİZ" 
                                : course.isStockOut 
                                  ? "Kontenjan Doldu" 
                                  : course.variants.length > 0 
                                    ? `₺${(course.basePrice + Math.min(...course.variants.map((v: any) => v.price))).toLocaleString('tr-TR')}`
                                    : `₺${course.basePrice.toLocaleString('tr-TR')}`}
                            </span>
                          </div>
                          
                          <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Link
                          key={pageNum}
                          href={getUrl({ page: pageNum })}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                            pageNum === page 
                              ? "bg-primary-600 text-white shadow-md" 
                              : "glass text-foreground/70 hover:bg-white dark:hover:bg-white/10"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
