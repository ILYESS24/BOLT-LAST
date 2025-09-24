# Configuration du Pipeline CI/CD

Ce document explique comment configurer et utiliser le pipeline CI/CD complet pour le projet Dyad.

## 🚀 Fonctionnalités du Pipeline

### 1. **GitHub Actions** (`.github/workflows/ci.yml`)
- ✅ Installation automatique des dépendances
- ✅ Tests unitaires avec couverture de code
- ✅ Tests génératifs avec fast-check
- ✅ Tests E2E avec Playwright
- ✅ Analyse statique et de sécurité
- ✅ Build cross-platform (Linux, Windows, macOS)

### 2. **SonarCloud** (`sonar-project.properties`)
- ✅ Analyse de la qualité du code
- ✅ Détection des bugs et vulnérabilités
- ✅ Métriques de complexité et duplications
- ✅ Rapports de couverture de code

### 3. **CodeQL** (`.github/codeql/codeql-config.yml`)
- ✅ Analyse de sécurité par GitHub
- ✅ Détection des vulnérabilités dans le code
- ✅ Intégration avec GitHub Security

### 4. **Snyk** (`.snyk`)
- ✅ Scan des dépendances pour les vulnérabilités
- ✅ Monitoring continu des packages
- ✅ Rapports de sécurité

### 5. **Tests Génératifs** (`src/__tests__/*.generative.test.ts`)
- ✅ Tests avec fast-check pour TypeScript
- ✅ Génération automatique de cas de test
- ✅ Détection de bugs et edge cases

## 📋 Configuration Requise

### 1. Secrets GitHub
Ajoutez ces secrets dans votre repository GitHub (Settings > Secrets and variables > Actions) :

```bash
# SonarCloud
SONAR_TOKEN=your_sonarcloud_token

# Snyk (optionnel)
SNYK_TOKEN=your_snyk_token
```

### 2. Configuration SonarCloud
1. Créez un compte sur [SonarCloud](https://sonarcloud.io)
2. Importez votre repository GitHub
3. Récupérez votre token d'organisation
4. Ajoutez le token comme secret `SONAR_TOKEN`

### 3. Configuration Snyk (optionnel)
1. Créez un compte sur [Snyk](https://snyk.io)
2. Connectez votre repository GitHub
3. Récupérez votre token API
4. Ajoutez le token comme secret `SNYK_TOKEN`

## 🛠️ Commandes Locales

### Tests
```bash
# Tests unitaires
npm run test

# Tests génératifs
npm run test:generative

# Tests E2E
npm run e2e

# Tous les tests
npm run test && npm run test:generative && npm run e2e
```

### Qualité du Code
```bash
# Linting
npm run lint

# Formatage
npm run prettier:check

# Vérification TypeScript
npm run ts

# Toutes les vérifications
npm run presubmit
```

### Build
```bash
# Build de l'application
npm run package

# Build pour la production
npm run make
```

## 📊 Monitoring et Rapports

### 1. GitHub Actions
- Consultez l'onglet "Actions" de votre repository
- Chaque push/PR déclenche le pipeline complet
- Les artefacts de build sont disponibles pour téléchargement

### 2. SonarCloud
- Dashboard en temps réel de la qualité du code
- Métriques de couverture, bugs, vulnérabilités
- Intégration avec les PR GitHub

### 3. CodeQL
- Onglet "Security" dans votre repository GitHub
- Alertes de sécurité automatiques
- Recommandations de correction

### 4. Snyk
- Dashboard Snyk pour le monitoring des dépendances
- Alertes automatiques pour les nouvelles vulnérabilités
- Rapports de conformité

## 🔧 Personnalisation

### Modifier les Tests Génératifs
Les tests génératifs utilisent fast-check. Pour ajouter de nouveaux tests :

1. Créez un fichier `*.generative.test.ts`
2. Utilisez les générateurs fast-check pour créer des données de test
3. Définissez des propriétés à vérifier avec `fc.assert()`

Exemple :
```typescript
import * as fc from "fast-check";

it("devrait toujours satisfaire une propriété", () => {
  fc.assert(
    fc.property(
      fc.string(), // générateur de données
      (input) => {
        // propriété à vérifier
        expect(myFunction(input)).toBeDefined();
      }
    ),
    { numRuns: 1000 } // nombre de tests
  );
});
```

### Modifier la Configuration SonarCloud
Éditez `sonar-project.properties` pour :
- Changer les exclusions de fichiers
- Ajuster les seuils de qualité
- Configurer des règles personnalisées

### Modifier la Configuration CodeQL
Éditez `.github/codeql/codeql-config.yml` pour :
- Ajouter des requêtes personnalisées
- Modifier les chemins analysés
- Configurer des exclusions

## 🚨 Résolution des Problèmes

### Pipeline en Échec
1. Vérifiez les logs dans GitHub Actions
2. Exécutez les commandes localement pour reproduire
3. Vérifiez que tous les secrets sont configurés

### SonarCloud
- Vérifiez que le token `SONAR_TOKEN` est correct
- Assurez-vous que l'organisation SonarCloud correspond
- Vérifiez les permissions du repository

### Tests Génératifs
- Augmentez le timeout si nécessaire
- Réduisez le nombre de tests (`numRuns`)
- Vérifiez que fast-check est installé

### Snyk
- Vérifiez que le token `SNYK_TOKEN` est valide
- Assurez-vous que le repository est connecté à Snyk

## 📈 Métriques et KPIs

Le pipeline fournit plusieurs métriques importantes :

- **Couverture de code** : Pourcentage de code testé
- **Qualité** : Nombre de bugs, vulnérabilités, code smells
- **Sécurité** : Vulnérabilités détectées par CodeQL et Snyk
- **Performance** : Temps d'exécution des tests et builds
- **Fiabilité** : Taux de succès du pipeline

## 🔄 Maintenance

### Mise à Jour des Dépendances
- Le pipeline détecte automatiquement les vulnérabilités
- Snyk propose des corrections automatiques
- SonarCloud alerte sur les dépendances obsolètes

### Optimisation
- Surveillez les temps d'exécution du pipeline
- Optimisez les tests génératifs si nécessaire
- Ajustez les seuils de qualité selon vos besoins

---

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs GitHub Actions
2. Vérifiez la documentation des outils (SonarCloud, Snyk, CodeQL)
3. Ouvrez une issue dans le repository

Le pipeline est conçu pour être robuste et informatif. Il vous aidera à maintenir un code de haute qualité et sécurisé ! 🎯
