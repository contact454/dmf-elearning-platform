---
allowed-tools: Bash(echo), Bash(cat)
argument-hint: <description> - Task description (mô tả task)
description: Set description (đặt mô tả) for current Claude session (phiên Claude hiện tại)
---

<task>
Cập nhật session description để track (theo dõi) task hiện tại.
</task>

<instructions>
```bash
# 1. Get description from argument
DESCRIPTION="$ARGUMENTS"

if [[ -z "$DESCRIPTION" ]]; then
    echo "❌ Error: Description required (Cần mô tả)"
    echo "Usage: /description <your task description>"
    exit 1
fi

# 2. Check if in Claude session (kiểm tra xem có trong phiên Claude không)
if [[ -z "$CLAUDE_SESSION" ]]; then
    echo "⚠️  Warning: No CLAUDE_SESSION environment variable (Không có biến môi trường CLAUDE_SESSION)"
    echo "   This command works best (Lệnh này hoạt động tốt nhất) with multi-session setup"
fi

# 3. Save description to project-specific file (lưu mô tả vào file cụ thể dự án)
SESSION_FILE=".claude-session-description"

echo "$DESCRIPTION" > "$SESSION_FILE"

# 4. Display confirmation (hiển thị xác nhận)
echo "✅ Session description updated (Đã cập nhật mô tả phiên)!"
echo ""
echo "📋 Current task (Task hiện tại): $DESCRIPTION"
echo "📁 Saved to (Đã lưu vào): $SESSION_FILE"
echo ""
echo "💡 This helps track (Điều này giúp theo dõi) what you're working on"
echo "   in multi-session workflows (trong quy trình nhiều phiên)"
```
</instructions>
