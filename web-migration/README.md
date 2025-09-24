# Dyad Web - Constructeur d'Applications IA

Version web de Dyad, un constructeur d'applications IA local et open-source, converti depuis Electron vers une application web pure.

## 🚀 Fonctionnalités

- **Interface Web Moderne** : React + TypeScript + Tailwind CSS
- **Backend API** : Node.js + Express + WebSocket
- **Base de Données** : PostgreSQL avec Drizzle ORM
- **Système de Fichiers Virtuel** : Stockage des projets dans la base de données
- **Streaming IA** : WebSocket pour les réponses en temps réel
- **Authentification** : JWT avec sessions sécurisées
- **Déploiement** : Docker + Docker Compose

## 📁 Structure du Projet

```
web-migration/
├── backend/                 # API Backend Node.js
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services métier
│   │   ├── database/       # Schémas et migrations
│   │   ├── middleware/     # Middleware Express
│   │   └── websocket/      # Gestion WebSocket
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── lib/            # Utilitaires et API
│   │   └── atoms/          # État global Jotai
│   └── package.json
├── docker-compose.yml      # Configuration Docker
└── README.md
```

## 🛠️ Installation et Démarrage

### Prérequis

- Node.js 18+
- Docker et Docker Compose
- Git

### Démarrage Rapide avec Docker

```bash
# Cloner le projet
git clone <votre-repo>
cd web-migration

# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Base de données** : localhost:5432

### Développement Local

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Variables d'Environnement

#### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://dyad_user:dyad_password@localhost:5432/dyad_web
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## 📊 Base de Données

### Schéma Principal

- **users** : Utilisateurs de l'application
- **apps** : Applications créées par les utilisateurs
- **chats** : Conversations avec l'IA
- **messages** : Messages dans les conversations
- **virtual_files** : Fichiers des applications (stockage virtuel)
- **templates** : Templates d'applications
- **user_settings** : Paramètres utilisateur

### Migrations

```bash
cd backend
npm run db:generate  # Générer les migrations
npm run db:push      # Appliquer les migrations
npm run db:studio    # Interface d'administration
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

### Applications
- `GET /api/apps` - Lister les applications
- `POST /api/apps` - Créer une application
- `GET /api/apps/:id` - Obtenir une application
- `PUT /api/apps/:id` - Modifier une application
- `DELETE /api/apps/:id` - Supprimer une application

### Fichiers
- `GET /api/apps/:id/files` - Lister les fichiers
- `GET /api/files/:appId/read` - Lire un fichier
- `POST /api/files/:appId/write` - Écrire un fichier
- `DELETE /api/files/:appId/delete` - Supprimer un fichier
- `POST /api/files/:appId/rename` - Renommer un fichier

### Chat
- `GET /api/chat/:appId/chats` - Lister les conversations
- `POST /api/chat/:appId/chats` - Créer une conversation
- `POST /api/chat/:chatId/messages` - Envoyer un message

## 🌐 WebSocket

Le WebSocket est utilisé pour le streaming des réponses IA en temps réel :

```javascript
const ws = new WebSocket('ws://localhost:3001/ws?chatId=123&token=jwt-token');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Traiter le message streaming
};
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose logs -f

# Arrêt
docker-compose down
```

### Déploiement Cloud

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### Railway/Heroku (Backend)
```bash
cd backend
# Configurer les variables d'environnement
# Déployer avec Railway/Heroku CLI
```

## 🔒 Sécurité

- **JWT** : Authentification sécurisée
- **CORS** : Configuration appropriée
- **Helmet** : Headers de sécurité
- **Validation** : Zod pour la validation des données
- **Rate Limiting** : Protection contre les abus

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Migration depuis Electron

### Changements Principaux

1. **IPC → API REST** : Les handlers IPC sont remplacés par des routes Express
2. **Fichiers Locaux → Base de Données** : Le système de fichiers est virtualisé
3. **Processus Principal → Backend** : Le backend Node.js remplace le processus principal
4. **WebSocket** : Streaming des réponses IA via WebSocket
5. **Authentification** : Système d'authentification JWT ajouté

### Compatibilité

- **Frontend** : 95% du code React reste identique
- **Logique Métier** : Adaptée pour le web
- **Base de Données** : Schéma similaire avec adaptations web

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/votre-repo/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-repo/discussions)
- **Documentation** : [Wiki](https://github.com/votre-repo/wiki)

## 🎯 Roadmap

- [ ] Support des templates communautaires
- [ ] Intégration GitHub/GitLab
- [ ] Déploiement automatique
- [ ] Collaboration en temps réel
- [ ] Plugins et extensions
- [ ] Mobile app (React Native)
