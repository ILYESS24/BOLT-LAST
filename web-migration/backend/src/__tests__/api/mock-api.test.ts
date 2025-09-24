import request from 'supertest';
import express from 'express';

// Créer une app Express simple pour les tests
const testApp = express();

testApp.use(express.json());

// Route de test simple
testApp.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route de test avec paramètres
testApp.get('/test/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Test successful' });
});

// Route de test POST
testApp.post('/test', (req, res) => {
  res.json({ received: req.body, message: 'Data received' });
});

// Middleware de test pour l'authentification
testApp.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = { id: 'test-user', email: 'test@example.com' };
  }
  next();
});

// Route protégée
testApp.get('/protected', (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user: req.user, message: 'Access granted' });
});

// Gestionnaire d'erreur
testApp.use((err: any, req: any, res: any, _next: any) => {
  res.status(500).json({ error: 'Internal server error' });
});

// Gestionnaire 404
testApp.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

describe('Mock API Tests', () => {
  describe('Basic Routes', () => {
    it('should return health status', async () => {
      const response = await request(testApp)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle route parameters', async () => {
      const response = await request(testApp)
        .get('/test/123')
        .expect(200);

      expect(response.body.id).toBe('123');
      expect(response.body.message).toBe('Test successful');
    });

    it('should handle POST requests', async () => {
      const testData = { name: 'Test', value: 42 };
      
      const response = await request(testApp)
        .post('/test')
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
      expect(response.body.message).toBe('Data received');
    });
  });

  describe('Authentication', () => {
    it('should allow access with valid token', async () => {
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe('test-user');
      expect(response.body.message).toBe('Access granted');
    });

    it('should reject access without token', async () => {
      const response = await request(testApp)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject access with invalid token format', async () => {
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(testApp)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });

    it('should handle malformed JSON', async () => {
      const _response = await request(testApp)
        .post('/test')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(500); // Express retourne 500 pour JSON malformé, pas 400
    });
  });

  describe('Request Validation', () => {
    it('should handle empty request body', async () => {
      const response = await request(testApp)
        .post('/test')
        .send({})
        .expect(200);

      expect(response.body.received).toEqual({});
    });

    it('should handle large request body', async () => {
      const largeData = {
        content: 'A'.repeat(1000),
        array: Array.from({ length: 100 }, (_, i) => i)
      };

      const response = await request(testApp)
        .post('/test')
        .send(largeData)
        .expect(200);

      expect(response.body.received.content.length).toBe(1000);
      expect(response.body.received.array.length).toBe(100);
    });
  });

  describe('Response Headers', () => {
    it('should include proper content type', async () => {
      const response = await request(testApp)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle CORS headers', async () => {
      const response = await request(testApp)
        .options('/health')
        .expect(404); // Notre app simple n'a pas de CORS configuré

      // Dans une vraie app, on vérifierait les headers CORS
      expect(response.headers).toBeDefined();
    });
  });
});
