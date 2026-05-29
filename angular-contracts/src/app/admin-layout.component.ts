import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from './auth/auth.service';

interface SidebarItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">StudentLife Admin</div>
        <nav class="sidebar-nav">
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="active-link"
            class="nav-link"
            >Dashboard</a
          >
          <a
            *ngFor="let item of infoTableLinks"
            [routerLink]="item.path"
            routerLinkActive="active-link"
            class="nav-link"
            >{{ item.label }}</a
          >
          <a
            routerLink="/admin/translations"
            routerLinkActive="active-link"
            class="nav-link"
            >Translations</a
          >
        </nav>
      </aside>

      <section class="content-shell">
        <header class="topbar">
          <div class="welcome">
            <span class="welcome-label">Signed in as</span>
            <span class="username">{{ username || 'Unknown user' }}</span>
          </div>

          <button type="button" class="logout-btn" (click)="logout()">Logout</button>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
        color: #20222c;
      }

      .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 100vh;
        background: #f6f7fb;
      }

      .sidebar {
        background: #1e1e2e;
        color: #e7e9f5;
        padding: 24px 14px;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .sidebar-header {
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.2px;
        padding: 8px 10px 18px;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .nav-link {
        color: #cfd3ea;
        text-decoration: none;
        padding: 10px 12px;
        border-radius: 10px;
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        font-size: 0.95rem;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        transform: translateX(2px);
      }

      .active-link {
        background: rgba(115, 103, 240, 0.28);
        color: #ffffff;
      }

      .content-shell {
        display: grid;
        grid-template-rows: 72px 1fr;
        min-height: 100vh;
        background: #ffffff;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        border-bottom: 1px solid #e9ebf5;
        background: #ffffff;
      }

      .welcome {
        display: flex;
        gap: 8px;
        align-items: baseline;
      }

      .welcome-label {
        color: #6a6f84;
        font-size: 0.9rem;
      }

      .username {
        font-weight: 600;
      }

      .logout-btn {
        border: 1px solid #d8dcf1;
        background: #f9faff;
        color: #242a3f;
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
      }

      .logout-btn:hover {
        background: #eef2ff;
        border-color: #bcc8ff;
      }

      .content {
        padding: 24px;
      }
    `,
  ],
})
export class AdminLayoutComponent implements OnInit {
  username = '';

  readonly infoTableLinks: SidebarItem[] = [
    { label: 'Country', path: '/admin/info/Country' },
    { label: 'CurrencyType', path: '/admin/info/CurrencyType' },
    { label: 'ContentType', path: '/admin/info/ContentType' },
    { label: 'Gender', path: '/admin/info/Gender' },
    { label: 'Language', path: '/admin/info/Language' },
    { label: 'Region', path: '/admin/info/Region' },
    { label: 'Role', path: '/admin/info/Role' },
    { label: 'RoomPostType', path: '/admin/info/RoomPostType' },
    { label: 'RoomType', path: '/admin/info/RoomType' },
    { label: 'Status', path: '/admin/info/Status' },
    { label: 'Translation', path: '/admin/info/Translation' },
    { label: 'InfoTable', path: '/admin/info/InfoTable' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.authService
      .getProfile()
      .pipe(take(1))
      .subscribe({
        next: (profile) => {
          this.username = profile.username;
        },
        error: () => {
          this.username = '';
        },
      });
  }

  logout(): void {
    this.authService.clearTokens();
    void this.router.navigate(['/login']);
  }
}
