import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { getEntityId } from '../../utils/id.util';

@Component({
  selector: 'app-boutique-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header-row">
        <h1>Mes produits</h1>
        <button *ngIf="isSeller" class="btn-vendre" (click)="openCreateModal()">Vendre</button>
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
            <button (click)="edit(getProductId(p))">Edit</button>
            <button (click)="delete(getProductId(p))">Delete</button>
          </div>
        </li>
      </ul>

      <!-- Create product modal -->
      <div class="modal-overlay" *ngIf="showCreateModal">
        <div class="modal">
          <h2>Vendre un produit</h2>
          <form (submit)="createProduct($event)">
            <div class="field">
              <label>Nom</label>
              <input type="text" [(ngModel)]="newProduct.name" name="name" required />
            </div>

            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="newProduct.description" name="description"></textarea>
            </div>

            <div class="split-row">
              <div class="field">
                <label>Prix</label>
                <input type="number" [(ngModel)]="newProduct.price" name="price" required />
              </div>
              <div class="field">
                <label>Stock</label>
                <input type="number" [(ngModel)]="newProduct.stock" name="stock" required />
              </div>
            </div>

            <div class="field">
              <label>Catégorie</label>
              <input type="text" [(ngModel)]="newProduct.category" name="category" />
            </div>

            <div class="field">
              <label>Image</label>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" />
              <div *ngIf="previewImage" class="preview">
                <img [src]="previewImage" alt="preview" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn-primary">Vendre</button>
              <button type="button" class="btn-ghost" (click)="closeCreateModal()">Annuler</button>
            </div>
          </form>
        </div>
      </div>
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

  showCreateModal = false;
  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const shopId = getEntityId(this.authService.currentUserValue);

    if (!shopId) {
      this.error = 'Shop not available.';
      this.loading = false;
      return;
    }

    this.isSeller = this.authService.hasRole(['boutique']);

    this.loadProducts(shopId);
  }

  getProductId(product: Product): string {
    return getEntityId(product);
  }

  loadProducts(shopId: string): void {
    this.loading = true;
    this.productService.getProductsByShop(shopId).subscribe({
      next: (prods) => {
        this.products = prods;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products.' + (err?.status ? ` (status ${err.status})` : '');
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedFile = null;
    this.previewImage = null;
    this.newProduct = { name: '', price: 0, stock: 0, description: '', category: '', image: '' };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  createProduct(e: Event): void {
    e.preventDefault();
    if (!this.isSeller) {
      alert('Only sellers can create products.');
      return;
    }

    const shopId = getEntityId(this.authService.currentUserValue);
    if (!shopId) {
      alert("Votre compte vendeur n'est pas identifié. Veuillez vous reconnecter.");
      return;
    }

    // If a file was selected, send multipart FormData (image upload)
    let requestPayload: any;
    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('name', this.newProduct.name || 'New product');
      fd.append('price', String(this.newProduct.price || 0));
      fd.append('stock', String(this.newProduct.stock || 0));
      if (this.newProduct.description) fd.append('description', this.newProduct.description);
      if (this.newProduct.category) fd.append('category', this.newProduct.category);
      fd.append('shop', shopId);
      fd.append('image', this.selectedFile, this.selectedFile.name);
      requestPayload = fd;
    } else {
      // No file: send JSON body (server may still accept this)
      requestPayload = {
        name: this.newProduct.name || 'New product',
        price: this.newProduct.price || 0,
        stock: this.newProduct.stock || 0,
        description: this.newProduct.description,
        category: this.newProduct.category,
        // If there's a preview (base64), include it as 'image' — only if server supports it
        image: this.previewImage || undefined,
      };
    }

    // Send to backend and rely on server for persistence. On error, show helpful message.
    this.productService.createProduct(requestPayload).subscribe({
      next: (prod) => {
        this.closeCreateModal();
        this.loadProducts(shopId);
      },
      error: (err) => {
        let msg = 'Impossible de créer le produit sur le serveur.';
        if (err?.status === 401) msg += ' Erreur 401 — non autorisé. Vérifiez la connexion.';
        if (err?.status === 400) msg += ' Erreur 400 — requête invalide. Vérifiez les champs.';
        if (err?.status === 500)
          msg += ' Erreur 500 — erreur côté serveur. Consultez les logs backend.';
        alert(msg + ' Voir la console pour plus de détails.');
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
        this.products = this.products.filter((p) => getEntityId(p) !== id);
      },
      error: () => alert('Failed to delete product.'),
    });
  }
}
