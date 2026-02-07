---
allowed-tools: Bash(git *)
argument-hint: <message> - Commit message (thông điệp commit)
description: Create conventional commit (tạo commit theo quy ước) with auto-staging (tự động staging)
---

<task>
Tạo conventional commit với format (định dạng) chuẩn và staging tự động.
</task>

<instructions>
```bash
# 1. Check git status (kiểm tra trạng thái git)
git status --short

# 2. Stage all changes (đưa tất cả thay đổi vào staging)
git add .

# 3. Show staged diff (hiển thị diff đã stage)
echo "📝 Changes to be committed (Thay đổi sẽ được commit):"
git diff --cached --stat

# 4. Get commit message (lấy thông điệp commit) from argument
MESSAGE="$ARGUMENTS"

if [[ -z "$MESSAGE" ]]; then
    echo "❌ Error: Commit message required (Cần thông điệp commit)"
    echo "Usage: /commit <message>"
    exit 1
fi

# 5. Analyze changes and suggest type (phân tích thay đổi và gợi ý type)
echo ""
echo "💡 Suggested commit types (Các type gợi ý):"
echo "  feat: New feature (tính năng mới)"
echo "  fix: Bug fix (sửa lỗi)"
echo "  docs: Documentation (tài liệu)"
echo "  style: Code style (định dạng code)"
echo "  refactor: Code refactoring (tái cấu trúc)"
echo "  test: Tests (kiểm thử)"
echo "  chore: Build/config (build/cấu hình)"
echo ""

# 6. Parse message for conventional format (phân tích message cho format quy ước)
# Format: type(scope): message
# Example: feat(vocabulary): add flashcard component

echo "📋 Commit message: $MESSAGE"
echo ""

# 7. Ask for confirmation (hỏi xác nhận)
read -p "❓ Proceed with commit (Tiếp tục commit)? (y/n): " confirm

if [[ "$confirm" != "y" ]]; then
    echo "❌ Commit cancelled (Hủy commit)"
    exit 0
fi

# 8. Create commit
git commit -m "$MESSAGE"

if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ Commit created successfully (Tạo commit thành công)!"
    echo ""
    echo "📌 Next steps (Bước tiếp theo):"
    echo "  - Review: git log -1"
    echo "  - Push: git push"
else
    echo "❌ Commit failed (Commit thất bại)"
    exit 1
fi
```
</instructions>
