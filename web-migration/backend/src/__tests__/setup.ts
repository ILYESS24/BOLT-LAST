import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Configuration des tests
beforeAll(async () => {
  // Configuration de l'environnement de test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/dyad_test';
});

afterAll(async () => {
  // Nettoyage après tous les tests
  console.log('Tests terminés');
});

beforeEach(async () => {
  // Nettoyage avant chaque test
  console.log('Début du test');
});

// Augmenter le timeout pour les tests
jest.setTimeout(10000);
