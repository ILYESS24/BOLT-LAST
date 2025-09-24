import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../lib/api';
import { Folder, File, Code, Play } from 'lucide-react';

export function AppDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // Récupérer les détails de l'application
  const { data: app, isLoading: appLoading } = useQuery({
    queryKey: ['app', id],
    queryFn: () => ApiService.getApp(id!),
    enabled: !!id,
  });

  // Récupérer les fichiers de l'application
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['app-files', id],
    queryFn: () => ApiService.getAppFiles(id!),
    enabled: !!id,
  });

  if (appLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Application non trouvée
        </h3>
        <p className="text-muted-foreground">
          L'application demandée n'existe pas ou vous n'avez pas l'autorisation d'y accéder.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête de l'application */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Folder className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{app.name}</h1>
            {app.description && (
              <p className="text-muted-foreground mt-1">{app.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Créé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <span>Modifié le {new Date(app.updatedAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex space-x-4">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90">
          <Play className="mr-2 h-4 w-4" />
          Exécuter
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md hover:bg-accent">
          <Code className="mr-2 h-4 w-4" />
          Éditer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des fichiers */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Fichiers</h3>
            {filesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-1">
                {files.map((file: any) => (
                  <div key={file.id} className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{file.path}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {Math.round(file.size / 1024)}KB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucun fichier dans cette application.
              </p>
            )}
          </div>
        </div>

        {/* Zone de contenu */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
            <div className="text-center py-12 text-muted-foreground">
              <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>L'éditeur de code sera disponible ici.</p>
              <p className="text-sm">Sélectionnez un fichier pour commencer à éditer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
