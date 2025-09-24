# 🧪 Guide de Tests E2E - AI App Builder

Ce guide explique comment configurer et utiliser le système de tests automatisés qui simule un humain interagissant avec votre AI App Builder.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Services Externes](#services-externes)
- [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

Le système de tests E2E simule un humain qui :
- Ouvre l'application
- Clique dans l'éditeur de prompts
- Tape ou colle un prompt
- Attend la génération/réponse
- Vérifie que l'éditeur s'active
- Contrôle que la sortie attendue apparaît

### Stack Technologique

- **Playwright** : Tests E2E avec simulation humaine
- **LangSmith** : Évaluation et tracing des réponses LLM
- **Percy** : Tests visuels et comparaisons
- **BrowserStack** : Tests cross-device
- **GitHub Actions** : CI/CD automatisé

## 🚀 Installation

### 1. Installer les dépendances

```bash
# Installer les dépendances principales
npm install

# Installer les dépendances de test
cd packages/ci
npm install

# Installer les navigateurs Playwright
npx playwright install --with-deps
```

### 2. Structure des fichiers

```
packages/ci/
├── playwright.config.ts          # Configuration Playwright
├── tests/
│   ├── e2e/
│   │   ├── prompt-editor.spec.ts # Tests principaux
│   │   └── prompt-eval.js        # Évaluation LangSmith
│   ├── utils/
│   │   ├── langsmith-evaluator.ts
│   │   └── visual-snapshot.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
└── package.json

.github/workflows/
└── ai_ui_test.yml                # Workflow GitHub Actions
```

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` dans `packages/ci/` :

```env
# Application
BASE_URL=http://localhost:3000
HEADLESS=false

# LangSmith
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=ai-app-builder-evals

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Percy (optionnel)
PERCY_TOKEN=your_percy_token
PERCY_PROJECT=ai-app-builder

# BrowserStack (optionnel)
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key

# Applitools (optionnel)
APPLITOOLS_API_KEY=your_applitools_api_key
```

### 2. Sélecteurs de l'application

Modifiez les sélecteurs dans `tests/e2e/prompt-editor.spec.ts` selon votre application :

```typescript
// Sélecteurs par défaut (à adapter)
'[data-testid="app-container"]'     // Conteneur principal
'[data-testid="new-app-button"]'    // Bouton nouvelle app
'[data-testid="prompt-editor"]'     // Éditeur de prompts
'[data-testid="generate-button"]'   // Bouton génération
'[data-testid="code-editor"]'       // Éditeur de code
'[data-testid="generation-status"]' // Statut de génération
```

### 3. Configuration Playwright

Le fichier `playwright.config.ts` est pré-configuré pour :
- Tests sur Chrome, Firefox, Safari
- Tests sur mobile (iPhone, Pixel)
- Capture de traces, vidéos, screenshots
- Intégration avec les services externes

## 🎮 Utilisation

### 1. Tests locaux

```bash
# Tests complets
cd packages/ci
npm run test:e2e

# Tests spécifiques
npx playwright test --grep="prompt-editor"

# Tests avec interface graphique
npx playwright test --ui

# Tests sur un navigateur spécifique
npx playwright test --project=chromium
```

### 2. Tests en mode debug

```bash
# Mode debug avec interface
npx playwright test --debug

# Mode debug avec console
npx playwright test --headed --debug
```

### 3. Tests de performance

```bash
# Tests de performance
npx playwright test --grep="performance"

# Tests avec métriques
npx playwright test --grep="performance" --reporter=html
```

### 4. Tests visuels

```bash
# Tests visuels avec Percy
npx playwright test --grep="visual"

# Tests avec Applitools
npx playwright test --grep="visual" --reporter=applitools
```

## 🔧 Services Externes

### LangSmith

1. **Créer un compte** : [smith.langchain.com](https://smith.langchain.com)
2. **Obtenir la clé API** : Settings → API Keys
3. **Configurer le projet** : Créer un projet "ai-app-builder-evals"
4. **Ajouter la clé** : `LANGSMITH_API_KEY` dans les secrets GitHub

**Fonctionnalités** :
- Évaluation automatique des réponses LLM
- Scoring de qualité du code généré
- Tracing des interactions
- Métriques de performance

### Percy

1. **Créer un compte** : [percy.io](https://percy.io)
2. **Obtenir le token** : Settings → Project Settings
3. **Configurer le projet** : Créer un projet "ai-app-builder"
4. **Ajouter le token** : `PERCY_TOKEN` dans les secrets GitHub

**Fonctionnalités** :
- Tests visuels automatiques
- Comparaison de snapshots
- Détection de régressions visuelles
- Rapports visuels détaillés

### BrowserStack

1. **Créer un compte** : [browserstack.com](https://browserstack.com)
2. **Obtenir les credentials** : Account → Settings
3. **Configurer l'accès** : Automate → Access Key
4. **Ajouter les credentials** : `BROWSERSTACK_USERNAME` et `BROWSERSTACK_ACCESS_KEY`

**Fonctionnalités** :
- Tests sur de vrais appareils
- Tests cross-browser
- Tests sur différentes résolutions
- Tests de performance mobile

## 📊 Rapports et Résultats

### 1. Rapports locaux

```bash
# Ouvrir le rapport HTML
npx playwright show-report

# Consulter les résultats
open test-results/final-report.html
```

### 2. Artefacts générés

- **Screenshots** : `test-results/screenshots/`
- **Vidéos** : `test-results/videos/`
- **Traces** : `test-results/traces/`
- **Rapports** : `test-results/reports/`

### 3. Métriques d'évaluation

Le système évalue automatiquement :
- **Qualité du code** (0-1)
- **Complétude** (0-1)
- **Bonnes pratiques** (0-1)
- **Usage TypeScript** (0-1)
- **Patterns React** (0-1)
- **Sécurité** (0-1)
- **Performance** (0-1)
- **Accessibilité** (0-1)
- **Tests** (0-1)

## 🚨 Dépannage

### Problèmes courants

#### 1. Application non accessible

```bash
# Vérifier que l'application est démarrée
curl http://localhost:3000

# Vérifier les logs
npm run dev
```

#### 2. Sélecteurs non trouvés

```bash
# Inspecter les sélecteurs
npx playwright test --debug

# Utiliser le mode headed
npx playwright test --headed
```

#### 3. Tests lents

```bash
# Réduire le nombre de workers
npx playwright test --workers=1

# Désactiver les captures
npx playwright test --video=off --screenshot=off
```

#### 4. Erreurs LangSmith

```bash
# Vérifier la clé API
echo $LANGSMITH_API_KEY

# Tester la connexion
curl -H "Authorization: Bearer $LANGSMITH_API_KEY" \
     https://api.smith.langchain.com/projects
```

### Logs et debugging

```bash
# Activer les logs détaillés
DEBUG=pw:api npx playwright test

# Capturer les traces
npx playwright test --trace=on

# Mode debug interactif
npx playwright test --debug
```

## 📈 Amélioration continue

### 1. Ajouter de nouveaux tests

```typescript
// Dans prompt-editor.spec.ts
test('Nouveau scénario de test', async ({ page }) => {
  // Votre test ici
});
```

### 2. Personnaliser les évaluations

```typescript
// Dans langsmith-evaluator.ts
async evaluateCustom(params: {
  prompt: string;
  response: string;
  customCriteria: string[];
}) {
  // Votre logique d'évaluation
}
```

### 3. Ajouter des métriques

```typescript
// Dans visual-snapshot.ts
async captureWithMetrics(name: string) {
  // Capturer avec métriques personnalisées
}
```

## 🤝 Contribution

1. **Fork** le repository
2. **Créer** une branche feature
3. **Ajouter** vos tests
4. **Vérifier** que tous les tests passent
5. **Soumettre** une pull request

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation** : [Wiki](https://github.com/your-repo/wiki)
- **Discussions** : [GitHub Discussions](https://github.com/your-repo/discussions)

---

**🎉 Félicitations !** Votre système de tests E2E est maintenant configuré et prêt à simuler un humain interagissant avec votre AI App Builder.
