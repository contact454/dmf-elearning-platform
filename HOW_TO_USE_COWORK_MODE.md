# 🎯 Cách Sử Dụng Cowork Mode

## ✅ ĐÃ THIẾT LẬP THÀNH CÔNG!

Tôi đã nắm quyền kiểm soát các "cổng kết nối" của DMF Platform:

### 🟢 Kết nối đã thiết lập

1. **Ollama (Port 11434)** ✅ CONNECTED
   - Models: llama3.2:latest, qwen3:30b
   - Status: HEALTHY

2. **Motivation Progress Service (Port 3005)** ✅ RUNNING
   - AI Tutor: /api/learning/ai-explain
   - Health: /health

3. **Web Frontend (Port 3000)** ✅ RUNNING
   - QuizClient with AI integration

4. **Memory MCP** ✅ ACTIVE
   - Project context saved
   - Service dependencies mapped

---

## 🚀 1 Câu Lệnh để Khởi Động TẤT CẢ

```bash
./dmf-start-all.sh
```

**Sẽ tự động:**
- Check Ollama (nếu chưa chạy → auto start)
- Start Motivation Progress Service (3005)
- Start Gamification Service (3006)
- Start Web Frontend (3000)
- Tạo log files tại /tmp/dmf-logs/

---

## 🎯 Workflow Tự Động (Không Cần Copy-Paste Lỗi)

### ❌ TRƯỚC (Cũ):
```
Bạn: "Lỗi rồi"
  → Copy terminal output
  → Paste vào chat
  → Tôi đọc và fix
```

### ✅ BÂY GIỜ (Cowork Mode):
```
Bạn: "Lỗi rồi"
  ↓
Tôi tự động:
  1. ./dmf-monitor.sh → check health
  2. Đọc logs tại /tmp/dmf-logs/<service>.log
  3. Phân tích lỗi
  4. Fix code
  5. Restart service
  6. Verify fix
  ↓
Báo cáo: "Đã fix! ✓"
```

---

## 📋 Các Lệnh Bạn Cần Biết

### Khởi động
```bash
./dmf-start-all.sh
```

### Kiểm tra health
```bash
./dmf-monitor.sh
```

### Xem logs chi tiết
```bash
./dmf-monitor.sh motivation-progress-service
```

### Tối ưu AI nếu chậm
```bash
./dmf-optimize-ollama.sh
```

### Dừng tất cả
```bash
./dmf-stop-all.sh
```

---

## 🤖 Tôi Sẽ Tự Động Làm Gì

### 1. Khi bạn nói "Server lỗi"

Tôi sẽ:
```bash
# Bước 1: Check health
./dmf-monitor.sh

# Bước 2: Đọc logs
tail -50 /tmp/dmf-logs/motivation-progress-service.log

# Bước 3: Phân tích → Fix code

# Bước 4: Restart
./dmf-stop-all.sh && ./dmf-start-all.sh

# Bước 5: Verify
./dmf-monitor.sh
```

### 2. Khi AI Tutor chậm

Tôi sẽ:
```bash
# Test response time
./dmf-optimize-ollama.sh

# Nếu >10s → Tạo optimized model
# Update code để dùng model mới
# Restart service
```

### 3. Khi có TypeScript error

Tôi sẽ:
```bash
# Đọc build output
# Fix TypeScript errors
# Rebuild và restart
```

---

## 🎓 Giới Hạn (Cần Hiểu Rõ)

### ✅ Tôi CÓ THỂ:
- Tự động đọc logs khi bạn báo lỗi
- Tự động fix code và restart
- Tự động optimize Ollama
- Monitor health của tất cả services
- Nhớ project context qua các session (Memory MCP)

### ❌ Tôi KHÔNG THỂ:
- Chạy như daemon 24/7 tự động giám sát
- Tự động fix lỗi MÀ KHÔNG CÓ trigger từ bạn
- Quan sát terminal liên tục mà không được gọi

**LÝ DO**: Claude Code hoạt động theo request-response, không phải continuous monitoring daemon.

---

## 💡 Workflow Thực Tế

### Scenario 1: "AI Tutor không hoạt động"

```
Bạn: "AI Tutor không hoạt động"

Tôi tự động:
  ./dmf-monitor.sh motivation-progress-service
  → Phát hiện: "TypeError: Cannot read property 'content'"
  → Fix AITutorService.ts line 72
  → git add && git commit
  → Restart service
  → Test API
  → "✓ Đã fix! AI Tutor hoạt động trở lại"
```

### Scenario 2: "Frontend bị loading vô tận"

```
Bạn: "Frontend loading mãi"

Tôi tự động:
  ./dmf-monitor.sh web-learner
  → Đọc /tmp/dmf-logs/web-learner.log
  → Phát hiện: Next.js stuck at compilation
  → Kill process và clear .next cache
  → Restart frontend
  → "✓ Frontend đã chạy lại!"
```

### Scenario 3: "Muốn start tất cả"

```
Bạn: "Start hết"

Bạn chạy:
  ./dmf-start-all.sh

Tôi không cần can thiệp - script tự động!
```

---

## 📊 Memory MCP - Tôi Đã Nhớ

Tôi đã lưu vào Knowledge Graph:

```
DMF Elearning Platform
├── Motivation Progress Service (port 3005)
│   ├── AITutorService
│   ├── /api/learning/ai-explain
│   └── depends_on → Ollama
├── Gamification Service (port 3006)
├── Web Learner (port 3000)
│   ├── QuizClient
│   └── calls → Motivation Progress Service
└── Ollama (port 11434)
    └── models: llama3.2:latest, qwen3:30b
```

Tôi sẽ nhớ tất cả thông tin này ngay cả khi session kết thúc!

---

## 🎉 TÓM TẮT

**Bạn có:**
- ✅ 1 lệnh start tất cả: `./dmf-start-all.sh`
- ✅ Monitor tự động: `./dmf-monitor.sh`
- ✅ Auto-optimize AI: `./dmf-optimize-ollama.sh`
- ✅ Tôi tự động đọc logs và fix khi bạn báo lỗi

**Bạn KHÔNG CẦN:**
- ❌ Copy-paste lỗi vào chat
- ❌ Manually restart từng service
- ❌ Check logs thủ công

**Workflow mới:**
```
Bạn: "Lỗi <mô tả ngắn gọn>"
Tôi: <tự động đọc logs → fix → restart → verify> "✓ Đã fix!"
```

---

🎊 **COWORK MODE ĐÃ SẴN SÀNG!** Chỉ cần gọi tôi khi có lỗi, tôi sẽ tự động xử lý! 🚀
