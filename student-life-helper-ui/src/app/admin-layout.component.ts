import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, filter, of, switchMap, take } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { getRoleCodeFromToken } from './auth/jwt.utils';
import { ChatService } from './services/chat.service';
import { LanguageStateService } from './services/language-state.service';
import { RegisterLookupService } from './services/register-lookup.service';
import { SqlPanelComponent } from './shared/sql-panel/sql-panel.component';

const ADMIN_ROLE_CODE = 1;

interface SidebarItem {
  label: string;
  path: string;
}

interface LanguageInfo {
  code: number;
  fullName: string;
  shortName?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SqlPanelComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="brand-dot"></span>
          <span>StudentLife Admin</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <p class="section-title">General</p>
            @if (isAdmin) {
              <a routerLink="/admin/dashboard" routerLinkActive="active-link" class="nav-link">
                <span class="nav-dot"></span>
                <span>Dashboard</span>
              </a>
            }
            <a routerLink="/admin/profile" routerLinkActive="active-link" class="nav-link">
              <span class="nav-dot"></span>
              <span>Profile</span>
            </a>
          </div>

          <div class="nav-section">
            <p class="section-title">Room posts</p>
            <a
              routerLink="/admin/room-posts"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Browse all room listings"
            >
              <span class="nav-dot"></span>
              <span>Browse</span>
            </a>
            <a
              routerLink="/admin/room-posts/mine"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Your room posts"
            >
              <span class="nav-dot"></span>
              <span>My posts</span>
            </a>
            <a
              routerLink="/admin/room-posts/create"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Create a new room post"
            >
              <span class="nav-dot"></span>
              <span>New post</span>
            </a>
          </div>

          <div class="nav-section">
            <p class="section-title">Currency posts</p>
            <a
              routerLink="/admin/currency-posts"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Browse currency exchange offers"
            >
              <span class="nav-dot"></span>
              <span>Browse</span>
            </a>
            <a
              routerLink="/admin/currency-posts/mine"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Your currency posts"
            >
              <span class="nav-dot"></span>
              <span>My posts</span>
            </a>
            <a
              routerLink="/admin/currency-posts/new"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link"
              title="Create a new currency post"
            >
              <span class="nav-dot"></span>
              <span>New post</span>
            </a>
          </div>

          <div class="nav-section">
            <p class="section-title">Messages</p>
            <a
              routerLink="/admin/chat"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }"
              class="nav-link nav-chat"
              title="Direct messages"
            >
              <span class="nav-dot"></span>
              <span>Chats</span>
              <span class="nav-badge" *ngIf="chatUnread() > 0">{{ unreadBadgeLabel() }}</span>
            </a>
          </div>

          @if (isAdmin) {
            <div class="nav-section">
              <p class="section-title">Management</p>
              @for (item of managementLinks; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active-link" class="nav-link">
                  <span class="nav-dot"></span>
                  <span>{{ item.label }}</span>
                </a>
              }
            </div>

            <div class="nav-section">
              <p class="section-title">Data Tables</p>
              @for (item of infoTableLinks; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active-link" class="nav-link">
                  <span class="nav-dot"></span>
                  <span>{{ item.label }}</span>
                </a>
              }
            </div>
          }
        </nav>
      </aside>

      <section class="content-shell">
        <header class="topbar">
          <div class="welcome">
            <span class="welcome-label">Signed in as</span>
            <a routerLink="/admin/profile" class="username-link">{{ username || 'Unknown user' }}</a>
          </div>
          <div class="topbar-actions">
            <div class="lang-wrap" [class.open]="isLangOpen">
              <button type="button" class="lang-btn" (click)="toggleLanguageMenu()">
                <span class="flag">{{ selectedLanguageFlag }}</span>
                <span>{{ selectedLanguageName }}</span>
                <span class="caret">▼</span>
              </button>
              <div class="lang-menu" *ngIf="isLangOpen">
                <button
                  type="button"
                  class="lang-item"
                  *ngFor="let language of languages"
                  [class.active]="language.code === selectedLanguageCode"
                  (click)="selectLanguage(language.code)"
                >
                  <span class="flag">{{ getLanguageFlag(language) }}</span>
                  <span class="lang-code">{{ language.shortName || language.code }}</span>
                  <span>{{ language.fullName }}</span>
                </button>
              </div>
            </div>
            <button type="button" class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
          <div class="lang-refresh-overlay" *ngIf="isLanguageRefreshing">
            <div class="lang-refresh-spinner"></div>
          </div>
        </main>
      </section>
      <app-sql-panel></app-sql-panel>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; color: #20222c; }
    .layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; background: transparent; }
    .sidebar {
      background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
      color: #e5e7eb;
      padding: 22px 14px;
      border-right: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
    }
    .sidebar-header {
      margin: 4px 8px 16px;
      font-size: 1.02rem;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(180deg, #22d3ee, #818cf8);
      box-shadow: 0 0 0 3px rgba(34, 211, 238, .2);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: calc(100vh - 90px);
      overflow-y: auto;
      padding-right: 2px;
    }
    .nav-section {
      display: grid;
      gap: 6px;
      padding: 10px 8px;
      border-radius: 12px;
      background: rgba(15, 23, 42, .24);
      border: 1px solid rgba(148, 163, 184, .14);
    }
    .section-title {
      margin: 0 2px 2px;
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .nav-link {
      color: #cbd5e1;
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid transparent;
      transition: all .2s ease;
      font-size: .93rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: rgba(148, 163, 184, .8);
      transition: all .2s ease;
      flex-shrink: 0;
    }
    .nav-link:hover { background: rgba(148, 163, 184, .14); color: #fff; border-color: rgba(148, 163, 184, .32); }
    .active-link {
      background: linear-gradient(90deg, rgba(79, 70, 229, .38), rgba(59, 130, 246, .28));
      color: #fff;
      border-color: rgba(129, 140, 248, .42);
    }
    .nav-chat {
      position: relative;
    }
    .nav-badge {
      margin-left: auto;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      background: #4f46e5;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      display: inline-grid;
      place-items: center;
      line-height: 1;
    }
    .content-shell {
      display: grid;
      grid-template-rows: 72px 1fr;
      min-height: 100vh;
      background: transparent;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 28px;
      margin: 14px 16px 0;
      border: 1px solid rgba(51, 65, 85, .9);
      border-radius: 14px;
      background: rgba(15, 23, 42, .82);
      box-shadow: 0 8px 18px rgba(2, 6, 23, .35);
    }
    .topbar-actions { display: flex; gap: 10px; align-items: center; }
    .welcome { display: flex; gap: 8px; align-items: baseline; }
    .welcome-label { color: #94a3b8; font-size: .88rem; }
    .username-link { font-weight: 600; color: #e2e8f0; text-decoration: none; border-bottom: 1px solid transparent; }
    .username-link:hover { color: #a5b4fc; border-bottom-color: rgba(165, 180, 252, 0.45); }
    .logout-btn {
      border: 1px solid #334155;
      background: #111827;
      color: #e2e8f0;
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      transition: all .2s ease;
      font-weight: 600;
    }
    .logout-btn:hover { background: #1f2937; border-color: #6366f1; color: #fff; }
    .lang-wrap { position: relative; }
    .lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 12px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 600;
      min-width: 148px;
      justify-content: center;
    }
    .lang-btn:hover { border-color: #6366f1; background: #273449; }
    .caret { font-size: .72rem; opacity: .8; }
    .flag { font-size: 1rem; line-height: 1; }
    .lang-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 240px;
      border-radius: 14px;
      border: 1px solid #334155;
      background: #0f172a;
      box-shadow: 0 20px 36px rgba(2, 6, 23, .45);
      padding: 8px;
      display: grid;
      gap: 6px;
      z-index: 1200;
    }
    .lang-item {
      display: grid;
      grid-template-columns: 20px 38px 1fr;
      align-items: center;
      gap: 8px;
      width: 100%;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: #cbd5e1;
      padding: 10px 10px;
      text-align: left;
      cursor: pointer;
      font-weight: 500;
    }
    .lang-item:hover { background: #1e293b; border-color: #334155; color: #f8fafc; }
    .lang-item.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, .44), rgba(59, 130, 246, .3));
      border-color: rgba(99, 102, 241, .65);
      color: #fff;
    }
    .lang-code { opacity: .9; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; }
    .content {
      padding: 18px 24px 80px;
      position: relative;
      isolation: isolate;
    }
    .lang-refresh-overlay {
      position: absolute;
      inset: 8px 10px 14px;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.34);
      display: grid;
      place-items: center;
      z-index: 5;
      pointer-events: none;
      animation: fadeIn .16s ease;
    }
    .lang-refresh-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(148, 163, 184, 0.35);
      border-top-color: #818cf8;
      border-radius: 999px;
      animation: spin .65s linear infinite;
    }
    .content::before {
      content: "";
      position: absolute;
      inset: 8px 10px 14px;
      border-radius: 18px;
      z-index: -1;
      background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.58) 0%, rgba(15, 23, 42, 0.36) 100%),
        radial-gradient(260px 180px at 10% 0%, rgba(99, 102, 241, 0.16), transparent 70%);
      border: 1px solid rgba(51, 65, 85, 0.6);
    }
    @media (max-width: 980px) {
      .layout { grid-template-columns: 78px 1fr; }
      .sidebar-header { display: none; }
      .nav-link { font-size: 0; position: relative; min-height: 40px; }
      .nav-dot, .section-title { display: none; }
      .nav-link::before { content: "•"; font-size: 1rem; position: absolute; inset: 0; display: grid; place-items: center; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class AdminLayoutComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

  username = '';
  isAdmin = false;
  languages: LanguageInfo[] = [];
  selectedLanguageCode: number | null = null;
  isLangOpen = false;
  isLanguageRefreshing = false;

  readonly managementLinks: SidebarItem[] = [
    { label: 'Users', path: '/admin/users' },
    { label: 'Translation', path: '/admin/translations' },
  ];

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
    { label: 'InfoTable', path: '/admin/info/InfoTable' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly languageStateService: LanguageStateService,
    private readonly registerLookupService: RegisterLookupService,
    private readonly router: Router,
    private readonly host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    this.isAdmin = token ? getRoleCodeFromToken(token) === ADMIN_ROLE_CODE : false;

    this.authService.getProfile().pipe(take(1)).subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.selectedLanguageCode =
          profile.languageCode != null && Number.isFinite(Number(profile.languageCode))
            ? Number(profile.languageCode)
            : null;
        this.languageStateService.setLanguageCode(this.selectedLanguageCode);
      },
      error: () => { this.username = ''; },
    });
    this.loadLanguages();
    this.refreshChatUnread();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshChatUnread());
    this.chatService.onMessage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((msg) => {
      if (this.isViewingChat(msg.chatId)) {
        return;
      }
      this.refreshChatUnread();
    });
    this.chatService.onChatCreated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refreshChatUnread();
    });
  }

  chatUnread(): number {
    return this.chatService.totalUnreadCount();
  }

  unreadBadgeLabel(): string {
    const n = this.chatUnread();
    return n > 99 ? '99+' : String(n);
  }

  private viewingChatId(): string | null {
    const match = this.router.url.match(/\/admin\/chat\/([^/?#]+)/);
    return match?.[1] ?? null;
  }

  private isViewingChat(chatId: string): boolean {
    const active = this.viewingChatId();
    return active != null && active === chatId;
  }

  private refreshChatUnread(): void {
    this.chatService.refreshTotalUnread(this.viewingChatId()).pipe(take(1)).subscribe();
  }

  logout(): void {
    this.authService.clearTokens();
    void this.router.navigate(['/login']);
  }

  toggleLanguageMenu(): void {
    this.isLangOpen = !this.isLangOpen;
  }

  selectLanguage(languageCode: number): void {
    if (!Number.isFinite(languageCode) || languageCode <= 0) {
      return;
    }
    this.authService
      .updateProfile({ languageCode })
      .pipe(
        take(1),
        switchMap(() =>
          this.authService.refreshToken().pipe(
            take(1),
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe({
      next: () => {
        this.selectedLanguageCode = languageCode;
        this.languageStateService.setLanguageCode(languageCode);
        this.isLangOpen = false;
        this.refreshCurrentViewSmoothly();
      },
      error: () => {
        this.isLangOpen = false;
      },
    });
  }

  get selectedLanguageName(): string {
    if (this.selectedLanguageCode == null) {
      return 'Language';
    }
    return this.languages.find((x) => x.code === this.selectedLanguageCode)?.fullName ?? 'Language';
  }

  get selectedLanguageFlag(): string {
    if (this.selectedLanguageCode == null) {
      return '🌐';
    }
    const language = this.languages.find((x) => x.code === this.selectedLanguageCode);
    return language ? this.getLanguageFlag(language) : '🌐';
  }

  getLanguageFlag(language: LanguageInfo): string {
    const key = (language.shortName ?? language.fullName ?? '').trim().toLowerCase();
    if (key.startsWith('ru') || key.includes('russian') || key.includes('рус')) return '🇷🇺';
    if (key.startsWith('en') || key.includes('english')) return '🇬🇧';
    if (key.startsWith('uz') || key.includes('uzbek') || key.includes("o'zbek")) return '🇺🇿';
    if (key.startsWith('tr') || key.includes('turk')) return '🇹🇷';
    return '🌐';
  }

  private loadLanguages(): void {
    this.registerLookupService
      .getLanguageSelect()
      .pipe(take(1))
      .subscribe({
        next: (list) => {
          this.languages = (list ?? []).map((x) => ({
            code: Number(x.value),
            fullName: x.text,
            shortName: this.deriveShortName(x.text),
          }));
        },
        error: () => {
          this.languages = [];
        },
      });
  }

  private deriveShortName(text: string): string {
    const t = (text ?? '').trim().toLowerCase();
    if (t.includes('english')) return 'EN';
    if (t.includes("o'zbek") || t.includes('uzbek')) return 'UZ';
    if (t.includes('рус') || t.includes('russian')) return 'RU';
    if (t.includes('turk')) return 'TR';
    return text.slice(0, 2).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isLangOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.isLangOpen = false;
    }
  }

  private refreshCurrentViewSmoothly(): void {
    this.isLanguageRefreshing = true;
    // Smooth UX: show short overlay first, then do guaranteed full refresh.
    setTimeout(() => {
      window.location.reload();
    }, 180);
  }
}
