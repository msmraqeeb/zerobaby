import React, { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Headphones, ShieldCheck, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { HomeSection, Product, Brand } from '../types';

const SliderSection: React.FC<{ section: HomeSection; products: Product[] }> = ({ section, products }) => {
  const { categories } = useStore();
  const sliderId = `slider-${section.id}`;
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const getSectionLink = () => {
    if (section.filterType === 'category' && section.filterValue) {
      const categoryObj = categories.find(c => c.name === section.filterValue);
      if (categoryObj) {
        return `/category/${categoryObj.slug || encodeURIComponent(categoryObj.name)}`;
      }
    }
    return `/products?filter=${section.filterType}${section.filterValue ? `&value=${section.filterValue}` : ''}`;
  };

  useEffect(() => {
    if (!products.length) return;

    const cards = containerRef.current?.querySelectorAll('.product-card-anim');
    if (!cards || !cards.length) return;

    gsap.set(cards, { y: 30, opacity: 0 });

    const triggerInstance = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 90%",
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });

    return () => {
      triggerInstance.kill();
    };
  }, [products.length]);

  return (
    <section ref={containerRef} className="container mx-auto px-4 md:px-8 mb-16 relative group/slider">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 border-l-4 border-[#e92c5d] pl-4">{section.title}</h2>
        <Link to={getSectionLink()} className="text-[10px] md:text-sm font-bold text-[#e92c5d] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">View All Items <ArrowRight size={14} /></Link>
      </div>
      <div className="relative">
        <button
          onClick={() => {
            const container = document.getElementById(sliderId);
            if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-[#e92c5d] z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ArrowRight size={20} className="rotate-180" />
        </button>
        <div
          id={sliderId}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        >
          {products.map(product => (
            <div key={product.id} className="product-card-anim w-[150px] md:w-[240px] lg:w-[260px] snap-center flex-shrink-0 select-none">
              <ProductCard product={product} className="w-full" />
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const container = document.getElementById(sliderId);
            if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-[#e92c5d] z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
};

const GridSection: React.FC<{ section: HomeSection; products: Product[] }> = ({ section, products }) => {
  const { categories } = useStore();
  const isNoBanner = section.type === 'grid-no-banner';
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!products.length) return;

    const cards = containerRef.current?.querySelectorAll('.product-card-anim');
    if (!cards || !cards.length) return;

    gsap.set(cards, { y: 30, opacity: 0 });

    const triggerInstance = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 90%",
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });

    return () => {
      triggerInstance.kill();
    };
  }, [products.length, section.banner]);

  const getSectionLink = () => {
    if (section.filterType === 'category' && section.filterValue) {
      const categoryObj = categories.find(c => c.name === section.filterValue);
      if (categoryObj) {
        return `/category/${categoryObj.slug || encodeURIComponent(categoryObj.name)}`;
      }
    }
    return `/products?filter=${section.filterType}${section.filterValue ? `&value=${section.filterValue}` : ''}`;
  };

  return (
    <section ref={containerRef} className="container mx-auto px-4 md:px-8 mb-16">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 border-l-4 border-[#e92c5d] pl-4">{section.title}</h2>
        <Link to={getSectionLink()} className="text-[10px] md:text-sm font-bold text-[#e92c5d] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">View All Items <ArrowRight size={14} /></Link>
      </div>

      <div className={`grid grid-cols-1 ${isNoBanner ? '' : 'lg:grid-cols-5'} gap-6`}>
        {section.banner && !isNoBanner && (
          section.banner.imageUrl ? (
            <div ref={bannerRef} className="hidden lg:block rounded-xl overflow-hidden shadow-sm group h-[500px] self-start relative">
              {section.banner.link ? (
                <Link to={section.banner.link} className="block w-full h-full">
                  <img
                    src={section.banner.imageUrl}
                    alt={section.banner.title || "banner"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <img
                  src={section.banner.imageUrl}
                  alt={section.banner.title || "banner"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <div ref={bannerRef} className="hidden lg:block bg-gradient-to-b from-[#e92c5d] to-[#c81d4a] rounded-xl p-8 relative overflow-hidden text-white h-[500px] self-start">
              <h3 className="text-3xl font-bold mb-4 font-serif italic">{section.banner.title}</h3>
              <p className="mb-8 text-rose-100 opacity-90">{section.banner.description}</p>
              <Link to={section.banner.link || '#'} className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors w-fit flex items-center gap-2">
                {section.banner.buttonText || 'Shop Now'} ➝
              </Link>
            </div>
          )
        )}

        <div className={`
          ${!isNoBanner ? (section.banner ? 'lg:col-span-4' : 'lg:col-span-5') : ''} 
          grid grid-cols-2 lg:grid-cols-${isNoBanner ? '5' : (section.banner ? '4' : '5')} gap-3 md:gap-6
        `}>
          {products.slice(0, isNoBanner ? 10 : (section.banner ? 8 : 10)).map(product => (
            <ProductCard key={`${section.id}-${product.id}`} product={product} className="product-card-anim max-w-[260px] mx-auto w-full" />
          ))}
        </div>
      </div>
    </section>
  );
};

const PromoBannersSection = () => {
  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="container mx-auto px-4 md:px-8 mb-16">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
      >
        {/* Banner 1 */}
        <Link
          to="/category/toys-&-stationery"
          className="parallax-container w-full md:w-auto h-auto md:h-full flex-none snap-center rounded-2xl overflow-hidden shadow-sm group select-none relative block"
        >
          <img
            src="https://ik.imagekit.io/vrtbi4wsn/banners/banner-1.1.png"
            className="parallax-img w-full h-auto object-contain md:object-cover scale-110 transition-transform duration-500 group-hover:scale-[1.15] pointer-events-none"
            alt="Promo Banner 1"
          />
        </Link>

        {/* Banner 2 */}
        <Link
          to="/category/apparels"
          className="parallax-container w-full md:w-auto h-auto md:h-full flex-none snap-center rounded-2xl overflow-hidden shadow-sm group select-none relative block"
        >
          <img
            src="https://ik.imagekit.io/vrtbi4wsn/banners/banner-1.2.png"
            className="parallax-img w-full h-auto object-contain md:object-cover scale-110 transition-transform duration-500 group-hover:scale-[1.15] pointer-events-none"
            alt="Promo Banner 2"
          />
        </Link>

        {/* Banner 3 */}
        <Link
          to="/category/childcare"
          className="parallax-container w-full md:w-auto h-auto md:h-full flex-none snap-center rounded-2xl overflow-hidden shadow-sm group select-none relative block"
        >
          <img
            src="https://ik.imagekit.io/vrtbi4wsn/banners/banner-1.3.png"
            className="parallax-img w-full h-auto object-contain md:object-cover scale-110 transition-transform duration-500 group-hover:scale-[1.15] pointer-events-none"
            alt="Promo Banner 3"
          />
        </Link>
      </div>
    </section>
  );
};

const DualBannerSection = () => (
  <section className="container mx-auto px-4 md:px-8 mb-16">
    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
      <Link
        to="/category/toiletries"
        className="parallax-container rounded-2xl overflow-hidden shadow-sm group aspect-[2/1] h-auto md:aspect-auto md:h-[280px] block"
      >
        <img src="https://ik.imagekit.io/vrtbi4wsn/banners/banner1.4.jpg" className="parallax-img w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15]" alt="Special Offer 1" />
      </Link>
      <Link
        to="/category/baby-foods"
        className="parallax-container rounded-2xl overflow-hidden shadow-sm group aspect-[2/1] h-auto md:aspect-auto md:h-[280px] block"
      >
        <img src="https://ik.imagekit.io/vrtbi4wsn/banners/banner1.5.jpg" className="parallax-img w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15]" alt="Special Offer 2" />
      </Link>
    </div>
  </section>
);

const FullWidthBannerSection: React.FC<{ section: HomeSection }> = ({ section }) => {
  const banner = section.banners?.[0];
  if (!banner?.imageUrl) return null;

  const content = (
    <div className="parallax-container w-full rounded-2xl overflow-hidden shadow-sm group relative block aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1]">
      <img
        src={banner.imageUrl}
        className="parallax-img w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none"
        alt={section.title || "Full Width Promo Banner"}
      />
    </div>
  );

  return (
    <section className="container mx-auto px-4 md:px-8 mb-16 animate-in fade-in duration-500">
      {banner.link ? (
        <Link to={banner.link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
};

const DoubleBannerSection: React.FC<{ section: HomeSection }> = ({ section }) => {
  const banner1 = section.banners?.[0];
  const banner2 = section.banners?.[1];
  if (!banner1?.imageUrl && !banner2?.imageUrl) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 mb-16 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {banner1?.imageUrl && (
          banner1.link ? (
            <Link
              to={banner1.link}
              className="parallax-container rounded-2xl overflow-hidden shadow-sm group block w-full"
            >
              <img src={banner1.imageUrl} className="parallax-img w-full h-auto object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none" alt="Offer 1" />
            </Link>
          ) : (
            <div className="parallax-container rounded-2xl overflow-hidden shadow-sm group block w-full">
              <img src={banner1.imageUrl} className="parallax-img w-full h-auto object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none" alt="Offer 1" />
            </div>
          )
        )}
        {banner2?.imageUrl && (
          banner2.link ? (
            <Link
              to={banner2.link}
              className="parallax-container rounded-2xl overflow-hidden shadow-sm group block w-full"
            >
              <img src={banner2.imageUrl} className="parallax-img w-full h-auto object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none" alt="Offer 2" />
            </Link>
          ) : (
            <div className="parallax-container rounded-2xl overflow-hidden shadow-sm group block w-full">
              <img src={banner2.imageUrl} className="parallax-img w-full h-auto object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none" alt="Offer 2" />
            </div>
          )
        )}
      </div>
    </section>
  );
};

const TripleBannerSection: React.FC<{ section: HomeSection }> = ({ section }) => {
  const banner1 = section.banners?.[0];
  const banner2 = section.banners?.[1];
  const banner3 = section.banners?.[2];
  
  const activeBanners = useMemo(() => {
    return [banner1, banner2, banner3].filter((b): b is NonNullable<typeof b> => !!b?.imageUrl);
  }, [banner1, banner2, banner3]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 mb-16 animate-in fade-in duration-500">
      {/* Desktop view (static 3 columns) */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {activeBanners.map((banner, index) => {
          const content = (
            <div className="parallax-container rounded-2xl overflow-hidden shadow-sm group block w-full relative">
              <img
                src={banner.imageUrl}
                className="parallax-img w-full h-auto object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.15] pointer-events-none"
                alt={`Triple Banner Offer ${index + 1}`}
              />
            </div>
          );
          return (
            <div key={index} className="w-full">
              {banner.link ? (
                <Link to={banner.link} className="block w-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view (auto-sliding carousel) */}
      <div className="block md:hidden relative rounded-2xl overflow-hidden w-full aspect-[2.1/1] shadow-sm">
        <div className="relative w-full h-full">
          {activeBanners.map((banner, index) => {
            const content = (
              <div className="w-full h-full relative">
                <img
                  src={banner.imageUrl}
                  className="w-full h-full object-cover pointer-events-none"
                  alt={`Triple Banner Offer Mobile ${index + 1}`}
                />
              </div>
            );
            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {banner.link ? (
                  <Link to={banner.link} className="block w-full h-full">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
        
        {/* Navigation dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#e92c5d] w-5' : 'bg-white/50 w-1.5 hover:bg-white'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const BrandScroller: React.FC<{ brands: Brand[] }> = ({ brands }) => {
  const brandList = useMemo(() => {
    const dbBrands = (brands || []).filter(b => b.logo_url && b.logo_url.trim() !== '');
    if (dbBrands.length >= 6) return dbBrands;

    const fallbackBrands = [
      { id: 'fb1', name: 'Rovco', slug: 'rovco', logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb2', name: 'Farlin', slug: 'farlin', logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb3', name: 'Pampers', slug: 'pampers', logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb4', name: 'Huggies', slug: 'huggies', logo_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb5', name: 'Molfix', slug: 'molfix', logo_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb6', name: 'Johnson\'s', slug: 'johnsons', logo_url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb7', name: 'Gerber', slug: 'gerber', logo_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=200' },
      { id: 'fb8', name: 'Fisher-Price', slug: 'fisher-price', logo_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=200' }
    ];

    const merged = [...dbBrands];
    fallbackBrands.forEach(fb => {
      if (!merged.some(m => m.name.toLowerCase() === fb.name.toLowerCase()) && merged.length < 10) {
        merged.push(fb);
      }
    });
    return merged;
  }, [brands]);

  // Triple the items to ensure continuous infinite smooth marquee scroll
  const marqueeItems = useMemo(() => {
    if (brandList.length === 0) return [];
    return [...brandList, ...brandList, ...brandList];
  }, [brandList]);

  if (marqueeItems.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 mb-16">
      <div className="w-full py-8 bg-gray-50/70 rounded-2xl border border-gray-100/80 overflow-hidden relative">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-brands-scroll {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-33.33%, 0, 0); }
          }
          .animate-marquee-brands {
            display: flex;
            width: max-content;
            animation: marquee-brands-scroll 25s linear infinite;
          }
          .animate-marquee-brands:hover {
            animation-play-state: paused;
          }
          .gradient-overlay-left {
            background: linear-gradient(to right, #f9fafb, transparent);
          }
          .gradient-overlay-right {
            background: linear-gradient(to left, #f9fafb, transparent);
          }
        `}} />

        {/* Header Label */}
        <div className="px-6 md:px-10 mb-6 flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e92c5d] animate-pulse" />
            Shop By Brand
          </h3>
          <span className="h-[1px] flex-1 bg-gray-200/50 ml-4 hidden md:block" />
        </div>

        <div className="relative w-full overflow-hidden flex items-center">
          {/* Shadow overlays for elegant fade boundaries */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none gradient-overlay-left" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none gradient-overlay-right" />

          {/* Marquee Row */}
          <div className="animate-marquee-brands gap-8 md:gap-12 py-2 px-4">
            {marqueeItems.map((brand, idx) => {
              const hasLogo = brand.logo_url && brand.logo_url.trim() !== '';

              return (
                <Link 
                  key={`${brand.id}-${idx}`}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0 select-none"
                >
                  {/* Logo wrapper frame with exactly 50x50 px child image */}
                  <div className="w-[72px] h-[72px] rounded-full bg-white shadow-sm hover:shadow-md border border-gray-100 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 group-hover:border-rose-100 p-2 relative overflow-hidden">
                    {hasLogo ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        className="w-[50px] h-[50px] object-contain transition-all duration-300 filter grayscale-0 group-hover:grayscale"
                        onError={(e) => {
                          // Safe fallback on image load error
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallbackNode = document.createElement('div');
                            fallbackNode.className = 'w-full h-full rounded-full bg-rose-50 text-[#e92c5d] font-bold flex items-center justify-center text-lg';
                            fallbackNode.innerText = brand.name.charAt(0).toUpperCase();
                            parent.appendChild(fallbackNode);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-rose-50 text-[#e92c5d] font-bold flex items-center justify-center text-lg uppercase">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Micro Brand Label */}
                  <span className="text-[10px] md:text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                    {brand.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const { products, banners, homeSections, categories, brands } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Randomize products for "Best Items for you" section
  const randomProducts = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [products]);

  const sliderBanners = banners.filter(b => b.type === 'slider' && b.is_active);
  const rightTopBanner = banners.find(b => b.type === 'right_top' && b.is_active);
  const rightBottomBanner = banners.find(b => b.type === 'right_bottom' && b.is_active);

  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

  // GSAP Entrance Animations for the Hero Banner
  useEffect(() => {
    if (sliderBanners.length === 0) return;

    // Target elements inside the active slide container
    const activeSlideEl = sliderRef.current?.querySelector(`.slide-${currentSlide}`);
    if (!activeSlideEl) return;

    const textEls = activeSlideEl.querySelectorAll('.hero-text');
    const imageEl = activeSlideEl.querySelector('.hero-image');

    if (textEls.length > 0 || imageEl) {
      // Cancel any ongoing animations on these elements
      gsap.killTweensOf(textEls);
      gsap.killTweensOf(imageEl);

      // Instantly set properties to starting state
      gsap.set(textEls, { y: 50, opacity: 0 });
      gsap.set(imageEl, { scale: 1.1, opacity: 0 });

      // Run GSAP entrance animations with power2.out easing
      gsap.to(textEls, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
      });

      gsap.to(imageEl, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  }, [currentSlide, sliderBanners.length]);

  // GSAP ScrollTrigger Animations for Features Bar
  useEffect(() => {
    // Instantly hide the badges on mount so they don't flash
    gsap.set(".features-container .feature-badge", { y: -30, scale: 0.9, opacity: 0 });

    const triggerInstance = ScrollTrigger.create({
      trigger: ".features-container",
      start: "top 90%",
      onEnter: () => {
        gsap.to(".features-container .feature-badge", {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.5)",
          overwrite: "auto"
        });
      }
    });

    return () => {
      triggerInstance.kill();
    };
  }, []);

  // GSAP ScrollTrigger Animations for Best Items Section
  useEffect(() => {
    if (randomProducts.length === 0) return;

    // Instantly hide the product cards on mount so they don't flash
    gsap.set(".best-items-container .product-card-anim", { y: 30, opacity: 0 });

    const triggerInstance = ScrollTrigger.create({
      trigger: ".best-items-container",
      start: "top 90%",
      onEnter: () => {
        gsap.to(".best-items-container .product-card-anim", {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });

    return () => {
      triggerInstance.kill();
    };
  }, [randomProducts.length]);

  // GSAP ScrollTrigger Animations for Banner Parallax
  useEffect(() => {
    const containers = document.querySelectorAll('.parallax-container');
    const triggers: ScrollTrigger[] = [];

    containers.forEach(container => {
      const img = container.querySelector('.parallax-img');
      if (!img) return;

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.to(img, {
            yPercent: -15 * self.progress,
            ease: "none",
            overwrite: "auto"
          });
        }
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach(t => t.kill());
    };
  }, [banners.length]);

  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full bg-white pb-20">

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slider (Left 2/3) */}
          <div ref={sliderRef} className="lg:col-span-2 relative rounded-xl overflow-hidden h-[280px] md:h-[450px]">
            {sliderBanners.length > 0 ? (
              <>
                {sliderBanners.map((banner, idx) => {
                  const linkStr = banner.link || '';
                  
                  // Parse customized settings from link field
                  const parts = linkStr.split('|');
                  const actualLink = parts[0] || '';
                  let align = 'left';
                  let color = 'light';
                  let show_btn = 'true';
                  let desc = '';

                  for (let i = 1; i < parts.length; i++) {
                    const part = parts[i];
                    if (part.startsWith('align:')) align = part.substring(6);
                    else if (part.startsWith('color:')) color = part.substring(6);
                    else if (part.startsWith('show_btn:')) show_btn = part.substring(9);
                    else if (part.startsWith('desc:')) desc = decodeURIComponent(part.substring(5));
                  }

                  const isDarkText = color === 'dark';

                  return (
                    <div key={banner.id} className={`slide-${idx} absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover hero-image" />
                      {(banner.title || banner.subtitle || desc) && (
                        <div className={`absolute top-1/2 -translate-y-1/2 max-w-[85%] md:max-w-md drop-shadow-md p-3 md:p-4 flex flex-col ${isDarkText ? 'text-gray-900' : 'text-white'} ${align === 'right' ? 'right-4 md:right-12 items-end text-right' : 'left-4 md:left-12 items-start text-left'}`}>
                          {banner.subtitle && (
                            <p className={`hero-text px-2 py-0.5 md:px-3 md:py-1 rounded w-fit font-bold uppercase tracking-wider mb-2 md:mb-4 text-[10px] md:text-xs ${isDarkText ? 'bg-rose-500 text-white shadow-sm' : 'text-[#e92c5d] bg-white/90 shadow-sm'}`}>
                              {banner.subtitle}
                            </p>
                          )}
                          {banner.title && (
                            <h2 className={`hero-text text-xl md:text-5xl font-black leading-tight mb-2 md:mb-3 ${isDarkText ? 'text-gray-900 drop-shadow-none' : 'text-white'}`} style={{ textShadow: isDarkText ? 'none' : '0 2px 8px rgba(0,0,0,0.4)' }}>
                              {banner.title}
                            </h2>
                          )}
                          {desc && (
                            <p className={`hero-text text-[10px] md:text-sm mb-3 md:mb-6 font-semibold max-w-sm ${isDarkText ? 'text-gray-700' : 'text-white/90'}`} style={{ textShadow: isDarkText ? 'none' : '0 1px 4px rgba(0,0,0,0.4)' }}>
                              {desc}
                            </p>
                          )}
                          {show_btn === 'true' && (
                            <a href={actualLink || '/products'} className="hero-text inline-block bg-[#e92c5d] hover:bg-[#c81d4a] text-white px-5 py-2 md:px-8 md:py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-rose-500/50 uppercase tracking-widest text-[9px] md:text-xs">
                              Shop Now ➝
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {sliderBanners.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {sliderBanners.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[#e92c5d] w-8' : 'bg-white/50 w-2 hover:bg-white'}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-[#fdf2f5] relative">
                  <img src="https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" alt="delivery" />
                  <div className="absolute inset-0 bg-rose-500/10"></div>
                </div>
                <div className="w-1/2 relative">
                  <img src="https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="farmer" />
                </div>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-[#e92c5d] z-20">
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-[#e92c5d] z-20">
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right Banners (Right 1/3) */}
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 lg:gap-6 h-full pb-2 lg:pb-0">
            {/* Top Banner */}
            {rightTopBanner ? (() => {
              const linkStr = rightTopBanner.link || '';
              const parts = linkStr.split('|');
              const actualLink = parts[0] || '';
              let align = 'left';
              let color = 'light';
              let show_btn = 'true';
              let desc = '';

              for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith('align:')) align = part.substring(6);
                else if (part.startsWith('color:')) color = part.substring(6);
                else if (part.startsWith('show_btn:')) show_btn = part.substring(9);
                else if (part.startsWith('desc:')) desc = decodeURIComponent(part.substring(5));
              }

              const isDarkText = color === 'dark';
              const isRightAlign = align === 'right';

              return (
                <div className={`rounded-xl relative overflow-hidden flex flex-col justify-center group h-[135px] lg:h-[215px] lg:flex-1 p-3 lg:p-8 ${isRightAlign ? 'items-end' : 'items-start'}`}>
                  <img src={rightTopBanner.image_url} alt={rightTopBanner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {!isDarkText && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>}
                  <div className={`relative z-10 w-full flex flex-col ${isRightAlign ? 'items-end text-right' : 'items-start text-left'}`}>
                    {rightTopBanner.subtitle && (
                      <span className={`font-black text-[8px] lg:text-xs mb-1 lg:mb-2 block uppercase tracking-wider ${isDarkText ? 'text-[#e92c5d]' : 'text-rose-300'}`}>
                        {rightTopBanner.subtitle}
                      </span>
                    )}
                    {rightTopBanner.title && (
                      <h3 
                        className={`text-xs lg:text-2xl font-black mb-1 lg:mb-2 leading-tight ${isDarkText ? 'text-gray-900' : 'text-white'}`}
                        style={{ textShadow: isDarkText ? 'none' : '0 2px 4px rgba(0,0,0,0.3)' }}
                      >
                        {rightTopBanner.title}
                      </h3>
                    )}
                    {desc && (
                      <p 
                        className={`text-[8px] lg:text-xs mb-2 lg:mb-4 max-w-[80%] font-semibold leading-relaxed ${isDarkText ? 'text-gray-600' : 'text-white/80'}`}
                        style={{ textShadow: isDarkText ? 'none' : '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {desc}
                      </p>
                    )}
                    {show_btn === 'true' && (
                      <a 
                        href={actualLink || '/products'} 
                        className="inline-flex items-center justify-center gap-1 bg-[#e92c5d] hover:bg-[#c81d4a] text-white px-3 py-1 lg:px-5 lg:py-2 rounded-full font-bold text-[8px] lg:text-xs transition-all shadow-md hover:shadow-rose-500/30 uppercase tracking-widest w-fit"
                      >
                        Shop Now <ArrowRight size={10} className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="rounded-xl bg-[#fdf2f5] relative overflow-hidden border border-rose-50 h-[135px] lg:h-[215px] lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:p-6 group">
                <div className="absolute top-0 left-0 bottom-0 z-20 w-[60%] flex flex-col justify-center pl-3 lg:static lg:w-full lg:block lg:pl-0">
                  <span className="text-[#e92c5d] font-bold text-[8px] lg:text-xs mb-0.5 lg:mb-1 block uppercase tracking-wider">Only This Week</span>
                  <h3 className="text-[10px] lg:text-xl font-bold text-gray-800 mb-0.5 lg:mb-1 leading-tight break-words">Quality eggs <br className="lg:hidden" /> at an price</h3>
                  <p className="text-gray-500 text-[8px] lg:text-xs mb-1.5 lg:mb-4">Eat one every day</p>
                  <button className="bg-[#e92c5d] text-white text-[8px] lg:text-xs px-2 lg:px-5 py-1 lg:py-2.5 rounded-full font-bold hover:bg-[#c81d4a] transition-colors flex items-center gap-1 lg:gap-2 group w-fit">
                    Shop Now <ArrowRight size={8} className="lg:w-3.5 lg:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-[65%] lg:w-40 lg:h-40 lg:top-auto lg:bottom-[-8px] lg:right-[-16px] z-10">
                  <img src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-contain object-right-bottom mix-blend-multiply lg:opacity-100" alt="eggs" />
                </div>
              </div>
            )}

            {/* Bottom Banner */}
            {rightBottomBanner ? (() => {
              const linkStr = rightBottomBanner.link || '';
              const parts = linkStr.split('|');
              const actualLink = parts[0] || '';
              let align = 'left';
              let color = 'light';
              let show_btn = 'true';
              let desc = '';

              for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith('align:')) align = part.substring(6);
                else if (part.startsWith('color:')) color = part.substring(6);
                else if (part.startsWith('show_btn:')) show_btn = part.substring(9);
                else if (part.startsWith('desc:')) desc = decodeURIComponent(part.substring(5));
              }

              const isDarkText = color === 'dark';
              const isRightAlign = align === 'right';

              return (
                <div className={`rounded-xl relative overflow-hidden flex flex-col justify-center group h-[135px] lg:h-[215px] lg:flex-1 p-3 lg:p-8 ${isRightAlign ? 'items-end' : 'items-start'}`}>
                  <img src={rightBottomBanner.image_url} alt={rightBottomBanner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {!isDarkText && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>}
                  <div className={`relative z-10 w-full flex flex-col ${isRightAlign ? 'items-end text-right' : 'items-start text-left'}`}>
                    {rightBottomBanner.subtitle && (
                      <span className={`font-black text-[8px] lg:text-xs mb-1 lg:mb-2 block uppercase tracking-wider ${isDarkText ? 'text-[#e92c5d]' : 'text-rose-300'}`}>
                        {rightBottomBanner.subtitle}
                      </span>
                    )}
                    {rightBottomBanner.title && (
                      <h3 
                        className={`text-xs lg:text-2xl font-black mb-1 lg:mb-2 leading-tight ${isDarkText ? 'text-gray-900' : 'text-white'}`}
                        style={{ textShadow: isDarkText ? 'none' : '0 2px 4px rgba(0,0,0,0.3)' }}
                      >
                        {rightBottomBanner.title}
                      </h3>
                    )}
                    {desc && (
                      <p 
                        className={`text-[8px] lg:text-xs mb-2 lg:mb-4 max-w-[80%] font-semibold leading-relaxed ${isDarkText ? 'text-gray-600' : 'text-white/80'}`}
                        style={{ textShadow: isDarkText ? 'none' : '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {desc}
                      </p>
                    )}
                    {show_btn === 'true' && (
                      <a 
                        href={actualLink || '/products'} 
                        className="inline-flex items-center justify-center gap-1 bg-[#e92c5d] hover:bg-[#c81d4a] text-white px-3 py-1 lg:px-5 lg:py-2 rounded-full font-bold text-[8px] lg:text-xs transition-all shadow-md hover:shadow-rose-500/30 uppercase tracking-widest w-fit"
                      >
                        Shop Now <ArrowRight size={10} className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="rounded-xl bg-[#fff5f5] relative overflow-hidden border border-red-50 h-[135px] lg:h-[215px] lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:p-6 group">
                <div className="absolute top-0 left-0 bottom-0 z-20 w-[60%] flex flex-col justify-center pl-3 lg:static lg:w-full lg:block lg:pl-0">
                  <span className="text-[#e92c5d] font-bold text-[8px] lg:text-xs mb-0.5 lg:mb-1 block uppercase tracking-wider">Fuel Your Day</span>
                  <h3 className="text-[10px] lg:text-xl font-bold text-gray-800 mb-0.5 lg:mb-1 leading-tight break-words">Nutritious bites <br className="lg:hidden" /> for mind</h3>
                  <p className="text-gray-500 text-[8px] lg:text-xs mb-1.5 lg:mb-4">Start fresh...</p>
                  <button className="bg-[#e92c5d] text-white text-[8px] lg:text-xs px-2 lg:px-5 py-1 lg:py-2.5 rounded-full font-bold hover:bg-[#c81d4a] transition-colors flex items-center gap-1 lg:gap-2 group w-fit">
                    Shop Now <ArrowRight size={8} className="lg:w-3.5 lg:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-[65%] lg:w-40 lg:h-40 lg:top-auto lg:bottom-[-8px] lg:right-[-16px] z-10">
                  <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-contain object-right-bottom mix-blend-multiply lg:opacity-100" alt="fruits" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-container container mx-auto px-4 md:px-8 mb-12">
        <div className="bg-[#f7f8f3] rounded-2xl p-6 md:p-8">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex overflow-x-auto md:grid md:grid-cols-5 gap-4 md:gap-8 scrollbar-hide cursor-grab active:cursor-grabbing snap-x"
          >
            {[
              { icon: Headphones, title: 'Online Support' },
              { icon: ShieldCheck, title: 'Official Product' },
              { icon: Truck, title: 'Fastest Delivery' },
              { icon: Award, title: 'Secure Payment' },
              { icon: Award, title: 'Genuine Product' },
            ].map((feat, idx) => (
              <div key={idx} className="feature-badge flex items-center gap-2 md:gap-3 min-w-[140px] md:min-w-0 flex-shrink-0 snap-start px-1 md:px-0 select-none">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e92c5d] text-white rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                  <feat.icon size={20} className="md:w-6 md:h-6" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] md:text-sm text-gray-800 leading-tight">{feat.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Home Sections */}
      {homeSections
        .filter(s => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(section => {
          let items = products;
          if (section.filterType === 'sale') items = items.filter(p => p.originalPrice && p.originalPrice > p.price);
          else if (section.filterType === 'featured') items = items.filter(p => p.isFeatured);
          else if (section.filterType === 'category' && section.filterValue) {
            // Recursive category filtering
            // 1. Find the target category object
            const targetCategory = categories.find(c => c.name === section.filterValue);
            if (targetCategory) {
              // 2. Find all descendant category IDs
              const getDescendantIds = (parentId: string): string[] => {
                const children = categories.filter(c => c.parentId === parentId);
                let ids = children.map(c => c.id);
                children.forEach(c => {
                  ids = [...ids, ...getDescendantIds(c.id)];
                });
                return ids;
              };
              const validCategoryIds = [targetCategory.id, ...getDescendantIds(targetCategory.id)];

              // 3. Filter products whose category name matches any of the valid category names
              // (Since products store category name as string, we map back to names)
              const validCategoryNames = categories
                .filter(c => validCategoryIds.includes(c.id))
                .map(c => c.name);

              items = items.filter(p => validCategoryNames.includes(p.category));
            } else {
              // Fallback if category object not found (legacy behavior)
              items = items.filter(p => p.category === section.filterValue);
            }
          }

          let sectionContent = null;
          if (section.type === 'banner-full') {
            sectionContent = <FullWidthBannerSection key={section.id} section={section} />;
          } else if (section.type === 'banner-double') {
            sectionContent = <DoubleBannerSection key={section.id} section={section} />;
          } else if (section.type === 'banner-triple') {
            sectionContent = <TripleBannerSection key={section.id} section={section} />;
          } else if (items.length === 0) {
            sectionContent = (
              <section key={section.id} className="container mx-auto px-4 md:px-8 mb-16 opacity-50">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-gray-300 pl-4 mb-6">{section.title}</h2>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
                  <p className="text-gray-400 font-bold mb-2">No items found for this section.</p>
                  <p className="text-xs text-gray-400">Filter: {section.filterType} {section.filterValue ? `(${section.filterValue})` : ''}</p>
                </div>
              </section>
            );
          } else if (section.type === 'slider') {
            sectionContent = <SliderSection key={section.id} section={section} products={items} />;
          } else if (section.type === 'grid' || section.type === 'grid-no-banner') {
            sectionContent = <GridSection key={section.id} section={section} products={items} />;
          }

          if (sectionContent && section.title === 'Meat & Fish') {
            return (
              <React.Fragment key={`${section.id}-group`}>
                <PromoBannersSection />
                {sectionContent}
                <DualBannerSection />
              </React.Fragment>
            );
          }

          return sectionContent;
        })}

      {/* Best Items for you Section */}
      <section className="best-items-container container mx-auto px-4 md:px-8 mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 border-l-4 border-[#e92c5d] pl-4">Best Items for you</h2>
          <Link to="/products" className="text-[10px] md:text-sm font-bold text-[#e92c5d] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">View All Items <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
          {randomProducts.map(product => (
            <ProductCard key={`best-${product.id}`} product={product} className="product-card-anim max-w-[260px] mx-auto w-full" />
          ))}
        </div>
      </section>

      <BrandScroller brands={brands} />

    </div>
  );
};

export default Home;
