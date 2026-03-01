import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { getEntityId } from '../../utils/id.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.productService.getProducts({ maxPrice: 50 }).subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 6);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load featured products';
        this.loading = false;
      }
    });
  }

  getProductId(product: Product): string {
    return getEntityId(product);
  }
}
