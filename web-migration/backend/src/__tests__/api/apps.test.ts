import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, virtualFiles } from '../../database/schema';
import { eq } from 'drizzle-orm';

describe('Apps API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Nettoyer la base de données
    await db.delete(virtualFiles);
    await db.delete(apps);
    await db.delete(users);

    // Créer un utilisateur de test
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  describe('GET /api/apps', () => {
    it('should return empty list for new user', async () => {
      const response = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user apps', async () => {
      // Créer une app de test
      await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test App',
          description: 'Test Description'
        });

      const response = await request(app)
        .get('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test App');
      expect(response.body[0].description).toBe('Test Description');
    });

    it('should reject request without auth', async () => {
      await request(app)
        .get('/api/apps')
        .expect(401);
    });
  });

  describe('POST /api/apps', () => {
    it('should create a new app successfully', async () => {
      const appData = {
        name: 'My New App',
        description: 'A test application'
      };

      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appData)
        .expect(201);

      expect(response.body.name).toBe(appData.name);
      expect(response.body.description).toBe(appData.description);
      expect(response.body.userId).toBe(userId);
      expect(response.body.path).toMatch(/^\/apps\/app_/);
    });

    it('should create default files for new app', async () => {
      const appData = {
        name: 'App with Files',
        description: 'Test app with default files'
      };

      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appData)
        .expect(201);

      const appId = response.body.id;

      // Vérifier que les fichiers par défaut ont été créés
      const filesResponse = await request(app)
        .get(`/api/apps/${appId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThan(0);
      
      // Vérifier qu'il y a au moins App.tsx et package.json
      const filePaths = filesResponse.body.map((f: any) => f.path);
      expect(filePaths).toContain('/src/App.tsx');
      expect(filePaths).toContain('/package.json');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject request without auth', async () => {
      await request(app)
        .post('/api/apps')
        .send({ name: 'Test App' })
        .expect(401);
    });
  });

  describe('GET /api/apps/:id', () => {
    let appId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test App',
          description: 'Test Description'
        });
      
      appId = response.body.id;
    });

    it('should return app details', async () => {
      const response = await request(app)
        .get(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(appId);
      expect(response.body.name).toBe('Test App');
      expect(response.body.description).toBe('Test Description');
    });

    it('should reject access to non-existent app', async () => {
      await request(app)
        .get('/api/apps/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject access without auth', async () => {
      await request(app)
        .get(`/api/apps/${appId}`)
        .expect(401);
    });
  });

  describe('PUT /api/apps/:id', () => {
    let appId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Name',
          description: 'Original Description'
        });
      
      appId = response.body.id;
    });

    it('should update app successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should update only provided fields', async () => {
      const updateData = {
        name: 'Only Name Updated'
      };

      const response = await request(app)
        .put(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe('Original Description');
    });

    it('should reject update of non-existent app', async () => {
      await request(app)
        .put('/api/apps/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/apps/:id', () => {
    let appId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'App to Delete',
          description: 'This app will be deleted'
        });
      
      appId = response.body.id;
    });

    it('should delete app successfully', async () => {
      await request(app)
        .delete(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que l'app n'existe plus
      await request(app)
        .get(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should delete associated files', async () => {
      // Vérifier que l'app a des fichiers
      const filesResponse = await request(app)
        .get(`/api/apps/${appId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(filesResponse.body.length).toBeGreaterThan(0);

      // Supprimer l'app
      await request(app)
        .delete(`/api/apps/${appId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que les fichiers ont été supprimés
      const filesAfterDelete = await db
        .select()
        .from(virtualFiles)
        .where(eq(virtualFiles.appId, appId));

      expect(filesAfterDelete).toHaveLength(0);
    });

    it('should reject deletion of non-existent app', async () => {
      await request(app)
        .delete('/api/apps/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/apps/:id/files', () => {
    let appId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'App with Files',
          description: 'Test app'
        });
      
      appId = response.body.id;
    });

    it('should return app files', async () => {
      const response = await request(app)
        .get(`/api/apps/${appId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Vérifier la structure des fichiers
      const file = response.body[0];
      expect(file).toHaveProperty('id');
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('content');
      expect(file).toHaveProperty('size');
    });

    it('should reject access to non-existent app', async () => {
      await request(app)
        .get('/api/apps/non-existent-id/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
