import { useState, useCallback } from 'react';
// import { useLoadApp } from './useLoadApp';

export interface RunAppOptions {
  appId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function useRunApp() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const runApp = useCallback(async ({ appId, onSuccess, onError }: RunAppOptions) => {
    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      // Simuler l'exécution de l'application
      // Dans une vraie implémentation, cela ferait un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockOutput = `Application ${appId} exécutée avec succès !
      
Résultats:
- Fichiers compilés: 3
- Erreurs: 0
- Avertissements: 1
- Temps d'exécution: 1.2s

L'application est maintenant disponible sur http://localhost:3000`;

      setOutput(mockOutput);
      onSuccess?.(mockOutput);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsRunning(false);
    }
  }, []);

  const stopApp = useCallback(() => {
    setIsRunning(false);
    setOutput('');
    setError(null);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

  return {
    isRunning,
    output,
    error,
    runApp,
    restartApp: (options?: any) => runApp({ appId: "0", ...options }),
    refreshAppIframe: () => {},
    stopApp,
    clearOutput,
  };
}