import { Router } from 'express';
import { db } from '../database/connection';
import { templates } from '../database/schema';
import { eq } from 'drizzle-orm';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/templates - Lister tous les templates
router.get('/', optionalAuth, async (req, res) => {
  try {
    const allTemplates = await db
      .select()
      .from(templates)
      .orderBy(templates.createdAt);

    res.json(allTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:id - Obtenir un template spécifique
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id))
      .limit(1);

    if (!template.length) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

export { router as templateRoutes };
