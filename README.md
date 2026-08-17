# NestBoard Web

Responsive web app for the NestBoard co-living booking platform.

## Extension Sprint features

- **F1** My Bookings — full booking flow with payment window countdown
- **F2** Saved Properties — favourites across all views
- **F3** Search/filter/pagination — infinite scroll, URL state
- **F4** Admin — property, room type, room & booking management
- **F5** Auth — API tokens with auto-refresh (no Clerk)

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
```

Requires `nestboard-api` running on port 4000 (Vite proxies `/api`).

## Demo login

- Tenant: `guest@nestboard.com` / `password123`
- Admin: `admin@nestboard.com` / `password123`

## Build

```bash
npm run build
npm run preview
```

## Environment

Create `.env` if needed:

```
VITE_API_URL=/api
```

For production, point to your deployed API URL.
