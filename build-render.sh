#!/bin/bash

# Script de build pour Render
echo "🚀 Build de Dyad pour Render..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur: Le build a échoué. Vérifiez les erreurs ci-dessus."
    exit 1
fi

# Vérifier que le répertoire dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le répertoire dist n'existe pas après le build."
    exit 1
fi

echo "✅ Build réussi pour Render!"
echo "📁 Répertoire dist prêt pour le déploiement"
