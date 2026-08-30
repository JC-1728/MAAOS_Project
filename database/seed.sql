-- database/seed.sql
-- Seed data for MAAOS test user and conflict scenario

USE maaos_db;

INSERT INTO users (user_id, email, password_hash, first_name)
VALUES(1, 'student@example.com', 'hashed_pw', 'Student')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

INSERT INTO tasks (task_id, user_id, title, description, deadline, priority, status)
VALUES(1, 1, 'DBMS Assignment Submission', 'Submit ER Diagram and SQL Scripts', '2026-09-01 11:00:00', 1, 'pending'),
(2, 1, 'Java Lab Record', 'Complete Programs 1-10', '2026-09-01 11:30:00', 2, 'pending'),
(3, 1, 'Software Project Review', 'Prepare Sprint Demo', '2026-09-02 15:00:00', 3, 'pending')
ON DUPLICATE KEY UPDATE title=VALUES(title), deadline=VALUES(deadline), priority=VALUES(priority);

INSERT INTO schedules (schedule_id, user_id, start_time, end_time, activity)
VALUES(1, 1, '2026-09-01 09:00:00', '2026-09-01 10:00:00', 'Computer Networks Lecture'),
(2, 1, '2026-09-01 13:15:00', '2026-09-01 14:15:00', 'Cyber Forensics')
ON DUPLICATE KEY UPDATE activity=VALUES(activity), start_time=VALUES(start_time), end_time=VALUES(end_time);
