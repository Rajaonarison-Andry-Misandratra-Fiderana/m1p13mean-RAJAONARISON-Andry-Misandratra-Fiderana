import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Shop Dashboard</h1>

      <div class="stats">
        <div class="stat">Products: {{ productsCount }}</div>
        <div class="stat">Orders: {{ ordersCount }}</div>
        <div class="stat">Total Sales: \${{ totalSales }}</div>
      </div>

      <div *ngIf="loading">Loading data...</div>
      <div *ngIf="error" class="alert">{{ error }}</div>
    </div>
  `,
  styles: [
    '.container { padding: 2rem; } .stats { display:flex; gap:1rem; margin-top:1rem } .stat { background:#f4f4f4; padding:1rem; border-radius:6px } .alert { color:#c0392b }',
  ],
})
export class BoutiqueDashboardComponent implements OnInit {
  productsCount = 0;
  ordersCount = 0;
  totalSales = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    const shopId = user?.id;
    if (!shopId) {
      this.error = 'Shop information not available.';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.productService.getProductsByShop(shopId).subscribe({
      next: (products) => {
        this.productsCount = products.length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products.';
        this.loading = false;
      },
    });

    this.orderService.getShopOrders().subscribe({
      next: (orders) => {
        this.ordersCount = orders.length;
        this.totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      },
      error: () => {
        /* ignore for now */
      },
    });
  }
}
