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
      <div className="bg-[#121212] text-white py-10 px-4 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-widest block mb-1">
              Catálogo General
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Todas nuestras Joyas
            </h1>
          </div>
          <span className="text-xs text-gray-400">
            Mostrando {filteredProducts.length} productos disponibles
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {/* Filter and Sorting Control Bar */}
        <div className="bg-white p-6 rounded-lg border border-[#e5e0d8] shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Buscador:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre o código SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Categoría:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none bg-white"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Material:
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none bg-white"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Precio Contado (hasta):
              </label>
              <div className="space-y-1">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={1000}
                  value={effectiveMax}
                  onChange={(e) => setPriceRange([effectiveMin, parseInt(e.target.value)])}
                  className="w-full accent-[#c5a059]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>${priceBounds.min.toLocaleString('es-AR')}</span>
                  <span className="font-bold text-[#c5a059] text-xs">
                    Hasta ${effectiveMax.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sort By Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none bg-[#fcf8f0] font-semibold text-gray-800"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg border border-[#e5e0d8] text-center max-w-md mx-auto my-12">
            <SearchIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">No hay resultados</h3>
            <p className="text-xs text-gray-500 mb-4">No encontramos joyas que coincidan con los filtros seleccionados.</p>
            <button
              onClick={handleResetFilters}
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-semibold text-xs uppercase px-5 py-2.5 rounded btn-animate cursor-pointer shadow"
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
