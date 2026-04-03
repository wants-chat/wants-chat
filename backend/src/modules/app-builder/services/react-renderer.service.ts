/**
 * React Template Renderer Service
 *
 * Generates React components and pages from component definitions.
 * Uses the ComponentType registry and actual component generators.
 */

import { ComponentDefinition, ComponentField } from '../interfaces/component.interface';
import { PageInstance } from '../interfaces/page-template.interface';
import { GeneratedFile, ColorScheme, DesignVariant, BrandingConfig } from '../interfaces/generation.interface';
import { GeneratedKeys } from './hono-renderer.service';
import { generateDesignVariantsFile } from '../generators/react-components/app/design-variants.generator';
import { ComponentType } from '../interfaces/component-types.enum';
import { COMPONENT_REGISTRY, getComponentGenerator } from '../generators/react-components/component.registry';
import {
  getComponentTypeFromTemplate,
  getComponentTypeFromId,
  getPageLayout,
  getIconForComponentType,
  TEMPLATE_TO_COMPONENT_TYPE,
  COMPONENT_ID_TO_TYPE,
} from './template-component-mapper';
import { FeatureDefinition, FeatureEntity } from '../interfaces/feature.interface';
import { AppTypeDefinition } from '../interfaces/app-type.interface';
import { getAppType } from '../registries/app-types';
import { pascalCase, capitalCase } from 'change-case';
import { singular, plural } from 'pluralize';
import { shadcnGenerators } from '../generators/react-components/ui/react/shadcn';

// Default branding
const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '8px',
  logoUrl: null,
};

export interface ReactRendererConfig {
  colorScheme: ColorScheme;
  designVariant: DesignVariant;
  useTailwind: boolean;
  useTypescript: boolean;
}

const DEFAULT_CONFIG: ReactRendererConfig = {
  colorScheme: 'blue',
  designVariant: 'minimal',
  useTailwind: true,
  useTypescript: true,
};

export class ReactRendererService {
  private config: ReactRendererConfig;
  private currentAppType: string = 'ecommerce'; // Default app type
  private currentAppTypeDefinition: AppTypeDefinition | null = null;
  private currentFeatures: FeatureDefinition[] = [];
  private currentEntities: Map<string, FeatureEntity> = new Map();

  constructor(config: Partial<ReactRendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set features for the current app generation
   * This allows the renderer to access entity definitions and generate proper code
   */
  setFeatures(features: FeatureDefinition[]): void {
    this.currentFeatures = features;
    this.currentEntities.clear();

    // Build entity map from all features
    for (const feature of features) {
      if (feature.entities) {
        for (const entity of feature.entities) {
          this.currentEntities.set(entity.name, entity);
        }
      }
    }
  }

  /**
   * Get entity definition by name
   */
  private getEntity(entityName: string): FeatureEntity | undefined {
    return this.currentEntities.get(entityName);
  }

  /**
   * Find the feature that contains a specific page (by templateId or route)
   * Derived from feature definitions - no hardcoding
   */
  private findFeatureForPage(page: PageInstance): FeatureDefinition | undefined {
    const templateId = (page as any).templateId || page.id;
    const route = page.route;

    for (const feature of this.currentFeatures) {
      if (!feature.pages) continue;
      for (const fp of feature.pages) {
        if (fp.templateId === templateId || fp.route === route || fp.id === page.id) {
          return feature;
        }
      }
    }
    return undefined;
  }

  /**
   * Get entity from page - STRICTLY from definitions only
   * No guessing, no fallbacks - returns null if not found in definitions
   */
  private inferEntityFromPage(page: PageInstance): string {
    const feature = this.findFeatureForPage(page);

    if (feature?.entities && feature.entities.length > 0) {
      // Get primary/core entity from feature definition
      const coreEntity = feature.entities.find(e => e.isCore);
      return coreEntity?.name || feature.entities[0].name;
    }

    // No definition found - log warning and return page-based entity
    console.warn(`[APP-BUILDER] No entity definition found for page: ${page.id}`);

    // Extract from route as last resort (this is from the page definition, not a guess)
    const routeParts = page.route.split('/').filter(Boolean);
    if (routeParts.length > 0 && !routeParts[0].startsWith(':')) {
      return routeParts[0];
    }

    return 'items'; // Fallback only when absolutely no info available
  }

  /**
   * Find related route - STRICTLY from feature definitions
   */
  private findRelatedRoute(page: PageInstance, targetType: 'list' | 'detail' | 'create' | 'admin'): string | null {
    const feature = this.findFeatureForPage(page);

    if (!feature?.pages) {
      console.warn(`[APP-BUILDER] No feature pages defined for: ${page.id}`);
      return null;
    }

    // Find the target page type from definitions
    for (const fp of feature.pages) {
      const tid = fp.templateId.toLowerCase();
      const route = fp.route.toLowerCase();

      switch (targetType) {
        case 'list':
          if ((tid.includes('list') || tid.includes('grid')) && !route.includes(':')) {
            return fp.route;
          }
          break;
        case 'detail':
          if (!tid.includes('list') && !tid.includes('admin') && !tid.includes('write') &&
              !tid.includes('create') && !tid.includes('new') && !tid.includes('edit') &&
              (route.includes(':id') || route.includes(':slug'))) {
            return fp.route;
          }
          break;
        case 'create':
          if (tid.includes('write') || tid.includes('create') || tid.includes('new') ||
              (tid.includes('editor') && fp.section !== 'admin')) {
            return fp.route;
          }
          break;
        case 'admin':
          if (fp.section === 'admin') {
            return fp.route;
          }
          break;
      }
    }

    console.warn(`[APP-BUILDER] No ${targetType} route found in definitions for: ${page.id}`);
    return null;
  }

  /**
   * Get the base list route for an entity from feature definitions
   * No hardcoding - derived from feature pages
   */
  private getListRouteForEntity(entity: string): string {
    for (const feature of this.currentFeatures) {
      if (!feature.pages || !feature.entities) continue;

      // Check if this feature has this entity
      const hasEntity = feature.entities.some(e => e.name === entity);
      if (!hasEntity) continue;

      // Find the list page for this entity
      for (const fp of feature.pages) {
        const tid = fp.templateId.toLowerCase();
        if ((tid.includes('list') || tid.includes('grid')) && !fp.route.includes(':')) {
          return fp.route;
        }
      }
    }
    return `/${entity}`;
  }

  /**
   * Get the detail route pattern for an entity from feature definitions
   * No hardcoding - derived from feature pages
   */
  private getDetailRouteForEntity(entity: string): string {
    for (const feature of this.currentFeatures) {
      if (!feature.pages || !feature.entities) continue;

      const hasEntity = feature.entities.some(e => e.name === entity);
      if (!hasEntity) continue;

      for (const fp of feature.pages) {
        const tid = fp.templateId.toLowerCase();
        if (!tid.includes('list') && !tid.includes('admin') && !tid.includes('write') &&
            (fp.route.includes(':id') || fp.route.includes(':slug'))) {
          // Return the route pattern with :id placeholder
          return fp.route.replace(':slug', ':id');
        }
      }
    }
    return `/${entity}/:id`;
  }

  /**
   * Get the create route for an entity from feature definitions
   * No hardcoding - derived from feature pages
   */
  private getCreateRouteForEntity(entity: string): string {
    for (const feature of this.currentFeatures) {
      if (!feature.pages || !feature.entities) continue;

      const hasEntity = feature.entities.some(e => e.name === entity);
      if (!hasEntity) continue;

      for (const fp of feature.pages) {
        const tid = fp.templateId.toLowerCase();
        if (tid.includes('write') || tid.includes('create') || tid.includes('new')) {
          return fp.route;
        }
      }
    }
    return `/${entity}/new`;
  }

  /**
   * Generate color shades from a hex color
   */
  private generateColorShades(hex: string): Record<string, string> {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Generate shades (lighter to darker)
    const shades: Record<string, string> = {};
    const factors = [0.95, 0.9, 0.8, 0.7, 0.5, 0.0, -0.15, -0.25, -0.35, -0.45];
    const names = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

    factors.forEach((factor, i) => {
      let nr: number, ng: number, nb: number;
      if (factor >= 0) {
        // Lighter
        nr = Math.round(r + (255 - r) * factor);
        ng = Math.round(g + (255 - g) * factor);
        nb = Math.round(b + (255 - b) * factor);
      } else {
        // Darker
        nr = Math.round(r * (1 + factor));
        ng = Math.round(g * (1 + factor));
        nb = Math.round(b * (1 + factor));
      }
      shades[names[i]] = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    });

    return shades;
  }

  /**
   * Generate all React files for the frontend
   */
  generateAll(
    pages: PageInstance[],
    components: Map<string, ComponentDefinition>,
    appName: string,
    keys?: GeneratedKeys,
    branding?: BrandingConfig,
    designVariant: DesignVariant = 'minimal',
    colorScheme: ColorScheme = 'blue',
    appType: string = 'ecommerce'
  ): GeneratedFile[] {
    // Store app type and load full definition for use in page generation
    this.currentAppType = appType;
    this.currentAppTypeDefinition = getAppType(appType) || null;

    const files: GeneratedFile[] = [];
    const appSlug = appName.toLowerCase().replace(/\s+/g, '-');
    const brandConfig = branding || DEFAULT_BRANDING;

    // 1. Generate base files
    files.push(this.generatePackageJson(appName));
    files.push(this.generateViteConfig(appSlug));
    files.push(this.generateTsConfig());
    files.push(this.generateTsConfigNode());
    files.push(this.generateViteEnvDts());
    files.push(this.generateTailwindConfig());
    files.push(this.generatePostCssConfig());
    files.push(this.generateIndexHtml(appName));
    files.push(this.generateMainTsx());
    files.push(this.generateAppTsx(pages));
    files.push(this.generateIndexCss(brandConfig));

    // 2. Generate environment files
    files.push(this.generateEnvFile(appSlug)); // Actual .env for local dev
    files.push(this.generateEnvExample(appSlug));
    files.push(this.generateEnvProduction(appSlug));
    files.push(this.generateWranglerToml(appSlug));
    files.push(this.generateGitignore());

    // 3. Generate utility files
    files.push(this.generateUtils());
    files.push(this.generateApiClient());

    // 4. Generate auth context
    files.push(this.generateAuthContext());

    // 5. Generate design system files
    files.push(this.generateDesignVariants());
    files.push(this.generateUIConfig(designVariant, colorScheme));

    // 5b. Generate UI components (shadcn-style)
    files.push(...this.generateUIComponents());

    // 6. Generate pages
    for (const page of pages) {
      files.push(this.generatePage(page, components));
    }

    // 6b. Verify home page exists - using app-type defined defaultRoute, NO GUESSING
    const appTypeDefaultRoute = this.currentAppTypeDefinition?.defaultRoute || '/';
    const hasHomePage = pages.some((p) => p.route === appTypeDefaultRoute || p.route === '/');
    if (!hasHomePage) {
      throw new Error(
        `No home page defined for app type "${this.currentAppType}". ` +
        `Feature definitions must include a page with route "${appTypeDefaultRoute}" or "/". ` +
        `Check the defaultFeatures and defaultRoute in the app type definition.`
      );
    }

    // 7. Generate layout components
    files.push(this.generateLayout());
    files.push(this.generateHeader(appName));
    files.push(this.generateSidebar(pages));

    return files;
  }

  /**
   * Generate design variants helper file
   */
  private generateDesignVariants(): GeneratedFile {
    return {
      path: 'frontend/src/lib/design-variants.ts',
      content: generateDesignVariantsFile(),
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate UI configuration file with app's design settings
   */
  private generateUIConfig(variant: DesignVariant, colorScheme: ColorScheme): GeneratedFile {
    const content = `// Auto-generated UI configuration
import { getVariantStyles, type DesignVariant, type ColorScheme } from './design-variants';

// App's design settings
export const APP_DESIGN_VARIANT: DesignVariant = '${variant}';
export const APP_COLOR_SCHEME: ColorScheme = '${colorScheme}';

// Aliases for compatibility
export const UI_VARIANT = APP_DESIGN_VARIANT;
export const UI_COLOR_SCHEME = APP_COLOR_SCHEME;

// Pre-computed styles for this app
export const appStyles = getVariantStyles(APP_DESIGN_VARIANT, APP_COLOR_SCHEME);

// Helper to get component styles
export function getStyles() {
  return appStyles;
}

// Re-export for convenience
export { getVariantStyles };
export type { DesignVariant, ColorScheme, VariantStyles } from './design-variants';
`;

    return {
      path: 'frontend/src/lib/ui-config.ts',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(appName: string): GeneratedFile {
    const content = JSON.stringify({
      name: appName.toLowerCase().replace(/\s+/g, '-'),
      private: true,
      version: '0.0.1',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        '@tanstack/react-query': '^5.8.0',
        'zustand': '^4.4.0',
        'axios': '^1.6.0',
        'lucide-react': '^0.294.0',
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0',
        'class-variance-authority': '^0.7.0',
        'sonner': '^1.3.1',
        '@radix-ui/react-accordion': '^1.1.2',
        '@radix-ui/react-alert-dialog': '^1.0.5',
        '@radix-ui/react-avatar': '^1.0.4',
        '@radix-ui/react-checkbox': '^1.0.4',
        '@radix-ui/react-collapsible': '^1.0.3',
        '@radix-ui/react-dialog': '^1.0.5',
        '@radix-ui/react-dropdown-menu': '^2.0.6',
        '@radix-ui/react-label': '^2.0.2',
        '@radix-ui/react-progress': '^1.0.3',
        '@radix-ui/react-radio-group': '^1.1.3',
        '@radix-ui/react-scroll-area': '^1.0.5',
        '@radix-ui/react-select': '^2.0.0',
        '@radix-ui/react-separator': '^1.0.3',
        '@radix-ui/react-slider': '^1.1.2',
        '@radix-ui/react-slot': '^1.0.2',
        '@radix-ui/react-switch': '^1.0.3',
        '@radix-ui/react-tabs': '^1.0.4',
        '@radix-ui/react-tooltip': '^1.0.7',
        'date-fns': '^2.30.0',
        'react-markdown': '^9.0.1',
        'react-syntax-highlighter': '^15.5.0',
        'remark-gfm': '^4.0.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@types/react-syntax-highlighter': '^15.5.11',
        '@vitejs/plugin-react': '^4.2.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0',
        'tailwindcss': '^3.3.0',
        'typescript': '^5.3.0',
        'vite': '^5.0.0',
      },
    }, null, 2);

    return {
      path: 'frontend/package.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate vite.config.ts
   */
  private generateViteConfig(appSlug: string): GeneratedFile {
    const content = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`;

    return {
      path: 'frontend/vite.config.ts',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate actual .env file for local development
   */
  private generateEnvFile(appSlug: string): GeneratedFile {
    const content = `# API Configuration
VITE_API_URL=http://localhost:4000/api

# App Configuration
VITE_APP_NAME=${appSlug}

# Fluxez Chatbot (optional)
VITE_FLUXEZ_CHATBOT_ID=
VITE_FLUXEZ_ANALYTICS_ID=
`;

    return {
      path: 'frontend/.env',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .env.example
   */
  private generateEnvExample(appSlug: string): GeneratedFile {
    const content = `# API Configuration
VITE_API_URL=http://localhost:4000/api

# App Configuration
VITE_APP_NAME=${appSlug}

# Fluxez Chatbot (optional)
VITE_FLUXEZ_CHATBOT_ID=
VITE_FLUXEZ_ANALYTICS_ID=
`;

    return {
      path: 'frontend/.env.example',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .env.production
   */
  private generateEnvProduction(appSlug: string): GeneratedFile {
    const content = `# Production API Configuration
VITE_API_URL=https://${appSlug}-api.fluxez.workers.dev/api

# App Configuration
VITE_APP_NAME=${appSlug}

# Fluxez Chatbot (configure in Fluxez dashboard)
VITE_FLUXEZ_CHATBOT_ID=
VITE_FLUXEZ_ANALYTICS_ID=
`;

    return {
      path: 'frontend/.env.production',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate wrangler.toml for Cloudflare Pages
   */
  private generateWranglerToml(appSlug: string): GeneratedFile {
    const content = `name = "${appSlug}"
compatibility_date = "2024-12-01"

[assets]
directory = "./dist"
`;

    return {
      path: 'frontend/wrangler.toml',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .gitignore
   */
  private generateGitignore(): GeneratedFile {
    const content = `node_modules/
dist/
.env
.env.local
.wrangler/
*.log
`;

    return {
      path: 'frontend/.gitignore',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate index.css with Tailwind
   */
  private generateIndexCss(branding: BrandingConfig): GeneratedFile {
    const primaryShades = this.generateColorShades(branding.primaryColor);
    const secondaryShades = this.generateColorShades(branding.secondaryColor);

    const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Primary Color Palette - Generated from ${branding.primaryColor} */
  --color-primary-50: ${primaryShades['50']};
  --color-primary-100: ${primaryShades['100']};
  --color-primary-200: ${primaryShades['200']};
  --color-primary-300: ${primaryShades['300']};
  --color-primary-400: ${primaryShades['400']};
  --color-primary-500: ${primaryShades['500']};
  --color-primary-600: ${primaryShades['600']};
  --color-primary-700: ${primaryShades['700']};
  --color-primary-800: ${primaryShades['800']};
  --color-primary-900: ${primaryShades['900']};

  /* Secondary Color Palette - Generated from ${branding.secondaryColor} */
  --color-secondary-50: ${secondaryShades['50']};
  --color-secondary-100: ${secondaryShades['100']};
  --color-secondary-200: ${secondaryShades['200']};
  --color-secondary-300: ${secondaryShades['300']};
  --color-secondary-400: ${secondaryShades['400']};
  --color-secondary-500: ${secondaryShades['500']};
  --color-secondary-600: ${secondaryShades['600']};
  --color-secondary-700: ${secondaryShades['700']};
  --color-secondary-800: ${secondaryShades['800']};
  --color-secondary-900: ${secondaryShades['900']};

  /* Other Branding */
  --color-accent: ${branding.accentColor};
  --color-background: ${branding.backgroundColor};
  --color-text: ${branding.textColor};
  --font-family: ${branding.fontFamily};
  --border-radius: ${branding.borderRadius};
}

body {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

    return {
      path: 'frontend/src/index.css',
      content,
      type: 'style',
      method: 'template',
    };
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): GeneratedFile {
    const content = JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    }, null, 2);

    return {
      path: 'frontend/tsconfig.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate tsconfig.node.json (required by Vite)
   */
  private generateTsConfigNode(): GeneratedFile {
    const content = JSON.stringify({
      compilerOptions: {
        composite: true,
        tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        strict: true,
      },
      include: ['vite.config.ts'],
    }, null, 2);

    return {
      path: 'frontend/tsconfig.node.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate vite-env.d.ts (required for import.meta.env types)
   */
  private generateViteEnvDts(): GeneratedFile {
    const content = `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`;

    return {
      path: 'frontend/src/vite-env.d.ts',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate postcss.config.js (required by Tailwind)
   */
  private generatePostCssConfig(): GeneratedFile {
    const content = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

    return {
      path: 'frontend/postcss.config.js',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate tailwind.config.js
   */
  private generateTailwindConfig(): GeneratedFile {
    const colorMap: Record<ColorScheme, string> = {
      blue: 'blue',
      purple: 'purple',
      green: 'emerald',
      orange: 'orange',
      pink: 'pink',
      indigo: 'indigo',
      teal: 'teal',
      red: 'red',
      neutral: 'slate',
      warm: 'amber',
    };

    const primaryColor = colorMap[this.config.colorScheme];

    const content = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
      },
    },
  },
  plugins: [],
};
`;

    return {
      path: 'frontend/tailwind.config.js',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate index.html
   */
  private generateIndexHtml(appName: string): GeneratedFile {
    const content = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

    return {
      path: 'frontend/index.html',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate main.tsx
   */
  private generateMainTsx(): GeneratedFile {
    const content = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
`;

    return {
      path: 'frontend/src/main.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate App.tsx with routes - NO FALLBACKS
   * All pages must come from feature definitions
   */
  private generateAppTsx(pages: PageInstance[]): GeneratedFile {
    // Get routes from app-type definition - NO GUESSING
    const appTypeDef = this.currentAppTypeDefinition;
    const defaultRoute = appTypeDef?.defaultRoute || '/';
    const guestRoute = appTypeDef?.guestRoute || '/login';

    // Check if we have an explicit root page
    const hasRootPage = pages.some((p) => p.route === '/');
    // Need redirect from / to defaultRoute if no root page exists AND defaultRoute is not /
    const needsRootRedirect = !hasRootPage && defaultRoute !== '/';

    // Deduplicate imports by component name (some pages may have same component name but different routes)
    const seenComponents = new Set<string>();
    const imports = pages
      .map((page) => {
        const componentName = this.toComponentName(page.id);
        if (seenComponents.has(componentName)) {
          return null; // Skip duplicate
        }
        seenComponents.add(componentName);
        return `import ${componentName} from './pages/${componentName}';`;
      })
      .filter(Boolean)
      .join('\n');

    const routes = pages.map((page) => {
      const componentName = this.toComponentName(page.id);
      // Include requiredRoles if available for role-based access control
      const requiredRoles = page.auth?.roles || [];
      const authRequired = page.auth?.required ?? false;
      const authWrapper = authRequired
        ? (requiredRoles.length > 0
            ? `<PrivateRoute requiredRoles={${JSON.stringify(requiredRoles)}}><${componentName} /></PrivateRoute>`
            : `<PrivateRoute><${componentName} /></PrivateRoute>`)
        : `<${componentName} />`;
      return `        <Route path="${page.route}" element={${authWrapper}} />`;
    }).join('\n');

    // Add root redirect route if needed (e.g., / -> /feed for social apps)
    const rootRedirectRoute = needsRootRedirect
      ? `\n        <Route path="/" element={<HomeRedirect />} />`
      : '';

    // HomeRedirect component for smart root redirect (uses app-type defined routes)
    const homeRedirectComponent = needsRootRedirect ? `
// Smart redirect for root path: logged-in users go to defaultRoute, guests go to guestRoute
// Routes defined in app-type definition, not guessed
function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Navigate to={isAuthenticated ? "${defaultRoute}" : "${guestRoute}"} replace />;
}
` : '';

    const content = `import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
${imports}

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="${guestRoute}" replace />;
  }

  // Check role-based access if roles are required
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.role || user?.appMetadata?.role || user?.metadata?.role || 'user';
    const userLevel = getRoleLevel(userRole);

    // Get the minimum required level from all required roles
    const minRequiredLevel = Math.min(...requiredRoles.map(r => getRoleLevel(r)));

    // Allow access if user's role level is >= minimum required role level
    if (userLevel < minRequiredLevel) {
      console.log('PrivateRoute - Access denied. User role:', userRole, '(level', userLevel, ') Required:', requiredRoles);
      return <Navigate to="${defaultRoute}" replace />;
    }
  }

  return <>{children}</>;
}

// Role hierarchy levels - higher number = more access
// This maps common role names to their hierarchy level
function getRoleLevel(role: string): number {
  const levels: Record<string, number> = {
    // Admin/Owner level
    admin: 100,
    owner: 100,
    director: 100,
    // Manager level
    manager: 80,
    supervisor: 80,
    curator: 80,
    butcher: 80,
    // Staff level
    staff: 50,
    employee: 50,
    attendant: 50,
    barber: 50,
    // Member level
    member: 30,
    pro: 30,
    // User/Customer level
    user: 20,
    customer: 20,
    visitor: 20,
    reader: 20,
    // Guest level
    guest: 10,
  };
  return levels[role.toLowerCase()] || 20;
}
${homeRedirectComponent}
export default function App() {
  return (
    <Layout>
      <Routes>
${routes}${rootRedirectRoute}
        <Route path="*" element={<Navigate to="${defaultRoute}" replace />} />
      </Routes>
    </Layout>
  );
}
`;

    return {
      path: 'frontend/src/App.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate API client
   */
  private generateApiClient(): GeneratedFile {
    const content = `import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const AUTH_TOKEN_KEY = 'auth_token';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic request helpers
export const get = <T>(url: string): Promise<T> => apiClient.get<T>(url).then((res) => res.data);
export const post = <T>(url: string, data?: any): Promise<T> => apiClient.post<T>(url, data).then((res) => res.data);
export const put = <T>(url: string, data?: any): Promise<T> => apiClient.put<T>(url, data).then((res) => res.data);
export const patch = <T>(url: string, data?: any): Promise<T> => apiClient.patch<T>(url, data).then((res) => res.data);
export const del = <T>(url: string): Promise<T> => apiClient.delete<T>(url).then((res) => res.data);

// Convenience api object
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export default apiClient;
`;

    return {
      path: 'frontend/src/lib/api.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate Auth Context
   */
  private generateAuthContext(): GeneratedFile {
    const content = `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/api';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  appMetadata?: {
    role?: string;
    [key: string]: any;
  };
  metadata?: {
    role?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      // Backend returns { user: {...} }
      const userData = response.data?.user || response.data;
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    // Backend returns { user, token, access_token, refresh_token }
    const data = response.data;
    const token = data.token || data.access_token || data.accessToken;
    const userData = data.user;

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    // Backend returns { user, token, access_token, refresh_token }
    const data = response.data;
    const token = data.token || data.access_token || data.accessToken;
    const userData = data.user;

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    // Optional: call logout endpoint
    apiClient.post('/auth/logout').catch(() => {});
  };

  // Check both user state and token for authentication
  const hasValidToken = !!localStorage.getItem(AUTH_TOKEN_KEY);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && hasValidToken,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
`;

    return {
      path: 'frontend/src/contexts/AuthContext.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate utils.ts with cn helper function
   */
  private generateUtils(): GeneratedFile {
    const content = `import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
`;

    return {
      path: 'frontend/src/lib/utils.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate common UI components using shadcn generators
   */
  private generateUIComponents(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Map of component names to their generators
    const uiComponents: Record<string, () => string> = {
      'button': shadcnGenerators.button,
      'input': shadcnGenerators.input,
      'label': shadcnGenerators.label,
      'checkbox': shadcnGenerators.checkbox,
      'card': shadcnGenerators.card,
      'badge': shadcnGenerators.badge,
      'select': shadcnGenerators.select,
      'textarea': shadcnGenerators.textarea,
      'dialog': shadcnGenerators.dialog,
      'progress': shadcnGenerators.progress,
      'avatar': shadcnGenerators.avatar,
      'tabs': shadcnGenerators.tabs,
      'table': shadcnGenerators.table,
      'skeleton': () => `import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)} {...props} />;
}

export { Skeleton };
`,
      'scroll-area': shadcnGenerators['scroll-area'],
      'dropdown-menu': shadcnGenerators['dropdown-menu'],
      'switch': shadcnGenerators.switch,
      'separator': shadcnGenerators.separator,
      'slider': shadcnGenerators.slider,
      'accordion': shadcnGenerators.accordion,
      'alert': shadcnGenerators.alert,
      'alert-dialog': shadcnGenerators['alert-dialog'],
      'sheet': shadcnGenerators.sheet,
      'radio-group': shadcnGenerators['radio-group'],
      'collapsible': shadcnGenerators.collapsible,
    };

    // Generate each UI component
    for (const [name, generator] of Object.entries(uiComponents)) {
      try {
        const content = generator();
        files.push({
          path: `frontend/src/components/ui/${name}.tsx`,
          content,
          type: 'component' as const,
          method: 'template' as const,
        });
      } catch (error) {
        console.warn(`[UI] Failed to generate ${name}:`, error);
      }
    }

    return files;
  }

  // Legacy method removed - now using shadcn generators above
  /* OLD EMBEDDED UI COMPONENTS REMOVED - START

    // Button component (legacy fallback)
    files.push({
      path: 'frontend/src/components/ui/button.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-300";

    const variants: Record<string, string> = {
      default: "bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
      destructive: "bg-red-500 text-gray-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90",
      outline: "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
      ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
    };

    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
`,
      type: 'component',
      method: 'template',
    });

    // Input component
    files.push({
      path: 'frontend/src/components/ui/input.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
`,
      type: 'component',
      method: 'template',
    });

    // Label component
    files.push({
      path: 'frontend/src/components/ui/label.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
`,
      type: 'component',
      method: 'template',
    });

    // Checkbox component
    files.push({
      path: 'frontend/src/components/ui/checkbox.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      setIsChecked(checked || false);
    }, [checked]);

    const handleClick = () => {
      const newValue = !isChecked;
      setIsChecked(newValue);
      onCheckedChange?.(newValue);
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={handleClick}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-gray-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-50 dark:focus-visible:ring-gray-300",
          isChecked && "bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900",
          className
        )}
      >
        {isChecked && <Check className="h-3 w-3" />}
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          className="sr-only"
          onChange={() => {}}
          {...props}
        />
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
`,
      type: 'component',
      method: 'template',
    });

    // Card component
    files.push({
      path: 'frontend/src/components/ui/card.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-200 bg-white text-gray-950 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`,
      type: 'component',
      method: 'template',
    });

    // Badge component
    files.push({
      path: 'frontend/src/components/ui/badge.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
  destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline: "text-gray-950 border-gray-200",
  success: "border-transparent bg-green-600 text-white hover:bg-green-700",
  warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
`,
      type: 'component',
      method: 'template',
    });

    // Select component
    files.push({
      path: 'frontend/src/components/ui/select.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
`,
      type: 'component',
      method: 'template',
    });

    // Textarea component
    files.push({
      path: 'frontend/src/components/ui/textarea.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
`,
      type: 'component',
      method: 'template',
    });

    // Dialog component
    files.push({
      path: 'frontend/src/components/ui/dialog.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{ onClose: () => void }>({ onClose: () => {} });

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <DialogContext.Provider value={{ onClose: () => onOpenChange?.(false) }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
        {children}
      </div>
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { onClose } = React.useContext(DialogContext);
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-950",
          className
        )}
        {...props}
      >
        {children}
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

const DialogTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props as any);
  }
  return <button {...props}>{children}</button>;
};

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger };
`,
      type: 'component',
      method: 'template',
    });

    // Progress component
    files.push({
      path: 'frontend/src/components/ui/progress.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800", className)} {...props}>
        <div className="h-full bg-blue-600 transition-all dark:bg-blue-500" style={{ width: \`\${percentage}%\` }} />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
`,
      type: 'component',
      method: 'template',
    });

    // Avatar component
    files.push({
      path: 'frontend/src/components/ui/avatar.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
  )
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
  )
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800", className)} {...props} />
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
`,
      type: 'component',
      method: 'template',
    });

    // Tabs component
    files.push({
      path: 'frontend/src/components/ui/tabs.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue { value: string; onValueChange: (value: string) => void; }
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ value: controlledValue, defaultValue, onValueChange, className, children, ...props }: TabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const value = controlledValue ?? uncontrolledValue;
  const handleValueChange = (newValue: string) => { setUncontrolledValue(newValue); onValueChange?.(newValue); };
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("", className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400", className)} {...props} />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { value: string; }
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    return (
      <button ref={ref} onClick={() => context?.onValueChange(value)}
        className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
          isActive && "bg-white text-gray-950 shadow dark:bg-gray-950 dark:text-gray-50", className)} {...props} />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> { value: string; }
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (context?.value !== value) return null;
    return <div ref={ref} className={cn("mt-2", className)} {...props} />;
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
`,
      type: 'component',
      method: 'template',
    });

    // Table component
    files.push({
      path: 'frontend/src/components/ui/table.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-gray-100/50 font-medium dark:bg-gray-800/50", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("h-10 px-2 text-left align-middle font-medium text-gray-500 dark:text-gray-400", className)} {...props} />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn("p-2 align-middle", className)} {...props} />
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
  )
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
`,
      type: 'component',
      method: 'template',
    });

    // Skeleton component
    files.push({
      path: 'frontend/src/components/ui/skeleton.tsx',
      content: `import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)} {...props} />;
}

export { Skeleton };
`,
      type: 'component',
      method: 'template',
    });

    // ScrollArea component
    files.push({
      path: 'frontend/src/components/ui/scroll-area.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-auto", className)} {...props}>{children}</div>
  )
);
ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />
);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
`,
      type: 'component',
      method: 'template',
    });

    // DropdownMenu component
    files.push({
      path: 'frontend/src/components/ui/dropdown-menu.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue { open: boolean; setOpen: (open: boolean) => void; }
const DropdownContext = React.createContext<DropdownContextValue>({ open: false, setOpen: () => {} });

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ className, children, asChild, ...props }, ref) => {
    const { setOpen, open } = React.useContext(DropdownContext);
    const handleClick = () => setOpen(!open);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { onClick: handleClick, ref } as any);
    }
    return <button ref={ref} onClick={handleClick} className={className} {...props}>{children}</button>;
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownContext);
    if (!open) return null;
    return (
      <>
        <div className="fixed inset-0" onClick={() => setOpen(false)} />
        <div ref={ref} className={cn("absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md dark:bg-gray-950", className)} {...props} />
      </>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownContext);
    return <div ref={ref} onClick={() => setOpen(false)} className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800", className)} {...props} />;
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-800", className)} {...props} />
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
`,
      type: 'component',
      method: 'template',
    });

    // Switch component
    files.push({
      path: 'frontend/src/components/ui/switch.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button type="button" role="switch" aria-checked={checked} ref={ref} onClick={() => onCheckedChange?.(!checked)}
        className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
          checked ? "bg-gray-900 dark:bg-gray-50" : "bg-gray-200 dark:bg-gray-800", className)} {...props}>
        <span className={cn("pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform dark:bg-gray-950",
          checked ? "translate-x-4" : "translate-x-0")} />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
`,
      type: 'component',
      method: 'template',
    });

    // Separator component
    files.push({
      path: 'frontend/src/components/ui/separator.tsx',
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0 bg-gray-200 dark:bg-gray-800",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />
  )
);
Separator.displayName = "Separator";

export { Separator };
`,
      type: 'component',
      method: 'template',
    });

OLD EMBEDDED UI COMPONENTS REMOVED - END */

  /**
   * Generate a page component - STRICTLY from definitions only
   * No fallbacks, no guessing - if definition is missing, generate error page
   * All pages including auth must come from UI component generators in the registry
   */
  private generatePage(
    page: PageInstance,
    components: Map<string, ComponentDefinition>
  ): GeneratedFile {
    const componentName = this.toComponentName(page.id);
    const templateId = (page as any).templateId || page.id.toLowerCase();
    const route = page.route.toLowerCase();

    // PRIORITY 1: Pages with explicit components array (landing pages, multi-component pages)
    // These pages define their own components and should be generated from those definitions
    const pageComponents = page.components || [];
    if (pageComponents.length > 0) {
      const content = this.generatePageFromComponentDefinitions(page, components);
      if (content) {
        return {
          path: `frontend/src/pages/${componentName}.tsx`,
          content,
          type: 'component',
          method: 'template',
        };
      }
    }

    // PRIORITY 2: Try to get component type from template registry
    // This includes auth pages (login, register, forgot-password, reset-password, etc.)
    const componentType = getComponentTypeFromTemplate(templateId);

    if (componentType) {
      const generator = getComponentGenerator(componentType);
      if (generator) {
        const entity = this.inferEntityFromPage(page);
        const entityDef = this.getEntity(entity);

        const resolved = {
          componentType,
          dataSource: entity,
          fieldMappings: entityDef?.fields?.map(f => ({
            targetField: f.name,
            sourceField: f.name,
            fallback: undefined,
          })) || [],
          warnings: [],
          componentTitle: page.title,
          entityName: entity,
          fields: entityDef?.fields || [],
          uiStyle: {
            variant: this.config.designVariant,
            colorScheme: this.config.colorScheme,
          },
          data: { entity },
          props: { entity },
        };

        try {
          const content = generator(resolved as any);
          return {
            path: `frontend/src/pages/${componentName}.tsx`,
            content,
            type: 'component',
            method: 'template',
          };
        } catch (error) {
          console.error(`Generator error for ${componentType}:`, error);
        }
      }
    }

    // PRIORITY 3: NO FALLBACK - Throw error for missing definition
    // This allows batch testing all app types to find missing definitions
    throw new Error(
      `[APP-BUILDER] Missing page definition.\n` +
      `  Template ID: ${templateId}\n` +
      `  Route: ${route}\n` +
      `  Page ID: ${page.id}\n` +
      `  App Type: ${this.currentAppType}\n` +
      `  Add this template to the component registry or define page components.`
    );
  }

  /**
   * Generate page from component definitions only - no guessing
   */
  private generatePageFromComponentDefinitions(
    page: PageInstance,
    components: Map<string, ComponentDefinition>
  ): string | null {
    const componentName = this.toComponentName(page.id);
    const pageComponents = page.components || [];
    const entity = this.inferEntityFromPage(page);
    const entityDef = this.getEntity(entity);

    const componentCodes: string[] = [];
    const imports: Set<string> = new Set();

    imports.add("import { useQuery, useQueryClient } from '@tanstack/react-query';");
    imports.add("import { Link, useNavigate, useParams } from 'react-router-dom';");
    imports.add("import { get, post, put, del } from '../lib/api';");

    // Basic UI component types that should be skipped for multi-component pages
    // These should use shared UI components from @/components/ui/ instead
    const basicUIComponentTypes = new Set([
      'INPUT', 'BUTTON', 'LABEL', 'SELECT', 'CHECKBOX', 'TEXTAREA', 'CARD', 'BADGE'
    ]);

    for (const comp of pageComponents) {
      const compId = typeof comp === 'string' ? comp : comp.componentId;
      const componentType = getComponentTypeFromId(compId);

      // Skip basic UI components when generating multi-component pages
      if (pageComponents.length > 1 && componentType && basicUIComponentTypes.has(componentType)) {
        continue;
      }

      if (componentType) {
        const generator = getComponentGenerator(componentType);
        if (generator) {
          try {
            const resolved = {
              componentType,
              dataSource: entity,
              fieldMappings: entityDef?.fields?.map(f => ({
                targetField: f.name,
                sourceField: f.name,
                fallback: undefined,
              })) || [],
              warnings: [],
              componentTitle: page.title,
              entityName: entity,
              fields: entityDef?.fields || [],
              uiStyle: {
                variant: this.config.designVariant,
                colorScheme: this.config.colorScheme,
              },
              // Pass entity in data and props for generators that expect it there
              data: { entity },
              props: { entity },
            };
            const code = generator(resolved as any);
            componentCodes.push(code);
          } catch (error) {
            console.error(`Error generating component ${compId}:`, error);
          }
        }
      }
    }

    if (componentCodes.length === 0) {
      return null; // No components generated - return null to trigger missing definition page
    }

    // Extract imports and component bodies from generated codes
    // Pattern handles both single-line and multi-line imports:
    // - Single-line: import { X } from 'module';
    // - Multi-line: import {\n  X,\n  Y\n} from 'module';
    const importPattern = /^import\s+(?:type\s+)?(?:[\w*{}\s,]+from\s+)?['"][^'"]+['"];?\s*$/gm;
    const multiLineImportPattern = /^import\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm;

    // More robust: match import statements including multi-line ones
    const extractImports = (code: string): string[] => {
      const imports: string[] = [];
      // Match single-line imports
      const singleLineMatches = code.match(/^import\s+(?:type\s+)?(?:[\w*]+(?:\s*,\s*)?)?(?:\{[^}]+\})?\s*from\s+['"][^'"]+['"];?\s*$/gm) || [];
      imports.push(...singleLineMatches);

      // Match multi-line imports (import { ... } from 'module')
      const multiLineRegex = /import\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];?/g;
      const multiLineMatches = code.match(multiLineRegex) || [];
      imports.push(...multiLineMatches);

      // Match simple default imports (import X from 'module')
      const defaultImportMatches = code.match(/^import\s+\w+\s+from\s+['"][^'"]+['"];?\s*$/gm) || [];
      imports.push(...defaultImportMatches);

      // Match side-effect imports (import 'module')
      const sideEffectMatches = code.match(/^import\s+['"][^'"]+['"];?\s*$/gm) || [];
      imports.push(...sideEffectMatches);

      return imports;
    };

    // Pattern to remove all import statements including multi-line ones
    const removeImports = (code: string): string => {
      // Remove multi-line imports first
      let result = code.replace(/import\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];?\s*/g, '');
      // Remove single-line imports
      result = result.replace(/^import\s+.+from\s+['"][^'"]+['"];?\s*$/gm, '');
      // Remove side-effect imports
      result = result.replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '');
      return result.trim();
    };
    const cleanedCodes: string[] = [];
    const sectionComponents: { name: string; body: string; actualName: string }[] = [];

    // Helper to extract the actual component name from generated code
    const extractComponentName = (code: string): string | null => {
      // Pattern 1: export default function ComponentName
      const exportDefaultFuncMatch = code.match(/export\s+default\s+function\s+(\w+)/);
      if (exportDefaultFuncMatch) return exportDefaultFuncMatch[1];

      // Pattern 2: export default ComponentName (at end of file)
      const exportDefaultMatch = code.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
      if (exportDefaultMatch) return exportDefaultMatch[1];

      // Pattern 3: const ComponentName: React.FC = ... (look for the main component)
      const constFcMatch = code.match(/const\s+(\w+)\s*:\s*React\.FC/);
      if (constFcMatch) return constFcMatch[1];

      // Pattern 4: function ComponentName( - standalone function
      const funcMatch = code.match(/^function\s+(\w+)\s*\(/m);
      if (funcMatch) return funcMatch[1];

      // Pattern 5: const ComponentName = React.forwardRef
      const forwardRefMatch = code.match(/const\s+(\w+)\s*=\s*React\.forwardRef/);
      if (forwardRefMatch) return forwardRefMatch[1];

      return null;
    };

    // Basic UI component names that should be skipped if duplicated
    // These should be imported from @/components/ui/ instead
    const basicUIComponents = new Set(['Input', 'Button', 'Label', 'Select', 'Checkbox', 'Textarea', 'Card', 'Badge']);

    // Track used component names to detect and handle duplicates
    const usedNames = new Set<string>();

    for (let i = 0; i < componentCodes.length; i++) {
      const code = componentCodes[i];
      const codeImports = extractImports(code);
      codeImports.forEach(imp => imports.add(imp.trim()));

      // Extract the actual component name from the generated code
      let actualComponentName = extractComponentName(code);

      // Extract component name and body for composition
      const pageComp = pageComponents[i];
      const compId = typeof pageComp === 'string' ? pageComp : (pageComp as any).componentId as string;
      const sectionName = this.toPascalCase(compId) + 'Section';

      // Remove imports from code (including multi-line imports)
      let cleanCode = removeImports(code);

      // Check if this is a full component (has export default)
      if (/export\s+default/.test(cleanCode)) {
        // This is a self-contained component - use as-is for single-component pages
        cleanedCodes.push(cleanCode);
      }

      // Skip basic UI components that duplicate each other - they should be imported from shared UI
      if (actualComponentName && basicUIComponents.has(actualComponentName)) {
        if (usedNames.has(actualComponentName)) {
          // Skip this component entirely - it's a duplicate basic UI component
          continue;
        }
        // First occurrence of a basic UI component - still add it but may need to skip later
        usedNames.add(actualComponentName);
        // Don't add basic UI components to sectionComponents - they shouldn't be rendered
        // as sections, they're just utility components
        continue;
      }

      // Handle duplicate names by falling back to section name or using unique suffix
      let finalName = actualComponentName || sectionName;
      if (usedNames.has(finalName)) {
        // If the actual name conflicts, use the section name instead
        // And rename the component in the code
        finalName = sectionName;
        if (actualComponentName) {
          // Rename all occurrences of the old component name to the new name
          // Be careful to only rename the component definition, not other uses
          cleanCode = cleanCode
            .replace(new RegExp(`(const|function)\\s+${actualComponentName}(\\s*[:<(=])`, 'g'), `$1 ${finalName}$2`)
            .replace(new RegExp(`export\\s+default\\s+${actualComponentName}\\b`, 'g'), `export default ${finalName}`)
            .replace(new RegExp(`${actualComponentName}\\.displayName`, 'g'), `${finalName}.displayName`);
        }
      }
      usedNames.add(finalName);

      sectionComponents.push({
        name: sectionName,
        body: cleanCode,
        actualName: finalName
      });
    }

    // If only one component, return it directly with its original imports
    if (componentCodes.length === 1) {
      return componentCodes[0] || null;
    }

    // For multi-component pages (like landing pages), compose them into sections
    // Generate inline section components and render them all (componentName already declared above)

    // Add React to imports if not already present
    imports.add("import React from 'react';");

    // Deduplicate and merge imports
    const deduplicatedImports = this.deduplicateImports(imports);

    const composedPage = `${deduplicatedImports}

${sectionComponents.map(({ body, actualName }) => {
  // Remove export default statements so components can be used inline
  const cleanBody = body
    .replace(/export\s+default\s+function\s+\w+/, `function ${actualName}`)
    .replace(/export\s+default\s+\w+\s*;?\s*$/m, '') // Remove standalone export default at end
    .replace(/export\s+default\s+/, '');
  return cleanBody;
}).join('\n\n')}

export default function ${componentName}() {
  return (
    <div className="min-h-screen">
      ${sectionComponents.map(({ actualName }) => `<${actualName} />`).join('\n      ')}
    </div>
  );
}
`;

    return composedPage;
  }

  /**
   * Helper: Convert to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Helper: Deduplicate and merge imports from the same module
   * Handles merging default imports and named imports properly
   */
  private deduplicateImports(imports: Set<string>): string {
    // Parse imports into structured format
    // Map: module path -> { default: string | null, named: Set<string>, sideEffect: boolean }
    const importMap = new Map<string, { default: string | null; named: Set<string>; type: Set<string>; sideEffect: boolean }>();

    for (const imp of imports) {
      // Match import statements
      // Side-effect import: import 'module';
      const sideEffectMatch = imp.match(/^import\s+['"]([^'"]+)['"]/);
      if (sideEffectMatch && !imp.includes('from')) {
        const modulePath = sideEffectMatch[1];
        if (!importMap.has(modulePath)) {
          importMap.set(modulePath, { default: null, named: new Set(), type: new Set(), sideEffect: true });
        }
        continue;
      }

      // Normal imports: import X from 'y' or import { X } from 'y'
      const moduleMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
      if (!moduleMatch) continue;

      // Normalize path - convert relative paths to @/ aliases for deduplication
      let modulePath = moduleMatch[1];
      // Convert ../lib/utils or ../../lib/utils to @/lib/utils
      if (modulePath.match(/^\.\.\/.*lib\/utils$/)) {
        modulePath = '@/lib/utils';
      }
      // Convert ../lib/api or ../../lib/api to @/lib/api
      if (modulePath.match(/^\.\.\/.*lib\/api$/)) {
        modulePath = '@/lib/api';
      }
      // Convert ../components/ui/* to @/components/ui/*
      if (modulePath.match(/^\.\.\/.*components\/ui\//)) {
        const componentName = modulePath.match(/components\/ui\/(.+)$/)?.[1];
        if (componentName) {
          modulePath = `@/components/ui/${componentName}`;
        }
      }
      // Convert ../contexts/* to @/contexts/*
      if (modulePath.match(/^\.\.\/.*contexts\//)) {
        const contextName = modulePath.match(/contexts\/(.+)$/)?.[1];
        if (contextName) {
          modulePath = `@/contexts/${contextName}`;
        }
      }

      if (!importMap.has(modulePath)) {
        importMap.set(modulePath, { default: null, named: new Set(), type: new Set(), sideEffect: false });
      }
      const entry = importMap.get(modulePath)!;

      // Check for type imports: import type { X } from 'y'
      const isTypeImport = imp.includes('import type');

      // Extract default import: import React from 'react'
      const defaultMatch = imp.match(/^import\s+(\w+)(?:\s*,|\s+from)/);
      if (defaultMatch && defaultMatch[1] !== 'type') {
        entry.default = defaultMatch[1];
      }

      // Extract named imports: import { X, Y } from 'z' or import React, { X, Y } from 'z'
      const namedMatch = imp.match(/\{\s*([^}]+)\s*\}/);
      if (namedMatch) {
        const namedImports = namedMatch[1].split(',').map(n => n.trim()).filter(n => n);
        for (const named of namedImports) {
          if (isTypeImport) {
            entry.type.add(named);
          } else {
            entry.named.add(named);
          }
        }
      }
    }

    // Rebuild import statements
    const result: string[] = [];
    for (const [modulePath, entry] of importMap) {
      if (entry.sideEffect && !entry.default && entry.named.size === 0 && entry.type.size === 0) {
        result.push(`import '${modulePath}';`);
        continue;
      }

      const parts: string[] = [];
      if (entry.default) {
        parts.push(entry.default);
      }
      if (entry.named.size > 0) {
        parts.push(`{ ${Array.from(entry.named).sort().join(', ')} }`);
      }

      if (parts.length > 0) {
        result.push(`import ${parts.join(', ')} from '${modulePath}';`);
      }

      // Separate type imports
      if (entry.type.size > 0) {
        result.push(`import type { ${Array.from(entry.type).sort().join(', ')} } from '${modulePath}';`);
      }
    }

    // Sort imports: react first, then @/ imports, then relative imports, then others
    result.sort((a, b) => {
      const getOrder = (imp: string): number => {
        if (imp.includes("'react'") || imp.includes('"react"')) return 0;
        if (imp.includes("'react-")) return 1;
        if (imp.includes("'@tanstack")) return 2;
        if (imp.includes("'@/")) return 3;
        if (imp.includes("'lucide-")) return 4;
        if (imp.includes("'../") || imp.includes("'./")) return 5;
        return 3;
      };
      return getOrder(a) - getOrder(b);
    });

    return result.join('\n');
  }

  // ─────────────────────────────────────────────────────────────
  // REMOVED: Embedded page generators
  // All pages (including auth: login, register, forgot-password, reset-password)
  // now come from UI component generators in:
  //   generators/react-components/ui/react/auth/
  //   generators/react-components/ui/react/user/
  //   etc.
  // Registered in component.registry.ts - NO embedded code here
  // ─────────────────────────────────────────────────────────────

  /**
   * Generate Layout component
   */
  private generateLayout(): GeneratedFile {
    const content = `import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {isAuthenticated && <Sidebar />}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
`;

    return {
      path: 'frontend/src/components/Layout.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate Header component
   */
  private generateHeader(appName: string): GeneratedFile {
    const content = `import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            ${appName}
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
`;

    return {
      path: 'frontend/src/components/Header.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate Sidebar component with navigation items from pages
   */
  private generateSidebar(pages: PageInstance[]): GeneratedFile {
    // Auth-related routes that should NOT appear in sidebar
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];

    // Filter pages for frontend section and exclude:
    // - Detail pages (with :id params)
    // - Home page
    // - Auth-related pages
    const navPages = pages.filter(
      (p) =>
        p.section === 'frontend' &&
        !p.route.includes(':') &&
        p.route !== '/' &&
        !authRoutes.some(authRoute => p.route.startsWith(authRoute))
    );

    // Generate nav items from pages
    const navItems = navPages.map((page) => {
      const icon = this.getIconForPage(page);
      return `  { path: '${page.route}', label: '${page.title}', icon: '${icon}' },`;
    });

    const content = `import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  List,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  ShoppingCart,
  Package,
  Search,
  Heart,
  CreditCard,
  FileText,
  PenSquare,
  Tag,
  MessageSquare,
  Bookmark,
  Calendar,
  Image
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  timer: Clock,
  list: List,
  folder: FolderOpen,
  chart: BarChart3,
  users: Users,
  settings: Settings,
  cart: ShoppingCart,
  package: Package,
  search: Search,
  heart: Heart,
  payment: CreditCard,
  blog: FileText,
  write: PenSquare,
  category: Tag,
  categories: Tag,
  comments: MessageSquare,
  bookmark: Bookmark,
  calendar: Calendar,
  gallery: Image,
};

const navItems = [
${navItems.join('\n')}
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors \${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }\`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
`;

    return {
      path: 'frontend/src/components/Sidebar.tsx',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Get icon name for a page based on its templateId or route
   */
  private getIconForPage(page: PageInstance): string {
    const templateId = (page as any).templateId || '';
    const route = page.route.toLowerCase();
    const title = page.title.toLowerCase();

    // Match by templateId first
    if (templateId.includes('dashboard')) return 'dashboard';
    if (templateId.includes('timer')) return 'timer';
    if (templateId.includes('time-entr')) return 'list';
    if (templateId.includes('project')) return 'folder';
    if (templateId.includes('report')) return 'chart';
    if (templateId.includes('client')) return 'users';
    if (templateId.includes('setting')) return 'settings';
    if (templateId.includes('cart')) return 'cart';
    if (templateId.includes('product')) return 'package';
    if (templateId.includes('search')) return 'search';
    if (templateId.includes('wishlist') || templateId.includes('favorite')) return 'heart';
    if (templateId.includes('checkout') || templateId.includes('payment')) return 'payment';
    if (templateId.includes('blog') || templateId.includes('post')) return 'blog';
    if (templateId.includes('write') || templateId.includes('editor')) return 'write';
    if (templateId.includes('categor')) return 'categories';
    if (templateId.includes('comment')) return 'comments';

    // Fallback to route matching
    if (route.includes('dashboard')) return 'dashboard';
    if (route.includes('timer')) return 'timer';
    if (route.includes('time')) return 'list';
    if (route.includes('project')) return 'folder';
    if (route.includes('report')) return 'chart';
    if (route.includes('client')) return 'users';
    if (route.includes('setting')) return 'settings';
    if (route.includes('cart')) return 'cart';
    if (route.includes('product')) return 'package';
    if (route.includes('search')) return 'search';
    if (route.includes('write')) return 'write';
    if (route.includes('blog') || route.includes('post')) return 'blog';
    if (route.includes('categor')) return 'categories';
    if (route.includes('comment')) return 'comments';
    if (route.includes('gallery') || route.includes('image')) return 'gallery';

    // Fallback to title matching
    if (title.includes('dashboard')) return 'dashboard';
    if (title.includes('timer')) return 'timer';
    if (title.includes('time')) return 'list';
    if (title.includes('project')) return 'folder';
    if (title.includes('report')) return 'chart';
    if (title.includes('client')) return 'users';
    if (title.includes('setting')) return 'settings';
    if (title.includes('write') || title.includes('new post') || title.includes('create')) return 'write';
    if (title.includes('blog') || title.includes('post')) return 'blog';
    if (title.includes('categor')) return 'categories';
    if (title.includes('comment')) return 'comments';

    return 'list';
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────

  private toComponentName(id: string): string {
    return pascalCase(id);
  }
}
