import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Laptop, Shield, MessageSquare, Compass, Sun, Moon, User, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onCartClick: () => void;
  activeView: string;
  setView: (view: any) => void;
  onScrollToSection: (sectionId: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  currentUser: any;
  userRole: 'admin' | 'customer' | null;
  onSignOut: () => void;
  onLoginClick: () => void;
  onTabChange?: (tab: 'profile' | 'orders' | 'tracking') => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  cartCount,
  onCartClick,
  activeView,
  setView,
  onScrollToSection,
  theme,
  onThemeToggle,
  currentUser,
  userRole,
  onSignOut,
  onLoginClick,
  onTabChange
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: any, sectionId?: string) => {
    setView(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    if (sectionId) {
      setTimeout(() => {
        onScrollToSection(sectionId);
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDropdownItemClick = (tab: 'profile' | 'orders' | 'tracking') => {
    if (userRole === 'admin') {
      setView('admin-dashboard');
    } else {
      setView('customer-dashboard');
      if (onTabChange) {
        onTabChange(tab);
      }
    }
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileLogout = () => {
    onSignOut();
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#020617]/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Upper informational bar in theme style */}
      <div className="hidden sm:flex w-full bg-gradient-to-r from-slate-900 to-[#020617] text-slate-300 text-xs py-2 px-6 justify-between items-center font-sans tracking-wide border-b border-slate-800/60">
        <p className="flex items-center gap-1">
          <span className="text-cyan-400">⚡</span>
          <span>&quot;Your satisfaction is our priority | Smart products, better life 🛍️&quot;</span>
        </p>

      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center py-4 gap-4">
          
          {/* Logo & Website Title */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            id="header-brand-logo"
          >
            <div className="relative">
              <img 
                src="https://image.shoutmecrunch.com/wp-content/uploads/2026/05/gg.webp" 
                alt="Gadget World Logo" 
                className="w-10 h-10 rounded-lg object-cover bg-white/5 border border-slate-700/60 group-hover:scale-105 transition-all duration-350"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -inset-0.5 bg-cyan-500/20 blur rounded-lg opacity-0 group-hover:opacity-100 transition duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-sans tracking-tight font-bold text-white sm:text-xl">
                Gadget<span className="text-cyan-400">World</span>
              </span>
              <p className="hidden xs:block text-[9px] text-slate-400 font-sans tracking-widest uppercase leading-none mt-1">
                Smart products, better life
              </p>
            </div>
          </div>

          {/* Search bar Desktop in sophisticated dark styling */}
          {activeView === 'home' && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search gadgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs font-sans pl-10 pr-12 py-2 rounded-full border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  id="search-input-desktop"
                />
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-2 text-[10px] text-cyan-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-cyan-400 transition-colors py-1 cursor-pointer ${activeView === 'home' ? 'text-cyan-400' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('home', 'all-products-section')}
              className="hover:text-cyan-400 transition-colors py-1 cursor-pointer"
            >
              Products
            </button>
            <button
              onClick={() => handleNavClick('home', 'categories-section')}
              className="hover:text-cyan-400 transition-colors py-1 cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact-section')}
              className="hover:text-cyan-400 transition-colors py-1 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Controls (Cart, Menu Toggle) */}
          <div className="flex items-center gap-3">
            {/* Search Toggle icon on mobile/tablet */}
            {activeView === 'home' && (
              <div className="md:hidden relative shrink-0">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-24 xs:w-32 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs font-sans pl-8 pr-3 py-1.5 rounded-full border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:w-36 transition-all"
                />
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={onThemeToggle}
              className="p-2 h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              title={theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
              aria-label="Theme Toggle"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Shopping Cart"
              id="header-cart-button"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300 hover:text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-[#020617] shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Buttons & Profile Dropdown */}
            {currentUser ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-full text-xs font-semibold focus:outline-none cursor-pointer transition shadow"
                  id="user-profile-menu-button"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold border border-cyan-800/40 flex items-center justify-center uppercase select-none text-[10px]">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email.charAt(0)}
                  </div>
                  <span className="hidden xs:inline max-w-[85px] truncate">
                    {currentUser.displayName || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-505" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl overflow-hidden py-1.5 z-60 animate-in fade-in slide-in-from-top-2">
                    <p className="px-3.5 py-2 text-[10px] uppercase font-mono tracking-widest text-[#00E5FF] border-b border-slate-900 select-none">
                      Privilege: <span className="text-white font-sans text-xs tracking-normal uppercase block mt-0.5">{userRole || 'customer'}</span>
                    </p>
                    
                    {userRole === 'admin' ? (
                      <button
                        onClick={() => {
                          setView('admin-dashboard');
                          setDropdownOpen(false);
                          setMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-405 transition-all flex items-center gap-2 font-bold"
                      >
                        <Shield className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Admin Portal</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDropdownItemClick('profile')}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => handleDropdownItemClick('orders')}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all flex items-center gap-2"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => handleDropdownItemClick('tracking')}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all flex items-center gap-2"
                        >
                          <Compass className="w-3.5 h-3.5 text-cyan-45 * text-cyan-400" />
                          <span>Order Tracking</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/20 transition-all flex items-center gap-2 border-t border-slate-900 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-450" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
                id="header-login-btn"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile menu Button toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 focus:outline-none transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu dropdown drawer panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#020617] px-4 py-4 space-y-4">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('home', 'all-products-section')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium"
            >
              Products Collection
            </button>
            <button
              onClick={() => handleNavClick('home', 'categories-section')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium"
            >
              Browse Categories
            </button>
            <button
              onClick={() => handleNavClick('home', 'contact-section')}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium"
            >
              Contact Support
            </button>
          </div>

          {/* Dedicated mobile auth portal */}
          <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="text-[10px] text-[#00E5FF] px-3 uppercase tracking-wider font-mono">
                  Privilege: <strong className="text-white font-sans text-xs uppercase mt-0.5 block">{userRole || 'customer'}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  {userRole === 'admin' ? (
                    <button
                      onClick={() => {
                        setView('admin-dashboard');
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Admin Portal</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDropdownItemClick('profile')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => handleDropdownItemClick('orders')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium flex items-center gap-2"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>My Orders</span>
                      </button>
                      <button
                        onClick={() => handleDropdownItemClick('tracking')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-all text-xs font-medium flex items-center gap-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Order Tracking</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleMobileLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/20 transition-all text-xs font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setView('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95"
              >
                <User className="w-4 h-4" />
                <span>Log In / Join Club</span>
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 shadow-inner">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">🚨 24 Hour Delivery Guaranteed</p>
            <p className="text-[10px] text-slate-400">
              Your satisfaction is our priority. Call us at: <span className="text-slate-205 font-mono">+1 (800) 555-GDGT</span>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
