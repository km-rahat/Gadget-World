import React, { useState } from 'react';
import { ArrowLeft, Star, Shield, Truck, RefreshCw, ShoppingBag, User, Phone, Mail, MapPin, CreditCard, Notebook } from 'lucide-react';
import { Product, OrderForm, formatBDT } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBackClick: () => void;
  onConfirmOrder: (formData: OrderForm) => void;
}

export default function ProductDetailPage({
  product,
  onBackClick,
  onConfirmOrder
}: ProductDetailPageProps) {
  // Gallery and Zoom effects state
  const [activeImage, setActiveImage] = useState(product.image);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Mobile Banking' | 'Card Payment'>('Cash on Delivery');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});

  // Image Gallery Thumbnails list (using some placeholder or unsplash variations)
  const thumbnails = [
    product.image,
    // Add variations for different views of the gadgets
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=500'
  ];

  // Magnifying Zoom Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Form validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const localErrors: Partial<Record<keyof OrderForm, string>> = {};
    if (!fullName.trim()) localErrors.fullName = 'Full Name is required';
    if (!phone.trim()) localErrors.phone = 'Phone Number is required';
    else if (phone.length < 8) localErrors.phone = 'Valid phone number is required';
    if (!email.trim()) localErrors.email = 'Email Address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) localErrors.email = 'Enter a valid email address';
    if (!address.trim()) localErrors.address = 'Full Shipping Address is required';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      const el = document.getElementById('order-form-scroll-marker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const payload: OrderForm = {
      fullName,
      phone,
      email,
      address,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      quantity,
      paymentMethod,
      notes
    };

    onConfirmOrder(payload);
  };

  return (
    <div className="relative bg-[#020617] text-[#f1f5f9] min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
      
      {/* Background radial effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-slate-800/10 blur-[130px]" />
      </div>

      <div className="max-w-[1920px] w-full mx-auto relative z-10 space-y-8">
        
        {/* Navigation Action Area */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackClick}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium text-xs transition duration-200 py-2 px-4 bg-slate-900 border border-slate-850 rounded cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </button>
          
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-950/30 border border-cyan-850/50 px-2.5 py-0.5 rounded">
            Product Detail Showcase
          </span>
        </div>

        {/* Dynamic Details block split into Left Side and Right Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-900/10 border border-slate-850 rounded-xl p-6 sm:p-8">
          
          {/* LEFT SIDE: Image display with thumbnail previews and zoom magnifying effect */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded border border-slate-800 bg-[#020617] overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Magnifying Zoom overlay */}
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${activeImage})`,
                  backgroundSize: '200%'
                }}
              />
            </div>

            {/* Thumbnail previews gallery */}
            <div className="flex gap-3 justify-center">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(thumb)}
                  className={`w-14 h-14 rounded overflow-hidden border transition cursor-pointer bg-[#020617] ${
                    activeImage === thumb ? 'border-cyan-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`${product.name} preview views`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Product Detailed Information */}
          <div className="flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-semibold bg-cyan-950/30 border border-cyan-850/40 px-2 py-0.5 rounded">
                  {product.category}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                  ✓ Availability: In Stock
                </span>
              </div>

              {/* Title & Ratings */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-white leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-800'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {product.rating} (Verified Purchaser Ratings)
                  </span>
                </div>
              </div>

              {/* Product Pricing card banner */}
              <div className="py-3 px-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 rounded">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-1">Guaranteed Deal Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#f1f5f9]">{formatBDT(product.price)}</span>
                  <span className="text-slate-500 text-xs line-through">{formatBDT(Math.round(product.price * 1.15))}</span>
                </div>
              </div>

              {/* Short description text */}
              <div className="space-y-1">
                <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Description</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specs detailed bullet indicators */}
              <div className="space-y-1.5 pt-2">
                <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Product Features</h4>
                <ul className="space-y-1 text-xs text-slate-350">
                  {product.specifications.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">&#8226;</span>
                      <span className="leading-relaxed font-light">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity dynamic selectors */}
              <div className="pt-3 flex items-center gap-4">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Quantity:</span>
                <div className="flex items-center border border-slate-800 rounded bg-slate-950 p-1">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="py-1 px-3 text-slate-400 hover:text-white font-bold cursor-pointer transition duration-150"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold font-sans text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="py-1 px-3 text-slate-400 hover:text-white font-bold cursor-pointer transition duration-150"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Premium styled Buy Now button triggered directly here */}
            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={() => {
                  setShowOrderForm(true);
                  setTimeout(() => {
                    const el = document.getElementById('order-form-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-bold py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest transition duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-cyan-950/25 cursor-pointer"
              >
                <span>BUY NOW</span>
              </button>
            </div>

          </div>

        </div>

        {/* Guarantees overview badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/30 border border-slate-850 rounded">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Truck className="w-5 h-5 text-cyan-455 shrink-0" />
            <div className="text-left">
              <h5 className="text-xs font-bold text-slate-205">FREE Worldwide Dispatch</h5>
              <p className="text-[10px] text-slate-500">Same day processing guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Shield className="w-5 h-5 text-cyan-455 shrink-0" />
            <div className="text-left">
              <h5 className="text-xs font-bold text-slate-205">1-Year Store Warranty</h5>
              <p className="text-[10px] text-slate-500">Free parts swap & support diagnostics</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-end">
            <RefreshCw className="w-5 h-5 text-cyan-455 shrink-0" />
            <div className="text-left">
              <h5 className="text-xs font-bold text-slate-205">7-Day Swap Back Policy</h5>
              <p className="text-[10px] text-slate-500">Zero charges return policy guarantee</p>
            </div>
          </div>
        </div>

        {/* Reveal checkout form smoothly right below product details when clicking BUY NOW */}
        {showOrderForm && (
          <div id="order-form-section" className="bg-slate-950 border border-slate-850 rounded-xl p-6 sm:p-8 space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-5 duration-300">
            
            <div id="order-form-scroll-marker" className="flex items-center justify-between border-b border-slate-900 pb-3 text-left">
              <div>
                <h3 className="text-lg font-serif text-white">
                  Confirm Your Shipment details
                </h3>
                <p className="text-[10px] uppercase text-cyan-404 tracking-widest mt-1">Please fulfill shipment and payment address information</p>
              </div>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="text-xs text-rose-450 hover:text-rose-400 hover:underline cursor-pointer uppercase tracking-wider"
              >
                ✕ Close Form
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" noValidate>
              
              {/* LEFT Side of Form: Input Fields */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Full Name <span className="text-cyan-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                      }}
                      className={`w-full bg-slate-900 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                        errors.fullName ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                      }`}
                    />
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-rose-400 font-medium">{errors.fullName}</p>}
                </div>

                {/* Email and Phone inputs row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Phone Number <span className="text-cyan-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="e.g. +1 555-0199"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        className={`w-full bg-slate-900 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                          errors.phone ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                        }`}
                      />
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    </div>
                    {errors.phone && <p className="text-[11px] text-rose-400 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Email Address <span className="text-cyan-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g. john@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full bg-slate-900 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                          errors.email ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                        }`}
                      />
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    </div>
                    {errors.email && <p className="text-[11px] text-rose-400 font-medium">{errors.email}</p>}
                  </div>

                </div>

                {/* Delivery Street Address */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Full Shipping Address <span className="text-cyan-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      placeholder="e.g. House 45, Applet Boulevard, Tech Road, City"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                      }}
                      rows={3}
                      className={`w-full bg-slate-900 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none ${
                        errors.address ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                      }`}
                    />
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                  {errors.address && <p className="text-[11px] text-rose-400 font-medium">{errors.address}</p>}
                </div>

                {/* Payment Method Option selections */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Payment Method <span className="text-cyan-400 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`py-3 px-3 rounded border text-left flex items-center gap-2.5 transition cursor-pointer text-xs ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-400 font-semibold'
                          : 'bg-slate-900 border-slate-850 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>💵</span>
                      <span>Cash on Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Mobile Banking')}
                      className={`py-3 px-3 rounded border text-left flex items-center gap-2.5 transition cursor-pointer text-xs ${
                        paymentMethod === 'Mobile Banking'
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-400 font-semibold'
                          : 'bg-slate-900 border-slate-850 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>📱</span>
                      <span>Mobile Banking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card Payment')}
                      className={`py-3 px-3 rounded border text-left flex items-center gap-2.5 transition cursor-pointer text-xs ${
                        paymentMethod === 'Card Payment'
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-400 font-semibold'
                          : 'bg-slate-900 border-slate-850 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>💳</span>
                      <span>Card Payment</span>
                    </button>
                  </div>
                </div>

                {/* Optional order notes */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Order Note (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      placeholder="Write any message to courier or shipping directions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-850 text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                    />
                    <Notebook className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>

              </div>

              {/* RIGHT Side of Form: Summary & Confirm Buttons */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Auto filled fields banner card */}
                <div className="bg-[#020617] border border-slate-850 rounded p-5 space-y-4 shadow-inner">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-2">
                    Auto-Filled Parameters
                  </h4>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Product Name:</span>
                      <span className="font-semibold text-white max-w-[180px] text-right truncate" title={product.name}>
                        {product.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product Price (Filled):</span>
                      <span className="font-mono text-slate-200">{formatBDT(product.price)} each</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Quantity:</span>
                      <span className="font-bold text-cyan-400 font-mono">x {quantity}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-3 text-sm font-bold">
                      <span className="text-slate-400">Total Price:</span>
                      <span className="text-cyan-400 font-mono text-lg">{formatBDT(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-4 px-6 rounded uppercase tracking-wider text-xs cursor-pointer transition shadow-xl"
                  >
                    Confirm Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 py-3 px-6 rounded uppercase tracking-wider text-xs cursor-pointer transition"
                  >
                    Cancel Order
                  </button>
                </div>

                <div className="text-center p-3.5 bg-slate-900/50 rounded border border-slate-850 flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-450" />
                  <span className="text-[10px] uppercase text-slate-400 tracking-wider">Payments securely handled</span>
                </div>

              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
}
