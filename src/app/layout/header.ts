import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  styleUrls: ['./header.css', './header-layout.css'],
  template: `
    <header class="site-header">
      <div class="header-content content-width">
        <a routerLink="/" class="brand" aria-label="JS-ON, Event Manager home">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-copy">
            <span class="brand-name">JS-ON</span>
            <span class="brand-description">Event Manager</span>
          </span>
        </a>

        <nav class="header-nav" aria-label="Main navigation">
          <a
            routerLink="/"
            routerLinkActive="is-current"
            [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"
            class="nav-link"
          >
            Events
          </a>
          <a
            routerLink="/admin/create"
            routerLinkActive="is-current"
            ariaCurrentWhenActive="page"
            class="nav-link"
          >
            Admin
          </a>
          <div class="ticket-slot">
            <button type="button" class="tickets-glass" (pointermove)="moveTicketGlass($event)">
              <span class="tickets-glass-face">Tickets: {{ cartService.count() }}</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  `,
})
export class Header {
  readonly cartService = inject(CartService);

  moveTicketGlass(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;

    const button = event.currentTarget as HTMLButtonElement;
    const bounds = button.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;

    button.style.setProperty('--tickets-drift-x', `${offsetX * -0.08}px`);
    button.style.setProperty('--tickets-drift-y', `${offsetY * -0.08}px`);
  }
}
