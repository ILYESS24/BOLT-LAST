import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { users, chats } from '../database/schema';
import { eq, and } from 'drizzle-orm';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  chatId?: number;
}

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('🔌 New WebSocket connection');

    // Extraire les paramètres de l'URL
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const chatId = url.searchParams.get('chatId');
    const token = url.searchParams.get('token');

    // Authentifier l'utilisateur
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      // Vérifier que l'utilisateur existe
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user.length) {
        ws.close(1008, 'Invalid user');
        return;
      }

      ws.userId = decoded.userId;

      // Si un chatId est fourni, vérifier l'accès
      if (chatId) {
        const chat = await db
          .select()
          .from(chats)
          .where(and(
            eq(chats.id, parseInt(chatId)),
            eq(chats.userId, decoded.userId)
          ))
          .limit(1);

        if (!chat.length) {
          ws.close(1008, 'Chat access denied');
          return;
        }

        ws.chatId = parseInt(chatId);
      }

      console.log(`✅ WebSocket authenticated for user ${ws.userId}, chat ${ws.chatId || 'none'}`);

      // Gérer les messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Gérer la fermeture
      ws.on('close', () => {
        console.log(`🔌 WebSocket disconnected for user ${ws.userId}`);
      });

      // Envoyer un message de bienvenue
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected successfully',
        chatId: ws.chatId
      }));

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  console.log('🚀 WebSocket server ready');
}

async function handleWebSocketMessage(ws: AuthenticatedWebSocket, message: any) {
  const { type, data } = message;

  switch (type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'chat_message':
      if (!ws.chatId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'No chat ID provided'
        }));
        return;
      }
      await handleChatMessage(ws, data);
      break;

    case 'stream_request':
      if (!ws.chatId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'No chat ID provided'
        }));
        return;
      }
      await handleStreamRequest(ws, data);
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${type}`
      }));
  }
}

async function handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
  try {
    const { message } = data;

    // Simuler une réponse IA streaming
    const response = `Je comprends votre message: "${message}". Comment puis-je vous aider à développer votre application ?`;
    
    // Envoyer la réponse en streaming
    for (let i = 0; i < response.length; i += 10) {
      const chunk = response.slice(i, i + 10);
      
      ws.send(JSON.stringify({
        type: 'stream_chunk',
        data: {
          content: chunk,
          done: i + 10 >= response.length
        }
      }));

      // Simuler un délai de streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Envoyer un message de fin
    ws.send(JSON.stringify({
      type: 'stream_complete',
      data: {
        fullResponse: response
      }
    }));

  } catch (error) {
    console.error('Error handling chat message:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process chat message'
    }));
  }
}

async function handleStreamRequest(ws: AuthenticatedWebSocket, data: any) {
  try {
    const { prompt, context: _context } = data;

    // Simuler une génération de code IA
    const codeResponse = `// Code généré pour: ${prompt}
import React from 'react';

function GeneratedComponent() {
  return (
    <div className="generated-component">
      <h2>Composant généré</h2>
      <p>Ce composant a été généré automatiquement.</p>
    </div>
  );
}

export default GeneratedComponent;`;

    // Envoyer le code en streaming
    for (let i = 0; i < codeResponse.length; i += 20) {
      const chunk = codeResponse.slice(i, i + 20);
      
      ws.send(JSON.stringify({
        type: 'code_stream',
        data: {
          content: chunk,
          done: i + 20 >= codeResponse.length
        }
      }));

      // Simuler un délai de streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Envoyer un message de fin
    ws.send(JSON.stringify({
      type: 'code_complete',
      data: {
        fullCode: codeResponse,
        files: [
          {
            path: '/src/components/GeneratedComponent.tsx',
            content: codeResponse
          }
        ]
      }
    }));

  } catch (error) {
    console.error('Error handling stream request:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process stream request'
    }));
  }
}
