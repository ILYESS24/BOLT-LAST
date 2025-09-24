import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../../pages/HomePage';

import { vi } from 'vitest';

// Mock de l'API
vi.mock('../../lib/api', () => ({
  ApiService: {
    getApps: vi.fn(),
    createApp: vi.fn(),
    deleteApp: vi.fn(),
  }
}));

// Mock des contextes
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    token: 'mock-token',
    isLoading: false
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

describe('HomePage', () => {
  const mockApiService = vi.mocked(require('../../lib/api').ApiService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home page with title and description', () => {
    mockApiService.getApps.mockResolvedValue([]);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Mes Applications')).toBeInTheDocument();
    expect(screen.getByText('Gérez vos applications IA et créez de nouveaux projets.')).toBeInTheDocument();
  });

  it('shows create app button', () => {
    mockApiService.getApps.mockResolvedValue([]);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Nouvelle Application')).toBeInTheDocument();
  });

  it('shows empty state when no apps exist', async () => {
    mockApiService.getApps.mockResolvedValue([]);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune application')).toBeInTheDocument();
      expect(screen.getByText('Créez votre première application IA pour commencer.')).toBeInTheDocument();
    });
  });

  it('shows apps list when apps exist', async () => {
    const mockApps = [
      {
        id: '1',
        name: 'Test App 1',
        description: 'Description 1',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Test App 2',
        description: 'Description 2',
        createdAt: new Date().toISOString()
      }
    ];

    mockApiService.getApps.mockResolvedValue(mockApps);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('opens create app form when button is clicked', async () => {
    mockApiService.getApps.mockResolvedValue([]);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const createButton = screen.getByText('Nouvelle Application');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Créer une nouvelle application')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom de l\'application')).toBeInTheDocument();
      expect(screen.getByLabelText('Description (optionnel)')).toBeInTheDocument();
    });
  });

  it('creates new app when form is submitted', async () => {
    mockApiService.getApps.mockResolvedValue([]);
    mockApiService.createApp.mockResolvedValue({
      id: 'new-app-id',
      name: 'New App',
      description: 'New Description'
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Ouvrir le formulaire
    const createButton = screen.getByText('Nouvelle Application');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Créer une nouvelle application')).toBeInTheDocument();
    });

    // Remplir le formulaire
    const nameInput = screen.getByLabelText('Nom de l\'application');
    const descriptionInput = screen.getByLabelText('Description (optionnel)');

    fireEvent.change(nameInput, { target: { value: 'New App' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    // Soumettre le formulaire
    const submitButton = screen.getByText('Créer');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createApp).toHaveBeenCalledWith({
        name: 'New App',
        description: 'New Description'
      });
    });
  });

  it('deletes app when delete button is clicked', async () => {
    const mockApps = [
      {
        id: '1',
        name: 'Test App',
        description: 'Test Description',
        createdAt: new Date().toISOString()
      }
    ];

    mockApiService.getApps.mockResolvedValue(mockApps);
    mockApiService.deleteApp.mockResolvedValue({});

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Supprimer');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette application ?');
    expect(mockApiService.deleteApp).toHaveBeenCalledWith('1');
  });

  it('shows loading state', () => {
    mockApiService.getApps.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Vérifier qu'un indicateur de chargement est affiché
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});
