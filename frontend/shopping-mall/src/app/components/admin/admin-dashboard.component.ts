import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRODUCTS, USERS, VISITS } from '../../mock/seed';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Admin Dashboard</h1>

      <div class="stats">
        <div class="stat">Visits total: {{ visits.total }}</div>
        <div class="stat">Visitors today: {{ visits.today }}</div>
        <div class="stat">Buyers: {{ buyersCount }}</div>
        <div class="stat">Sellers: {{ sellersCount }}</div>
        <div class="stat">Products: {{ products.length }}</div>
      </div>

      <h2>Products</h2>
      <ul>
        <li *ngFor="let p of products">
          {{ p.name }} — {{ p.price }} USD
          <button (click)="deleteProduct(p.id)">Delete</button>
        </li>
      </ul>

      <h2>Vendeurs</h2>
      <ul>
        <li *ngFor="let u of sellers">
          {{ u.name }} ({{ u.email }})
          <button (click)="deleteSeller(u.id)">Delete seller</button>
        </li>
      </ul>
    </div>
  `,
  styles: [
    '.container { padding: 2rem } .stats{display:flex;gap:1rem;margin-bottom:1rem} .stat{background:#f4f4f4;padding:0.5rem;border-radius:4px}',
  ],
})
export class AdminDashboardComponent implements OnInit {
  products = [...PRODUCTS];
  users = [...USERS];
  visits = VISITS;

  sellers = this.users.filter((u) => u.role === 'boutique');
  buyersCount = this.users.filter((u) => u.role === 'acheteur').length;
  sellersCount = this.sellers.length;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {}

  deleteProduct(id?: string): void {
    if (!id) return;
    if (!confirm('Delete product ' + id + '?')) return;
    // attempt backend delete, but also remove locally
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
      },
      error: () => {
        // backend may not be available during dev; still remove locally
        this.products = this.products.filter((p) => p.id !== id);
        alert('Product removed locally (backend delete failed).');
      },
    });
  }

  deleteSeller(id?: string): void {
    if (!id) return;
    if (!confirm('Delete seller ' + id + ' and their products?')) return;
    // remove seller locally
    this.users = this.users.filter((u) => u.id !== id);
    this.sellers = this.users.filter((u) => u.role === 'boutique');
    this.products = this.products.filter((p) => (p.shop as any)?.id !== id);
    this.sellersCount = this.sellers.length;
    this.buyersCount = this.users.filter((u) => u.role === 'acheteur').length;
    alert('Seller removed locally. Backend removal not implemented in frontend.');
  }
}
