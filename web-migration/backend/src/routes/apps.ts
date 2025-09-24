import { Router } from 'express';
import { db } from '../database/connection';
import { apps, virtualFiles } from '../database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Schémas de validation
const createAppSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  templateId: z.string().optional(),
});

const updateAppSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// GET /api/apps - Lister toutes les applications de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const userApps = await db
      .select()
      .from(apps)
      .where(eq(apps.userId, userId))
      .orderBy(desc(apps.updatedAt));

    res.json(userApps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// GET /api/apps/:id - Obtenir une application spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json(app[0]);
  } catch (error) {
    console.error('Error fetching app:', error);
    return res.status(500).json({ error: 'Failed to fetch app' });
  }
});

// POST /api/apps - Créer une nouvelle application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, templateId } = createAppSchema.parse(req.body);

    // Générer un ID unique
    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const appPath = `/apps/${appId}`;

    // Créer l'application
    const newApp = await db
      .insert(apps)
      .values({
        id: appId,
        userId,
        name,
        description,
        path: appPath,
        templateId,
      })
      .returning();

    // Si un template est spécifié, créer les fichiers par défaut
    if (templateId) {
      // TODO: Implémenter la logique de création des fichiers à partir du template
    } else {
      // Créer les fichiers par défaut
      const defaultFiles = [
        {
          id: `file_${Date.now()}_1`,
          appId,
          path: '/src/App.tsx',
          content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ${name}</h1>
      <p>Start building your application!</p>
    </div>
  );
}

export default App;`,
          size: 200,
        },
        {
          id: `file_${Date.now()}_2`,
          appId,
          path: '/package.json',
          content: JSON.stringify({
            name: name.toLowerCase().replace(/\s+/g, '-'),
            version: '0.1.0',
            private: true,
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
            },
          }, null, 2),
          size: 150,
        },
      ];

      await db.insert(virtualFiles).values(defaultFiles);
    }

    res.status(201).json(newApp[0]);
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(500).json({ error: 'Failed to create app' });
  }
});

// PUT /api/apps/:id - Mettre à jour une application
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = updateAppSchema.parse(req.body);

    const updatedApp = await db
      .update(apps)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .returning();

    if (!updatedApp.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json(updatedApp[0]);
  } catch (error) {
    console.error('Error updating app:', error);
    return res.status(500).json({ error: 'Failed to update app' });
  }
});

// DELETE /api/apps/:id - Supprimer une application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Supprimer l'application (les fichiers et chats seront supprimés automatiquement via CASCADE)
    await db.delete(apps).where(eq(apps.id, id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting app:', error);
    return res.status(500).json({ error: 'Failed to delete app' });
  }
});

// GET /api/apps/:id/files - Obtenir tous les fichiers d'une application
router.get('/:id/files', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, id), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Récupérer tous les fichiers de l'application
    const files = await db
      .select()
      .from(virtualFiles)
      .where(eq(virtualFiles.appId, id))
      .orderBy(virtualFiles.path);

    return res.json(files);
  } catch (error) {
    console.error('Error fetching app files:', error);
    return res.status(500).json({ error: 'Failed to fetch app files' });
  }
});

export { router as appRoutes };
