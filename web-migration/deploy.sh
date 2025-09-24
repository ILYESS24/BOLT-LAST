#!/bin/bash

# Script de déploiement pour Dyad Web
set -e

echo "🚀 Déploiement de Dyad Web en production..."

# Vérifier que les variables d'environnement sont définies
if [ ! -f ".env.prod" ]; then
    echo "❌ Fichier .env.prod non trouvé. Copiez env.prod.example vers .env.prod et configurez-le."
    exit 1
fi

# Charger les variables d'environnement
source .env.prod

# Vérifier les variables critiques
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
    echo "❌ Variables d'environnement critiques manquantes (POSTGRES_PASSWORD, JWT_SECRET)"
    exit 1
fi

echo "📦 Construction des images Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

echo "🗄️ Sauvegarde de la base de données (si elle existe)..."
if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Sauvegarde créée"
fi

echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Attente du démarrage des services..."
sleep 30

echo "🔍 Vérification de la santé des services..."
# Vérifier le backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend opérationnel"
else
    echo "❌ Backend non accessible"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Vérifier le frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend opérationnel"
else
    echo "❌ Frontend non accessible"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "🌐 Application accessible sur :"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:3001"
echo ""
echo "📊 Pour voir les logs :"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Pour arrêter :"
echo "   docker-compose -f docker-compose.prod.yml down"
