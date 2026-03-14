-- =============================================================
-- OpsBridge Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run each section in order (top to bottom)
-- =============================================================

-- -------------------------
-- SHIFTS
-- -------------------------
CREATE TABLE shifts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,           -- e.g. "Morning Shift"
  start_time TIME NOT NULL,           -- e.g. 06:00
  end_time   TIME NOT NULL,           -- e.g. 14:00
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------
-- WORKERS
-- Note: id must match the Supabase Auth user id (auth.uid())
-- -------------------------
CREATE TABLE workers (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name_en     TEXT NOT NULL,          -- English name
  name_zh     TEXT,                   -- Simplified Chinese name (optional)
  role        TEXT NOT NULL CHECK (role IN ('manager', 'worker')),
  shift_id    UUID REFERENCES shifts(id),
  badge_points INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- -------------------------
-- TASKS
-- -------------------------
CREATE TABLE tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en            TEXT NOT NULL,
  title_zh            TEXT,
  description_en      TEXT,
  description_zh      TEXT,
  shift_id            UUID REFERENCES shifts(id),
  assigned_worker_id  UUID REFERENCES workers(id),
  created_by          UUID REFERENCES workers(id),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority            TEXT NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high')),
  due_time            TIME,
  created_at          TIMESTAMPTZ DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

-- -------------------------
-- SOP STEPS
-- -------------------------
CREATE TABLE sop_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  step_number    INT NOT NULL,
  instruction_en TEXT NOT NULL,
  instruction_zh TEXT,
  photo_url      TEXT,
  step_type      TEXT NOT NULL DEFAULT 'standard'
                   CHECK (step_type IN ('standard', 'quality_check')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- -------------------------
-- SOP TEMPLATES
-- -------------------------
CREATE TABLE sop_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en        TEXT NOT NULL,
  name_zh        TEXT,
  description_en TEXT,
  description_zh TEXT,
  created_by     UUID REFERENCES workers(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sop_template_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id    UUID NOT NULL REFERENCES sop_templates(id) ON DELETE CASCADE,
  step_number    INT NOT NULL,
  instruction_en TEXT NOT NULL,
  instruction_zh TEXT,
  photo_url      TEXT,
  step_type      TEXT NOT NULL DEFAULT 'standard'
                   CHECK (step_type IN ('standard', 'quality_check'))
);

-- -------------------------
-- BADGE DEFINITIONS
-- -------------------------
CREATE TABLE badge_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en       TEXT NOT NULL,
  name_zh       TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  icon_url      TEXT,
  trigger_type  TEXT NOT NULL,   -- e.g. 'first_task', 'streak_5_days'
  trigger_value INT,             -- numeric threshold (NULL if not applicable)
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- -------------------------
-- WORKER BADGES (earned)
-- -------------------------
CREATE TABLE worker_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id  UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badge_definitions(id),
  earned_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (worker_id, badge_id)   -- prevent duplicate awards
);

-- -------------------------
-- QUALITY ISSUES
-- -------------------------
CREATE TABLE quality_issues (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id            UUID NOT NULL REFERENCES tasks(id),
  step_id            UUID REFERENCES sop_steps(id),
  worker_id          UUID NOT NULL REFERENCES workers(id),
  issue_description  TEXT NOT NULL,
  reported_at        TIMESTAMPTZ DEFAULT now(),
  resolved           BOOLEAN DEFAULT false,
  resolved_at        TIMESTAMPTZ
);

-- -------------------------
-- TASK NOTES
-- -------------------------
CREATE TABLE task_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  worker_id  UUID NOT NULL REFERENCES workers(id),
  note_text  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
