import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SellerModerationService {
  private readonly storageKey = 'shoppingMallBannedSellers';
  private readonly refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();

  getBannedSellerIds(): string[] {
    const raw = this.safeGet(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && !!id) : [];
    } catch {
      return [];
    }
  }

  isSellerBanned(sellerId: string): boolean {
    if (!sellerId) return false;
    return this.getBannedSellerIds().includes(sellerId);
  }

  banSeller(sellerId: string): void {
    if (!sellerId) return;
    const current = this.getBannedSellerIds();
    if (current.includes(sellerId)) return;
    const next = [...current, sellerId];
    this.persist(next);
  }

  unbanSeller(sellerId: string): void {
    if (!sellerId) return;
    const next = this.getBannedSellerIds().filter((id) => id !== sellerId);
    this.persist(next);
  }

  private persist(ids: string[]): void {
    this.safeSet(this.storageKey, JSON.stringify(ids));
    this.refreshSubject.next();
  }

  private safeGet(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }

  private safeSet(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  }
}
