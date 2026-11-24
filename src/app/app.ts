import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <div class="app-shell">
      <app-header />
      <main class="app-main content-width">
        <router-outlet />
      </main>
      <footer class="app-footer">
        <div class="footer-content content-width">
          <span class="footer-brand">JS-ON, Event Manager</span>
          <button type="button" class="secondary-action" (click)="openDemoAdmin()">
            Open demo admin
          </button>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  `,
})
export class App {
  private readonly router = inject(Router);

  openDemoAdmin() {
    localStorage.setItem('isAdmin', 'true');
    return this.router.navigate(['/admin/create']);
  }
}
