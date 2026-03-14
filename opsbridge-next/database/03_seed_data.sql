-- =============================================================
-- Seed Data — Sample data for development and testing
-- Run AFTER 01_schema.sql and 02_rls_policies.sql
--
-- IMPORTANT: Before running this, you must first create the
-- auth users in Supabase Dashboard → Authentication → Users.
-- Create these two users:
--   manager@opsbridge.test  / password: Test1234!
--   worker1@opsbridge.test  / password: Test1234!
--   worker2@opsbridge.test  / password: Test1234!
--
-- Then replace the UUIDs below with the real auth user IDs
-- from Authentication → Users (the "User UID" column).
-- =============================================================

-- Replace these with real auth user IDs from Supabase Auth dashboard
DO $$
DECLARE
  manager_id UUID := 'REPLACE-WITH-MANAGER-AUTH-UUID';
  worker1_id UUID := 'REPLACE-WITH-WORKER1-AUTH-UUID';
  worker2_id UUID := 'REPLACE-WITH-WORKER2-AUTH-UUID';
  morning_id UUID;
  night_id   UUID;
  task1_id   UUID;
  task2_id   UUID;
BEGIN

-- Shifts
INSERT INTO shifts (id, name, start_time, end_time) VALUES
  (gen_random_uuid(), 'Morning Shift / 早班', '06:00', '14:00'),
  (gen_random_uuid(), 'Night Shift / 夜班',   '22:00', '06:00')
RETURNING id INTO morning_id;

SELECT id INTO morning_id FROM shifts WHERE name LIKE 'Morning%' LIMIT 1;
SELECT id INTO night_id   FROM shifts WHERE name LIKE 'Night%'   LIMIT 1;

-- Workers (profiles — linked to auth users created above)
INSERT INTO workers (id, name_en, name_zh, role, shift_id) VALUES
  (manager_id, 'Alex Manager', '艾力克斯', 'manager', morning_id),
  (worker1_id, 'Wei Lin',      '林威',     'worker',  morning_id),
  (worker2_id, 'Fang Li',      '李芳',     'worker',  night_id);

-- Tasks
INSERT INTO tasks (id, title_en, title_zh, description_en, description_zh,
                   shift_id, assigned_worker_id, created_by, priority, due_time)
VALUES
  (gen_random_uuid(),
   'Inspect Assembly Line A',
   '检查装配线A',
   'Perform visual inspection of all joints on Assembly Line A. Check for loose connections, debris, and alignment.',
   '对装配线A的所有接头进行目视检查。检查连接松动、杂物和对齐情况。',
   morning_id, worker1_id, manager_id, 'high', '09:00'),
  (gen_random_uuid(),
   'Clean Workstation 3',
   '清洁工作台3',
   'Clean and sanitise Workstation 3 at the end of shift. Remove all materials and wipe down all surfaces.',
   '在班次结束时清洁和消毒工作台3。移除所有材料并擦拭所有表面。',
   morning_id, worker1_id, manager_id, 'medium', '13:30'),
  (gen_random_uuid(),
   'Restock Component Bin B4',
   '补充零件箱B4',
   'Count current stock in Bin B4. If below 50 units, restock from Storage Room 2, Shelf 4.',
   '清点B4箱的现有库存。如果低于50件，从2号储藏室第4层货架补货。',
   night_id, worker2_id, manager_id, 'low', '23:00')
RETURNING id INTO task1_id;

SELECT id INTO task1_id FROM tasks WHERE title_en = 'Inspect Assembly Line A' LIMIT 1;
SELECT id INTO task2_id FROM tasks WHERE title_en = 'Clean Workstation 3' LIMIT 1;

-- SOP Steps for task 1: Inspect Assembly Line A
INSERT INTO sop_steps (task_id, step_number, instruction_en, instruction_zh, step_type)
VALUES
  (task1_id, 1,
   'Put on safety gloves and goggles before approaching the line.',
   '靠近生产线前，请戴上安全手套和护目镜。',
   'standard'),
  (task1_id, 2,
   'Walk the full length of Assembly Line A and note any visible damage or debris.',
   '沿装配线A全程巡视，记录所有可见的损坏或杂物。',
   'standard'),
  (task1_id, 3,
   'Check all joint connections — they should be tight with no visible gaps.',
   '检查所有接头连接——应紧密无间隙。',
   'quality_check'),
  (task1_id, 4,
   'Report findings to manager via the app task notes section.',
   '通过应用程序任务备注部分向管理员报告检查结果。',
   'standard');

-- SOP Steps for task 2: Clean Workstation 3
INSERT INTO sop_steps (task_id, step_number, instruction_en, instruction_zh, step_type)
VALUES
  (task2_id, 1,
   'Remove all materials and tools from the workstation surface.',
   '从工作台表面移除所有材料和工具。',
   'standard'),
  (task2_id, 2,
   'Wipe all surfaces with the approved cleaning solution (located under the bench).',
   '用批准的清洁液（位于工作台下方）擦拭所有表面。',
   'standard'),
  (task2_id, 3,
   'Verify the workstation is clean and ready for the next shift.',
   '确认工作台已清洁并为下一班次做好准备。',
   'quality_check');

-- Badge definitions
INSERT INTO badge_definitions (name_en, name_zh, description_en, description_zh, trigger_type, trigger_value) VALUES
  ('First Step',         '第一步',     'Complete your first task',                '完成您的第一个任务',           'first_task',               NULL),
  ('Task Streak',        '连续达标',   'Complete tasks on time 5 days in a row',  '连续5天按时完成任务',          'streak_5_days',            5),
  ('Quality Champion',   '品质冠军',   'Pass 20 quality checks without a fail',   '连续通过20次质量检查无失败',   'quality_20_pass',          20),
  ('Speed Learner',      '快速学习',   'Complete a new task type for first time',  '首次完成新类型任务',          'new_task_type',            NULL),
  ('Early Bird',         '早班英雄',   'Complete all morning shift tasks on time', '按时完成所有早班任务',         'morning_shift_complete',   NULL),
  ('Problem Reporter',   '安全卫士',   'Report 5 quality issues',                 '报告5次质量问题',             'issue_reporter_5',         5),
  ('Full Week',          '满勤奖',     'Complete tasks every day for a full week', '整周每天完成任务',             'full_week',                7),
  ('Century',            '百分达成',   'Complete 100 total tasks',                '累计完成100个任务',           'tasks_100',                100);

END $$;
