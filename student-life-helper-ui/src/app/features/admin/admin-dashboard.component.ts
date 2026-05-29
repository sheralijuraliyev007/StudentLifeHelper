import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="card">
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Student Life Helper admin panel.</p>
    </div>
  `,
  styles: [`
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(15, 23, 42, .08); }
    h2 { margin: 0 0 8px; }
    p { margin: 0; color: #6b7280; }
  `],
})
export class AdminDashboardComponent {}
