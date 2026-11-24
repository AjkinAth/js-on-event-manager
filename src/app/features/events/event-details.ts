import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { EventsService } from '../../core/events.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, RouterLink, DatePipe],
  styleUrl: './event-details.css',
  template: `
    <a routerLink="/" class="back-link">Back to events</a>

    @if (eventResource.isLoading()) {
      <p class="state-panel" role="status">Loading event details…</p>
    }

    @if (eventResource.error()) {
      <p class="state-panel state-panel--error" role="status">Event not found.</p>
    }

    @if (eventResource.hasValue()) {
      @let event = eventResource.value()!;

      <article class="event-detail">
        <h1 class="page-title">{{ event.title }}</h1>

        <div class="detail-layout">
          <div class="detail-main">
            <img [src]="event.image" alt="" class="detail-cover" />

            <section class="event-description" aria-labelledby="description-heading">
              <h2 id="description-heading">About this event</h2>
              <p>{{ event.description }}</p>
            </section>
          </div>

          <aside class="booking-panel" aria-labelledby="booking-heading">
            <h2 id="booking-heading">Booking details</h2>
            <dl class="booking-facts">
              <div>
                <dt>Date</dt>
                <dd>
                  <time [attr.datetime]="event.date">{{ event.date | date: 'fullDate' }}</time>
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{{ event.location }}</dd>
              </div>
            </dl>
            <button type="button" class="primary-action" (click)="addToCart()">Buy tickets</button>
          </aside>
        </div>
      </article>
    }
  `,
})
export class EventDetails {
  private readonly eventsService = inject(EventsService);
  private readonly cartService = inject(CartService);

  readonly id = input.required<string>();
  readonly eventResource = this.eventsService.getEventResource(this.id);
  addToCart() {
    this.cartService.addTicket(this.id());
  }
}
