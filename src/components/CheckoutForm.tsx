import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, ShieldCheck, Mail, Phone, User, MapPin, Notebook, CreditCard, ChevronRight } from 'lucide-react';
import { OrderForm, CartItem, Product } from '../types';

interface CheckoutFormProps {
  directProduct: Product | null;
  cartItems: CartItem[];
  onConfirmOrder: (formData: OrderForm) => void;
  onBackToShopping: () => void;
  currentUser?: any;
}

export default function CheckoutForm({
  directProduct,
  cartItems,
  onConfirmOrder,
  onBackToShopping,
  currentUser
}: CheckoutFormProps) {
  
  // Determine if direct product checkout or shopping cart checkout is used
  const isDirectCheckout = !!directProduct;
  
  // Calculate default values based on checkout source
  const defaultProductName = isDirectCheckout 
    ? directProduct.name 
    : cartItems.map(item => `${item.product.name} x${item.quantity}`).join(', ');

  const defaultProductPrice = isDirectCheckout
    ? directProduct.price
    : cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Form states
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(isDirectCheckout ? 1 : 1);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Mobile Banking' | 'Card Payment'>('Cash on Delivery');
  const [notes, setNotes] = useState('');

  // Autofill if currentUser is available or changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName) setFullName(currentUser.displayName);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Local errors validation state
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});

  // Calculations for display
  const singleUnitPrice = isDirectCheckout ? directProduct.price : defaultProductPrice;
  const deliveryCharge = 0; // Free Standard
  const totalAmount = isDirectCheckout 
    ? singleUnitPrice * quantity 
    : defaultProductPrice; // Cart calculates total itself, quantity field in form is for multiplier if direct checkout

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation schema check
    const localErrors: Partial<Record<keyof OrderForm, string>> = {};
    if (!fullName.trim()) localErrors.fullName = 'Full Name is required';
    if (!phone.trim()) localErrors.phone = 'Phone Number is required';
    else if (phone.length < 8) localErrors.phone = 'Please key in a valid phone contact';
    if (!email.trim()) localErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) localErrors.email = 'Please provide a valid email format';
    if (!address.trim()) localErrors.address = 'Detailed shipping address is required';
    if (quantity <= 0) localErrors.quantity = 'Quantity must be 1 or higher';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      // scroll to top of form
      const el = document.getElementById('checkout-form-box');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Set structure for confirm state handler
    const payload: OrderForm = {
      fullName,
      phone,
      email,
      address,
      productId: isDirectCheckout ? directProduct.id : 'cart_checkout',
      productName: defaultProductName,
      productPrice: singleUnitPrice,
      quantity: isDirectCheckout ? quantity : 1,
      paymentMethod,
      notes
    };

    onConfirmOrder(payload);
  };

  return (
    <div className="relative bg-[#020617] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900" id="checkout-form-box">
      
      {/* Background radial blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[450px] h-[450px] rounded-full bg-slate-800/10 blur-[130px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Back control banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium text-xs transition-all py-2 px-3.5 bg-slate-900 border border-slate-800 rounded cursor-pointer uppercase tracking-wider"
            id="checkout-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </button>
          
          <div className="text-left sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-white">
              Review & Confirm Order
            </h1>
            <p className="text-[10px] uppercase text-cyan-400 tracking-widest mt-1">Secure payment checkouts by Gadget World</p>
          </div>
        </div>

        {/* Main grid columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Checkout Form */}
          <form 
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-lg p-6 sm:p-8 space-y-6 shadow-xl"
            noValidate
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#f1f5f9] flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <User className="w-4.5 h-4.5 text-cyan-400" />
              Customer Information
            </h2>

            {/* Full Name */}
            <div className="space-y-1.5 text-left">
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
                  className={`w-full bg-slate-950 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                    errors.fullName ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                  }`}
                  id="checkout-fullName-input"
                />
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-400 font-medium">{errors.fullName}</p>}
            </div>

            {/* Phone & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone */}
              <div className="space-y-1.5 text-left">
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
                    className={`w-full bg-slate-950 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                      errors.phone ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                    }`}
                    id="checkout-phone-input"
                  />
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-400 font-medium">{errors.phone}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 text-left">
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
                    className={`w-full bg-slate-950 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                      errors.email ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                    }`}
                    id="checkout-email-input"
                  />
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 font-medium">{errors.email}</p>}
              </div>

            </div>

            {/* Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Full Shipping Address <span className="text-cyan-400 font-bold">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="House #, Street name, City, Zipcode, State"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                  }}
                  rows={3}
                  className={`w-full bg-slate-950 border text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none ${
                    errors.address ? 'border-rose-500/70 ring-1 ring-rose-500/10' : 'border-slate-850'
                  }`}
                  id="checkout-address-input"
                />
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
              {errors.address && <p className="text-[11px] text-rose-400 font-medium">{errors.address}</p>}
            </div>

            {/* Payment Method Select dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Payment Method Method Selection
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-350 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  id="checkout-paymentMethod-select"
                >
                  <option value="Cash on Delivery">💵 Cash on Delivery (COD)</option>
                  <option value="Mobile Banking">📱 Mobile Banking (Bkash / Stripe / PayPal)</option>
                  <option value="Card Payment">💳 Credit / Debit Card Online Payment</option>
                </select>
                <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <span className="text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* Optional notes */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Order Notes (Optional)
              </label>
              <div className="relative">
                <textarea
                  placeholder="Special courier notes, preferred timing, landmarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-600 rounded py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  id="checkout-notes-input"
                />
                <Notebook className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3.5 px-6 rounded transition cursor-pointer uppercase tracking-wider text-xs"
                id="checkout-confirm-order-btn"
              >
                <span>Confirm Special Order</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex justify-center items-center gap-1.5 text-[10px] tracking-wider text-slate-400 font-sans uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Secure SSL 256-Bit order encryption protocol</span>
              </div>
            </div>

          </form>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Products panel display */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#f1f5f9] flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShoppingBag className="w-4.5 h-4.5 text-cyan-400" />
                Order Summary
              </h2>

              {/* Single DIRECT Product Flow */}
              {isDirectCheckout ? (
                <div className="space-y-4">
                  <div className="flex gap-3 p-2.5 bg-[#020617]/50 border border-slate-850 rounded">
                    <img 
                      src={directProduct.image} 
                      alt={directProduct.name} 
                      className="w-14 h-14 rounded object-cover bg-slate-900 border border-slate-850 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{directProduct.name}</h4>
                      <p className="text-[9px] text-cyan-400 uppercase tracking-widest leading-none mt-1">{directProduct.category}</p>
                      <p className="text-xs font-mono text-slate-400 mt-2">${directProduct.price} each</p>
                    </div>
                  </div>

                  {/* Quantity selector inside order summary */}
                  <div className="bg-[#020617]/30 border border-slate-850 p-2 rounded flex items-center justify-between text-xs">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Adjust Qty:</span>
                    <div className="flex items-center border border-slate-800 rounded p-0.5 bg-slate-950">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity > 1) setQuantity(quantity - 1);
                        }}
                        className="py-0.5 px-2 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white px-2.5 font-mono">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="py-0.5 px-2 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Shopping Cart Checkout Flow */
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3 text-left items-center p-2 bg-[#020617]/50 border border-slate-850/60 rounded">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-350 font-mono">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* pricing aggregate breakdown */}
              <div className="pt-4 border-t border-slate-850 space-y-2 text-xs text-left">
                <div className="flex justify-between text-slate-450">
                  <span>Product Subtotal:</span>
                  <span className="font-mono text-slate-300">${(isDirectCheckout ? singleUnitPrice : defaultProductPrice).toLocaleString()}</span>
                </div>
                {isDirectCheckout && (
                  <div className="flex justify-between text-slate-455">
                    <span>Selected Qty Multiplier:</span>
                    <span className="font-mono text-slate-300">x{quantity}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-455">
                  <span>Delivery Charge:</span>
                  <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider">FREE Standard</span>
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-[#f1f5f9] border-t border-slate-850 pt-3">
                  <span>Grand Total:</span>
                  <span className="text-lg text-cyan-400 font-mono">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Quick trust assurances */}
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-lg text-left space-y-3">
              <p className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Why Gadget World?</p>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-light">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>COD (Cash on Delivery)</strong> option guarantees zero risk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>We host an active 7-day swap guarantee policy on our gadgets portfolio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Official product manufacturers with valid warrants registered inside physical stores.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
