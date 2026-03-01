import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, merge, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { SellerModerationService } from '../../services/seller-moderation.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { getEntityId } from '../../utils/id.util';

type SellerRow = {
  user: User;
  id: string;
  createdAt: Date;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sellers-page">
      <header class="page-head">
        <div>
          <h1>Gestion des vendeurs</h1>
          <p>Utilisateurs avec rôle vendeur, bannissement et historique de publication.</p>
        </div>
        <button type="button" class="btn-refresh" (click)="loadSellers(true)" [disabled]="loading">
          Actualiser
        </button>
      </header>

      <div *ngIf="error" class="panel error">{{ error }}</div>

      <div class="stats-grid" *ngIf="!loading && !error">
        <article class="stat-card">
          <p class="label">Vendeurs actifs</p>
          <p class="value">{{ sellers.length }}</p>
        </article>
        <article class="stat-card">
          <p class="label">Vendeurs bannis (session)</p>
          <p class="value">{{ bannedSellers.length }}</p>
        </article>
      </div>

      <div *ngIf="loading" class="panel">Chargement des vendeurs...</div>

      <div class="table-wrap" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of sellers">
              <td>{{ row.user.name || '-' }}</td>
              <td>{{ row.user.email }}</td>
              <td>{{ row.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="actions">
                  <button
                    type="button"
                    class="btn-history"
                    (click)="viewHistory(row)"
                    [disabled]="loadingHistory && selectedSellerId === row.id"
                  >
                    Historique publications
                  </button>

                  <button
                    type="button"
                    class="btn-ban"
                    (click)="banSeller(row)"
                    [disabled]="savingIds.has(row.id)"
                  >
                    Ban
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="sellers.length === 0">
              <td colspan="4" class="empty">Aucun vendeur actif.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="panel history" *ngIf="selectedSeller">
        <div class="history-head">
          <h2>Historique de publication: {{ selectedSeller.name || selectedSeller.email }}</h2>
          <button type="button" class="btn-close" (click)="closeHistory()">Fermer</button>
        </div>

        <div *ngIf="loadingHistory" class="history-loading">Chargement des publications...</div>

        <div class="table-wrap" *ngIf="!loadingHistory">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Date publication</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of selectedSellerProducts">
                <td>{{ product.name }}</td>
                <td>{{ product.category || '-' }}</td>
                <td>{{ product.price | number: '1.0-0' }} MGA</td>
                <td>{{ product.stock }}</td>
                <td>{{ resolveProductDate(product) | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ product.isActive === false ? 'Inactif' : 'Actif' }}</td>
              </tr>

              <tr *ngIf="selectedSellerProducts.length === 0">
                <td colspan="6" class="empty">Aucune publication trouvée.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel history" *ngIf="bannedSellers.length > 0">
        <div class="history-head">
          <h2>Vendeurs bannis</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of bannedSellers">
                <td>{{ row.user.name || '-' }}</td>
                <td>{{ row.user.email }}</td>
                <td>
                  <button
                    type="button"
                    class="btn-history"
                    (click)="unbanSeller(row)"
                    [disabled]="savingIds.has(row.id)"
                  >
                    Débannir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .sellers-page {
        max-width: 1240px;
        margin: 1.4rem auto;
        padding: 0 1rem;
      }
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.8rem;
      }
      .page-head h1 {
        margin: 0;
        color: #10243a;
      }
      .page-head p {
        margin: 0.25rem 0 0;
        color: #4f6b84;
      }
      .btn-refresh {
        border: 0;
        border-radius: 10px;
        padding: 0.6rem 0.9rem;
        background: linear-gradient(120deg, #0f5e9c, #0d86b8);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }
      .stats-grid {
        margin-top: 0.9rem;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.7rem;
      }
      .stat-card {
        border: 1px solid #d5e4f1;
        border-radius: 12px;
        background: #fff;
        padding: 0.75rem 0.85rem;
      }
      .label {
        margin: 0;
        color: #5b748d;
        font-size: 0.82rem;
        font-weight: 700;
      }
      .value {
        margin: 0.15rem 0 0;
        color: #0f2c47;
        font-size: 1.3rem;
        font-weight: 800;
      }
      .panel {
        margin-top: 0.9rem;
        border: 1px solid #d5e4f1;
        border-radius: 12px;
        background: #fff;
        padding: 0.85rem 0.95rem;
      }
      .panel.error {
        border-color: #efc9c9;
        background: #fdecec;
        color: #932d2d;
      }
      .table-wrap {
        margin-top: 0.9rem;
        border: 1px solid #d5e4f1;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 10px 24px rgba(8, 39, 67, 0.06);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 760px;
      }
      th,
      td {
        text-align: left;
        padding: 0.72rem 0.58rem;
        border-bottom: 1px solid #e8f1f8;
      }
      th {
        color: #59728a;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      td {
        color: #183852;
        font-weight: 600;
      }
      .actions {
        display: inline-flex;
        gap: 0.45rem;
      }
      .btn-history,
      .btn-ban,
      .btn-close {
        border-radius: 8px;
        border: 0;
        padding: 0.45rem 0.62rem;
        cursor: pointer;
        font-weight: 700;
      }
      .btn-history {
        background: #e8f5ff;
        color: #0d4f84;
      }
      .btn-ban {
        background: #fdecec;
        color: #992f2f;
      }
      .history {
        margin-top: 1rem;
      }
      .history-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.6rem;
      }
      .history-head h2 {
        margin: 0;
        color: #10243a;
        font-size: 1.05rem;
      }
      .btn-close {
        background: #eef4fb;
        color: #294b6d;
      }
      .history-loading {
        margin-top: 0.6rem;
        color: #5d768f;
        font-weight: 600;
      }
      .empty {
        text-align: center;
        color: #5d768f;
        padding: 1rem;
      }
      @media (max-width: 760px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  sellers: SellerRow[] = [];
  bannedSellers: SellerRow[] = [];
  loading = true;
  error = '';

  selectedSeller: User | null = null;
  selectedSellerId = '';
  selectedSellerProducts: Product[] = [];
  loadingHistory = false;

  savingIds = new Set<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private sellerModerationService: SellerModerationService,
  ) {}

  ngOnInit(): void {
    this.loadSellers(true);

    merge(
      this.authService.usersRefresh$,
      this.productService.refresh$,
      this.sellerModerationService.refresh$,
      timer(15000, 15000),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadSellers(false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSellers(showLoader = true): void {
    if (showLoader) this.loading = true;
    this.error = '';

    this.authService.getAllUsers().subscribe({
      next: (usersResponse: unknown) => {
        const users = this.normalizeUsersResponse(usersResponse);
        const bannedIds = new Set(this.sellerModerationService.getBannedSellerIds());

        const sellerRows = users
          .filter((u) => u.role === 'boutique')
          .map((user) => ({
            user,
            id: getEntityId(user),
            createdAt: this.resolveUserDate(user),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        this.sellers = sellerRows.filter((row) => !bannedIds.has(row.id));
        this.bannedSellers = sellerRows.filter((row) => bannedIds.has(row.id));

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les vendeurs.';
        this.loading = false;
      },
    });
  }

  banSeller(row: SellerRow): void {
    if (!row.id) return;
    if (!confirm(`Bannir le vendeur ${row.user.email} ?`)) return;

    this.savingIds.add(row.id);
    this.authService.updateUser(row.id, { role: 'acheteur' }).subscribe({
      next: () => {
        this.sellerModerationService.banSeller(row.id);
        this.savingIds.delete(row.id);

        if (this.selectedSellerId === row.id) {
          this.closeHistory();
        }

        this.loadSellers(false);
      },
      error: (err) => {
        // Fallback local ban to keep moderation functional even if backend role update fails.
        this.sellerModerationService.banSeller(row.id);
        this.savingIds.delete(row.id);
        this.error = err?.error?.message || 'Vendeur banni localement (mise à jour backend indisponible).';
        this.loadSellers(false);
      },
    });
  }

  unbanSeller(row: SellerRow): void {
    if (!row.id) return;
    this.sellerModerationService.unbanSeller(row.id);
    this.loadSellers(false);
  }

  viewHistory(row: SellerRow): void {
    if (!row.id) return;

    this.selectedSeller = row.user;
    this.selectedSellerId = row.id;
    this.selectedSellerProducts = [];
    this.loadingHistory = true;

    this.productService.getProductsByShop(row.id).subscribe({
      next: (products) => {
        this.selectedSellerProducts = [...products].sort(
          (a, b) => this.resolveProductDate(b).getTime() - this.resolveProductDate(a).getTime(),
        );
        this.loadingHistory = false;
      },
      error: (err) => {
        this.loadingHistory = false;
        this.error = err?.error?.message || 'Impossible de charger l’historique de publication.';
      },
    });
  }

  closeHistory(): void {
    this.selectedSeller = null;
    this.selectedSellerId = '';
    this.selectedSellerProducts = [];
    this.loadingHistory = false;
  }

  resolveProductDate(product: Product): Date {
    if (product.createdAt) {
      const direct = new Date(product.createdAt);
      if (!Number.isNaN(direct.getTime())) return direct;
    }

    const id = getEntityId(product);
    if (!id || id.length < 8) return new Date(0);
    const ts = Number.parseInt(id.slice(0, 8), 16);
    if (Number.isNaN(ts)) return new Date(0);
    return new Date(ts * 1000);
  }

  private resolveUserDate(user: User): Date {
    if (user.createdAt) {
      const direct = new Date(user.createdAt);
      if (!Number.isNaN(direct.getTime())) return direct;
    }

    const id = getEntityId(user);
    if (!id || id.length < 8) return new Date(0);
    const ts = Number.parseInt(id.slice(0, 8), 16);
    if (Number.isNaN(ts)) return new Date(0);
    return new Date(ts * 1000);
  }

  private normalizeUsersResponse(value: unknown): User[] {
    if (Array.isArray(value)) return value as User[];
    const maybeObject = value as { users?: User[] };
    if (Array.isArray(maybeObject?.users)) return maybeObject.users;
    return [];
  }
}
