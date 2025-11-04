import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../pages/HomePage';
import { AuthProvider } from '../contexts/AuthContext';
import { ResumeProvider } from '../contexts/ResumeContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ResumeProvider>
            {children}
          </ResumeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /build your perfect/i })).toBeInTheDocument();
  });

  it('renders the AI sparkles icon', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // The sparkles icon should be present
    expect(screen.getByText(/ai/i)).toBeInTheDocument();
  });

  it('renders get started button for non-authenticated users', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText(/ai-powered content/i)).toBeInTheDocument();
    expect(screen.getByText(/professional templates/i)).toBeInTheDocument();
    expect(screen.getByText(/job matching/i)).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText(/loved by professionals worldwide/i)).toBeInTheDocument();
  });
});