import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { CartItem, formatBDT } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutClick: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutClick
}: CartSidebarProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-55 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Backdrop transparent overlay shadow */}
        <div 
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in" 
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          
          {/* Drawer Panel */}
          <div className="pointer-events-auto w-screen max-w-md transform transition-all bg-[#020617] border-l border-slate-800 shadow-2xl flex flex-col h-full text-left">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h2 className="text-lg font-serif tracking-tight text-white flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-cyan-400" />
                Your Shopping Cart
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-5xl">🛍️</span>
                  <p className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your cart is empty</p>
                  <p className="text-xs text-slate-400 font-sans max-w-[220px] leading-relaxed">
                    Looks like you haven&apos;t added any smart gadgets yet. Navigate our products and add them!
                  </p>
                  <button
                    onClick={onClose}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-slate-900/60 border border-slate-850 rounded-lg relative group"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded overflow-hidden bg-slate-950/80 border border-slate-800 shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white pr-6 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[9px] text-cyan-450 uppercase tracking-widest leading-none mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      {/* Math & Controls */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Adjust qty buttons */}
                        <div className="flex items-center border border-slate-800 rounded p-0.5 bg-slate-950 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-white transition cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-350">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-white transition cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Cost */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#f1f5f9]">
                            {formatBDT(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trash remove trigger */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="absolute top-2.5 right-2 py-1 px-1 text-slate-550 hover:text-rose-455 transition cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkbox Subtotal info & proceed button */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-850 p-6 bg-slate-950/60 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="text-slate-400">Delivery charges</span>
                    <span className="text-cyan-400 font-semibold uppercase text-[10px] tracking-wider">FREE SHIPPING</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-1">
                    <span className="text-slate-300">Total payable</span>
                    <span className="text-xl text-[#f1f5f9] font-extrabold font-mono">
                      {formatBDT(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onCheckoutClick();
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded transition cursor-pointer uppercase tracking-wider text-xs"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
