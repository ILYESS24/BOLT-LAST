# 🚀 Guide de Déploiement Dyad sur Netlify

## ✅ **PRÉPARATION TERMINÉE**

Votre application Dyad est maintenant prête pour le déploiement sur Netlify ! Voici ce qui a été configuré :

### **📁 Fichiers créés :**
- ✅ `netlify.toml` - Configuration Netlify
- ✅ `vite.config.ts` - Configuration Vite pour le build
- ✅ `index.html` - Point d'entrée HTML
- ✅ `src/main.tsx` - Point d'entrée React
- ✅ `src/index.css` - Styles CSS
- ✅ `tailwind.config.js` - Configuration Tailwind
- ✅ `deploy-netlify.sh` - Script de déploiement
- ✅ `netlify/functions/hello.js` - Exemple de fonction serverless
- ✅ `NETLIFY-DEPLOY.md` - Documentation complète

### **🔧 Scripts ajoutés :**
- ✅ `npm run build` - Build de production
- ✅ `npm run start:web` - Serveur de développement

## 🚀 **DÉPLOIEMENT SUR NETLIFY**

### **Option 1 : Déploiement automatique (Recommandé)**

1. **Connectez votre repository GitHub :**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "New site from Git"
   - Sélectionnez votre repository GitHub
   - Netlify détectera automatiquement la configuration

2. **Configurez les variables d'environnement :**
   ```bash
   # Dans Netlify > Site settings > Environment variables
   VITE_APP_NAME=Dyad
   VITE_APP_VERSION=0.20.0-beta.1
   VITE_APP_DESCRIPTION=Constructeur d'applications IA
   VITE_API_URL=https://your-backend.netlify.app
   VITE_WS_URL=wss://your-backend.netlify.app
   VITE_DEFAULT_MODEL=gpt-4
   VITE_FALLBACK_MODEL=gpt-3.5-turbo
   ```

3. **Déployez :**
   - Netlify déploiera automatiquement
   - Vous recevrez une URL unique

### **Option 2 : Déploiement manuel**

1. **Build local :**
   ```bash
   npm install
   npm run build
   ```

2. **Déployez avec la CLI :**
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

## 🔧 **CONFIGURATION AVANCÉE**

### **Variables d'environnement requises :**

```bash
# Configuration de base
VITE_APP_NAME=Dyad
VITE_APP_VERSION=0.20.0-beta.1
VITE_APP_DESCRIPTION=Constructeur d'applications IA

# URLs de l'API (remplacez par vos URLs)
VITE_API_URL=https://your-backend.netlify.app
VITE_WS_URL=wss://your-backend.netlify.app

# Modèles IA
VITE_DEFAULT_MODEL=gpt-4
VITE_FALLBACK_MODEL=gpt-3.5-turbo

# Intégrations (optionnel)
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

### **Fonctions serverless :**

Le dossier `netlify/functions/` contient des exemples que vous pouvez utiliser pour :
- API endpoints
- Webhooks
- Traitement de données

## 📊 **MONITORING ET ANALYTICS**

### **PostHog (optionnel) :**
1. Créez un compte [PostHog](https://posthog.com)
2. Ajoutez les variables d'environnement
3. Les analytics seront automatiquement activés

### **Logs Netlify :**
- Accédez aux logs dans Site settings > Deploys
- Cliquez sur un déploiement pour voir les détails

## 🐛 **DÉPANNAGE**

### **Erreurs de build :**
1. Vérifiez que toutes les variables d'environnement sont configurées
2. Assurez-vous que les URLs d'API sont correctes
3. Vérifiez que les dépendances sont installées

### **Erreurs de runtime :**
1. Vérifiez que votre backend est déployé et accessible
2. Assurez-vous que les URLs CORS sont configurées
3. Vérifiez que les clés API sont valides

## 🎉 **FÉLICITATIONS !**

Votre application Dyad est maintenant déployée sur Netlify !

- **URL de production :** `https://your-site-name.netlify.app`
- **Déploiements automatiques :** À chaque push sur la branche principale
- **Fonctions serverless :** Disponibles via `/.netlify/functions/`

## 🔗 **LIENS UTILES**

- [Documentation Netlify](https://docs.netlify.com/)
- [Guide des fonctions serverless](https://docs.netlify.com/functions/overview/)
- [Configuration des variables d'environnement](https://docs.netlify.com/environment-variables/overview/)
- [Support Netlify](https://docs.netlify.com/support/)

## 📝 **PROCHAINES ÉTAPES**

1. **Configurez votre backend** (si nécessaire)
2. **Ajoutez vos clés API** dans les variables d'environnement
3. **Testez toutes les fonctionnalités** sur l'URL de production
4. **Configurez un domaine personnalisé** (optionnel)
5. **Activez les analytics** (optionnel)

Votre application Dyad est maintenant prête pour le monde ! 🌍
