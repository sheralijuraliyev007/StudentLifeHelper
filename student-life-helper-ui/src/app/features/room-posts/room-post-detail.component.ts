import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { RoomPostContentDto, RoomPostDto } from '../../contracts';
import { ChatService } from '../../services/chat.service';
import { RoomPostService } from '../../services/roomPostService';
import { ToastService } from '../../services/toast.service';
import {
  roomPostCanActivate,
  roomPostCanDeactivate,
  roomPostCanDelete,
  roomPostCanEdit,
  roomPostStatusLabelEn,
  RoomPostStatusCode,
} from './room-post-status';
import { resolveRoomPostMediaUrl, roomPostMainImageUrl } from './room-post-media';

@Component({
  selector: 'app-room-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room post navigation">
        <a [routerLink]="backLink" class="link-muted">{{ backLabel }}</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts" class="link-muted">All posts</a>
          <a routerLink="/admin/room-posts/mine" class="link-muted">My posts</a>
        </div>
      </nav>

      <div *ngIf="loading()" class="state">Loading listing…</div>
      <p *ngIf="!loading() && errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div class="detail" *ngIf="!loading() && post() as p">
        <header class="hero">
          <p class="eyebrow">
            {{ isOwner() ? 'Your listing' : 'Listing' }} · #{{ p.id }}
            <span class="badge" [class.badge-owner]="isOwner()">{{ isOwner() ? 'Owner view' : 'Viewer' }}</span>
          </p>
          <h1>{{ p.title }}</h1>
          <p class="lead">{{ p.description }}</p>
        </header>

        <div class="hero-cover" *ngIf="coverImageUrl">
          <img [src]="coverImageUrl" [alt]="p.title" />
        </div>

        <ul class="facts">
          <li><span class="k">Host</span> {{ '@' + p.username }}</li>
          <li><span class="k">Region</span> {{ p.regionName }}</li>
          <li>
            <span class="k">Rent</span> {{ p.monthlyRentFee }} {{ p.currencyName }}
          </li>
          <li><span class="k">Type</span> {{ p.roomTypeName }} · {{ p.roomPostName }}</li>
          <li *ngIf="p.forGenderName"><span class="k">Guest</span> {{ p.forGenderName }}</li>
          <li><span class="k">Status</span> {{ p.statusName }}</li>
          <li *ngIf="p.depositAmount > 0">
            <span class="k">Deposit</span> {{ p.depositAmount }}
          </li>
        </ul>

        <div class="viewer-actions" *ngIf="!isOwner()">
          <button
            type="button"
            class="btn-small primary"
            [disabled]="chatting()"
            (click)="chatWithOwner()"
          >
            {{ chatting() ? 'Opening chat…' : 'Chat with owner' }}
          </button>
        </div>

        <div class="owner-actions" *ngIf="isOwner()">
          <h2 class="section-title">Manage listing</h2>
          <div class="actions">
            <a
              *ngIf="canEdit()"
              [routerLink]="['/admin/room-posts', p.id, 'edit']"
              class="btn-small secondary"
            >
              Update
            </a>
            <a
              *ngIf="canEdit()"
              [routerLink]="['/admin/room-posts', p.id, 'add-content']"
              class="btn-small primary"
            >
              Photos
            </a>
            <button
              type="button"
              class="btn-small secondary"
              *ngIf="canActivate()"
              [disabled]="acting()"
              (click)="activate()"
            >
              Activate
            </button>
            <button
              type="button"
              class="btn-small warn"
              *ngIf="canDeactivate()"
              [disabled]="acting()"
              (click)="deactivate()"
            >
              Deactivate
            </button>
            <button
              type="button"
              class="btn-small danger"
              *ngIf="canDelete()"
              [disabled]="acting()"
              (click)="deletePost()"
            >
              Delete
            </button>
          </div>
        </div>

        <section class="gallery-section">
          <h2 class="section-title">Photos ({{ p.roomPostContents?.length ?? 0 }})</h2>
          <p *ngIf="!p.roomPostContents?.length" class="hint">No photos uploaded yet.</p>
          <div class="gallery" *ngIf="p.roomPostContents?.length">
            <figure class="tile" *ngFor="let item of p.roomPostContents; trackBy: trackContent">
              <img
                *ngIf="galleryItemImageUrl(item) as src"
                [src]="src"
                [alt]="p.title"
              />
              <figcaption *ngIf="item.isCover">Cover</figcaption>
            </figure>
          </div>
        </section>

        <a
          *ngIf="p.addressLink"
          class="btn-small ghost map-link"
          [href]="p.addressLink"
          target="_blank"
          rel="noopener"
        >
          Open map / address link
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .page {
        max-width: 960px;
        margin: 0 auto;
        padding: 22px 18px 48px;
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
      }
      .top-nav-right {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
      }
      .link-muted {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.92rem;
      }
      .link-muted:hover {
        color: #e2e8f0;
      }
      .state,
      .hint {
        color: #94a3b8;
      }
      .error-banner {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(127, 29, 29, 0.45);
        color: #fecaca;
      }
      .hero h1 {
        margin: 0 0 10px;
        color: #f8fafc;
        font-size: 1.75rem;
      }
      .eyebrow {
        margin: 0 0 8px;
        color: #94a3b8;
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .badge {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(51, 65, 85, 0.8);
        color: #cbd5e1;
      }
      .badge-owner {
        background: rgba(79, 70, 229, 0.35);
        color: #c7d2fe;
      }
      .lead {
        margin: 0;
        color: #cbd5e1;
        line-height: 1.55;
        white-space: pre-wrap;
      }
      .hero-cover {
        margin: 18px 0;
        border-radius: 14px;
        overflow: hidden;
        aspect-ratio: 16 / 9;
        background: #020617;
      }
      .hero-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .facts {
        list-style: none;
        margin: 0 0 22px;
        padding: 0;
        display: grid;
        gap: 6px;
        color: #cbd5e1;
        font-size: 0.92rem;
      }
      .facts .k {
        color: #64748b;
        margin-right: 6px;
      }
      .section-title {
        margin: 0 0 12px;
        font-size: 1.05rem;
        color: #e2e8f0;
      }
      .viewer-actions {
        margin-bottom: 20px;
      }
      .owner-actions {
        margin-bottom: 28px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid rgba(99, 102, 241, 0.35);
        background: rgba(49, 46, 129, 0.2);
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .btn-small {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 9px;
        text-decoration: none;
        border: 1px solid transparent;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-small.primary {
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
      }
      .btn-small.secondary {
        border: 1px solid #475569;
        color: #e2e8f0;
        background: rgba(30, 41, 59, 0.6);
      }
      .btn-small.warn {
        border: 1px solid #b45309;
        color: #fde68a;
        background: rgba(120, 53, 15, 0.35);
      }
      .btn-small.danger {
        border: 1px solid #b91c1c;
        color: #fecaca;
        background: rgba(127, 29, 29, 0.35);
      }
      .btn-small.ghost {
        border-color: #334155;
        color: #cbd5e1;
        background: transparent;
      }
      .btn-small:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .tile {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #334155;
        background: #020617;
        position: relative;
      }
      .tile img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        display: block;
      }
      .tile figcaption {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(79, 70, 229, 0.85);
        color: #fff;
      }
      .map-link {
        margin-top: 8px;
      }
      .gallery-section {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class RoomPostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roomPosts = inject(RoomPostService);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly post = signal<RoomPostDto | null>(null);
  readonly isOwner = signal(false);
  readonly acting = signal(false);
  readonly chatting = signal(false);

  private currentUsername = '';
  private postId = 0;

  get backLink(): string {
    return this.isOwner() ? '/admin/room-posts/mine' : '/admin/room-posts';
  }

  get backLabel(): string {
    return this.isOwner() ? '← My room posts' : '← All room posts';
  }

  get coverImageUrl(): string | null {
    const p = this.post();
    return p ? roomPostMainImageUrl(p) : null;
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid listing id.');
      return;
    }
    this.postId = Math.trunc(id);
    this.load();
  }

  trackContent(_: number, item: RoomPostContentDto): number {
    return item.id;
  }

  galleryItemImageUrl(item: RoomPostContentDto): string | null {
    const raw = item as unknown as Record<string, unknown>;
    const url =
      (typeof item.url === 'string' ? item.url : null) ??
      (typeof raw['Url'] === 'string' ? raw['Url'] : null);
    return resolveRoomPostMediaUrl(url);
  }

  canEdit(): boolean {
    const p = this.post();
    return this.isOwner() && p != null && roomPostCanEdit(p.statusCode);
  }

  canActivate(): boolean {
    const p = this.post();
    return p != null && roomPostCanActivate(p.statusCode);
  }

  canDeactivate(): boolean {
    const p = this.post();
    return p != null && roomPostCanDeactivate(p.statusCode);
  }

  canDelete(): boolean {
    const p = this.post();
    return p != null && roomPostCanDelete(p.statusCode);
  }

  chatWithOwner(): void {
    const p = this.post();
    if (!p) return;

    this.chatting.set(true);
    this.chatService
      .getOrCreateChat(p.ownerId)
      .pipe(
        take(1),
        finalize(() => this.chatting.set(false)),
      )
      .subscribe({
        next: (chat) => {
          void this.router.navigate(['/admin/chat', chat.id]);
        },
        error: (e) => {
          this.toast.show(this.formatError(e), false);
        },
      });
  }

  activate(): void {
    this.runStatus(() => this.roomPosts.activateRoomPost(this.postId), RoomPostStatusCode.Active, 'Listing activated.');
  }

  deactivate(): void {
    if (!confirm('Deactivate this listing? It will be hidden from the public feed.')) {
      return;
    }
    this.runStatus(
      () => this.roomPosts.deactivateRoomPost(this.postId),
      RoomPostStatusCode.Passive,
      'Listing deactivated.',
    );
  }

  deletePost(): void {
    if (!confirm('Delete this listing permanently?')) {
      return;
    }
    this.acting.set(true);
    this.roomPosts
      .deleteRoomPost(this.postId)
      .pipe(
        take(1),
        finalize(() => this.acting.set(false)),
      )
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.toast.show('Listing deleted.', true);
            void this.router.navigate(['/admin/room-posts/mine']);
          });
        },
        error: (e) => {
          this.ngZone.run(() => {
            this.toast.show(this.formatError(e), false);
            this.cdr.markForCheck();
          });
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      profile: this.auth.getProfile(),
      post: this.roomPosts.getRoomPostById(this.postId),
    })
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ profile, post }) => {
          this.currentUsername = (profile.username ?? '').trim().toLowerCase();
          const owner =
            this.currentUsername.length > 0 &&
            (post.username ?? '').trim().toLowerCase() === this.currentUsername;
          this.isOwner.set(owner);
          this.post.set(post);
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.errorMessage.set(this.formatError(e));
          this.cdr.markForCheck();
        },
      });
  }

  private runStatus(
    call: () => ReturnType<RoomPostService['activateRoomPost']>,
    nextCode: number,
    successToast: string,
  ): void {
    const snapshot = this.post();
    if (!snapshot) {
      return;
    }

    this.acting.set(true);
    call()
      .pipe(
        take(1),
        finalize(() => this.acting.set(false)),
      )
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            const nextName = roomPostStatusLabelEn[nextCode] ?? snapshot.statusName;
            this.post.set({ ...snapshot, statusCode: nextCode, statusName: nextName });
            this.toast.show(successToast, true);
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          this.ngZone.run(() => {
            this.toast.show(this.formatError(e), false);
            this.cdr.markForCheck();
          });
        },
      });
  }

  private formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.length) {
        return body;
      }
      if (Array.isArray(body)) {
        return body.map((x) => String(x)).join(' ');
      }
      if (err.status === 404) {
        return 'Room post not found or you do not have access to view it.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong.';
  }
}
