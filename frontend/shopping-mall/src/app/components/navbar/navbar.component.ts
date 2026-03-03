import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuOpen = false;
  isUserMenuOpen = false;
  cartCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) this.isUserMenuOpen = false;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenus(): void {
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenus();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isBoutique(): boolean {
    return this.currentUser?.role === 'boutique';
  }

  isAcheteur(): boolean {
    return this.currentUser?.role === 'acheteur';
  }
}
