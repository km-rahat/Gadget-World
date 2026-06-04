import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, LogOut, Clock, Mail, Phone, Calendar, ArrowLeft, Loader2, Star, ShieldCheck, MapPin } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserAccountPageProps {
  user: any;
  onLogoutClick: () => void;
  onBackClick: () => void;
  theme: 'light' | 'dark';
  showToast: (msg: string) => void;
  initialTab?: 'profile' | 'orders';
}

export default function UserAccountPage({
  user,
  onLogoutClick,
  onBackClick,
  theme,
  showToast,
  initialTab = 'profile'
}: UserAccountPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch Firestore user metadata and actual orders
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // 1. Fetch user custom details (e.g. Phone number)
      setLoadingProfile(true);
      try {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfileData(profileDoc.data());
        }
      } catch (err) {
        console.warn("Could not load supplementary profile doc: ", err);
      } finally {
        setLoadingProfile(false);
      }

      // 2. Fetch orders matching email
      setLoadingOrders(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('email', '==', user.email)
        );
        const querySnapshot = await getDocs(q);
        const loadedOrders: any[] = [];
        querySnapshot.forEach((doc) => {
          loadedOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort orders by timestamp if available or ID
        loadedOrders.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA; 
        });

        setOrders(loadedOrders);
      } catch (err) {
        console.error("Could not fetch user orders from Firestore: ", err);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div className="flex-grow bg-main-bg text-text-main transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 text-left">
          <div className="space-y-1">
            <button
              onClick={onBackClick}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan-400 font-medium transition cursor-pointer mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2">
              <span className="h-6 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
              <span>My Secure Dashboard</span>
            </h1>
            <p className="text-xs text-text-muted">Manage your premium gadgets warrant, delivery & orders receipt track</p>
          </div>

          <button
            onClick={onLogoutClick}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/60 text-red-400 hover:bg-red-950/20 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-xs uppercase tracking-widest transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-xs uppercase tracking-widest transition cursor-pointer relative ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="absolute top-1 right-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content displays */}
        {activeTab === 'profile' ? (
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Left: Avatar Column */}
            <div className="flex flex-col items-center text-center space-y-4 md:border-r border-border-subtle md:pr-8 py-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300" />
                <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-400/40 flex items-center justify-center text-3xl font-bold font-serif text-cyan-400 shadow-xl overflow-hidden uppercase">
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{user.displayName || 'Gadget Lover'}</h3>
                <p className="text-xs text-text-muted mt-1 leading-none">{user.email}</p>
                <div className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Account</span>
                </div>
              </div>
            </div>

            {/* Right: Info Fields */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Account Specifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5">
                  <span className="text-text-muted font-medium">Full Identifier Name</span>
                  <p className="text-sm text-slate-100 font-bold bg-slate-950/40 border border-border-subtle p-3 rounded-xl flex items-center gap-2.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{user.displayName || 'Not Defined'}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-text-muted font-medium">Primary Electronic Mail</span>
                  <p className="text-sm text-slate-100 font-bold bg-slate-950/40 border border-border-subtle p-3 rounded-xl flex items-center gap-2.5 overflow-hidden text-ellipsis">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>{user.email}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-text-muted font-medium">Secure Delivery Hotline</span>
                  <p className="text-sm text-slate-100 font-bold bg-slate-950/40 border border-border-subtle p-3 rounded-xl flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{profileData?.phoneNumber || '+1 (555) 012-3456'}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-text-muted font-medium">Last Sign In Timestamp</span>
                  <p className="text-sm text-slate-100 font-bold bg-slate-950/40 border border-border-subtle p-3 rounded-xl flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Today'}</span>
                  </p>
                </div>
              </div>

              {/* Extended Member Note */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-border-subtle/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">🏅</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">World Club Elite Privilege</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  As an authenticated Gadget World club member, you qualify for <strong>No-Questions-Asked 7 Days swap replacements</strong> and prioritized warranty claim support. Ensure that orders are recorded under your email <strong>{user.email}</strong> dynamically.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6 text-left">
            {loadingOrders ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs text-text-muted">Analyzing database for secure orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
                <span className="text-4xl block">📦</span>
                <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
                <p className="text-xs text-text-muted">
                  You haven&apos;t completed any transaction under current account email address <strong>{user.email}</strong>. Browse our premium catalogue and place a custom order!
                </p>
                <button
                  onClick={onBackClick}
                  className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Browse Premium Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card-bg border border-border-subtle hover:border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 transition duration-300"
                  >
                    
                    {/* Header line of single order card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-800/20">
                            {order.orderId || 'GW-ORD-GEN'}
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/20 px-2 py-0.5 rounded-lg uppercase font-semibold">
                            Processing Dispatch
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted flex items-center gap-1 font-mono pt-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Submitted: {order.orderDate || 'Recently'}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-text-muted block font-semibold uppercase tracking-wider">Total Amount Paid</span>
                        <span className="text-base sm:text-lg font-extrabold text-cyan-400">
                          ${(order.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Middle items grid */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Ordered Items</span>
                      <div className="grid grid-cols-1 gap-2">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-slate-950/35 border border-border-subtle/50 p-3 rounded-xl flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{item.productName}</span>
                            <div className="flex items-center gap-4 text-text-muted shrink-0 text-right">
                              <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                              <span className="font-semibold text-white">${((item.productPrice || 0) * (item.quantity || 1)).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom shipping/payment details info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border-subtle/40 text-[11px] text-text-muted">
                      <div>
                        <span className="font-bold text-white block mb-0.5 uppercase tracking-wide">Receivers Address</span>
                        <p className="line-clamp-1 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0 text-cyan-400" />
                          <span>{order.address}</span>
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-white block mb-0.5 uppercase tracking-wide">Secure Contact Phone</span>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 shrink-0 text-cyan-400" />
                          <span>{order.phone}</span>
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-white block mb-0.5 uppercase tracking-wide">Payment Method</span>
                        <p className="font-mono text-cyan-400 font-bold">{order.paymentMethod}</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
