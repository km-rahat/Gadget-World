import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  ChevronRight, 
  HelpCircle, 
  Send, 
  Sparkles, 
  Star, 
  ArrowUp,
  X,
  Smartphone,
  Watch,
  Headphones,
  Gamepad2,
  Gem,
  CheckCircle2,
  Compass
} from 'lucide-react';

import { PRODUCTS, CATEGORIES } from './data';
import { Product, CartItem, OrderForm, ConfirmedOrder, formatBDT } from './types';
import { db, auth } from './firebase';
import { collection, addDoc, getDoc, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Component Imports
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CategoryFilter from './components/CategoryFilter';
import ProductDetailModal from './components/ProductDetailModal';
import CartSidebar from './components/CartSidebar';
import CheckoutForm from './components/CheckoutForm';
import OrderSuccess from './components/OrderSuccess';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UserAccountPage from './components/UserAccountPage';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';

export default function App() {
  // Navigation & Views
  const [activeView, setView] = useState<'home' | 'product-detail' | 'checkout' | 'order-success' | 'login' | 'register' | 'user-account' | 'admin-dashboard' | 'customer-dashboard' | 'cart'>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Authenticated user state management
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accountActiveTab, setAccountActiveTab] = useState<'profile' | 'orders'>('profile');

  // Light/Dark Theme System state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark'; // default theme is premium dark
  });

  // Track Auth state changes with persistent listeners & RBAC verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      setCurrentUser(user);
      if (user) {
        const isEmailAdmin = user.email?.trim().toLowerCase() === 'rahatboss015@gmail.com';
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const role = userSnap.data().role || 'customer';
            if (isEmailAdmin && role !== 'admin') {
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
              setUserRole('admin');
            } else {
              setUserRole(role);
            }
          } else {
            const autoRole = isEmailAdmin ? 'admin' : 'customer';
            await setDoc(userDocRef, {
              uid: user.uid,
              fullName: user.displayName || 'Authorized Customer',
              name: user.displayName || 'Authorized Customer',
              email: user.email?.trim().toLowerCase() || '',
              role: autoRole,
              createdAt: new Date().toISOString()
            });
            setUserRole(autoRole);
          }
        } catch (err) {
          console.error("RBAC loading error: ", err);
          setUserRole(isEmailAdmin ? 'admin' : 'customer');
        }
      } else {
        setUserRole(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Route Protection & Dynamic Redirects logic
  useEffect(() => {
    if (isAuthLoading) return;

    if (activeView === 'admin-dashboard') {
      if (!currentUser) {
        setView('login');
        showToast("Please login as Admin to access the admin panel.");
      } else if (userRole === 'customer') {
        setView('customer-dashboard');
        showToast("Access Denied: Redirecting to Customer Dashboard.");
      }
    } else if (activeView === 'customer-dashboard') {
      if (!currentUser) {
        setView('login');
        showToast("Please sign in to access your dashboard.");
      } else if (userRole === 'admin') {
        setView('admin-dashboard');
        showToast("Access Redirect: Admins belong in the Admin Portal.");
      }
    } else if (activeView === 'login' || activeView === 'register') {
      if (currentUser && userRole) {
        if (userRole === 'admin') {
          setView('admin-dashboard');
        } else {
          setView('customer-dashboard');
        }
      }
    }
  }, [activeView, currentUser, userRole, isAuthLoading]);

  // Theme change effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      showToast("Signed out successfully.");
      setView('home');
    } catch (err) {
      console.error("Signout error: ", err);
      showToast("Failed to sign out properly.");
    }
  };
  
  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');

  // Shopping Cart & Overlays
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Buy now & Order submission states
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<ConfirmedOrder | null>(null);

  // Micro-interactions Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [backToTopVisible, setBackToTopVisible] = useState(false);

  // Simulate premium app loading screen on refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Back to top observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setBackToTopVisible(true);
      } else {
        setBackToTopVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered products list calculation
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Highlight featured products
  const featuredProducts = PRODUCTS.filter((product) => product.isFeatured);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Updated "${product.name}" quantity in cart!`);
        return prevItems.map((item) => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`Added "${product.name}" to your cart!`);
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (item) {
      showToast(`Removed "${item.product.name}" from cart.`);
    }
    setCartItems((prevItems) => prevItems.filter((i) => i.product.id !== productId));
  };

  // Immediate checkout flow
  const handleBuyNowDirect = (product: Product) => {
    setDirectProduct(product);
    setView('product-detail');
    // Scroll window smoothly to the top of product detail
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Cart aggregate checkout flow
  const handleCartProceedCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your shopping cart is empty.');
      return;
    }
    setDirectProduct(null); // Direct details is off since buying cart
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Confirm order form submission
  const handleConfirmOrder = async (formData: OrderForm) => {
    const uniqueOrderId = `GW-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    const itemsOrdered = directProduct 
      ? [{ productName: directProduct.name, productPrice: directProduct.price, quantity: formData.quantity }]
      : cartItems.map((item) => ({ 
          productName: item.product.name, 
          productPrice: item.product.price, 
          quantity: item.quantity 
        }));

    const finalAmount = directProduct
      ? directProduct.price * formData.quantity
      : cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const confirmed: ConfirmedOrder = {
      orderId: uniqueOrderId,
      customerName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      items: itemsOrdered,
      totalAmount: finalAmount,
      estimatedDelivery: '1 to 2 business days (Expected Tomorrow before 6 PM)',
      notes: formData.notes,
      orderDate: dateFormatted
    };

    // Keep persistent track of the orders inside Firebase Firestore
    try {
      await addDoc(collection(db, 'orders'), {
        orderId: confirmed.orderId,
        uid: currentUser ? currentUser.uid : 'anonymous',
        status: 'Pending',
        customerName: confirmed.customerName,
        phone: confirmed.phone,
        email: confirmed.email,
        address: confirmed.address,
        paymentMethod: confirmed.paymentMethod,
        items: confirmed.items,
        totalAmount: confirmed.totalAmount,
        notes: confirmed.notes,
        estimatedDelivery: confirmed.estimatedDelivery,
        orderDate: confirmed.orderDate,
        createdAt: new Date().toISOString()
      });
      console.log("Order saved successfully to Firebase Firestore database!");
    } catch (error) {
      console.error("Could not write order data to Firestore: ", error);
    }

    setSubmittedOrder(confirmed);
    setView('order-success');
    
    // Clear out cart upon successful checkout
    if (!directProduct) {
      setCartItems([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to shop
  const handleBackToShopping = () => {
    setDirectProduct(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll logic helper
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Helper macro toast alert
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => prev === msg ? null : prev);
    }, 4000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => {
      setNewsletterSubscribed(false);
    }, 5000);
  };

  // Scroll to Top action
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total items currently in cart
  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Master Loader component
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center text-slate-100">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-850 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute top-4 w-8 h-8 pointer-events-none rounded-full bg-cyan-500/10 blur animate-ping" />
          <div className="flex flex-col items-center mt-2">
            <span className="text-xl font-serif tracking-widest uppercase">
              Gadget<span className="text-cyan-400">World</span>
            </span>
            <p className="text-slate-500 text-[9px] font-mono tracking-widest uppercase mt-0.5">Premium Tech Is Syncing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg text-text-main min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-white pb-0">
      
      {/* Floating Micro toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-55 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 py-3 px-4 rounded shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-xs font-semibold select-none leading-normal">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Scroll to Top button */}
      {backToTopVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 rounded bg-slate-900 border border-slate-820 text-white hover:bg-slate-850 hover:-translate-y-1 hover:shadow-lg transition duration-300 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      )}

      {/* Persistent App Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartTotalCount}
        onCartClick={() => setView('cart')}
        activeView={activeView}
        setView={setView}
        onScrollToSection={handleScrollToSection}
        theme={theme}
        onThemeToggle={toggleTheme}
        currentUser={currentUser}
        userRole={userRole}
        onSignOut={handleLogout}
        onLoginClick={() => setView('login')}
        onTabChange={(tab) => setAccountActiveTab(tab)}
      />

      {/* VIEW DELEGATIONS */}
      {activeView === 'home' && (
        <main className="flex-grow flex flex-col">
          
          {/* Main Showcase Hero */}
          <Hero onShopNowClick={() => handleScrollToSection('all-products-section')} />

          {/* Core Applet Content Body */}
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 space-y-16">
            
            {/* Category Filter Pills (Scroll target also) */}
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              setSelectedCategory={(catalog) => {
                setSelectedCategory(catalog);
                handleScrollToSection('all-products-section');
              }}
            />

            {/* SECTION 2: BEST SELLING PRODUCTS (Exactly 3) */}
            {!searchQuery && selectedCategory === 'All Products' && (
              <section className="bg-gradient-to-br from-slate-950 via-slate-900/10 to-slate-950 rounded-lg border border-slate-850 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-inner">
                {/* Visual grid accent background */}
                <div className="absolute right-0 bottom-0 pointer-events-none w-1/3 h-1/3 opacity-5">
                  <div className="w-full h-full bg-[radial-gradient(#22d3ee_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-1 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Best Selling Products</span>
                    </div>
                    <h2 className="text-2xl font-serif tracking-tight text-white animate-in fade-in">
                      Top Rated Best Sellers
                    </h2>
                    <p className="text-xs text-slate-400">Our absolute top-selling items based on consumer demand and reviews.</p>
                  </div>
                </div>

                {/* Horizontal Best Sellers Grid - Exclusively 3 items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {PRODUCTS.slice(4, 7).map((prod) => (
                    <div 
                      key={prod.id} 
                      className="bg-slate-950/60 border border-slate-850 hover:border-cyan-500/40 rounded-xl overflow-hidden p-5 flex flex-col justify-between text-left relative group transition-all duration-300 shadow-lg hover:shadow-cyan-950/5 hover:-translate-y-1"
                    >
                      {/* Badge: Best Seller */}
                      <span className="absolute top-4 left-4 z-10 inline-flex items-center text-[9px] font-bold bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-widest shadow">
                        Best Seller
                      </span>

                      <div className="space-y-4">
                        <div 
                          onClick={() => handleBuyNowDirect(prod)}
                          className="relative aspect-video rounded overflow-hidden bg-slate-900 border border-slate-850 cursor-pointer"
                        >
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 
                            onClick={() => handleBuyNowDirect(prod)}
                            className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 md:line-clamp-3 font-light leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-900 flex justify-between items-center bg-transparent">
                        <span className="font-extrabold text-base text-cyan-400">{formatBDT(prod.price)}</span>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-cyan-650 hover:bg-cyan-550 border border-cyan-500/30 hover:border-cyan-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 hover:scale-[1.05] active:scale-95 cursor-pointer shadow-lg shadow-cyan-950/25"
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MAIN CATALOG GRID SECTION */}
            <section className="space-y-6" id="all-products-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-white flex items-center gap-2.5">
                    <span className="h-5 w-1 bg-cyan-400 rounded-full inline-block" />
                    {selectedCategory === 'All Products' ? 'All Gadgets Premium Catalog' : `${selectedCategory}`}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {searchQuery 
                      ? `Found ${filteredProducts.length} matching result(s) for "${searchQuery}"`
                      : `Displaying ${filteredProducts.length} premium gadgets matching your query`
                    }
                  </p>
                </div>

                {/* Filter and reset indicators if searching */}
                {(searchQuery || selectedCategory !== 'All Products') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Products');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium py-1 px-3 bg-slate-900 border border-slate-800 rounded transition"
                  >
                    Reset Filters ✕
                  </button>
                )}
              </div>

              {/* Grid or Empty layout view */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                  <span className="text-5xl block">🔍</span>
                  <h3 className="text-lg font-bold text-slate-200">No matching gadgets found</h3>
                  <p className="text-xs text-slate-400">
                    We couldn&apos;t find any smart accessories or devices matching your search query. Try choosing another keyword or reset the category filter!
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Products');
                    }}
                    className="mt-2 bg-slate-900 text-indigo-400 hover:text-white border border-slate-800 px-5  py-2 rounded-xl text-xs font-semibold hover:border-slate-700 transition"
                  >
                    Display All Catalog Items
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onBuyNowClick={handleBuyNowDirect}
                      onAddToCartClick={handleAddToCart}
                      onQuickViewClick={setQuickViewProduct}
                    />
                  ))}
                </div>
              )}
            </section>



          </div>

          {/* CONTACT INFO DETAILS MAP SECTION */}
          <section className="bg-slate-900 border-y border-slate-850 py-12 px-4 sm:px-6 lg:px-8" id="contact-section">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-white">Contact Gadget World</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Have open questions regarding wholesale orders, warranty checks, or custom specs order? Dial our help desks or visit our flagships stores directly!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-lg px-4 py-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>🏢 Level 7, Gadget Plaza Boulevard, Tech City</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-lg px-4 py-2.5">
                    <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>📞 Hotline: +1 (800) 555-GDGT</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-lg px-4 py-2.5">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>✉️ support@gadgetworld.com</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </main>
      )}

      {/* VIEW PAGE 1B: DEDICATED PRODUCT DETAILS PAGE */}
      {activeView === 'product-detail' && directProduct && (
        <ProductDetailPage
          product={directProduct}
          onBackClick={() => {
            setView('home');
            setDirectProduct(null);
          }}
          onConfirmOrder={handleConfirmOrder}
        />
      )}

      {/* VIEW PAGE 1C: DEDICATED CART PAGE */}
      {activeView === 'cart' && (
        <CartPage
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckoutClick={handleCartProceedCheckout}
          onBackToShopping={handleBackToShopping}
          theme={theme}
        />
      )}

      {/* VIEW PAGE 2: CHECKOUT ORDER FORM */}
      {activeView === 'checkout' && (
        <CheckoutForm
          directProduct={directProduct}
          cartItems={cartItems}
          onConfirmOrder={handleConfirmOrder}
          onBackToShopping={handleBackToShopping}
          currentUser={currentUser}
        />
      )}

      {/* VIEW PAGE 3: ORDER SUCCESS DISPLAY */}
      {activeView === 'order-success' && (
        <OrderSuccess
          order={submittedOrder}
          onBackToShopping={handleBackToShopping}
        />
      )}

      {/* VIEW PAGE 4: LOGIN PAGE */}
      {activeView === 'login' && (
        <LoginPage
          onRegisterClick={() => setView('register')}
          onLoginSuccess={async (loggedInUser) => {
            const isEmailAdmin = loggedInUser.email?.trim().toLowerCase() === 'rahatboss015@gmail.com';
            let role = isEmailAdmin ? 'admin' : 'customer';
            try {
              const uSnap = await getDoc(doc(db, 'users', loggedInUser.uid));
              if (uSnap.exists()) {
                role = uSnap.data().role || role;
              }
            } catch (err) {
              console.warn("Direct direct login query issue:", err);
            }
            
            if (role === 'admin') {
              setView('admin-dashboard');
            } else {
              setView('customer-dashboard');
            }
          }}
          onBackClick={() => setView('home')}
          theme={theme}
          showToast={showToast}
        />
      )}

      {/* VIEW PAGE 5: REGISTER PAGE */}
      {activeView === 'register' && (
        <RegisterPage
          onLoginClick={() => setView('login')}
          onRegisterSuccess={() => setView('login')}
          onBackClick={() => setView('home')}
          theme={theme}
          showToast={showToast}
        />
      )}

      {/* VIEW PAGE 6A: ADMIN PORTAL DASHBOARD */}
      {activeView === 'admin-dashboard' && currentUser && userRole === 'admin' && (
        <AdminDashboard
          user={currentUser}
          onLogoutClick={handleLogout}
          onBackClick={() => setView('home')}
          theme={theme}
          showToast={showToast}
        />
      )}

      {/* VIEW PAGE 6B: CUSTOMER CUSTOM DASHBOARD */}
      {activeView === 'customer-dashboard' && currentUser && (
        <CustomerDashboard
          user={currentUser}
          onLogoutClick={handleLogout}
          onBackClick={() => setView('home')}
          theme={theme}
          showToast={showToast}
          initialTab={accountActiveTab === 'orders' ? 'orders' : 'profile'}
        />
      )}

      {/* STICKY FOOTER ACCENT FOOTNOTES */}
      <footer className="w-full bg-slate-950 border-t border-slate-900/80 py-12 text-slate-450 font-sans">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Branding desk */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <img 
                  src="https://image.shoutmecrunch.com/wp-content/uploads/2026/05/gg.webp" 
                  alt="Gadget World Logo" 
                  className="w-8 h-8 object-contain rounded bg-white/5 p-0.5 border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <span className="text-lg font-serif tracking-tight text-white">
                  Gadget<span className="text-cyan-400">World</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-[245px] font-light">
                Your satisfaction is our priority. Discover high-end, premium gadgets including devices, smartwatches, and gear with free shipping and solid warranty guarantees.
              </p>
              
              {/* social indicators */}
              <div className="flex items-center gap-2.5 pt-1">
                <a href="#facebook" className="p-2 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-cyan-600/10 transition" aria-label="Facebook Link">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="#twitter" className="p-2 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-cyan-600/10 transition" aria-label="Twitter Link">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="#instagram" className="p-2 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-cyan-600/10 transition" aria-label="Instagram Link">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Catalog Categories Index Links */}
            <div className="space-y-3.5 text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Device Categories</h3>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {CATEGORIES.slice(1).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setView('home');
                        setSelectedCategory(cat);
                        setTimeout(() => handleScrollToSection('all-products-section'), 100);
                      }}
                      className="hover:text-cyan-400 transition cursor-pointer hover:underline text-left"
                    >
                      {cat} Shop
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links Navigations */}
            <div className="space-y-3.5 text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Support Desks</h3>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => handleScrollToSection('contact-section')} className="hover:text-cyan-400 transition cursor-pointer hover:underline text-left">
                    Find Store Locations
                  </button>
                </li>
                <li><a href="#terms" className="hover:text-cyan-400 hover:underline transition">COD Policy Conditions</a></li>
                <li><a href="#privacy" className="hover:text-cyan-400 hover:underline transition">Privacy & Encryptions</a></li>
                <li><a href="#return-refund" className="hover:text-cyan-400 hover:underline transition">7-Days Swap Return Policy</a></li>
                <li><a href="#affiliates" className="hover:text-cyan-400 hover:underline transition">Corporate Wholesale Bulk Desk</a></li>
              </ul>
            </div>

            {/* Newsletter Subscription form block */}
            <div className="space-y-3.5 text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Newsletter Hub</h3>
              <p className="text-xs">Subscribe to get secret coupons, price drops alerts, and brand releases.</p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-slate-905 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    id="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded p-1.5 transition cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {newsletterSubscribed && (
                  <p className="text-[10px] text-cyan-400 font-bold">✓ Subscribed successfully! Thank you.</p>
                )}
              </form>
            </div>

          </div>

          {/* Copyright signature */}
          <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Gadget World Ltd. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>Smart Products, Better Life 🛍️</span>
              <span className="text-slate-800">•</span>
              <span>Designed with pride for elite consumers.</span>
            </div>
          </div>

        </div>
      </footer>

      {/* MULTIPLE SIDE DIALOG OVERLAYS */}

      {/* Specs detailed modal */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onBuyNowClick={handleBuyNowDirect}
        onAddToCartClick={handleAddToCart}
      />

      {/* Cart Sidebar Drawer */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutClick={handleCartProceedCheckout}
      />

    </div>
  );
}
