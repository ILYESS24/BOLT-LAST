import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, virtualFiles } from '../../database/schema';

describe('Performance and Load Tests', () => {
  let authToken: string;
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
        email: 'perf@example.com',
        password: 'password123',
        name: 'Performance Test User'
      });
    
    authToken = userResponse.body.token;

    // Créer une application de test
    const appResponse = await request(app)
      .post('/api/apps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Performance Test App',
        description: 'App for performance testing'
      });
    
    appId = appResponse.body.id;
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await db.delete(virtualFiles);
    await db.delete(apps);
    await db.delete(users);
  });

  describe('API Response Times', () => {
    it('should respond to auth endpoints within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Moins de 1 seconde
    });

    it('should respond to apps endpoints within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Moins de 1 seconde
    });

    it('should respond to files endpoints within acceptable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get(`/api/files/${appId}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Moins de 1 seconde
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent file operations', async () => {
      const filePromises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: `/concurrent-file-${i}.txt`,
            content: `Content for file ${i}`
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(filePromises);
      const totalTime = Date.now() - startTime;

      // Vérifier que toutes les requêtes ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Vérifier que le temps total est acceptable
      expect(totalTime).toBeLessThan(5000); // Moins de 5 secondes pour 10 fichiers
    });

    it('should handle multiple concurrent app requests', async () => {
      const appPromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/apps')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Concurrent App ${i}`,
            description: `App created concurrently ${i}`
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(appPromises);
      const totalTime = Date.now() - startTime;

      // Vérifier que toutes les requêtes ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Vérifier que le temps total est acceptable
      expect(totalTime).toBeLessThan(10000); // Moins de 10 secondes pour 5 apps
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large file content efficiently', async () => {
      // Créer un fichier avec 1MB de contenu
      const largeContent = 'A'.repeat(1024 * 1024); // 1MB
      
      const startTime = Date.now();
      
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/large-file.txt',
          content: largeContent
        })
        .expect(200);
      
      const writeTime = Date.now() - startTime;
      expect(writeTime).toBeLessThan(5000); // Moins de 5 secondes pour écrire 1MB

      // Vérifier que le fichier peut être lu
      const readStartTime = Date.now();
      
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/large-file.txt' })
        .expect(200);
      
      const readTime = Date.now() - readStartTime;
      expect(readTime).toBeLessThan(3000); // Moins de 3 secondes pour lire 1MB
      expect(readResponse.body.content).toBe(largeContent);
    });

    it('should handle many small files efficiently', async () => {
      const fileCount = 100;
      const filePromises = Array.from({ length: fileCount }, (_, i) =>
        request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: `/small-file-${i}.txt`,
            content: `Small content ${i}`
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(filePromises);
      const totalTime = Date.now() - startTime;

      // Vérifier que toutes les requêtes ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Vérifier que le temps total est acceptable
      expect(totalTime).toBeLessThan(10000); // Moins de 10 secondes pour 100 fichiers

      // Vérifier que tous les fichiers peuvent être listés
      const listStartTime = Date.now();
      
      const listResponse = await request(app)
        .get(`/api/files/${appId}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const listTime = Date.now() - listStartTime;
      expect(listTime).toBeLessThan(2000); // Moins de 2 secondes pour lister
      expect(listResponse.body.length).toBeGreaterThanOrEqual(fileCount);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Effectuer de nombreuses opérations
      for (let i = 0; i < 50; i++) {
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            path: `/memory-test-${i}.txt`,
            content: `Memory test content ${i}`
          });

        await request(app)
          .get(`/api/files/${appId}/read`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({ path: `/memory-test-${i}.txt` });
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Vérifier que l'augmentation de mémoire n'est pas excessive
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Moins de 50MB
    });
  });

  describe('Database Performance', () => {
    it('should handle complex queries efficiently', async () => {
      // Créer plusieurs applications avec des fichiers
      const appPromises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/apps')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `DB Test App ${i}`,
            description: `App for DB performance testing ${i}`
          })
      );

      const apps = await Promise.all(appPromises);
      
      // Créer des fichiers pour chaque application
      const filePromises = apps.flatMap(app =>
        Array.from({ length: 5 }, (_, i) =>
          request(app)
            .post(`/api/files/${app.body.id}/write`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              path: `/db-test-file-${i}.txt`,
              content: `DB test content ${i}`
            })
        )
      );

      await Promise.all(filePromises);

      // Tester une requête complexe (lister toutes les applications)
      const startTime = Date.now();
      
      const appsResponse = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const queryTime = Date.now() - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Moins de 2 secondes
      expect(appsResponse.body.length).toBeGreaterThanOrEqual(10);
    });
  });
});
