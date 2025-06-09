# VetCEE Portal Project

## Setup

1. Copy `.env.example` to `.env` and provide your own credentials. Set `NEXT_PUBLIC_PAYLOAD_ADMIN_URL` to the URL of your Payload CMS admin panel.
2. Install dependencies with `npm install`.
3. Run the development server using `npm run dev`.

Admin users can access the Payload CMS dashboard at `/cms`. The page embeds the admin interface defined by `NEXT_PUBLIC_PAYLOAD_ADMIN_URL` and is restricted to users with `AdminFull` or `AdminReadOnly` roles.
