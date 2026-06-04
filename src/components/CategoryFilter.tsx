import React from 'react';
import { Smartphone, Watch, Headphones, Layers, Laptop, Gamepad2, Box } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory
}: CategoryFilterProps) {
  
  // Icon selector helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All Products':
        return <Box className="w-4 h-4" />;
      case 'Smartphones':
        return <Smartphone className="w-4 h-4" />;
      case 'Smart Watches':
        return <Watch className="w-4 h-4" />;
      case 'Earbuds':
        return <Headphones className="w-4 h-4" />;
      case 'Accessories':
        return <Layers className="w-4 h-4" />;
      case 'Laptops':
        return <Laptop className="w-4 h-4" />;
      case 'Gaming Gadgets':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Box className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-4" id="categories-section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-white flex items-center gap-2.5">
            <span className="h-5 w-1 bg-cyan-400 rounded-full inline-block" />
            Browse Categories
          </h2>
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            Select a category to filter through our premium smart devices.
          </p>
        </div>
      </div>

      {/* Horizontal pill list of categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none uppercase tracking-wider ${
                isActive
                  ? 'bg-cyan-700/10 border-cyan-500/70 text-cyan-400'
                  : 'bg-[#020617] border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              id={`category-btn-${category.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                {getCategoryIcon(category)}
              </span>
              <span>{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
