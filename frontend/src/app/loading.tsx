import Header from '@/components/Header';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-serif text-sm font-bold text-gray-700 uppercase tracking-widest">
          Cargando Laure Joyas...
        </span>
      </main>
    </div>
  );
}
