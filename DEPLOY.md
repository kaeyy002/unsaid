# UNSAID — Deployment Guide
### From zero to live at `unsaid.vercel.app/ikenna` in ~15 minutes

---

## Step 1: Set up Supabase (your database) — 5 minutes

1. Go to **https://supabase.com** and create a free account
2. Click **"New project"**
   - Name: `unsaid`
   - Database password: pick something strong, save it
   - Region: pick closest to Nigeria (e.g. West EU or US East)
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** (left sidebar)
5. Paste the entire contents of `supabase-schema.sql` and click **Run**
6. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2: Push code to GitHub — 3 minutes

1. Go to **https://github.com** and create a free account (if you don't have one)
2. Create a **new repository** called `unsaid` (make it public)
3. On your computer (or use github.dev in browser):
   - Upload all the project files from this zip
   - OR use the GitHub web editor to paste each file

**If you have Git installed:**
```bash
cd unsaid
git init
git add .
git commit -m "Initial UNSAID MVP"
git remote add origin https://github.com/YOURUSERNAME/unsaid.git
git push -u origin main
```

---

## Step 3: Deploy on Vercel — 3 minutes

1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **"Add New Project"**
3. Import your `unsaid` GitHub repository
4. Before clicking Deploy, go to **Environment Variables** and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = (paste your Supabase project URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (paste your Supabase anon key)
   ```
5. Click **Deploy**
6. Wait ~2 minutes → your site is live!

Your URLs will be:
- Landing page: `https://unsaid.vercel.app`
- Your profile: `https://unsaid.vercel.app/profile/ikenna`
- Your inbox: `https://unsaid.vercel.app/inbox?username=ikenna`

---

## Step 4: Create your profile

1. Go to your live site
2. Click "Create my link"
3. Enter your name and pick username `ikenna`
4. **Bookmark your inbox URL** — you'll need it to read messages

---

## Step 5: Share it

Post this on your WhatsApp Status:
> *"Send me something you've never said out loud 👀*
> *unsaid.vercel.app/profile/ikenna*
> *100% anonymous."*

---

## Custom domain (optional, ~$10-15/year)

1. Buy `getunsaid.com` on Namecheap or Whogohost (Nigerian registrar)
2. In Vercel → Project Settings → Domains → Add domain
3. Follow DNS instructions

---

## Troubleshooting

**"Something went wrong" on signup** → Check your Supabase env variables are correct in Vercel

**Messages not saving** → Make sure you ran the SQL schema in Supabase

**Build failing on Vercel** → Check the build logs; usually a missing env variable

---

## What's built (MVP Features)

- ✅ Landing page with UNSAID branding
- ✅ User profile creation with username
- ✅ Public profile page (anyone can send, no login needed)
- ✅ Anonymous message sending with auto-categorization
- ✅ Inbox with message categories (Compliments, Questions, Confessions, Feedback)
- ✅ Favorite messages
- ✅ Delete messages
- ✅ Mood analytics (positive/neutral/critical breakdown)
- ✅ Share to WhatsApp, X (Twitter), copy link
- ✅ "Built in Nigeria 🇳🇬 · Crafted by Ikenna Ugwulor" branding
- ✅ Dissolving speech bubble logo

## Version 2 ideas (build after first users)
- Supabase Auth (email login to protect inbox)
- AI message summaries
- Polls
- Profile themes
- Premium subscription (Paystack for Nigerian payments)

---

*Made in Nigeria 🇳🇬 · Crafted by Ikenna Ugwulor*
