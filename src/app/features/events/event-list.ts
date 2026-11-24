import { Component, inject, signal } from '@angular/core';
import { EventsService } from '../../core/events.service';
import { EventCard } from './event-card';
import { SearchBar } from './search-bar';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, SearchBar],
  styleUrl: './event-list.css',
  template: `
    <header class="events-hero">
      <div class="hero-content">
        <h1 class="page-title hero-title">Explore events</h1>
        <p class="hero-description">Search by name, topic, or venue.</p>
        <app-search-bar [(query)]="searchQuery" />
      </div>
    </header>

    <section class="events-listing" aria-labelledby="event-list-title">
      <div class="listing-heading">
        <h2 id="event-list-title">Event listings</h2>
        <p class="result-count" role="status" aria-atomic="true">
          @if (events.isLoading()) {
            Loading events…
          } @else if (events.error()) {
            Events unavailable
          } @else if (events.hasValue()) {
            @let count = events.value().length;
            {{ count }} {{ count === 1 ? 'event' : 'events' }}
          }
        </p>
      </div>

      @if (events.error()) {
        <p class="state-panel state-panel--error">
          Couldn’t load events. Refresh the page to try again.
        </p>
      } @else if (events.hasValue()) {
        @if (events.value().length) {
          <ul class="event-grid" role="list">
            @for (event of events.value(); track event.id) {
              <li>
                <app-event-card
                  [id]="event.id"
                  [title]="event.title"
                  [date]="event.date"
                  [image]="event.image"
                  (delete)="deleteEvent(event.id)"
                />
              </li>
            }
          </ul>
        } @else {
          <p class="state-panel">
            {{ searchQuery() ? 'No events match your search.' : 'There are no events to show.' }}
          </p>
        }
      }
    </section>
  `,
})
export class EventList {
  readonly console = console;
  searchQuery = signal<string>('');
  private eventsService = inject(EventsService);

  events = this.eventsService.getEventsResource(this.searchQuery);
  deleteEvent(id: string) {
    if (!confirm('Are you sure?')) return;

    this.eventsService.deleteEvent(id).subscribe({
      next: () => {
        this.events.reload();
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Could not delete event');
      },
    });
  }
}
