# 🤖 Hướng dẫn Chạy Gia sư AI với Ollama + Llama 3.2

Tài liệu này hướng dẫn cách thiết lập và chạy Gia sư AI sử dụng Ollama với mô hình Llama 3.2 cho DMF E-Learning Platform.

---

## 📋 Yêu cầu hệ thống

- **RAM**: Tối thiểu 8GB (khuyến nghị 16GB cho Llama 3.2)
- **CPU**: Multi-core processor (khuyến nghị Apple Silicon M-series hoặc tương đương)
- **Disk**: ~2GB cho model
- **OS**: macOS, Linux, hoặc Windows (WSL2)

---

## 🚀 Bước 1: Cài đặt Ollama

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Tải installer từ [ollama.com](https://ollama.com/download)

---

## 📦 Bước 2: Pull Llama 3.2 Model

Mở terminal và chạy lệnh sau để tải mô hình Llama 3.2:

```bash
ollama pull llama3.2:latest
```

**Lưu ý**: Quá trình tải có thể mất 5-10 phút tùy vào tốc độ internet (kích thước ~2GB).

Kiểm tra model đã được pull thành công:

```bash
ollama list
```

Bạn sẽ thấy output tương tự:

```
NAME              ID              SIZE      MODIFIED
llama3.2:latest   a1b2c3d4e5f6    2.0 GB    2 minutes ago
```

---

## ⚙️ Bước 3: Chạy Ollama Service với CORS

**QUAN TRỌNG**: Để các microservices khác có thể gọi Ollama, bạn cần enable CORS bằng biến môi trường `OLLAMA_ORIGINS`.

### Cách 1: Chạy trực tiếp (Temporary Session)

```bash
OLLAMA_ORIGINS="*" ollama serve
```

### Cách 2: Export biến môi trường (Permanent cho session)

```bash
# macOS/Linux
export OLLAMA_ORIGINS="*"
ollama serve
```

```powershell
# Windows PowerShell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

### Cách 3: Thêm vào shell profile (Permanent)

**Bash** (`~/.bashrc` hoặc `~/.bash_profile`):
```bash
echo 'export OLLAMA_ORIGINS="*"' >> ~/.bashrc
source ~/.bashrc
ollama serve
```

**Zsh** (`~/.zshrc`):
```bash
echo 'export OLLAMA_ORIGINS="*"' >> ~/.zshrc
source ~/.zshrc
ollama serve
```

---

## ✅ Bước 4: Xác nhận Ollama đang chạy

Mở một terminal mới và kiểm tra health:

```bash
curl http://127.0.0.1:11434/api/tags
```

Nếu thành công, bạn sẽ thấy danh sách models đã pull.

---

## 🧪 Bước 5: Test Llama Model

Kiểm tra model hoạt động đúng:

```bash
ollama run llama3.2:latest
```

Thử hỏi một câu hỏi:

```
>>> Giải thích tại sao Next.js được gọi là framework Full-stack?

(Llama sẽ trả lời bằng tiếng Việt...)
```

Gõ `/bye` để thoát.

---

## 🔧 Bước 6: Chạy Learning Service (Backend)

Trong terminal khác, chạy motivation-progress-service:

```bash
cd dmf-elearning-platform/services/motivation-progress-service
pnpm dev
```

Service sẽ chạy trên **port 3005** và tự động kết nối với Ollama tại `http://127.0.0.1:11434`.

Kiểm tra health của AI Tutor:

```bash
curl http://127.0.0.1:3005/api/learning/ai-health
```

Expected output:

```json
{
  "healthy": true,
  "modelAvailable": true,
  "modelName": "llama3.2:latest"
}
```

---

## 🌐 Bước 7: Chạy Web Frontend

```bash
cd dmf-elearning-platform/apps/web-learner
pnpm dev
```

Frontend chạy trên **port 3000**.

---

## 🎓 Cách sử dụng Gia sư AI

1. Truy cập: `http://localhost:3000/lessons`
2. Chọn một bài học (ví dụ: "Next.js Fundamentals")
3. Làm quiz và trả lời câu hỏi
4. Bấm nút **"Complete & Submit"**
5. Với những câu trả lời **SAI**, bạn sẽ thấy nút **✨ Hỏi Gia sư AI**
6. Bấm nút để nhận lời giải thích từ Qwen với typing animation

---

## 🐛 Troubleshooting

### Lỗi: "Ollama service không khả dụng"

**Nguyên nhân**: Ollama chưa chạy hoặc CORS chưa được enable.

**Giải pháp**:
```bash
# Dừng Ollama nếu đang chạy
pkill ollama

# Chạy lại với CORS
OLLAMA_ORIGINS="*" ollama serve
```

### Lỗi: "Model qwen2.5:32b not found"

**Nguyên nhân**: Model chưa được pull hoặc đang dùng model khác.

**Giải pháp**:
```bash
ollama pull llama3.2:latest
ollama list  # Verify
```

### Lỗi: "ECONNREFUSED 127.0.0.1:11434"

**Nguyên nhân**: Ollama service không chạy.

**Giải pháp**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
OLLAMA_ORIGINS="*" ollama serve
```

### Lỗi: Response quá chậm

**Nguyên nhân**: RAM không đủ hoặc CPU quá tải.

**Giải pháp**:
- Llama 3.2 (3.2B) đã được tối ưu cho tốc độ
- Nếu vẫn chậm, đóng các ứng dụng khác
- Model này chỉ cần ~8GB RAM

---

## 📚 Tham khảo

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Llama 3.2 Model Card](https://ollama.com/library/llama3.2)
- [Ollama CORS Configuration](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)

---

## 🎉 Kết luận

Bây giờ bạn đã có một Gia sư AI thông minh sử dụng Llama 3.2 để giải thích các câu trả lời sai trong quiz!

**Features**:
- ✅ Giải thích bằng tiếng Việt tự nhiên
- ✅ Typing animation đẹp mắt
- ✅ Shiny button với Magic UI
- ✅ Real-time AI explanation
- ✅ Model nhỏ gọn (3.2B parameters)
- ✅ Response nhanh (~5-10 giây)

Happy learning! 📖✨
