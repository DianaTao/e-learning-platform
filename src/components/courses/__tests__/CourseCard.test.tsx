import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { CourseCard } from '../CourseCard'
import { mockCourse } from '@/test/test-utils'

describe('CourseCard', () => {
  const mockOnEnroll = vi.fn()
  const mockOnContinue = vi.fn()

  const defaultProps = {
    course: mockCourse,
    onEnroll: mockOnEnroll,
    onContinue: mockOnContinue,
    isEnrolled: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders course information correctly', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByText(mockCourse.title)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.instructor.name)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.difficulty)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.category)).toBeInTheDocument()
  })

  it('displays progress information for enrolled courses', () => {
    render(<CourseCard {...defaultProps} />)

    // Check if progress overlay is displayed (component shows progress in overlay)
    expect(screen.getByText(/58% done/i)).toBeInTheDocument()
  })

  it('shows "Keep going! 💪" button for enrolled courses with progress', () => {
    render(<CourseCard {...defaultProps} />)

    const continueButton = screen.getByRole('button', { name: /keep going/i })
    expect(continueButton).toBeInTheDocument()
  })

  it('shows "Let\'s start! 🚀" button for enrolled courses with no progress', () => {
    const courseWithNoProgress = {
      ...mockCourse,
      progress: 0,
      completedLessons: 0,
    }
    
    render(<CourseCard {...defaultProps} course={courseWithNoProgress} />)

    const startButton = screen.getByRole('button', { name: /let's start/i })
    expect(startButton).toBeInTheDocument()
  })

  it('shows "Join this course" button for non-enrolled courses', () => {
    render(<CourseCard {...defaultProps} isEnrolled={false} />)

    const enrollButton = screen.getByRole('button', { name: /join this course/i })
    expect(enrollButton).toBeInTheDocument()
  })

  it('calls onContinue when Continue Learning button is clicked', async () => {
    const user = userEvent.setup()
    render(<CourseCard {...defaultProps} />)

    const continueButton = screen.getByRole('button', { name: /keep going/i })
    await user.click(continueButton)

    expect(mockOnContinue).toHaveBeenCalled()
  })

  it('calls onEnroll when Join this course button is clicked', async () => {
    const user = userEvent.setup()
    render(<CourseCard {...defaultProps} isEnrolled={false} />)

    const enrollButton = screen.getByRole('button', { name: /join this course/i })
    await user.click(enrollButton)

    expect(mockOnEnroll).toHaveBeenCalled()
  })

  it('displays course rating', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByText(mockCourse.rating.toString())).toBeInTheDocument()
  })

  it('displays course duration in hours', () => {
    render(<CourseCard {...defaultProps} />)

    // Component shows duration in hours, not minutes
    expect(screen.getByText(/2h/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<CourseCard {...defaultProps} />)

    const card = screen.getByRole('button', { name: /continue learning/i })
    
    // Test focus
    await user.tab()
    expect(card).toHaveFocus()

    // Test Enter key
    await user.keyboard('{Enter}')
    expect(mockOnContinue).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<CourseCard {...defaultProps} />)

    const card = screen.getByRole('button', { name: /continue learning/i })
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-label', `${mockCourse.title} - Continue learning`)
  })

  it('displays difficulty badge with correct styling', () => {
    render(<CourseCard {...defaultProps} />)

    const difficultyBadge = screen.getByText(mockCourse.difficulty)
    expect(difficultyBadge).toHaveClass('badge-success')
  })

  it('displays category badge with correct styling', () => {
    render(<CourseCard {...defaultProps} />)

    const categoryBadge = screen.getByText(mockCourse.category)
    expect(categoryBadge).toHaveClass('bg-blue-500')
  })

  it('handles missing optional props gracefully', () => {
    const minimalCourse = {
      ...mockCourse,
      rating: 0,
      studentsCount: 0,
      stats: undefined,
    }

    render(<CourseCard {...defaultProps} course={minimalCourse} isEnrolled={false} />)

    expect(screen.getByText(minimalCourse.title)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /join this course/i })).toBeInTheDocument()
  })

  it('displays instructor rating', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByText(mockCourse.instructor.rating.toString())).toBeInTheDocument()
  })

  it('displays course tags', () => {
    render(<CourseCard {...defaultProps} />)

    mockCourse.tags.slice(0, 3).forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('displays last accessed date for enrolled courses', () => {
    render(<CourseCard {...defaultProps} />)

    expect(screen.getByText(/last accessed/i)).toBeInTheDocument()
  })

  it('applies correct difficulty badge colors', () => {
    const testCases = [
      { difficulty: 'Beginner', expectedClass: 'badge-success' },
      { difficulty: 'Intermediate', expectedClass: 'badge-warning' },
      { difficulty: 'Advanced', expectedClass: 'badge-danger' },
    ]

    testCases.forEach(({ difficulty, expectedClass }) => {
      const courseWithDifficulty = { ...mockCourse, difficulty }
      render(<CourseCard {...defaultProps} course={courseWithDifficulty} />)
      
      const difficultyBadge = screen.getByText(difficulty)
      expect(difficultyBadge).toHaveClass(expectedClass)
    })
  })

  it('applies correct category badge colors', () => {
    const testCases = [
      { category: 'Programming', expectedClass: 'bg-blue-500' },
      { category: 'Design', expectedClass: 'bg-purple-500' },
      { category: 'Business', expectedClass: 'bg-green-500' },
      { category: 'Marketing', expectedClass: 'bg-orange-500' },
    ]

    testCases.forEach(({ category, expectedClass }) => {
      const courseWithCategory = { ...mockCourse, category }
      render(<CourseCard {...defaultProps} course={courseWithCategory} />)
      
      const categoryBadge = screen.getByText(category)
      expect(categoryBadge).toHaveClass(expectedClass)
    })
  })
})
