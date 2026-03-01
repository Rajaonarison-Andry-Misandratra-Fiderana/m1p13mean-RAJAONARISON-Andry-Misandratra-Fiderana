import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Product Detail</h1>
      <p>Product ID: {{ productId }}</p>
      <button routerLink="/products">Back to Products</button>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
  }
}
