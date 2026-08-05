'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES as MOCK_CATEGORIES, MATERIALS as MOCK_MATERIALS } from '@/lib/mockData';
import { SearchIcon } from '@/components/icons/SvgIcons';
import { useSupabaseProducts, useSupabaseCategories, useSupabaseMaterials } from '@/lib/supabaseSync';

export default function CatalogPage() {
  const { products } = useSupabaseProducts();
  const { categories: dbCategories } = useSupabaseCategories();
  const { materials: dbMaterials } = useSupabaseMaterials();

  const categoriesList = dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES;
  const materialsList = dbMaterials.length > 0 ? dbMaterials : MOCK_MATERIALS;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('DEFAULT');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Compute price boundaries from product data
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map((p) => p.priceCash);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Initialize price range on first render
  const effectiveMin = priceRange[0] || priceBounds.min;
  const effectiveMax = priceRange[1] || priceBounds.max;

  // Filter and Sort Logic
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'ALL' || p.category.id === selectedCategory;
      const matchesMaterial = selectedMaterial === 'ALL' || p.material.id === selectedMaterial;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.priceCash >= effectiveMin && p.priceCash <= effectiveMax;
      return matchesCategory && matchesMaterial && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW_HIGH') {
        return a.priceCash - b.priceCash;
      }
      if (sortBy === 'PRICE_HIGH_LOW') {
        return b.priceCash - a.priceCash;
      }
      if (sortBy === 'NAME_AZ') {
        return a.name.localeCompare(b.name);
      }
      return 0; // DEFAULT
    });

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedMaterial('ALL');
    setSearchQuery('');
    setSortBy('DEFAULT');
    setPriceRange([0, 0]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#33312e]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="badge-gold text-xs font-semibold tracking-widest uppercase mb-2 inline-block px-3 py-1 rounded-full">
              Catálogo General
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Todas nuestras Joyas
            </h1>
          </div>
          <span className="text-xs text-gray-300 font-sans bg-white/10 px-4 py-2 rounded-full border border-white/10 w-fit">
            Mostrando <strong className="text-gold font-bold">{filteredProducts.length}</strong> productos disponibles
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Filter and Sorting Control Bar */}
        <div className="stitch-card p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 font-sans">
                Buscador:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-sans border border-[#e8e3da] rounded-full focus:ring-2 focus:ring-gold focus:outline-none"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 font-sans">
                Categoría:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-sans border border-[#e8e3da] rounded-full focus:ring-2 focus:ring-gold focus:outline-none bg-white cursor-pointer"
              >
                <option value="ALL">Todas las Categorías</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 font-sans">
                Material:
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-sans border border-[#e8e3da] rounded-full focus:ring-2 focus:ring-gold focus:outline-none bg-white cursor-pointer"
              >
                <option value="ALL">Todos los Materiales</option>
                {materialsList.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 font-sans">
                Precio Contado:
              </label>
              <div className="space-y-1">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={1000}
                  value={effectiveMax}
                  onChange={(e) => setPriceRange([effectiveMin, parseInt(e.target.value)])}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-numeric">
                  <span>${priceBounds.min.toLocaleString('es-AR')}</span>
                  <span className="font-bold text-gold text-xs">
                    Hasta ${effectiveMax.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sort By Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 font-sans">
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#e8e3da] rounded-full focus:ring-2 focus:ring-gold focus:outline-none bg-[#fdf9f0] font-semibold text-gray-800 cursor-pointer"
              >
                <option value="DEFAULT">Relevancia / Novedades</option>
                <option value="PRICE_LOW_HIGH">Precio: Menor a Mayor</option>
                <option value="PRICE_HIGH_LOW">Precio: Mayor a Menor</option>
                <option value="NAME_AZ">Nombre (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="stitch-card p-12 text-center max-w-md mx-auto my-12">
            <SearchIcon className="w-10 h-10 text-gold mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-1">No hay resultados</h3>
            <p className="text-xs text-gray-500 mb-5 font-sans">No encontramos joyas que coincidan con los filtros seleccionados.</p>
            <button
              onClick={handleResetFilters}
              className="btn-stitch-gold text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer shadow-sm"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

