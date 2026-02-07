---
allowed-tools: Bash(pnpm *), Bash(npm *)
argument-hint: [filter] - Optional filter (bộ lọc tùy chọn) for specific tests
description: Run tests with coverage (chạy tests với độ phủ)
---

<task>
Chạy test suite với coverage report (báo cáo độ phủ).
</task>

<instructions>
```bash
# 1. Determine test scope (xác định phạm vi test)
FILTER="$ARGUMENTS"

echo "🧪 Running tests (Đang chạy tests)..."
echo ""

# 2. Run appropriate test command (chạy lệnh test phù hợp)
if [[ -n "$FILTER" ]]; then
    echo "📂 Filter: $FILTER"
    pnpm test "$FILTER"
else
    echo "📂 Running all tests (Chạy tất cả tests)"
    pnpm test
fi

TEST_EXIT_CODE=$?

# 3. Show results summary (hiển thị tóm tắt kết quả)
echo ""
if [[ $TEST_EXIT_CODE -eq 0 ]]; then
    echo "✅ All tests passed (Tất cả tests đã pass)!"
    echo ""
    
    # 4. Offer to run coverage (đề nghị chạy coverage)
    read -p "📊 Run coverage report (Chạy báo cáo coverage)? (y/n): " coverage
    
    if [[ "$coverage" == "y" ]]; then
        echo ""
        echo "📊 Generating coverage (Tạo coverage)..."
        pnpm test:coverage
        
        echo ""
        echo "💡 Coverage report (Báo cáo coverage) saved to: coverage/"
        echo "   Open: coverage/index.html"
    fi
else
    echo "❌ Tests failed (Tests thất bại)!"
    echo ""
    echo "💡 Tips (Mẹo):"
    echo "  - Check error messages (Kiểm tra thông báo lỗi) above"
    echo "  - Run specific test: /test <filename>"
    echo "  - Watch mode: pnpm test:watch"
    exit 1
fi
```
</instructions>
