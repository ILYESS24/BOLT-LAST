import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Configuration des tests
beforeAll(() => {
  // Configuration globale pour les tests
  process.env.VITE_API_URL = 'http://localhost:3001/api';
  process.env.VITE_WS_URL = 'ws://localhost:3001';
});

afterAll(() => {
  // Nettoyage après tous les tests
  cleanup();
});

beforeEach(() => {
  // Nettoyage avant chaque test
  cleanup();
  
  // Réinitialiser les mocks
  vi.clearAllMocks();
});

// Augmenter le timeout pour les tests
vi.setConfig({
  testTimeout: 10000,
});
