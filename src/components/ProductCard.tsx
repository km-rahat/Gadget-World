import React from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onBuyNowClick: (product: Product) => void;
  onAddToCartClick: (product: Product) => void;
  onQuickViewClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  onBuyNowClick
}: ProductCardProps) {
  return (
    <div 
      className="group relative flex flex-col h-full bg-[#020617] border border-slate-800 hover:border-cyan-500/40 rounded-xl overflow-hidden transition-all duration-350 shadow-xl hover:shadow-cyan-950/10 hover:-translate-y-1"
      id={`product-card-${product.id}`}
    >
      {/* Category Accent Stripe */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image container */}
      <div 
        onClick={() => onBuyNowClick(product)}
        className="relative pt-[70%] w-full bg-slate-950/20 overflow-hidden cursor-pointer"
      >
        {/* Floating Category Badge */}
        <span className="absolute top-3 left-3 z-10 inline-flex items-center text-[9px] font-sans font-semibold bg-[#020617]/90 text-cyan-400 border border-slate-800/80 px-2 py-0.5 rounded uppercase tracking-widest backdrop-blur-sm shadow">
          {product.category}
        </span>

        {/* Floating Rating Tag */}
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-[10px] font-sans font-semibold bg-[#020617]/90 text-amber-400 border border-slate-800/80 px-1.5 py-0.5 rounded backdrop-blur-sm shadow">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
        </span>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Hover interaction vignette */}
        <div className="absolute inset-0 bg-[#020617]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content description area */}
      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5 text-left">
          {/* Product Name */}
          <h3 
            onClick={() => onBuyNowClick(product)}
            className="text-sm sm:text-base font-sans font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-[11px] text-slate-400 font-sans font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Core Actions */}
        <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
          
          {/* Pricing tags */}
          <div className="flex flex-col text-left">
            <span className="text-lg sm:text-xl font-sans tracking-tight font-extrabold text-[#f1f5f9]">
              ${product.price.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-1">VAT included</span>
          </div>

          {/* BUY NOW premium text button */}
          <button
            onClick={() => onBuyNowClick(product)}
            className="inline-flex items-center justify-center px-4 py-2 bg-cyan-650 hover:bg-cyan-550 border border-cyan-500/30 hover:border-cyan-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 hover:scale-[1.05] active:scale-95 cursor-pointer shadow-lg shadow-cyan-950/25"
            id={`buy-now-btn-${product.id}`}
          >
            BUY NOW
          </button>

        </div>
      </div>
    </div>
  );
}
