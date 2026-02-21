import { render, screen, fireEvent, act } from '@testing-library/react'
import { Flashcard } from '../Flashcard'
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.useRealTimers()
})

describe('Flashcard', () => {
  const mockCard = {
    word: 'Hallo',
    meaning: 'Xin chào',
    level: 'A1',
    example: 'Hallo, wie geht es dir?',
  }
  
  it('should render front side initially', () => {
    render(<Flashcard {...mockCard} onRate={vi.fn()} />)
    expect(screen.getByText('Hallo')).toBeInTheDocument()
    expect(screen.getByText('Tap to reveal')).toBeInTheDocument()
  })
  
  it('should show level badge', () => {
    render(<Flashcard {...mockCard} onRate={vi.fn()} />)
    expect(screen.getByText('A1')).toBeInTheDocument()
  })
  
  it('should flip on click and eventually show rating controls', () => {
    vi.useFakeTimers()
    render(<Flashcard {...mockCard} onRate={vi.fn()} />)

    const container = document.querySelector('.perspective-1000')
    expect(container).toBeTruthy()
    fireEvent.click(container!)

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.getByText('😵 Again')).toBeInTheDocument()
  })
  
  it('should show rating buttons after flip delay', () => {
    vi.useFakeTimers()
    render(<Flashcard {...mockCard} onRate={vi.fn()} />)

    fireEvent.click(screen.getByText('Hallo'))

    expect(screen.queryByText('😊 Good')).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.getByText('😊 Good')).toBeInTheDocument()
  })

  it('should call onRate and reset when user rates', () => {
    vi.useFakeTimers()
    const onRate = vi.fn()
    render(<Flashcard {...mockCard} onRate={onRate} />)

    const container = document.querySelector('.perspective-1000')
    expect(container).toBeTruthy()
    fireEvent.click(container!)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    fireEvent.click(screen.getByText('🎉 Easy'))
    expect(onRate).toHaveBeenCalledWith(3)
    expect(screen.getByText('Hallo')).toBeInTheDocument()
  })

  it('should not call onRate until a rating is selected', () => {
    const onRate = vi.fn()
    render(<Flashcard {...mockCard} onRate={onRate} />)

    const container = document.querySelector('.perspective-1000')
    expect(container).toBeTruthy()
    fireEvent.click(container!)
    fireEvent.click(container!)
    expect(onRate).not.toHaveBeenCalled()
  })
})
