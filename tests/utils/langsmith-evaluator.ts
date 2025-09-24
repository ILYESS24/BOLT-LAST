/**
 * Évaluateur LangSmith pour l'AI App Builder
 * Fournit des évaluations de qualité pour les réponses LLM
 */

interface EvaluationCriteria {
  code_quality: number;
  completeness: number;
  best_practices: number;
  typescript_usage: number;
  react_patterns: number;
  security: number;
  performance: number;
  accessibility: number;
  tests: number;
}

interface EvaluationResult {
  overall_score: number;
  criteria_scores: EvaluationCriteria;
  pass: boolean;
  feedback: string;
  improvements: string[];
  strengths: string[];
  timestamp: string;
}

export class LangSmithEvaluator {
  constructor() {
    // Configuration simplifiée sans dépendances externes
  }

  /**
   * Évaluer la qualité d'une réponse LLM
   */
  async evaluate(params: {
    prompt: string;
    response: string;
    criteria: string[];
  }): Promise<EvaluationResult> {
    try {
      // Évaluation simplifiée basée sur des règles
      const response = params.response;
      let overallScore = 0.5;
      const criteriaScores: EvaluationCriteria = {
        code_quality: 0.5,
        completeness: 0.5,
        best_practices: 0.5,
        typescript_usage: 0.5,
        react_patterns: 0.5,
        security: 0.5,
        performance: 0.5,
        accessibility: 0.5,
        tests: 0.5,
      };

      // Évaluation de la qualité du code
      if (response.includes('function') || response.includes('const')) {
        criteriaScores.code_quality += 0.2;
      }
      if (response.includes('import') && response.includes('from')) {
        criteriaScores.code_quality += 0.1;
      }
      if (response.includes('export')) {
        criteriaScores.code_quality += 0.1;
      }

      // Évaluation de la complétude
      if (response.includes('React')) {
        criteriaScores.completeness += 0.2;
      }
      if (response.includes('useState') || response.includes('useEffect')) {
        criteriaScores.completeness += 0.2;
      }

      // Évaluation des bonnes pratiques
      if (response.includes('//') || response.includes('/*')) {
        criteriaScores.best_practices += 0.2;
      }
      if (response.includes('interface') || response.includes('type')) {
        criteriaScores.best_practices += 0.2;
      }

      // Évaluation TypeScript
      if (response.includes(': string') || response.includes(': number')) {
        criteriaScores.typescript_usage += 0.3;
      }
      if (response.includes('interface') || response.includes('type')) {
        criteriaScores.typescript_usage += 0.2;
      }

      // Évaluation des patterns React
      if (response.includes('useState')) {
        criteriaScores.react_patterns += 0.2;
      }
      if (response.includes('useEffect')) {
        criteriaScores.react_patterns += 0.2;
      }
      if (response.includes('onClick') || response.includes('onChange')) {
        criteriaScores.react_patterns += 0.1;
      }

      // Évaluation de la sécurité
      if (response.includes('sanitize') || response.includes('validate')) {
        criteriaScores.security += 0.3;
      }
      if (response.includes('https') || response.includes('secure')) {
        criteriaScores.security += 0.2;
      }

      // Évaluation de la performance
      if (response.includes('useMemo') || response.includes('useCallback')) {
        criteriaScores.performance += 0.3;
      }
      if (response.includes('lazy') || response.includes('Suspense')) {
        criteriaScores.performance += 0.2;
      }

      // Évaluation de l'accessibilité
      if (response.includes('aria-') || response.includes('role=')) {
        criteriaScores.accessibility += 0.3;
      }
      if (response.includes('alt=') || response.includes('title=')) {
        criteriaScores.accessibility += 0.2;
      }

      // Évaluation des tests
      if (response.includes('test') || response.includes('spec')) {
        criteriaScores.tests += 0.3;
      }
      if (response.includes('expect') || response.includes('describe')) {
        criteriaScores.tests += 0.2;
      }

      // Calcul du score global
      overallScore = Object.values(criteriaScores).reduce((sum, score) => sum + score, 0) / Object.keys(criteriaScores).length;

      // Génération du feedback
      const feedback = this.generateFeedback(overallScore, criteriaScores);
      const improvements = this.generateImprovements(criteriaScores);
      const strengths = this.generateStrengths(criteriaScores);

      return {
        overall_score: Math.min(1, overallScore),
        criteria_scores: criteriaScores,
        pass: overallScore >= 0.7,
        feedback,
        improvements,
        strengths,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation:', error);
      return {
        overall_score: 0,
        criteria_scores: {
          code_quality: 0,
          completeness: 0,
          best_practices: 0,
          typescript_usage: 0,
          react_patterns: 0,
          security: 0,
          performance: 0,
          accessibility: 0,
          tests: 0,
        },
        pass: false,
        feedback: `Erreur lors de l'évaluation: ${error.message}`,
        improvements: [],
        strengths: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  private generateFeedback(overallScore: number, _criteriaScores: EvaluationCriteria): string {
    if (overallScore >= 0.8) {
      return "Excellente qualité de code avec de très bonnes pratiques";
    } else if (overallScore >= 0.7) {
      return "Bonne qualité de code avec quelques améliorations possibles";
    } else if (overallScore >= 0.5) {
      return "Qualité de code acceptable mais nécessite des améliorations";
    } else {
      return "Qualité de code insuffisante, nécessite une refonte";
    }
  }

  private generateImprovements(criteriaScores: EvaluationCriteria): string[] {
    const improvements: string[] = [];

    if (criteriaScores.code_quality < 0.7) {
      improvements.push("Améliorer la structure et la lisibilité du code");
    }
    if (criteriaScores.completeness < 0.7) {
      improvements.push("Compléter l'implémentation des fonctionnalités");
    }
    if (criteriaScores.best_practices < 0.7) {
      improvements.push("Ajouter des commentaires et documentation");
    }
    if (criteriaScores.typescript_usage < 0.7) {
      improvements.push("Améliorer l'utilisation de TypeScript");
    }
    if (criteriaScores.react_patterns < 0.7) {
      improvements.push("Utiliser les meilleures pratiques React");
    }
    if (criteriaScores.security < 0.7) {
      improvements.push("Renforcer la sécurité du code");
    }
    if (criteriaScores.performance < 0.7) {
      improvements.push("Optimiser les performances");
    }
    if (criteriaScores.accessibility < 0.7) {
      improvements.push("Améliorer l'accessibilité");
    }
    if (criteriaScores.tests < 0.7) {
      improvements.push("Ajouter des tests unitaires");
    }

    return improvements;
  }

  private generateStrengths(criteriaScores: EvaluationCriteria): string[] {
    const strengths: string[] = [];

    if (criteriaScores.code_quality >= 0.8) {
      strengths.push("Code bien structuré et lisible");
    }
    if (criteriaScores.completeness >= 0.8) {
      strengths.push("Implémentation complète des fonctionnalités");
    }
    if (criteriaScores.best_practices >= 0.8) {
      strengths.push("Bonnes pratiques de développement");
    }
    if (criteriaScores.typescript_usage >= 0.8) {
      strengths.push("Excellent usage de TypeScript");
    }
    if (criteriaScores.react_patterns >= 0.8) {
      strengths.push("Bons patterns React");
    }
    if (criteriaScores.security >= 0.8) {
      strengths.push("Sécurité bien implémentée");
    }
    if (criteriaScores.performance >= 0.8) {
      strengths.push("Performances optimisées");
    }
    if (criteriaScores.accessibility >= 0.8) {
      strengths.push("Accessibilité bien prise en compte");
    }
    if (criteriaScores.tests >= 0.8) {
      strengths.push("Tests bien implémentés");
    }

    return strengths;
  }
}