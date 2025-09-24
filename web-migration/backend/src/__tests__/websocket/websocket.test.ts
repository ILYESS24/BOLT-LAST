import { WebSocket } from 'ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { db } from '../../database/connection';
import { users, chats } from '../../database/schema';

describe('WebSocket', () => {
  let server: any;
  let wss: WebSocketServer;
  let port: number;
  let authToken: string;
  let userId: string;
  let chatId: number;

  beforeAll(async () => {
    // Nettoyer la base de données
    await db.delete(chats);
    await db.delete(users);

    // Créer un utilisateur de test
    const user = await db.insert(users).values({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    }).returning();

    userId = user[0].id;

    // Créer un chat de test
    const chat = await db.insert(chats).values({
      appId: 'test-app-123',
      userId: userId,
      title: 'Test Chat'
    }).returning();

    chatId = chat[0].id;

    // Créer un token JWT
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    authToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });

    // Créer un serveur de test
    server = createServer();
    wss = new WebSocketServer({ server });
    
    // Démarrer le serveur sur un port aléatoire
    server.listen(0, () => {
      port = (server.address() as any).port;
    });
  });

  afterAll(async () => {
    if (wss) {
      wss.close();
    }
    if (server) {
      server.close();
    }
    
    // Nettoyer la base de données
    await db.delete(chats);
    await db.delete(users);
  });

  describe('Connection', () => {
    it('should connect with valid token', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
      
      ws.on('open', () => {
        expect(true).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', (_error) => {
        done(error);
      });
    });

    it('should reject connection without token', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws?chatId=${chatId}`);
      
      ws.on('close', (code) => {
        expect(code).toBe(1008); // Authentication required
        done();
      });

      ws.on('error', (_error) => {
        // Erreur attendue
        done();
      });
    });

    it('should reject connection with invalid token', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws?token=invalid-token&chatId=${chatId}`);
      
      ws.on('close', (code) => {
        expect(code).toBe(1008); // Authentication failed
        done();
      });

      ws.on('error', (_error) => {
        // Erreur attendue
        done();
      });
    });

    it('should reject connection to non-existent chat', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=99999`);
      
      ws.on('close', (code) => {
        expect(code).toBe(1008); // Chat access denied
        done();
      });

      ws.on('error', (_error) => {
        // Erreur attendue
        done();
      });
    });
  });

  describe('Message Handling', () => {
    let ws: WebSocket;

    beforeEach((done) => {
      ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
      
      ws.on('open', () => {
        done();
      });

      ws.on('error', (_error) => {
        done(error);
      });
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    it('should handle ping message', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'pong') {
          expect(message.timestamp).toBeDefined();
          done();
        }
      });

      ws.send(JSON.stringify({ type: 'ping' }));
    });

    it('should handle chat message', (done) => {
      let messageCount = 0;
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'stream_chunk') {
          expect(message.data.content).toBeDefined();
          messageCount++;
        } else if (message.type === 'stream_complete') {
          expect(message.data.fullResponse).toBeDefined();
          expect(messageCount).toBeGreaterThan(0);
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'chat_message',
        data: { message: 'Hello, how are you?' }
      }));
    });

    it('should handle stream request', (done) => {
      let messageCount = 0;
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'code_stream') {
          expect(message.data.content).toBeDefined();
          messageCount++;
        } else if (message.type === 'code_complete') {
          expect(message.data.fullCode).toBeDefined();
          expect(message.data.files).toBeDefined();
          expect(messageCount).toBeGreaterThan(0);
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'stream_request',
        data: { 
          prompt: 'Create a React component',
          context: 'Building a web application'
        }
      }));
    });

    it('should handle unknown message type', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toContain('Unknown message type');
          done();
        }
      });

      ws.send(JSON.stringify({ type: 'unknown_type' }));
    });

    it('should handle malformed JSON', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toContain('Invalid message format');
          done();
        }
      });

      ws.send('invalid json');
    });
  });

  describe('Streaming', () => {
    let ws: WebSocket;

    beforeEach((done) => {
      ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
      
      ws.on('open', () => {
        done();
      });

      ws.on('error', (_error) => {
        done(error);
      });
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    it('should stream chat response in chunks', (done) => {
      const chunks: string[] = [];
      let completed = false;
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'stream_chunk') {
          chunks.push(message.data.content);
          expect(message.data.done).toBe(false);
        } else if (message.type === 'stream_complete') {
          expect(message.data.done).toBe(true);
          expect(chunks.length).toBeGreaterThan(0);
          expect(message.data.fullResponse).toBe(chunks.join(''));
          completed = true;
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'chat_message',
        data: { message: 'Tell me a story' }
      }));

      // Timeout de sécurité
      setTimeout(() => {
        if (!completed) {
          done(new Error('Streaming did not complete in time'));
        }
      }, 5000);
    });

    it('should stream code generation in chunks', (done) => {
      const chunks: string[] = [];
      let completed = false;
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'code_stream') {
          chunks.push(message.data.content);
          expect(message.data.done).toBe(false);
        } else if (message.type === 'code_complete') {
          expect(message.data.done).toBe(true);
          expect(chunks.length).toBeGreaterThan(0);
          expect(message.data.fullCode).toBe(chunks.join(''));
          expect(Array.isArray(message.data.files)).toBe(true);
          completed = true;
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'stream_request',
        data: { 
          prompt: 'Create a button component',
          context: 'React application'
        }
      }));

      // Timeout de sécurité
      setTimeout(() => {
        if (!completed) {
          done(new Error('Code streaming did not complete in time'));
        }
      }, 5000);
    });
  });

  describe('Error Handling', () => {
    let ws: WebSocket;

    beforeEach((done) => {
      ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
      
      ws.on('open', () => {
        done();
      });

      ws.on('error', (_error) => {
        done(error);
      });
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    it('should handle chat message without chat ID', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toContain('No chat ID provided');
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'chat_message',
        data: { message: 'Test message' }
      }));
    });

    it('should handle stream request without chat ID', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toContain('No chat ID provided');
          done();
        }
      });

      ws.send(JSON.stringify({
        type: 'stream_request',
        data: { 
          prompt: 'Test prompt',
          context: 'Test context'
        }
      }));
    });
  });

  describe('Connection Management', () => {
    it('should handle multiple connections', (done) => {
      const connections: WebSocket[] = [];
      let connectedCount = 0;
      const totalConnections = 3;

      for (let i = 0; i < totalConnections; i++) {
        const ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
        connections.push(ws);

        ws.on('open', () => {
          connectedCount++;
          if (connectedCount === totalConnections) {
            // Fermer toutes les connexions
            connections.forEach(conn => conn.close());
            done();
          }
        });

        ws.on('error', (_error) => {
          done(error);
        });
      }
    });

    it('should handle connection close gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws?token=${authToken}&chatId=${chatId}`);
      
      ws.on('open', () => {
        ws.close();
      });

      ws.on('close', () => {
        done();
      });

      ws.on('error', (_error) => {
        done(error);
      });
    });
  });
});
