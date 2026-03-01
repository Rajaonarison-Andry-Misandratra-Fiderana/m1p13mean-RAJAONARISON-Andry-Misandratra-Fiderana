import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
	selector: 'app-boutique-products',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class='container'>
			<h1>My Products</h1>

			<div *ngIf="loading">Loading products...</div>
			<div *ngIf="error" class="alert">{{ error }}</div>

			<div *ngIf="!loading && products.length === 0">No products found.</div>

			<ul *ngIf="!loading && products.length > 0" class="prod-list">
				<li *ngFor="let p of products" class="prod-item">
					<img [src]="p.image || '/assets/placeholder.png'" alt="{{p.name}}"/>
					<div class="meta">
						<div class="name">{{ p.name }}</div>
						<div class="price">${{ p.price }} • Stock: {{ p.stock }}</div>
					</div>
					<div class="actions">
						<button (click)="edit(p.id)">Edit</button>
						<button (click)="delete(p.id)">Delete</button>
					</div>
				</li>
			</ul>
		</div>
	`,
	styles: [`.container { padding:2rem } .prod-list{list-style:none;padding:0} .prod-item{display:flex;align-items:center;gap:1rem;padding:0.5rem 0;border-bottom:1px solid #eee} .prod-item img{width:64px;height:64px;object-fit:cover} .meta{flex:1} .actions button{margin-left:0.5rem}`]
})
export class BoutiqueProductsComponent implements OnInit {
	products: Product[] = [];
	loading = true;
	error: string | null = null;

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

		this.loadProducts(shopId);
	}

	loadProducts(shopId: string): void {
		this.loading = true;
		this.productService.getProductsByShop(shopId).subscribe({
			next: (prods) => { this.products = prods; this.loading = false; },
			error: () => { this.error = 'Failed to load products.'; this.loading = false; }
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
				this.products = this.products.filter(p => p.id !== id);
			},
			error: () => alert('Failed to delete product.')
		});
	}
}
