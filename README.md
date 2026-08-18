# Copenhagen Moving Sale

A production-ready personal second-hand sales site for a Copenhagen moving sale. Buyers browse one public URL, while the owner manages listings from a protected `/admin` dashboard without editing source code.

## Features

- Mobile-first public catalogue with search, category filters, status filters, and price sorting.
- Item pages at `/item/[slug]` with gallery, pickup info, retail reference link, contact button, share button, and Open Graph metadata.
- Clear price hierarchy with `My price`, `Current retail price`, calculated savings, and calculated discount percentage.
- Supabase-backed admin dashboard at `/admin` for create, edit, delete, duplicate, status changes, visibility, listing order, and image upload/reordering.
- Supabase Postgres, Auth, Row Level Security, and public Storage bucket for listing images.
- Vercel-compatible Next.js app using TypeScript and Tailwind CSS.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local` with your Supabase project URL and anon key.

4. Start the dev server:

```bash
npm run dev
```

The public homepage is `http://localhost:3000`. The private dashboard is `http://localhost:3000/admin`.

Without Supabase environment variables, the public site shows sample items so the layout can still be reviewed locally. The admin dashboard requires Supabase.

## Supabase Setup

1. Create a new Supabase project.
2. Open SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. Confirm that a public Storage bucket named `item-images` exists.
4. In Authentication, enable Email/Password sign-in.
5. Copy the Project URL and anon key into `.env.local`.

The migration creates:

- `items`
- `item_images`
- `profiles`
- `app_settings`
- `item-images` Storage bucket
- RLS policies allowing public reads of visible listings and admin-only writes

## Admin Account Setup

1. In Supabase Authentication, create your user with email and password.
2. In SQL Editor, grant admin access:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

3. Sign in at `/admin`.

Only users with `profiles.is_admin = true` can create, update, delete, upload photos, or change settings.

## Listing Management

From `/admin`, you can:

- Add and edit listings.
- Upload images by choosing files or dragging them onto the upload area.
- Reorder photos, delete photos, and set a primary image.
- Change prices and retail reference details.
- Mark listings `Available`, `Reserved`, or `Sold`.
- Hide or show listings.
- Duplicate a listing as a hidden draft.
- Reorder homepage listings.
- Toggle whether sold listings are hidden from the homepage.

Savings and discount percentages are calculated automatically from:

```text
savings = current_retail_price - selling_price
discount = savings / current_retail_price * 100
```

## Vercel Deployment

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CONTACT_EMAIL=you@example.com
```

4. Deploy.

`NEXT_PUBLIC_SITE_URL` is used for metadata and share previews. Update it if you later attach a custom domain.

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run all four before deploying.
