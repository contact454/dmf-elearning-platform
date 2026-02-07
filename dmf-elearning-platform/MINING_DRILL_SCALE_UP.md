# ⛏️ MINING DRILL - Scale-Up Guide

## ✅ TEST RUN COMPLETED

**Kết quả:** 100 words mined với 100% success rate!

**Chất lượng:**
- ✅ Vietnamese translations: Perfect
- ✅ Level classification: Appropriate (61% A1, 34% A2, 5% B1)
- ✅ Topic categorization: Vietnamese topics
- ✅ POS tagging: Accurate

---

## 🚀 SCALE-UP OPTIONS

### Option 1: Mining 1,000 Words (Recommended for next step)

```javascript
// Edit: services/learning-service/scripts/mining-drill.mjs
// Line 18: Change SAFETY_LIMIT

const CONFIG = {
  // ... other config
  SAFETY_LIMIT: 50, // 50 batches × 20 words = 1,000 words
};
```

**Run:**
```bash
ANTHROPIC_API_KEY="sk-RkrI5dh1d1kW7H2Ml6TWWS0sjYEuet3YBdmOPzxCS2JAyLcD" \
ANTHROPIC_BASE_URL="https://max37.aishopacc.live" \
ANTHROPIC_MODEL="claude-sonnet-4-5" \
node services/learning-service/scripts/mining-drill.mjs
```

**Expected:**
- Duration: ~5-10 minutes
- Cost: ~$0.80 USD
- Output: 1,000 high-quality words

---

### Option 2: Mining 10,000 Words (Full production dataset)

```javascript
const CONFIG = {
  SAFETY_LIMIT: 500, // 500 batches × 20 words = 10,000 words
};
```

**Expected:**
- Duration: ~1 hour
- Cost: ~$8.00 USD
- Output: 10,000 words across A1-C2

---

### Option 3: Unlimited Mining (Process entire file)

```javascript
const CONFIG = {
  SAFETY_LIMIT: Infinity, // No limit - process everything
};
```

**Warning:** File is 934MB, có thể có hàng trăm nghìn từ!

**Recommended approach:**
1. Chạy với limit 10,000 từ trước
2. Validate chất lượng
3. Nếu OK, tăng dần

---

## 📊 EXPECTED LEVEL DISTRIBUTION

Based on test run, dự kiến phân bố:

| Level | Expected % | 1K words | 10K words |
|-------|-----------|----------|-----------|
| A1    | 40-50%    | 400-500  | 4,000-5,000 |
| A2    | 25-35%    | 250-350  | 2,500-3,500 |
| B1    | 10-15%    | 100-150  | 1,000-1,500 |
| B2    | 5-10%     | 50-100   | 500-1,000 |
| C1    | 3-5%      | 30-50    | 300-500 |
| C2    | 1-3%      | 10-30    | 100-300 |

---

## 🛡️ GATEKEEPER ADJUSTMENTS

Nếu muốn lọc chặt hơn hoặc lỏng hơn:

### Stricter Filter (Chỉ từ A1-B1 cơ bản):

```javascript
// Add to passesGatekeeper function:
if (entry.word.length > 12) return false; // Shorter words only
```

### Looser Filter (Cho phép cụm từ):

```javascript
// Remove space check:
// if (entry.word.includes(' ')) return false; // COMMENT THIS OUT
```

### Add compound word filter:

```javascript
// Add to passesGatekeeper:
if (entry.word.includes('-')) return false; // No compound words
```

---

## 🔍 VALIDATION AFTER MINING

Sau khi mine xong, chạy validation:

```bash
# Count words by level
cat services/learning-service/storage/resource-hub/mined_data.json | \
  jq '[.[] | .level] | group_by(.) | map({level: .[0], count: length})'

# Count words by topic
cat services/learning-service/storage/resource-hub/mined_data.json | \
  jq '[.[] | .topic] | group_by(.) | map({topic: .[0], count: length}) | sort_by(.count) | reverse | .[0:10]'

# Check for duplicates
cat services/learning-service/storage/resource-hub/mined_data.json | \
  jq '[.[] | .word] | group_by(.) | map(select(length > 1))'
```

---

## 💾 DATA ORGANIZATION

Sau khi mine xong, organize theo level:

```bash
# Script tách dữ liệu theo level
node << 'EOF'
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('services/learning-service/storage/resource-hub/mined_data.json'));

const byLevel = data.reduce((acc, word) => {
  if (!acc[word.level]) acc[word.level] = [];
  acc[word.level].push(word);
  return acc;
}, {});

Object.entries(byLevel).forEach(([level, words]) => {
  fs.writeFileSync(
    `services/learning-service/storage/resource-hub/${level}_mined.json`,
    JSON.stringify(words, null, 2)
  );
  console.log(`✅ Saved ${words.length} words to ${level}_mined.json`);
});
EOF
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Enable parallel batching (Advanced):

```javascript
// Process multiple batches in parallel
const PARALLEL_BATCHES = 3; // Process 3 batches simultaneously

// Use Promise.all to run batches concurrently
await Promise.all(
  batches.slice(0, PARALLEL_BATCHES).map(batch => processBatch(batch))
);
```

**Warning:** Có thể bị rate limit! Chỉ dùng nếu API cho phép.

---

## 🎯 NEXT STEPS RECOMMENDED

1. **Mine 1,000 words first** (5-10 minutes, $0.80)
2. **Validate quality** (check samples, stats)
3. **Organize by level** (split into separate files)
4. **If satisfied, mine 10,000 words** (1 hour, $8.00)
5. **Import to database**
6. **Create API endpoints**

---

## 💡 TIPS

### Monitor progress in real-time:

```bash
# Run in background and tail output
ANTHROPIC_API_KEY="..." node scripts/mining-drill.mjs > mining.log 2>&1 &

# Monitor progress
tail -f mining.log

# Check how many words saved so far
cat services/learning-service/storage/resource-hub/mined_data.json | grep -c '"word"'
```

### Resume from failure:

Script already appends to existing file, so if it crashes:
1. Check last successful batch in log
2. Simply re-run - it will continue appending
3. Remove duplicates afterward if needed

---

## 🚨 TROUBLESHOOTING

### Error: "Rate limit exceeded"

```javascript
// Increase delay between batches (line 143):
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
```

### Error: "Invalid JSON response"

- Claude sometimes returns markdown
- Script already handles this with JSON extraction
- If persists, check API endpoint

### Memory issues:

- Current implementation uses streaming - should handle large files
- If still issues, process in smaller chunks

---

**Ready to scale up! ⛏️**

Chờ lệnh của Tướng quân để:
1. Mine 1,000 words (test production)
2. Mine 10,000 words (full dataset)
3. Or customize mining parameters
