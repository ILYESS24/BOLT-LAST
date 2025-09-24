import request from 'supertest';
import { app } from '../../index';

describe('Complete Flow: Prompt to App Creation with Visual Editor', () => {
  let authToken: string;
  let userId: string;
  let appId: string;
  let chatId: number;

  // Mock des données pour simuler le flux complet
  const mockUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  const mockPrompt = "Crée une application React avec un formulaire de contact qui inclut les champs nom, email, message et un bouton d'envoi. Ajoute aussi une preview en temps réel.";

  const _expectedAppStructure = {
    files: {
      '/src/App.tsx': expect.stringContaining('ContactForm'),
      '/src/components/ContactForm.tsx': expect.stringContaining('useState'),
      '/package.json': expect.stringContaining('react'),
      '/public/index.html': expect.stringContaining('Contact App')
    }
  };

  describe('1. User Registration and Authentication', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(mockUser.email);
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should authenticate user and get profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.email).toBe(mockUser.email);
    });
  });

  describe('2. App Creation from Prompt', () => {
    it('should create a new app from prompt', async () => {
      const appData = {
        name: 'Contact Form App',
        description: 'Application créée à partir du prompt: ' + mockPrompt,
        prompt: mockPrompt
      };

      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appData)
        .expect(201);

      expect(response.body.name).toBe(appData.name);
      expect(response.body.description).toBe(appData.description);
      expect(response.body.userId).toBe(userId);
      
      appId = response.body.id;
    });

    it('should create default files for the app', async () => {
      const filesResponse = await request(app)
        .get(`/api/apps/${appId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThan(0);
      
      // Vérifier la structure de base
      const filePaths = filesResponse.body.map((f: any) => f.path);
      expect(filePaths).toContain('/src/App.tsx');
      expect(filePaths).toContain('/package.json');
    });
  });

  describe('3. Chat Integration for AI Assistance', () => {
    it('should create a chat session for the app', async () => {
      const chatResponse = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Development Chat' })
        .expect(201);

      expect(chatResponse.body.title).toBe('Development Chat');
      expect(chatResponse.body.appId).toBe(appId);
      
      chatId = chatResponse.body.id;
    });

    it('should send prompt message and receive AI response', async () => {
      const messageResponse = await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: mockPrompt })
        .expect(201);

      expect(messageResponse.body.userMessage.content).toBe(mockPrompt);
      expect(messageResponse.body.aiMessage.role).toBe('assistant');
      expect(messageResponse.body.aiMessage.content).toBeDefined();
    });

    it('should handle follow-up messages for refinement', async () => {
      const followUpMessage = "Ajoute aussi un champ téléphone et améliore le style CSS";
      
      const response = await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: followUpMessage })
        .expect(201);

      expect(response.body.userMessage.content).toBe(followUpMessage);
      expect(response.body.aiMessage.content).toBeDefined();
    });
  });

  describe('4. Visual Editor File Operations', () => {
    it('should create ContactForm component file', async () => {
      const contactFormCode = `import React, { useState } from 'react';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="contact-form">
      <h2>Formulaire de Contact</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Nom:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Téléphone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        
        <button type="submit" className="submit-btn">
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ContactForm;`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/src/components/ContactForm.tsx',
          content: contactFormCode
        })
        .expect(200);
    });

    it('should create CSS file for styling', async () => {
      const cssCode = `.contact-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.contact-form h2 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:active {
  transform: translateY(1px);
}`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/src/styles/ContactForm.css',
          content: cssCode
        })
        .expect(200);
    });

    it('should update main App.tsx file', async () => {
      const appCode = `import React, { useState } from 'react';
import ContactForm from './components/ContactForm';
import './styles/ContactForm.css';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function App() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleFormSubmit = (data: FormData) => {
    setSubmittedData(data);
    console.log('Form submitted:', data);
    // Ici vous pourriez envoyer les données à un serveur
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Application de Contact</h1>
        <p>Créée avec Dyad Web - Constructeur d'applications IA</p>
      </header>
      
      <main>
        <ContactForm onSubmit={handleFormSubmit} />
        
        {submittedData && (
          <div className="submission-result">
            <h3>Données soumises:</h3>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/src/App.tsx',
          content: appCode
        })
        .expect(200);
    });

    it('should update package.json with dependencies', async () => {
      const packageJson = `{
  "name": "contact-form-app",
  "version": "1.0.0",
  "description": "Application de formulaire de contact créée avec Dyad Web",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/package.json',
          content: packageJson
        })
        .expect(200);
    });
  });

  describe('5. Real-time Preview Generation', () => {
    it('should generate preview HTML for the app', async () => {
      const previewHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Application de formulaire de contact" />
    <title>Contact Form App - Dyad Web</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .App {
            text-align: center;
        }
        
        .App-header {
            background-color: #282c34;
            padding: 20px;
            color: white;
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        .form-group input,
        .form-group textarea {
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .submit-btn {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="App">
            <header class="App-header">
                <h1>Application de Contact</h1>
                <p>Créée avec Dyad Web - Constructeur d'applications IA</p>
            </header>
            
            <main>
                <div class="contact-form">
                    <h2>Formulaire de Contact</h2>
                    <form class="form">
                        <div class="form-group">
                            <label for="name">Nom:</label>
                            <input type="text" id="name" name="name" placeholder="Votre nom" />
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="votre@email.com" />
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Téléphone:</label>
                            <input type="tel" id="phone" name="phone" placeholder="Votre téléphone" />
                        </div>
                        
                        <div class="form-group">
                            <label for="message">Message:</label>
                            <textarea id="message" name="message" rows="4" placeholder="Votre message"></textarea>
                        </div>
                        
                        <button type="submit" class="submit-btn">
                            Envoyer
                        </button>
                    </form>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/public/index.html',
          content: previewHtml
        })
        .expect(200);
    });

    it('should list all created files', async () => {
      const filesResponse = await request(app)
        .get(`/api/files/${appId}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThanOrEqual(5);
      
      const filePaths = filesResponse.body.map((f: any) => f.path);
      expect(filePaths).toContain('/src/App.tsx');
      expect(filePaths).toContain('/src/components/ContactForm.tsx');
      expect(filePaths).toContain('/src/styles/ContactForm.css');
      expect(filePaths).toContain('/package.json');
      expect(filePaths).toContain('/public/index.html');
    });
  });

  describe('6. AI Model Integration', () => {
    it('should handle different AI model requests', async () => {
      const modelRequests = [
        { model: 'gpt-4', prompt: 'Améliore le style CSS' },
        { model: 'claude-3', prompt: 'Ajoute la validation des champs' },
        { model: 'gemini-pro', prompt: 'Optimise les performances' }
      ];

      for (const request of modelRequests) {
        const response = await request(app)
          .post(`/api/chat/${chatId}/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ 
            message: request.prompt,
            model: request.model 
          })
          .expect(201);

        expect(response.body.userMessage.content).toBe(request.prompt);
        expect(response.body.aiMessage.content).toBeDefined();
      }
    });

    it('should handle streaming responses for real-time updates', async () => {
      // Simuler une réponse en streaming
      const streamingMessage = "Génère du code React en temps réel";
      
      const response = await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          message: streamingMessage,
          stream: true 
        })
        .expect(201);

      expect(response.body.userMessage.content).toBe(streamingMessage);
      expect(response.body.aiMessage.content).toBeDefined();
    });
  });

  describe('7. App Export and Deployment', () => {
    it('should export complete app structure', async () => {
      const exportResponse = await request(app)
        .post(`/api/files/${appId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exportResponse.body.files).toBeDefined();
      expect(exportResponse.body.files['/src/App.tsx']).toContain('ContactForm');
      expect(exportResponse.body.files['/src/components/ContactForm.tsx']).toContain('useState');
      expect(exportResponse.body.files['/package.json']).toContain('react');
    });

    it('should update app metadata', async () => {
      const updateResponse = await request(app)
        .put(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Contact Form App - Final',
          description: 'Application complète avec formulaire de contact, styles CSS et preview en temps réel'
        })
        .expect(200);

      expect(updateResponse.body.name).toBe('Contact Form App - Final');
      expect(updateResponse.body.description).toContain('Application complète');
    });
  });

  describe('8. Complete Workflow Validation', () => {
    it('should validate complete app structure', async () => {
      const appResponse = await request(app)
        .get(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appResponse.body.id).toBe(appId);
      expect(appResponse.body.name).toBe('Contact Form App - Final');
      expect(appResponse.body.userId).toBe(userId);
    });

    it('should validate chat history', async () => {
      const chatResponse = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(chatResponse.body.messages.length).toBeGreaterThanOrEqual(4); // Au moins 4 messages
      
      const userMessages = chatResponse.body.messages.filter((m: any) => m.role === 'user');
      const aiMessages = chatResponse.body.messages.filter((m: any) => m.role === 'assistant');
      
      expect(userMessages.length).toBeGreaterThanOrEqual(2);
      expect(aiMessages.length).toBeGreaterThanOrEqual(2);
    });

    it('should validate all files are accessible', async () => {
      const files = [
        '/src/App.tsx',
        '/src/components/ContactForm.tsx',
        '/src/styles/ContactForm.css',
        '/package.json',
        '/public/index.html'
      ];

      for (const filePath of files) {
        const fileResponse = await request(app)
          .get(`/api/files/${appId}/read`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({ path: filePath })
          .expect(200);

        expect(fileResponse.body.content).toBeDefined();
        expect(fileResponse.body.content.length).toBeGreaterThan(0);
      }
    });
  });
});
