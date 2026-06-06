import React from 'react';
import { X, Star, Shield, ArrowRight, Truck, RefreshCw } from 'lucide-react';
import { Product, formatBDT } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNowClick: (product: Product) => void;
  onAddToCartClick: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onBuyNowClick,
  onAddToCartClick
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
          aria-hidden="true" 
        />

        {/* Trick to center the modal contents */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="relative inline-block align-middle w-full max-w-4xl bg-[#020617] text-slate-100 rounded-2xl text-left overflow-hidden shadow-2xl border border-slate-800 transform transition-all sm:my-8 align-middle">
          
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            
            {/* Left Column: Product Image */}
            <div className="relative rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/80">
              <span className="absolute top-3 left-3 z-10 inline-flex items-center text-[9px] font-sans font-semibold bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded uppercase tracking-wider text-cyan-400">
                {product.category}
              </span>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover max-h-[380px] md:max-h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Column: Descriptions & Details */}
            <div className="flex flex-col justify-between space-y-6">
              
              <div className="space-y-4 text-left">
                {/* Title & Rating */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-white">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-sans text-slate-400">
                      {product.rating} / 5 Rating
                    </span>
                  </div>
                </div>

                {/* Pricing tags */}
                <div className="py-2.5 px-4 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-1">Special Price</p>
                    <span className="text-2xl font-sans tracking-tight font-extrabold text-[#f1f5f9]">
                      {formatBDT(product.price)}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded uppercase tracking-wider">
                    ✓ In Stock
                  </span>
                </div>

                {/* Subtitle description */}
                <div className="space-y-1">
                  <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Overview</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
                    {product.description}
                  </p>
                </div>

                {/* Technical Specifications specs lists */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Technical Specifications</h4>
                  <ul className="grid grid-cols-1 gap-1">
                    {product.specifications.map((spec, i) => (
                      <li key={i} className="text-xs text-slate-450 flex items-start gap-2">
                        <span className="text-cyan-500 mt-0.5 font-bold">•</span>
                        <span className="font-sans font-light leading-relaxed">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Guarantees overview */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-slate-900 border border-slate-850">
                <div className="text-center space-y-0.5">
                  <Truck className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-[10px] font-medium text-slate-200">Free Delivery</p>
                  <p className="text-[9px] text-slate-500 uppercase">Same day</p>
                </div>
                <div className="text-center space-y-0.5">
                  <Shield className="w-4 h-4 text-cyan-450 mx-auto" />
                  <p className="text-[10px] font-medium text-slate-200">1-Yr Warranty</p>
                  <p className="text-[9px] text-slate-500 uppercase">Replacement</p>
                </div>
                <div className="text-center space-y-0.5">
                  <RefreshCw className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-[10px] font-medium text-slate-200">Easy Returns</p>
                  <p className="text-[9px] text-slate-500 uppercase">7 days</p>
                </div>
              </div>

              {/* Core calls to action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCartClick(product);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-semibold text-xs py-3 rounded transition-all cursor-pointer uppercase tracking-wider"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    onBuyNowClick(product);
                    onClose();
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-3 rounded shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
