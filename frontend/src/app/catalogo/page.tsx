'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS, CATEGORIES, MATERIALS, ProductItem } from '@/lib/mockData';
import { SearchIcon } from '@/components/icons/SvgIcons';

export default function CatalogPage() {
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('DEFAULT');
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);

  // Filter and Sort Logic
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'ALL' || p.category.id === selectedCategory;
      const matchesMaterial = selectedMaterial === 'ALL' || p.material.id === selectedMaterial;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesMaterial && matchesSearch;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {CATEGORIES.map((cat) => (
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
                {MATERIALS.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
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
                onSelect={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg border border-[#e5e0d8] text-center max-w-md mx-auto my-12">
            <SearchIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">No hay resultados</h3>
            <p className="text-xs text-gray-500 mb-4">No encontramos joyas que coincidan con los filtros seleccionados.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedMaterial('ALL');
                setSearchQuery('');
                setSortBy('DEFAULT');
              }}
              className="bg-[#c5a059] text-black font-semibold text-xs uppercase px-4 py-2 rounded"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-fadeIn">
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#121212] text-[#c5a059] font-mono text-xs px-2 py-0.5 rounded font-semibold">
                {activeModalProduct.code}
              </span>
              <span className="text-xs font-semibold text-[#c5a059] bg-[#fcf8f0] px-2 py-0.5 rounded">
                {activeModalProduct.category.name}
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
              {activeModalProduct.name}
            </h3>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {activeModalProduct.description}
            </p>

            <div className="bg-[#faf8f3] p-4 rounded-lg border border-[#e5dfd5] mb-6 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-600 font-medium">Precio Contado (Efectivo/Alias):</span>
                <span className="text-xl font-bold text-gray-900 font-mono">
                  ${activeModalProduct.priceCash.toLocaleString('es-AR')}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-xs text-gray-500 border-t border-gray-200 pt-2">
                <span>Precio Lista (Tarjetas / Cuotas):</span>
                <span className="font-semibold text-gray-700 font-mono">
                  ${activeModalProduct.priceList.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Guía de Talles para Anillos */}
            {(activeModalProduct.category.id === 'CAT_RINGS' || activeModalProduct.category.name === 'Anillos') && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                <h4 className="font-serif text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📏</span> ¿No sabes tu talle? Medilo en casa
                </h4>
                <div className="text-xs text-gray-600 space-y-2 mb-3">
                  <p><strong>Paso 1:</strong> Cortá una tirita de papel o usá un hilo.</p>
                  <p><strong>Paso 2:</strong> Envolvelo en el dedo donde vas a usar el anillo (asegurate de que pase por el nudillo).</p>
                  <p><strong>Paso 3:</strong> Marcá con una birome donde se cruza el hilo o papel.</p>
                  <p><strong>Paso 4:</strong> Medí la distancia con una regla (en milímetros). Agregá esta medida en el checkout o por WhatsApp.</p>
                </div>
                <div className="aspect-video w-full rounded overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/PudJ5h3vWvQ?rel=0" 
                    title="Guía para medir tu anillo" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModalProduct(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold text-xs uppercase py-3 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert(`Consulta iniciada para: ${activeModalProduct.name}`);
                  setActiveModalProduct(null);
                }}
                className="flex-1 bg-[#c5a059] text-black font-bold text-xs uppercase py-3 rounded shadow"
              >
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#121212] text-gray-400 py-8 border-t border-[#2a2a2a] text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-serif text-white font-bold text-sm mb-1">LAURE JOYAS</p>
          <p className="mb-4">Super Mami N°4 Salsipuedes (Primera Isla) • Córdoba, Argentina</p>
          <p className="text-gray-500">© 2026 Laure Joyas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
