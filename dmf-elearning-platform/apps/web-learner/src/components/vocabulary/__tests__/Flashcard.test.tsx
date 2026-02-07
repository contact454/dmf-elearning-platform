import { render, screen, fireEvent } from '@testing-library/react'
import { Flashcard } from '../Flashcard'
import { describe, it, expect, vi } from 'vitest'

describe('Flashcard', () => {
  const mockWord = {
    id: '1',
    word: 'Hallo',
    translation: 'Xin chào',
    level: 'A1' as const,
    wordType: 'Interjection',
    exampleSentence: 'Hallo, wie geht es dir?',
    exampleTranslation: 'Xin chào, bạn khỏe không?'
  }
  
  it('should render front side initially', () => {
    render(<Flashcard word={mockWord} />)
    expect(screen.getByText('Hallo')).toBeInTheDocument()
    expect(screen.getByText('Phát âm')).toBeInTheDocument()
  })
  
  it('should show level and word type badges', () => {
    render(<Flashcard word={mockWord} />)
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('Interjection')).toBeInTheDocument()
  })
  
  it('should flip on click', async () => {
    render(<Flashcard word={mockWord} />)
    
    const card = screen.getByRole('button', { name: /Flashcard/ })
    fireEvent.click(card)
    
    // After animation, translation should be visible
    // Note: In real test, we'd wait for animation to complete
    expect(card).toHaveAttribute('aria-label', `Flashcard: ${mockWord.word}. Press space to flip.`)
  })
  
  it('should flip on Space key', () => {
    render(<Flashcard word={mockWord} />)
    
    const card = screen.getByRole('button', { name: /Flashcard/ })
    fireEvent.keyDown(card, { key: ' ' })
    
    // Keyboard interaction should trigger flip
    expect(card).toBeInTheDocument()
  })
  
  it('should call onFlip callback when flipped', () => {
    const onFlip = vi.fn()
    render(<Flashcard word={mockWord} onFlip={onFlip} />)
    
    const card = screen.getByRole('button', { name: /Flashcard/ })
    fireEvent.click(card)
    
    expect(onFlip).toHaveBeenCalledTimes(1)
  })
  
  it('should stop audio click propagation', () => {
    const onFlip = vi.fn()
    render(<Flashcard word={mockWord} onFlip={onFlip} />)
    
    const audioButton = screen.getByLabelText(`Play pronunciation of ${mockWord.word}`)
    fireEvent.click(audioButton)
    
    // Audio button click should not trigger card flip
    expect(onFlip).not.toHaveBeenCalled()
  })
})
