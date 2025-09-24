import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../lib/api';
import { Plus, Folder, Trash2, Edit } from 'lucide-react';

export function HomePage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDescription, setNewAppDescription] = useState('');
  const queryClient = useQueryClient();

  // Récupérer les applications
  const { data: apps, isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: ApiService.getApps,
  });

  // Mutation pour créer une nouvelle application
  const createAppMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      ApiService.createApp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setShowCreateForm(false);
      setNewAppName('');
      setNewAppDescription('');
    },
  });

  // Mutation pour supprimer une application
  const deleteAppMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteApp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAppName.trim()) {
      createAppMutation.mutate({
        name: newAppName.trim(),
        description: newAppDescription.trim() || undefined,
      });
    }
  };

  const handleDeleteApp = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      deleteAppMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mes Applications
        </h1>
        <p className="text-muted-foreground">
          Gérez vos applications IA et créez de nouveaux projets.
        </p>
      </div>

      {/* Bouton pour créer une nouvelle application */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Application
        </button>
      </div>

      {/* Formulaire de création d'application */}
      {showCreateForm && (
        <div className="mb-6 p-6 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Créer une nouvelle application</h3>
          <form onSubmit={handleCreateApp} className="space-y-4">
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-foreground mb-1">
                Nom de l'application
              </label>
              <input
                id="appName"
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mon application IA"
                required
              />
            </div>
            <div>
              <label htmlFor="appDescription" className="block text-sm font-medium text-foreground mb-1">
                Description (optionnel)
              </label>
              <textarea
                id="appDescription"
                value={newAppDescription}
                onChange={(e) => setNewAppDescription(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Description de votre application..."
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createAppMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createAppMutation.isPending ? 'Création...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des applications */}
      {apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app: any) => (
            <div key={app.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Folder className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{app.name}</h3>
                    {app.description && (
                      <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mb-4">
                Créé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
              </div>
              
              <div className="flex space-x-2">
                <a
                  href={`/app/${app.id}`}
                  className="flex-1 text-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Ouvrir
                </a>
                <button className="px-3 py-2 border border-input rounded-md hover:bg-accent transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucune application
          </h3>
          <p className="text-muted-foreground mb-4">
            Créez votre première application IA pour commencer.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer une application
          </button>
        </div>
      )}
    </div>
  );
}
