import { createServer } from 'http'

const PORT = 3003

// Mock data
const mockWords = [
  {
    id: 'progress1',
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    nextReview: '2026-02-06',
    status: 'NEW',
    word: {
      id: 'word1',
      word: 'Hallo',
      translation: 'Hello',
      level: 'A1',
      wordType: 'noun',
      exampleSentence: 'Hallo, wie geht es dir?',
      exampleTranslation: 'Hello, how are you?',
      audioUrl: null
    }
  },
  {
    id: 'progress2',
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 1,
    nextReview: '2026-02-06',
    status: 'LEARNING',
    word: {
      id: 'word2',
      word: 'Danke',
      translation: 'Thank you',
      level: 'A1',
      wordType: 'interjection',
      exampleSentence: 'Danke schön!',
      exampleTranslation: 'Thank you very much!',
      audioUrl: null
    }
  },
  {
    id: 'progress3',
    easeFactor: 2.8,
    intervalDays: 3,
    repetitions: 2,
    nextReview: '2026-02-06',
    status: 'REVIEW',
    word: {
      id: 'word3',
      word: 'Guten Tag',
      translation: 'Good day',
      level: 'A1',
      wordType: 'phrase',
      exampleSentence: 'Guten Tag, Herr Schmidt!',
      exampleTranslation: 'Good day, Mr. Schmidt!',
      audioUrl: null
    }
  },
]

const mockStreak = {
  currentStreak: 5,
  longestStreak: 10,
  lastActivityDate: '2026-02-06',
  nextMilestone: 7,
}

const server = createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = req.url || ''
  
  // Review queue
  if (url === '/api/review/queue' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(mockWords))
    return
  }
  
  // Review submit
  if (url === '/api/review/submit' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: true }))
    return
  }
  
  // Streak
  if (url === '/api/user/streak' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(mockStreak))
    return
  }
  
  // Health check
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }
  
  // 404
  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`Mock backend API running on http://localhost:${PORT}`)
})
