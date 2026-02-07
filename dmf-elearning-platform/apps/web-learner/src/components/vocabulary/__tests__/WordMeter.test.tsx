import { render, screen } from '@testing-library/react'
import { WordMeter } from '../WordMeter'
import { describe, it, expect } from 'vitest'

describe('WordMeter', () => {
  it('should render NEW status', () => {
    render(<WordMeter status="NEW" accuracy={0} />)
    expect(screen.getByText('0 lần ôn • 0% đúng')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: Mới')
  })
  
  it('should render LEARNING status', () => {
    render(<WordMeter status="LEARNING" accuracy={0.7} totalReviews={5} />)
    expect(screen.getByText('5 lần ôn • 70% đúng')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '25')
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: Đang học')
  })
  
  it('should render REVIEW status', () => {
    render(<WordMeter status="REVIEW" accuracy={0.85} totalReviews={12} />)
    expect(screen.getByText('12 lần ôn • 85% đúng')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: Ôn tập')
  })
  
  it('should render MASTERED status', () => {
    render(<WordMeter status="MASTERED" accuracy={0.95} totalReviews={20} />)
    expect(screen.getByText('20 lần ôn • 95% đúng')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: Thuộc lòng')
  })
  
  it('should display all stages', () => {
    const { container } = render(<WordMeter status="NEW" accuracy={0} />)
    
    // Check that the stages div exists
    const stagesDiv = container.querySelector('.flex.justify-between.mt-1')
    expect(stagesDiv).toBeInTheDocument()
  })
  
  it('should apply custom className', () => {
    const { container } = render(
      <WordMeter status="NEW" accuracy={0} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
  
  it('should round accuracy to nearest integer', () => {
    render(<WordMeter status="LEARNING" accuracy={0.876} />)
    expect(screen.getByText('0 lần ôn • 88% đúng')).toBeInTheDocument()
  })
})
