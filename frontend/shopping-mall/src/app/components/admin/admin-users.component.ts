import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, merge, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { getEntityId } from '../../utils/id.util';

type Role = 'admin' | 'boutique' | 'acheteur';

type UserRow = {
  user: User;
  id: string;
  createdAt: Date | null;
  roleDraft: Role;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="users-page">
      <header class="page-head">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>Liste complète des comptes, rôles et informations d'inscription.</p>
        </div>

        <button type="button" class="btn-refresh" (click)="loadUsers()" [disabled]="loading">
          Actualiser
        </button>
      </header>

      <div class="stats-grid" *ngIf="!loading && !error">
        <article class="stat-card">
          <p class="label">Total utilisateurs</p>
          <p class="value">{{ rows.length }}</p>
        </article>
        <article class="stat-card">
          <p class="label">Admins</p>
          <p class="value">{{ countByRole('admin') }}</p>
        </article>
        <article class="stat-card">
          <p class="label">Boutiques</p>
          <p class="value">{{ countByRole('boutique') }}</p>
        </article>
        <article class="stat-card">
          <p class="label">Acheteurs</p>
          <p class="value">{{ countByRole('acheteur') }}</p>
        </article>
      </div>

      <div class="toolbar" *ngIf="!loading && !error">
        <input
          class="search-input"
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="applyFilters()"
          placeholder="Rechercher par nom/email..."
        />

        <select class="role-filter" [(ngModel)]="roleFilter" (ngModelChange)="applyFilters()">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="boutique">Boutique</option>
          <option value="acheteur">Acheteur</option>
        </select>
      </div>

      <div *ngIf="loading" class="panel">Chargement des utilisateurs...</div>
      <div *ngIf="error" class="panel error">{{ error }}</div>

      <div class="table-wrap" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Date d'inscription</th>
              <th>Dernière mise à jour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of filteredRows">
              <td>{{ row.user.name || '-' }}</td>
              <td>{{ row.user.email || '-' }}</td>
              <td>
                <select
                  class="role-select"
                  [(ngModel)]="row.roleDraft"
                  [disabled]="isCurrentUser(row)"
                >
                  <option value="admin">Admin</option>
                  <option value="boutique">Boutique</option>
                  <option value="acheteur">Acheteur</option>
                </select>
              </td>
              <td>{{ row.createdAt ? (row.createdAt | date: 'dd/MM/yyyy HH:mm') : 'Indisponible' }}</td>
              <td>{{ row.user.updatedAt ? (row.user.updatedAt | date: 'dd/MM/yyyy HH:mm') : '-' }}</td>
              <td>
                <div class="actions">
                  <button
                    type="button"
                    class="btn-save"
                    (click)="saveRole(row)"
                    [disabled]="isCurrentUser(row) || row.user.role === row.roleDraft || savingIds.has(row.id)"
                  >
                    Enregistrer
                  </button>

                  <button
                    type="button"
                    class="btn-delete"
                    (click)="deleteUser(row)"
                    [disabled]="isCurrentUser(row) || savingIds.has(row.id)"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="filteredRows.length === 0">
              <td colspan="6" class="empty">Aucun utilisateur trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .users-page {
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
        grid-template-columns: repeat(4, minmax(0, 1fr));
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
      .toolbar {
        margin: 0.9rem 0;
        display: grid;
        grid-template-columns: 1fr 220px;
        gap: 0.7rem;
      }
      .search-input,
      .role-filter,
      .role-select {
        border: 1px solid #c9dced;
        border-radius: 10px;
        padding: 0.55rem 0.65rem;
        font: inherit;
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
        border: 1px solid #d5e4f1;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 10px 24px rgba(8, 39, 67, 0.06);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 920px;
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
      .btn-save,
      .btn-delete {
        border-radius: 8px;
        border: 0;
        padding: 0.45rem 0.6rem;
        cursor: pointer;
        font-weight: 700;
      }
      .btn-save {
        background: #e8f5ff;
        color: #0d4f84;
      }
      .btn-delete {
        background: #fdecec;
        color: #992f2f;
      }
      .empty {
        text-align: center;
        color: #5d768f;
        padding: 1rem;
      }
      @media (max-width: 980px) {
        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .toolbar {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 580px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  rows: UserRow[] = [];
  filteredRows: UserRow[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  roleFilter: '' | Role = '';
  savingIds = new Set<string>();

  private currentUserId = '';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserId = getEntityId(this.authService.currentUserValue);
    this.loadUsers();

    merge(this.authService.usersRefresh$, timer(15000, 15000))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers(false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(showLoader = true): void {
    if (showLoader) this.loading = true;
    this.error = '';

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.rows = users
          .map((user) => {
            const id = getEntityId(user);
            return {
              user,
              id,
              createdAt: this.resolveCreatedAt(user),
              roleDraft: user.role,
            } as UserRow;
          })
          .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les utilisateurs.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const search = this.normalize(this.searchQuery);

    this.filteredRows = this.rows.filter((row) => {
      const byRole = !this.roleFilter || row.user.role === this.roleFilter;
      if (!byRole) return false;

      if (!search) return true;

      const haystack = this.normalize(`${row.user.name || ''} ${row.user.email || ''} ${row.user.role}`);
      return haystack.includes(search);
    });
  }

  saveRole(row: UserRow): void {
    if (!row.id || row.user.role === row.roleDraft || this.isCurrentUser(row)) return;

    this.savingIds.add(row.id);
    this.authService.updateUser(row.id, { role: row.roleDraft }).subscribe({
      next: (updated) => {
        row.user = updated;
        row.roleDraft = updated.role;
        this.savingIds.delete(row.id);
        this.loadUsers(false);
      },
      error: (err) => {
        this.savingIds.delete(row.id);
        this.error = err?.error?.message || 'Échec de la mise à jour du rôle.';
      },
    });
  }

  deleteUser(row: UserRow): void {
    if (!row.id || this.isCurrentUser(row)) return;
    if (!confirm(`Supprimer l'utilisateur ${row.user.email} ?`)) return;

    this.savingIds.add(row.id);
    this.authService.deleteUser(row.id).subscribe({
      next: () => {
        this.savingIds.delete(row.id);
        this.loadUsers(false);
      },
      error: (err) => {
        this.savingIds.delete(row.id);
        this.error = err?.error?.message || 'Échec de suppression utilisateur.';
      },
    });
  }

  isCurrentUser(row: UserRow): boolean {
    return !!row.id && row.id === this.currentUserId;
  }

  countByRole(role: Role): number {
    return this.rows.filter((row) => row.user.role === role).length;
  }

  private resolveCreatedAt(user: User): Date | null {
    if (user.createdAt) {
      const fromField = new Date(user.createdAt);
      if (!Number.isNaN(fromField.getTime())) return fromField;
    }

    const id = getEntityId(user);
    if (!id || id.length < 8) return null;

    const tsHex = id.substring(0, 8);
    const ts = Number.parseInt(tsHex, 16);
    if (Number.isNaN(ts)) return null;
    return new Date(ts * 1000);
  }

  private normalize(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
