# Factory Floor Task Management App — Development Plan

**Project name:** OpsBridge
**Target users:** Factory managers (English-speaking) and factory workers (Mandarin/Simplified Chinese-speaking)
**Goal:** A handheld digital SOP (Standard Operating Procedure) tool where managers assign structured tasks to workers, and workers view and complete those tasks in Simplified Chinese.
**Timeline:** ~10 weeks to a demo-ready MVP

---

## Recommended Tech Stack (Full Project)

| Layer | Technology | Why it's a good fit |
|---|---|---|
| **Frontend** | React (with Vite) | The most widely documented beginner-friendly UI library. Thousands of tutorials, huge community, easy to find help. |
| **Styling** | Tailwind CSS | Write styles directly in your HTML-like code. No separate CSS files to manage. Looks professional with minimal effort. |
| **Backend** | Node.js + Express | JavaScript on the server side, so you only learn one language. Simple to set up, easy to find examples. |
| **Database** | PostgreSQL (via Supabase) | Supabase gives you a full database + authentication system with a free tier and a visual dashboard — no command-line database setup needed. |
| **Auth** | Supabase Auth | Built-in user login/logout with role support. Free and handles security for you. |
| **Translation** | Google Cloud Translation API (free tier: 500k chars/month) | Easiest API to set up, reliable, supports Simplified Chinese. Alternatively: LibreTranslate (100% free, self-hosted). |
| **File hosting** | Supabase Storage | For optional step photos in SOPs. Built into Supabase, no extra setup. |
| **Deployment** | Vercel (frontend) + Railway or Render (backend) | Both have generous free tiers. Vercel deploys React apps in under 2 minutes. |

> **Abbreviation glossary:**
> - **API** = Application Programming Interface — a way for two software programs to talk to each other
> - **UI** = User Interface — the screens the user sees
> - **SOP** = Standard Operating Procedure — a documented step-by-step work instruction
> - **MVP** = Minimum Viable Product — the simplest version that can be shown to a real client
> - **Auth** = Authentication — the login/identity system
> - **Frontend** = The part of the app users see (runs in the browser)
> - **Backend** = The server-side logic (runs on a computer in the cloud)
> - **Database** = Where all data is stored permanently

---

## Phase 1: Foundation and Data Model

**Estimated time:** 1.5 weeks
**What you're building:** The skeleton of the entire app — the database structure (who are the users, what is a task, what is a shift), plus the login system so managers and workers have separate experiences.

### Why this comes first
Everything else depends on having a clear data structure. If you skip this and jump to building screens, you'll have to rebuild everything later when the data doesn't fit. Think of this phase as pouring the concrete foundation before building walls.

---

### 1.1 Data Model (Database Tables)

These are the core "things" your app tracks:

```
workers
  - id
  - name (stored in both English and Chinese)
  - role: 'manager' | 'worker'
  - shift_id (which shift they belong to)
  - badge_points (total gamification score)
  - created_at

shifts
  - id
  - name (e.g. "Morning Shift", "Night Shift")
  - start_time
  - end_time

tasks
  - id
  - title_en (English title)
  - title_zh (Simplified Chinese title — auto-translated or entered directly)
  - description_en
  - description_zh
  - shift_id (which shift this task is assigned to)
  - assigned_worker_id
  - status: 'pending' | 'in_progress' | 'completed'
  - due_time
  - priority: 'low' | 'medium' | 'high'
  - created_by (manager's worker id)
  - created_at
  - completed_at

sop_steps (Standard Operating Procedure steps per task)
  - id
  - task_id
  - step_number
  - instruction_en
  - instruction_zh
  - photo_url (optional)

badge_definitions
  - id
  - name_en
  - name_zh
  - description_en
  - description_zh
  - icon_url
  - trigger_type: 'tasks_completed' | 'streak' | 'speed' | 'perfect_week'
  - trigger_value (e.g. complete 10 tasks → earn badge)

worker_badges
  - id
  - worker_id
  - badge_id
  - earned_at
```

---

### 1.2 Tech Setup Checklist

Before writing any code, complete these steps:

- [ ] Create a free [Supabase](https://supabase.com) account
- [ ] Create a new Supabase project (name it "opsbridge")
- [ ] Note your **Project URL** and **anon key** from Settings → API
- [ ] Install Node.js from [nodejs.org](https://nodejs.org) (choose the LTS version)
- [ ] Install VS Code from [code.visualstudio.com](https://code.visualstudio.com)
- [ ] Install the VS Code extension "Prettier" for code formatting
- [ ] Create a free [Vercel](https://vercel.com) account (connect your GitHub)

---

### 1.3 Claude Code Prompts for Phase 1

Use these prompts one at a time inside Claude Code. Wait for each one to finish before running the next.

**Prompt 1.A — Create the React project:**
```
Create a new React app using Vite in the current directory called "opsbridge".
Set it up with:
- Tailwind CSS for styling
- React Router for navigation between pages
- Supabase client library for database and auth

Show me the exact terminal commands to run, then create the folder structure with
placeholder files for: Login page, Manager Dashboard, Worker Dashboard, and a
shared components folder.
```

**Prompt 1.B — Set up Supabase database tables:**
```
I'm using Supabase as my database. Write the SQL code to create these tables:
workers, shifts, tasks, sop_steps, badge_definitions, worker_badges.

Use these exact field names and types: [paste the data model from above]

Also add:
- A "Row Level Security" policy so workers can only see their own tasks
- A policy so managers can see all tasks
- Some sample data: 2 shifts (Morning/Night), 3 workers (1 manager, 2 workers),
  and 3 sample tasks

Format the output as SQL I can paste directly into the Supabase SQL Editor.
```

**Prompt 1.C — Build the login screen:**
```
Build a login page for my React app using Supabase Auth. Requirements:
- Email and password fields
- A "Sign In" button
- After login, check the worker's role from the "workers" table
- If role = "manager", redirect to /manager/dashboard
- If role = "worker", redirect to /worker/dashboard
- Show a clear error message if login fails
- Style it with Tailwind CSS — clean, simple, mobile-friendly
- The page title should display in both English and Simplified Chinese
```

**Prompt 1.D — Create a protected route system:**
```
In my React app, create a ProtectedRoute component that:
- Checks if the user is logged in (using Supabase Auth session)
- If not logged in, redirects them to /login
- If logged in as 'manager', allows access to /manager/* routes only
- If logged in as 'worker', allows access to /worker/* routes only
- Shows a loading spinner while checking auth status
Include the updated App.jsx with all routes wired up correctly.
```

---

### 1.4 How to Test Phase 1

Before moving to Phase 2, verify all of these work:

- [ ] You can open the app in your browser at `http://localhost:5173`
- [ ] The login page displays correctly on a phone-sized browser window
- [ ] Logging in with a manager account redirects to `/manager/dashboard`
- [ ] Logging in with a worker account redirects to `/worker/dashboard`
- [ ] Visiting `/manager/dashboard` without being logged in redirects to `/login`
- [ ] In Supabase dashboard → Table Editor, you can see your sample data rows

---

### 1.5 Beginner Traps to Avoid

- **Don't put secret keys in your code.** Your Supabase URL and anon key go in a `.env` file (a special configuration file). Claude Code will help you set this up — just ask.
- **The anon key is safe to expose; the service_role key is NOT.** Never put the service_role key in your frontend code.
- **Supabase Row Level Security (RLS) must be enabled** or anyone can read your entire database. Always ask Claude Code to include RLS policies.
- **Don't skip the sample data step.** You need real data to test your screens in Phase 2.

---

## Phase 2: Task Creation with Chinese Language Support

**Estimated time:** 2 weeks
**What you're building:** The manager's task creation form, with automatic translation of English input to Simplified Chinese using Google Translate API. You'll also build a task list view for managers.

---

### 2.1 Translation Strategy

**Recommended approach for MVP:** Google Cloud Translation API
- Free tier: 500,000 characters/month — plenty for a demo
- Setup time: ~30 minutes
- Accuracy: High for common manufacturing/workplace vocabulary

**Alternative if you want zero API costs:** Use a pre-built vocabulary file
For factory SOPs, the vocabulary is often repetitive ("inspect", "clean", "report", "assemble", etc.). Claude Code can generate a translation lookup table of the 200 most common factory phrases, which you can have a bilingual contact review.

**Important:** Always have a bilingual human review auto-translated strings before showing them to real workers. Machine translation is a good starting point, not a final product. Affordable review options:
- **iTalki** (italki.com) — hire a Mandarin tutor for a 1-hour review session (~$15–25 USD)
- **A bilingual contact at the client factory** — the most contextually accurate option
- **DeepL Pro** — alternative to Google, often more natural-sounding ($8.99/month)

---

### 2.2 Claude Code Prompts for Phase 2

**Prompt 2.A — Set up Google Translate:**
```
I want to use the Google Cloud Translation API to translate English text to
Simplified Chinese (language code: zh-CN).

Please:
1. Show me how to get a free API key from Google Cloud Console (step by step)
2. Create a utility function in my Node.js/Express backend called translateToZh(text)
   that calls the Google Translate API and returns the Chinese translation
3. Create an Express API route POST /api/translate that accepts { text: "..." }
   and returns { translation: "..." }
4. Add proper error handling if the API is unavailable
```

**Prompt 2.B — Build the task creation form (Manager):**
```
Build a task creation form for managers in my React app at /manager/tasks/new.

The form should have these fields:
- Task title (English text input)
- Description (English textarea)
- Assign to worker (dropdown populated from Supabase workers table, filtered by shift)
- Shift (dropdown from shifts table)
- Priority (Low / Medium / High radio buttons)
- Due time (time picker)

When the manager types the title and clicks a "Translate" button:
- Call POST /api/translate with the English title
- Show the Chinese translation below the English field in a preview box
- The manager can edit the Chinese translation manually if needed

When the form is submitted:
- Save both English and Chinese versions to the tasks table in Supabase
- Show a success toast notification
- Redirect back to /manager/dashboard

Style with Tailwind. Make it work on tablet-sized screens.
```

**Prompt 2.C — Build the manager task list:**
```
Build a task list page for managers at /manager/dashboard showing all tasks grouped by shift.

Each task card should show:
- Task title (English)
- Assigned worker name
- Status badge (color-coded: grey=pending, blue=in_progress, green=completed)
- Priority badge (red=high, yellow=medium, grey=low)
- Due time

Add these filters at the top:
- Filter by shift (All / Morning / Night)
- Filter by status (All / Pending / In Progress / Completed)
- Search box (searches task title)

Add a prominent "+ New Task" button that links to /manager/tasks/new.

Fetch all data from Supabase in real-time (use Supabase's realtime subscription
so the list updates automatically when a worker completes a task).
```

**Prompt 2.D — Add inline SOP step builder:**
```
Below the main task creation form, add a section called "Standard Operating Procedure Steps".

It should allow the manager to:
- Add multiple numbered steps
- Each step has an English instruction text field
- A "Translate Step" button next to each step
- A preview of the Chinese translation
- Ability to reorder steps with Up/Down arrow buttons
- Ability to delete a step

When the task is saved, save all steps to the sop_steps table linked to the task.
```

---

### 2.3 How to Test Phase 2

- [ ] Create a task as manager with English title, click Translate — Chinese text appears
- [ ] The Chinese translation looks correct (have a Mandarin speaker check 2–3 sample tasks)
- [ ] Task is saved and appears in the manager dashboard task list
- [ ] Status filter works (try filtering for "Pending" only)
- [ ] SOP steps save and are linked to the correct task in Supabase Table Editor

---

### 2.4 Beginner Traps to Avoid

- **Never call the Translation API from the frontend (React).** Always call it through your backend (Express) — otherwise your API key is exposed to anyone who opens browser DevTools.
- **Rate limiting:** If you're testing heavily, you may hit Google's API. Add a simple cache — if the same English phrase was already translated, return the cached result instead of calling the API again. Ask Claude Code: *"Add a simple in-memory cache to my translateToZh function"*.
- **Chinese font rendering:** Some devices may not render Simplified Chinese correctly. Ask Claude Code to add `lang="zh-CN"` attributes to Chinese text elements.

---

## Phase 3: Worker-Facing Shift Dashboard

**Estimated time:** 1.5 weeks
**What you're building:** The worker's view — a mobile-optimised dashboard showing their tasks for the current shift, entirely in Simplified Chinese. Workers can mark tasks as in-progress or completed.

---

### 3.1 Design Principles for This Phase

- **Everything visible to workers must be in Simplified Chinese** (or have Chinese as the primary/larger text)
- **Large touch targets** — factory workers may be wearing gloves or have calloused hands
- **High contrast** — factory floors often have variable lighting
- **Minimal navigation** — a worker should complete a task in 3 taps or fewer
- **Offline consideration:** For Phase 1 MVP, WiFi is assumed. Note this as a future improvement.

---

### 3.2 Claude Code Prompts for Phase 3

**Prompt 3.A — Build the worker dashboard:**
```
Build the worker dashboard at /worker/dashboard for my factory app.

Requirements:
- Automatically detect which shift the logged-in worker belongs to
- Show only tasks assigned to this worker for their current shift
- Display EVERYTHING in Simplified Chinese (task titles, status labels, button text)
- Show a greeting with the worker's name in Chinese: "你好，[Name]！今天的任务："
  (Translation: "Hello, [Name]! Today's tasks:")
- Each task card shows: Chinese title, priority indicator (colored dot), due time, status

Design for mobile: large cards, big text (minimum 16px for Chinese),
high contrast colors, generous padding.

Fetch tasks from Supabase filtered by: worker_id = current user AND
shift matches current time of day.
```

**Prompt 3.B — Build the task detail and completion flow:**
```
When a worker taps a task card, navigate to /worker/tasks/:id

This page should show:
- Task title in large Chinese text
- Task description in Chinese
- The SOP steps listed in order, each as a numbered card
- Each step has a checkbox the worker can tap to mark it complete
- A large "开始任务" (Start Task) button — tapping it changes status to 'in_progress'
- Once all steps are checked, show a large green "完成任务" (Complete Task) button
- Tapping Complete Task: updates status to 'completed', records completed_at timestamp,
  triggers badge check logic (placeholder function for now), shows a celebration screen

The celebration screen should show:
- A large checkmark animation
- "任务完成！" (Task Complete!) in large text
- "+[X] 积分" (Points earned)
- A "返回" (Return) button back to the dashboard

All labels, buttons, and text must be in Simplified Chinese.
```

**Prompt 3.C — Add real-time task status updates:**
```
In my worker dashboard, use Supabase Realtime to subscribe to changes on the tasks table
filtered for this worker's tasks.

When a manager creates a new task assigned to this worker, it should appear on their
dashboard automatically without refreshing the page.

When a task's status changes, the card should update its color/label in real-time.

Add a subtle "last updated" indicator showing when data was last synced,
displayed in Chinese: "最后更新：[time]"
```

**Prompt 3.D — Build a shift summary view:**
```
Add a shift summary screen at /worker/shift-summary that shows:
- Number of tasks completed today
- Number of tasks remaining
- Current badge points total
- A progress bar showing percentage of shift tasks done
- Recently earned badges (icons with Chinese names)

Show this screen automatically when all tasks for the shift are completed.
Add a link to it from the worker dashboard header.

All text in Simplified Chinese. Large, readable layout for factory conditions.
```

---

### 3.3 How to Test Phase 3

- [ ] Log in as a worker — dashboard shows only their tasks, all in Chinese
- [ ] Tap a task — SOP steps display in Chinese
- [ ] Check all steps and tap "完成任务" — celebration screen appears
- [ ] Log back into manager account — task shows as "completed" in the dashboard
- [ ] Test on an actual phone browser (use your Vite dev server URL on your local WiFi)

---

### 3.4 Beginner Traps to Avoid

- **Test on a real phone, not just a resized browser window.** Tap targets that look fine on desktop are often too small on mobile.
- **Chinese text needs more space.** Each Chinese character is roughly equivalent to 2 English characters in width. Leave extra padding in your designs.
- **Shift detection by time:** Detecting "current shift" by clock time is tricky at shift boundaries. For MVP, add a manual "I'm starting my shift" button as a fallback. Ask Claude Code: *"Add a manual shift start button to the worker dashboard as a fallback for automatic shift detection"*.

---

## Phase 4: SOP and Instruction Delivery

**Estimated time:** 1.5 weeks
**What you're building:** Richer SOP content — step-by-step instructions with optional photos, a reusable SOP template library so managers don't rewrite the same procedures repeatedly, and a quality check flow.

---

### 4.1 What Makes a Good Factory SOP

A good digital SOP (Standard Operating Procedure) for factory workers should:
- Break complex tasks into **numbered, single-action steps** ("Pick up component" not "Handle the assembly process")
- Use **photos or diagrams** for steps where visual confirmation matters
- Include a **quality checkpoint** — a specific step where the worker confirms the output looks correct before proceeding
- Be **short enough to read in 30 seconds per step**

---

### 4.2 Claude Code Prompts for Phase 4

**Prompt 4.A — Add photo upload to SOP steps:**
```
In my SOP step builder (in the manager task creation form), add optional photo upload to each step.

Requirements:
- An "Add Photo" button below each step instruction
- Clicking it opens a file picker (accept image files only)
- Upload the image to Supabase Storage bucket called "sop-photos"
- Show a thumbnail preview after upload
- Store the photo URL in the sop_steps table's photo_url field
- In the worker view, show the photo below the step instruction in a tappable
  lightbox (tapping opens a fullscreen view)
- Keep image upload under 5MB — show a clear error if too large

Use Supabase Storage for the upload. Show me the storage bucket setup steps too.
```

**Prompt 4.B — Build an SOP template library:**
```
Build an SOP template system for managers.

New database table needed: sop_templates
  - id, name_en, name_zh, description_en, description_zh, created_by, created_at

And: sop_template_steps
  - id, template_id, step_number, instruction_en, instruction_zh, photo_url

Manager UI at /manager/sop-templates:
- List of saved templates with English name and Chinese name
- "New Template" button to create a reusable SOP (same step builder as task creation)
- "Use Template" button on each template — when creating a new task,
  manager can load a template to pre-fill the SOP steps

This saves time when the same procedure is repeated across multiple tasks or shifts.
All Chinese fields auto-translated via the existing /api/translate endpoint.
```

**Prompt 4.C — Add a quality checkpoint step type:**
```
In my SOP step builder, add a special step type called "Quality Check".

When step_type = 'quality_check':
- The worker sees the step highlighted in yellow with a warning icon
- The instruction asks them to verify something specific (e.g. "确认焊点无缺陷" =
  "Confirm weld points have no defects")
- They must tap one of two buttons: ✓ "通过" (Pass) or ✗ "不通过" (Fail)
- If they tap "Fail": show a text input asking them to describe the issue in Chinese,
  then submit a "quality_issue" record to a new table
- If they tap "Pass": proceed to next step normally

New database table: quality_issues
  - id, task_id, step_id, worker_id, issue_description, reported_at, resolved, resolved_at

Managers can see quality issues in their dashboard under a "Quality Alerts" tab.
```

**Prompt 4.D — Add task notes and worker comments:**
```
At the bottom of the worker task detail page, add a simple comments section.

Workers can:
- Type a note about the task in Chinese (free text input)
- Submit it — saved to a new "task_notes" table with worker_id, task_id, note_text, created_at
- See their previously added notes for this task

Managers can see all notes for a task in the manager task detail view.

This replaces informal communication (workers photographing paper notes) with
a structured digital alternative.

Keep the UI simple: just a text area and a submit button with Chinese labels.
```

---

### 4.3 How to Test Phase 4

- [ ] Upload a photo to an SOP step — it appears as a thumbnail in manager view and fullscreen in worker view
- [ ] Create an SOP template, then use it when creating a new task — steps pre-fill correctly
- [ ] Complete a task that has a quality check step — tapping "Fail" creates a record visible to manager
- [ ] Add a note as a worker — the manager can see it in the task detail

---

### 4.4 Beginner Traps to Avoid

- **Set Supabase Storage bucket to private** (not public) and use signed URLs to display images. This prevents anyone with the URL from accessing your photos. Ask Claude Code: *"Use Supabase Storage signed URLs for sop-photos bucket"*.
- **Photo compression:** Factory workers may take large phone photos. Add client-side compression before upload. Ask Claude Code: *"Add image compression using the browser-image-compression npm package before Supabase Storage upload"*.
- **Don't rely on one translation call per step.** If a manager creates a 10-step SOP, that's 10 API calls. Batch them: Ask Claude Code: *"Modify the translateToZh function to accept an array of strings and batch them into one API call"*.

---

## Phase 5: Gamification Layer

**Estimated time:** 2 weeks
**What you're building:** An automated badge and points system that rewards workers for completing tasks, maintaining streaks, completing quality checks, and other positive behaviours. Ported from the "What's Next?" concept and adapted for a factory context.

---

### 5.1 Gamification Design for Factory Workers

The gamification system must be **culturally sensitive and factory-appropriate**:
- **Use Chinese names for badges** — workers should feel the recognition is meant for them
- **Keep it positive** — no penalty points, no leaderboards between workers (can cause friction)
- **Tie badges to work quality, not just speed** — otherwise workers rush and cut corners
- **Manager-controlled visibility** — managers should be able to turn off specific badge types if not culturally appropriate for this particular client

---

### 5.2 Badge Categories (Factory Context)

| Badge | Chinese Name | Trigger |
|---|---|---|
| First Task | 第一步 (Dì yī bù) | Complete first task ever |
| Task Streak | 连续达标 (Liánxù dá biāo) | Complete tasks on time 5 days in a row |
| Quality Champion | 品质冠军 (Pǐnzhì guànjūn) | Pass 20 quality checks without a fail |
| Speed Learner | 快速学习 (Kuàisù xuéxí) | Complete a new task type for the first time |
| Early Bird | 早班英雄 (Zǎo bān yīngxióng) | Complete all morning shift tasks before end of shift |
| Problem Reporter | 安全卫士 (Ānquán wèishì) | Report 5 quality issues (rewarding transparency) |
| Full Week | 满勤奖 (Mǎn qín jiǎng) | Complete tasks every day for a full work week |
| Century | 百分达成 (Bǎifēn dáchéng) | Complete 100 total tasks |

---

### 5.3 Claude Code Prompts for Phase 5

**Prompt 5.A — Seed badge definitions:**
```
Insert the following badge definitions into my badge_definitions table in Supabase.
Write this as SQL I can run in the Supabase SQL Editor.

Badges to insert: [paste the table from 5.2 above]

For trigger_type use: 'first_task', 'streak_5_days', 'quality_20_pass',
'new_task_type', 'morning_shift_complete', 'issue_reporter_5', 'full_week', 'tasks_100'

For trigger_value use the numeric threshold where relevant (e.g. streak needs 5 days,
so trigger_value = 5).

Also add a placeholder icon_url for each — I'll replace with real icons later.
```

**Prompt 5.B — Build the badge checking engine:**
```
Create a badge-checking service in my Node.js backend at src/services/badgeEngine.js

This service exports a function: checkAndAwardBadges(workerId)

It should:
1. Fetch the worker's current stats from Supabase:
   - Total tasks completed (all time)
   - Tasks completed in the last 7 days (for streak detection)
   - Quality checks passed and failed
   - Number of quality issues reported
   - Whether all tasks in today's morning shift are complete

2. Compare against badge trigger conditions

3. For any badge condition that is met:
   - Check if the worker already has that badge (don't duplicate)
   - If not, insert a row into worker_badges
   - Return a list of newly awarded badges

4. This function should be called from the task completion endpoint,
   passing the workerId of whoever just completed the task.

Write clear comments explaining what each section does.
```

**Prompt 5.C — Build the streak detection logic:**
```
In my badgeEngine.js, build the streak detection function.

A streak is: the worker completed at least one task every consecutive calendar day
leading up to and including today.

The function streakCount(workerId) should:
1. Fetch all completed tasks for this worker, ordered by completed_at date descending
2. Count backwards from today — how many consecutive days have at least one completion?
3. Return the number of consecutive days

Edge cases to handle:
- If today has no completions yet, start counting from yesterday
- Ignore time — only care about the calendar date (use the factory's timezone,
  default to UTC+8 for Chinese factories)
- If there's a gap of even one day, the streak resets to 0

Write a test for this function with sample data covering: 5-day streak, broken streak,
no tasks ever completed.
```

**Prompt 5.D — Build the worker badge display:**
```
In the worker dashboard, add a badge showcase section below the task list.

Show:
- Badges earned: display as a grid of icon + Chinese name, with the earned date
- A progress hint for badges not yet earned: e.g. "再完成 3 个任务即可获得百分达成徽章"
  (Complete 3 more tasks to earn the Century badge)
- Show progress hints for maximum 2 unearned badges at a time (don't overwhelm)

When a badge is newly earned (returned from checkAndAwardBadges):
- Show a full-screen celebration modal with the badge icon, Chinese name, and
  a congratulations message in Chinese: "恭喜！你获得了新徽章！"
- Auto-dismiss after 4 seconds or on tap

In the manager dashboard, add a "Worker Badges" tab showing each worker's
earned badges — useful for manager recognition conversations.
```

**Prompt 5.E — Add a badge admin panel for managers:**
```
Build a simple badge management page for managers at /manager/badges.

Managers can:
- See all available badges with their trigger descriptions
- Toggle each badge ON or OFF (add an 'active' boolean to badge_definitions table)
- Inactive badges are not awarded to workers and not shown on the worker dashboard

Add a settings toggle for:
- "Enable leaderboard" (off by default) — if turned on, shows a shift-level
  completion rate comparison (not individual worker vs worker)
- "Show badge notifications to workers" (on by default)

This gives the manager cultural control over the gamification system.
```

---

### 5.4 How to Test Phase 5

- [ ] Complete a task as a worker — check Supabase worker_badges table for new rows
- [ ] Complete tasks on multiple test days — verify streak counter increments (you may need to manually insert past-dated test completions)
- [ ] Disable a badge type as manager — verify worker no longer receives that badge type
- [ ] The badge celebration modal appears after task completion (test with "First Task" badge by creating a fresh test worker account)

---

### 5.5 Beginner Traps to Avoid

- **Badge duplication:** Always check if a badge was already awarded before inserting. The `checkAndAwardBadges` function must query `worker_badges` before inserting.
- **Timezone issues:** Factories in China run on UTC+8. If your server is in UTC, a task completed at 11:30pm UTC+8 (3:30pm UTC) will appear as a different date than intended. Always store and compare dates in UTC+8 for streak calculations.
- **Don't run badge checks synchronously on the task completion API call** if your badge logic grows complex. Ask Claude Code to move it to a background job using a queue. For MVP, synchronous is fine.
- **Gamification backlash:** Some workers may find point systems patronising. Build the feature but make sure your client manager previews it before rollout. The manager OFF toggle in Phase 5.E is important.

---

## Week-by-Week Timeline

| Week | Goal |
|---|---|
| Week 1 | Phase 1: Supabase setup, login, role-based routing |
| Week 2 | Phase 1 complete + buffer; begin Phase 2 |
| Weeks 3–4 | Phase 2: Task creation, translation, manager dashboard |
| Week 5 | Phase 3: Worker dashboard + task completion flow |
| Week 6 | Phase 3 complete + buffer; begin Phase 4 |
| Weeks 7–8 | Phase 4: SOP photos, templates, quality checks |
| Weeks 9–10 | Phase 5: Badge system + polish for client demo |

---

## Pre-Demo Checklist (End of Week 10)

Before showing this to the factory client, confirm:

- [ ] All worker-facing text is in Simplified Chinese and has been reviewed by a bilingual person
- [ ] The app works on a mid-range Android phone (the most common device type in Chinese factories)
- [ ] A manager can create a task with SOP steps from scratch in under 5 minutes
- [ ] A worker can find and complete a task in under 3 taps
- [ ] The app works on the factory's WiFi (test on-site if possible)
- [ ] You have a backup plan if internet drops (note: full offline support is a Phase 6 feature)
- [ ] Sensitive worker data is protected (Supabase RLS is enabled on all tables)
- [ ] You have a Supabase database backup enabled (Settings → Backups in Supabase dashboard)

---

## Asking Claude Code for Help

Any time you're stuck, you can describe your problem using this format:

```
I'm building a factory task management app using React, Tailwind, Node.js/Express,
and Supabase. I'm on Phase [X], building [describe what you're building].

The problem I'm seeing is: [describe what's going wrong]
Here is the error message (if any): [paste exact error]
Here is my current code: [paste relevant code]

Please fix this and explain what was wrong in plain language.
```

The more specific you are, the more useful the answer. Always paste actual error messages — never just describe them.

---

*Document version: 1.0 | Created: 2026-03-13*
