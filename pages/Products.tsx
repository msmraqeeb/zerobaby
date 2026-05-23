
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, ChevronDown, Search, RotateCcw, Check, Star, Coins, X } from 'lucide-react';
import { Category } from '../types';

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0): CategoryNode[] => {
  return categories
    .filter(cat => cat.parentId == parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id, level + 1),
      level
    }));
};

const CategorySidebarItem: React.FC<{
  category: CategoryNode;
  selectedCategory: string;
  onSelect: (name: string) => void;
  selectedCategoryFamily: string[];
}> = ({ category, selectedCategory, onSelect, selectedCategoryFamily }) => {
  // Auto-expand if this category or any child is selected, or if it's a top-level parent of the selection
  const isSelected = selectedCategory === category.name;
  const isPathActive = selectedCategoryFamily.includes(category.name);

  const [isExpanded, setIsExpanded] = useState(isPathActive);

  // Update expansion when selection changes
  useEffect(() => {
    if (isPathActive) setIsExpanded(true);
  }, [isPathActive]);

  const hasChildren = category.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isSelected ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'}`}
        onClick={() => onSelect(category.name)}
        style={{ paddingLeft: `${(category.level * 12) + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {/* Only show leaf indicator if it's a child */}
          {category.level > 0 && !hasChildren && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
          <span className={`${isSelected ? 'font-bold' : ''}`}>{category.name}</span>
        </div>

        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children.map(child => (
            <CategorySidebarItem
              key={child.id}
              category={child}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              selectedCategoryFamily={selectedCategoryFamily}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Products: React.FC = () => {
  const { products, categories, searchQuery, brands, reviews } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Helper to find all descendant category names for a given parent name
  const selectedCategoryFamily = useMemo(() => {
    if (selectedCategory === 'All') return [];

    const getDescendantNames = (catName: string): string[] => {
      const currentCat = categories.find(c => c.name === catName);
      if (!currentCat) return [catName];

      let names = [catName];
      const directChildren = categories.filter(c => c.parentId === currentCat.id); // Loose equality handled by string/null checks in StoreContext but verifying logic consistency

      directChildren.forEach(child => {
        names = [...names, ...getDescendantNames(child.name)];
      });

      return names;
    };

    // Also find ancestors to keep them expanded
    const family = getDescendantNames(selectedCategory);

    // Add ancestors
    let curr = categories.find(c => c.name === selectedCategory);
    while (curr && curr.parentId) {
      const parent = categories.find(c => c.id === curr!.parentId);
      if (parent) {
        family.push(parent.name);
        curr = parent;
      } else {
        break;
      }
    }

    return family;
  }, [selectedCategory, categories]);

  const location = useLocation();

  // Sync URL category param with state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(decodeURIComponent(catParam));
    }
  }, [location.search]);

  // Get all descendant categories for filtering products
  const categoryProducts = useMemo(() => {
    const getDescendantsOnly = (catName: string): string[] => {
      if (catName === 'All') return [];
      const currentCat = categories.find(c => c.name === catName);
      if (!currentCat) return [catName];
      let names = [catName];
      categories.filter(c => c.parentId === currentCat.id).forEach(child => {
        names = [...names, ...getDescendantsOnly(child.name)];
      });
      return names;
    };
    const filterCategories = selectedCategory === 'All' ? [] : getDescendantsOnly(selectedCategory);

    return products.filter(p => {
      const categoryMatch = selectedCategory === 'All' || filterCategories.includes(p.category);
      return categoryMatch;
    });
  }, [products, categories, selectedCategory]);

  // Price Range Logic
  const [minMax, setMinMax] = useState<[number, number]>([0, 10000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Initialize price range based on current category products
  useEffect(() => {
    if (categoryProducts.length > 0) {
      const prices = categoryProducts.map(p => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinMax([min, max]);
      setPriceRange([min, max]); // Initialize selection to active category range
    } else {
      setMinMax([0, 10000]);
      setPriceRange([0, 10000]);
    }
  }, [categoryProducts]);

  // Dynamic Attribute Logic
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Reset attributes and brands when category changes to avoid stale filters
  useEffect(() => {
    setSelectedAttributes({});
    setSelectedBrands([]);
  }, [selectedCategory]);

  // Available attributes for filter sidebar inside selected category
  const availableAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};
    categoryProducts.forEach(p => {
      if (p.variants) {
        p.variants.forEach(v => {
          Object.entries(v.attributeValues).forEach(([key, val]) => {
            if (!attrs[key]) attrs[key] = new Set();
            attrs[key].add(val);
          });
        });
      }
    });

    return Object.entries(attrs).reduce((acc, [key, valSet]) => {
      acc[key] = Array.from(valSet).sort();
      return acc;
    }, {} as Record<string, string[]>);
  }, [categoryProducts]);

  // Compute available brands based on the active category products
  const availableBrands = useMemo(() => {
    const activeBrandNames = new Set(
      categoryProducts
        .map(p => p.brand)
        .filter((b): b is string => !!b)
    );
    return brands.filter(brand => activeBrandNames.has(brand.name));
  }, [brands, categoryProducts]);

  const toggleAttribute = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[attrName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newState = { ...prev, [attrName]: newValues };
      if (newValues.length === 0) delete newState[attrName];
      return newState;
    });
  };

  const filteredProducts = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const showSaleOnly = searchParams.get('filter') === 'sale';

    return categoryProducts.filter(p => {
      const searchMatch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const brandMatch = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand));

      let ratingMatch = true;
      if (selectedMinRating !== null) {
        const prodReviews = reviews.filter(r => r.productId === p.id);
        const avg = prodReviews.length > 0 ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length : 0;
        ratingMatch = avg >= selectedMinRating;
      }

      const saleMatch = !showSaleOnly || (p.originalPrice !== undefined && p.originalPrice > p.price);

      // Price Match Logic
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];

      // Attribute Match Logic
      const attributeMatch = Object.entries(selectedAttributes).every(([attrName, selectedValues]) => {
        if (!p.variants) return false;
        return p.variants.some(v =>
          v.attributeValues[attrName] && selectedValues.includes(v.attributeValues[attrName])
        );
      });

      return searchMatch && brandMatch && ratingMatch && saleMatch && attributeMatch && priceMatch;
    });
  }, [categoryProducts, searchQuery, selectedBrands, selectedMinRating, reviews, location.search, selectedAttributes, priceRange]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedMinRating(null);
    setSelectedAttributes({});
    if (products.length > 0) {
      setPriceRange(minMax);
    } else {
      setPriceRange([0, 10000]);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="hidden lg:block lg:w-72 space-y-8 shrink-0">
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} className="text-rose-500" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {categoryTree.map(cat => (
                  <CategorySidebarItem
                    key={cat.id}
                    category={cat}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                    selectedCategoryFamily={selectedCategoryFamily}
                  />
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-rose-500" />
                  Price Range
                </div>
                <span className="text-xs font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                  ৳{priceRange[0]} - ৳{priceRange[1]}
                </span>
              </h3>

              <div className="relative h-2 w-full bg-gray-100 rounded-full mb-6">
                {/* Track Fill */}
                <div
                  className="absolute h-full bg-rose-500 rounded-full"
                  style={{
                    left: `${((priceRange[0] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`,
                    right: `${100 - ((priceRange[1] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`
                  }}
                ></div>

                {/* Range Inputs */}
                <input
                  type="range"
                  min={minMax[0]}
                  max={minMax[1]}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                    setPriceRange([val, priceRange[1]]);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-500 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer outline-none z-30"
                />
                <input
                  type="range"
                  min={minMax[0]}
                  max={minMax[1]}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                    setPriceRange([priceRange[0], val]);
                  }}
                  className="absolute w-full h-full top-0 left-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-500 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer outline-none z-40"
                />
              </div>

              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>৳{minMax[0]}</span>
                <span>৳{minMax[1]}</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-rose-500" />
                Brands
              </h3>
              <div className="space-y-2">
                {availableBrands.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No brands found</p>
                ) : (
                  availableBrands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => toggleBrand(brand.name)}
                          className="peer h-5 w-5 appearance-none rounded border-2 border-gray-200 checked:bg-rose-500 checked:border-rose-500 transition-all"
                        />
                        <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-rose-500 transition-colors">{brand.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Dynamic Attribute Filter */}
            {Object.entries(availableAttributes).map(([attrName, values]) => (
              <div key={attrName} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {attrName}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {values.map(val => (
                    <label key={val} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedAttributes[attrName]?.includes(val) || false}
                          onChange={() => toggleAttribute(attrName, val)}
                          className="peer h-5 w-5 appearance-none rounded border-2 border-gray-200 checked:bg-rose-500 checked:border-rose-500 transition-all"
                        />
                        <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-rose-500 transition-colors">{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Rating Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Customer Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(stars => (
                  <button
                    key={stars}
                    onClick={() => setSelectedMinRating(stars)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedMinRating === stars ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} className={i < stars ? "" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="font-medium">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-gray-400 hover:text-rose-500 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <RotateCcw size={16} />
              Reset All Filters
            </button>
          </aside>

          {/* Product Listing Main Area */}
          <main className="flex-1 space-y-6">
            {/* Desktop Header Layout */}
            <div className="hidden lg:flex bg-white p-4 rounded-2xl border border-gray-100 shadow-sm justify-between items-center gap-4 w-full">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> results
                {selectedCategory !== 'All' && <span className="hidden sm:inline"> in <span className="text-rose-500 font-bold">{selectedCategory}</span></span>}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                  <span className="text-gray-400 font-medium hidden sm:inline">Sort by:</span>
                  <select className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 md:px-3 md:py-1.5 font-bold text-gray-700 outline-none focus:border-rose-500 text-xs md:text-sm">
                    <option>Default Sorting</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Average Rating</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Header Layout */}
            <div className="flex lg:hidden bg-white p-4 rounded-2xl border border-gray-100 shadow-sm justify-between items-center gap-3 w-full">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <p className="text-xs font-bold text-gray-500 shrink-0">
                  Showing <span className="text-gray-800 font-black">{filteredProducts.length}</span>
                </p>
                <div className="h-4 w-[1px] bg-gray-200 shrink-0"></div>
                <select className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 font-bold text-gray-700 outline-none focus:border-rose-500 text-xs truncate max-w-[130px] flex-1">
                  <option>Default Sorting</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Average Rating</option>
                  <option>Newest First</option>
                </select>
              </div>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-[#e92c5d] hover:bg-[#c81d4a] text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-sm"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>


            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-xs">We couldn't find any products matching your current filters. Try adjusting your selection!</p>
                <button onClick={resetFilters} className="mt-8 bg-rose-500 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-600 transition-all">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsFilterOpen(false)}
          ></div>
          
          {/* Drawer content */}
          <div className="relative flex-grow flex flex-col max-w-xs w-full bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-rose-500" /> Filters
              </h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-8 pb-10">
              {/* Reset Action */}
              <button
                onClick={() => { resetFilters(); setIsFilterOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-rose-500 bg-white border border-gray-100 rounded-xl shadow-sm transition-all"
              >
                <RotateCcw size={14} />
                Reset All
              </button>

              {/* Category Filter */}
              <div className="space-y-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Filter size={14} className="text-rose-500" /> Categories
                </h3>
                <button
                  onClick={() => { setSelectedCategory('All'); setIsFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {categoryTree.map(cat => (
                  <CategorySidebarItem
                    key={cat.id}
                    category={cat}
                    selectedCategory={selectedCategory}
                    onSelect={(name) => { setSelectedCategory(name); setIsFilterOpen(false); }}
                    selectedCategoryFamily={selectedCategoryFamily}
                  />
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-2"><Coins size={14} className="text-rose-500" /> Price Range</span>
                  <span className="bg-gray-50 px-2 py-0.5 rounded text-[10px] text-rose-600 font-black">
                    ৳{priceRange[0]} - ৳{priceRange[1]}
                  </span>
                </h3>
                <div className="relative h-2 w-full bg-gray-100 rounded-full mb-4">
                  <div
                    className="absolute h-full bg-rose-500 rounded-full"
                    style={{
                      left: `${((priceRange[0] - minMax[0]) / Math.max(1, minMax[1] - minMax[0])) * 100}%`,
                      right: `${100 - ((priceRange[1] - minMax[0]) / Math.max(1, minMax[1] - minMax[0])) * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min={minMax[0]}
                    max={minMax[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                      setPriceRange([val, priceRange[1]]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:appearance-none outline-none z-30"
                  />
                  <input
                    type="range"
                    min={minMax[0]}
                    max={minMax[1]}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                      setPriceRange([priceRange[0], val]);
                    }}
                    className="absolute w-full h-full top-0 left-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:appearance-none outline-none z-40"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>৳{minMax[0]}</span>
                  <span>৳{minMax[1]}</span>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-rose-500" /> Brands
                </h3>
                <div className="space-y-2">
                  {availableBrands.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No brands found</p>
                  ) : (
                    availableBrands.map(brand => (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => toggleBrand(brand.name)}
                            className="peer h-4.5 w-4.5 appearance-none rounded border-2 border-gray-200 checked:bg-rose-500 checked:border-rose-500 transition-all"
                          />
                          <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{brand.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic Attribute Filter */}
              {Object.entries(availableAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    {attrName}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {values.map(val => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedAttributes[attrName]?.includes(val) || false}
                            onChange={() => toggleAttribute(attrName, val)}
                            className="peer h-4.5 w-4.5 appearance-none rounded border-2 border-gray-200 checked:bg-rose-500 checked:border-rose-500 transition-all"
                          />
                          <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Rating Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Rating</h3>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map(stars => (
                    <button
                      key={stars}
                      onClick={() => { setSelectedMinRating(stars); setIsFilterOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedMinRating === stars ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < stars ? "currentColor" : "none"} className={i < stars ? "" : "text-gray-200"} />
                        ))}
                      </div>
                      <span className="font-medium">& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
