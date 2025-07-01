
-- Create demo companies
INSERT INTO public.companies (id, name, industry, email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'Information Technology', 'admin@techcorp.com'),
('550e8400-e29b-41d4-a716-446655440002', 'FinanceFlow Inc', 'Financial Services', 'admin@financeflow.com');

-- Create demo candidates (without user_id since users haven't signed up yet)
INSERT INTO public.candidates (id, company_id, full_name, email, phone, test_status, credentials_sent) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@test.com', '+1234567890', 'questions_generated', true),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'bob@test.com', '+1234567891', 'in_progress', true),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'Carol Davis', 'carol@test.com', '+1234567892', 'questions_generated', true),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'David Wilson', 'david@test.com', '+1234567893', 'pending', false),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Emma Brown', 'emma@test.com', '+1234567894', 'completed', true);

-- Add more question templates for different sections
INSERT INTO public.question_templates (
    section_id, question_number, scale_dimension, question_type, question_text, 
    industry_context, relevance_tag, difficulty_level, time_to_answer_seconds, 
    scoring_logic, options, correct_answer
) VALUES
-- Psychometric Assessment Questions
(
    (SELECT id FROM public.sections WHERE name = 'Psychometric Assessment' LIMIT 1),
    2, 'Communication', 'likert_scale', 
    'I enjoy presenting ideas to groups of people',
    'General', 'Communication skills', 'easy', 30,
    '{"scale": "1-5", "reverse": false}',
    '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]',
    NULL
),
(
    (SELECT id FROM public.sections WHERE name = 'Psychometric Assessment' LIMIT 1),
    3, 'Adaptability', 'likert_scale', 
    'I adapt quickly to changing work environments',
    'General', 'Change management', 'moderate', 30,
    '{"scale": "1-5", "reverse": false}',
    '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]',
    NULL
),
-- Language Skills Questions
(
    (SELECT id FROM public.sections WHERE name = 'Language Skills' LIMIT 1),
    1, 'Grammar', 'forced_choice',
    'Choose the correct sentence:',
    'General', 'Grammar proficiency', 'easy', 45,
    '{"correct_option": 2}',
    '["The team are working hard", "The team is working hard", "The team were working hard", "The team have working hard"]',
    'The team is working hard'
),
(
    (SELECT id FROM public.sections WHERE name = 'Language Skills' LIMIT 1),
    2, 'Vocabulary', 'forced_choice',
    'What does "meticulous" mean?',
    'General', 'Vocabulary assessment', 'moderate', 45,
    '{"correct_option": 1}',
    '["Very careful and precise", "Quick and efficient", "Creative and innovative", "Friendly and approachable"]',
    'Very careful and precise'
),
-- Situational Judgment Questions
(
    (SELECT id FROM public.sections WHERE name = 'Situational Judgment' LIMIT 1),
    2, 'Teamwork', 'sjt',
    'A colleague consistently misses deadlines, affecting team performance. What would you do?',
    'General', 'Team collaboration', 'moderate', 120,
    '{"scoring": "best_practice"}',
    '["Speak privately with the colleague about the issue", "Report to manager immediately", "Take over their tasks to ensure completion", "Ignore the issue and focus on your own work"]',
    NULL
),
-- Technical Assessment Questions
(
    (SELECT id FROM public.sections WHERE name = 'Technical Assessment' LIMIT 1),
    1, 'Problem Solving', 'forced_choice',
    'In software development, what does API stand for?',
    'IT', 'Technical knowledge', 'easy', 60,
    '{"correct_option": 0}',
    '["Application Programming Interface", "Advanced Programming Integration", "Automated Process Interface", "Application Process Integration"]',
    'Application Programming Interface'
),
(
    (SELECT id FROM public.sections WHERE name = 'Technical Assessment' LIMIT 1),
    2, 'Analysis', 'open_ended',
    'Describe how you would approach debugging a performance issue in a web application',
    'IT', 'Technical problem solving', 'hard', 300,
    '{"evaluation_criteria": ["systematic approach", "tool usage", "root cause analysis"]}',
    '[]',
    NULL
);

-- Generate specific questions for candidates
INSERT INTO public.questions (
    template_id, section_id, candidate_id, company_id, question_number, 
    question_text, question_type, options, time_limit_seconds, metadata
) 
SELECT 
    qt.id as template_id,
    qt.section_id,
    c.id as candidate_id,
    c.company_id,
    qt.question_number,
    qt.question_text,
    qt.question_type,
    qt.options,
    qt.time_to_answer_seconds,
    qt.metadata
FROM public.question_templates qt
CROSS JOIN public.candidates c
WHERE c.test_status IN ('questions_generated', 'in_progress', 'completed');

-- Add some sample answers for candidates who have started/completed tests
INSERT INTO public.answers (candidate_id, question_id, section_id, answer_data, time_taken_seconds)
SELECT 
    q.candidate_id,
    q.id as question_id,
    q.section_id,
    CASE 
        WHEN q.question_type = 'likert_scale' THEN '{"selected_option": 3, "value": "Agree"}'::jsonb
        WHEN q.question_type = 'forced_choice' THEN '{"selected_option": 1, "value": "The team is working hard"}'::jsonb
        WHEN q.question_type = 'sjt' THEN '{"selected_option": 0, "value": "Speak privately with the colleague about the issue"}'::jsonb
        WHEN q.question_type = 'open_ended' THEN '{"text_response": "I would start by identifying performance bottlenecks using browser dev tools and profiling..."}'::jsonb
        ELSE '{}'::jsonb
    END,
    FLOOR(RANDOM() * 60 + 30)::integer
FROM public.questions q
JOIN public.candidates c ON q.candidate_id = c.id
WHERE c.test_status IN ('in_progress', 'completed')
AND RANDOM() < 0.7; -- Only answer ~70% of questions

-- Create test sessions for candidates who have started
INSERT INTO public.test_sessions (candidate_id, section_id, started_at, completed_at, total_time_seconds, status)
SELECT 
    c.id as candidate_id,
    s.id as section_id,
    NOW() - INTERVAL '2 hours' as started_at,
    CASE 
        WHEN c.test_status = 'completed' THEN NOW() - INTERVAL '30 minutes'
        ELSE NULL
    END as completed_at,
    CASE 
        WHEN c.test_status = 'completed' THEN 5400 -- 90 minutes
        ELSE NULL
    END as total_time_seconds,
    CASE 
        WHEN c.test_status = 'completed' THEN 'completed'
        WHEN c.test_status = 'in_progress' THEN 'in_progress'
        ELSE 'in_progress'
    END as status
FROM public.candidates c
CROSS JOIN public.sections s
WHERE c.test_status IN ('in_progress', 'completed');
