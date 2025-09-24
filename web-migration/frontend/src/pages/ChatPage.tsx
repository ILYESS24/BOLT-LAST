import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../lib/api';
import { MessageSquare, Send } from 'lucide-react';

export function ChatPage() {
  const [message, setMessage] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>('');

  // Récupérer les applications pour le sélecteur
  const { data: apps } = useQuery({
    queryKey: ['apps'],
    queryFn: ApiService.getApps,
  });

  // Récupérer les conversations de l'application sélectionnée
  const { data: chats } = useQuery({
    queryKey: ['chats', selectedApp],
    queryFn: () => ApiService.getChats(selectedApp),
    enabled: !!selectedApp,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedApp) {
      // TODO: Implémenter l'envoi de message
      console.log('Sending message:', message, 'to app:', selectedApp);
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Chat IA
        </h1>
        <p className="text-muted-foreground">
          Discutez avec l'IA pour développer vos applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélecteur d'application */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Applications</h3>
            {apps && apps.length > 0 ? (
              <div className="space-y-2">
                {apps.map((app: any) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedApp === app.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium">{app.name}</div>
                    {app.description && (
                      <div className="text-sm opacity-75">{app.description}</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucune application disponible. Créez une application depuis la page d'accueil.
              </p>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg h-96 flex flex-col">
            {selectedApp ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {chats && chats.length > 0 ? (
                    <div className="space-y-4">
                      {chats.map((chat: any) => (
                        <div key={chat.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{chat.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(chat.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune conversation pour cette application.</p>
                      <p className="text-sm">Commencez une nouvelle conversation ci-dessous.</p>
                    </div>
                  )}
                </div>

                {/* Formulaire d'envoi */}
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une application pour commencer à discuter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
