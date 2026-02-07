-- Test Queries for Writing Module
-- Run these queries to verify the database schema and seed data

-- ============================================
-- 1. VERIFY TABLE CREATION
-- ============================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'prompts', 'essays', 'grammar_errors')
ORDER BY table_name;
-- Expected: 4 rows

-- ============================================
-- 2. VERIFY PROMPTS SEEDING
-- ============================================

-- Count total prompts
SELECT COUNT(*) as total_prompts FROM prompts;
-- Expected: 20

-- Count prompts by CEFR level
SELECT cefr_level, COUNT(*) as count
FROM prompts 
GROUP BY cefr_level 
ORDER BY cefr_level;
-- Expected: A1=5, A2=5, B1=5, B2=5

-- Count prompts by category
SELECT category, COUNT(*) as count
FROM prompts 
GROUP BY category
ORDER BY count DESC;

-- ============================================
-- 3. VERIFY PROMPT DATA QUALITY
-- ============================================

-- Check for duplicate titles
SELECT title, COUNT(*) 
FROM prompts 
GROUP BY title 
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Check all prompts have tips
SELECT title 
FROM prompts 
WHERE tips IS NULL OR tips::text = '{}';
-- Expected: 0 rows

-- Check word count targets increase with CEFR level
SELECT cefr_level, 
       MIN(target_word_count) as min_words,
       MAX(target_word_count) as max_words,
       AVG(target_word_count)::INT as avg_words
FROM prompts 
GROUP BY cefr_level
ORDER BY cefr_level;
-- Expected: A1 < A2 < B1 < B2

-- ============================================
-- 4. TEST COMMON QUERIES
-- ============================================

-- Get all prompts for a CEFR level
SELECT id, title, description, category, target_word_count
FROM prompts 
WHERE cefr_level = 'B1' 
ORDER BY title;
-- Should use idx_prompts_cefr_level

-- Get prompts by category
SELECT id, title, cefr_level, target_word_count
FROM prompts 
WHERE category = 'daily_life'
ORDER BY cefr_level, title;
-- Should use idx_prompts_category

-- Get prompt with tips (JSONB)
SELECT title, 
       cefr_level, 
       tips->'tips' as writing_tips
FROM prompts 
WHERE cefr_level = 'A1'
LIMIT 1;

-- ============================================
-- 5. TEST INDEX PERFORMANCE
-- ============================================

-- Verify index usage for CEFR level query
EXPLAIN ANALYZE
SELECT * FROM prompts WHERE cefr_level = 'B1';
-- Should show: Index Scan using idx_prompts_cefr_level

-- Verify index usage for category query
EXPLAIN ANALYZE
SELECT * FROM prompts WHERE category = 'opinion';
-- Should show: Index Scan using idx_prompts_category

-- ============================================
-- 6. TEST CONSTRAINTS
-- ============================================

-- Test CEFR level constraint (should fail)
-- INSERT INTO prompts (title, description, cefr_level, category, target_word_count)
-- VALUES ('Test', 'Test description', 'X1', 'test', 100);
-- Expected: ERROR - check constraint "check_cefr_level" is violated

-- Test target word count constraint (should fail)
-- INSERT INTO prompts (title, description, cefr_level, category, target_word_count)
-- VALUES ('Test', 'Test description', 'A1', 'test', 0);
-- Expected: ERROR - check constraint "check_target_word_count" is violated

-- ============================================
-- 7. SAMPLE DATA RETRIEVAL
-- ============================================

-- Get all A1 level prompts with tips
SELECT 
  title,
  description,
  target_word_count,
  jsonb_array_length(tips->'tips') as num_tips,
  tips->'tips'->0 as first_tip
FROM prompts
WHERE cefr_level = 'A1'
ORDER BY title;

-- Get prompts grouped by category with counts
SELECT 
  category,
  COUNT(*) as prompt_count,
  AVG(target_word_count)::INT as avg_word_count,
  STRING_AGG(DISTINCT cefr_level, ', ' ORDER BY cefr_level) as levels
FROM prompts
GROUP BY category
ORDER BY prompt_count DESC;

-- ============================================
-- 8. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================

-- Insert test user
INSERT INTO users (email, password_hash, name, tier)
VALUES ('test@example.com', 'hashed_password_here', 'Test User', 'free')
RETURNING id, email, tier, created_at;

-- Insert test essay (use user_id from above)
-- INSERT INTO essays (user_id, prompt_id, content, word_count, status)
-- VALUES (
--   'USER_ID_HERE',
--   (SELECT id FROM prompts WHERE cefr_level = 'A1' LIMIT 1),
--   'Das ist ein Test Essay.',
--   5,
--   'draft'
-- )
-- RETURNING id, user_id, prompt_id, word_count, status, created_at;

-- Test CASCADE DELETE (delete user should delete essays)
-- DELETE FROM users WHERE email = 'test@example.com';
-- Expected: Essays are also deleted

-- ============================================
-- 9. PERFORMANCE BENCHMARKS
-- ============================================

-- Benchmark: Get user's recent essays (with composite index)
EXPLAIN ANALYZE
SELECT e.id, e.content, e.word_count, e.error_count, 
       p.title as prompt_title, e.created_at
FROM essays e
LEFT JOIN prompts p ON e.prompt_id = p.id
WHERE e.user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY e.created_at DESC
LIMIT 10;
-- Should use idx_essays_user_created

-- Benchmark: Get all errors for an essay
EXPLAIN ANALYZE
SELECT error_type, message, suggestions 
FROM grammar_errors 
WHERE essay_id = '00000000-0000-0000-0000-000000000000'
ORDER BY offset;
-- Should use idx_grammar_errors_essay_id

-- ============================================
-- 10. DATA STATISTICS
-- ============================================

-- Overall database statistics
SELECT 
  'Prompts' as table_name, COUNT(*) as row_count FROM prompts
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Essays', COUNT(*) FROM essays
UNION ALL
SELECT 'Grammar Errors', COUNT(*) FROM grammar_errors;

-- Prompts statistics
SELECT 
  COUNT(*) as total_prompts,
  COUNT(DISTINCT cefr_level) as unique_levels,
  COUNT(DISTINCT category) as unique_categories,
  AVG(target_word_count)::INT as avg_target_words,
  MIN(target_word_count) as min_words,
  MAX(target_word_count) as max_words
FROM prompts;
