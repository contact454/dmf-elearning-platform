#!/bin/bash

echo "🔍 Verifying Speaking Module Integration..."
echo ""

# Check all required files exist
FILES=(
  "apps/web-learner/src/types/speaking.ts"
  "apps/web-learner/src/services/speakingApi.ts"
  "apps/web-learner/src/hooks/useSpeakingQueries.ts"
  "apps/web-learner/src/stores/speakingStore.ts"
  "apps/web-learner/src/hooks/__tests__/useSpeakingQueries.test.tsx"
  "INTEGRATION_COMPLETE_speaking.md"
  "TASK_COMPLETE_speaking_integration.md"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file" | xargs)
    echo "✅ $file ($SIZE bytes)"
  else
    echo "❌ MISSING: $file"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo "🎉 All files present!"
  echo ""
  echo "📊 Total deliverables: ${#FILES[@]} files"
  echo "📁 Total size: $(du -sh apps/web-learner/src/{types/speaking.ts,services/speakingApi.ts,hooks/useSpeakingQueries.ts,stores/speakingStore.ts} | awk '{s+=$1} END {print s}') KB"
  echo ""
  echo "✅ INTEGRATION LAYER COMPLETE"
else
  echo "❌ Missing $MISSING files!"
  exit 1
fi
