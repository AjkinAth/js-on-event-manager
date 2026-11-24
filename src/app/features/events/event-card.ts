import { DatePipe } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, RouterLink],
  styleUrl: './event-card.css',
  template: `
    <article
      class="event-card event-card-glow bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div class="event-card-image">
        <img [src]="image()" alt="" />
      </div>

      <div class="event-card-body">
        <div class="event-card-meta">
          @if (date()) {
            <time [attr.datetime]="date()">{{ (date() | date: 'mediumDate') || 'TBA' }}</time>
          } @else {
            <span>Date TBA</span>
          }

          @let days = daysUntil();
          @if (days !== null) {
            <span class="event-status" [class.event-status-past]="days < 0">
              @if (days > 0) {
                In {{ days }} {{ days === 1 ? 'day' : 'days' }}
              } @else if (days < 0) {
                Past event
              } @else {
                Happening now
              }
            </span>
          }
        </div>

        <h3 class="event-card-title">{{ title() }}</h3>

        <div class="event-card-actions">
          <div class="card-management">
            <button
              type="button"
              class="card-control card-like"
              [attr.aria-pressed]="isFavorite()"
              (click)="toggleFavorite()"
            >
              <span aria-hidden="true">{{ isFavorite() ? '♥' : '♡' }}</span>
              Like
            </button>
            <button type="button" class="card-control card-remove" (click)="removeEvent()">
              Remove
            </button>
          </div>

          <a
            [routerLink]="['/event', id()]"
            [attr.aria-label]="'View details for ' + title()"
            class="card-details"
          >
            View details
          </a>
        </div>
      </div>
    </article>
  `,
})
export class EventCard {
  title = input.required<string>();
  image = input.required<string>();
  date = input<string>();
  delete = output<void>();
  initialLike = input<boolean>(true);
  isFavorite = linkedSignal<boolean>(() => this.initialLike());
  readonly id = input.required<string>();

  removeEvent() {
    this.delete.emit();
  }
  toggleFavorite() {
    this.isFavorite.update((prev) => !prev);
  }

  daysUntil = computed(() => {
    const eventDate = this.date();
    if (!eventDate) return null;

    const today = new Date();
    const target = new Date(eventDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  });
}
