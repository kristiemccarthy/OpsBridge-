-- =============================================================
-- PostgreSQL Helper Functions
-- Run AFTER 01_schema.sql
-- =============================================================

-- Increment badge points for a worker (used by badge engine)
CREATE OR REPLACE FUNCTION increment_badge_points(p_worker_id UUID, p_points INT)
RETURNS VOID AS $$
  UPDATE workers
  SET badge_points = badge_points + p_points
  WHERE id = p_worker_id;
$$ LANGUAGE sql SECURITY DEFINER;
