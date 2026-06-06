import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem, formatBDT } from '../types';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutClick: () => void;
  onBackToShopping: () => void;
  theme: 'light' | 'dark';
}

export default function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutClick,
  onBackToShopping,
  theme
}: CartPageProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="relative bg-main-bg text-text-main min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-slate-800/10 blur-[130px]" />
      </div>

      <div className="max-w-[1920px] w-full mx-auto relative z-10 space-y-6">
        
        {/* Navigation Action Area */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900 font-medium text-xs transition duration-200 py-2 px-4 bg-slate-900 dark:bg-slate-900 bg-slate-100 border border-slate-200 dark:border-slate-850 rounded cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          
          <span className="text-[10px] text-cyan-500 dark:text-cyan-400 uppercase tracking-widest bg-cyan-950/20 dark:bg-cyan-950/30 border border-cyan-800/20 dark:border-cyan-850/50 px-2.5 py-0.5 rounded font-semibold">
            Your Premium Cart
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight text-left">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl p-12 text-center space-y-4">
            <span className="text-6xl block">🛍️</span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Your Shopping Cart is Empty</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
              Before you checkout, you must add some premium gadgets to your cart. Explore our flagships catalog!
            </p>
            <button
              onClick={onBackToShopping}
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Start Exploring Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
                
                {/* List of items */}
                <div className="divide-y divide-slate-200 dark:divide-slate-900">
                  {cartItems.map((item) => (
                    <div 
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-left group hover:bg-slate-100/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      {/* Product details combined */}
                      <div className="flex gap-4 items-center flex-1">
                        
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Product Name & Category */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                            {item.product.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono sm:hidden">
                            {formatBDT(item.product.price)} each
                          </p>
                        </div>

                      </div>

                      {/* Right actions: Qty adjustments, Pricing, Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 dark:border-slate-900 pt-3 sm:pt-0">
                        
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-300 dark:border-slate-800 rounded p-1 bg-white dark:bg-slate-950">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-805 dark:hover:text-white transition cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-mono font-bold text-slate-850 dark:text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-505 hover:text-slate-805 dark:hover:text-white transition cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price Display */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[9px] font-semibold leading-none mb-1">
                            Total Price
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-[#f1f5f9] font-mono block">
                            {formatBDT(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition cursor-pointer shrink-0"
                          title="Remove from cart"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Right Side: Total Summary */}
            <div className="lg:col-span-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-900 pb-2 text-left">
                  Cart Order Summary
                </h3>

                <div className="space-y-3 font-sans text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Items:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{cartItems.reduce((acc, current) => acc + current.quantity, 0)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Shipping Delivery Charge:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[9px] tracking-wider bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      FREE DELIVERY
                    </span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-900 pt-4 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Grand Total:</span>
                    <span className="text-2xl font-extrabold text-[#00E5FF] font-mono">{formatBDT(subtotal)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={onCheckoutClick}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-bold py-3.5 px-6 rounded-xl transition cursor-pointer uppercase tracking-wider text-xs shadow-lg shadow-cyan-950/25"
                  >
                    <span>Proceed to Secure Purchase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onBackToShopping}
                    className="w-full bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-300 dark:border-slate-800 py-2 px-6 rounded-lg uppercase tracking-wider text-[11px] font-bold cursor-pointer transition"
                  >
                    Continue Shopping catalog
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
