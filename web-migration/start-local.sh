#!/bin/bash

echo "🚀 Démarrage de Dyad Web en mode local..."

echo ""
echo "📦 Installation des dépendances backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances backend"
    exit 1
fi

echo ""
echo "📦 Installation des dépendances frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances frontend"
    exit 1
fi

echo ""
echo "🗄️ Initialisation de la base de données..."
cd ../backend
npm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'initialisation de la base de données"
    exit 1
fi

echo ""
echo "🎉 Installation terminée avec succès !"
echo ""
echo "Pour démarrer l'application :"
echo "1. Ouvrez un terminal et exécutez : cd backend && npm run dev"
echo "2. Ouvrez un autre terminal et exécutez : cd frontend && npm run dev"
echo ""
echo "L'application sera accessible sur :"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3001"
echo ""
