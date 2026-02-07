'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function ReviewCompletePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Hoàn thành!
          </h1>
          <p className="text-xl text-gray-600">
            Bạn đã hoàn thành phiên ôn tập hôm nay
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Làm tốt lắm!</h2>
          <p className="text-gray-600 mb-6">
            Việc ôn tập thường xuyên sẽ giúp bạn ghi nhớ từ vựng tốt hơn.
            Hãy quay lại vào ngày mai để tiếp tục học nhé!
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Về Dashboard
              </Button>
            </Link>
            <Link href="/vocabulary/review">
              <Button size="lg">
                Xem từ cần ôn
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          💡 Mẹo: Ôn tập đều đặn mỗi ngày để duy trì streak và tăng cấp độ!
        </div>
      </div>
    </div>
  )
}
