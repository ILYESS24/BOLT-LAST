import request from 'supertest';
import { app } from '../../index';
import { db } from '../../database/connection';
import { users, apps, virtualFiles } from '../../database/schema';
// import { eq } from 'drizzle-orm';

describe('Files API', () => {
  let authToken: string;
  let appId: string;

  beforeEach(async () => {
    // Nettoyer la base de données
    await db.delete(virtualFiles);
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

  describe('GET /api/files/:appId/read', () => {
    it('should read existing file', async () => {
      // Créer un fichier de test
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/test.txt',
          content: 'Hello World!'
        });

      const response = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/test.txt' })
        .expect(200);

      expect(response.body.content).toBe('Hello World!');
    });

    it('should return 404 for non-existent file', async () => {
      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/non-existent.txt' })
        .expect(404);
    });

    it('should reject request without path parameter', async () => {
      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject access to non-existent app', async () => {
      await request(app)
        .get('/api/files/non-existent-app/read')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/test.txt' })
        .expect(404);
    });
  });

  describe('POST /api/files/:appId/write', () => {
    it('should create new file', async () => {
      const fileData = {
        path: '/new-file.txt',
        content: 'This is new content'
      };

      const response = await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(fileData)
        .expect(200);

      expect(response.body.message).toBe('File written successfully');

      // Vérifier que le fichier a été créé
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: fileData.path })
        .expect(200);

      expect(readResponse.body.content).toBe(fileData.content);
    });

    it('should update existing file', async () => {
      const filePath = '/update-test.txt';
      const initialContent = 'Initial content';
      const updatedContent = 'Updated content';

      // Créer le fichier initial
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: filePath,
          content: initialContent
        });

      // Mettre à jour le fichier
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: filePath,
          content: updatedContent
        })
        .expect(200);

      // Vérifier la mise à jour
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: filePath })
        .expect(200);

      expect(readResponse.body.content).toBe(updatedContent);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should handle large files', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB de contenu

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
  });

  describe('DELETE /api/files/:appId/delete', () => {
    beforeEach(async () => {
      // Créer un fichier de test
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/delete-test.txt',
          content: 'This file will be deleted'
        });
    });

    it('should delete file successfully', async () => {
      await request(app)
        .delete(`/api/files/${appId}/delete`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/delete-test.txt' })
        .expect(200);

      // Vérifier que le fichier a été supprimé
      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/delete-test.txt' })
        .expect(404);
    });

    it('should return 404 for non-existent file', async () => {
      await request(app)
        .delete(`/api/files/${appId}/delete`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/non-existent.txt' })
        .expect(404);
    });

    it('should reject request without path parameter', async () => {
      await request(app)
        .delete(`/api/files/${appId}/delete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/files/:appId/rename', () => {
    beforeEach(async () => {
      // Créer un fichier de test
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/original.txt',
          content: 'Original content'
        });
    });

    it('should rename file successfully', async () => {
      await request(app)
        .post(`/api/files/${appId}/rename`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from: '/original.txt',
          to: '/renamed.txt'
        })
        .expect(200);

      // Vérifier que le fichier a été renommé
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/renamed.txt' })
        .expect(200);

      expect(readResponse.body.content).toBe('Original content');

      // Vérifier que l'ancien fichier n'existe plus
      await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/original.txt' })
        .expect(404);
    });

    it('should reject rename of non-existent file', async () => {
      await request(app)
        .post(`/api/files/${appId}/rename`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from: '/non-existent.txt',
          to: '/renamed.txt'
        })
        .expect(404);
    });

    it('should reject rename to existing file', async () => {
      // Créer un fichier de destination
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/destination.txt',
          content: 'Destination content'
        });

      await request(app)
        .post(`/api/files/${appId}/rename`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from: '/original.txt',
          to: '/destination.txt'
        })
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post(`/api/files/${appId}/rename`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/files/:appId/list', () => {
    beforeEach(async () => {
      // Créer plusieurs fichiers de test
      const files = [
        { path: '/file1.txt', content: 'Content 1' },
        { path: '/file2.txt', content: 'Content 2' },
        { path: '/subdir/file3.txt', content: 'Content 3' }
      ];

      for (const file of files) {
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(file);
      }
    });

    it('should list all files', async () => {
      const response = await request(app)
        .get(`/api/files/${appId}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(3);
      
      // Vérifier la structure des fichiers
      const file = response.body[0];
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('updatedAt');
    });

    it('should return empty list for app with no files', async () => {
      // Créer une nouvelle app sans fichiers
      const appResponse = await request(app)
        .post('/api/apps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Empty App',
          description: 'App with no files'
        });

      const response = await request(app)
        .get(`/api/files/${appResponse.body.id}/list`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/files/:appId/export', () => {
    beforeEach(async () => {
      // Créer plusieurs fichiers de test
      const files = [
        { path: '/file1.txt', content: 'Content 1' },
        { path: '/file2.txt', content: 'Content 2' }
      ];

      for (const file of files) {
        await request(app)
          .post(`/api/files/${appId}/write`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(file);
      }
    });

    it('should export all files', async () => {
      const response = await request(app)
        .post(`/api/files/${appId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(response.body.files).toHaveProperty('/file1.txt');
      expect(response.body.files).toHaveProperty('/file2.txt');
      expect(response.body.files['/file1.txt']).toBe('Content 1');
      expect(response.body.files['/file2.txt']).toBe('Content 2');
    });
  });

  describe('POST /api/files/:appId/import', () => {
    it('should import files successfully', async () => {
      const filesToImport = {
        '/imported1.txt': 'Imported content 1',
        '/imported2.txt': 'Imported content 2'
      };

      await request(app)
        .post(`/api/files/${appId}/import`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ files: filesToImport })
        .expect(200);

      // Vérifier que les fichiers ont été importés
      for (const [path, content] of Object.entries(filesToImport)) {
        const readResponse = await request(app)
          .get(`/api/files/${appId}/read`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({ path })
          .expect(200);

        expect(readResponse.body.content).toBe(content);
      }
    });

    it('should replace existing files on import', async () => {
      // Créer un fichier existant
      await request(app)
        .post(`/api/files/${appId}/write`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/existing.txt',
          content: 'Original content'
        });

      // Importer avec le même fichier
      const filesToImport = {
        '/existing.txt': 'Imported content'
      };

      await request(app)
        .post(`/api/files/${appId}/import`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ files: filesToImport })
        .expect(200);

      // Vérifier que le fichier a été remplacé
      const readResponse = await request(app)
        .get(`/api/files/${appId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ path: '/existing.txt' })
        .expect(200);

      expect(readResponse.body.content).toBe('Imported content');
    });

    it('should validate files object', async () => {
      await request(app)
        .post(`/api/files/${appId}/import`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
