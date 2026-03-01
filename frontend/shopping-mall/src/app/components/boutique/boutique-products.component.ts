import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-boutique-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>My Products</h1>

      <div *ngIf="isSeller" class="add-form">
        <h3>Add Product</h3>
        <form (submit)="create($event)">
          <input
            type="text"
            placeholder="Name"
            [(ngModel)]="newProduct.name"
            name="name"
            required
          />
          <input
            type="number"
            placeholder="Price"
            [(ngModel)]="newProduct.price"
            name="price"
            required
          />
          <input
            type="number"
            placeholder="Stock"
            [(ngModel)]="newProduct.stock"
            name="stock"
            required
          />
          <input
            type="text"
            placeholder="Category"
            [(ngModel)]="newProduct.category"
            name="category"
          />
          <input type="text" placeholder="Image URL" [(ngModel)]="newProduct.image" name="image" />
          <textarea
            placeholder="Description"
            [(ngModel)]="newProduct.description"
            name="description"
          ></textarea>
          <button type="submit">Create</button>
        </form>
      </div>

      <div *ngIf="loading">Loading products...</div>
      <div *ngIf="error" class="alert">{{ error }}</div>

      <div *ngIf="!loading && products.length === 0">No products found.</div>

      <ul *ngIf="!loading && products.length > 0" class="prod-list">
        <li *ngFor="let p of products" class="prod-item">
          <img [src]="p.image || '/assets/placeholder.png'" alt="{{ p.name }}" />
          <div class="meta">
            <div class="name">{{ p.name }}</div>
            <div class="price">\${{ p.price }} • Stock: {{ p.stock }}</div>
          </div>
          <div class="actions">
            <button (click)="edit(p.id)">Edit</button>
            <button (click)="delete(p.id)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 2rem;
      }
      .prod-list {
        list-style: none;
        padding: 0;
      }
      .prod-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }
      .prod-item img {
        width: 64px;
        height: 64px;
        object-fit: cover;
      }
      .meta {
        flex: 1;
      }
      .actions button {
        margin-left: 0.5rem;
      }
    `,
  ],
})
export class BoutiqueProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  isSeller = false;

  newProduct: Partial<Product> = {
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: '',
    image: '',
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const shopId = this.authService.currentUserValue?.id;
    if (!shopId) {
      this.error = 'Shop not available.';
      this.loading = false;
      return;
    }

    this.isSeller = this.authService.hasRole(['boutique']);

    this.loadProducts(shopId);
  }

  loadProducts(shopId: string): void {
    this.loading = true;
    this.productService.getProductsByShop(shopId).subscribe({
      next: (prods) => {
        this.products = prods;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
      },
    });
  }

  create(e: Event): void {
    e.preventDefault();
    if (!this.isSeller) {
      alert('Only sellers can create products.');
      return;
    }

    const shopId = this.authService.currentUserValue?.id;
    const payload = {
      name: this.newProduct.name || 'New product',
      price: this.newProduct.price || 0,
      stock: this.newProduct.stock || 0,
      description: this.newProduct.description,
      image: this.newProduct.image,
      category: this.newProduct.category,
    };

    this.productService.createProduct(payload as any).subscribe({
      next: (prod) => {
        prod.shop = prod.shop || {
          id: shopId,
          name: this.authService.currentUserValue?.name || '',
          email: this.authService.currentUserValue?.email || '',
        };
        this.products.unshift(prod);
        this.newProduct = {
          name: '',
          price: 0,
          stock: 0,
          description: '',
          category: '',
          image: '',
        };
      },
      error: () => {
        const localId = 'p-local-' + Date.now();
        const localProd: Product = {
          id: localId,
          name: payload.name,
          price: payload.price,
          stock: payload.stock,
          description: payload.description,
          image: payload.image,
          category: payload.category,
          shop: {
            id: shopId,
            name: this.authService.currentUserValue?.name || '',
            email: this.authService.currentUserValue?.email || '',
          },
        };
        this.products.unshift(localProd);
        this.newProduct = {
          name: '',
          price: 0,
          stock: 0,
          description: '',
          category: '',
          image: '',
        };
        alert('Product created locally (backend unavailable).');
      },
    });
  }

  edit(id?: string): void {
    alert('Edit not implemented yet.');
  }

  delete(id?: string): void {
    if (!id) return;
    if (!confirm('Delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
      },
      error: () => alert('Failed to delete product.'),
    });
  }
}
