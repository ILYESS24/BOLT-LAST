import { useState, useCallback } from 'react';

export interface AppFile {
  id: string;
  path: string;
  content: string;
  size: number;
  updatedAt: string;
}

export function useLoadAppFile(_appId?: string, _filePath?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [file, setFile] = useState<AppFile | null>(null);

  const loadFile = useCallback(async (appId: string, filePath: string): Promise<AppFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulation du chargement d'un fichier
      // Dans une vraie implémentation, ceci ferait un appel API
      const response = await fetch(`/api/apps/${appId}/files/${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      const fileData = await response.json();
      setFile(fileData);
      setContent(fileData.content);
      return fileData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFile = useCallback(async (appId: string, filePath: string, content: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/apps/${appId}/files/${encodeURIComponent(filePath)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }

      setContent(content);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFile = useCallback(() => {
    if (file?.path) {
      // Recharger le fichier avec les mêmes paramètres
      // Note: nous aurions besoin de stocker appId et filePath
      // Pour l'instant, on simule
      setContent(file.content);
    }
  }, [file?.path, file?.content]);

  return {
    loadFile,
    saveFile,
    refreshFile,
    content,
    file,
    loading: isLoading,
    isLoading,
    error,
  };
}