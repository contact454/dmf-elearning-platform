# 🌍 Claude Translation Setup Guide

## 📋 TỔNG QUAN

Hệ thống dịch thuật Đức-Việt sử dụng **Claude 3.5 Sonnet** thay thế Llama 3.2 (đã bị loại bỏ do chất lượng kém).

## 🔑 BƯỚC 1: LẤY ANTHROPIC API KEY

### Option 1: Dùng Console API Key (Recommended)
```bash
# 1. Truy cập: https://console.anthropic.com/settings/keys
# 2. Tạo API key mới
# 3. Copy key (bắt đầu bằng "sk-ant-api03-...")
```

### Option 2: Dùng Claude Code Session (Alternative)
```bash
# Nếu bạn đang dùng Claude Code CLI, có thể dùng session key
# Key tự động lưu trong ~/.config/claude/session
```

## 🛠️ BƯỚC 2: THIẾT LẬP ENVIRONMENT

```bash
# Thêm vào file .env trong project root
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform

# Tạo hoặc edit .env
echo "ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE" >> .env
```

**Hoặc export trực tiếp:**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"
```

## 🚀 BƯỚC 3: CHẠY TRANSLATION

### 3.1 Install Dependencies (nếu chưa có)
```bash
cd dmf-elearning-platform
pnpm add @anthropic-ai/sdk
```

### 3.2 Run Translation Script
```bash
# Chạy script dịch
node scripts/translate-with-claude.mjs
```

### 3.3 Kiểm tra kết quả
```bash
# Xem các file đã tạo
ls -lh services/learning-service/storage/resource-hub/A1/

# Đọc mẫu
cat services/learning-service/storage/resource-hub/A1/colors.json
```

## 📊 THỐNG KÊ CHI PHÍ

**Ước tính cho 200 từ A1:**
- Model: Claude 3.5 Sonnet
- Input tokens: ~10,000 tokens
- Output tokens: ~5,000 tokens
- **Chi phí**: ~$0.10 - $0.15 USD

**Chi phí toàn bộ A1-C2 (2000 từ):**
- **Tổng chi phí**: ~$1.50 USD

## ✅ VALIDATION WORKFLOW

```bash
# Sau khi dịch xong, chạy data audit
node scripts/validate-translations.mjs

# Expected output:
# ✅ 100% từ vựng có nghĩa tiếng Việt
# ✅ Không có hallucination
# ✅ Phân loại cấp độ chính xác
```

## 🔄 ROLLBACK (nếu cần)

```bash
# Nếu kết quả không tốt, xóa và thử lại
rm -rf services/learning-service/storage/resource-hub/A1/*
node scripts/translate-with-claude.mjs
```

## 📝 GHI CHÚ

- **Rate limit**: Claude API cho phép 50 requests/minute
- **Timeout**: Mỗi request ~2-3 giây
- **Tổng thời gian**: ~5-10 phút cho toàn bộ A1

## 🆘 TROUBLESHOOTING

### Lỗi: "Invalid API Key"
```bash
# Kiểm tra key
echo $ANTHROPIC_API_KEY

# Nếu trống, export lại
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### Lỗi: "Rate limit exceeded"
```bash
# Tăng delay trong script (dòng 117):
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 giây
```

### Lỗi: "Invalid JSON response"
```bash
# Claude đôi khi trả markdown. Script tự động extract JSON
# Nếu vẫn lỗi, check response manually
```

---

**Sẵn sàng chiến đấu! 🎯**
