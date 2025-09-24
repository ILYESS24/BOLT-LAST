import { z } from 'zod';

// Schémas de validation pour les tests
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const appSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const fileSchema = z.object({
  path: z.string().min(1),
  content: z.string()
});

describe('Data Validation Tests', () => {
  describe('User Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123',
        name: ''
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('App Validation', () => {
    it('should validate correct app data', () => {
      const validApp = {
        name: 'My App',
        description: 'A test application'
      };

      const result = appSchema.safeParse(validApp);
      expect(result.success).toBe(true);
    });

    it('should validate app without description', () => {
      const validApp = {
        name: 'My App'
      };

      const result = appSchema.safeParse(validApp);
      expect(result.success).toBe(true);
    });

    it('should reject empty app name', () => {
      const invalidApp = {
        name: '',
        description: 'A test application'
      };

      const result = appSchema.safeParse(invalidApp);
      expect(result.success).toBe(false);
    });
  });

  describe('File Validation', () => {
    it('should validate correct file data', () => {
      const validFile = {
        path: '/src/App.tsx',
        content: 'export default function App() { return <div>Hello</div>; }'
      };

      const result = fileSchema.safeParse(validFile);
      expect(result.success).toBe(true);
    });

    it('should reject empty file path', () => {
      const invalidFile = {
        path: '',
        content: 'Some content'
      };

      const result = fileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });

    it('should validate file with empty content', () => {
      const validFile = {
        path: '/empty.txt',
        content: ''
      };

      const result = fileSchema.safeParse(validFile);
      expect(result.success).toBe(true);
    });
  });

  describe('Path Security Validation', () => {
    it('should detect directory traversal attempts', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM'
      ];

      maliciousPaths.forEach(path => {
        const hasTraversal = path.includes('..') || 
                           path.includes('/etc/') || 
                           path.includes('C:\\Windows\\') ||
                           path.includes('system32');
        expect(hasTraversal).toBe(true);
      });
    });

    it('should allow valid file paths', () => {
      const validPaths = [
        '/src/App.tsx',
        '/components/Button.tsx',
        '/styles/main.css',
        '/package.json'
      ];

      validPaths.forEach(path => {
        const hasTraversal = path.includes('..') || 
                           path.includes('/etc/') || 
                           path.includes('C:\\Windows\\') ||
                           path.includes('system32');
        expect(hasTraversal).toBe(false);
      });
    });
  });
});
