# 🌸 Aashmi Beauty Parlour

A full-stack beauty parlour website with a customer-facing booking experience and an owner/admin dashboard.

## Features

### Customer website
- Browse parlour services, categories, offers and gallery.
- Book appointments with service, date and available time selection.
- Track and request cancellation of a booking.
- View parlour information and contact the parlour through WhatsApp.

### Admin dashboard
- Admin login and protected dashboard.
- View and manage appointments, including walk-in bookings.
- Manage services, categories, staff, business hours and holidays.
- Manage offers, gallery, reviews and website settings.
- View reports and export appointment data as CSV.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts and Lucide.
- **Backend:** Node.js, Express and TypeScript.
- **Authentication:** JWT and bcrypt.
- **Current data storage:** JSON file (`server/data/beauty_parlour.db.json`).
- **Optional integration:** WhatsApp Cloud API (only when credentials are configured).

## Repository layout

```text
.
├── client/                 # React + Vite frontend
│   ├── public/
│   └── src/
├── server/                 # Express + TypeScript API
│   ├── data/               # Local JSON data store
│   ├── src/
│   └── uploads/            # Runtime uploads (not committed)
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## Requirements

- Node.js 20 or newer (Node.js 22 LTS recommended)
- npm

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   cd YOUR-REPOSITORY
   ```

2. Install dependencies:

   ```bash
   npm run install:all
   ```

3. Create environment files:

   - Copy `.env.example` to `server/.env` and set the backend values.
   - Create `client/.env` containing `VITE_API_URL=http://localhost:5000/api`.

   On Windows PowerShell:

   ```powershell
   Copy-Item server/.env.example server/.env
   Set-Content client/.env "VITE_API_URL=http://localhost:5000/api"
   ```

4. Start frontend and backend together:

   ```bash
   npm run dev
   ```

5. Open:
   - Customer site: http://localhost:5173
   - Admin login: http://localhost:5173/admin/login
   - API health check: http://localhost:5000/api/health

The server initializes its local JSON database on first startup if the data file does not exist.

## Environment variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port; use `5000` locally. |
| `NODE_ENV` | `development` locally; `production` on hosting. |
| `JWT_SECRET` | Long, random, private signing secret. |
| `CLIENT_URL` | Deployed frontend origin, e.g. `https://your-site.vercel.app`. |
| `ADMIN_DEFAULT_EMAIL` | Intended initial admin email; check the seed implementation before relying on this value. |
| `ADMIN_DEFAULT_PASSWORD` | Intended initial admin password; check the seed implementation before relying on this value. |
| `WHATSAPP_CLOUD_API_TOKEN` | Optional Meta WhatsApp Cloud API token. |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional Meta WhatsApp phone-number ID. |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Public backend API base URL, including `/api`, e.g. `https://your-api.onrender.com/api`. |

**Never put backend secrets in `client/.env` or any variable prefixed with `VITE_`.** Vite embeds `VITE_` variables in browser code.

## Deploy the frontend to Vercel

This repository is configured for a Vercel frontend deployment. The Express API is a separate service; Vercel will host the Vite-built frontend only.

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project** and import the GitHub repository.
3. Keep the project root directory as `./`.
4. Use these settings (also defined in `vercel.json`):

   | Vercel setting | Value |
   |---|---|
   | Framework preset | Vite (or Other) |
   | Install command | `npm install --prefix client` |
   | Build command | `npm run build --prefix client` |
   | Output directory | `client/dist` |
   | Root directory | `./` |

5. Add this environment variable in Vercel → Project → Settings → Environment Variables:

   ```text
   VITE_API_URL=https://YOUR-BACKEND-HOST/api
   ```

6. Deploy (or redeploy after changing environment variables).

Do not set `VITE_API_URL` to `localhost` in production.

## Deploy the backend

Deploy `server/` as a separate Node.js web service (for example, on Render):

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add the backend variables listed above in the hosting provider's environment-variable settings.
- Set `CLIENT_URL` to your exact Vercel frontend URL.
- After the backend is live, set Vercel's `VITE_API_URL` to `https://YOUR-BACKEND-HOST/api` and redeploy the frontend.

The API health endpoint is `/api/health`.

### Important data persistence limitation

The current backend reads and writes a JSON file on the server's local filesystem. Many cloud hosting filesystems are ephemeral, and serverless functions may not preserve local files between invocations. Therefore, **do not treat the current JSON-file backend as production-ready for real customer bookings**.

Before using this live for customers, migrate the database operations to a managed persistent database (the repository includes a Supabase SQL schema at `server/src/db/supabase_schema.sql`, but the application is not yet wired to Supabase), or use a hosting plan with a correctly configured persistent disk and verify that writes survive restarts and redeployments. Uploaded files also need persistent/object storage in production.

## Security checklist before going live

- [ ] Replace any demo/default admin credentials and verify how the seed code creates the initial admin. The current seed implementation contains a hard-coded demo password; changing `.env` alone does not override that code.
- [ ] Generate a strong random `JWT_SECRET`; never commit it.
- [ ] Remove all real customer data and test bookings from the repository.
- [ ] Restrict backend CORS to the actual frontend domain instead of allowing every origin.
- [ ] Use a persistent production database and persistent/object storage for uploads.
- [ ] Keep WhatsApp tokens and all private keys only in backend environment variables.
- [ ] Test booking creation, availability, authentication and admin access on the deployed URLs.

## Useful commands

```bash
# Start frontend and backend in development
npm run dev

# Build frontend and backend
npm run build

# Build frontend only
npm run build --prefix client

# Build backend only
npm run build --prefix server

# Start compiled backend (run after building server)
npm start --prefix server
```

## License

Choose and add a license before accepting external contributions or distributing this project.
