import { Product } from '../models/product.model';
import { User } from '../models/user.model';

// Fictive users
export const USERS: User[] = [
  {
    id: 'u-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: 'u-boutique-1',
    name: 'Seller One',
    email: 'seller@example.com',
    role: 'boutique',
  },
  {
    id: 'u-buyer-1',
    name: 'Buyer One',
    email: 'buyer@example.com',
    role: 'acheteur',
  },
];

// Fictive products owned by seller u-boutique-1
export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Vintage Lamp',
    price: 49.99,
    stock: 10,
    description: 'A charming vintage lamp to brighten your room.',
    category: 'Home',
    shop: { id: 'u-boutique-1', name: 'Seller One', email: 'seller@example.com' },
  },
  {
    id: 'p-2',
    name: 'Leather Wallet',
    price: 29.5,
    stock: 25,
    description: 'Handcrafted leather wallet.',
    category: 'Accessories',
    shop: { id: 'u-boutique-1', name: 'Seller One', email: 'seller@example.com' },
  },
  {
    id: 'p-3',
    name: 'Ceramic Mug',
    price: 12.0,
    stock: 40,
    description: 'Stylish ceramic mug for your coffee.',
    category: 'Kitchen',
    shop: { id: 'u-boutique-1', name: 'Seller One', email: 'seller@example.com' },
  },
];

// Simple visit counter (fictive)
export const VISITS = {
  total: 1245,
  today: 45,
};
