# OpsBridge — Complete Setup Guide for Non-Technical Developers

Follow these steps in order. Do not skip ahead. Each step must be complete before the next.

---

## STEP 1: Install the tools you need

You only do this once, ever.

### 1A. Install Node.js

Node.js lets your computer run JavaScript programs (like this app).

1. Go to [nodejs.org](https://nodejs.org)
2. Click the big green button that says **LTS** (this is the stable version)
3. Download and run the installer
4. When it's done, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Type this and press Enter:
   ```
   node --version
   ```
   You should see something like `v22.0.0`. If you do, Node.js is installed correctly.

### 1B. Install VS Code

VS Code is a free code editor. It's what you'll use to view and edit the app's files.

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Download and install it for your operating system
3. Open VS Code
4. Click Extensions (the four-squares icon on the left sidebar)
5. Search for and install these two extensions:
   - **Prettier** (auto-formats your code)
   - **Tailwind CSS IntelliSense** (helps you write Tailwind styles)

### 1C. Install Claude Code

Claude Code is the AI tool you'll use to build this app.

1. In Terminal / Command Prompt, type:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
2. Press Enter and wait for it to finish

---

## STEP 2: Create your Supabase account and project

Supabase is your database — it stores all your app's data securely in the cloud.
It's free to start.

1. Go to [supabase.com](https://supabase.com) and click **Start your project**
2. Sign up with your GitHub account (or email)
3. Click **New Project**
4. Fill in:
   - **Name:** `opsbridge`
   - **Database Password:** choose a strong password and save it somewhere safe
   - **Region:** pick the closest one to your factory (e.g. Singapore for Asia)
5. Click **Create new project** and wait about 2 minutes for it to set up

---

## STEP 3: Set up the database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `database/01_schema.sql` in VS Code
4. Select all the text (Ctrl+A on Windows, Cmd+A on Mac) and copy it
5. Paste it into the Supabase SQL Editor
6. Click **Run** (the green play button)
7. You should see: `Success. No rows returned`

Repeat steps 2–7 for each file in the `database/` folder, in order:
- `02_rls_policies.sql`
- `03_seed_data.sql` *(read the instructions inside this file first!)*
- `04_functions.sql`

---

## STEP 4: Create your first users in Supabase

1. In Supabase, click **Authentication** → **Users** → **Add user** → **Create new user**
2. Create three test users:
   - Email: `manager@test.com` / Password: `Test1234!`
   - Email: `worker1@test.com` / Password: `Test1234!`
   - Email: `worker2@test.com` / Password: `Test1234!`
3. Note the **User UID** (long code) shown next to each user
4. Open `database/03_seed_data.sql`, replace the placeholder UUIDs with the real ones
5. Run that SQL file again in the SQL Editor

---

## STEP 5: Connect the app to Supabase

1. In Supabase, click **Settings** → **API**
2. You'll see two values — copy them both:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon public** key (a very long string)

3. In VS Code, open the file `.env.example` inside `opsbridge-next/`
4. Duplicate that file — save the copy as `.env.local` (in the same folder)
5. In `.env.local`, replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
6. Save the file

> ⚠️ **IMPORTANT:** Never share `.env.local` with anyone or put it in git.
> It's in `.gitignore` so it won't be committed automatically.

---

## STEP 6: Run the app on your computer

1. Open Terminal and navigate to the project folder:
   ```
   cd path/to/OpsBridge-/opsbridge-next
   ```
   *(Replace `path/to` with where you saved the project)*

2. Install the app's code dependencies:
   ```
   npm install
   ```
   Wait for it to finish (usually 1–2 minutes).

3. Start the app:
   ```
   npm run dev
   ```

4. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

5. You should see the OpsBridge login page!

---

## STEP 7: Test that everything works

Work through this checklist before moving to Phase 2:

- [ ] Login page appears at `http://localhost:3000/login`
- [ ] Log in with `manager@test.com` → redirected to `/manager/dashboard`
- [ ] Manager dashboard shows task count summary cards
- [ ] Click "+ New Task" → see the Phase 2 placeholder page
- [ ] Sign out → returns to login page
- [ ] Log in with `worker1@test.com` → redirected to `/worker/dashboard`
- [ ] Worker dashboard shows greeting in Chinese
- [ ] Progress bar is visible
- [ ] Sign out works

---

## Common Problems and Fixes

### "Cannot read properties of null" error
Your `.env.local` values are probably wrong. Double-check that you copied the full Supabase URL and anon key with no extra spaces.

### Page shows "not found" or blank screen
Make sure `npm run dev` is still running in your Terminal. Don't close the Terminal window.

### Login works but dashboard is empty
The seed data might not have run correctly. Go back to Step 3 and re-run `03_seed_data.sql`.

### "Module not found" error
Run `npm install` in the `opsbridge-next/` folder and try again.

---

## Folder structure explained

```
opsbridge-next/
├── app/                    ← All pages and API endpoints live here
│   ├── login/page.js       ← The login screen
│   ├── manager/
│   │   ├── dashboard/page.js   ← Manager's task overview
│   │   └── tasks/new/page.js   ← Task creation (Phase 2)
│   ├── worker/
│   │   ├── dashboard/page.js   ← Worker's task list (in Chinese)
│   │   └── tasks/[id]/page.js  ← Task detail / SOP steps (Phase 3)
│   └── api/
│       └── translate/route.js  ← Translation endpoint (Phase 2)
├── components/             ← Reusable UI pieces
│   └── ui/SignOutButton.js ← The "Sign Out" button
├── lib/supabase/           ← Supabase connection setup
│   ├── client.js           ← Use this in browser components
│   └── server.js           ← Use this in server components
├── middleware.js           ← Security guard for all pages
├── database/               ← SQL files to run in Supabase
└── .env.local              ← Your secret keys (never commit this)
```

---

## What's next

Once this is working, follow the phases in `DEVELOPMENT_PLAN.md`:

- **Phase 2:** Task creation form with English → Chinese translation
- **Phase 3:** Worker SOP step-through and task completion
- **Phase 4:** Photos, templates, quality checks
- **Phase 5:** Badge and gamification system
