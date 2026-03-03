import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject, fromEvent, merge } from 'rxjs';
import { auditTime, filter, startWith, takeUntil } from 'rxjs/operators';

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
  private retrack$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setupFooterVisibilityTracking();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.setupFooterVisibilityTracking();
      });
  }

  ngOnDestroy(): void {
    this.retrack$.next();
    this.retrack$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFooterVisibilityTracking(): void {
    this.retrack$.next();

    if (!this.isHomeRoute() || this.isAuthRoute()) {
      this.showFooter = false;
      return;
    }

    const homeContainer = document.querySelector('.home-container');
    const scrollSources = [fromEvent(window, 'scroll'), fromEvent(window, 'resize')];
    if (homeContainer) {
      scrollSources.push(fromEvent(homeContainer, 'scroll'));
    }

    merge(...scrollSources)
      .pipe(startWith(0), auditTime(50), takeUntil(merge(this.destroy$, this.retrack$)))
      .subscribe(() => {
        this.showFooter = this.isAtBottomWithMiniScroll(homeContainer);
      });
  }

  private isHomeRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '' || path === '/' || path === '/home' || path.startsWith('/home/');
  }

  private isAuthRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/login' || path === '/signup';
  }

  private isAtBottomWithMiniScroll(homeContainer: Element | null): boolean {
    const threshold = 6;
    const minScroll = 24;

    if (homeContainer instanceof HTMLElement) {
      const hasScrollableContent = homeContainer.scrollHeight > homeContainer.clientHeight + 1;
      if (!hasScrollableContent) {
        return false;
      }
      const isAtBottom =
        homeContainer.scrollTop + homeContainer.clientHeight >= homeContainer.scrollHeight - threshold;
      return isAtBottom && homeContainer.scrollTop >= minScroll;
    }

    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const clientHeight = window.innerHeight || doc.clientHeight || 0;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    return isAtBottom && scrollTop >= minScroll;
  }
}
