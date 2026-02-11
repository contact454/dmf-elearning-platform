'use client';

import { useState } from 'react';

export default function SpeakingPracticePage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Speaking Practice
          </h1>
          <p className="text-lg text-gray-600">
            Practice your German speaking skills with AI feedback
          </p>
        </div>

        {/* Speaking Module UI */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Prompt Card */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Introduce Yourself</h2>
              <p className="text-blue-100 mb-4">
                Please introduce yourself in German
              </p>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Vietnamese:</p>
                <p className="text-blue-50">Hãy giới thiệu bản thân bằng tiếng Đức</p>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="text-center mb-8">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-2xl`}
            >
              {isRecording ? '⏹' : '🎤'}
            </button>
            <p className="mt-4 text-gray-600">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
          </div>

          {/* Sample Response */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">📝 Sample Response:</h3>
            <p className="text-gray-700 italic">
              "Ich heiße Max. Ich bin 25 Jahre alt. Ich komme aus Vietnam und wohne jetzt in Deutschland."
            </p>
          </div>

          {/* Backend Status */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Backend API Status:</strong> Endpoints created but DATABASE_URL not configured on Vercel.
              <br />
              API routes: <code className="bg-yellow-100 px-2 py-1 rounded">/api/speaking/*</code>
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-yellow-900">
                View Available Endpoints (9)
              </summary>
              <ul className="mt-2 text-xs text-yellow-700 space-y-1 pl-4">
                <li>✅ GET /api/speaking - List prompts</li>
                <li>✅ GET /api/speaking/featured - Featured prompts</li>
                <li>✅ GET /api/speaking/stats - Statistics</li>
                <li>✅ GET /api/speaking/levels - Available levels</li>
                <li>✅ GET /api/speaking/categories - Categories</li>
                <li>✅ GET /api/speaking/[id] - Get prompt by ID</li>
                <li>✅ POST /api/speaking/[id]/attempt - Submit attempt</li>
                <li>✅ GET /api/speaking/[id]/attempts - Get attempts</li>
                <li>✅ GET /api/speaking/user/[userId]/history - User history</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
