import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import seed from '../../db.json' with { type: 'json' };

export const config = { path: '/api/*' };

const databaseKey = 'database';
const eventTextFields = ['title', 'description', 'date', 'location', 'image'];

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

async function readSnapshot(store) {
  const options = { type: 'json' };
  const snapshot = await store.getWithMetadata(databaseKey, options);
  if (snapshot) return snapshot;

  const initial = await store.setJSON(databaseKey, seed, { onlyIfNew: true });
  if (initial.modified) return { data: structuredClone(seed), etag: initial.etag };
  return store.getWithMetadata(databaseKey, options);
}

async function updateDatabase(store, change) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, etag } = await readSnapshot(store);
    const response = change(data);
    if (!response.ok) return response;

    const result = await store.setJSON(databaseKey, data, { onlyIfMatch: etag });
    if (result.modified) return response;
  }

  return json({ error: 'Concurrent changes prevented saving. Please try again.' }, 503, {
    'Retry-After': '1',
  });
}

function createEvent(body) {
  if (!eventTextFields.every((field) => typeof body[field] === 'string' && body[field].trim())) {
    return null;
  }
  if (body.description.length < 10 || !Number.isFinite(Date.parse(body.date))) return null;
  if (!Array.isArray(body.speakers) || !body.speakers.every((name) => typeof name === 'string')) {
    return null;
  }

  const { title, date, description, location, image, speakers } = body;
  return { id: randomUUID(), title, date, description, location, image, speakers };
}

export default async function api(request) {
  const url = new URL(request.url);
  const route = /^\/api\/(events|tickets)(?:\/([\w-]+))?\/?$/.exec(url.pathname);
  if (!route) return json({ error: 'Unknown endpoint.' }, 404);
  const [, collection, id] = route;
  if (collection === 'tickets' && id) return json({ error: 'Unknown endpoint.' }, 404);

  const allowed = id ? ['GET', 'DELETE'] : ['GET', 'POST'];
  if (!allowed.includes(request.method)) {
    return json({ error: 'Method not allowed.' }, 405, { Allow: allowed.join(', ') });
  }

  const store = getStore({ name: 'js-on-event-manager', consistency: 'strong' });
  if (request.method === 'GET') {
    const { data } = await readSnapshot(store);
    if (collection === 'tickets') return json(data.tickets);
    if (id) {
      const event = data.events.find((item) => item.id === id);
      return event ? json(event) : json({ error: 'Event not found.' }, 404);
    }

    const query = url.searchParams.get('q')?.toLowerCase();
    if (!query) return json(data.events);
    const matches = data.events.filter((event) =>
      Object.values(event).flat().some((value) => String(value).toLowerCase().includes(query)),
    );
    return json(matches);
  }

  if (request.method === 'DELETE') {
    return updateDatabase(store, (data) => {
      const index = data.events.findIndex((event) => event.id === id);
      if (index === -1) return json({ error: 'Event not found.' }, 404);
      data.events.splice(index, 1);
      data.tickets = data.tickets.filter((ticket) => ticket.eventId !== id);
      return json({});
    });
  }

  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Expected an application/json request.' }, 415);
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 64 * 1024) return json({ error: 'Request too large.' }, 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Expected a JSON object.' }, 400);
  }

  if (collection === 'events') {
    const event = createEvent(body);
    if (!event) return json({ error: 'Invalid event fields.' }, 400);
    return updateDatabase(store, (data) => {
      data.events.push(event);
      return json(event, 201);
    });
  }

  if (typeof body.eventId !== 'string' || !body.eventId) {
    return json({ error: 'A ticket needs an eventId.' }, 400);
  }
  const ticket = { id: randomUUID(), eventId: body.eventId };
  return updateDatabase(store, (data) => {
    if (!data.events.some((event) => event.id === ticket.eventId)) {
      return json({ error: 'Event not found.' }, 404);
    }
    data.tickets.push(ticket);
    return json(ticket, 201);
  });
}
