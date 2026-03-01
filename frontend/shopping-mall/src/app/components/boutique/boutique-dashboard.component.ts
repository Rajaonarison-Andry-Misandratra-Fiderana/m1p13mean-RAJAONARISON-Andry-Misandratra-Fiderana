import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { getEntityId } from '../../utils/id.util';

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
    const shopId = getEntityId(user);
    if (!shopId) {
      this.error = 'Shop information not available.';
      this.loading = false;
      return;
    }

    this.loading = true;

    forkJoin({
      products: this.productService.getProductsByShop(shopId),
      orders: this.orderService.getShopOrders(),
    }).subscribe({
      next: ({ products, orders }) => {
        this.productsCount = products.length;
        this.ordersCount = orders.length;
        this.totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.';
          return;
        }
        this.error = 'Impossible de charger les données boutique.';
      },
    });
  }
}
