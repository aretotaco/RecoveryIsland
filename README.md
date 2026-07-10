# Recovery Island

## Supabase

This project now uses Supabase for authentication and user data storage.

## Environment Variables

Add these to `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` if you want the AI companion working locally

## Development

- `npm run dev` starts the Vite client.
- `npm run build` builds the client.

## Data Model

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor to create the required tables and policies.

- user accounts and profile data
- villa entries for mood, wellness, assessments, and concierge activity
