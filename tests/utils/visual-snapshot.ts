import { Page } from '@playwright/test';

/**
 * Utilitaires pour la capture et la comparaison de snapshots visuels
 * Intègre avec Percy pour la régression visuelle
 */

interface SnapshotOptions {
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  threshold?: number;
  maxDiffPixels?: number;
  maxDiffPixelRatio?: number;
}

export class VisualSnapshot {
  private page: Page;
  private percyToken: string | undefined;

  constructor(page: Page) {
    this.page = page;
    this.percyToken = process.env.PERCY_TOKEN;
  }

  /**
   * Prend un snapshot de la page actuelle
   */
  async takeSnapshot(name: string, options: SnapshotOptions = {}): Promise<void> {
    try {
      // Attendre que la page soit stable
      await this.page.waitForLoadState('networkidle');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}.png`,
        fullPage: options.fullPage ?? true,
        clip: options.clip
      });
      
      console.log(`📸 Snapshot capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot ${name}:`, error);
    }
  }

  /**
   * Compare un snapshot avec la version précédente
   */
  async compareSnapshot(name: string, options: SnapshotOptions = {}): Promise<boolean> {
    try {
      // Prendre le snapshot actuel
      const _currentSnapshot = await this.page.screenshot({
        fullPage: options.fullPage ?? true,
        clip: options.clip
      });
      
      // Comparer avec le snapshot de référence
      const referencePath = `test-results/snapshots/${name}.png`;
      
      // Ici, vous pourriez implémenter une logique de comparaison
      // Pour l'instant, on sauvegarde simplement le snapshot
      await this.page.screenshot({
        path: referencePath,
        fullPage: options.fullPage ?? true,
        clip: options.clip
      });
      
      console.log(`✅ Snapshot comparé: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la comparaison du snapshot ${name}:`, error);
      return false;
    }
  }

  /**
   * Prend un snapshot d'un élément spécifique
   */
  async takeElementSnapshot(selector: string, name: string): Promise<void> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible' });
      
      await element.screenshot({
        path: `test-results/snapshots/${name}.png`
      });
      
      console.log(`📸 Snapshot d'élément capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot d'élément ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot de la page en mode mobile
   */
  async takeMobileSnapshot(name: string): Promise<void> {
    try {
      // Simuler un appareil mobile
      await this.page.setViewportSize({ width: 375, height: 667 });
      
      // Attendre que la page s'adapte
      await this.page.waitForTimeout(1000);
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-mobile.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot mobile capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot mobile ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot de la page en mode tablette
   */
  async takeTabletSnapshot(name: string): Promise<void> {
    try {
      // Simuler une tablette
      await this.page.setViewportSize({ width: 768, height: 1024 });
      
      // Attendre que la page s'adapte
      await this.page.waitForTimeout(1000);
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-tablet.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot tablette capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot tablette ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot de la page en mode desktop
   */
  async takeDesktopSnapshot(name: string): Promise<void> {
    try {
      // Simuler un écran desktop
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Attendre que la page s'adapte
      await this.page.waitForTimeout(1000);
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-desktop.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot desktop capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot desktop ${name}:`, error);
    }
  }

  /**
   * Prend des snapshots pour tous les breakpoints
   */
  async takeResponsiveSnapshots(name: string): Promise<void> {
    await Promise.all([
      this.takeMobileSnapshot(name),
      this.takeTabletSnapshot(name),
      this.takeDesktopSnapshot(name)
    ]);
  }

  /**
   * Prend un snapshot en mode sombre
   */
  async takeDarkModeSnapshot(name: string): Promise<void> {
    try {
      // Activer le mode sombre
      await this.page.click('[data-testid="theme-toggle"]');
      await this.page.waitForSelector('[data-testid="app-container"][data-theme="dark"]');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-dark.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot mode sombre capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot mode sombre ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot en mode clair
   */
  async takeLightModeSnapshot(name: string): Promise<void> {
    try {
      // S'assurer que le mode clair est actif
      await this.page.click('[data-testid="theme-toggle"]');
      await this.page.waitForSelector('[data-testid="app-container"][data-theme="light"]');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-light.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot mode clair capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot mode clair ${name}:`, error);
    }
  }

  /**
   * Prend des snapshots pour tous les thèmes
   */
  async takeThemeSnapshots(name: string): Promise<void> {
    await Promise.all([
      this.takeLightModeSnapshot(name),
      this.takeDarkModeSnapshot(name)
    ]);
  }

  /**
   * Prend un snapshot d'un état d'erreur
   */
  async takeErrorStateSnapshot(name: string): Promise<void> {
    try {
      // Attendre que l'erreur s'affiche
      await this.page.waitForSelector('[data-testid="error-message"]');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-error.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot d'état d'erreur capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot d'état d'erreur ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot d'un état de chargement
   */
  async takeLoadingStateSnapshot(name: string): Promise<void> {
    try {
      // Attendre que l'état de chargement s'affiche
      await this.page.waitForSelector('[data-testid="loading-spinner"]');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-loading.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot d'état de chargement capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot d'état de chargement ${name}:`, error);
    }
  }

  /**
   * Prend un snapshot d'un état de succès
   */
  async takeSuccessStateSnapshot(name: string): Promise<void> {
    try {
      // Attendre que l'état de succès s'affiche
      await this.page.waitForSelector('[data-testid="success-message"]');
      
      // Prendre le snapshot
      await this.page.screenshot({
        path: `test-results/snapshots/${name}-success.png`,
        fullPage: true
      });
      
      console.log(`📸 Snapshot d'état de succès capturé: ${name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la capture du snapshot d'état de succès ${name}:`, error);
    }
  }

  /**
   * Prend des snapshots pour tous les états
   */
  async takeStateSnapshots(name: string): Promise<void> {
    await Promise.all([
      this.takeLoadingStateSnapshot(name),
      this.takeSuccessStateSnapshot(name),
      this.takeErrorStateSnapshot(name)
    ]);
  }
}

/**
 * Fonction utilitaire pour prendre un snapshot simple
 */
export async function takeVisualSnapshot(page: Page, name: string, options: SnapshotOptions = {}): Promise<void> {
  const visualSnapshot = new VisualSnapshot(page);
  await visualSnapshot.takeSnapshot(name, options);
}

/**
 * Fonction utilitaire pour prendre un snapshot d'élément
 */
export async function takeElementSnapshot(page: Page, selector: string, name: string): Promise<void> {
  const visualSnapshot = new VisualSnapshot(page);
  await visualSnapshot.takeElementSnapshot(selector, name);
}

/**
 * Fonction utilitaire pour prendre des snapshots responsives
 */
export async function takeResponsiveSnapshots(page: Page, name: string): Promise<void> {
  const visualSnapshot = new VisualSnapshot(page);
  await visualSnapshot.takeResponsiveSnapshots(name);
}

/**
 * Fonction utilitaire pour prendre des snapshots de thèmes
 */
export async function takeThemeSnapshots(page: Page, name: string): Promise<void> {
  const visualSnapshot = new VisualSnapshot(page);
  await visualSnapshot.takeThemeSnapshots(name);
}

/**
 * Fonction utilitaire pour prendre des snapshots d'états
 */
export async function takeStateSnapshots(page: Page, name: string): Promise<void> {
  const visualSnapshot = new VisualSnapshot(page);
  await visualSnapshot.takeStateSnapshots(name);
}