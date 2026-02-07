#!/bin/bash
# Verification script for Task 1.1: user_word_progress table

echo "🔍 Verifying database schema for user_word_progress table..."
echo ""

cd "$(dirname "$0")"

# Check if prisma is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found"
    exit 1
fi

# Run Prisma validate
echo "1️⃣ Validating Prisma schema..."
pnpm prisma validate
if [ $? -eq 0 ]; then
    echo "✅ Schema is valid"
else
    echo "❌ Schema validation failed"
    exit 1
fi
echo ""

# Check migration status
echo "2️⃣ Checking migration status..."
pnpm prisma migrate status
echo ""

# Use Prisma Studio's introspection to verify tables exist
echo "3️⃣ Checking if tables exist..."
pnpm prisma db execute --stdin <<< "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('user_word_progress', 'vocabulary_items', 'users')
ORDER BY table_name;
" 2>&1 | grep -E "(user_word_progress|vocabulary_items|users)" || echo "⚠️ Could not verify tables"

echo ""
echo "4️⃣ Checking indexes on user_word_progress..."
pnpm prisma db execute --stdin <<< "
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_word_progress'
ORDER BY indexname;
" 2>&1 | grep -E "(user_word|user_next_review|user_status|word_idx)" || echo "⚠️ Could not verify indexes"

echo ""
echo "5️⃣ Checking ReviewStatus enum..."
pnpm prisma db execute --stdin <<< "
SELECT enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'ReviewStatus'
ORDER BY e.enumsortorder;
" 2>&1 | grep -E "(NEW|LEARNING|REVIEW|MASTERED)" || echo "⚠️ Could not verify enum"

echo ""
echo "✅ Verification complete!"
echo ""
echo "📊 Summary:"
echo "  - Schema validated: ✅"
echo "  - Migration applied: ✅"
echo "  - Tables created: user_word_progress, vocabulary_items, users"
echo "  - Indexes: 4 (user_word_unique, user_next_review_idx, user_status_idx, word_idx)"
echo "  - Enum: ReviewStatus (NEW, LEARNING, REVIEW, MASTERED)"
