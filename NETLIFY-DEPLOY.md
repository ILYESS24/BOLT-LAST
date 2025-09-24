# 🚀 Déploiement de Dyad sur Netlify

Ce guide vous explique comment déployer l'application Dyad sur Netlify.

## 📋 Prérequis

- Un compte Netlify
- Un repository GitHub avec le code de Dyad
- Node.js 18+ installé localement

## 🔧 Configuration

### 1. Variables d'environnement

Configurez ces variables dans Netlify (Site settings > Environment variables) :

```bash
# Configuration de l'application
VITE_APP_NAME=Dyad
VITE_APP_VERSION=0.20.0-beta.1
VITE_APP_DESCRIPTION=Constructeur d'applications IA

# URLs de l'API (remplacez par vos URLs)
VITE_API_URL=https://your-backend.netlify.app
VITE_WS_URL=wss://your-backend.netlify.app

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

# Mode de développement
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### 2. Configuration du build

Le fichier `netlify.toml` est déjà configuré avec :
- Commande de build : `npm run build`
- Répertoire de publication : `dist`
- Redirections SPA
- Headers de sécurité
- Cache optimisé

## 🚀 Déploiement

### Option 1 : Déploiement automatique (Recommandé)

1. **Connectez votre repository GitHub à Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "New site from Git"
   - Sélectionnez votre repository GitHub
   - Configurez les paramètres de build (déjà configurés dans `netlify.toml`)

2. **Configurez les variables d'environnement :**
   - Allez dans Site settings > Environment variables
   - Ajoutez toutes les variables listées ci-dessus

3. **Déployez :**
   - Netlify déploiera automatiquement à chaque push sur votre branche principale
   - Vous recevrez une URL unique pour votre site

### Option 2 : Déploiement manuel

1. **Build local :**
   ```bash
   npm install
   npm run build
   ```

2. **Déployez avec la CLI Netlify :**
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

## 🔧 Configuration avancée

### Fonctions serverless

Le dossier `netlify/functions/` contient des exemples de fonctions serverless que vous pouvez utiliser pour :
- API endpoints
- Webhooks
- Traitement de données

### Redirections personnalisées

Modifiez le fichier `netlify.toml` pour ajouter des redirections personnalisées :

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Headers de sécurité

Les headers de sécurité sont déjà configurés dans `netlify.toml` :
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

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

### Analytics

Configurez PostHog pour le monitoring :
1. Créez un compte PostHog
2. Ajoutez `VITE_POSTHOG_KEY` et `VITE_POSTHOG_HOST` dans Netlify
3. Les analytics seront automatiquement activés

### Logs

Accédez aux logs de déploiement dans Netlify :
- Site settings > Deploys
- Cliquez sur un déploiement pour voir les logs détaillés

## 🎉 Félicitations !

Votre application Dyad est maintenant déployée sur Netlify ! 

- **URL de production :** `https://your-site-name.netlify.app`
- **Déploiements automatiques :** À chaque push sur la branche principale
- **Fonctions serverless :** Disponibles via `/.netlify/functions/`

## 🔗 Liens utiles

- [Documentation Netlify](https://docs.netlify.com/)
- [Guide des fonctions serverless](https://docs.netlify.com/functions/overview/)
- [Configuration des variables d'environnement](https://docs.netlify.com/environment-variables/overview/)
