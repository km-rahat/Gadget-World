import React from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, Home, Calendar, Truck, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { ConfirmedOrder, formatBDT } from '../types';

interface OrderSuccessProps {
  order: ConfirmedOrder | null;
  onBackToShopping: () => void;
}

export default function OrderSuccess({ order, onBackToShopping }: OrderSuccessProps) {
  if (!order) return null;

  return (
    <div className="relative bg-[#020617] text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center border-t border-slate-900">
      
      {/* Background ambient lights */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full bg-slate-900/40 border border-slate-850 rounded-lg p-6 sm:p-10 text-center shadow-2xl relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Success Icon Badge */}
        <div className="mx-auto w-16 h-16 bg-cyan-950/40 border border-cyan-800/50 rounded-full flex items-center justify-center text-cyan-400 mb-2">
          <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
        </div>

        {/* Core Success Heading */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-serif tracking-tight text-white">
            🎉 Your order has been successfully confirmed!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans font-light">
            Thank you for shopping with Gadget World.
          </p>
        </div>

        {/* Order Details Panel */}
        <div className="bg-slate-950/60 border border-slate-850 rounded p-5 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-850 pb-3">
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Order Identifier</p>
              <p className="text-xs font-mono font-bold text-cyan-400">{order.orderId}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 sm:text-right uppercase tracking-widest font-semibold font-sans">Ordered Status</p>
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/50 border border-cyan-850/50 px-2.5 py-0.5 rounded inline-block sm:block mt-0.5">
                ✓ Processing Shipment
              </p>
            </div>
          </div>

          {/* Items Summary list */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Purchased Items</h4>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-[#020617]/50 p-2.5 rounded border border-slate-850">
                  <span className="text-slate-300 font-medium line-clamp-1 flex-1 pr-4">
                    {item.productName}
                  </span>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-slate-500 text-xs">Qty: {item.quantity}</span>
                    <span className="text-slate-300 font-mono font-bold ml-3">
                      {formatBDT(item.productPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment estimation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Estimated Delivery</p>
                <p className="text-xs font-bold text-slate-300">{order.estimatedDelivery}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Payment Method</p>
                <p className="text-xs font-bold text-slate-300">{order.paymentMethod}</p>
              </div>
            </div>

          </div>

          {/* Customer Address Recap */}
          <div className="border-t border-slate-850 pt-4 space-y-3">
            <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Shipping Destination</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              
              <div className="space-y-1">
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">Recipient Name</p>
                <p className="font-semibold text-slate-300">{order.customerName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">Phone Number</p>
                <p className="font-semibold font-mono text-slate-300">{order.phone}</p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">Delivery Address</p>
                <p className="text-slate-400 leading-relaxed italic">{order.address}</p>
              </div>

            </div>
          </div>

          {/* Total Pay summary banner */}
          <div className="bg-[#020617]/80 border border-slate-800 p-4 rounded flex justify-between items-center text-xs uppercase tracking-wider font-semibold">
            <span className="text-slate-400">Total Payable Amount:</span>
            <span className="text-lg font-extrabold text-[#f1f5f9] font-mono">
              {formatBDT(order.totalAmount)}
            </span>
          </div>

        </div>

        {/* Footer Support Info */}
        <div className="p-4 bg-[#020617]/40 border border-slate-850 rounded text-xs text-slate-450 text-left space-y-1.5 leading-relaxed font-light">
          <p className="font-semibold text-slate-350 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Need modification or cancel?</span>
          </p>
          <p>
            Please email <span className="text-cyan-400 underline font-normal">support@gadgetworld.com</span> or dial our 24/7 hotline at <strong className="text-slate-305 font-mono">+880 1711-234567</strong> inside 2 hours of checkout submission.
          </p>
        </div>

        {/* Back navigation button CTA */}
        <button
          onClick={onBackToShopping}
          className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded shadow-lg transition duration-200 cursor-pointer uppercase tracking-wider text-xs"
          id="order-success-back-home-btn"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Shopping Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
