import { Router } from 'express';
import { db } from '../database/connection';
import { chats, messages } from '../database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Schémas de validation
const createChatSchema = z.object({
  title: z.string().optional(),
});

const sendMessageSchema = z.object({
  message: z.string().min(1),
});

// GET /api/chat/:appId/chats - Lister les conversations d'une application
router.get('/:appId/chats', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.id;

    const appChats = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.appId, appId),
        eq(chats.userId, userId)
      ))
      .orderBy(desc(chats.updatedAt));

    res.json(appChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// POST /api/chat/:appId/chats - Créer une nouvelle conversation
router.post('/:appId/chats', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.id;
    const { title } = createChatSchema.parse(req.body);

    const newChat = await db
      .insert(chats)
      .values({
        appId,
        userId,
        title: title || 'New Chat',
      })
      .returning();

    res.status(201).json(newChat[0]);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// GET /api/chat/:chatId - Obtenir une conversation spécifique
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    const chat = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.id, parseInt(chatId)),
        eq(chats.userId, userId)
      ))
      .limit(1);

    if (!chat.length) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Récupérer les messages de la conversation
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, parseInt(chatId)))
      .orderBy(messages.createdAt);

    return res.json({
      ...chat[0],
      messages: chatMessages,
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST /api/chat/:chatId/messages - Envoyer un message
router.post('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;
    const { message } = sendMessageSchema.parse(req.body);

    // Vérifier que la conversation appartient à l'utilisateur
    const chat = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.id, parseInt(chatId)),
        eq(chats.userId, userId)
      ))
      .limit(1);

    if (!chat.length) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Créer le message utilisateur
    const userMessage = await db
      .insert(messages)
      .values({
        chatId: parseInt(chatId),
        role: 'user',
        content: message,
        tokenCount: message.length / 4, // Estimation simple
      })
      .returning();

    // TODO: Ici, vous intégreriez avec l'IA pour générer une réponse
    // Pour l'instant, on simule une réponse
    const aiResponse = `Je comprends votre message: "${message}". Comment puis-je vous aider à développer votre application ?`;

    const aiMessage = await db
      .insert(messages)
      .values({
        chatId: parseInt(chatId),
        role: 'assistant',
        content: aiResponse,
        tokenCount: aiResponse.length / 4,
      })
      .returning();

    // Mettre à jour la date de modification de la conversation
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, parseInt(chatId)));

    return res.status(201).json({
      userMessage: userMessage[0],
      aiMessage: aiMessage[0],
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/chat/:chatId - Supprimer une conversation
router.delete('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    // Vérifier que la conversation appartient à l'utilisateur
    const chat = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.id, parseInt(chatId)),
        eq(chats.userId, userId)
      ))
      .limit(1);

    if (!chat.length) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Supprimer la conversation (les messages seront supprimés automatiquement via CASCADE)
    await db.delete(chats).where(eq(chats.id, parseInt(chatId)));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export { router as chatRoutes };
