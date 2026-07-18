'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SidebarMenu from '@/components/site/SidebarMenu';
import ProductCard from '@/components/site/ProductCard';
import AnnouncementsList from '@/components/site/AnnouncementsList';
import HeroSlider from '@/components/site/HeroSlider';
import { ProductSkeletonGrid } from '@/components/common/Skeleton';
import Link from 'next/link';

function HomePageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [sortType, setSortType] = useState('date_desc'); // default: son eklenen
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isSortOpen) return;
    const handleClose = () => setIsSortOpen(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [isSortOpen]);

  const getSortLabel = () => {
    switch (sortType) {
      case 'date_asc': return 'En Eskiler';
      case 'price_asc': return 'Fiyat: Artan';
      case 'price_desc': return 'Fiyat: Azalan';
      case 'discount_desc': return 'İndirim Oranı';
      case 'date_desc':
      default:
        return 'En Yeniler';
    }
  };

  // Fetch all products on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  // Sync search parameter from URL
  useEffect(() => {
    if (search) {
      // Clear category filters if searching globally, or keep them. Let's filter on the client side
      onFilterChange(null, null);
    }
  }, [search]);

  // Apply filters and sorting on the client side for maximum speed & performance (lag-free)
  useEffect(() => {
    let result = Array.isArray(products) ? [...products] : [];
    // 1. Category Filter
    if (activeCategory) {
      result = result.filter((p) => {
        const parentName = p.category?.parent ? p.category.parent.name : p.category?.name;
        return parentName === activeCategory;
      });
    }
    // 2. Subcategory Filter
    if (activeSubCategory) {
      result = result.filter((p) => {
        const subName = p.category?.parent ? p.category.name : null;
        return subName === activeSubCategory;
      });
    }

    // 3. Search Filter
    if (search) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    // 3.5. Price Range Filters
    if (minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => {
          const finalPrice = p.price * (1 - p.discountRate / 100);
          return finalPrice >= min;
        });
      }
    }
    if (maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => {
          const finalPrice = p.price * (1 - p.discountRate / 100);
          return finalPrice <= max;
        });
      }
    }

    // 3.6. Discount Switch Filter
    if (onlyDiscounted) {
      result = result.filter((p) => p.discountRate > 0);
    }

    // 4. Sorting
    result.sort((a, b) => {
      const getFinalPrice = (p) => p.price * (1 - p.discountRate / 100);

      switch (sortType) {
        case 'price_asc':
          return getFinalPrice(a) - getFinalPrice(b);
        case 'price_desc':
          return getFinalPrice(b) - getFinalPrice(a);
        case 'discount_desc':
          return b.discountRate - a.discountRate;
        case 'discount_asc':
          return a.discountRate - b.discountRate;
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date_desc':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(result);
  }, [products, activeCategory, activeSubCategory, sortType, search, minPrice, maxPrice, onlyDiscounted]);

  const onFilterChange = (category, subCategory) => {
    setActiveCategory(category);
    setActiveSubCategory(subCategory);
  };

  const sortingButtons = [
    { type: 'price_asc', label: 'Fiyat artan' },
    { type: 'price_desc', label: 'Fiyat azalan' },
    { type: 'discount_desc', label: 'İndirim oranı azalan' },
    { type: 'discount_asc', label: 'İndirim oranı artan' },
    { type: 'date_asc', label: 'İlk eklenen' },
    { type: 'date_desc', label: 'Son eklenen' },
  ];

  return (
    <div className="container py-5 fade-in">
      <div className="row g-4">
        {/* Left Column: Menu Sidebar */}
        <div className="col-lg-3">
          <SidebarMenu
            activeCategory={activeCategory}
            activeSubCategory={activeSubCategory}
            onFilterChange={onFilterChange}
          />
        </div>

        {/* Right Column: Sorting Bar & Product Grid */}
        <div className="col-lg-9">
          {/* Hero Carousel Banner */}
          <HeroSlider />
          
          {/* Sorting and Action bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-white border rounded shadow-sm">
            <div className="d-flex flex-wrap align-items-center gap-4 flex-grow-1">
              {/* Modern Custom Sort Dropdown */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold text-nowrap">Sıralama:</span>
                <div className="position-relative" style={{ zIndex: 50 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSortOpen(!isSortOpen);
                    }}
                    className="btn btn-sm btn-light border bg-white d-flex align-items-center justify-content-between gap-2 shadow-none"
                    style={{ borderRadius: '8px', minWidth: '165px', padding: '6px 12px', fontWeight: '500', color: 'var(--text-dark)', border: '1px solid var(--border-color) !important' }}
                  >
                    <span>{getSortLabel()}</span>
                    <i className={`bi bi-chevron-${isSortOpen ? 'up' : 'down'} text-muted`} style={{ fontSize: '0.75rem' }}></i>
                  </button>
                  
                  {isSortOpen && (
                    <ul
                      className="position-absolute list-unstyled m-0 mt-1 border rounded-3 p-1 bg-white shadow-lg"
                      style={{
                        top: '100%',
                        left: 0,
                        minWidth: '200px',
                        animation: 'dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      }}
                    >
                      {[
                        { value: 'date_desc', label: 'En Yeniler (Son Eklenen)' },
                        { value: 'date_asc', label: 'En Eskiler (İlk Eklenen)' },
                        { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
                        { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
                        { value: 'discount_desc', label: 'İndirim Oranı: En Yüksek' },
                      ].map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            onClick={() => {
                              setSortType(opt.value);
                              setIsSortOpen(false);
                            }}
                            className={`dropdown-item px-3 py-2 rounded-2 text-start small w-100 border-0 bg-transparent ${
                              sortType === opt.value ? 'bg-light text-primary fw-semibold' : 'text-dark'
                            }`}
                            style={{ transition: 'all 0.15s ease' }}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Price Range Filters */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold text-nowrap">Fiyat Aralığı (₺):</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="form-control form-control-sm text-center shadow-none"
                  style={{ width: '70px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-muted small">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-control form-control-sm text-center shadow-none"
                  style={{ width: '70px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Discount Checkbox */}
              <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                <input
                  className="form-check-input cursor-pointer shadow-none"
                  type="checkbox"
                  role="switch"
                  id="discountSwitch"
                  checked={onlyDiscounted}
                  onChange={(e) => setOnlyDiscounted(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small text-muted fw-bold cursor-pointer text-nowrap" htmlFor="discountSwitch">
                  Sadece İndirimdekiler
                </label>
              </div>

              {/* Clear Filters Button */}
              {(minPrice || maxPrice || onlyDiscounted || activeCategory || activeSubCategory) && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setOnlyDiscounted(false);
                    onFilterChange(null, null);
                  }}
                  className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-bold text-nowrap"
                >
                  <i className="bi bi-x-circle-fill me-1"></i> Filtreleri Temizle
                </button>
              )}
            </div>

            {/* Ücretsiz İçerik Yellow Button */}
            <Link
              href="/ucretsiz-icerik"
              className="btn btn-sm fw-bold text-dark px-3 py-2 text-nowrap"
              style={{
                backgroundColor: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-color)';
              }}
            >
              <i className="bi bi-gift-fill me-1"></i>
              Ücretsiz İçerik
            </Link>
          </div>

          {/* Active Filters Display */}
          {(activeCategory || activeSubCategory || search) && (
            <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
              <span>Aktif Filtreler:</span>
              {activeCategory && (
                <span className="badge bg-secondary">
                  {activeCategory}
                  <i
                    className="bi bi-x ms-1 cursor-pointer"
                    onClick={() => onFilterChange(null, null)}
                  ></i>
                </span>
              )}
              {activeSubCategory && (
                <span className="badge bg-secondary">
                  {activeSubCategory}
                  <i
                    className="bi bi-x ms-1 cursor-pointer"
                    onClick={() => onFilterChange(activeCategory, null)}
                  ></i>
                </span>
              )}
              {search && (
                <span className="badge bg-secondary">
                  Arama: &quot;{search}&quot;
                  <i
                    className="bi bi-x ms-1 cursor-pointer"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('search');
                      window.history.pushState({}, '', url.pathname + url.search);
                    }}
                  ></i>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <ProductSkeletonGrid count={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-white border rounded shadow-sm mb-5">
              <i className="bi bi-search-heart fs-1 text-muted d-block mb-3"></i>
              <h5 className="text-muted">Aramanıza uygun ürün bulunamadı.</h5>
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setOnlyDiscounted(false);
                  onFilterChange(null, null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  window.history.pushState({}, '', url.pathname + url.search);
                }}
                style={{ backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '8px' }}
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements Section */}
      <AnnouncementsList />

      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/905000000000"
        className="position-fixed"
        style={{
          bottom: '30px',
          right: '30px',
          backgroundColor: '#25d366',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Destek Hattı"
      >
        <i className="bi bi-whatsapp"></i>
      </a>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
