# 🚀 Guide de Déploiement - Dyad Web

Ce guide vous explique comment déployer Dyad Web en production sur différentes plateformes.

## 📋 Prérequis

- Docker et Docker Compose
- Un domaine (optionnel mais recommandé)
- Certificats SSL (pour HTTPS)
- Variables d'environnement configurées

## 🔧 Configuration

### 1. Variables d'Environnement

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp env.prod.example .env.prod
```

Éditez `.env.prod` avec vos valeurs :

```env
# Base de données
POSTGRES_PASSWORD=your-super-secure-password
JWT_SECRET=your-super-secret-jwt-key

# URLs
FRONTEND_URL=https://votre-domaine.com
VITE_API_URL=https://api.votre-domaine.com/api
VITE_WS_URL=wss://api.votre-domaine.com

# APIs IA
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### 2. Certificats SSL

Pour HTTPS, placez vos certificats dans `nginx/ssl/` :
- `cert.pem` - Certificat SSL
- `key.pem` - Clé privée

## 🐳 Déploiement avec Docker

### Déploiement Local

```bash
# Démarrage rapide
./start-local.sh  # Linux/Mac
start-local.bat   # Windows

# Ou manuellement
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Déploiement Production

```bash
# Déploiement complet
./deploy.sh       # Linux/Mac
deploy.bat        # Windows

# Ou manuellement
docker-compose -f docker-compose.prod.yml up -d
```

### Vérification

```bash
# Vérifier les services
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Tester l'API
curl http://localhost:3001/health
```

## ☁️ Déploiement Cloud

### Vercel (Frontend)

1. **Connecter le repository** :
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Configurer les variables** :
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_WS_URL
   ```

3. **Déployer** :
   ```bash
   vercel --prod
   ```

### Railway (Backend)

1. **Connecter le repository** :
   - Allez sur [Railway.app](https://railway.app)
   - Connectez votre GitHub
   - Sélectionnez le dossier `backend`

2. **Configurer les variables** :
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   FRONTEND_URL=https://votre-frontend.vercel.app
   ```

3. **Déployer** :
   - Railway déploie automatiquement à chaque push

### Heroku (Backend)

1. **Préparer l'application** :
   ```bash
   cd backend
   heroku create dyad-web-api
   ```

2. **Configurer les variables** :
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://votre-frontend.vercel.app
   ```

3. **Déployer** :
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform

1. **Créer l'application** :
   - Allez sur [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Créez une nouvelle app
   - Connectez votre repository

2. **Configurer les services** :
   - **Frontend** : Build command `npm run build`, Run command `npm start`
   - **Backend** : Build command `npm run build`, Run command `npm start`
   - **Database** : PostgreSQL addon

3. **Variables d'environnement** :
   ```env
   NODE_ENV=production
   DATABASE_URL=$db.CONNECTIONSTRING
   JWT_SECRET=your-secret
   ```

## 🗄️ Base de Données

### PostgreSQL (Recommandé)

```bash
# Avec Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=dyad_web \
  -e POSTGRES_USER=dyad_user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine

# Migrations
cd backend
npm run db:push
```

### Supabase (Cloud)

1. Créez un projet sur [Supabase](https://supabase.com)
2. Récupérez l'URL de connexion
3. Configurez `DATABASE_URL` dans vos variables d'environnement

### Neon (Cloud)

1. Créez un projet sur [Neon](https://neon.tech)
2. Récupérez l'URL de connexion
3. Configurez `DATABASE_URL` dans vos variables d'environnement

## 🔒 Sécurité

### Variables d'Environnement

- **JWT_SECRET** : Utilisez une clé forte (32+ caractères)
- **POSTGRES_PASSWORD** : Mot de passe complexe
- **API Keys** : Gardez vos clés API secrètes

### HTTPS

- Configurez des certificats SSL valides
- Redirigez HTTP vers HTTPS
- Utilisez HSTS headers

### Firewall

```bash
# Ouvrir uniquement les ports nécessaires
ufw allow 80
ufw allow 443
ufw allow 22  # SSH
```

## 📊 Monitoring

### Logs

```bash
# Docker
docker-compose -f docker-compose.prod.yml logs -f

# Système
journalctl -u dyad-web -f
```

### Métriques

- **Uptime** : UptimeRobot, Pingdom
- **Performance** : New Relic, DataDog
- **Erreurs** : Sentry, LogRocket

### Sauvegarde

```bash
# Base de données
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dyad_user dyad_web > backup.sql

# Fichiers
tar -czf uploads-backup.tar.gz backend/uploads/
```

## 🚨 Dépannage

### Problèmes Courants

1. **Service non accessible** :
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs service-name
   ```

2. **Base de données** :
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres psql -U dyad_user -d dyad_web
   ```

3. **Certificats SSL** :
   ```bash
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   ```

### Commandes Utiles

```bash
# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart service-name

# Mettre à jour
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Nettoyer
docker system prune -a
```

## 📈 Optimisation

### Performance

- **CDN** : Cloudflare, AWS CloudFront
- **Cache** : Redis pour les sessions
- **Compression** : Gzip/Brotli activé
- **Images** : Optimisation et WebP

### Scalabilité

- **Load Balancer** : Nginx, HAProxy
- **Horizontal Scaling** : Plusieurs instances backend
- **Database** : Read replicas, connection pooling

## 🆘 Support

- **Documentation** : [GitHub Wiki](https://github.com/votre-repo/wiki)
- **Issues** : [GitHub Issues](https://github.com/votre-repo/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-repo/discussions)

---

🎉 **Félicitations !** Votre application Dyad Web est maintenant déployée en production !
