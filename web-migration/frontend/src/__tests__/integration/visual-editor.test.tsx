import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppDetailsPage } from '../../pages/AppDetailsPage';

import { vi } from 'vitest';

// Mock de l'API
vi.mock('../../lib/api', () => ({
  ApiService: {
    getApp: vi.fn(),
    getAppFiles: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    deleteFile: vi.fn(),
    renameFile: vi.fn(),
    sendChatMessage: vi.fn(),
    getChatHistory: vi.fn(),
    createChat: vi.fn(),
    exportApp: vi.fn()
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

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    actualTheme: 'light'
  })
}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ onChange, value }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder="Code editor"
    />
  ),
  useMonaco: () => ({}),
  loader: {
    config: vi.fn()
  }
}));

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

global.WebSocket = vi.fn(() => mockWebSocket) as any;

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

describe('Visual Editor Integration Tests', () => {
  const mockApiService = vi.mocked(require('../../lib/api').ApiService);
  
  const mockApp = {
    id: 'app-123',
    name: 'Contact Form App',
    description: 'Application de formulaire de contact',
    userId: '1',
    createdAt: new Date().toISOString()
  };

  const mockFiles = [
    {
      id: 'file-1',
      path: '/src/App.tsx',
      content: `import React from 'react';
import ContactForm from './components/ContactForm';

function App() {
  return (
    <div className="App">
      <h1>Contact Form App</h1>
      <ContactForm />
    </div>
  );
}

export default App;`,
      size: 150,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'file-2',
      path: '/src/components/ContactForm.tsx',
      content: `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
      />
      <button type="submit">Envoyer</button>
    </form>
  );
};

export default ContactForm;`,
      size: 800,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'file-3',
      path: '/package.json',
      content: `{
  "name": "contact-form-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
      size: 200,
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockApiService.getApp.mockResolvedValue(mockApp);
    mockApiService.getAppFiles.mockResolvedValue(mockFiles);
    mockApiService.readFile.mockResolvedValue({ content: mockFiles[0].content });
    mockApiService.writeFile.mockResolvedValue({ success: true });
    mockApiService.sendChatMessage.mockResolvedValue({
      userMessage: { content: 'Test message', role: 'user' },
      aiMessage: { content: 'AI response', role: 'assistant' }
    });
  });

  describe('Visual Editor Interface', () => {
    it('should render the visual editor with file tree', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Vérifier que l'éditeur est présent
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      
      // Vérifier que les fichiers sont listés
      expect(screen.getByText('/src/App.tsx')).toBeInTheDocument();
      expect(screen.getByText('/src/components/ContactForm.tsx')).toBeInTheDocument();
      expect(screen.getByText('/package.json')).toBeInTheDocument();
    });

    it('should allow file selection and editing', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Cliquer sur un fichier pour le sélectionner
      const fileItem = screen.getByText('/src/App.tsx');
      fireEvent.click(fileItem);

      // Vérifier que l'éditeur contient le contenu du fichier
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveValue(mockFiles[0].content);
    });

    it('should save file changes', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Sélectionner un fichier
      const fileItem = screen.getByText('/src/App.tsx');
      fireEvent.click(fileItem);

      // Modifier le contenu dans l'éditeur
      const editor = screen.getByTestId('monaco-editor');
      const newContent = '// Modified content\n' + mockFiles[0].content;
      fireEvent.change(editor, { target: { value: newContent } });

      // Cliquer sur le bouton de sauvegarde
      const saveButton = screen.getByText('Sauvegarder');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiService.writeFile).toHaveBeenCalledWith('app-123', {
          path: '/src/App.tsx',
          content: newContent
        });
      });
    });
  });

  describe('Real-time Preview', () => {
    it('should display preview iframe', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Vérifier que la preview est présente
      const previewSection = screen.getByText('Aperçu en temps réel');
      expect(previewSection).toBeInTheDocument();

      // Vérifier qu'il y a un iframe pour la preview
      const iframe = screen.getByTitle('App Preview');
      expect(iframe).toBeInTheDocument();
    });

    it('should update preview when files are modified', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Sélectionner et modifier un fichier
      const fileItem = screen.getByText('/src/App.tsx');
      fireEvent.click(fileItem);

      const editor = screen.getByTestId('monaco-editor');
      const newContent = '// Updated content\n' + mockFiles[0].content;
      fireEvent.change(editor, { target: { value: newContent } });

      // Cliquer sur le bouton de sauvegarde
      const saveButton = screen.getByText('Sauvegarder');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiService.writeFile).toHaveBeenCalled();
      });

      // Vérifier que la preview est mise à jour
      const refreshButton = screen.getByText('Actualiser la preview');
      fireEvent.click(refreshButton);

      // La preview devrait être actualisée
      expect(screen.getByTitle('App Preview')).toBeInTheDocument();
    });
  });

  describe('AI Chat Integration', () => {
    it('should display chat interface', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Vérifier que le chat est présent
      expect(screen.getByText('Assistant IA')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tapez votre message...')).toBeInTheDocument();
    });

    it('should send messages to AI and receive responses', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Taper un message
      const chatInput = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(chatInput, { target: { value: 'Améliore le style CSS' } });

      // Envoyer le message
      const sendButton = screen.getByText('Envoyer');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockApiService.sendChatMessage).toHaveBeenCalledWith('app-123', {
          message: 'Améliore le style CSS'
        });
      });

      // Vérifier que la réponse est affichée
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });

    it('should handle different AI models', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Vérifier que le sélecteur de modèle est présent
      const modelSelector = screen.getByDisplayValue('GPT-4');
      expect(modelSelector).toBeInTheDocument();

      // Changer de modèle
      fireEvent.change(modelSelector, { target: { value: 'claude-3' } });

      // Envoyer un message avec le nouveau modèle
      const chatInput = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(chatInput, { target: { value: 'Test avec Claude' } });

      const sendButton = screen.getByText('Envoyer');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockApiService.sendChatMessage).toHaveBeenCalledWith('app-123', {
          message: 'Test avec Claude',
          model: 'claude-3'
        });
      });
    });
  });

  describe('File Management', () => {
    it('should create new files', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Cliquer sur le bouton "Nouveau fichier"
      const newFileButton = screen.getByText('Nouveau fichier');
      fireEvent.click(newFileButton);

      // Remplir le formulaire de création
      const fileNameInput = screen.getByPlaceholderText('Nom du fichier');
      fireEvent.change(fileNameInput, { target: { value: 'NewComponent.tsx' } });

      const createButton = screen.getByText('Créer');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockApiService.writeFile).toHaveBeenCalledWith('app-123', {
          path: '/src/NewComponent.tsx',
          content: ''
        });
      });
    });

    it('should delete files', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Cliquer sur le bouton de suppression d'un fichier
      const deleteButton = screen.getByTitle('Supprimer le fichier');
      fireEvent.click(deleteButton);

      // Confirmer la suppression
      const confirmButton = screen.getByText('Confirmer');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApiService.deleteFile).toHaveBeenCalledWith('app-123', {
          path: '/src/App.tsx'
        });
      });
    });

    it('should rename files', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Cliquer sur le bouton de renommage
      const renameButton = screen.getByTitle('Renommer le fichier');
      fireEvent.click(renameButton);

      // Changer le nom
      const nameInput = screen.getByDisplayValue('/src/App.tsx');
      fireEvent.change(nameInput, { target: { value: '/src/MainApp.tsx' } });

      const saveButton = screen.getByText('Sauvegarder');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiService.renameFile).toHaveBeenCalledWith('app-123', {
          from: '/src/App.tsx',
          to: '/src/MainApp.tsx'
        });
      });
    });
  });

  describe('App Export', () => {
    it('should export the complete app', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // Cliquer sur le bouton d'export
      const exportButton = screen.getByText('Exporter l\'application');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockApiService.exportApp).toHaveBeenCalledWith('app-123');
      });

      // Vérifier que le téléchargement est déclenché
      expect(screen.getByText('Téléchargement en cours...')).toBeInTheDocument();
    });
  });

  describe('Complete Workflow', () => {
    it('should handle complete prompt-to-app workflow', async () => {
      render(
        <TestWrapper>
          <AppDetailsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Contact Form App')).toBeInTheDocument();
      });

      // 1. Envoyer un prompt initial
      const chatInput = screen.getByPlaceholderText('Tapez votre message...');
      fireEvent.change(chatInput, { 
        target: { value: 'Crée une application React avec un formulaire de contact' } 
      });

      const sendButton = screen.getByText('Envoyer');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockApiService.sendChatMessage).toHaveBeenCalled();
      });

      // 2. Modifier le code généré
      const fileItem = screen.getByText('/src/App.tsx');
      fireEvent.click(fileItem);

      const editor = screen.getByTestId('monaco-editor');
      const improvedCode = '// Improved code\n' + mockFiles[0].content;
      fireEvent.change(editor, { target: { value: improvedCode } });

      // 3. Sauvegarder les modifications
      const saveButton = screen.getByText('Sauvegarder');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiService.writeFile).toHaveBeenCalled();
      });

      // 4. Vérifier la preview
      const previewIframe = screen.getByTitle('App Preview');
      expect(previewIframe).toBeInTheDocument();

      // 5. Exporter l'application finale
      const exportButton = screen.getByText('Exporter l\'application');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockApiService.exportApp).toHaveBeenCalled();
      });

      // Le workflow complet devrait être fonctionnel
      expect(screen.getByText('Application prête !')).toBeInTheDocument();
    });
  });
});
