# JS-ON, Event Manager

[Open the live event directory](https://js-on-event-manager.netlify.app/)

JS-ON is an Angular 21 application for browsing developer events, recording ticket bookings, and creating events. The browser handles routing and form validation. The REST API persists data in [db.json](./db.json) during local development and in Netlify Blobs on the hosted demo.

## Run locally

Use Node.js 24 and npm 10.9.2. Run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open the [event directory](http://localhost:4200). The same command starts the [events API](http://localhost:3000/events) on port 3000. The API simulates two seconds of latency per request, so you can observe loading states and the ticket counter updating before a write finishes. Creating an event, removing one, or booking a ticket changes your local `db.json`.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Browse and search events. Each card links to its detail page, keeps a temporary Like state, and offers removal after confirmation. |
| `/event/:id` | View the event description, date, and venue. **Buy tickets** records one ticket for the displayed event per click. |
| `/admin/create` | Create an event with a title, description, date and time, location, and optional speakers. A successful submission returns to the directory. |

The footer’s **Open demo admin** button stores the string `"true"` under `isAdmin` in the browser’s local storage and opens the creation form. The route guard reads that flag on navigation. It controls browser access to the form only. The JSON Server API accepts writes without authentication. [Footer implementation](./src/app/app.ts) · [Route guard](./src/app/core/auth.guard.ts)

## Data flow

- **Event reads and writes.** A search signal drives an Angular `httpResource`, so changing the query fetches a new list. The detail view uses the route’s `id` as its resource input. Event creation and removal use `HttpClient` and return RxJS observables. [EventsService](./src/app/core/events.service.ts)
- **Ticket accounting.** On startup, `CartService` loads the ticket records and derives the header count from their event IDs. Booking immediately increments that count and posts the event ID to the API. If the write fails, the service restores its previous state. Each record counts as one ticket, including repeated bookings for the same event. The header displays the shared total across all users of that API. [CartService](./src/app/core/cart.service.ts)
- **Form validation.** The creation screen uses Angular Signal Forms. Title, date, location, and a description of at least ten characters are required. Speaker fields can be added or removed. [CreateEvent](./src/app/features/admin/create-event.ts)
- **Styling.** Tailwind CSS 4 and shared theme variables supply the base styles. A conic gradient animates the event-card border. The ticket counter uses pointer position to shift its glass surface. [Theme](./src/theme.css) · [Card animation](./src/styles.css) · [Ticket counter](./src/app/layout/header.css)

## REST API

The browser calls these paths under `/api` on its own origin. During local development, the Angular dev server forwards requests to JSON Server on port 3000. On Netlify, a function handles the same paths. [Development proxy](./proxy.conf.json) · [Hosted API](./netlify/functions/api.mjs)

| Method | Path | Request or result |
| --- | --- | --- |
| GET | `/events` | List events. Add `?q=Angular` for a full-text search. |
| GET | `/events/:id` | Read one event. |
| POST | `/events` | Send `title`, `description`, `date`, `location`, `speakers`, and `image`. The server assigns the ID. |
| DELETE | `/events/:id` | Remove the event. |
| GET | `/tickets` | List persisted ticket records. |
| POST | `/tickets` | Send a JSON object such as `{"eventId":"1"}` to record one booking. |

Event IDs are strings. The `speakers` field is an array of names, `date` is a date-time string, and `image` is a URL or a public asset path such as `/images/event4.png`. [Event model](./src/app/models/event.model.ts) · [Bundled images](./public/images/)

## Build and test

| Command | Purpose |
| --- | --- |
| `npm start` | Run the Angular development server by itself. |
| `npm run server` | Run the JSON API by itself. |
| `npm run build` | Generate the production browser bundle in `dist/devfest-manager/browser/`. |
| `npm run watch` | Rebuild the development bundle on file changes. |
| `npm test` | Run the Angular CLI unit-test target with Vitest. The repository currently contains no test specs. |

## Netlify deployment

Netlify runs `npm run build`, publishes `dist/devfest-manager/browser`, and routes Angular deep links to `index.html`. The function under `/api/*` seeds a site-wide Netlify Blobs store from `db.json` on first use. Subsequent deploys reuse the same stored events and tickets. All visitors share this demo data and can create or remove events. [Deployment configuration](./netlify.toml)

## License

[MIT](./LICENSE)
