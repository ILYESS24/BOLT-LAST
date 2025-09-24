import { Router } from 'express';
import { db } from '../database/connection';
import { userSettings } from '../database/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour les paramètres
const settingsSchema = z.object({
  selectedModel: z.object({
    provider: z.string(),
    model: z.string(),
  }).optional(),
  releaseChannel: z.enum(['stable', 'beta']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  autoSave: z.boolean().optional(),
  notifications: z.boolean().optional(),
});

// GET /api/settings - Obtenir les paramètres de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!settings.length) {
      // Créer des paramètres par défaut
      const defaultSettings = {
        selectedModel: {
          provider: 'openai',
          model: 'gpt-4',
        },
        releaseChannel: 'stable' as const,
        theme: 'system' as const,
        language: 'en',
        autoSave: true,
        notifications: true,
      };

      const newSettings = await db
        .insert(userSettings)
        .values({
          id: `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          settings: defaultSettings,
        })
        .returning();

      return res.json(newSettings[0].settings);
    }

    return res.json(settings[0].settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Mettre à jour les paramètres de l'utilisateur
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const newSettings = settingsSchema.parse(req.body);

    // Récupérer les paramètres existants
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    let updatedSettings;

    if (existingSettings.length > 0) {
      // Mettre à jour les paramètres existants
      const mergedSettings = {
        ...existingSettings[0].settings,
        ...newSettings,
      };

      updatedSettings = await db
        .update(userSettings)
        .set({
          settings: mergedSettings,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.id, existingSettings[0].id))
        .returning();

      return res.json(updatedSettings[0].settings);
    } else {
      // Créer de nouveaux paramètres
      const defaultSettings = {
        selectedModel: {
          provider: 'openai',
          model: 'gpt-4',
        },
        releaseChannel: 'stable' as const,
        theme: 'system' as const,
        language: 'en',
        autoSave: true,
        notifications: true,
        ...newSettings,
      };

      updatedSettings = await db
        .insert(userSettings)
        .values({
          id: `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          settings: defaultSettings,
        })
        .returning();

      return res.json(updatedSettings[0].settings);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /api/settings/reset - Réinitialiser les paramètres par défaut
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const defaultSettings = {
      selectedModel: {
        provider: 'openai',
        model: 'gpt-4',
      },
      releaseChannel: 'stable' as const,
      theme: 'system' as const,
      language: 'en',
      autoSave: true,
      notifications: true,
    };

    // Supprimer les paramètres existants
    await db
      .delete(userSettings)
      .where(eq(userSettings.userId, userId));

    // Créer de nouveaux paramètres par défaut
    const newSettings = await db
      .insert(userSettings)
      .values({
        id: `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        settings: defaultSettings,
      })
      .returning();

    res.json(newSettings[0].settings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

export { router as settingsRoutes };
