import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef,Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { RoomPostContentDto, RoomPostDto } from '../../contracts';
import { RoomPostService } from '../../services/roomPostService';
import { ToastService } from '../../services/toast.service';
import { roomPostContentImageUrl } from './room-post-media';
interface FilePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-room-post-add-content',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room posts navigation">
        <a routerLink="/admin/room-posts" class="link-muted">← All room posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts/mine" class="link-muted">My posts</a>
          <a [routerLink]="['/admin/room-posts', roomPostId, 'edit']" class="link-muted">Edit listing</a>
          <a routerLink="/admin/room-posts/create" class="link-muted">New post</a>
        </div>
      </nav>
      <div class="card" *ngIf="!fatalError">
        <header class="head">
          <div>
            <p class="eyebrow">Listing #{{ roomPostId }}</p>
            <h1>Add photos</h1>
            <p class="subtitle" *ngIf="roomPost">
              {{ roomPost.title }} · {{ roomPost.regionName }} · {{ roomPost.monthlyRentFee }}
              {{ roomPost.currencyName }}
            </p>
          </div>
        </header>

        <div
          class="upload-dropzone"
          (click)="fileInput.click()"
          (dragover)="$event.preventDefault()"
          (drop)="onDrop($event)"
        >
          <p>Click to select images or drag &amp; drop here</p>
          <span>JPEG, PNG, WEBP supported · Multiple files allowed</span>
          <input
            #fileInput
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            hidden
            (change)="onFilesSelected($event)"
          />
        </div>

        <div class="preview-grid" *ngIf="selectedFiles.length > 0">
          <div
            class="preview-card"
            *ngFor="let item of selectedFiles; let i = index; trackBy: trackPreview"
            [class.is-cover]="coverIndex === i"
          >
            <img [src]="item.preview" [alt]="item.file.name" />
            <div class="preview-overlay">
              <span class="cover-badge" *ngIf="coverIndex === i">Cover</span>
            </div>
            <div class="preview-actions">
              <button type="button" (click)="setCover(i); $event.stopPropagation()" [disabled]="coverIndex === i">
                {{ coverIndex === i ? 'Cover' : 'Set as Cover' }}
              </button>
              <button type="button" class="remove-btn" (click)="removeFile(i); $event.stopPropagation()">
                Remove
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="upload-btn"
          [disabled]="selectedFiles.length === 0 || isSubmitting"
          (click)="onSubmit()"
        >
          {{ isSubmitting ? 'Uploading...' : 'Upload ' + selectedFiles.length + ' photo(s)' }}
        </button>

        <p *ngIf="actionMessage" class="message ok">{{ actionMessage }}</p>
        <p *ngIf="actionError" class="message err">{{ actionError }}</p>

        <h2 class="gallery-title">Gallery</h2>
        <p class="hint" *ngIf="!contents.length && !loading">No images yet. Upload a cover photo first.</p>
        <p *ngIf="loading" class="hint">Loading…</p>

        <div class="grid" *ngIf="contents.length">
          <article class="tile" *ngFor="let item of contents; trackBy: trackContent">
            <div class="thumb">
              <img *ngIf="imgSrc(item) as src" [src]="src" [alt]="'Photo ' + item.id" />
              <div *ngIf="!imgSrc(item)" class="no-image" aria-hidden="true">No preview URL</div>
              <span class="cover-badge" *ngIf="item.isCover">Cover</span>
              <div class="tile-loading" *ngIf="isTileLoading(item.id)" aria-hidden="true">
                <div class="spinner"></div>
              </div>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-danger"
                [disabled]="galleryActionBusy"
                (click)="deleteGalleryItem(item)"
              >
                Delete
              </button>
              <button
                type="button"
                class="btn-cover"
                *ngIf="!item.isCover"
                [disabled]="galleryActionBusy"
                (click)="setGalleryCover(item)"
              >
                Set cover
              </button>
            </div>
          </article>
        </div>      </div>

      <div class="card error-card" *ngIf="fatalError">
        <h1>Cannot open listing</h1>
        <p>{{ fatalError }}</p>
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
        min-height: 100vh;
        padding: 28px 18px 48px;
        display: grid;
        place-items: start center;
      }
      .top-nav {
        width: min(900px, 96vw);
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }
      .link-muted {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.88rem;
      }
      .link-muted:hover {
        color: #e2e8f0;
      }
      .top-nav-right {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .card {
        width: min(900px, 96vw);
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        padding: 26px 24px 32px;
        box-shadow: 0 18px 36px rgba(2, 6, 23, 0.35);
      }
      .error-card {
        border-color: #7f1d1d;
      }
      .head h1 {
        margin: 4px 0 0;
        font-size: 1.45rem;
        color: #f8fafc;
      }
      .eyebrow {
        margin: 0;
        font-size: 0.78rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #94a3b8;
      }
      .subtitle {
        margin: 8px 0 0;
        color: #cbd5e1;
        font-size: 0.95rem;
      }
      .upload-dropzone {
        margin-top: 22px;
        padding: 32px 20px;
        border: 2px dashed #475569;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.6);
        text-align: center;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background 0.2s ease;
      }
      .upload-dropzone:hover {
        border-color: #6366f1;
        background: rgba(30, 41, 59, 0.5);
      }
      .upload-dropzone p {
        margin: 0 0 6px;
        color: #e2e8f0;
        font-weight: 600;
      }
      .upload-dropzone span {
        color: #94a3b8;
        font-size: 0.88rem;
      }
      .preview-grid {
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
      }
      .preview-card {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid #334155;
        background: #111827;
      }
      .preview-card.is-cover {
        border-color: #eab308;
        box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.35);
      }
      .preview-card img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        display: block;
      }
      .preview-overlay {
        position: absolute;
        top: 8px;
        left: 8px;
      }
      .cover-badge {
        background: rgba(15, 23, 42, 0.92);
        color: #fde68a;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(250, 204, 21, 0.35);
      }
      .preview-actions {
        display: flex;
        gap: 6px;
        padding: 8px;
        background: rgba(2, 6, 23, 0.85);
      }
      .preview-actions button {
        flex: 1;
        font-size: 0.72rem;
        padding: 6px 4px;
        border-radius: 8px;
        border: 1px solid #475569;
        background: #1e293b;
        color: #e2e8f0;
        cursor: pointer;
      }
      .preview-actions button:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .preview-actions .remove-btn {
        border-color: #7f1d1d;
        color: #fecaca;
      }
      .upload-btn {
        margin-top: 18px;
        width: 100%;
        border: 0;
        border-radius: 11px;
        padding: 12px 18px;
        font-weight: 700;
        cursor: pointer;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
      }
      .upload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .message {
        margin-top: 12px;
        font-size: 0.92rem;
      }
      .ok {
        color: #86efac;
      }
      .err {
        color: #fecaca;
      }
      .gallery-title {
        margin: 26px 0 10px;
        font-size: 1.1rem;
        color: #e2e8f0;
      }
      .hint {
        color: #94a3b8;
        font-size: 0.92rem;
      }
      .grid {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
      .tile {
        background: #111827;
        border-radius: 14px;
        border: 1px solid #1f2937;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .thumb {
        position: relative;
        aspect-ratio: 4 / 3;
        background: #020617;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .no-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: #64748b;
        padding: 8px;
        text-align: center;
      }
      .badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(15, 23, 42, 0.92);
        color: #fde68a;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(250, 204, 21, 0.35);
      }
      .cover-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(79, 70, 229, 0.92);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        z-index: 2;
      }
      .tile-loading {
        position: absolute;
        inset: 0;
        background: rgba(2, 6, 23, 0.62);
        display: grid;
        place-items: center;
        z-index: 3;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border: 3px solid rgba(148, 163, 184, 0.35);
        border-top-color: #818cf8;
        border-radius: 999px;
        animation: spin 0.65s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .actions {
        display: flex;
        gap: 8px;
        padding: 10px;
      }
      .btn-danger,
      .btn-cover {
        flex: 1;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 6px 8px;
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-danger {
        border: 1px solid #b91c1c;
        color: #fecaca;
      }
      .btn-danger:hover:not(:disabled) {
        background: rgba(127, 29, 29, 0.35);
      }
      .btn-cover {
        border: 1px solid #6366f1;
        color: #c7d2fe;
      }
      .btn-cover:hover:not(:disabled) {
        background: rgba(79, 70, 229, 0.25);
      }
      .btn-danger:disabled,
      .btn-cover:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }    `,
  ],
})
export class RoomPostAddContentComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roomPosts = inject(RoomPostService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  roomPostId = 0;
  roomPost: RoomPostDto | null = null;
  contents: RoomPostContentDto[] = [];
  loadingContentIds: number[] = [];

  loading = true;
  isSubmitting = false;
  fatalError = '';
  actionMessage = '';
  actionError = '';

  selectedFiles: FilePreview[] = [];
  coverIndex = 0;

  get galleryActionBusy(): boolean {
    return this.loadingContentIds.length > 0;
  }
  ngOnInit(): void {
    const fromUrl = this.route.snapshot.paramMap.get('id');
    const fromSession =
      sessionStorage.getItem('currentRoomPostId') ??
      sessionStorage.getItem('pendingRoomPostUploadId');
    const raw = fromUrl ?? fromSession;
    const parsed = Number(raw);

    if (Number.isFinite(parsed) && parsed > 0) {
      sessionStorage.removeItem('currentRoomPostId');
      sessionStorage.removeItem('pendingRoomPostUploadId');
      this.beginWithId(Math.trunc(parsed));
      return;
    }

    this.fatalError = 'Missing listing id. Open the listing from My posts → Add photos.';
    this.loading = false;
  }

  private beginWithId(id: number): void {
    this.roomPostId = id;
    this.refreshGallery();
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }

  trackContent(_: number, item: RoomPostContentDto): number {
    return item.id;
  }

  trackPreview(index: number): number {
    return index;
  }

  imgSrc(item: RoomPostContentDto): string | null {
    return roomPostContentImageUrl(item.url);
  }

  isTileLoading(contentId: number): boolean {
    return this.loadingContentIds.includes(contentId);
  }

  private setTileLoading(contentId: number, loading: boolean): void {
    if (loading) {
      if (!this.loadingContentIds.includes(contentId)) {
        this.loadingContentIds = [...this.loadingContentIds, contentId];
      }
      return;
    }
    this.loadingContentIds = this.loadingContentIds.filter((id) => id !== contentId);
  }

  private snapshotContents(): RoomPostContentDto[] {
    return this.contents.map((c) => ({ ...c }));
  }

  deleteGalleryItem(item: RoomPostContentDto): void {
    if (this.galleryActionBusy) {
      return;
    }
    if (!confirm('Delete this photo?')) {
      return;
    }

    const snapshot = this.snapshotContents();
    const wasCover = item.isCover;
    this.contents = this.contents.filter((c) => c.id !== item.id);
    if (wasCover && this.contents.length > 0) {
      this.contents = this.contents.map((c, index) => ({ ...c, isCover: index === 0 }));
    }

    this.setTileLoading(item.id, true);
    this.roomPosts
      .deleteContent(this.roomPostId, item.id)
      .pipe(
        take(1),
        finalize(() => this.setTileLoading(item.id, false)),
      )
      .subscribe({
        next: () => this.toast.show('Photo deleted.', true),
        error: (err) => {
          this.contents = snapshot;
          this.toast.show(this.formatError(err), false);
        },
      });
  }

  setGalleryCover(item: RoomPostContentDto): void {
    if (item.isCover || this.galleryActionBusy) {
      return;
    }

    const snapshot = this.snapshotContents();
    this.contents = this.contents.map((c) => ({ ...c, isCover: c.id === item.id }));

    this.setTileLoading(item.id, true);
    this.roomPosts
      .setCover(this.roomPostId, item.id)
      .pipe(
        take(1),
        finalize(() => this.setTileLoading(item.id, false)),
      )
      .subscribe({
        next: () => this.toast.show('Cover updated.', true),
        error: (err) => {
          this.contents = snapshot;
          this.toast.show(this.formatError(err), false);
        },
      });
  }

  onFilesSelected(event: Event): void {    this.actionMessage = '';
    this.actionError = '';
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.actionMessage = '';
    this.actionError = '';
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  setCover(index: number): void {
    this.coverIndex = index;
  }

  removeFile(index: number): void {
    URL.revokeObjectURL(this.selectedFiles[index].preview);
    this.selectedFiles.splice(index, 1);
    if (this.coverIndex >= this.selectedFiles.length) {
      this.coverIndex = 0;
    }
  }

  onSubmit(): void {
    if (!this.roomPostId || this.selectedFiles.length === 0 || this.isSubmitting) {
      return;
    }

    const ordered: File[] = [
      this.selectedFiles[this.coverIndex].file,
      ...this.selectedFiles.filter((_, i) => i !== this.coverIndex).map((item) => item.file),
    ];

    this.isSubmitting = true;
    this.actionMessage = '';
    this.actionError = '';

    this.roomPosts
      .addContent(this.roomPostId, ordered)
      .pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (msg) => {
          console.log('Upload success:', msg);
          this.actionMessage =
            typeof msg === 'string' && msg.trim().length ? msg.trim() : 'Images uploaded.';
          this.clearSelectedFiles();
          void this.router.navigate(['/admin/room-posts/mine']);
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.actionError = this.formatError(err);
        },
      });
  }

  private addFiles(files: File[]): void {
    const accepted = files.filter(
      (f) =>
        f.size > 0 &&
        (f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp'),
    );
    const newItems = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    this.selectedFiles = [...this.selectedFiles, ...newItems];
    if (this.selectedFiles.length > 0 && this.coverIndex >= this.selectedFiles.length) {
      this.coverIndex = 0;
    }
  }

  private clearSelectedFiles(): void {
    this.revokeAllPreviews();
    this.selectedFiles = [];
    this.coverIndex = 0;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private revokeAllPreviews(): void {
    for (const item of this.selectedFiles) {
      URL.revokeObjectURL(item.preview);
    }
  }

  private refreshGallery(): void {
    this.loading = true;
    this.roomPosts
      .getRoomPostById(this.roomPostId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (dto) => {
          this.roomPost = dto;
          this.contents = [...(dto.roomPostContents ?? [])];
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.fatalError = this.formatError(e);
          this.cdr.markForCheck();
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
        return body
          .map((x) => (typeof x === 'string' ? x : this.errorBodyToString(x)))
          .filter((s) => s.length > 0)
          .join(' ');
      }
      if (body && typeof body === 'object') {
        const fromObject = this.errorBodyToString(body);
        if (fromObject) {
          return fromObject;
        }
      }
      if (err.status === 404) {
        return 'Room post not found.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong.';
  }

  private errorBodyToString(body: unknown): string {
    if (typeof body === 'string') {
      return body;
    }
    if (body == null || typeof body !== 'object') {
      return '';
    }
    const o = body as Record<string, unknown>;
    const msg = o['message'] ?? o['title'];
    if (typeof msg === 'string' && msg.length) {
      return msg;
    }
    const errors = o['errors'];
    if (errors && typeof errors === 'object') {
      const parts: string[] = [];
      for (const v of Object.values(errors as Record<string, unknown>)) {
        if (typeof v === 'string') {
          parts.push(v);
        } else if (Array.isArray(v)) {
          parts.push(...v.map((x) => String(x)));
        }
      }
      if (parts.length) {
        return parts.join(' ');
      }
    }
    return '';
  }
}