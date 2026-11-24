import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  styleUrl: './search-bar.css',
  template: `
    <div class="event-search" role="search" aria-label="Events">
      <label for="event-search">Search events</label>
      <div class="search-field">
        <span class="search-icon" aria-hidden="true"></span>
        <input
          id="event-search"
          class="field-input"
          type="search"
          [(ngModel)]="query"
          placeholder="Enter a name or keyword"
        />
      </div>
    </div>
  `,
})
export class SearchBar {
  query = model('');
}
