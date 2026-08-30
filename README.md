# Recovery Island

## Supabase

This project now uses Supabase for authentication and user data storage.
Participants sign in with a **Study ID + password**, never an email address —
see "Study ID login" below.

## Environment Variables

Add these to `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` if you want the AI companion working locally
- `SUPABASE_SERVICE_ROLE_KEY` (server-only) — enables "Delete my account permanently" in Settings and the admin Excel export. Get it from Supabase Dashboard → Project Settings → API → `service_role` secret. Without it, account deletion shows a friendly "not configured" message; "Erase all my data" works either way.
- `ADMIN_EXPORT_KEY` (server-only) — a password you choose, required to use the admin Excel export at `/admin-export`. Pick something long and random; anyone with this key can download all participant data.

## Development

- `npm run dev` starts the Vite client.
- `npm run build` builds the client.

## Data Model

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor to create the required tables and policies.

- user accounts and profile data (including `study_id`)
- villa entries for mood, wellness, assessments, and concierge activity

## Study ID login

Participants never enter or see a real email address. `AuthContext` maps
their Study ID to a synthetic address (`<studyid>@participants.recoveryisland.local`)
before calling Supabase Auth, and `profiles.study_id` is the identity shown
everywhere in the app.

**One-time setup required in the Supabase dashboard:** go to
Authentication → Providers → Email and turn **off** "Confirm email". Since
the synthetic address can't receive mail, sign-up will otherwise hang
waiting for a confirmation email that never arrives.

If migrating an existing project, see the commented migration block at the
top of `supabase/schema.sql` for adding `study_id` to an already-populated
`profiles` table.

## Admin Excel export

Visit `/admin-export`, enter the `ADMIN_EXPORT_KEY` you set on the server,
and download a single `.xlsx` workbook with every participant's data
(Profiles, Mood, Journal, Assessments, Sleep, Movement, Nourishment sheets),
identified only by Study ID. This route is not linked from the app's
navigation — share the URL only with the research team.
