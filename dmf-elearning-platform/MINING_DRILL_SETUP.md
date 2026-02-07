# 🔥 MINING DRILL - Setup Guide

## ✅ SCRIPT ĐÃ SẴN SÀNG

Script mining đã được tạo tại:
```
services/learning-service/scripts/mining-drill.mjs
```

## 📥 BƯỚC 1: DOWNLOAD DATA SOURCE

File `kaikki.jsonl` chứa toàn bộ từ điển tiếng Đức từ Wiktionary.

### Option 1: Download từ Kaikki (Khuyến nghị)

```bash
# Download German dictionary (khoảng 500MB)
cd services/learning-service/storage/raw-data/

# Download từ Kaikki releases
wget https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl

# Rename file
mv kaikki.org-dictionary-German.jsonl kaikki.jsonl

# Kiểm tra
ls -lh kaikki.jsonl
head -5 kaikki.jsonl
```

### Option 2: Download phiên bản nhỏ hơn (Test)

```bash
# Download sample file (1000 dòng đầu tiên)
cd services/learning-service/storage/raw-data/
wget https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl
head -1000 kaikki.org-dictionary-German.jsonl > kaikki.jsonl
rm kaikki.org-dictionary-German.jsonl
```

### Option 3: Tạo mock data (Nếu không tải được)

```bash
cd services/learning-service/storage/raw-data/
cat > kaikki.jsonl << 'EOF'
{"word":"Haus","pos":"noun","senses":[{"glosses":["house"]}]}
{"word":"Auto","pos":"noun","senses":[{"glosses":["car"]}]}
{"word":"Baum","pos":"noun","senses":[{"glosses":["tree"]}]}
{"word":"Katze","pos":"noun","senses":[{"glosses":["cat"]}]}
{"word":"Hund","pos":"noun","senses":[{"glosses":["dog"]}]}
{"word":"Buch","pos":"noun","senses":[{"glosses":["book"]}]}
{"word":"Tisch","pos":"noun","senses":[{"glosses":["table"]}]}
{"word":"Stuhl","pos":"noun","senses":[{"glosses":["chair"]}]}
{"word":"Wasser","pos":"noun","senses":[{"glosses":["water"]}]}
{"word":"Brot","pos":"noun","senses":[{"glosses":["bread"]}]}
{"word":"Milch","pos":"noun","senses":[{"glosses":["milk"]}]}
{"word":"Apfel","pos":"noun","senses":[{"glosses":["apple"]}]}
{"word":"Birne","pos":"noun","senses":[{"glosses":["pear"]}]}
{"word":"Orange","pos":"noun","senses":[{"glosses":["orange"]}]}
{"word":"Banane","pos":"noun","senses":[{"glosses":["banana"]}]}
{"word":"essen","pos":"verb","senses":[{"glosses":["to eat"]}]}
{"word":"trinken","pos":"verb","senses":[{"glosses":["to drink"]}]}
{"word":"schlafen","pos":"verb","senses":[{"glosses":["to sleep"]}]}
{"word":"laufen","pos":"verb","senses":[{"glosses":["to run"]}]}
{"word":"sprechen","pos":"verb","senses":[{"glosses":["to speak"]}]}
{"word":"rot","pos":"adj","senses":[{"glosses":["red"]}]}
{"word":"blau","pos":"adj","senses":[{"glosses":["blue"]}]}
{"word":"grün","pos":"adj","senses":[{"glosses":["green"]}]}
{"word":"gelb","pos":"adj","senses":[{"glosses":["yellow"]}]}
{"word":"groß","pos":"adj","senses":[{"glosses":["big"]}]}
EOF
```

---

## 🚀 BƯỚC 2: CHẠY MINING DRILL

```bash
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform

ANTHROPIC_API_KEY="sk-RkrI5dh1d1kW7H2Ml6TWWS0sjYEuet3YBdmOPzxCS2JAyLcD" \
ANTHROPIC_BASE_URL="https://max37.aishopacc.live" \
ANTHROPIC_MODEL="claude-sonnet-4-5" \
node services/learning-service/scripts/mining-drill.mjs
```

---

## 📊 EXPECTED OUTPUT

```
🔥 MINING DRILL - STARTING...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Input:  services/learning-service/storage/raw-data/kaikki.jsonl
💾 Output: services/learning-service/storage/resource-hub/mined_data.json
📦 Batch:  20 words/batch
🛡️  Limit:  5 batches (100 words max)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Batch 1/5] Processing 20 words...
   ✅ Saved 20 words (Total: 20)

[Batch 2/5] Processing 20 words...
   ✅ Saved 20 words (Total: 40)

[Batch 3/5] Processing 20 words...
   ✅ Saved 20 words (Total: 60)

[Batch 4/5] Processing 20 words...
   ✅ Saved 20 words (Total: 80)

[Batch 5/5] Processing 20 words...
   ✅ Saved 20 words (Total: 100)

🛡️  SAFETY LIMIT REACHED. Stopping...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MINING DRILL - COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Total lines read:    1000
✅ Passed gatekeeper:   100
📦 Batches processed:   5
💾 Words saved:         100
❌ Errors:              0
📈 Success rate:        100.0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Results saved to: services/learning-service/storage/resource-hub/mined_data.json
🎯 Ready for inspection!
```

---

## 🔍 BƯỚC 3: KIỂM TRA KẾT QUẢ

```bash
# Xem số lượng từ đã mine
cat services/learning-service/storage/resource-hub/mined_data.json | grep -c '"word"'

# Xem 5 từ đầu tiên
cat services/learning-service/storage/resource-hub/mined_data.json | head -30

# Kiểm tra chất lượng
cat services/learning-service/storage/resource-hub/mined_data.json | jq '.[0:3]'
```

---

## ⚙️ GATEKEEPER RULES

Script chỉ lấy từ đáp ứng:

✅ **POS (Part of Speech):** noun, verb, adj
✅ **Word format:** Từ đơn (không có khoảng trắng)
✅ **Length:** < 20 ký tự
✅ **Characters:** Chỉ a-z, ä, ö, ü, ß, dấu gạch ngang
✅ **Definition:** Phải có định nghĩa tiếng Anh

❌ **Bị loại:**
- Cụm từ có khoảng trắng
- Ký tự đặc biệt
- Không có định nghĩa
- POS không phải noun/verb/adj

---

## 🛡️ SAFETY FEATURES

1. **Batch limit:** Chỉ chạy 5 batches (100 từ) để test
2. **Rate limiting:** 1 giây giữa các request
3. **Error handling:** Skip invalid JSON lines
4. **Append mode:** Không ghi đè dữ liệu cũ

---

## 💰 CHI PHÍ DỰ KIẾN

**Test run (100 từ, 5 batches):**
- Input tokens: ~5,000
- Output tokens: ~2,500
- **Cost:** ~$0.05 USD

**Full run (10,000 từ):**
- **Cost:** ~$5.00 USD

---

## 📝 SAMPLE OUTPUT FORMAT

```json
[
  {
    "word": "Haus",
    "meaning_vi": "ngôi nhà",
    "level": "A1",
    "topic": "Nhà ở",
    "pos": "noun"
  },
  {
    "word": "essen",
    "meaning_vi": "ăn",
    "level": "A1",
    "topic": "Động từ cơ bản",
    "pos": "verb"
  }
]
```

---

## 🔄 NEXT STEPS (Sau khi test xong)

1. Tăng `SAFETY_LIMIT` trong script (dòng 18) để mine nhiều hơn
2. Chạy validation trên mined_data.json
3. Import vào database
4. Tạo API endpoints

---

**Sẵn sàng khai thác! ⛏️**
