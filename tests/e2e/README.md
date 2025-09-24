# Tests E2E pour l'AI App Builder

Ce dossier contient tous les tests End-to-End (E2E) pour l'AI App Builder, utilisant Playwright pour simuler l'interaction humaine avec l'application.

## Structure des tests

### Tests principaux

- **`prompt-editor.spec.ts`** - Test du flux principal : prompt → génération → éditeur → preview
- **`visual-regression.spec.ts`** - Tests de régression visuelle avec snapshots
- **`cross-browser.spec.ts`** - Tests de compatibilité cross-browser
- **`performance.spec.ts`** - Tests de performance et temps de réponse
- **`accessibility.spec.ts`** - Tests d'accessibilité (WCAG, navigation clavier, etc.)
- **`security.spec.ts`** - Tests de sécurité (XSS, injection SQL, etc.)
- **`integration.spec.ts`** - Tests d'intégration complets
- **`ai-test-generation.spec.ts`** - Tests de génération automatique de cas de tests avec l'IA

### Utilitaires

- **`../utils/langsmith-evaluator.ts`** - Évaluation des réponses LLM via LangSmith
- **`../utils/visual-snapshot.ts`** - Capture et comparaison de snapshots visuels
- **`../utils/ai-test-generator.ts`** - Génération automatique de tests avec l'IA

## Configuration

### Variables d'environnement requises

```bash
# LangSmith pour l'évaluation des réponses LLM
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="Dyad Web E2E Tests"

# OpenAI pour la génération de tests
OPENAI_API_KEY=your_openai_api_key

# Percy pour les snapshots visuels (optionnel)
PERCY_TOKEN=your_percy_token

# BrowserStack pour les tests cross-browser (optionnel)
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
```

### Sélecteurs de test

Les tests utilisent des sélecteurs `data-testid` pour identifier les éléments. Assurez-vous que votre application inclut ces attributs :

```html
<!-- Exemples de sélecteurs utilisés -->
<button data-testid="new-app-button">Nouvelle Application</button>
<input data-testid="app-name-input" />
<div data-testid="app-editor">...</div>
<textarea data-testid="prompt-editor">...</textarea>
<button data-testid="generate-button">Générer</button>
<div data-testid="code-editor">...</div>
<div data-testid="preview-panel">...</div>
```

## Exécution des tests

### Localement

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install

# Exécuter tous les tests
npx playwright test

# Exécuter un test spécifique
npx playwright test prompt-editor.spec.ts

# Exécuter en mode headed (avec interface graphique)
npx playwright test --headed

# Exécuter sur un navigateur spécifique
npx playwright test --project=chromium
```

### En CI/CD

Les tests sont automatiquement exécutés via GitHub Actions (voir `.github/workflows/ai_ui_test.yml`).

## Types de tests

### 1. Tests de flux principal

Testent le workflow complet de l'utilisateur :
- Ouverture de l'application
- Création d'une nouvelle application
- Saisie d'un prompt
- Génération de code
- Affichage de la preview
- Modification du code
- Sauvegarde

### 2. Tests de régression visuelle

Capturent des snapshots de l'interface et les comparent avec les versions précédentes pour détecter les changements visuels non désirés.

### 3. Tests cross-browser

Vérifient que l'application fonctionne correctement sur :
- Chrome
- Firefox
- Safari
- Différentes tailles d'écran (mobile, tablette, desktop)

### 4. Tests de performance

Mesurent :
- Temps de chargement des pages
- Temps de génération de code
- Temps de sauvegarde
- Temps de réponse du chat
- Temps de rendu des composants

### 5. Tests d'accessibilité

Vérifient la conformité WCAG :
- Navigation au clavier
- Contraste des couleurs
- Labels et descriptions
- Focus visible
- Structure sémantique
- Support des lecteurs d'écran

### 6. Tests de sécurité

Protection contre :
- XSS (Cross-Site Scripting)
- Injection SQL
- Attaques CSRF
- Attaques de force brute
- Clickjacking
- Attaques de timing

### 7. Tests d'intégration

Testent les flux complets :
- Création d'application
- Chat avec l'IA
- Gestion des fichiers
- Paramètres utilisateur
- Export/Import
- Collaboration en temps réel

### 8. Tests de génération automatique

Utilisent l'IA pour :
- Générer des cas de test supplémentaires
- Créer des tests en français
- Générer des tests de régression
- Évaluer la qualité des tests

## Évaluation des réponses LLM

Les tests utilisent LangSmith pour évaluer qualitativement les réponses de l'IA :

```typescript
const evaluation = await evaluateLLMResponse(prompt, response);
expect(evaluation.score).toBeGreaterThan(0.7);
expect(evaluation.pass).toBe(true);
```

## Snapshots visuels

Les tests capturent des snapshots de l'interface pour détecter les régressions visuelles :

```typescript
await takeVisualSnapshot(page, 'homepage');
await takeVisualSnapshot(page, 'app-editor');
```

## Génération automatique de tests

Les tests peuvent générer automatiquement de nouveaux cas de test :

```typescript
const testCases = await generateTestCasesWithAI();
for (const testCase of testCases) {
  await executeGeneratedTest(page, testCase);
}
```

## Débogage

### Mode debug

```bash
# Exécuter en mode debug
npx playwright test --debug

# Exécuter avec des traces
npx playwright test --trace on
```

### Logs et rapports

- Les rapports HTML sont générés dans `playwright-report/`
- Les traces sont sauvegardées dans `test-results/`
- Les snapshots sont comparés avec `test-results/`

## Maintenance

### Mise à jour des sélecteurs

Si l'interface change, mettez à jour les sélecteurs `data-testid` dans les tests.

### Ajout de nouveaux tests

1. Créez un nouveau fichier `.spec.ts`
2. Utilisez les sélecteurs `data-testid` existants
3. Ajoutez des assertions appropriées
4. Documentez le test dans ce README

### Gestion des flaky tests

- Utilisez `waitForSelector` avec des timeouts appropriés
- Évitez les délais fixes (`setTimeout`)
- Utilisez des sélecteurs robustes
- Testez sur différents environnements

## Intégration avec les services externes

### LangSmith

Pour l'évaluation des réponses LLM :
1. Créez un compte sur [LangSmith](https://smith.langchain.com/)
2. Obtenez votre API key
3. Configurez le projet dans LangSmith
4. Ajoutez la variable d'environnement `LANGCHAIN_API_KEY`

### Percy

Pour les snapshots visuels :
1. Créez un compte sur [Percy](https://percy.io/)
2. Obtenez votre token
3. Ajoutez la variable d'environnement `PERCY_TOKEN`

### BrowserStack

Pour les tests cross-browser :
1. Créez un compte sur [BrowserStack](https://www.browserstack.com/)
2. Obtenez vos credentials
3. Ajoutez les variables d'environnement `BROWSERSTACK_USERNAME` et `BROWSERSTACK_ACCESS_KEY`

## Support

Pour toute question ou problème avec les tests E2E :

1. Vérifiez que tous les sélecteurs `data-testid` sont présents dans votre application
2. Assurez-vous que les variables d'environnement sont configurées
3. Consultez les logs dans `playwright-report/`
4. Utilisez le mode debug pour identifier les problèmes
