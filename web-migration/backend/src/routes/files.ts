import { Router } from 'express';
import { db } from '../database/connection';
import { apps } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { VirtualFileSystem } from '../services/virtualFileSystem';
import { z } from 'zod';

const router = Router();

// Schémas de validation
const fileOperationSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

const renameFileSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

// GET /api/files/:appId/read - Lire un fichier
router.get('/:appId/read', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { path } = req.query;
    const userId = req.user!.id;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    const content = await vfs.readFile(path);

    if (content === null) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// POST /api/files/:appId/write - Écrire un fichier
router.post('/:appId/write', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { path, content } = fileOperationSchema.parse(req.body);
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    await vfs.writeFile(path, content);

    res.json({ message: 'File written successfully' });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// DELETE /api/files/:appId/delete - Supprimer un fichier
router.delete('/:appId/delete', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { path } = req.query;
    const userId = req.user!.id;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    await vfs.deleteFile(path);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// POST /api/files/:appId/rename - Renommer un fichier
router.post('/:appId/rename', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { from, to } = renameFileSchema.parse(req.body);
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    await vfs.renameFile(from, to);

    res.json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// GET /api/files/:appId/list - Lister tous les fichiers d'une application
router.get('/:appId/list', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    const files = await vfs.listFiles();

    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// POST /api/files/:appId/export - Exporter tous les fichiers
router.post('/:appId/export', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.id;

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    const files = await vfs.exportFiles();

    res.json({ files });
  } catch (error) {
    console.error('Error exporting files:', error);
    res.status(500).json({ error: 'Failed to export files' });
  }
});

// POST /api/files/:appId/import - Importer des fichiers
router.post('/:appId/import', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const { files } = req.body;
    const userId = req.user!.id;

    if (!files || typeof files !== 'object') {
      return res.status(400).json({ error: 'Files object is required' });
    }

    // Vérifier que l'application appartient à l'utilisateur
    const app = await db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
      .limit(1);

    if (!app.length) {
      return res.status(404).json({ error: 'App not found' });
    }

    const vfs = new VirtualFileSystem(appId);
    await vfs.importFiles(files);

    res.json({ message: 'Files imported successfully' });
  } catch (error) {
    console.error('Error importing files:', error);
    res.status(500).json({ error: 'Failed to import files' });
  }
});

export { router as fileRoutes };
