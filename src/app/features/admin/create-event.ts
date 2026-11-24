import { Component, inject, signal } from '@angular/core';
import { debounce, disabled, form, FormField, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { EventsService } from '../../core/events.service';
import { DevFestEvent } from '../../models/event.model';

interface CreateEventForm extends Omit<DevFestEvent, 'id'> {}

@Component({
  selector: 'app-create-event',
  imports: [FormField],
  styleUrl: './create-event.css',
  template: `
    <section class="create-page" aria-labelledby="create-title">
      <h1 id="create-title" class="page-title">Create an event</h1>

      <form (submit)="onSubmit($event)" class="event-form">
        @let titleError = form.title().touched() && form.title().invalid();
        @let descriptionError = form.description().touched() && form.description().invalid();

        <div class="form-field">
          <label for="create-event-title">Event title</label>
          <input
            id="create-event-title"
            class="field-input"
            [formField]="form.title"
            [attr.aria-invalid]="titleError || null"
            [attr.aria-describedby]="titleError ? 'title-error' : null"
            type="text"
            placeholder="e.g. Angular Workshop"
          />
          @if (titleError) {
            <p id="title-error" class="form-error">{{ form.title().errors()[0].message }}</p>
          }
        </div>

        <div class="form-field">
          <label for="create-event-description">Description</label>
          <textarea
            id="create-event-description"
            class="field-input"
            [formField]="form.description"
            [attr.aria-invalid]="descriptionError || null"
            [attr.aria-describedby]="descriptionError ? 'description-error' : null"
            rows="4"
          ></textarea>
          @if (descriptionError) {
            <p id="description-error" class="form-error">
              {{ form.description().errors()[0].message }}
            </p>
          }
        </div>

        <div class="form-field-grid">
          <div class="form-field">
            <label for="create-event-date">Date and time</label>
            <input
              id="create-event-date"
              class="field-input"
              [formField]="form.date"
              type="datetime-local"
            />
          </div>
          <div class="form-field">
            <label for="create-event-location">Location</label>
            <input
              id="create-event-location"
              class="field-input"
              [formField]="form.location"
              type="text"
            />
          </div>
        </div>

        <fieldset class="speakers">
          <legend>Speakers</legend>

          @for (speaker of eventData().speakers; track $index) {
            <div class="speaker-row">
              <label class="sr-only" [for]="'speaker-' + $index">Speaker {{ $index + 1 }}</label>
              <input
                [id]="'speaker-' + $index"
                class="field-input"
                [formField]="form.speakers[$index]"
                type="text"
                placeholder="Speaker name"
              />
              <button
                type="button"
                class="secondary-action remove-speaker"
                [attr.aria-label]="'Remove speaker ' + ($index + 1)"
                (click)="removeSpeaker($index)"
              >
                Remove
              </button>
            </div>
          }

          <button type="button" (click)="addSpeaker()" class="secondary-action">Add speaker</button>
        </fieldset>

        <div class="form-actions">
          <button type="button" class="secondary-action">Cancel</button>
          <button type="submit" [disabled]="form().invalid()" class="primary-action">
            Create event
          </button>
        </div>
      </form>
    </section>
  `,
})
export class CreateEvent {
  private readonly eventService = inject(EventsService);
  private readonly router = inject(Router);

  readonly eventData = signal<CreateEventForm>({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    speakers: [],
    image: '/images/event4.png',
  });

  readonly form = form(this.eventData, (root) => {
    required(root.title, { message: 'Title is required' });
    debounce(root.description, 1000);
    disabled(root.description, ({ valueOf }) => !valueOf(root.title));
    required(root.description, { message: 'Description is required' });
    minLength(root.description, 10, { message: 'Description must be at least 10 chars' });
    required(root.date, { message: 'Date is required' });
    required(root.location, { message: 'Location is required' });
  });

  addSpeaker() {
    this.eventData.update((current) => ({
      ...current,
      speakers: [...current.speakers, ''],
    }));
  }

  removeSpeaker(index: number) {
    this.eventData.update((current) => ({
      ...current,
      speakers: current.speakers.filter((_, i) => i !== index),
    }));
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (this.form().invalid()) return;

    const payload = this.eventData();

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        alert('Event Created!');
        this.router.navigate(['/']);
      },
      error: (err) => console.error(err),
    });
  }
}
