---
allowed-tools: sessions_spawn, sessions_send, read, write
argument-hint: <module-name> - Module to research (vocabulary/reading/listening/speaking/writing)
description: Trigger AI Research Team to analyze competitors before developing new module (Kích hoạt đội nghiên cứu AI để phân tích đối thủ trước khi phát triển module mới)
---

<task>
Activate AI Research Team để research top market products (sản phẩm hàng đầu thị trường) cho [module] module TRƯỚC KHI phát triển.
</task>

<instructions>
```bash
# 1. Parse module name (Phân tích tên module)
MODULE="$ARGUMENTS"

if [[ -z "$MODULE" ]]; then
    echo "❌ Error: Module name required (Cần tên module)"
    echo "Usage: /research <module-name>"
    echo "Examples: vocabulary, reading, listening, speaking, writing"
    exit 1
fi

echo "🔬 Activating AI Research Team for $MODULE module..."
echo ""

# 2. Create research directories (Tạo thư mục nghiên cứu)
mkdir -p ".research/$MODULE/screenshots"
mkdir -p ".research/$MODULE/data"

echo "✅ Research directories created (Thư mục nghiên cứu đã tạo)"
echo "   - .research/$MODULE/screenshots/"
echo "   - .research/$MODULE/data/"
echo ""

# 3. Notify user (Thông báo user)
echo "🦊 Fuchs will now spawn Research Lead agent..."
echo ""
echo "📋 Research Team will:"
echo "   1. Market Scout → Find top 10 competitors (Tìm top 10 đối thủ)"
echo "   2. UX Analyst → Screenshot UI/UX patterns (Chụp màn hình mẫu UI/UX)"
echo "   3. Tech Detective → Reverse-engineer tech stacks (Kỹ nghệ ngược công nghệ)"
echo "   4. Strategy Synthesizer → Create implementation roadmap (Tạo lộ trình triển khai)"
echo ""
echo "⏱️  Expected completion: ~30-40 minutes"
echo "💰 Estimated cost: ~\$12-19"
echo ""

# 4. Trigger via wake (Kích hoạt qua wake)
# This will send system event to main session (Này sẽ gửi sự kiện hệ thống đến phiên chính)
# Fuchs (main agent) will handle spawning Research Lead (Fuchs sẽ xử lý tạo Research Lead)

openclaw gateway wake --text "🔬 RESEARCH REQUEST: Module '$MODULE' - Spawn Research Lead agent and coordinate full competitive analysis. Output to .research/RESEARCH_REPORT_$MODULE.md" --mode now

echo ""
echo "✅ Research request sent to Fuchs (Yêu cầu nghiên cứu đã gửi đến Fuchs)"
echo "📊 Fuchs will report back (Fuchs sẽ báo cáo lại) via Telegram when complete"
echo ""
echo "💡 You can continue working (Anh có thể tiếp tục làm việc). Research runs in background (Nghiên cứu chạy nền)."
```
</instructions>
