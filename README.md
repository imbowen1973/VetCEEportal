# VetCEE Portal Project

## Overview
A Next.js and Prisma based portal for VetCEE accreditation workflows.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and provide the required values.
3. Start MongoDB locally (e.g. via Docker) and push the schema:
   ```bash
   docker run --name vetcee-mongo -p 27017:27017 -d mongo
   npx prisma db push
   ```
4. Launch the development server:
   ```bash
   npm run dev
   ```

## Environment Variables
The application uses the following variables (see `.env.example`):
- `DATABASE_URL` – MongoDB connection string
- `NEXTAUTH_URL` – base URL for NextAuth
- `NEXTAUTH_SECRET` – secret used to sign tokens
- SMTP settings (`EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`)
- `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`

## Development Login
During development magic links are stored in memory instead of being emailed. After requesting a sign‑in link, call:
```bash
curl "http://localhost:3000/api/auth/dev-magic-link?email=you@example.com"
```
The endpoint returns a JSON payload containing the URL to use for login.

