import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onShopNowClick: () => void;
}

export default function Hero({ onShopNowClick }: HeroProps) {
  return (
    <section className="relative bg-[#020617] text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
      
      {/* Background visual glowing meshes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 lg:w-[480px] lg:h-[480px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-80 h-80 lg:w-[450px] lg:h-[450px] rounded-full bg-slate-800/20 blur-[120px]" />
        
        {/* Futuristic grid overlay line */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Main Content Info */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest mx-auto animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Tech Showcase 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-[1.12]">
            Discover <span className="italic text-cyan-400 font-normal">Smart Gadgets</span> <span className="block font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight mt-2">for a Better Life</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Premium gadgets at affordable prices. Dive into our curated collection of smartphones, smartwatches, and innovative tech gears designed to upgrade your lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={onShopNowClick}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-slate-800 hover:from-cyan-500 hover:to-slate-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-cyan-950/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              id="hero-cta-shop-now"
            >
              <span>Shop Catalog Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                const el = document.getElementById('categories-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <span>Explore Categories</span>
            </button>
          </div>

          {/* Micro Benefits list */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-900 max-w-md mx-auto">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">Secure Buy</span>
              </div>
              <p className="text-[10px] text-slate-450">100% verified payments</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200 font-sans">Fast Shipping</span>
              </div>
              <p className="text-[10px] text-slate-450">Delivered within 24h</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">Top Brands</span>
              </div>
              <p className="text-[10px] text-slate-450">Original manufacturers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
