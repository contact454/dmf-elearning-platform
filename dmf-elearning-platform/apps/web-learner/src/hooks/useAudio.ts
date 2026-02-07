import { useState, useCallback } from 'react'

interface UseAudioReturn {
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  play: () => Promise<void>
}

export function useAudio(wordId: string, word: string): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch audio from backend API
      const response = await fetch(`/api/audio/${wordId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        // Backend audio available
        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        
        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setIsPlaying(false)
          setError('Failed to play audio')
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        // Fallback to Web Speech API
        await playWithWebSpeech(word)
      }
    } catch (err) {
      console.warn('Backend audio failed, using Web Speech API fallback:', err)
      // Fallback to Web Speech API
      await playWithWebSpeech(word)
    } finally {
      setIsLoading(false)
    }
  }, [wordId, word])

  const playWithWebSpeech = async (text: string) => {
    if (!window.speechSynthesis) {
      setError('Text-to-speech not supported in this browser')
      return
    }

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'de-DE' // German
      utterance.rate = 0.8 // Slightly slower for learning
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        setIsPlaying(false)
        resolve()
      }
      utterance.onerror = (e) => {
        setIsPlaying(false)
        setError('Speech synthesis failed')
        reject(e)
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  return {
    isPlaying,
    isLoading,
    error,
    play
  }
}
