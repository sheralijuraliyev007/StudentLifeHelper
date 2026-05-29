import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { autoLoginGuard } from './auth/auto-login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/admin/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'info/:tableName',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./admin/info-table/info-table.component').then((m) => m.InfoTableComponent),
      },
      {
        path: 'translations',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/translation.component').then((m) => m.TranslationComponent),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/users-management.component').then(
            (m) => m.UsersManagementComponent,
          ),
      },
      {
        path: 'room-posts/create',
        loadComponent: () =>
          import('./features/room-posts/room-post-create.component').then((m) => m.RoomPostCreateComponent),
      },
      {
        path: 'room-posts/mine',
        loadComponent: () =>
          import('./features/room-posts/room-posts-mine.component').then((m) => m.RoomPostsMineComponent),
      },
      {
        path: 'room-posts/:id/edit',
        loadComponent: () =>
          import('./features/room-posts/room-post-edit.component').then((m) => m.RoomPostEditComponent),
      },
      {
        path: 'room-posts/:id/add-content',
        loadComponent: () =>
          import('./features/room-posts/room-post-add-content.component').then(
            (m) => m.RoomPostAddContentComponent,
          ),
      },
      {
        path: 'room-posts/:id',
        loadComponent: () =>
          import('./features/room-posts/room-post-detail.component').then((m) => m.RoomPostDetailComponent),
      },
      {
        path: 'room-posts',
        loadComponent: () =>
          import('./features/room-posts/room-posts-browse.component').then((m) => m.RoomPostsBrowseComponent),
      },
      {
        path: 'currency-posts/mine',
        loadComponent: () =>
          import('./features/currency-posts/currency-posts-mine.component').then(
            (m) => m.CurrencyPostsMineComponent,
          ),
      },
      {
        path: 'currency-posts/new',
        loadComponent: () =>
          import('./features/currency-posts/currency-post-new.component').then(
            (m) => m.CurrencyPostNewComponent,
          ),
      },
      {
        path: 'currency-posts/:id/edit',
        loadComponent: () =>
          import('./features/currency-posts/currency-post-edit.component').then(
            (m) => m.CurrencyPostEditComponent,
          ),
      },
      {
        path: 'currency-posts/:id',
        loadComponent: () =>
          import('./features/currency-posts/currency-post-detail.component').then(
            (m) => m.CurrencyPostDetailComponent,
          ),
      },
      {
        path: 'currency-posts',
        loadComponent: () =>
          import('./features/currency-posts/currency-posts-browse.component').then(
            (m) => m.CurrencyPostsBrowseComponent,
          ),
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat-list.component').then((m) => m.ChatListComponent),
      },
      {
        path: 'chat/:chatId',
        loadComponent: () => import('./chat/chat-detail.component').then((m) => m.ChatDetailComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
    ],
  },
  {
    path: 'room-posts/mine',
    pathMatch: 'full',
    redirectTo: '/admin/room-posts/mine',
  },
  {
    path: 'room-posts/create',
    pathMatch: 'full',
    redirectTo: '/admin/room-posts/create',
  },
  {
    path: 'room-posts/:id/edit',
    pathMatch: 'full',
    redirectTo: '/admin/room-posts/:id/edit',
  },
  {
    path: 'room-posts/:id/add-content',
    pathMatch: 'full',
    redirectTo: '/admin/room-posts/:id/add-content',
  },
  {
    path: 'room-posts',
    pathMatch: 'full',
    redirectTo: '/admin/room-posts',
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [autoLoginGuard],
    loadComponent: () =>
      import('./auth/session-redirect.component').then((m) => m.SessionRedirectComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
