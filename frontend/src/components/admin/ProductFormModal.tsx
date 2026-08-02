'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES as MOCK_CATEGORIES, MATERIALS as MOCK_MATERIALS, ProductItem } from '@/lib/mockData';
import { useSupabaseCategories, useSupabaseMaterials } from '@/lib/supabaseSync';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: ProductItem) => void;
  existingCount: number;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onAddProduct,
  existingCount,
}: ProductFormModalProps) {
  const { categories: dbCategories, loading: catLoading } = useSupabaseCategories();
  const { materials: dbMaterials, loading: matLoading } = useSupabaseMaterials();

  const categoriesList = dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES;
  const materialsList = dbMaterials.length > 0 ? dbMaterials : MOCK_MATERIALS;

  const [step, setStep] = useState<number>(1);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [materialId, setMaterialId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceList, setPriceList] = useState<string>('');
  const [priceCash, setPriceCash] = useState<string>('');
  const [stock, setStock] = useState<string>('5');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [noPhotoForNow, setNoPhotoForNow] = useState<boolean>(true);

  useEffect(() => {
    if (!categoryId && categoriesList.length > 0) {
      setCategoryId(categoriesList[0].id);
    }
    if (!materialId && materialsList.length > 0) {
      setMaterialId(materialsList[0].id);
    }
  }, [categoriesList, materialsList, categoryId, materialId]);

  if (!isOpen) return null;

  const selectedCategory = categoriesList.find((c) => c.id === categoryId) || categoriesList[0];
  const selectedMaterial = materialsList.find((m) => m.id === materialId) || materialsList[0];


  // Auto Code calculation
  const generatedCode = `${selectedCategory.codePrefix}-${selectedMaterial.codePrefix}-${(existingCount + 1).toString().padStart(6, '0')}`;

  const handlePriceListChange = (val: string) => {
    setPriceList(val);
    if (val && !isNaN(parseFloat(val))) {
      const numList = parseFloat(val);
      // Auto-calculate 20% OFF for cash/transfer
      const autoCash = Math.round(numList * 0.8);
      setPriceCash(autoCash.toString());
    } else {
      setPriceCash('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor ingresá el nombre del producto');
      return;
    }

    const numPriceList = parseFloat(priceList) || 0;
    const numPriceCash = parseFloat(priceCash) || Math.round(numPriceList * 0.8);

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      code: generatedCode,
      name,
      description,
      priceList: numPriceList,
      priceCash: numPriceCash,
      category: selectedCategory,
      material: selectedMaterial,
      stock: parseInt(stock, 10) || 0,
      inStock: true,
      image: !noPhotoForNow && imageUrl.trim() ? imageUrl.trim() : undefined,
    };

    onAddProduct(newProduct);
    onClose();
    // Reset
    setStep(1);
    setName('');
    setDescription('');
    setPriceList('');
    setPriceCash('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
              Paso {step} de 3 — Carga Guiada
            </span>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Cargar Nuevo Producto al Inventario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-[#c5a059] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: CATEGORY & MATERIAL */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  1. ¿Qué tipo de producto es? (Categoría)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-3 rounded border text-xs font-semibold text-left transition-all ${
                        categoryId === cat.id
                          ? 'border-[#c5a059] bg-[#fcf8f0] text-gray-900 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  2. ¿De qué material está confeccionado?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {materialsList.map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setMaterialId(mat.id)}
                      className={`p-3 rounded border text-xs font-semibold text-left transition-all ${
                        materialId === mat.id
                          ? 'border-[#c5a059] bg-[#fcf8f0] text-gray-900 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#121212] text-white p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                    Código SKU Autogenerado:
                  </span>
                  <span className="text-sm font-mono font-bold text-[#c5a059]">
                    {generatedCode}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-light">Se asignará automáticamente</span>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded shadow"
                >
                  Siguiente: Precios & Datos ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS & PRICING */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Anillo Plata 925 con Piedra Circón"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de diseño, talle, acabado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Precio Lista (Tarjetas) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 50000"
                    value={priceList}
                    onChange={(e) => handlePriceListChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-gray-500">Base para cuotas sin interés</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Precio Contado (20% OFF Auto) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 40000"
                    value={priceCash}
                    onChange={(e) => setPriceCash(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-emerald-400 bg-emerald-50 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-emerald-800"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    🔥 20% OFF en Efectivo/Transferencia
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Stock Inicial en Local (Unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-gray-300 text-gray-700 font-semibold text-xs uppercase px-4 py-2.5 rounded"
                >
                  ⬅ Volver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim() || !priceList) {
                      alert('Completá el nombre y precio lista para continuar');
                      return;
                    }
                    setStep(3);
                  }}
                  className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow"
                >
                  Siguiente: Fotografía ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO OPTION */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-[#faf8f3] p-4 rounded-lg border border-[#e5dfd5]">
                <h4 className="font-serif text-sm font-bold text-gray-900 mb-2">
                  📸 Gestión de Fotografía
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Podés cargar la foto del producto ahora o guardarlo sin foto. El producto figurará disponible en el catálogo de todas formas con una portada sobria y elegante.
                </p>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="photoOption"
                      checked={noPhotoForNow}
                      onChange={() => setNoPhotoForNow(true)}
                      className="text-[#c5a059] focus:ring-[#c5a059]"
                    />
                    <span>Guardar sin foto por ahora (se podrá agregar luego)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="photoOption"
                      checked={!noPhotoForNow}
                      onChange={() => setNoPhotoForNow(false)}
                      className="text-[#c5a059] focus:ring-[#c5a059]"
                    />
                    <span>Subir URL de imagen del producto</span>
                  </label>
                </div>
              </div>

              {!noPhotoForNow && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    URL de la Imagen o Archivo
                  </label>
                  <input
                    type="text"
                    placeholder="https://... o /images/mi_foto.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                  />
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-[#121212] text-white p-4 rounded-lg text-xs space-y-1">
                <div className="text-[#c5a059] font-bold">Resumen del producto a guardar:</div>
                <div>Código SKU: <span className="font-mono">{generatedCode}</span></div>
                <div>Producto: <span className="font-semibold">{name}</span></div>
                <div>Precio Contado (20% OFF): <span className="text-emerald-400 font-bold">${parseFloat(priceCash || '0').toLocaleString('es-AR')}</span></div>
                <div>Precio Lista: <span className="font-mono">${parseFloat(priceList || '0').toLocaleString('es-AR')} (Hasta 3 cuotas sin interés)</span></div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-gray-300 text-gray-700 font-semibold text-xs uppercase px-4 py-2.5 rounded"
                >
                  ⬅ Volver
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow flex items-center gap-2"
                >
                  <span>✨</span> Confirmar y Guardar Producto
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
