-- Seed data for MAAOS testing & development

INSERT INTO users (id, name, email, password_hash)
VALUES 
    ('user-uuid-001', 'Ann Maria', 'ann.maria@university.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW')
ON CONFLICT (id) DO NOTHING;

INSERT INTO emails (id, user_id, google_message_id, subject, sender, body_snippet, received_at)
VALUES 
    ('email-uuid-001', 'user-uuid-001', 'msg-google-101', 'CS101 Final Project Submission', 'prof.smith@university.edu', 'Submit your preliminary report by Friday 11:59 PM.', CURRENT_TIMESTAMP),
    ('email-uuid-002', 'user-uuid-001', 'msg-google-102', 'Assignment 3 Update', 'ta.johnson@university.edu', 'Review updated rubric before submitting task.', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, user_id, email_id, title, type, due_date, priority, status)
VALUES 
    ('task-uuid-001', 'user-uuid-001', 'email-uuid-001', 'CS101 Final Project Preliminary Report', 'Assignment', CURRENT_TIMESTAMP + INTERVAL '2 days', 'high', 'pending'),
    ('task-uuid-002', 'user-uuid-001', 'email-uuid-002', 'Review Assignment 3 Rubric', 'Review', CURRENT_TIMESTAMP + INTERVAL '1 days', 'medium', 'pending')
ON CONFLICT (id) DO NOTHING;
