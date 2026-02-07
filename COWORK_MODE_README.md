# 🤖 DMF Platform - Cowork Mode Automation Scripts

## 🎯 Mục đích

Scripts tự động hóa để quản lý DMF E-Learning Platform với 1 câu lệnh!

## 📋 Scripts có sẵn

### 1. `dmf-start-all.sh` - Khởi động tất cả services

**Chức năng:**
- ✅ Check và start Ollama (nếu chưa chạy)
- ✅ Start Motivation Progress Service (port 3005)
- ✅ Start Gamification Service (port 3006)
- ✅ Start Onboarding Service (port 3002, nếu có)
- ✅ Start Web Frontend (port 3000)
- ✅ Tự động tạo log files tại `/tmp/dmf-logs/`

**Sử dụng:**
```bash
./dmf-start-all.sh
```

**Output:**
```
========================================
   DMF E-Learning Platform Startup
========================================

✓ Ollama is running on port 11434
✓ motivation-progress-service started successfully (PID: 12345)
  Log: /tmp/dmf-logs/motivation-progress-service.log
✓ gamification-service started successfully (PID: 12346)
  Log: /tmp/dmf-logs/gamification-service.log
✓ web-learner started successfully (PID: 12347)
  Log: /tmp/dmf-logs/web-learner.log

========================================
   All Services Started!
========================================

Access Points:
  Frontend:       http://localhost:3000
  Motivation API: http://localhost:3005/health
  Gamification:   http://localhost:3006/health
  Ollama API:     http://localhost:11434/api/tags
```

---

### 2. `dmf-stop-all.sh` - Dừng tất cả services

**Sử dụng:**
```bash
./dmf-stop-all.sh
```

**Output:**
```
✓ Stopped web-learner (PID: 12347)
✓ Stopped motivation-progress-service (PID: 12345)
✓ Stopped gamification-service (PID: 12346)

All services stopped!
```

---

### 3. `dmf-monitor.sh` - Giám sát health & logs

**Sử dụng:**
```bash
# Kiểm tra health của tất cả services
./dmf-monitor.sh

# Xem logs chi tiết của 1 service
./dmf-monitor.sh motivation-progress-service
./dmf-monitor.sh web-learner
./dmf-monitor.sh gamification-service
./dmf-monitor.sh ollama
```

**Output:**
```
========================================
   DMF Platform Monitor
========================================

✓ Ollama is HEALTHY
✓ Motivation Progress is HEALTHY
✓ Gamification is HEALTHY
✓ Frontend is UP
✓ AI Tutor response time is good
```

---

### 4. `dmf-optimize-ollama.sh` - Tối ưu hóa Ollama

**Chức năng:**
- Đo response time của AI Tutor
- Nếu > 10s: Tự động tạo model optimized với:
  - `num_thread` = CPU cores / 2
  - `num_ctx` = 2048 (giảm context)
  - `num_predict` = 300 (giới hạn output)

**Sử dụng:**
```bash
./dmf-optimize-ollama.sh
```

**Output:**
```
Ollama Auto-Optimizer

System Info:
  CPU Cores: 8
  Recommended Threads: 4

Testing AI Tutor response time...
  Response Time: 12s
⚠ Response time is slow (>10s)
Optimizing Ollama configuration...

✓ Optimized model created: llama3.2-optimized

To use the optimized model, update AITutorService:
  Model name: llama3.2-optimized
```

---

## 🚀 Quick Start

```bash
# 1. Khởi động tất cả
./dmf-start-all.sh

# 2. Kiểm tra health
./dmf-monitor.sh

# 3. Nếu AI chậm
./dmf-optimize-ollama.sh

# 4. Dừng tất cả
./dmf-stop-all.sh
```

---

## 📁 Log Files

Tất cả logs được lưu tại: `/tmp/dmf-logs/`

```bash
# Xem log realtime
tail -f /tmp/dmf-logs/motivation-progress-service.log

# Xem tất cả logs
ls -lh /tmp/dmf-logs/

# Xóa logs
rm -rf /tmp/dmf-logs/*
```

---

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Tìm process đang dùng port
lsof -i :3005

# Kill process
kill <PID>
```

### Service không start
```bash
# Xem log chi tiết
cat /tmp/dmf-logs/<service-name>.log

# Restart service
./dmf-stop-all.sh
./dmf-start-all.sh
```

### Ollama không kết nối được
```bash
# Check Ollama
curl http://127.0.0.1:11434/api/tags

# Restart Ollama với CORS
pkill ollama
OLLAMA_ORIGINS="*" ollama serve
```

---

## 🎓 Advanced: Auto-healing

Để tự động sửa lỗi khi phát hiện, chạy monitor ở background:

```bash
# Tạo auto-healing loop
while true; do
    ./dmf-monitor.sh > /tmp/dmf-monitor-report.txt
    if grep -q "DOWN\|ERROR" /tmp/dmf-monitor-report.txt; then
        echo "⚠ Issue detected! Restarting services..."
        ./dmf-stop-all.sh
        sleep 3
        ./dmf-start-all.sh
    fi
    sleep 60  # Check mỗi 60s
done &
```

---

## 🎯 Integration với Claude Code

Claude Code có thể:
1. ✅ Tự động chạy `dmf-monitor.sh` khi bạn báo lỗi
2. ✅ Đọc logs và phân tích nguyên nhân
3. ✅ Sửa code và restart services
4. ✅ Verify fix bằng health check

**Workflow:**
```
Bạn: "Server bị lỗi"
  ↓
Claude: ./dmf-monitor.sh → đọc logs → phát hiện lỗi TypeScript
  ↓
Claude: Fix code → git commit → restart service
  ↓
Claude: ./dmf-monitor.sh → verify "✓ All healthy"
  ↓
Báo cáo: "Đã fix lỗi và restart service thành công!"
```

---

## 📊 Memory MCP Integration

Project context đã được lưu vào Knowledge Graph:
- DMF Elearning Platform
- Motivation Progress Service (port 3005)
- Gamification Service (port 3006)
- Web Learner (port 3000)
- Ollama (port 11434, models: llama3.2, qwen3:30b)

Claude Code sẽ nhớ tất cả thông tin này qua các session!

---

**Tất cả scripts đã sẵn sàng! Chỉ cần 1 câu lệnh là bạn có toàn bộ platform running! 🚀**
