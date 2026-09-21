<div align="center">
  <h1>CartG</h1>
  <p><strong>Digital storefront and operations dashboard for a modern neighbourhood supermarket.</strong></p>
  <p>Groceries, stationery, household essentials, express delivery, online ordering, and admin operations in one focused experience.</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.8" />
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Supabase-enabled-3ecf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase enabled" />
</p>

## Overview

CartG is a full-stack web application for a supermarket business. Customers can browse a product catalogue, manage a cart, place delivery orders, submit reviews, and contact the store. Authenticated administrators can manage products, services, gallery content, reviews, enquiries, orders, business information, and administrator accounts.

The application consists of:

- A React and Vite storefront with responsive layouts and an admin interface.
- An Express server that serves the application in production and exposes protected `/api` admin endpoints.
- Supabase Auth, Postgres, Realtime, and Storage integrations.
- A local admin registry used by the current Express backend for administrator directory management.

## Features

- Product catalogue with categories, search, deals, and cart management.
- Checkout flow for delivery orders and customer contact details.
- Supabase-backed orders with realtime updates for operations teams.
- Supabase Auth administrator login and role-aware admin tools.
- Product and store image uploads through Supabase Storage.
- Business profile, services, gallery, reviews, enquiries, and settings management.
- Responsive customer-facing storefront for desktop and mobile screens.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project for persistent orders and administrator authentication

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Add the required Supabase values to `.env`.

4. Start the application:

   ```bash
   npm run dev
   ```

   The development server runs the Vite middleware and Express API together. Open `http://localhost:3000` in a browser.

## Environment Variables

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Browser and server | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser and server | Public Supabase publishable/anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin account management | Server only | Secret Supabase service-role key used for privileged Auth operations. |
| `VITE_API_URL` | Optional | Browser | API base URL when the frontend and backend are hosted separately. |
| `GEMINI_API_KEY` | Optional | Optional integrations | Gemini API key if AI functionality is enabled. |
| `APP_URL` | Optional | Hosting integrations | Public application URL where required by the hosting environment. |

Never commit `.env`, service-role keys, passwords, or other secrets. A `VITE_` variable is exposed to the browser, so only public values belong in variables with that prefix. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side.

## Supabase Setup

1. Create a Supabase project.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.
3. Run [`supabase_orders_schema.sql`](supabase_orders_schema.sql) in the Supabase SQL Editor.
4. Configure Supabase Auth users for administrator access.
5. Create Storage buckets named `product-images` and `store-photos` if image uploads are required.
6. Add `SUPABASE_SERVICE_ROLE_KEY` only to the server environment when administrator account creation or deletion is needed.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Vite and Express. |
| `npm run build` | Build the Vite frontend and bundle the Express server into `dist/server.cjs`. |
| `npm start` | Run the production bundle using `.env`. |
| `npm run preview` | Preview the Vite frontend build locally. |
| `npm run lint` | Run the TypeScript compiler without emitting files. |
| `npm run clean` | Remove generated build output. |

## API Reference

The Express backend uses the `/api` prefix. Unless stated otherwise, successful responses are JSON. Protected endpoints require the current Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
```

### `GET /api/health`

Returns backend and Supabase configuration status. This endpoint does not require authentication.

Example response:

```json
{
   "status": "ok",
   "service": "CartG Admin Backend",
   "supabaseConfigured": true,
   "serviceRoleConfigured": true,
   "serviceRoleRole": "service_role",
   "isProperServiceRole": true
}
```

### `POST /api/admin/authorize`

Validates a Supabase access token and checks whether the user is an authorized CartG administrator. The token must be sent in the `Authorization` header. On success, the endpoint registers or updates the administrator in the local admin directory.

Success response:

```json
{
   "authorized": true,
   "user": {
      "id": "user-id",
      "email": "admin@example.com",
      "name": "Administrator",
      "role": "superadmin",
      "status": "active"
   }
}
```

Possible errors include `401` for a missing or invalid token and `403` for a customer, deactivated user, or unauthorized account.

### `GET /api/admin/list-users`

**Authentication:** Required.

Returns the administrator directory. When configured, the endpoint synchronizes records with Supabase Auth and the optional `list_admin_users` RPC function.

Success response:

```json
{
   "success": true,
   "accounts": [
      {
         "id": "user-id",
         "email": "admin@example.com",
         "name": "Administrator",
         "role": "superadmin",
         "status": "active",
         "avatarUrl": "",
         "lastLogin": "Never logged in",
         "createdAt": "Jan 1, 2026"
      }
   ]
}
```

### `POST /api/admin/create-user`

**Authentication:** Required.

Creates an administrator in Supabase Auth when the service-role key is available, then records the account in the admin directory.

Request body:

```json
{
   "name": "Store Manager",
   "email": "manager@example.com",
   "password": "strong-password",
   "role": "editor"
}
```

`role` accepts `editor` or `superadmin`; any other value defaults to `superadmin`. The password must contain at least six characters.

### `POST /api/admin/toggle-user-status`

**Authentication:** Required.

Activates or deactivates an administrator in the local directory and, when available, in Supabase Auth. An administrator cannot deactivate their own active account.

Request body:

```json
{
   "id": "user-id",
   "status": "deactivated"
}
```

`status` accepts `active` or `deactivated`.

### `POST /api/admin/delete-user`

**Authentication:** Required.

Deletes an administrator from Supabase Auth when the service-role key or configured RPC is available, and removes the account from the local admin directory.

Request body:

```json
{
   "id": "user-id",
   "email": "admin@example.com"
}
```

At least one of `id` or `email` is required. The endpoint prevents self-deletion and prevents deleting the only active `superadmin` account.

### `ALL /api/*`

JSON fallback for unknown API routes. It returns HTTP `404` with:

```json
{
   "success": false,
   "error": "API endpoint not found."
}
```

## Production Deployment

The full application requires a Node-capable host because the Express server handles the `/api` routes and serves the production frontend. A traditional Node deployment on platforms such as Render, Railway, or Fly.io should run:

```bash
npm install
npm run build
npm start
```

Set the production environment variables in the host dashboard and make sure the service exposes the host-provided port if the deployment platform requires one.

### Vercel

The Vite frontend can be deployed to Vercel as a static build. The current project does not include a Vercel serverless API entrypoint, so deploying it to Vercel alone will not make the Express `/api` admin routes available. For a complete deployment, host the Express backend separately and set `VITE_API_URL` to its public URL, or first adapt the backend to Vercel Functions.

Also note that the current `admins_registry.json` file is local filesystem storage. It is not suitable as persistent storage in a serverless environment. Use Supabase or another managed database for production administrator records.

## Project Structure

```text
.
├── src/
│   ├── components/       Customer and admin UI components
│   ├── context/          Shared application state and actions
│   ├── data/             Default storefront data
│   ├── hooks/            Reusable data hooks
│   ├── types/            TypeScript domain types
│   └── utils/            Storage, theme, and integration helpers
├── assets/               Static project assets
├── server.ts             Express API and production server
├── supabase_orders_schema.sql
├── vite.config.ts
└── package.json
```

## Security Notes

- Do not commit `.env` or any file containing secret credentials.
- Treat the Supabase service-role key as highly sensitive and rotate it if exposed.
- Review Supabase Row Level Security policies before production launch.
- Replace local JSON persistence with managed storage before using multiple server instances or serverless hosting.

## License

This project is private and does not currently declare an open-source license.
