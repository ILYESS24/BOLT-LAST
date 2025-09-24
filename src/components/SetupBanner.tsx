import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SetupBannerProps {
  className?: string;
}

export function SetupBanner({ className }: SetupBannerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Configuration requise</CardTitle>
        <CardDescription>
          Configurez votre fournisseur IA pour commencer à utiliser l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Aucun fournisseur IA configuré
            </p>
            <p className="text-xs text-muted-foreground">
              Vous devez configurer au moins un fournisseur IA pour utiliser l'application
            </p>
          </div>
          <Link to="/settings/providers/openai">
            <Button>Configurer</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}