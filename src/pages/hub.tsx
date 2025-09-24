import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HubPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hub d'applications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications populaires</CardTitle>
            <CardDescription>
              Découvrez les applications les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Explorer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouveautés</CardTitle>
            <CardDescription>
              Les dernières applications ajoutées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Voir les nouveautés</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes favoris</CardTitle>
            <CardDescription>
              Vos applications préférées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Voir mes favoris</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
