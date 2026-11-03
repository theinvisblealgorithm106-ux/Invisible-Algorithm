# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/` — it is the only app in the repo.

```bash
npm run dev          # dev server on port 3001 (NOT 3000)
npm run build        # production build — the real correctness gate
npm run type-check   # tsc --noEmit
```

- **`npm run lint` does not work.** No ESLint config is committed, so `next lint`
  drops into an interactive "How would you like to configure ESLint?" prompt and
  hangs. Use `npm run build` (which type-checks and lints the compiled graph) to
  verify changes.
- **There is no test suite** — no jest/vitest/playwright, no test script. Verify
  changes by building, and for API work by running the dev server and exercising
  the route (`curl localhost:3001/api/...`).
- `npm install` relies on `legacy-peer-deps=true` in `frontend/.npmrc` (React 19
  vs. peer ranges). Don't drop that file.

### One-off scripts

Each reads config from the env file rather than CLI args; run them from `frontend/`:

```bash
node --env-file=.env.local scripts/seed-admin.mjs <email> <password> <first> <last> [role]
node --env-file=.env.local scripts/delete-user.mjs <email>...
node --env-file=.env.local scripts/get-drive-token.mjs
```

`seed-admin.mjs` is the **only** way to create a user: there is no `/register`
route and no "create user" action in the admin panel. `delete-user.mjs` is
likewise the only hard delete — the admin panel can only deactivate.

## Architecture

### The README is out of date — trust this file instead

`README.md` describes a two-service deployment: a `backend/` Express API on
Render (port 5000) plus a Next.js frontend. **That backend no longer exists.**
It was folded into the Next.js app and deleted. Today:

- One Next.js 15 App Router application, in `frontend/`, deployed to Vercel.
- The REST API is Next.js route handlers under `src/app/api/**`, which talk to
  MongoDB Atlas directly via Mongoose.
- `NEXT_PUBLIC_API_URL` / separate-backend env vars in the README are vestigial.
  Real config lives in `frontend/.env.example`.

A previous commit also removed a Sanity CMS integration; content lives in
MongoDB. Ignore any lingering references to Sanity or to `backend/`.

### Request path

`src/lib/api.ts` is the single axios client used by every client component. It
exports one object per resource (`authApi`, `researchApi`, `teamApi`, …) — add
new endpoints there rather than calling `fetch` from a component.

Two behaviors in that file matter:

- `baseURL` is `/api` in the browser but an absolute URL on the server, because
  the same module is imported from both.
- A response interceptor transparently refreshes on `401` using the refresh
  token, then replays the original request once (`_retry`). Tokens live in
  `localStorage` (`accessToken` / `refreshToken`), and are attached as
  `Authorization: Bearer` by a request interceptor.

### API route conventions

Every route handler follows the same shape — copy an existing one
(`src/app/api/announcements/` is the clearest template):

```ts
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'announcements');   // throws a NextResponse
    await connectDB();
    const { id } = await params;                  // params is a Promise in Next 15
    ...
  } catch (err) {
    if (err instanceof NextResponse) return err;  // REQUIRED — see below
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
```

**The guard helpers in `src/lib/auth-helpers.ts` signal failure by `throw`ing a
`NextResponse`, not by returning one.** A handler that omits the
`if (err instanceof NextResponse) return err` line will convert every 401/403
into a 500. This is the single easiest mistake to make in this codebase.

Responses are uniformly `{ success, data }` or `{ success, message }`, and
clients read `res.data.data.<resource>`.

`connectDB()` (`src/lib/mongodb.ts`) caches the connection on `global._mongoose`
so serverless invocations and dev hot-reloads reuse one pool. Call it in every
handler; it's idempotent.

### Models

`src/models/*.ts` are Mongoose schemas, each exported as
`mongoose.models.X || mongoose.model<IX>('X', schema)` — the `mongoose.models`
guard prevents "model already compiled" errors across hot reloads. Keep it.

Slugs are generated in a `pre` hook. Content models (`Announcement`, `Event`,
`Research`) append `Date.now()` for uniqueness; `TeamMember` deliberately does
not, because its slug is a person's public URL.

### Permissions

`src/lib/permissions.ts` is the **single source of truth for authorization, used
by both client and server** — the admin sidebar filters nav with `canViewTab`,
pages hide buttons with `canWriteTab`, and API routes enforce the same functions
through `auth-helpers.ts`. It must therefore stay free of Next.js- and
browser-only APIs.

Adding an admin section means: add the tab name to `ADMIN_TABS`, add a nav entry
in `src/app/admin/layout.tsx`, and guard the routes with
`requireAdminTabRead/Write(req, '<tab>')`. The role rules in `canViewTab` /
`canWriteTab` are written as defaults over all tabs, so a new tab usually needs
no rule changes.

The roles are not a simple hierarchy, and the names mislead:

| Role | Reality |
|---|---|
| `super_admin` | Everything. |
| `member` | Read **and write** every tab except Users. |
| `admin` | The **tech dept** role: sees everything except Users, but is **read-only everywhere**. |
| `researcher` | Research tab only; may create, but cannot moderate. |
| `student` | No admin access. |

Research moderation (publish/reject/feature/delete) is a separate check,
`canModerateResearch` — deliberately distinct from a researcher's right to
submit one.

### Executive team content

The `/team` page renders two groups from two different sources: the **executive
team** (`TeamMember` collection, editable in the admin panel's Team tab) and
**platform members** (the `User` collection, via `usersApi.getMembers`).
`/team/[id]` resolves either one — it tries the team slug first, then falls back
to a user id.

`src/lib/team.ts` is **seed data only, not what the site renders.** It is copied
into MongoDB once by `seedTeamIfEmpty()` (`src/lib/teamSeed.ts`) on the first
request to `/api/team` against an empty collection. Editing a bio there has no
effect on an already-seeded database — edit it in the admin panel. The seeder
must stay keyed on "collection is empty" so that members deleted by an admin
don't reappear.

Member photos are referenced by path or URL (`/team/name.jpeg` from
`public/team/`, or any https URL); there is no image upload, since Vercel's
filesystem is read-only at runtime.

### Research PDF uploads

Uploaded papers go to **Google Drive**, authenticated as a real user account via
an OAuth2 refresh token (`src/lib/googleDrive.ts`) — *not* a service account.
This is deliberate and documented in `.env.example`: service accounts have no
storage quota on a personal Gmail account, so they cannot write files there.
Mint the token with `scripts/get-drive-token.mjs`.

Upload is two-phase — `POST /api/research/upload/session` returns a *resumable*
Drive upload URL that the browser PUTs to directly, then
`/api/research/upload/complete` records it. Downloads
(`/api/research/[id]/pdf`) **redirect** to Drive rather than proxying the bytes.
Both sides route around the same constraint: Vercel function request and
response bodies cap at 4.5MB, so paper PDFs must never pass through a handler.
That route also gates unpublished papers behind `requireAdminTabRead`.

### Styling

Tailwind with a custom cream/blue/orange palette defined as **semantic tokens**
in `tailwind.config.js` (`bg-subtle`, `text-tertiary`, `accent-green`, …) — use
those names, not raw hex or default Tailwind colors. Repeated component classes
(`card`, `card-hover`, `btn-primary`, `btn-ghost`, `input-base`, `badge`,
`label`, `heading-lg`) are `@layer components` definitions in
`src/app/globals.css`; prefer them over re-deriving utility strings.

Admin pages share one layout (`src/app/admin/layout.tsx`) that handles the auth
redirect, nav filtering, and the read-only badge. Admin CRUD screens are a
table plus a modal form, all client components with `react-hot-toast` for
feedback — follow `src/app/admin/announcements/page.tsx`.

### Environment

All config is `frontend/.env.local` (git-ignored; see `frontend/.env.example`
for the annotated list). The same names must be set in Vercel project settings.
`MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are required for the app
to boot; the `GOOGLE_OAUTH_*` + `GOOGLE_DRIVE_FOLDER_ID` set is required only
for research uploads.
