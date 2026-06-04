import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Calendar, 
  ChevronDown, 
  Settings, 
  LogOut, 
  Filter, 
  Search, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  Loader2,
  X,
  Upload,
  Activity,
  UserCheck,
  ShieldAlert,
  Save,
  Grid
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, ConfirmedOrder } from '../types';

interface AdminDashboardProps {
  user: any;
  onLogoutClick: () => void;
  onBackClick: () => void;
  theme: 'light' | 'dark';
  showToast: (msg: string) => void;
}

export default function AdminDashboard({
  user,
  onLogoutClick,
  onBackClick,
  theme,
  showToast
}: AdminDashboardProps) {
  // Navigation tabs inside Admin
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'settings'>('dashboard');

  // Firestore collections states
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading states
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Search & Filter state variables
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Selected state for details drawers
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Forms / Modal States for Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setForm] = useState({
    id: '',
    name: '',
    price: 0,
    category: 'Smartphones',
    description: '',
    image: '',
    rating: 4.5,
    isFeatured: false,
    specificationsText: ''
  });

  // Settings mock state
  const [storeSettings, setStoreSettings] = useState({
    storeId: 'GW-001-TECH',
    storeName: 'Gadget World Flagship Store',
    storeStatus: 'Open',
    announcement: 'Exclusive 15% discount on all Titanium Smartphones is live!',
    freeShippingThreshold: 150,
  });

  // Error logging helper matching firebase-integration skill
  const handleFirestoreErr = (error: unknown, operation: string, path: string) => {
    const errorString = error instanceof Error ? error.message : String(error);
    const errInfo = {
      error: errorString,
      operationType: operation,
      path: path,
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      }
    };
    console.error('Firestore Error detailed: ', JSON.stringify(errInfo));
    showToast(`Access Denied: ${errorString.substring(0, 40)}...`);
  };

  // Seeding helper to pre-populate database if empty (ensures user always has premium data)
  const seedProductsIfEmpty = async (fetchedList: Product[]) => {
    if (fetchedList.length > 0) return;
    setLoadingProducts(true);
    try {
      showToast("Initializing premium gadgets catalog in Firestore...");
      const { PRODUCTS } = await import('../data');
      for (const prod of PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), {
          id: prod.id,
          name: prod.name,
          price: prod.price,
          category: prod.category,
          description: prod.description,
          image: prod.image,
          rating: prod.rating,
          isFeatured: prod.isFeatured || false,
          specifications: prod.specifications || [],
          createdAt: new Date().toISOString()
        });
      }
      showToast("Store elements successfully synchronized!");
      fetchProducts();
    } catch (err) {
      console.error("Seeding failed: ", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Firestore Dynamic collections
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const list: Product[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Product);
      });
      setProducts(list);
      // Seed if absolutely empty
      if (list.length === 0) {
        seedProductsIfEmpty([]);
      }
    } catch (err) {
      handleFirestoreErr(err, 'list', 'products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      // Sort: Newest first
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setOrders(list);
    } catch (err) {
      handleFirestoreErr(err, 'list', 'orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setCustomers(list);
    } catch (err) {
      handleFirestoreErr(err, 'list', 'users');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
  }, []);

  // Update order status trigger
  const handleUpdateOrderStatus = async (orderIdKey: string, nextStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderIdKey), {
        status: nextStatus
      });
      // Update local state instantly
      setOrders((prev) => 
        prev.map((o) => (o.id === orderIdKey ? { ...o, status: nextStatus } : o))
      );
      showToast(`Order status updated to: ${nextStatus}`);
    } catch (err) {
      handleFirestoreErr(err, 'update', `orders/${orderIdKey}`);
    }
  };

  // Image upload base64 converter
  const handleFormImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Product submit form handler
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category) {
      showToast("Please fill in name, price, and category!");
      return;
    }

    const payloadId = editingProduct ? editingProduct.id : `GW-PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const specsArray = productForm.specificationsText
      ? productForm.specificationsText.split('\n').filter(s => s.trim())
      : ['Premium grade accessory and device'];

    const targetDocPayload = {
      id: payloadId,
      name: productForm.name,
      price: Number(productForm.price),
      category: productForm.category,
      description: productForm.description || "Sophisticated premium smart technology solution.",
      image: productForm.image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=500",
      rating: Number(productForm.rating),
      isFeatured: Boolean(productForm.isFeatured),
      specifications: specsArray,
    };

    setLoadingProducts(true);
    try {
      await setDoc(doc(db, 'products', payloadId), targetDocPayload);
      showToast(`Product "${productForm.name}" ${editingProduct ? "updated" : "created"}!`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      // reset state form
      setForm({
        id: '',
        name: '',
        price: 0,
        category: 'Smartphones',
        description: '',
        image: '',
        rating: 4.5,
        isFeatured: false,
        specificationsText: ''
      });
      fetchProducts();
    } catch (err) {
      handleFirestoreErr(err, editingProduct ? 'update' : 'create', `products/${payloadId}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Delete product action trigger
  const handleDeleteProductClick = async (productIdKey: string, productName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${productName}" from Gadget Worlds inventory?`)) {
      return;
    }
    setLoadingProducts(true);
    try {
      await deleteDoc(doc(db, 'products', productIdKey));
      showToast(`Deleted "${productName}" successfully.`);
      fetchProducts();
    } catch (err) {
      handleFirestoreErr(err, 'delete', `products/${productIdKey}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Total calculated statistics summaries
  const totalSalesRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Status-based orders calculation counts
  const pendingOrdersCount = orders.filter(o => !o.status || o.status === 'Pending').length;
  const processedCount = orders.filter(o => o.status === 'Processing').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  // Filtered lists logic
  const filteredOrders = orders.filter((o) => {
    const oId = String(o.orderId || '').toLowerCase();
    const cName = String(o.customerName || '').toLowerCase();
    const cEmail = String(o.email || '').toLowerCase();
    const queryTerm = orderSearchQuery.toLowerCase();
    
    const matchesSearch = oId.includes(queryTerm) || cName.includes(queryTerm) || cEmail.includes(queryTerm);
    
    const currentStatus = o.status || 'Pending';
    const matchesStatus = orderStatusFilter === 'All' || currentStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter((c) => {
    const name = String(c.fullName || c.name || '').toLowerCase();
    const email = String(c.email || '').toLowerCase();
    const phone = String(c.phoneNumber || '').toLowerCase();
    const term = customerSearchQuery.toLowerCase();
    
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  const filteredProductsCatalog = products.filter((p) => {
    const name = String(p.name || '').toLowerCase();
    const desc = String(p.description || '').toLowerCase();
    const category = String(p.category || '').toLowerCase();
    const term = productSearchQuery.toLowerCase();

    return name.includes(term) || desc.includes(term) || category.includes(term);
  });

  return (
    <div className="flex-grow bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 text-left selection:bg-cyan-500/30 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Ribbon section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <button
              onClick={onBackClick}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition cursor-pointer mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Admin Portal</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded bg-cyan-950 border border-cyan-850/50 text-cyan-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </span>
              <span>Admin Management Portal</span>
            </h1>
            <p className="text-xs text-slate-400">Secure overview of store inventory, order dispatch streams, and customers profile sheets.</p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <div className="text-xs text-right pr-2">
              <p className="text-slate-350 font-bold uppercase tracking-wider text-[10px]">Identified as Admin</p>
              <p className="text-cyan-400 text-xs font-mono">{user?.email}</p>
            </div>
            
            <button
              onClick={onLogoutClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-red-900 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Administration Navigation Pills Row */}
        <div className="flex flex-wrap border-b border-slate-900 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'products'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Manage Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer relative ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] bg-rose-600 font-bold text-white leading-none">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'customers'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Customers</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* ======================================= */}
        {/* VIEW 1: MAIN PORTAL OVERVIEW / DASHBOARD */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Quick Analytics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Sales Gross volume */}
              <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Estimated Gross Revenue</span>
                  <span className="text-2xl font-extrabold text-cyan-400 block font-mono">
                    ${totalSalesRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/10 px-1.5 py-0.5 rounded">Excluding Cancellations</span>
                </div>
                <div className="p-3.5 rounded bg-cyan-950 border border-cyan-800/35 text-cyan-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Users & Customers</span>
                  <span className="text-2xl font-extrabold text-white block font-mono">
                    {loadingCustomers ? '...' : customers.length}
                  </span>
                  <span className="text-[10px] text-slate-400 text-xs">Registered profiles on database</span>
                </div>
                <div className="p-3.5 rounded bg-indigo-950 border border-indigo-800/35 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Catalog Item count</span>
                  <span className="text-2xl font-extrabold text-white block font-mono">
                    {loadingProducts ? '...' : products.length}
                  </span>
                  <span className="text-[10px] text-slate-400">Premium active listings</span>
                </div>
                <div className="p-3.5 rounded bg-emerald-950 border border-emerald-800/35 text-emerald-400">
                  <Grid className="w-5 h-5" />
                </div>
              </div>

              {/* Target Pending items alert */}
              <div className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Orders Processing Stage</span>
                  <span className="text-2xl font-extrabold text-rose-400 block font-mono">
                    {pendingOrdersCount} <span className="text-xs text-slate-400 font-normal">Pending</span>
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Requires dispatch check</span>
                  </span>
                </div>
                <div className="p-3.5 rounded bg-rose-950 border border-rose-800/10 text-rose-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Quick action helper buttons block */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">⚙️</span>
                <p className="text-xs text-slate-300">Store Front is currently <strong className="text-emerald-400">ONLINE</strong>. Seeding and schema operations are responsive.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setForm({
                      id: '',
                      name: '',
                      price: 0,
                      category: 'Smartphones',
                      description: '',
                      image: '',
                      rating: 4.5,
                      isFeatured: false,
                      specificationsText: ''
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
                <button 
                  onClick={() => { fetchOrders(); fetchCustomers(); fetchProducts(); showToast("Refreshed Database successfully."); }}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold px-3 py-1.5 text-xs uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Table layout: Recent Orders (Max 5) */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Recent Orders Stream</h3>
                  <p className="text-xs text-slate-400">Immediate view of orders recently placed across current development sessions.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  View All Orders →
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-10 text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-400">Loading order log...</span>
                </div>
              ) : orders.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-400">No customer orders recorded in Firestore yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase text-[9px] tracking-widest text-slate-400 border-b border-slate-850">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4 text-center">Items</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {orders.slice(0, 5).map((ord) => {
                        const statusColor = 
                          ord.status === 'Delivered' ? 'text-emerald-400 bg-emerald-950/30' :
                          ord.status === 'Cancelled' ? 'text-rose-400 bg-rose-950/30' :
                          ord.status === 'Shipped' ? 'text-cyan-400 bg-cyan-950/30' :
                          ord.status === 'Processing' ? 'text-yellow-400 bg-yellow-950/30' :
                          'text-slate-300 bg-slate-950';

                        return (
                          <tr key={ord.id} className="hover:bg-slate-850/30 transition">
                            <td className="py-3 px-4 font-mono font-bold text-cyan-400">{ord.orderId}</td>
                            <td className="py-3 px-4 font-semibold text-slate-100">
                              <p className="leading-tight">{ord.customerName}</p>
                              <p className="text-[10px] text-slate-400 font-normal">{ord.email}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{ord.orderDate || 'Today'}</td>
                            <td className="py-3 px-4 font-mono text-[10px]">{ord.paymentMethod}</td>
                            <td className="py-3 px-4 font-semibold text-center">{Array.isArray(ord.items) ? ord.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : 1}</td>
                            <td className="py-3 px-4 text-cyan-400 font-bold">${(ord.totalAmount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusColor}`}>
                                {ord.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 2: PRODUCT MANAGEMENT CATALOG */}
        {/* ======================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Dynamic Products Directory</h3>
                <p className="text-xs text-slate-400">Total {products.length} products verified inside Firebase Firestore collection.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search catalog products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-64"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setForm({
                      id: '',
                      name: '',
                      price: 0,
                      category: 'Smartphones',
                      description: '',
                      image: '',
                      rating: 4.5,
                      isFeatured: false,
                      specificationsText: ''
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold px-4 py-2 text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-400">Recalibrating store product catalog...</span>
              </div>
            ) : filteredProductsCatalog.length === 0 ? (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center max-w-sm mx-auto space-y-4">
                <p className="text-4xl text-center">📋</p>
                <h4 className="text-sm font-bold text-white">No products found</h4>
                <p className="text-xs text-slate-450">Try broadening your queries or add custom premium accessories into the layout.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProductsCatalog.map((prod) => (
                  <div 
                    key={prod.id}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Image container with file or url preview */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 relative border border-slate-850">
                        <img 
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 text-[9px] font-bold text-cyan-400 px-2 py-0.5 rounded tracking-widest uppercase shadow">
                          {prod.category}
                        </span>
                        {prod.isFeatured && (
                          <span className="absolute top-3 right-3 bg-cyan-400 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      {/* Specs info */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-100">{prod.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{prod.description}</p>
                      </div>

                      {/* Display pricing */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-450 font-mono">ID: {prod.id}</span>
                        <span className="text-base font-extrabold text-cyan-400">${prod.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Modification trigger Buttons */}
                    <div className="pt-3 border-t border-slate-850/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">★ {prod.rating || 4.5} Score</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setForm({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              category: prod.category,
                              description: prod.description,
                              image: prod.image,
                              rating: prod.rating || 4.5,
                              isFeatured: prod.isFeatured || false,
                              specificationsText: (prod.specifications || []).join('\n')
                            });
                            setIsProductModalOpen(true);
                          }}
                          className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-cyan-400 rounded transition cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(prod.id, prod.name)}
                          className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-400 rounded transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 3: ORDER DISPATCH MANAGEMENT */}
        {/* ======================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Consolidated Orders Console</h3>
                <p className="text-xs text-slate-400">Manage order billing details and update delivery dispatch states.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, email..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <select 
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-transparent focus:outline-none text-slate-200 text-xs font-semibold"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                    <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                    <option value="Processing" className="bg-slate-900 text-white">Processing</option>
                    <option value="Shipped" className="bg-slate-900 text-white">Shipped</option>
                    <option value="Delivered" className="bg-slate-900 text-white">Delivered</option>
                    <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingOrders ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-400">Fetching order books database...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400 bg-slate-900 border border-slate-850 rounded-2xl">
                No orders match your active search terms or status filter parameters.
              </p>
            ) : (
              <div className="space-y-4 text-left">
                {filteredOrders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition duration-300"
                  >
                    {/* Header Strip of custom Order Management */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-850/40">
                            {ord.orderId || 'GW-ORD-GEN'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-650" />
                            <span>Submitted: {ord.orderDate || 'Today'}</span>
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          {ord.customerName} <span className="text-[10px] text-slate-400 font-normal">({ord.email})</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Order Value</span>
                          <span className="text-base font-extrabold text-cyan-400">${(ord.totalAmount || 0).toLocaleString()}</span>
                        </div>

                        {/* Status updating Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status:</span>
                          <select
                            value={ord.status || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-transparent focus:outline-none text-cyan-400 font-bold hover:text-white transition"
                          >
                            <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                            <option value="Processing" className="bg-slate-900 text-white">Processing</option>
                            <option value="Shipped" className="bg-slate-900 text-white">Shipped</option>
                            <option value="Delivered" className="bg-slate-900 text-white">Delivered</option>
                            <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Middle grid product list items */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Consolidated Items</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {Array.isArray(ord.items) && ord.items.map((item: any, i: number) => (
                          <div key={i} className="bg-slate-950/50 border border-slate-850/60 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-350">{item.productName}</span>
                            <div className="flex items-center gap-6 text-slate-450">
                              <span>Quantity: <strong className="text-slate-100">{item.quantity}</strong></span>
                              <span className="font-bold text-cyan-400">${((item.productPrice || 0) * (item.quantity ?? 1)).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & details options of the customer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-850/60 text-[11px] text-slate-400">
                      <div>
                        <span className="font-bold text-slate-100 block uppercase tracking-wide text-[9px] mb-0.5">Shipping Location</span>
                        <p className="flex items-center gap-1.5 leading-tight">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="line-clamp-1">{ord.address}</span>
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-100 block uppercase tracking-wide text-[9px] mb-0.5">Hotline Contact</span>
                        <p className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{ord.phone}</span>
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-100 block uppercase tracking-wide text-[9px] mb-0.5">Billing Terms</span>
                        <p className="font-semibold text-cyan-400 font-mono leading-none">{ord.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 4: CUSTOMERS PROFILE LIST SHEET */}
        {/* ======================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Registered Users Profile Directory</h3>
                <p className="text-xs text-slate-400">Total {customers.length} platform users discovered securely inside Auth list.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customer sheets..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-64"
                />
              </div>
            </div>

            {loadingCustomers ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-400">Querying registered user directories...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-450 bg-slate-900 border border-slate-850 rounded-2xl">
                No user profiles match search queries.
              </p>
            ) : (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 uppercase text-[9px] tracking-widest text-slate-400 border-b border-slate-850">
                      <tr>
                        <th className="py-3 px-6">Avatar</th>
                        <th className="py-3 px-6">Full Name</th>
                        <th className="py-3 px-6">Email Address</th>
                        <th className="py-3 px-6">Hotline Phone</th>
                        <th className="py-3 px-6">Privilege Role</th>
                        <th className="py-3 px-6 text-right">Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {filteredCustomers.map((cust) => {
                        const isMainAdmin = cust.email === 'rahatboss015@gmail.com' || cust.role === 'admin';
                        const custName = cust.fullName || cust.name || 'Anonymous User';
                        
                        // Count user orders
                        const userOrdersCount = orders.filter(o => o.email?.toLowerCase() === cust.email?.toLowerCase()).length;

                        return (
                          <tr 
                            key={cust.id} 
                            onClick={() => setSelectedCustomer(cust)}
                            className="hover:bg-slate-850/30 transition cursor-pointer"
                            title="Click to view Customer profile sheet"
                          >
                            <td className="py-3 px-6">
                              <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-cyan-400 uppercase select-none">
                                {custName.charAt(0)}
                              </div>
                            </td>
                            <td className="py-3 px-6 font-bold text-slate-100">{custName}</td>
                            <td className="py-3 px-6 font-mono text-slate-405">{cust.email}</td>
                            <td className="py-3 px-6 font-mono text-xs">{cust.phoneNumber || '+1 (555) 012-3456'}</td>
                            <td className="py-3 px-6">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                                isMainAdmin 
                                  ? 'bg-rose-950/40 border border-rose-900/60 text-rose-400' 
                                  : 'bg-cyan-950/40 border border-cyan-900/20 text-cyan-400'
                              }`}>
                                {cust.role || 'customer'}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right font-extrabold text-cyan-450 font-mono text-sm">
                              {userOrdersCount} orders
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 5: SECURITY & GENERAL SETTINGS */}
        {/* ======================================= */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 sm:p-10 space-y-8 animate-in fade-in max-w-2xl text-left mx-auto">
            <div className="border-b border-slate-850 pb-4 space-y-1">
              <h3 className="text-xl font-serif text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>System Security & Configurations</span>
              </h3>
              <p className="text-xs text-slate-400">Modify global metrics configuration sheets and check developer parameters.</p>
            </div>

            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Store Registry Name</label>
                  <input 
                    type="text" 
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Free Shipping Limit USD ($)</label>
                  <input 
                    type="number" 
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Global Announcement Header</label>
                <textarea 
                  rows={2}
                  value={storeSettings.announcement}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, announcement: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 leading-normal"
                />
              </div>

              {/* Status banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                  <span>🔐</span>
                  <span>Database Hardened Security Check</span>
                </div>
                <p className="text-slate-450 leading-relaxed text-[11px]">
                  Role-Based Access is locked. Any operations to modify `/products` or execute complete list queries on `/orders` will be synchronously rejected by our Zero-Trust Firestore Security block unless logged in with verified role permission.
                </p>
              </div>

              <button
                onClick={() => showToast("Store settings saved successfully on client state simulation!")}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest text-[11px] rounded transition cursor-pointer"
              >
                Save System Configs
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* CUSTOMER PROFILE DRAWER / MODAL DETAIL */}
        {/* ======================================= */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 text-left text-xs">
            <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95">
              
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950 border border-slate-800 rounded hover:text-white transition cursor-pointer text-slate-450"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-850 pb-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xl font-bold font-serif text-cyan-400 uppercase select-none">
                  {(selectedCustomer.fullName || selectedCustomer.name || 'Anonymous').charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">{selectedCustomer.fullName || selectedCustomer.name || 'Anonymous Profile'}</h4>
                  <p className="text-slate-400 text-xs font-mono">{selectedCustomer.email}</p>
                </div>
              </div>

              {/* Profile specifications fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850/60">
                  <span className="text-slate-500 font-bold block mb-1">Phone Hotline</span>
                  <span className="text-slate-200 font-mono">{selectedCustomer.phoneNumber || 'Not Specified'}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850/60">
                  <span className="text-slate-500 font-bold block mb-1">Registry Role</span>
                  <span className="text-cyan-400 font-bold uppercase font-mono tracking-wide">{selectedCustomer.role || 'customer'}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850/60">
                  <span className="text-slate-500 font-bold block mb-1">Registered Since</span>
                  <span className="text-slate-200 font-mono">
                    {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>

              {/* Customer specific Order Log Nested Subtable */}
              <div className="space-y-3">
                <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Historic Orders placed by this member</h5>
                
                {orders.filter(o => o.email?.toLowerCase() === selectedCustomer.email?.toLowerCase()).length === 0 ? (
                  <p className="py-6 text-center text-slate-450 italic bg-slate-950/40 rounded border border-slate-850/40">
                    No orders placed under email {selectedCustomer.email} yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {orders
                      .filter(o => o.email?.toLowerCase() === selectedCustomer.email?.toLowerCase())
                      .map((ord) => (
                        <div key={ord.id} className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-cyan-455 font-bold">{ord.orderId}</span>
                            <span className="text-slate-400">{ord.orderDate || 'Today'}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-350 leading-snug">
                              {Array.isArray(ord.items) ? ord.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ') : 'Accessories'}
                            </span>
                            <span className="font-bold text-cyan-400 text-xs shrink-0">${(ord.totalAmount || 0).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Phone: {ord.phone}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] uppercase font-bold text-cyan-400">
                              {ord.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-end">
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Close Sheet
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* ADD / EDIT PRODUCT MODAL OVERLAY */}
        {/* ======================================= */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 text-left text-xs">
            <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 space-y-5">
              
              <button 
                onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                className="absolute top-4 right-4 p-2 bg-slate-950 border border-slate-800 rounded hover:text-white transition cursor-pointer text-slate-450"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-850 pb-3">
                <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  <span>{editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Gadget to Catalog'}</span>
                </h4>
                <p className="text-slate-400 text-[11px]">Specify naming, pricing, image, categories, and technical parameters.</p>
              </div>

              <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Smart Product Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DualSense Edge Controller"
                    value={productForm.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">Device Catalog Category*</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="Smartphones">Smartphones</option>
                      <option value="Smart Watches">Smart Watches</option>
                      <option value="Earbuds">Earbuds</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Gaming Gadgets">Gaming Gadgets</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">Price in USD ($)*</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 199"
                      value={productForm.price || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Brief Catalog Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe main product capabilities..."
                    value={productForm.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 leading-normal"
                  />
                </div>

                {/* Image upload and url box */}
                <div className="space-y-2 bg-slate-950/65 p-3 rounded-xl border border-slate-850">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-bold block">E-commerce Product Photo</label>
                    <span className="text-[10px] text-cyan-450 font-bold">Image URL or Local Upload</span>
                  </div>
                  
                  {/* Option A: URL Input */}
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/your-gadget-photo"
                    value={productForm.image}
                    onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 outline-none p-2 rounded focus:ring-1 focus:ring-cyan-500 font-mono text-[10px]"
                  />

                  {/* Option B: Local File Picker */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative inline-flex items-center justify-center p-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg cursor-pointer text-[10px] uppercase font-bold transition w-full">
                      <Upload className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                      <span>Upload Local Photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFormImageFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>

                    {productForm.image && (
                      <div className="w-12 h-8 rounded border border-slate-800 bg-slate-900 overflow-hidden shrink-0">
                        <img src={productForm.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Featured Checkbox & Technical Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-850">
                    <input 
                      type="checkbox" 
                      id="form-is-featured"
                      checked={productForm.isFeatured}
                      onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 accent-cyan-500 rounded border-slate-800 cursor-pointer"
                    />
                    <label htmlFor="form-is-featured" className="text-slate-350 cursor-pointer font-bold select-none">
                      Promote to Best Sellers!
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">Rating Score (1.0 to 5.0)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={5} 
                      step={0.1}
                      value={productForm.rating}
                      onChange={(e) => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-cyan-500 font-bold font-mono text-cyan-400"
                    />
                  </div>
                </div>

                {/* Tech specifications text block */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Device Specifications (One per line)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 10.1 inch Screen&#10;Water resistance IP68&#10;Up to 24 hours of video playback"
                    value={productForm.specificationsText}
                    onChange={(e) => setForm(prev => ({ ...prev, specificationsText: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 outline-none p-3 rounded-lg focus:ring-1 focus:ring-cyan-500 text-xs font-mono"
                  />
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-white font-bold uppercase rounded-lg cursor-pointer transition border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold uppercase rounded-lg cursor-pointer transition shadow-xl font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
