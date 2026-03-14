-- =============================================================
-- Row Level Security (RLS) Policies
-- Run AFTER 01_schema.sql
--
-- RLS ensures users can only access data they're allowed to see.
-- Without this, ANY logged-in user could read ALL data.
-- =============================================================

-- Enable RLS on every table
ALTER TABLE workers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_steps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_badges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_issues   ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes       ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- Helper function: get current user's role
-- -------------------------
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM workers WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -------------------------
-- SHIFTS — everyone can read shifts
-- -------------------------
CREATE POLICY "Anyone can view shifts"
  ON shifts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -------------------------
-- WORKERS — workers see their own row; managers see all
-- -------------------------
CREATE POLICY "Workers see own profile"
  ON workers FOR SELECT
  USING (id = auth.uid() OR get_my_role() = 'manager');

CREATE POLICY "Managers can update any worker"
  ON workers FOR UPDATE
  USING (get_my_role() = 'manager');

-- -------------------------
-- TASKS — workers see tasks assigned to them; managers see all
-- -------------------------
CREATE POLICY "Workers see own tasks"
  ON tasks FOR SELECT
  USING (assigned_worker_id = auth.uid() OR get_my_role() = 'manager');

CREATE POLICY "Managers can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (get_my_role() = 'manager');

CREATE POLICY "Managers can update any task"
  ON tasks FOR UPDATE
  USING (get_my_role() = 'manager');

CREATE POLICY "Workers can update own task status"
  ON tasks FOR UPDATE
  USING (assigned_worker_id = auth.uid())
  WITH CHECK (assigned_worker_id = auth.uid());

-- -------------------------
-- SOP STEPS — same visibility as tasks
-- -------------------------
CREATE POLICY "View sop_steps for accessible tasks"
  ON sop_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = sop_steps.task_id
        AND (t.assigned_worker_id = auth.uid() OR get_my_role() = 'manager')
    )
  );

CREATE POLICY "Managers can manage sop_steps"
  ON sop_steps FOR ALL
  USING (get_my_role() = 'manager');

-- -------------------------
-- SOP TEMPLATES — managers only
-- -------------------------
CREATE POLICY "Managers can manage templates"
  ON sop_templates FOR ALL
  USING (get_my_role() = 'manager');

CREATE POLICY "Managers can manage template steps"
  ON sop_template_steps FOR ALL
  USING (get_my_role() = 'manager');

-- -------------------------
-- BADGE DEFINITIONS — everyone can read active badges
-- -------------------------
CREATE POLICY "Anyone can view active badges"
  ON badge_definitions FOR SELECT
  USING (auth.uid() IS NOT NULL AND active = true);

CREATE POLICY "Managers can manage badge definitions"
  ON badge_definitions FOR ALL
  USING (get_my_role() = 'manager');

-- -------------------------
-- WORKER BADGES — workers see own; managers see all
-- -------------------------
CREATE POLICY "Workers see own badges"
  ON worker_badges FOR SELECT
  USING (worker_id = auth.uid() OR get_my_role() = 'manager');

CREATE POLICY "System can insert badges"
  ON worker_badges FOR INSERT
  WITH CHECK (get_my_role() = 'manager' OR worker_id = auth.uid());

-- -------------------------
-- QUALITY ISSUES — reporters + managers
-- -------------------------
CREATE POLICY "Workers see own quality issues"
  ON quality_issues FOR SELECT
  USING (worker_id = auth.uid() OR get_my_role() = 'manager');

CREATE POLICY "Workers can report quality issues"
  ON quality_issues FOR INSERT
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Managers can resolve quality issues"
  ON quality_issues FOR UPDATE
  USING (get_my_role() = 'manager');

-- -------------------------
-- TASK NOTES — task participants + managers
-- -------------------------
CREATE POLICY "View notes for own tasks"
  ON task_notes FOR SELECT
  USING (worker_id = auth.uid() OR get_my_role() = 'manager');

CREATE POLICY "Workers can add notes to own tasks"
  ON task_notes FOR INSERT
  WITH CHECK (worker_id = auth.uid());
