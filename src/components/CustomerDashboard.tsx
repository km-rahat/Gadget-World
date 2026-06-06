import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShoppingBag, 
  LogOut, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  MapPin, 
  Settings, 
  CheckCircle2, 
  Truck, 
  X,
  CreditCard,
  ClipboardList
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { formatBDT } from '../types';

interface CustomerDashboardProps {
  user: any;
  onLogoutClick: () => void;
  onBackClick: () => void;
  theme: 'light' | 'dark';
  showToast: (msg: string) => void;
  initialTab?: 'profile' | 'orders' | 'tracking';
}

export default function CustomerDashboard({
  user,
  onLogoutClick,
  onBackClick,
  theme,
  showToast,
  initialTab = 'profile'
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tracking'>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Active order selected for detailed tracking visualizer
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<any | null>(null);

  // Profile Edit fields state
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    defaultAddress: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Load Firestore supplemental user attributes and matching order items
  const loadDashboardData = async () => {
    if (!user) return;

    setLoadingProfile(true);
    try {
      const uDoc = await getDoc(doc(db, 'users', user.uid));
      if (uDoc.exists()) {
        const d = uDoc.data();
        setProfileData(d);
        setEditForm({
          fullName: d.fullName || d.name || user.displayName || '',
          phoneNumber: d.phoneNumber || '',
          defaultAddress: d.defaultAddress || ''
        });
      } else {
        setEditForm({
          fullName: user.displayName || '',
          phoneNumber: '',
          defaultAddress: ''
        });
      }
    } catch (err) {
      console.warn("Could not fetch supplementary profile sheet: ", err);
    } finally {
      setLoadingProfile(false);
    }

    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('email', '==', user.email)
      );
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // Sort: Newest first
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setOrders(list);
      
      // Auto-select the most recent order for tracking if none selected yet
      if (list.length > 0 && !selectedTrackingOrder) {
        setSelectedTrackingOrder(list[0]);
      }
    } catch (err) {
      console.error("Could not fetch own orders matching email: ", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle saving customer profile edits in Firestore
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      showToast("Full name cannot be left empty.");
      return;
    }

    setUpdatingProfile(true);
    try {
      // Synchronized write inside `/users/{userId}` permitted by security rules
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: editForm.fullName,
        name: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        defaultAddress: editForm.defaultAddress,
        updatedAt: new Date().toISOString()
      });
      showToast("Your profile information updated securely.");
      loadDashboardData(); // reload
    } catch (err) {
      console.error("Could not update customer metadata: ", err);
      showToast("Error update. Forcing default state.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Stepper tracker calculator helper
  const getProgressStepIndex = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'processing') return 1;
    if (s === 'shipped') return 2;
    if (s === 'delivered') return 3;
    if (s === 'cancelled') return -1;
    return 0; // Default pending
  };

  // Graphical Tracker Steps
  const trackingSteps = [
    { label: 'Order Placed', desc: 'Vendor confirmed receipt' },
    { label: 'Processing', desc: 'Securely packaged at center' },
    { label: 'In Transit', desc: 'Shipped via premium courier' },
    { label: 'Delivered', desc: 'Arrived at your location' }
  ];

  const themeCardBorder = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const themeCardBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const themeSubCardBg = theme === 'dark' ? 'bg-slate-950/45' : 'bg-slate-50/70';

  return (
    <div className="flex-grow bg-main-bg text-text-main transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-[1920px] w-full mx-auto space-y-8">
        
        {/* Navigation Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div className="space-y-1">
            <button
              onClick={onBackClick}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan-400 font-medium transition cursor-pointer mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2">
              <span className="h-6 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
              <span>Customer Personal Room</span>
            </h1>
            <p className="text-xs text-text-muted">Track device shipments, manage your billing address, and view transaction history.</p>
          </div>

          <button
            onClick={onLogoutClick}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/50 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer self-start sm:self-center shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dynamic Category Navigation Stream */}
        <div className="flex border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-widest transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/5'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-widest transition cursor-pointer relative ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/5'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Records</span>
            {orders.length > 0 && (
              <span className="absolute top-1 right-1.5 bg-cyan-400 text-slate-950 font-bold text-[8.5px] px-1.5 py-0.5 rounded-full leading-none">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('tracking');
              if (orders.length > 0 && !selectedTrackingOrder) {
                setSelectedTrackingOrder(orders[0]);
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-widest transition cursor-pointer ${
              activeTab === 'tracking'
                ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/5'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Order Tracking</span>
          </button>
        </div>

        {/* ============================== */}
        {/* VIEW A: PROFILE PARAMETERS VIEW */}
        {/* ============================== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-in fade-in">
            
            {/* Customer Avatar overview card */}
            <div className={`p-6 text-center space-y-4 rounded-2xl border ${themeCardBorder} ${themeCardBg} shadow-xl`}>
              <div className="relative group inline-block mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-bold text-cyan-400 uppercase select-none">
                  {editForm.fullName ? editForm.fullName.charAt(0) : user.email.charAt(0)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{editForm.fullName || 'Gadget Enthusiast'}</h3>
                <p className="text-[11px] text-text-muted break-all mt-1">{user.email}</p>
                
                <div className="inline-flex items-center gap-1.5 mt-3.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/15 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Customer</span>
                </div>
              </div>

              {/* Privilege note banner */}
              <div className={`p-4 rounded-xl ${themeSubCardBg} text-[11px] text-text-muted leading-relaxed text-left border ${themeCardBorder}`}>
                <p className="font-bold text-white mb-1">🏅 VIP Gadget Privileges</p>
                <span>Complete eligibility diagnostic: Includes prioritized dispatch checkout, live transit tracking streams, and dedicated warranty sheets activation!</span>
              </div>
            </div>

            {/* Profile Modification Sheet Form */}
            <div className={`col-span-1 md:col-span-2 p-6 sm:p-8 rounded-2xl border ${themeCardBorder} ${themeCardBg} shadow-xl space-y-6`}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Synchronize Profile Attributes</span>
              </h4>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Title Name identifier */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-bold block">Standard Naming Holder</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950/65 border border-slate-800 text-slate-100 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 font-semibold"
                      placeholder="Your Full Name"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Mail (read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-bold block">Electronic Identity Mail</label>
                    <p className="p-3 bg-slate-950/30 border border-slate-850/60 rounded-lg font-mono text-slate-400 text-xs flex items-center gap-2 overflow-hidden text-ellipsis">
                      <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{user.email}</span>
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-bold block">Hotline Contact Number</label>
                    <input 
                      type="tel"
                      className="w-full bg-slate-950/65 border border-slate-800 text-slate-100 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 font-mono"
                      placeholder="e.g. +1 (555) 798-2000"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>

                  {/* Last Active login time */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-bold block">Login Authentication Session</label>
                    <p className="p-3 bg-slate-950/30 border border-slate-850/60 rounded-lg text-slate-400 font-mono flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span>{user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Secure Live'}</span>
                    </p>
                  </div>

                </div>

                {/* Shipping Location backup */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-bold block">Primary Receiving Address</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-slate-950/65 border border-slate-800 text-slate-100 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 leading-normal"
                    placeholder="Enter your default shipping address details..."
                    value={editForm.defaultAddress}
                    onChange={(e) => setEditForm(prev => ({ ...prev, defaultAddress: e.target.value }))}
                  />
                </div>

                {/* Submission action */}
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest text-[11px] rounded transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile Details...</span>
                    </>
                  ) : (
                    <span>Save Account Parameters</span>
                  )}
                </button>

              </form>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* VIEW B: ORDER TRANSACTION HISTORY SHEETS */}
        {/* ======================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
            {loadingOrders ? (
              <div className="py-20 text-center flex flex-col items-center gap-3 bg-slate-900 border border-slate-850 rounded-2xl">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs text-text-muted">Filtering order logs...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${themeCardBorder} ${themeCardBg} max-w-sm mx-auto space-y-4 shadow-xl`}>
                <span className="text-4xl block">📦</span>
                <h3 className="text-lg font-extrabold text-white">No active orders placed yet</h3>
                <p className="text-xs text-text-muted">
                  We could not parse any complete billing transactions registered under current address <strong>{user.email}</strong>.
                </p>
                <button
                  onClick={onBackClick}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow"
                >
                  Explore Gadget Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const currentStatus = ord.status || 'Pending';
                  const sColor = 
                    currentStatus === 'Delivered' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-950' :
                    currentStatus === 'Cancelled' ? 'text-rose-400 bg-rose-950/20 border-rose-950' :
                    currentStatus === 'Shipped' ? 'text-cyan-400 bg-cyan-950/20 border-cyan-955' :
                    currentStatus === 'Processing' ? 'text-yellow-405 bg-yellow-950/20 border-yellow-950' :
                    'text-slate-300 bg-slate-900 border-slate-800';

                  return (
                    <div 
                      key={ord.id}
                      className={`p-5 sm:p-6 rounded-2xl border ${themeCardBorder} ${themeCardBg} shadow-lg space-y-4`}
                    >
                      {/* Top Strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/65 px-2.5 py-0.5 rounded border border-cyan-900/15">
                              {ord.orderId || 'GW-ORD-GEN'}
                            </span>
                            <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold ${sColor}`}>
                              {currentStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted flex items-center gap-1 font-mono pt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Submitted: {ord.orderDate || 'Recently'}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-text-muted block font-semibold uppercase tracking-wider">Estimated Total</span>
                          <span className="text-base font-extrabold text-cyan-400">{formatBDT(ord.totalAmount || 0)}</span>
                        </div>
                      </div>

                      {/* Purchased products lists */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Bought Products</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {Array.isArray(ord.items) && ord.items.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-xl ${themeSubCardBg} flex justify-between items-center text-xs border border-border-subtle/40`}>
                              <span className="font-bold text-slate-200">{item.productName}</span>
                              <div className="flex items-center gap-6 text-text-muted">
                                <span>Quantity: <strong className="text-white">{item.quantity}</strong></span>
                                <span className="font-bold text-white">{formatBDT((item.productPrice || 0) * (item.quantity || 1))}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer actions of Order card */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-border-subtle/40 text-[11px] text-text-muted">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Address: {ord.address}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTrackingOrder(ord);
                            setActiveTab('tracking');
                          }}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-border-subtle text-cyan-400 hover:text-white rounded text-[10px] uppercase font-bold transition cursor-pointer self-start sm:self-center flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Package Visualizer →</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW C: VISUAL REAL-TIME ORDER TRACKING */}
        {/* ======================================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-6 animate-in fade-in">
            {orders.length === 0 ? (
              <p className="py-12 text-center text-xs text-text-muted bg-slate-900 border border-slate-850 rounded-2xl">
                Place an initial order to activate live physical transit tracking.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left panel: list of orders */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] mb-2 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>Select Order Record</span>
                  </h4>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orders.map((ord) => {
                      const isSelected = selectedTrackingOrder?.id === ord.id;
                      return (
                        <button
                          key={ord.id}
                          onClick={() => setSelectedTrackingOrder(ord)}
                          className={`w-full text-left p-3.5 rounded-xl border transition duration-300 cursor-pointer block ${
                            isSelected 
                              ? 'border-cyan-400 bg-cyan-950/15' 
                              : 'border-border-subtle hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono font-bold text-slate-100 text-[11px]">{ord.orderId}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              ord.status === 'Delivered' ? 'bg-emerald-950/40 text-emerald-400' :
                              ord.status === 'Cancelled' ? 'bg-rose-950/40 text-rose-405' :
                              'bg-slate-950 text-cyan-400'
                            }`}>
                              {ord.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted leading-tight font-light truncate">{ord.address}</p>
                          <p className="text-[10px] text-cyan-400 font-bold mt-1.5 font-mono">{formatBDT(ord.totalAmount || 0)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right panel: dynamic Visual Tracking Progress Stepper Map */}
                <div className={`md:col-span-2 p-6 sm:p-8 rounded-2xl border ${themeCardBorder} ${themeCardBg} shadow-2xl space-y-6 text-left`}>
                  
                  {selectedTrackingOrder ? (
                    <div className="space-y-6">
                      
                      {/* Top selected card */}
                      <div className="pb-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-widest">Active Dispatch Log</span>
                          <h4 className="text-lg font-serif font-bold text-white font-mono mt-0.5">{selectedTrackingOrder.orderId}</h4>
                          <p className="text-[10px] text-text-muted mt-1 leading-snug">Estimated Delivery Window: {selectedTrackingOrder.estimatedDelivery || "Expected 1 to 2 business days"}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] text-text-muted block font-bold uppercase tracking-wider">Price Charged</span>
                          <span className="text-lg font-extrabold text-cyan-400 font-mono">{formatBDT(selectedTrackingOrder.totalAmount || 0)}</span>
                        </div>
                      </div>

                      {/* PROGRESS GRAPHICAL STEPPER (Ordered -> Processing -> Shipped -> Delivered) */}
                      {selectedTrackingOrder.status === 'Cancelled' ? (
                        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900 border-dashed text-center space-y-2">
                          <p className="text-xl">⚠️</p>
                          <h5 className="font-bold text-rose-400 text-xs uppercase tracking-widest">This order has been Cancelled</h5>
                          <p className="text-[11px] text-text-muted leading-relaxed max-w-sm mx-auto">
                            The dispatch queue was terminated at store administrator level. If you believe this is incorrect, dial our helpdesk registry support lines!
                          </p>
                        </div>
                      ) : (
                        <div className="relative pt-4 pb-4">
                          
                          {/* Stepper progressive connector line */}
                          <div className="absolute top-1/2 left-4 md:left-[12.5%] right-4 md:right-[12.5%] h-1 bg-border-subtle -translate-y-1/2 hidden md:block" />
                          <div 
                            className="absolute top-1/2 left-[12.5%] h-1 bg-[#00E5FF] -translate-y-1/2 hidden md:block transition-all duration-500" 
                            style={{ 
                              width: `${(getProgressStepIndex(selectedTrackingOrder.status) / 3) * 75}%` 
                            }}
                          />

                          {/* Desktop timeline nodes */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 md:text-center text-left">
                            {trackingSteps.map((step, idx) => {
                              const activeIdx = getProgressStepIndex(selectedTrackingOrder.status);
                              const isCompleted = idx <= activeIdx;
                              const isCurrent = idx === activeIdx;

                              return (
                                <div key={idx} className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 leading-normal">
                                  
                                  {/* Node bulb */}
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-lg transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 scale-110' 
                                      : 'bg-slate-950 border-slate-800 text-slate-500'
                                  }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>

                                  {/* Step text info */}
                                  <div className="md:space-y-0.5 text-left md:text-center">
                                    <h5 className={`font-bold text-xs uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-slate-550'}`}>
                                      {step.label}
                                    </h5>
                                    <p className="text-[10px] text-text-muted leading-tight font-light">{step.desc}</p>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Display items list of track details */}
                      <div className={`p-4 rounded-xl ${themeSubCardBg} space-y-3 border border-border-subtle/50`}>
                        <div className="flex justify-between items-center border-b border-border-subtle/30 pb-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                          <span>Items in package</span>
                          <span>Method: COD ({selectedTrackingOrder.paymentMethod})</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          {Array.isArray(selectedTrackingOrder.items) && selectedTrackingOrder.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">{it.productName}</span>
                              <span className="text-text-muted">Quantity: <strong className="text-white">{it.quantity}</strong></span>
                            </div>
                          ))}
                        </div>
                        
                        {selectedTrackingOrder.notes && (
                          <div className="pt-2 border-t border-border-subtle/25">
                            <span className="text-[9px] text-text-muted font-bold block uppercase mb-0.5">Customer Delivery note:</span>
                            <p className="text-[10px] text-slate-400 italic font-mono">{selectedTrackingOrder.notes}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <p className="py-20 text-center text-xs text-text-muted">Please select an order to display delivery stream timeline.</p>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
