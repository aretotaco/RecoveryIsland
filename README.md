# Recovery Island

## Supabase

This project now uses Supabase for authentication and user data storage.
Participants sign in with a **Study ID + password that the study team sets
in advance** — there is no self-registration, no email address, and no
self-service password change. See "Study ID login" and "Managing
participant logins" below.

## Environment Variables

Add these to `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` if you want the AI companion working locally
- `SUPABASE_SERVICE_ROLE_KEY` (server-only) — required for the admin Excel export and for `scripts/manage-participants.mjs`. Get it from Supabase Dashboard → Project Settings → API → `service_role` secret. Never expose this to the browser or commit it.
- `ADMIN_EXPORT_KEY` (server-only) — a password you choose, required to use the admin Excel export at `/admin`. Pick something long and random; anyone with this key can download all participant data.

## Development

- `npm run dev` starts the Vite client.
- `npm run build` builds the client.

## Data Model

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor to create the required tables and policies.

- user accounts and profile data (including `study_id`)
- villa entries for mood, wellness, assessments, and concierge activity

## Study ID login

Participants never enter or see a real email address, and there is no sign-up
form in the app. `AuthContext` maps a Study ID to a synthetic address
(`<studyid>@participants.recoveryisland.local`) before calling Supabase Auth,
and `profiles.study_id` is the identity shown everywhere in the app. Accounts
are created ahead of time by the study team (see "Managing participant
logins" below) — participants can only sign in, they cannot register,
change their password, export their data, or delete their account from the
app.

**One-time setup required in the Supabase dashboard:**

1. Go to Authentication → Providers → Email and turn **off** "Allow new
   users to sign up" (sometimes labelled "Enable sign ups"). This is
   important even though the app's own sign-up UI has been removed — it
   stops someone from calling Supabase's public sign-up API directly with
   the anon key.
2. Turn **off** "Confirm email" too. Since Study ID logins use a synthetic
   address that can't receive mail, and `scripts/manage-participants.mjs`
   already marks accounts as confirmed on creation, this just avoids any
   edge cases where confirmation would otherwise block sign-in.

If migrating an existing project, see the commented migration block at the
top of `supabase/schema.sql` for adding `study_id` to an already-populated
`profiles` table. Re-run the whole `supabase/schema.sql` script (it's safe to
run again) if you're upgrading from an older version of this project — it
now also tightens row-level security so participants can read/write only
their own rows and can never delete rows via the API, even directly.

## Managing participant logins

There's no self-registration, so every participant's Study ID + password is
set up in advance by the study team, using one of these two options:

**Option A — one at a time, via the Supabase dashboard**

Go to Authentication → Users → "Add user", and create a user with:
- Email: `<studyid-in-lowercase>@participants.recoveryisland.local` (e.g. `p001@participants.recoveryisland.local`)
- Password: whatever you want to hand out for that participant
- Tick "Auto Confirm User"

No other fields are required — the app derives the Study ID from the email
the first time that participant signs in.

**Option B — bulk add/update, via an Excel file**

```
npm run participants
```

The first run creates `scripts/participants.xlsx` (with "Study ID" and
"Password" column headers plus two example rows) and stops. Open that file,
replace the example rows with your real participant list, save it, then run
`npm run participants` again. This creates any new participants and updates
the password for any that already exist (matched by Study ID) — handy for
onboarding a whole cohort at once or rotating passwords later. It requires
`SUPABASE_SERVICE_ROLE_KEY` in `.env`, and `participants.xlsx` is already
git-ignored since it contains real passwords — only ever run this locally by
the study team, never expose it as an app feature.

You can point it at a different file too: `npm run participants -- path/to/other-file.xlsx`.

## Admin Excel export

Visit `/admin`, enter the `ADMIN_EXPORT_KEY` you set on the server,
and download a single `.xlsx` workbook with every participant's data
(Profiles, Mood, Journal, Assessments, Sleep, Movement, Nourishment sheets),
identified only by Study ID. This route is not linked from the app's
navigation — share the URL only with the research team.
