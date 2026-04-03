/**
 * App Catalog Service
 * Handles loading, searching, and detecting app mentions from the catalog
 */

export interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  hasMobile?: boolean;
  status: string;
  backendUrl: string | null;
  frontendUrl: string;
  mobileUrl?: string | null;
  workerName: string | null;
  localPorts?: {
    frontend: number;
    backend?: number;
  };
  apiDocsUrl?: string | null;
  features?: string[];
  createdAt?: string;
}

export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  apps: string[];
}

interface AppCatalog {
  version: string;
  lastUpdated: string;
  totalApps: number;
  deployedApps: number;
  baseUrls: {
    backend: string;
    frontend: string;
    apiDocs?: string;
  };
  apps: App[];
  categories: AppCategory[];
  statusTypes: Record<string, string>;
  stats: {
    totalApps: number;
    withBackend: number;
    frontendOnly: number;
    deployed: number;
  };
}

class AppCatalogService {
  private catalog: AppCatalog | null = null;
  private apps: App[] = [];
  private searchIndex: Map<string, App[]> = new Map();
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Load the app catalog from the public folder
   */
  async loadCatalog(): Promise<void> {
    if (this.isLoaded) return;

    // Prevent multiple concurrent loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const response = await fetch('/app.catalog.json');
        if (!response.ok) {
          throw new Error(`Failed to load app catalog: ${response.statusText}`);
        }
        this.catalog = await response.json();
        this.apps = this.catalog?.apps || [];
        this.buildSearchIndex();
        this.isLoaded = true;
      } catch (error) {
        console.error('Failed to load app catalog:', error);
        this.apps = [];
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Build a search index for fast app detection
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear();

    for (const app of this.apps) {
      // Index by exact app name (lowercase)
      const nameLower = app.name.toLowerCase();
      this.addToIndex(nameLower, app);

      // Index by app ID
      this.addToIndex(app.id, app);

      // Index by individual words in name (for partial matches)
      const nameWords = nameLower.split(/\s+/);
      for (const word of nameWords) {
        if (word.length > 2) {
          this.addToIndex(word, app);
        }
      }

      // Index by key description words
      const descWords = app.description.toLowerCase().split(/\s+/);
      for (const word of descWords) {
        // Only index meaningful words (length > 3, not common words)
        if (word.length > 3 && !this.isCommonWord(word)) {
          this.addToIndex(word, app);
        }
      }

      // Index by category keywords
      const categoryWords = app.category.split('-');
      for (const word of categoryWords) {
        this.addToIndex(word, app);
      }
    }
  }

  private addToIndex(key: string, app: App): void {
    const existing = this.searchIndex.get(key) || [];
    if (!existing.some(a => a.id === app.id)) {
      existing.push(app);
      this.searchIndex.set(key, existing);
    }
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'with', 'for', 'from', 'that', 'this', 'have', 'are',
      'was', 'were', 'been', 'being', 'your', 'their', 'will', 'would',
      'could', 'should', 'about', 'into', 'over', 'such', 'only'
    ]);
    return commonWords.has(word);
  }

  /**
   * Detect if a message mentions any app
   * Returns the best matching app or null
   */
  async detectAppMention(message: string): Promise<App | null> {
    await this.loadCatalog();

    if (this.apps.length === 0) return null;

    const messageLower = message.toLowerCase();
    const matches: Map<string, number> = new Map();

    // First, check for exact app name matches (highest priority)
    for (const app of this.apps) {
      const nameLower = app.name.toLowerCase();
      if (messageLower.includes(nameLower)) {
        // Exact name match - high score
        matches.set(app.id, (matches.get(app.id) || 0) + 10);
      }
    }

    // Check for app ID matches
    for (const app of this.apps) {
      if (messageLower.includes(app.id)) {
        matches.set(app.id, (matches.get(app.id) || 0) + 8);
      }
    }

    // Tokenize message and check against index
    const words = messageLower.split(/[\s,.\-!?;:'"]+/).filter(w => w.length > 2);

    for (const word of words) {
      const indexedApps = this.searchIndex.get(word);
      if (indexedApps) {
        for (const app of indexedApps) {
          // Word match - lower score
          matches.set(app.id, (matches.get(app.id) || 0) + 1);
        }
      }
    }

    // Find the best match
    if (matches.size === 0) return null;

    let bestAppId = '';
    let bestScore = 0;

    for (const [appId, score] of matches) {
      if (score > bestScore) {
        bestScore = score;
        bestAppId = appId;
      }
    }

    // Only return if score is above threshold (at least partial name match)
    if (bestScore < 3) return null;

    return this.apps.find(a => a.id === bestAppId) || null;
  }

  /**
   * Search apps by query
   */
  async searchApps(query: string, limit: number = 10): Promise<App[]> {
    await this.loadCatalog();

    if (!query.trim()) return this.apps.slice(0, limit);

    const queryLower = query.toLowerCase();
    const scored: Array<{ app: App; score: number }> = [];

    for (const app of this.apps) {
      let score = 0;

      // Exact name match
      if (app.name.toLowerCase() === queryLower) {
        score += 100;
      } else if (app.name.toLowerCase().includes(queryLower)) {
        score += 50;
      }

      // ID match
      if (app.id.includes(queryLower)) {
        score += 30;
      }

      // Description match
      if (app.description.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Category match
      if (app.category.includes(queryLower)) {
        score += 5;
      }

      if (score > 0) {
        scored.push({ app, score });
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.app);
  }

  /**
   * Get an app by ID
   */
  async getAppById(id: string): Promise<App | null> {
    await this.loadCatalog();
    return this.apps.find(a => a.id === id) || null;
  }

  /**
   * Get all apps
   */
  async getAllApps(): Promise<App[]> {
    await this.loadCatalog();
    return [...this.apps];
  }

  /**
   * Get apps by category
   */
  async getAppsByCategory(categoryId: string): Promise<App[]> {
    await this.loadCatalog();
    return this.apps.filter(a => a.category === categoryId);
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<AppCategory[]> {
    await this.loadCatalog();
    return this.catalog?.categories || [];
  }

  /**
   * Get catalog stats
   */
  async getStats(): Promise<AppCatalog['stats'] | null> {
    await this.loadCatalog();
    return this.catalog?.stats || null;
  }
}

// Export singleton instance
export const appCatalogService = new AppCatalogService();
