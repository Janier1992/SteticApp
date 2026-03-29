
import React, { useState, useEffect } from 'react';
import { InsforgeService } from '../services/insforgeService';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await InsforgeService.getAllProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading marketplace products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-background-dark custom-scrollbar pb-32">
      <header className="mb-16">
        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter italic mb-4">Marketplace</h1>
        <p className="text-text-secondary font-medium text-lg opacity-60">Productos premium para el cuidado profesional y personal.</p>
      </header>

      {products.length === 0 ? (
        <div className="py-20 text-center opacity-20">
          <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
          <p className="font-black uppercase tracking-widest">No hay productos disponibles por ahora</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-surface-dark rounded-[2.5rem] overflow-hidden border border-border-dark group hover:border-primary/50 transition-all shadow-2xl flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img src={product.image || 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-6 right-6">
                  <span className="bg-primary text-background-dark px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-black text-xl text-white mb-2 tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-text-secondary font-medium opacity-60 line-clamp-2 mb-6 h-10">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-dark/30">
                  <span className="text-2xl font-black text-primary">${product.price.toLocaleString('es-CO')}</span>
                  <button className="size-12 rounded-2xl bg-white text-background-dark flex items-center justify-center hover:bg-primary transition-all active:scale-95 shadow-lg">
                    <span className="material-symbols-outlined font-black">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
