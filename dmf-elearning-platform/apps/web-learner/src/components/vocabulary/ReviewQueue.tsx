'use client'

import { useReviewQueue } from '@/hooks/useReviewQueue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SkeletonCard } from '@/components/LoadingStates'

export function ReviewQueue() {
  const { data: words, isLoading, error } = useReviewQueue()
  
  if (isLoading) {
    return <SkeletonCard />
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Không thể tải danh sách ôn tập</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  if (!words || words.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-gray-700 mb-4">Không có từ nào cần ôn hôm nay!</p>
          <p className="text-gray-500 text-sm">Quay lại vào ngày mai nhé.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ôn tập hôm nay</CardTitle>
        <p className="text-gray-600">{words.length} từ cần ôn tập</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Word Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {words.slice(0, 6).map((word) => (
              <div
                key={word.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <p className="font-bold text-lg">{word.word.word}</p>
                <p className="text-gray-600 text-sm">{word.word.translation}</p>
              </div>
            ))}
          </div>
          
          {words.length > 6 && (
            <p className="text-center text-gray-500 text-sm">
              ...và {words.length - 6} từ khác
            </p>
          )}
          
          {/* Start Button */}
          <Link href="/vocabulary/review">
            <Button className="w-full" size="lg">
              Bắt đầu ôn tập
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
