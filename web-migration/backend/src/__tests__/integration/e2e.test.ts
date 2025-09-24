import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, chats, messages, virtualFiles } from '../../database/schema';

describe('End-to-End Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Nettoyer complètement la base de données
    await db.delete(messages);
    await db.delete(chats);
    await db.delete(virtualFiles);
    await db.delete(apps);
    await db.delete(users);
  });

  describe('Complete User Journey', () => {
    it('should handle complete user workflow from registration to app creation', async () => {
      // 1. Inscription utilisateur
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;

      // 2. Vérifier les informations utilisateur
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(meResponse.body.user.email).toBe('user@example.com');
      expect(meResponse.body.user.name).toBe('Test User');

      // 3. Créer une nouvelle application
      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My First App',
          description: 'A test application created via API'
        })
        .expect(201);

      const appId = appResponse.body.id;
      expect(appResponse.body.name).toBe('My First App');
      expect(appResponse.body.userId).toBe(userId);

      // 4. Vérifier que les fichiers par défaut ont été créés
      const filesResponse = await request(app)
        .get(`/api/apps/${appId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThan(0);
      const filePaths = filesResponse.body.map((f: any) => f.path);
      expect(filePaths).toContain('/src/App.tsx');
      expect(filePaths).toContain('/package.json');

      // 5. Créer une conversation
      const chatResponse = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Development Chat' })
        .expect(201);

      const chatId = chatResponse.body.id;

      // 6. Envoyer un message dans la conversation
      const messageResponse = await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Create a React component for a login form' })
        .expect(201);

      expect(messageResponse.body.userMessage.content).toBe('Create a React component for a login form');
      expect(messageResponse.body.aiMessage.role).toBe('assistant');

      // 7. Modifier un fichier de l'application
      const fileContent = `import React from 'react';

function LoginForm() {
  return (
    <form className="login-form">
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;`;

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/src/components/LoginForm.tsx',
          content: fileContent
        })
        .expect(200);

      // 8. Vérifier que le fichier a été créé
      const readFileResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/src/components/LoginForm.tsx' })
        .expect(200);

      expect(readFileResponse.body.content).toBe(fileContent);

      // 9. Renommer un fichier
      await request(app)
        .post(`/api/files/${appId}/rename`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from: '/src/components/LoginForm.tsx',
          to: '/src/components/AuthForm.tsx'
        })
        .expect(200);

      // 10. Vérifier que le fichier a été renommé
      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/src/components/LoginForm.tsx' })
        .expect(404);

      const renamedFileResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/src/components/AuthForm.tsx' })
        .expect(200);

      expect(renamedFileResponse.body.content).toBe(fileContent);

      // 11. Exporter tous les fichiers
      const exportResponse = await request(app)
        .post(`/api/files/${appId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exportResponse.body.files).toHaveProperty('/src/components/AuthForm.tsx');
      expect(exportResponse.body.files['/src/components/AuthForm.tsx']).toBe(fileContent);

      // 12. Lister toutes les applications de l'utilisateur
      const appsListResponse = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appsListResponse.body).toHaveLength(1);
      expect(appsListResponse.body[0].id).toBe(appId);

      // 13. Mettre à jour l'application
      const updateResponse = await request(app)
        .put(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated App Name',
          description: 'Updated description'
        })
        .expect(200);

      expect(updateResponse.body.name).toBe('Updated App Name');
      expect(updateResponse.body.description).toBe('Updated description');

      // 14. Lister les conversations de l'application
      const chatsListResponse = await request(app)
        .get(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(chatsListResponse.body).toHaveLength(1);
      expect(chatsListResponse.body[0].id).toBe(chatId);

      // 15. Récupérer la conversation complète avec messages
      const fullChatResponse = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fullChatResponse.body.messages.length).toBe(2); // user + ai message
      expect(fullChatResponse.body.messages[0].role).toBe('user');
      expect(fullChatResponse.body.messages[1].role).toBe('assistant');

      // 16. Déconnexion
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should handle multiple users with separate data', async () => {
      // Créer deux utilisateurs
      const user1Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user1@example.com',
          password: 'password123',
          name: 'User 1'
        })
        .expect(201);

      const user2Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          name: 'User 2'
        })
        .expect(201);

      const user1Token = user1Response.body.token;
      const user2Token = user2Response.body.token;

      // Chaque utilisateur crée une application
      const app1Response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'User 1 App', description: 'App by user 1' })
        .expect(201);

      const app2Response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'User 2 App', description: 'App by user 2' })
        .expect(201);

      // Vérifier que chaque utilisateur ne voit que ses propres applications
      const user1AppsResponse = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const user2AppsResponse = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1AppsResponse.body).toHaveLength(1);
      expect(user1AppsResponse.body[0].name).toBe('User 1 App');
      expect(user1AppsResponse.body[0].id).toBe(app1Response.body.id);

      expect(user2AppsResponse.body).toHaveLength(1);
      expect(user2AppsResponse.body[0].name).toBe('User 2 App');
      expect(user2AppsResponse.body[0].id).toBe(app2Response.body.id);

      // Vérifier que les utilisateurs ne peuvent pas accéder aux applications des autres
      await request(app)
        .get(`/api/apps/${app1Response.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);

      await request(app)
        .get(`/api/apps/${app2Response.body.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });

    it('should handle app deletion with cascade', async () => {
      // Créer un utilisateur et une application
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);

      const authToken = userResponse.body.token;

      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'App to Delete', description: 'This app will be deleted' })
        .expect(201);

      const appId = appResponse.body.id;

      // Créer des fichiers et des conversations
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/test-file.txt',
          content: 'Test content'
        })
        .expect(200);

      const chatResponse = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Chat' })
        .expect(201);

      const chatId = chatResponse.body.id;

      await request(app)
        .post(`/api/chat/${chatId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Test message' })
        .expect(201);

      // Supprimer l'application
      await request(app)
        .delete(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que tout a été supprimé
      await request(app)
        .get(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/test-file.txt' })
        .expect(404);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let authToken: string;

    beforeEach(async () => {
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);

      authToken = userResponse.body.token;
    });

    it('should handle concurrent file operations', async () => {
      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Concurrent Test App' })
        .expect(201);

      const appId = appResponse.body.id;

      // Créer plusieurs fichiers en parallèle
      const filePromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: `/file${i}.txt`,
            content: `Content ${i}`
          })
      );

      const responses = await Promise.all(filePromises);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Vérifier que tous les fichiers ont été créés
      const filesResponse = await request(app)
        .get(`/api/files/${appId}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle large file operations', async () => {
      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Large File Test App' })
        .expect(201);

      const appId = appResponse.body.id;

      // Créer un fichier avec beaucoup de contenu
      const largeContent = 'A'.repeat(100000); // 100KB

      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/large-file.txt',
          content: largeContent
        })
        .expect(200);

      // Vérifier que le fichier a été créé
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/large-file.txt' })
        .expect(200);

      expect(readResponse.body.content).toBe(largeContent);
    });

    it('should handle rapid message sending', async () => {
      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Rapid Messages App' })
        .expect(201);

      const appId = appResponse.body.id;

      const chatResponse = await request(app)
        .post(`/api/chat/${appId}/chats`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Rapid Messages Chat' })
        .expect(201);

      const chatId = chatResponse.body.id;

      // Envoyer plusieurs messages rapidement
      const messagePromises = Array.from({ length: 3 }, (_, i) =>
        request(app)
          .post(`/api/chat/${chatId}/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message: `Message ${i + 1}` })
      );

      const responses = await Promise.all(messagePromises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Vérifier que tous les messages ont été sauvegardés
      const fullChatResponse = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fullChatResponse.body.messages.length).toBe(6); // 3 user + 3 ai messages
    });
  });
});
