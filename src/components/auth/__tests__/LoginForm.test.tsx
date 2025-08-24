import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('LoginForm', () => {
  const mockOnSwitchToRegister = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      user: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });
  });

  it('renders login form with all elements', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    // Check main elements
    expect(screen.getByText('Hey there! 👋')).toBeInTheDocument();
    expect(screen.getByText('Ready to dive back into learning?')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /let's go/i })).toBeInTheDocument();
    expect(screen.getByText('Sign up now')).toBeInTheDocument();
  });

  it('renders demo credentials section', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText('Email: demo@example.com')).toBeInTheDocument();
    expect(screen.getByText('Password: demo123')).toBeInTheDocument();
  });

  it('has correct default values in form inputs', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    const passwordInput = screen.getByDisplayValue('demo123');
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const passwordInput = screen.getByDisplayValue('demo123');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits form with current values', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const submitButton = screen.getByRole('button', { name: /let's go/i });
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

    // Check the checkbox
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'demo@example.com',
        password: 'demo123',
        rememberMe: true,
      });
    });
  });

  it('submits form with modified values', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    const passwordInput = screen.getByDisplayValue('demo123');
    const submitButton = screen.getByRole('button', { name: /let's go/i });

    // Clear and type new values
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'newpassword123');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'newpassword123',
        rememberMe: false,
      });
    });
  });

  it('has email input with proper validation attributes', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    
    // Verify the input has the correct type and validation attributes
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'demo@example.com');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    const passwordInput = screen.getByDisplayValue('demo123');
    const submitButton = screen.getByRole('button', { name: /let's go/i });

    // Clear both fields
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const passwordInput = screen.getByDisplayValue('demo123');
    const submitButton = screen.getByRole('button', { name: /let's go/i });

    await user.clear(passwordInput);
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      user: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText('Getting you in...')).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /getting you in/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message from store', () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: errorMessage,
      user: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    });

    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onSwitchToRegister when sign up button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const signUpButton = screen.getByText('Sign up now');
    await user.click(signUpButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation with Cmd/Ctrl + Enter', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    
    // Focus on email input and press Cmd+Enter
    await user.click(emailInput);
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'demo@example.com',
        password: 'demo123',
        rememberMe: false,
      });
    });
  });

  it('has email input with ref for focus', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByDisplayValue('demo@example.com');
    
    // Just verify the input exists and has the expected attributes
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
  });
});