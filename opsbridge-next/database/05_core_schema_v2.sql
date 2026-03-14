-- =============================================================
-- OpsBridge — Core Schema (v2)
-- File: 05_core_schema_v2.sql
--
-- HOW TO RUN THIS:
--   1. Go to your Supabase project at supabase.com
--   2. Click "SQL Editor" in the left sidebar
--   3. Click the "+ New query" button (top left of the SQL editor)
--   4. Copy EVERYTHING in this file and paste it into the editor
--   5. Click the green "Run" button (or press Ctrl+Enter / Cmd+Enter)
--   6. You should see "Success. No rows returned" at the bottom
--
-- If you see an error, check that you have not run this file before.
-- If you need to start fresh, run the DROP statements at the very
-- bottom of this file first (in a separate query), then re-run this file.
-- =============================================================


-- =============================================================
-- TABLE 1: users
--
-- What this table does:
--   Stores the profile of every person who can log into OpsBridge.
--   There are two types of people (roles):
--     - "manager": can create tasks, assign work, view reports
--     - "worker":  can view and complete assigned tasks
--
--   Important Supabase note:
--   Supabase already has a hidden "auth.users" table that handles
--   passwords and login sessions. This "public.users" table stores
--   the extra information about each person (their name, role, etc.).
--   The "id" column here MUST match the user's ID in Supabase Auth —
--   this is what links a login to a profile. When you create a user
--   in Supabase Authentication > Users, you'll get an ID (a long code
--   like "a1b2c3d4-..."). Use that same ID when inserting rows here.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- id: The unique identifier for this user.
  -- Must match the user's ID from Supabase Authentication.
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- name: The person's display name (e.g. "Alex Smith" or "李明")
  name         TEXT NOT NULL,

  -- email: Their login email address
  email        TEXT NOT NULL UNIQUE,

  -- role: Either 'manager' or 'worker' — controls what they can see and do
  role         TEXT NOT NULL DEFAULT 'worker'
                 CHECK (role IN ('manager', 'worker')),

  -- created_at: Automatically set to the current date/time when the row is created
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment so anyone looking at the Supabase table editor knows what this is
COMMENT ON TABLE public.users IS
  'User profiles. Every logged-in person has a row here. ID matches Supabase Auth.';


-- =============================================================
-- TABLE 2: workers
--
-- What this table does:
--   Stores extra details specific to factory workers — things that
--   managers don't need, like their employee code and language preference.
--   Every worker also has a row in the "users" table (their login info),
--   but this table holds the factory-floor-specific details.
--
--   The "manager_id" field records WHICH manager is responsible for
--   this worker. This lets managers see only their own workers' data.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.workers (
  -- id: Unique ID for this worker record (auto-generated, different from user id)
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- manager_id: Links to the users table — which manager oversees this worker?
  -- If the manager's account is deleted, this becomes NULL (SET NULL)
  manager_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- name: The worker's name as it will appear in the app
  -- Stored separately from users.name so managers can store a preferred/short name
  name               TEXT NOT NULL,

  -- employee_code: The factory's internal ID for this worker (e.g. "W-0042")
  -- Can be left blank — that's why it allows NULL
  employee_code      TEXT,

  -- preferred_language: Which language the app should display in for this worker.
  -- 'zh-CN' = Simplified Chinese (most workers)
  -- 'en'    = English
  preferred_language TEXT NOT NULL DEFAULT 'zh-CN'
                       CHECK (preferred_language IN ('zh-CN', 'en')),

  -- created_at: Automatically set when this record is first created
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.workers IS
  'Factory worker profiles with employee details. Each worker is also in the users table.';


-- =============================================================
-- TABLE 3: tasks
--
-- What this table does:
--   Stores the work instructions that managers create.
--   Each task has a title and instructions in both English (en) and
--   Simplified Chinese (zh) — so managers can write in English and
--   workers can read in Chinese.
--
--   The "category" field lets managers organise tasks by type
--   (e.g. "Assembly", "Cleaning", "Quality Check").
--
--   Tasks are templates — the same task can be assigned to many
--   workers on many different days. The SHIFT_ASSIGNMENTS table
--   (below) is where a task gets assigned to a specific worker.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  -- id: Unique ID for this task
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- created_by: Which manager created this task?
  -- If that manager's account is deleted, the task stays (SET NULL)
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- title_en: The task name in English (what the manager types)
  title_en        TEXT NOT NULL,

  -- title_zh: The task name in Simplified Chinese
  -- This is filled in automatically by the translation feature, or typed directly
  title_zh        TEXT,

  -- instructions_en: Full step-by-step instructions in English
  instructions_en TEXT,

  -- instructions_zh: Full instructions translated to Simplified Chinese
  instructions_zh TEXT,

  -- category: Optional label to group similar tasks together
  -- Examples: 'Assembly', 'Quality Check', 'Cleaning', 'Safety', 'Maintenance'
  category        TEXT,

  -- created_at: When this task was created
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tasks IS
  'Task templates created by managers. Contains bilingual content (EN + ZH).';


-- =============================================================
-- TABLE 4: shift_assignments
--
-- What this table does:
--   This is the "linking" table — it connects a WORKER to a TASK
--   for a specific day and shift.
--
--   Think of it like a daily to-do list entry:
--     "Worker Wei Lin (worker_id) must do Task 'Inspect Line A' (task_id)
--      on 2026-03-15 (shift_date) during the Morning shift (shift_type)"
--
--   The "status" field tracks whether the worker has started or finished.
--   It starts as 'pending', becomes 'in_progress', then 'completed'.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.shift_assignments (
  -- id: Unique ID for this specific assignment
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- worker_id: Which worker is being assigned this task?
  worker_id   UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,

  -- task_id: Which task are they being assigned?
  task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,

  -- shift_date: Which calendar day is this assignment for?
  -- Stored as a DATE (no time, just the day: e.g. 2026-03-15)
  shift_date  DATE NOT NULL,

  -- shift_type: Which part of the day?
  shift_type  TEXT NOT NULL DEFAULT 'morning'
                CHECK (shift_type IN ('morning', 'afternoon', 'night')),

  -- status: Where is this task in its lifecycle?
  -- 'pending'     = not started yet
  -- 'in_progress' = worker has started but not finished
  -- 'completed'   = worker has marked it done
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed')),

  -- Prevent the same worker being assigned the same task twice on the same shift
  UNIQUE (worker_id, task_id, shift_date, shift_type)
);

COMMENT ON TABLE public.shift_assignments IS
  'Assigns a specific task to a specific worker for a specific shift and date.';


-- =============================================================
-- TABLE 5: task_completions
--
-- What this table does:
--   Records the moment a worker finishes a task — when it happened
--   and any notes they left about the work.
--
--   One shift_assignment can have at most ONE task_completion.
--   (A task is either done or not done — it can't be "completed" twice.)
--
--   This separate table (rather than just a "completed_at" column on
--   shift_assignments) makes it easy to:
--     - Store longer notes without cluttering the assignments table
--     - Add photos or evidence in the future (Phase 4)
--     - Query completion history independently
-- =============================================================

CREATE TABLE IF NOT EXISTS public.task_completions (
  -- id: Unique ID for this completion record
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- assignment_id: Which shift assignment was just completed?
  -- One-to-one relationship: each assignment has at most one completion
  assignment_id  UUID NOT NULL UNIQUE REFERENCES public.shift_assignments(id) ON DELETE CASCADE,

  -- completed_at: The exact date and time the worker marked the task as done
  -- Defaults to "right now" but can be set explicitly if needed
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- notes: Optional text the worker can leave about how the task went
  -- Examples: "Found a loose bolt on Step 3", "Machine was clean"
  -- NULL means the worker left no notes
  notes          TEXT
);

COMMENT ON TABLE public.task_completions IS
  'Records when and how a task was completed, with optional worker notes.';


-- =============================================================
-- INDEXES
-- (These make the database faster when searching or filtering.
--  You don't need to understand them in detail — just include them.)
-- =============================================================

-- Find all assignments for a specific worker quickly
CREATE INDEX IF NOT EXISTS idx_shift_assignments_worker_id
  ON public.shift_assignments(worker_id);

-- Find all assignments for a specific date quickly
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_date
  ON public.shift_assignments(shift_date);

-- Find all tasks created by a specific manager quickly
CREATE INDEX IF NOT EXISTS idx_tasks_created_by
  ON public.tasks(created_by);

-- Find all workers under a specific manager quickly
CREATE INDEX IF NOT EXISTS idx_workers_manager_id
  ON public.workers(manager_id);


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
--
-- What this does:
--   RLS is a security layer that controls who can read or change
--   each row. WITHOUT RLS, any logged-in user could read every row
--   in every table. With RLS, users only see data they're allowed to.
--
--   Think of it as a filter that Supabase applies automatically to
--   every database query, based on who is logged in.
-- =============================================================

-- Turn on RLS for every table
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions  ENABLE ROW LEVEL SECURITY;

-- Helper function: returns the role of the currently logged-in user
-- This is used in the policies below to check "is this person a manager?"
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER   -- runs with elevated permission to read the users table
STABLE             -- result won't change within a single query
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- ---- USERS table policies ----

-- Anyone can read their own profile row
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Managers can read all user profiles (needed to populate dropdowns)
CREATE POLICY "Managers can read all users"
  ON public.users FOR SELECT
  USING (public.my_role() = 'manager');

-- Only the system (or a trigger) inserts into users — handled via Supabase Auth hooks

-- ---- WORKERS table policies ----

-- Managers can see all workers
CREATE POLICY "Managers can view all workers"
  ON public.workers FOR SELECT
  USING (public.my_role() = 'manager');

-- Workers can see their own record
CREATE POLICY "Workers can view own record"
  ON public.workers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND public.workers.name = u.name  -- loose link via name for now
    )
  );

-- Only managers can create or update worker records
CREATE POLICY "Managers can manage workers"
  ON public.workers FOR ALL
  USING (public.my_role() = 'manager');

-- ---- TASKS table policies ----

-- Managers can read and write all tasks
CREATE POLICY "Managers can manage tasks"
  ON public.tasks FOR ALL
  USING (public.my_role() = 'manager');

-- Workers can read any task (they need to see the instructions)
CREATE POLICY "Workers can read tasks"
  ON public.tasks FOR SELECT
  USING (public.my_role() = 'worker');

-- ---- SHIFT_ASSIGNMENTS table policies ----

-- Managers can read and write all assignments
CREATE POLICY "Managers can manage shift_assignments"
  ON public.shift_assignments FOR ALL
  USING (public.my_role() = 'manager');

-- Workers can read their own assignments
CREATE POLICY "Workers can view own assignments"
  ON public.shift_assignments FOR SELECT
  USING (
    worker_id IN (
      SELECT w.id FROM public.workers w
      JOIN public.users u ON u.name = w.name
      WHERE u.id = auth.uid()
    )
  );

-- Workers can update their own assignment status (to mark in_progress or completed)
CREATE POLICY "Workers can update own assignment status"
  ON public.shift_assignments FOR UPDATE
  USING (
    worker_id IN (
      SELECT w.id FROM public.workers w
      JOIN public.users u ON u.name = w.name
      WHERE u.id = auth.uid()
    )
  );

-- ---- TASK_COMPLETIONS table policies ----

-- Managers can read all completions
CREATE POLICY "Managers can read all completions"
  ON public.task_completions FOR SELECT
  USING (public.my_role() = 'manager');

-- Workers can read their own completions
CREATE POLICY "Workers can read own completions"
  ON public.task_completions FOR SELECT
  USING (
    assignment_id IN (
      SELECT sa.id FROM public.shift_assignments sa
      JOIN public.workers w ON w.id = sa.worker_id
      JOIN public.users u ON u.name = w.name
      WHERE u.id = auth.uid()
    )
  );

-- Workers can insert (create) completion records for their own assignments
CREATE POLICY "Workers can complete own tasks"
  ON public.task_completions FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT sa.id FROM public.shift_assignments sa
      JOIN public.workers w ON w.id = sa.worker_id
      JOIN public.users u ON u.name = w.name
      WHERE u.id = auth.uid()
    )
  );


-- =============================================================
-- DONE!
-- After running this, you should see all 5 tables in:
-- Supabase Dashboard → Table Editor (left sidebar)
-- =============================================================


-- =============================================================
-- RESET / START OVER
-- If you need to delete everything and start fresh, run ONLY
-- the lines below in a separate query, then re-run this file.
-- WARNING: This permanently deletes all data.
-- =============================================================
/*
DROP TABLE IF EXISTS public.task_completions  CASCADE;
DROP TABLE IF EXISTS public.shift_assignments CASCADE;
DROP TABLE IF EXISTS public.tasks             CASCADE;
DROP TABLE IF EXISTS public.workers           CASCADE;
DROP TABLE IF EXISTS public.users             CASCADE;
DROP FUNCTION IF EXISTS public.my_role();
*/
