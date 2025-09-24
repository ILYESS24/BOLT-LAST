import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProviderSettings } from '../../../components/ProviderSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export const Route = createFileRoute('/settings/providers/$provider' as any)({
  component: ProviderPage,
});

export const providerSettingsRoute = Route;

function ProviderPage() {
  const { provider } = Route.useParams();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuration du fournisseur</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres pour {provider}
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres {provider}</CardTitle>
            <CardDescription>
              Configurez votre clé API et les paramètres spécifiques à {provider}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}