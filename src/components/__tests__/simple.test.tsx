import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'

// Simple test component
const TestComponent = ({ message }: { message: string }) => {
  return <div>{message}</div>
}

describe('Simple Component Test', () => {
  it('renders the test component correctly', () => {
    render(<TestComponent message="Hello, Testing!" />)
    expect(screen.getByText('Hello, Testing!')).toBeInTheDocument()
  })

  it('handles different props', () => {
    render(<TestComponent message="Different message" />)
    expect(screen.getByText('Different message')).toBeInTheDocument()
  })
})

// Test basic JavaScript functionality
describe('Basic JavaScript Tests', () => {
  it('performs basic arithmetic', () => {
    expect(2 + 2).toBe(4)
    expect(10 * 3).toBe(30)
  })

  it('handles string operations', () => {
    const str = 'Hello World'
    expect(str.toUpperCase()).toBe('HELLO WORLD')
    expect(str.includes('World')).toBe(true)
  })

  it('works with arrays', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr.length).toBe(5)
    expect(arr.filter(n => n > 3)).toEqual([4, 5])
  })
})

// Test async functionality
describe('Async Tests', () => {
  it('handles promises', async () => {
    const promise = Promise.resolve('async result')
    const result = await promise
    expect(result).toBe('async result')
  })

  it('handles timeouts', async () => {
    const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 100))
    const result = await timeout
    expect(result).toBe('timeout')
  })
})
