# 🚀 Guide de Déploiement Render Static Site

## ❌ **PROBLÈME ACTUEL**

Render essaie d'exécuter le fichier Electron au lieu de servir l'application web statique.

## ✅ **SOLUTION : RENDER STATIC SITE**

### **Étape 1 : Supprimer le service actuel**
1. Allez sur [render.com](https://render.com)
2. Trouvez votre service `dyad-app`
3. Cliquez sur "Delete" pour le supprimer

### **Étape 2 : Créer un nouveau Static Site**
1. Cliquez sur "New +"
2. Sélectionnez **"Static Site"** (pas Web Service)
3. Connectez votre repository GitHub : `ILYESS24/BOLT-LAST`

### **Étape 3 : Configuration du Static Site**
```
Name: dyad-static
Branch: main
Root Directory: . (laisser vide)
Build Command: npm install && npm run build
Publish Directory: dist
```

### **Étape 4 : Variables d'environnement**
Ajoutez ces variables dans "Environment Variables" :
```
NODE_ENV=production
VITE_APP_NAME=Dyad
VITE_APP_VERSION=0.20.0-beta.1
VITE_APP_DESCRIPTION=Constructeur d'applications IA
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### **Étape 5 : Déploiement**
1. Cliquez sur "Create Static Site"
2. Attendez que le build se termine
3. Votre application sera accessible sur `https://dyad-static.onrender.com`

## 🔧 **DIFFÉRENCES IMPORTANTES**

### **Web Service vs Static Site**
- **Web Service** : Exécute du code Node.js (pour les APIs)
- **Static Site** : Sert des fichiers statiques (HTML, CSS, JS)

### **Pourquoi Static Site ?**
- ✅ Plus rapide
- ✅ Plus fiable
- ✅ Moins cher (gratuit)
- ✅ Parfait pour les applications React/Vue/Angular

## 📊 **RÉSULTAT ATTENDU**

Après le déploiement :
- **URL** : `https://dyad-static.onrender.com`
- **Type** : Site statique
- **Performance** : Optimisée
- **Coût** : Gratuit

## 🐛 **DÉPANNAGE**

### **Si le build échoue :**
1. Vérifiez que `npm run build` fonctionne localement
2. Vérifiez les variables d'environnement
3. Vérifiez que le répertoire `dist` est créé

### **Si le site ne se charge pas :**
1. Vérifiez que `dist/index.html` existe
2. Vérifiez que le Publish Directory est `dist`
3. Vérifiez les logs de déploiement

## 🎉 **FÉLICITATIONS !**

Une fois déployé, votre application Dyad sera accessible au monde entier !

### **Liens utiles :**
- [Documentation Render Static Sites](https://render.com/docs/static-sites)
- [Guide de dépannage](https://render.com/docs/troubleshooting-deploys)
- [Variables d'environnement](https://render.com/docs/environment-variables)
