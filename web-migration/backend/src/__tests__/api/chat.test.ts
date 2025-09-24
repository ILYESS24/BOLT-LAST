import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, chats, messages } from '../../database/schema';

describe('Chat API', () => {
  let authToken: string;
  let appId: string;

  beforeEach(async () => {
    // Nettoyer la base de données
    await db.delete(messages);
    await db.delete(chats);
    await db.delete(apps);
    await db.delete(users);

    // Créer un utilisateur et une app de test
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    authToken = userResponse.body.token;

    const appResponse = await request(app)
      .post('/api/apps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test App',
        description: 'Test Description'
      });
    
    appId = appResponse.body.id;
  });

  describe('GET /api/chat/:appId/chats', () => {
    it('should return empty list for new app', async () => {
      const response = await request(app)
        .get(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return app chats', async () => {
      // Créer une conversation de test
      await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Chat' });

      const response = await request(app)
        .get(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Chat');
      expect(response.body[0].appId).toBe(appId);
    });

    it('should reject access to non-existent app', async () => {
      await request(app)
        .get('/api/chat/non-existent-app/chats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .get(`/api/chat/${appId}/chats`)
        .expect(401);
    });
  });

  describe('POST /api/chat/:appId/chats', () => {
    it('should create new chat successfully', async () => {
      const chatData = {
        title: 'My New Chat'
      };

      const response = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(chatData)
        .expect(201);

      expect(response.body.title).toBe(chatData.title);
      expect(response.body.appId).toBe(appId);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create chat with default title if not provided', async () => {
      const response = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.title).toBe('New Chat');
    });

    it('should reject creation for non-existent app', async () => {
      await request(app)
        .post('/api/chat/non-existent-app/chats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Chat' })
        .expect(404);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .post(`/api/chat/${appId}/chats`)
        .send({ title: 'Test Chat' })
        .expect(401);
    });
  });

  describe('GET /api/chat/:chatId', () => {
    let chatId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Chat' });
      
      chatId = response.body.id;
    });

    it('should return chat with messages', async () => {
      const response = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(chatId);
      expect(response.body.title).toBe('Test Chat');
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
    });

    it('should reject access to non-existent chat', async () => {
      await request(app)
        .get('/api/chat/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .get(`/api/chat/${chatId}`)
        .expect(401);
    });
  });

  describe('POST /api/chat/:chatId/messages', () => {
    let chatId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Chat' });
      
      chatId = response.body.id;
    });

    it('should send message successfully', async () => {
      const messageData = {
        message: 'Hello, how can you help me?'
      };

      const response = await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('userMessage');
      expect(response.body).toHaveProperty('aiMessage');
      expect(response.body.userMessage.content).toBe(messageData.message);
      expect(response.body.userMessage.role).toBe('user');
      expect(response.body.aiMessage.role).toBe('assistant');
    });

    it('should validate message content', async () => {
      await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: '' })
        .expect(400);
    });

    it('should reject message to non-existent chat', async () => {
      await request(app)
        .post('/api/chat/99999/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Test message' })
        .expect(404);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .send({ message: 'Test message' })
        .expect(401);
    });

    it('should handle multiple messages in sequence', async () => {
      const messages = [
        'What is React?',
        'How do I create a component?',
        'Can you show me an example?'
      ];

      for (const message of messages) {
        const response = await request(app)
          .post(`/api/chat/${chatId}/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message })
          .expect(201);

        expect(response.body.userMessage.content).toBe(message);
        expect(response.body.aiMessage).toBeDefined();
      }

      // Vérifier que tous les messages ont été sauvegardés
      const chatResponse = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(chatResponse.body.messages.length).toBe(messages.length * 2); // user + ai pour chaque message
    });
  });

  describe('DELETE /api/chat/:chatId', () => {
    let chatId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Chat to Delete' });
      
      chatId = response.body.id;
    });

    it('should delete chat successfully', async () => {
      await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que le chat a été supprimé
      await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should delete associated messages', async () => {
      // Ajouter un message au chat
      await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Test message' });

      // Supprimer le chat
      await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que le chat et ses messages ont été supprimés
      await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject deletion of non-existent chat', async () => {
      await request(app)
        .delete('/api/chat/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .delete(`/api/chat/${chatId}`)
        .expect(401);
    });
  });

  describe('Chat workflow integration', () => {
    it('should handle complete chat workflow', async () => {
      // 1. Créer une conversation
      const chatResponse = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Complete Workflow Chat' })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 2. Envoyer plusieurs messages
      const messages = [
        'Create a React component for a button',
        'Add some styling to it',
        'Make it responsive'
      ];

      for (const message of messages) {
        await request(app)
          .post(`/api/chat/${chatId}/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message })
          .expect(201);
      }

      // 3. Récupérer la conversation complète
      const fullChatResponse = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fullChatResponse.body.messages.length).toBe(messages.length * 2);
      
      // Vérifier l'ordre des messages
      const userMessages = fullChatResponse.body.messages.filter((m: any) => m.role === 'user');
      const aiMessages = fullChatResponse.body.messages.filter((m: any) => m.role === 'assistant');
      
      expect(userMessages.length).toBe(messages.length);
      expect(aiMessages.length).toBe(messages.length);

      // 4. Lister toutes les conversations de l'app
      const chatsListResponse = await request(app)
        .get(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(chatsListResponse.body).toHaveLength(1);
      expect(chatsListResponse.body[0].id).toBe(chatId);
    });
  });
});
