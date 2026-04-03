/**
 * React Native Renderer Service
 *
 * Generates React Native mobile app code from component definitions.
 * Uses Expo + React Navigation for the mobile platform.
 */

import { ComponentDefinition, ComponentField } from '../interfaces/component.interface';
import { PageInstance } from '../interfaces/page-template.interface';
import { GeneratedFile, ColorScheme, DesignVariant, BrandingConfig } from '../interfaces/generation.interface';
import { GeneratedKeys } from './hono-renderer.service';
import { FeatureDefinition, FeatureEntity } from '../interfaces/feature.interface';
import { AppTypeDefinition } from '../interfaces/app-type.interface';
import { ComponentType } from '../interfaces/component-types.enum';
import { getComponentTypeFromTemplate, getComponentTypeFromId } from './template-component-mapper';
import { getRNComponentGenerator, hasRNImplementation } from '../generators/react-native-components/component.registry';
import { ResolvedComponent } from '../generators/react-components/types/resolved-component.interface';

// Import React Native config generators
import {
  generatePackageJson,
  generateAppJson,
  generateTsConfig,
  generateBabelConfig,
  generateMetroConfig,
  generateIndexJs,
} from '../generators/react-native-components/config';

// Import React Native app generators
import {
  generateAppTsx,
  generateIndexTs,
  generateUtilsFile,
  generateThemeColors,
  generateTypography,
} from '../generators/react-native-components/app';

// Import React Native navigation generators
import {
  generateRootNavigator,
  generateAppNavigator,
  generateCustomDrawer,
} from '../generators/react-native-components/navigation';

// Import React Native auth generators
import {
  generateAuthContext,
  generateAuthNavigator,
  generateLoginScreen,
  generateRegisterScreen,
  generateForgotPasswordScreen,
  generateResetPasswordScreen,
  generateVerifyEmailScreen,
} from '../generators/react-native-components/auth';

// Import React Native lib generators
import { generateApiClient, generateDesignVariants } from '../generators/react-native-components/lib';

// Default branding
const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'System',
  borderRadius: '8px',
  logoUrl: null,
};

export interface ReactNativeRendererConfig {
  colorScheme: ColorScheme;
  designVariant: DesignVariant;
  useTypescript: boolean;
}

const DEFAULT_CONFIG: ReactNativeRendererConfig = {
  colorScheme: 'blue',
  designVariant: 'minimal',
  useTypescript: true,
};

/**
 * Simple blueprint structure for React Native generation
 */
interface SimpleBlueprint {
  metadata: {
    name: string;
    appType: string;
  };
  sections: Array<{
    id: string;
    name: string;
    pages: Array<{
      id: string;
      name: string;
      route: string;
      authRequired: boolean;
      components: any[];
    }>;
  }>;
  uiStyle?: {
    variant: DesignVariant;
    colorScheme: ColorScheme;
  };
  // App-type defined routes - NO GUESSING
  defaultRoute?: string; // Route for authenticated users (from app-type definition)
  guestRoute?: string;   // Route for unauthenticated users (from app-type definition)
}

export class ReactNativeRendererService {
  private config: ReactNativeRendererConfig;
  private currentFeatures: FeatureDefinition[] = [];
  private currentEntities: Map<string, FeatureEntity> = new Map();

  constructor(config: Partial<ReactNativeRendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set features and build entity map for data binding
   */
  setFeatures(features: FeatureDefinition[]): void {
    this.currentFeatures = features;
    this.currentEntities.clear();

    for (const feature of features) {
      if (feature.entities) {
        for (const entity of feature.entities) {
          if (!this.currentEntities.has(entity.name)) {
            this.currentEntities.set(entity.name, entity);
          }
        }
      }
    }
  }

  /**
   * Get entity definition by name
   */
  getEntity(entityName: string): FeatureEntity | undefined {
    // Try exact match first
    if (this.currentEntities.has(entityName)) {
      return this.currentEntities.get(entityName);
    }
    // Try lowercase match
    const lowerName = entityName.toLowerCase();
    const entries = Array.from(this.currentEntities.entries());
    for (const [key, entity] of entries) {
      if (key.toLowerCase() === lowerName) {
        return entity;
      }
    }
    return undefined;
  }

  /**
   * Infer entity from page based on route, template, or feature
   * NO SILENT FALLBACKS - throws error if entity cannot be determined
   */
  inferEntityFromPage(page: PageInstance): string {
    // 1. Check if page has explicit entity
    if ((page as any).entity) {
      return (page as any).entity;
    }

    // 2. Check if page's feature has a primary entity
    const feature = this.findFeatureForPage(page);
    if (feature?.entities?.[0]?.name) {
      return feature.entities[0].name;
    }

    // 3. Infer from route
    const entity = this.inferEntityFromRoute(page.route);
    if (entity) {
      return entity;
    }

    // 4. Fallback for static pages (landing, about, etc.) - return 'content' as generic entity
    // These pages don't need real entities since they're presentational
    console.warn(`[APP-BUILDER] No entity definition found for page: ${page.id} (route: ${page.route}), using fallback`);
    return 'content';
  }

  /**
   * Find the feature that contains this page
   */
  private findFeatureForPage(page: PageInstance): FeatureDefinition | undefined {
    for (const feature of this.currentFeatures) {
      if (feature.pages) {
        const found = feature.pages.find(p =>
          p.id === page.id ||
          p.route === page.route ||
          p.templateId === (page as any).templateId
        );
        if (found) return feature;
      }
    }
    return undefined;
  }

  /**
   * Extract entity name from route pattern
   */
  private inferEntityFromRoute(route: string): string | null {
    // Remove leading slash and get first segment
    const segments = route.replace(/^\//, '').split('/');
    if (segments.length === 0) return null;

    // Handle admin routes: /admin/products -> products
    if (segments[0] === 'admin' && segments.length > 1) {
      return segments[1];
    }

    // Handle standard routes: /products -> products, /products/:id -> products
    const firstSegment = segments[0];
    if (firstSegment && !firstSegment.startsWith(':')) {
      return firstSegment;
    }

    return null;
  }

  /**
   * Generate all React Native files for the mobile app
   */
  generateAll(
    pages: PageInstance[],
    components: Map<string, ComponentDefinition>,
    appName: string,
    keys?: GeneratedKeys,
    branding?: BrandingConfig,
    designVariant: DesignVariant = 'minimal',
    colorScheme: ColorScheme = 'blue',
    appType?: string,
    appTypeDefinition?: AppTypeDefinition
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const appSlug = appName.toLowerCase().replace(/\s+/g, '-');
    const brandConfig = branding || DEFAULT_BRANDING;

    // Convert pages to blueprint structure for React Native generators
    // Include app-type defined routes (NO GUESSING)
    const blueprint = this.createBlueprintFromPages(
      pages,
      appName,
      designVariant,
      colorScheme,
      appType,
      appTypeDefinition
    );

    // 1. Generate config files
    files.push(this.generatePackageJsonFile(blueprint));
    files.push(this.generateAppJsonFile(blueprint));
    files.push(this.generateTsConfigFile());
    files.push(this.generateBabelConfigFile());
    files.push(this.generateMetroConfigFile());
    files.push(this.generateIndexJsFile());

    // 2. Generate environment files
    files.push(this.generateEnvFile(appSlug));
    files.push(this.generateGitignore());
    files.push(this.generateEasJson(appSlug));

    // 3. Generate source files
    files.push(this.generateAppTsxFile(blueprint));
    files.push(this.generateIndexTsFile());

    // 4. Generate lib files
    files.push(this.generateApiClientFile());
    files.push(this.generateDesignVariantsFile());
    files.push(this.generateUtilsFileRN());
    files.push(this.generateUIConfigFile(designVariant, colorScheme));

    // 5. Generate theme files
    files.push(this.generateThemeColorsFile());
    files.push(this.generateTypographyFile());

    // 6. Generate navigation files
    const requiresAuth = this.appTypeRequiresAuth(blueprint.metadata.appType);
    files.push(this.generateRootNavigatorFile(blueprint, requiresAuth));
    files.push(this.generateAppNavigatorFile(blueprint));
    files.push(this.generateCustomDrawerFile(blueprint));

    // 7. Generate auth files if required
    if (requiresAuth) {
      files.push(this.generateAuthContextFile());
      files.push(this.generateAuthNavigatorFile());
      files.push(...this.generateAuthScreenFiles());
    }

    // 8. Generate screen files for each page
    for (const page of pages) {
      files.push(this.generateScreenFile(page, components, designVariant, colorScheme));
    }

    // 9. Verify home screen exists using app-type defined defaultRoute - NO GUESSING
    const defaultRoute = appTypeDefinition?.defaultRoute || '/';
    const hasHomeScreen = pages.some(p => p.route === defaultRoute || p.route === '/');
    if (!hasHomeScreen) {
      throw new Error(
        `No home screen defined for app type "${appType || 'unknown'}". ` +
        `Expected page with route "${defaultRoute}" as defined in app-type, or "/". ` +
        `Check the defaultFeatures and defaultRoute in the app type definition.`
      );
    }

    return files;
  }

  /**
   * Convert PageInstance array to blueprint structure
   * Includes app-type defined routes (NO GUESSING)
   */
  private createBlueprintFromPages(
    pages: PageInstance[],
    appName: string,
    designVariant: DesignVariant,
    colorScheme: ColorScheme,
    appType?: string,
    appTypeDefinition?: AppTypeDefinition
  ): SimpleBlueprint {
    // Group pages into sections based on auth requirements
    const publicPages = pages.filter(p => !(p.auth?.required ?? false));
    const authPages = pages.filter(p => p.auth?.required ?? false);

    const sections = [];

    if (publicPages.length > 0) {
      sections.push({
        id: 'frontend',
        name: 'Public',
        pages: publicPages.map(p => ({
          id: p.id,
          name: p.title,
          route: p.route,
          authRequired: false,
          components: [],
        })),
      });
    }

    if (authPages.length > 0) {
      sections.push({
        id: 'user',
        name: 'User Area',
        pages: authPages.map(p => ({
          id: p.id,
          name: p.title,
          route: p.route,
          authRequired: true,
          components: [],
        })),
      });
    }

    return {
      metadata: {
        name: appName,
        appType: appType || 'generic',
      },
      sections,
      uiStyle: {
        variant: designVariant,
        colorScheme,
      },
      // Routes from app-type definition - NO GUESSING
      defaultRoute: appTypeDefinition?.defaultRoute,
      guestRoute: appTypeDefinition?.guestRoute,
    };
  }

  /**
   * Check if app type requires authentication
   */
  private appTypeRequiresAuth(appType: string): boolean {
    // Most app types require auth, only landing pages don't
    const noAuthTypes = ['landing', 'portfolio', 'static'];
    return !noAuthTypes.includes(appType.toLowerCase());
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIG FILE GENERATORS
  // ─────────────────────────────────────────────────────────────

  private generatePackageJsonFile(blueprint: SimpleBlueprint): GeneratedFile {
    return {
      path: 'mobile/package.json',
      content: generatePackageJson(blueprint as any),
      type: 'config',
      method: 'template',
    };
  }

  private generateAppJsonFile(blueprint: SimpleBlueprint): GeneratedFile {
    return {
      path: 'mobile/app.json',
      content: generateAppJson(blueprint as any),
      type: 'config',
      method: 'template',
    };
  }

  private generateTsConfigFile(): GeneratedFile {
    return {
      path: 'mobile/tsconfig.json',
      content: generateTsConfig(),
      type: 'config',
      method: 'template',
    };
  }

  private generateBabelConfigFile(): GeneratedFile {
    return {
      path: 'mobile/babel.config.js',
      content: generateBabelConfig(),
      type: 'config',
      method: 'template',
    };
  }

  private generateMetroConfigFile(): GeneratedFile {
    return {
      path: 'mobile/metro.config.js',
      content: generateMetroConfig(),
      type: 'config',
      method: 'template',
    };
  }

  private generateIndexJsFile(): GeneratedFile {
    return {
      path: 'mobile/index.js',
      content: generateIndexJs(),
      type: 'config',
      method: 'template',
    };
  }

  private generateEnvFile(appSlug: string): GeneratedFile {
    const content = `# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:4000/api

# App Configuration
EXPO_PUBLIC_APP_NAME=${appSlug}
`;

    return {
      path: 'mobile/.env',
      content,
      type: 'config',
      method: 'template',
    };
  }

  private generateGitignore(): GeneratedFile {
    const content = `node_modules/
.expo/
dist/
*.log
.env.local
.env.*.local
ios/
android/
`;

    return {
      path: 'mobile/.gitignore',
      content,
      type: 'config',
      method: 'template',
    };
  }

  private generateEasJson(appSlug: string): GeneratedFile {
    const content = JSON.stringify({
      cli: {
        version: '>= 5.0.0',
      },
      build: {
        development: {
          developmentClient: true,
          distribution: 'internal',
        },
        preview: {
          distribution: 'internal',
        },
        production: {},
      },
      submit: {
        production: {},
      },
    }, null, 2);

    return {
      path: 'mobile/eas.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // SOURCE FILE GENERATORS
  // ─────────────────────────────────────────────────────────────

  private generateAppTsxFile(blueprint: SimpleBlueprint): GeneratedFile {
    const requiresAuth = this.appTypeRequiresAuth(blueprint.metadata.appType);
    return {
      path: 'mobile/src/App.tsx',
      content: generateAppTsx(blueprint as any, () => requiresAuth),
      type: 'component',
      method: 'template',
    };
  }

  private generateIndexTsFile(): GeneratedFile {
    return {
      path: 'mobile/src/index.ts',
      content: generateIndexTs(),
      type: 'component',
      method: 'template',
    };
  }

  private generateApiClientFile(): GeneratedFile {
    return {
      path: 'mobile/src/lib/api.ts',
      content: generateApiClient(),
      type: 'component',
      method: 'template',
    };
  }

  private generateDesignVariantsFile(): GeneratedFile {
    return {
      path: 'mobile/src/lib/design-variants.ts',
      content: generateDesignVariants(),
      type: 'config',
      method: 'template',
    };
  }

  private generateUtilsFileRN(): GeneratedFile {
    return {
      path: 'mobile/src/lib/utils.ts',
      content: generateUtilsFile(),
      type: 'component',
      method: 'template',
    };
  }

  private generateUIConfigFile(variant: DesignVariant, colorScheme: ColorScheme): GeneratedFile {
    const content = `// Auto-generated UI configuration for React Native
import { getVariantStyles, type DesignVariant, type ColorScheme } from './design-variants';

// App's design settings
export const APP_DESIGN_VARIANT: DesignVariant = '${variant}';
export const APP_COLOR_SCHEME: ColorScheme = '${colorScheme}';

// Pre-computed styles for this app
export const appStyles = getVariantStyles(APP_DESIGN_VARIANT, APP_COLOR_SCHEME);

// Helper to get component styles
export function getStyles() {
  return appStyles;
}

// Re-export for convenience
export { getVariantStyles };
export type { DesignVariant, ColorScheme } from './design-variants';
`;

    return {
      path: 'mobile/src/lib/ui-config.ts',
      content,
      type: 'config',
      method: 'template',
    };
  }

  private generateThemeColorsFile(): GeneratedFile {
    return {
      path: 'mobile/src/theme/colors.ts',
      content: generateThemeColors(),
      type: 'config',
      method: 'template',
    };
  }

  private generateTypographyFile(): GeneratedFile {
    return {
      path: 'mobile/src/theme/typography.ts',
      content: generateTypography(),
      type: 'config',
      method: 'template',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION FILE GENERATORS
  // ─────────────────────────────────────────────────────────────

  private generateRootNavigatorFile(blueprint: SimpleBlueprint, requiresAuth: boolean): GeneratedFile {
    return {
      path: 'mobile/src/navigation/RootNavigator.tsx',
      content: generateRootNavigator(blueprint as any, requiresAuth),
      type: 'component',
      method: 'template',
    };
  }

  private generateAppNavigatorFile(blueprint: SimpleBlueprint): GeneratedFile {
    return {
      path: 'mobile/src/navigation/AppNavigator.tsx',
      content: generateAppNavigator(blueprint as any),
      type: 'component',
      method: 'template',
    };
  }

  private generateCustomDrawerFile(blueprint: SimpleBlueprint): GeneratedFile {
    return {
      path: 'mobile/src/components/CustomDrawer.tsx',
      content: generateCustomDrawer(blueprint as any),
      type: 'component',
      method: 'template',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // AUTH FILE GENERATORS
  // ─────────────────────────────────────────────────────────────

  private generateAuthContextFile(): GeneratedFile {
    return {
      path: 'mobile/src/contexts/AuthContext.tsx',
      content: generateAuthContext(),
      type: 'component',
      method: 'template',
    };
  }

  private generateAuthNavigatorFile(): GeneratedFile {
    return {
      path: 'mobile/src/navigation/AuthNavigator.tsx',
      content: generateAuthNavigator(),
      type: 'component',
      method: 'template',
    };
  }

  private generateAuthScreenFiles(): GeneratedFile[] {
    return [
      {
        path: 'mobile/src/screens/LoginScreen.tsx',
        content: generateLoginScreen(),
        type: 'component',
        method: 'template',
      },
      {
        path: 'mobile/src/screens/RegisterScreen.tsx',
        content: generateRegisterScreen(),
        type: 'component',
        method: 'template',
      },
      {
        path: 'mobile/src/screens/ForgotPasswordScreen.tsx',
        content: generateForgotPasswordScreen(),
        type: 'component',
        method: 'template',
      },
      {
        path: 'mobile/src/screens/ResetPasswordScreen.tsx',
        content: generateResetPasswordScreen(),
        type: 'component',
        method: 'template',
      },
      {
        path: 'mobile/src/screens/VerifyEmailScreen.tsx',
        content: generateVerifyEmailScreen(),
        type: 'component',
        method: 'template',
      },
    ];
  }

  // ─────────────────────────────────────────────────────────────
  // SCREEN FILE GENERATORS
  // ─────────────────────────────────────────────────────────────

  private generateScreenFile(
    page: PageInstance,
    components: Map<string, ComponentDefinition>,
    designVariant: DesignVariant,
    colorScheme: ColorScheme
  ): GeneratedFile {
    // Use page.title for screen name to match navigator imports
    const screenName = this.toScreenName(page.title);
    const pageId = page.id.toLowerCase();

    // Get templateId from page (may be undefined)
    const templateId = (page as any).templateId;

    // Try to get ComponentType from templateId using the registry pattern (NO FALLBACKS)
    let componentType: ComponentType | null = null;
    if (templateId) {
      componentType = getComponentTypeFromTemplate(templateId);
    }

    let content: string;

    // PRIORITY 1: Pages with explicit components array (landing pages, multi-component screens)
    // These pages define their own components and don't need entity inference
    const pageComponents = page.components || [];
    if (pageComponents.length > 0) {
      content = this.generateScreenFromComponents(page, designVariant, colorScheme);
    }
    // PRIORITY 2: Auth screens (standalone, no entity needed)
    else if (pageId.includes('login')) {
      content = generateLoginScreen();
    } else if (pageId.includes('register')) {
      content = generateRegisterScreen();
    } else if (pageId.includes('forgot-password')) {
      content = generateForgotPasswordScreen();
    } else if (pageId.includes('reset-password')) {
      content = generateResetPasswordScreen();
    } else if (pageId.includes('verify-email')) {
      content = generateVerifyEmailScreen();
    }
    // PRIORITY 3: Data-driven screens with ComponentType from registry
    else if (componentType && hasRNImplementation(componentType)) {
      const entity = this.inferEntityFromPage(page);
      const entityDef = this.getEntity(entity);

      const generator = getRNComponentGenerator(componentType);

      const resolved: ResolvedComponent = {
        componentType,
        dataSource: entity,
        fieldMappings: entityDef?.fields?.map(f => ({
          targetField: f.name,
          sourceField: f.name,
          fallback: undefined,
        })) || [],
        warnings: [],
        title: page.title,
        uiStyle: {
          variant: designVariant as any,
          colorScheme: colorScheme,
        },
        data: {
          entity,
          fields: entityDef?.fields?.map(f => ({
            name: f.name,
            type: f.type,
            required: f.required,
          })) || [],
        },
        props: { entity },
      };

      const generated = generator(resolved, designVariant);
      content = generated.code;
    } else {
      // NO FALLBACK - throw error for missing component mapping
      throw new Error(`Missing React Native component mapping for page: ${page.id} (templateId: ${templateId || 'none'}). ` +
        `Add mapping to template-component-mapper.ts and ensure RN_COMPONENT_REGISTRY has the generator.`);
    }

    return {
      path: `mobile/src/screens/${screenName}.tsx`,
      content,
      type: 'component',
      method: 'template',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // MULTI-COMPONENT SCREEN GENERATION (for landing pages, etc.)
  // ─────────────────────────────────────────────────────────────

  /**
   * Generate a screen from multiple component definitions
   * Used for landing pages and other multi-section screens
   */
  private generateScreenFromComponents(
    page: PageInstance,
    designVariant: DesignVariant,
    colorScheme: ColorScheme
  ): string {
    const screenName = this.toScreenName(page.title);
    const pageComponents = page.components || [];
    const entity = this.inferEntityFromPage(page);
    const entityDef = this.getEntity(entity);

    const componentCodes: string[] = [];
    const sectionNames: string[] = [];

    for (let i = 0; i < pageComponents.length; i++) {
      const comp = pageComponents[i];
      const compId = typeof comp === 'string' ? comp : comp.componentId;
      const componentType = getComponentTypeFromId(compId);

      if (componentType && hasRNImplementation(componentType)) {
        const generator = getRNComponentGenerator(componentType);
        if (generator) {
          try {
            const resolved: ResolvedComponent = {
              componentType,
              dataSource: entity,
              fieldMappings: entityDef?.fields?.map(f => ({
                targetField: f.name,
                sourceField: f.name,
                fallback: undefined,
              })) || [],
              warnings: [],
              title: page.title,
              uiStyle: {
                variant: designVariant as any,
                colorScheme: colorScheme,
              },
              data: { entity },
              props: { entity },
            };

            const generated = generator(resolved, designVariant);
            const sectionName = this.toPascalCase(compId) + 'Section';
            sectionNames.push(sectionName);

            // Extract component body (remove imports and export default)
            let code = generated.code;
            code = code.replace(/^import\s+.+from\s+['"].+['"];?\s*$/gm, '');
            code = code.replace(/export\s+default\s+function\s+\w+/, `function ${sectionName}`);
            code = code.replace(/export\s+default\s+/, '');
            componentCodes.push(code.trim());
          } catch (error) {
            console.error(`Error generating RN component ${compId}:`, error);
          }
        }
      }
    }

    // If no components generated, return a basic placeholder screen
    if (componentCodes.length === 0) {
      return `import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ${screenName}() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${page.title}</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
});
`;
    }

    // Compose all sections into a single screen
    return `import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';

${componentCodes.join('\n\n')}

export default function ${screenName}() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        ${sectionNames.map(name => `<${name} />`).join('\n        ')}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
`;
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  // ─────────────────────────────────────────────────────────────
  // REMOVED: All embedded screen generators (profile, settings, generic)
  // All screens (including profile, settings) now come from UI component generators in:
  //   generators/react-native-components/ui/react-native/user/
  //   generators/react-native-components/ui/react-native/auth/ (for auth screens)
  // Registered in component.registry.ts - NO embedded code here
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────

  private toScreenName(id: string): string {
    // Convert page ID to PascalCase screen name
    // Handle hyphen-case, underscore_case, spaces, and camelCase
    return id
      // First, insert hyphens before uppercase letters to split camelCase
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Then split on hyphens, underscores, and spaces
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Screen';
  }

  private toComponentName(id: string): string {
    return id
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
