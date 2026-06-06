export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rating: number;
  isFeatured: boolean;
  specifications: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  paymentMethod: 'Cash on Delivery' | 'Mobile Banking' | 'Card Payment';
  notes: string;
}

export interface ConfirmedOrder {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
  items: {
    productName: string;
    productPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  estimatedDelivery: string;
  notes?: string;
  orderDate: string;
}

export function formatBDT(amount: number): string {
  return `৳${Math.round(amount).toLocaleString()}`;
}

