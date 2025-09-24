import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';

import { vi } from 'vitest';

// Mock des contextes
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    token: 'mock-token',
    isLoading: false
  })
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    actualTheme: 'light'
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Layout', () => {
  it('renders layout with sidebar and main content', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    // Vérifier que la sidebar est présente
    expect(screen.getByText('Dyad Web')).toBeInTheDocument();
    expect(screen.getByText('Constructeur d\'applications IA')).toBeInTheDocument();

    // Vérifier que les éléments de navigation sont présents
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByText('Nouvelle application')).toBeInTheDocument();
  });

  it('renders header with user information', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    // Vérifier que l'en-tête est présent
    expect(screen.getByText('Bienvenue, Test User !')).toBeInTheDocument();
    
    // Vérifier que le bouton de thème est présent
    expect(screen.getByTitle('Changer le thème')).toBeInTheDocument();
  });
});
