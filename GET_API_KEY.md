# 🔑 HƯỚNG DẪN LẤY ANTHROPIC API KEY

## CÁCH 1: Sử dụng API Key có sẵn (Khuyến nghị)

Nếu Tướng quân đã có tài khoản Anthropic:

1. Truy cập: https://console.anthropic.com/settings/keys
2. Đăng nhập
3. Click "Create Key"
4. Copy key (bắt đầu bằng `sk-ant-api03-...`)
5. Export vào terminal:

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"
```

**Sau đó chạy:**
```bash
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform
node scripts/test-claude-api.mjs
```

---

## CÁCH 2: Tạo tài khoản mới (Nếu chưa có)

1. Truy cập: https://console.anthropic.com/
2. Sign up (có $5 free credit)
3. Verify email
4. Đi đến Settings → API Keys
5. Create new key
6. Copy và export (xem Cách 1)

---

## CÁCH 3: Sử dụng demo mode (Local only)

Nếu muốn test mà không dùng API:

```bash
# Tạo file .env với mock data
echo 'ANTHROPIC_API_KEY=demo-mode' > dmf-elearning-platform/.env

# Tôi sẽ tạo mock translator để test workflow
```

---

**Tướng quân muốn dùng cách nào?**

1. Đã có API key → export vào terminal
2. Muốn tạo tài khoản mới → sign up
3. Muốn test local trước → tôi tạo mock version
