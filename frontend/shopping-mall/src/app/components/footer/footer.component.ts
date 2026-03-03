import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  showFooter = false;
  private destroy$ = new Subject<void>();
  private homeScrollDestroy$ = new Subject<void>();
  private homeScrollTarget: HTMLElement | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.bindHomeScroll();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.bindHomeScroll();
      });

    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.bindHomeScroll());
    }
  }

  ngOnDestroy(): void {
    this.homeScrollDestroy$.next();
    this.homeScrollDestroy$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private bindHomeScroll(): void {
    this.homeScrollDestroy$.next();
    this.homeScrollDestroy$.complete();
    this.homeScrollDestroy$ = new Subject<void>();
    this.homeScrollTarget = null;
    this.showFooter = false;

    if (!this.isHomeRoute() || !this.isDesktopViewport()) {
      return;
    }

    if (typeof document === 'undefined') return;

    setTimeout(() => {
      if (!this.isHomeRoute() || !this.isDesktopViewport()) return;
      const target = document.querySelector('.home-container') as HTMLElement | null;
      if (!target) {
        this.showFooter = false;
        return;
      }

      this.homeScrollTarget = target;
      this.updateFooterVisibility();

      fromEvent(target, 'scroll')
        .pipe(takeUntil(this.homeScrollDestroy$), takeUntil(this.destroy$))
        .subscribe(() => this.updateFooterVisibility());
    }, 0);
  }

  private updateFooterVisibility(): void {
    if (!this.isHomeRoute() || !this.isDesktopViewport() || !this.homeScrollTarget) {
      this.showFooter = false;
      return;
    }

    const target = this.homeScrollTarget;
    const bottomThreshold = 12;
    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - bottomThreshold;
    this.showFooter = isAtBottom;
  }

  private isHomeRoute(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/home');
  }

  private isDesktopViewport(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > 768;
  }
}
