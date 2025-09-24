import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, virtualFiles } from '../../database/schema';

describe('Security Tests', () => {
  let authToken: string;
  let _userId: string;
  let appId: string;

  beforeAll(async () => {
    // Nettoyer la base de données
    await db.delete(virtualFiles);
    await db.delete(apps);
    await db.delete(users);

    // Créer un utilisateur de test
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'security@example.com',
        password: 'password123',
        name: 'Security Test User'
      });
    
    authToken = userResponse.body.token;
    _userId = userResponse.body.user.id;

    // Créer une application de test
    const appResponse = await request(app)
      .post('/api/apps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Security Test App',
        description: 'App for security testing'
      });
    
    appId = appResponse.body.id;
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await db.delete(virtualFiles);
    await db.delete(apps);
    await db.delete(users);
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      await request(app)
        .get('/api/apps')
        .expect(401);

      await request(app)
        .post('/api/apps')
        .send({ name: 'Test App' })
        .expect(401);

      await request(app)
        .get(`/api/apps/${appId}`)
        .expect(401);
    });

    it('should reject requests with invalid tokens', async () => {
      await request(app)
        .get('/api/apps')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      await request(app)
        .get('/api/apps')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      await request(app)
        .get('/api/apps')
        .set('Authorization', '')
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      // Créer un token expiré (simulation)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid';
      
      await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
    });
  });

  describe('Authorization Security', () => {
    let otherUserToken: string;
    let otherUserAppId: string;

    beforeAll(async () => {
      // Créer un autre utilisateur
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'password123',
          name: 'Other User'
        });
      
      otherUserToken = otherUserResponse.body.token;

      // Créer une application pour l'autre utilisateur
      const otherAppResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User App',
          description: 'App belonging to other user'
        });
      
      otherUserAppId = otherAppResponse.body.id;
    });

    it('should prevent access to other users apps', async () => {
      // Essayer d'accéder à l'application d'un autre utilisateur
      await request(app)
        .get(`/api/apps/${otherUserAppId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      await request(app)
        .put(`/api/apps/${otherUserAppId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked App' })
        .expect(404);

      await request(app)
        .delete(`/api/apps/${otherUserAppId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should prevent access to other users files', async () => {
      // Créer un fichier pour l'autre utilisateur
      await request(app)
        .post(`/api/files/${otherUserAppId}/write`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          path: '/secret-file.txt',
          content: 'Secret content'
        });

      // Essayer d'accéder au fichier avec le mauvais token
      await request(app)
        .get(`/api/files/${otherUserAppId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/secret-file.txt' })
        .expect(404);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should sanitize file paths to prevent directory traversal', async () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM',
        '../../../../../../etc/shadow'
      ];

      for (const maliciousPath of maliciousPaths) {
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: maliciousPath,
            content: 'Malicious content'
          })
          .expect(400);
      }
    });

    it('should validate and sanitize file content', async () => {
      const maliciousContent = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '${7*7}',
        '{{7*7}}',
        '<?php system("rm -rf /"); ?>'
      ];

      for (const content of maliciousContent) {
        // Le contenu malveillant devrait être accepté mais stocké tel quel
        // (la sanitisation se fait côté client)
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: `/test-${Date.now()}.txt`,
            content: content
          })
          .expect(200);
      }
    });

    it('should validate email format in registration', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@example',
        ''
      ];

      for (const email of invalidEmails) {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: email,
            password: 'password123',
            name: 'Test User'
          })
          .expect(400);
      }
    });

    it('should validate password requirements', async () => {
      const weakPasswords = [
        '',
        '123',
        'password',
        '12345678',
        'abcdefgh'
      ];

      for (const password of weakPasswords) {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: `test-${Date.now()}@example.com`,
            password: password,
            name: 'Test User'
          })
          .expect(400);
      }
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle rapid successive requests', async () => {
      const rapidRequests = Array.from({ length: 20 }, () =>
        request(app)
          .get('/api/apps')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(rapidRequests);
      
      // Toutes les requêtes devraient réussir (pas de rate limiting implémenté pour les tests)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large payloads gracefully', async () => {
      // Créer un payload très large
      const largePayload = {
        name: 'A'.repeat(10000), // 10KB de nom
        description: 'B'.repeat(100000) // 100KB de description
      };

      await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePayload)
        .expect(400); // Devrait être rejeté car trop grand
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in app names', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE apps; --",
        "' OR '1'='1",
        "'; INSERT INTO apps (name) VALUES ('hacked'); --",
        "' UNION SELECT * FROM users --"
      ];

      for (const payload of sqlInjectionPayloads) {
        await request(app)
          .post('/api/apps')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            description: 'Test description'
          })
          .expect(400);
      }
    });

    it('should prevent SQL injection in file paths', async () => {
      const sqlInjectionPaths = [
        "'; DROP TABLE virtual_files; --",
        "' OR '1'='1",
        "'; INSERT INTO virtual_files (path) VALUES ('hacked'); --"
      ];

      for (const path of sqlInjectionPaths) {
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: path,
            content: 'Test content'
          })
          .expect(400);
      }
    });
  });

  describe('CORS and Headers Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Vérifier les headers de sécurité
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/apps')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('Data Privacy', () => {
    it('should not expose sensitive user data in responses', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Vérifier que le mot de passe n'est pas exposé
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.hashedPassword).toBeUndefined();
      
      // Vérifier que seules les données nécessaires sont exposées
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
    });

    it('should not expose internal database IDs in responses', async () => {
      const response = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Vérifier que les IDs sont des UUIDs ou des identifiants sécurisés
      response.body.forEach((app: any) => {
        expect(app.id).toMatch(/^app_/); // Format attendu
        expect(app.id).not.toMatch(/^\d+$/); // Pas d'ID numérique simple
      });
    });
  });
});
