# Clothing store

Next.js 14 + Supabase. Admin uploads items (category + type); shoppers browse, order via WhatsApp, and leave feedback.

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Create your admin user in Supabase > Authentication > Users, then run the last (commented) line of the SQL with your email.
3. Copy `.env.local.example` to `.env.local` and fill it in.
4. `npm install` then `npm run dev`. Sign in at `/admin`.
