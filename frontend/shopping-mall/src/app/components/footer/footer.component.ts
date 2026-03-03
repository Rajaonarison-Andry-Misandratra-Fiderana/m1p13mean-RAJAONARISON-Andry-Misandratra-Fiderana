import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
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
  showFooter = true;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateFooterVisibility();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.updateFooterVisibility();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFooterVisibility(): void {
    const path = this.router.url.split('?')[0].split('#')[0];
    const hiddenPaths = ['/admin/dashboard', '/admin/users', '/settings'];
    this.showFooter = !hiddenPaths.some(
      (hiddenPath) => path === hiddenPath || path.startsWith(`${hiddenPath}/`),
    );
  }
}
