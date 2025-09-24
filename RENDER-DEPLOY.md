# 🚀 Déploiement de Dyad sur Render

Ce guide vous explique comment déployer l'application Dyad sur Render.

## 📋 Prérequis

- Un compte Render
- Un repository GitHub avec le code de Dyad
- Node.js 18+ installé localement

## 🔧 Configuration

### 1. Variables d'environnement

Configurez ces variables dans Render (Environment Variables) :

```bash
# Configuration de l'application
VITE_APP_NAME=Dyad
VITE_APP_VERSION=0.20.0-beta.1
VITE_APP_DESCRIPTION=Constructeur d'applications IA

# URLs de l'API (remplacez par vos URLs)
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com

# Configuration des modèles IA
VITE_DEFAULT_MODEL=gpt-4
VITE_FALLBACK_MODEL=gpt-3.5-turbo

# Configuration des intégrations
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_VERCEL_CLIENT_ID=your_vercel_client_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optionnel)
VITE_POSTHOG_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com

# Mode de production
VITE_DEV_MODE=false
VITE_DEBUG=false

# Configuration Render
NODE_ENV=production
PORT=3000
```

### 2. Configuration du build

Le fichier `render.yaml` est déjà configuré avec :
- Commande de build : `npm install && npm run build`
- Commande de démarrage : `npx serve -s dist -l 3000`
- Variables d'environnement par défaut
- Déploiement automatique

## 🚀 Déploiement

### Option 1 : Déploiement automatique (Recommandé)

1. **Connectez votre repository GitHub à Render :**
   - Allez sur [render.com](https://render.com)
   - Cliquez sur "New +" > "Web Service"
   - Sélectionnez votre repository GitHub
   - Render détectera automatiquement la configuration

2. **Configurez le service :**
   - **Name** : `dyad-app`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npx serve -s dist -l 3000`
   - **Plan** : `Free` (ou `Starter` pour plus de ressources)

3. **Configurez les variables d'environnement :**
   - Allez dans Environment Variables
   - Ajoutez toutes les variables listées ci-dessus

4. **Déployez :**
   - Cliquez sur "Create Web Service"
   - Render déploiera automatiquement
   - Vous recevrez une URL unique

### Option 2 : Déploiement manuel

1. **Build local :**
   ```bash
   npm install
   npm run build
   ```

2. **Déployez avec la CLI Render :**
   ```bash
   npx render-cli deploy
   ```

## 🔧 Configuration avancée

### Plan gratuit vs payant

**Plan gratuit :**
- 750 heures/mois
- Redémarrage automatique après 15 minutes d'inactivité
- Domaine `.onrender.com`

**Plan Starter ($7/mois) :**
- 24/7 uptime
- Domaine personnalisé
- Plus de ressources

### Variables d'environnement

Les variables d'environnement sont configurées dans :
- **render.yaml** : Variables par défaut
- **Dashboard Render** : Variables personnalisées

### Déploiement automatique

Le déploiement automatique est activé par défaut :
- Déploiement à chaque push sur la branche principale
- Build automatique
- Redémarrage automatique

## 🐛 Dépannage

### Erreurs de build

1. **Vérifiez les variables d'environnement :**
   - Assurez-vous que toutes les variables requises sont configurées
   - Vérifiez que les URLs sont correctes

2. **Vérifiez les dépendances :**
   - Assurez-vous que `package.json` contient toutes les dépendances nécessaires
   - Vérifiez que la version de Node.js est compatible

### Erreurs de runtime

1. **Vérifiez les URLs d'API :**
   - Assurez-vous que votre backend est déployé et accessible
   - Vérifiez que les URLs CORS sont configurées

2. **Vérifiez les intégrations :**
   - Assurez-vous que les clés API sont valides
   - Vérifiez que les URLs de redirection sont configurées

## 📊 Monitoring

### Logs

Accédez aux logs de déploiement dans Render :
- Dashboard > Votre service > Logs
- Logs en temps réel
- Historique des déploiements

### Métriques

Render fournit des métriques de base :
- CPU usage
- Memory usage
- Response time
- Request count

## 🎉 Félicitations !

Votre application Dyad est maintenant déployée sur Render ! 

- **URL de production :** `https://dyad-app.onrender.com`
- **Déploiements automatiques :** À chaque push sur la branche principale
- **Monitoring :** Disponible dans le dashboard

## 🔗 Liens utiles

- [Documentation Render](https://render.com/docs)
- [Guide des variables d'environnement](https://render.com/docs/environment-variables)
- [Support Render](https://render.com/support)

## 📝 Prochaines étapes

1. **Configurez votre backend** (si nécessaire)
2. **Ajoutez vos clés API** dans les variables d'environnement
3. **Testez toutes les fonctionnalités** sur l'URL de production
4. **Configurez un domaine personnalisé** (optionnel)
5. **Activez les analytics** (optionnel)

Votre application Dyad est maintenant prête pour le monde ! 🌍
