import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProModeSelectorProps {
  isProMode: boolean;
  onToggle: (isPro: boolean) => void;
  className?: string;
}

export function ProModeSelector({ 
  isProMode, 
  onToggle, 
  className 
}: ProModeSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mode Professionnel</CardTitle>
        <CardDescription>
          Activez le mode pro pour accéder à des fonctionnalités avancées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isProMode ? 'Mode Pro activé' : 'Mode Standard'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isProMode 
                ? 'Accès à toutes les fonctionnalités avancées'
                : 'Fonctionnalités de base uniquement'
              }
            </p>
          </div>
          <Button
            variant={isProMode ? "default" : "outline"}
            onClick={() => onToggle(!isProMode)}
          >
            {isProMode ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}