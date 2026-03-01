export interface Order {
  id?: string;
  orderNumber: string;
  buyer: string | Buyer;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  product: string | OrderProduct;
  quantity: number;
  price: number;
  shop?: string | OrderShop;
}

export interface OrderProduct {
  id?: string;
  name: string;
  price: number;
  image?: string;
}

export interface OrderShop {
  id?: string;
  name: string;
  email: string;
}

export interface Buyer {
  id?: string;
  name: string;
  email: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  items: {
    product: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: 'pending' | 'completed' | 'failed';
}
