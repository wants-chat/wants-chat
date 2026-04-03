/**
 * AI Customization Service
 *
 * MINIMAL AI usage - ONLY for customization, NOT structure generation.
 *
 * This service extracts customization details like:
 * - Branding (colors, fonts, styles)
 * - Content placeholders
 * - Feature-specific configurations
 *
 * It does NOT:
 * - Generate app structure
 * - Create database schemas
 * - Define component layouts
 * - Generate business logic
 *
 * All structural decisions are deterministic from the registries.
 */

import {
  AICustomizationRequest,
  AICustomizationResult,
  BrandingConfig,
  FeatureGenerationConfig,
  DesignVariant,
  ColorScheme,
} from '../interfaces/generation.interface';

// Default branding palette
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

// Design variant patterns for extraction
const VARIANT_PATTERNS: Record<string, DesignVariant> = {
  'glassmorphism': 'glassmorphism',
  'glass': 'glassmorphism',
  'frosted': 'glassmorphism',
  'blur': 'glassmorphism',
  'neumorphism': 'neumorphism',
  'neumorphic': 'neumorphism',
  'soft ui': 'neumorphism',
  'brutalist': 'brutalist',
  'brutal': 'brutalist',
  'bold': 'bold',
  'corporate': 'corporate',
  'business': 'corporate',
  'professional': 'corporate',
  'creative': 'creative',
  'playful': 'creative',
  'fun': 'creative',
  'modern': 'modern',
  'sleek': 'modern',
  'clean': 'minimal',
  'minimal': 'minimal',
  'minimalist': 'minimal',
  'simple': 'minimal',
  'classic': 'classic',
  'traditional': 'classic',
};

// Industry-specific color presets
const INDUSTRY_PRESETS: Record<string, Partial<BrandingConfig>> = {
  ecommerce: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
  },
  healthcare: {
    primaryColor: '#0EA5E9',
    secondaryColor: '#22C55E',
    accentColor: '#8B5CF6',
  },
  finance: {
    primaryColor: '#1E40AF',
    secondaryColor: '#047857',
    accentColor: '#7C3AED',
  },
  education: {
    primaryColor: '#7C3AED',
    secondaryColor: '#0EA5E9',
    accentColor: '#F97316',
  },
  food: {
    primaryColor: '#EF4444',
    secondaryColor: '#F97316',
    accentColor: '#FBBF24',
  },
  travel: {
    primaryColor: '#0891B2',
    secondaryColor: '#059669',
    accentColor: '#F59E0B',
  },
  fitness: {
    primaryColor: '#DC2626',
    secondaryColor: '#16A34A',
    accentColor: '#2563EB',
  },
  realestate: {
    primaryColor: '#0F766E',
    secondaryColor: '#1D4ED8',
    accentColor: '#CA8A04',
  },
  social: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    accentColor: '#06B6D4',
  },
  blog: {
    primaryColor: '#1F2937',
    secondaryColor: '#4B5563',
    accentColor: '#3B82F6',
  },
};

// Color extraction patterns
const COLOR_PATTERNS = [
  { pattern: /(?:primary|main|brand)\s*(?:color)?[:\s]+([#\w]+)/i, key: 'primaryColor' },
  { pattern: /(?:secondary|accent)\s*(?:color)?[:\s]+([#\w]+)/i, key: 'secondaryColor' },
  { pattern: /(?:background|bg)\s*(?:color)?[:\s]+([#\w]+)/i, key: 'backgroundColor' },
  { pattern: /#[0-9A-Fa-f]{6}/g, key: 'extracted' },
];

// Named color mappings
const NAMED_COLORS: Record<string, string> = {
  red: '#EF4444',
  orange: '#F97316',
  amber: '#F59E0B',
  yellow: '#EAB308',
  lime: '#84CC16',
  green: '#22C55E',
  emerald: '#10B981',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  sky: '#0EA5E9',
  blue: '#3B82F6',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  purple: '#A855F7',
  fuchsia: '#D946EF',
  pink: '#EC4899',
  rose: '#F43F5E',
  slate: '#64748B',
  gray: '#6B7280',
  zinc: '#71717A',
  neutral: '#737373',
  stone: '#78716C',
  black: '#000000',
  white: '#FFFFFF',
};

export class AICustomizationService {
  /**
   * Extract customization from prompt - NO AI call, purely pattern matching
   */
  extractCustomization(request: AICustomizationRequest): AICustomizationResult {
    const { prompt, appType, enabledFeatures } = request;
    const promptLower = prompt.toLowerCase();

    // 1. Extract branding
    const branding = this.extractBranding(promptLower, appType);

    // 2. Extract design variant
    const designVariant = this.extractDesignVariant(promptLower);

    // 3. Extract color scheme
    const colorScheme = this.extractColorScheme(promptLower, branding.primaryColor);

    // 4. Extract feature-specific configs
    const featureConfigs = this.extractFeatureGenerationConfigs(promptLower, enabledFeatures);

    // 5. Extract app metadata
    const metadata = this.extractMetadata(prompt);

    // 6. Extract content suggestions
    const contentSuggestions = this.extractContentSuggestions(promptLower, appType);

    return {
      branding,
      designVariant,
      colorScheme,
      featureConfigs,
      metadata,
      contentSuggestions,
      confidence: this.calculateConfidence(branding, featureConfigs),
    };
  }

  /**
   * Extract design variant from prompt
   */
  private extractDesignVariant(prompt: string): DesignVariant {
    for (const [pattern, variant] of Object.entries(VARIANT_PATTERNS)) {
      if (prompt.includes(pattern)) {
        return variant;
      }
    }
    return 'minimal'; // Default variant
  }

  /**
   * Extract color scheme from prompt or branding color
   */
  private extractColorScheme(prompt: string, primaryColor: string): ColorScheme {
    // Check for explicit color scheme in prompt
    const colorSchemes: ColorScheme[] = ['blue', 'purple', 'green', 'orange', 'pink', 'indigo', 'teal', 'red', 'neutral', 'warm'];
    for (const scheme of colorSchemes) {
      if (prompt.includes(scheme)) {
        return scheme;
      }
    }

    // Map primary color to color scheme
    const colorToScheme: Record<string, ColorScheme> = {
      '#3B82F6': 'blue',
      '#2563EB': 'blue',
      '#1D4ED8': 'blue',
      '#8B5CF6': 'purple',
      '#7C3AED': 'purple',
      '#A855F7': 'purple',
      '#22C55E': 'green',
      '#16A34A': 'green',
      '#10B981': 'green',
      '#F97316': 'orange',
      '#EA580C': 'orange',
      '#F59E0B': 'warm',
      '#EC4899': 'pink',
      '#DB2777': 'pink',
      '#6366F1': 'indigo',
      '#4F46E5': 'indigo',
      '#14B8A6': 'teal',
      '#0D9488': 'teal',
      '#0891B2': 'teal',
      '#EF4444': 'red',
      '#DC2626': 'red',
      '#6B7280': 'neutral',
      '#64748B': 'neutral',
    };

    return colorToScheme[primaryColor.toUpperCase()] || 'blue';
  }

  /**
   * Extract branding from prompt
   */
  private extractBranding(prompt: string, appType: string): BrandingConfig {
    const branding = { ...DEFAULT_BRANDING };

    // Apply industry preset if available
    const preset = INDUSTRY_PRESETS[appType];
    if (preset) {
      Object.assign(branding, preset);
    }

    // Extract explicit colors from prompt
    let foundPrimaryColor = false;
    for (const [colorName, hex] of Object.entries(NAMED_COLORS)) {
      if (prompt.includes(colorName)) {
        // Check context for color role
        if (prompt.includes(`${colorName} theme`) || prompt.includes(`${colorName} primary`) || prompt.includes(`${colorName} color`)) {
          branding.primaryColor = hex;
          foundPrimaryColor = true;
        } else if (prompt.includes(`${colorName} accent`) || prompt.includes(`${colorName} secondary`)) {
          branding.accentColor = hex;
        } else if (!foundPrimaryColor) {
          // If no explicit context, use first color found as primary
          branding.primaryColor = hex;
          foundPrimaryColor = true;
        }
      }
    }

    // Extract hex colors
    const hexMatches = prompt.match(/#[0-9A-Fa-f]{6}/g);
    if (hexMatches && hexMatches.length > 0) {
      branding.primaryColor = hexMatches[0];
      if (hexMatches.length > 1) {
        branding.secondaryColor = hexMatches[1];
      }
      if (hexMatches.length > 2) {
        branding.accentColor = hexMatches[2];
      }
    }

    // Extract font preferences
    if (prompt.includes('modern') || prompt.includes('clean')) {
      branding.fontFamily = 'Inter, system-ui, sans-serif';
    } else if (prompt.includes('classic') || prompt.includes('traditional')) {
      branding.fontFamily = 'Georgia, serif';
    } else if (prompt.includes('playful') || prompt.includes('fun')) {
      branding.fontFamily = 'Poppins, sans-serif';
    } else if (prompt.includes('professional') || prompt.includes('corporate')) {
      branding.fontFamily = 'Source Sans Pro, sans-serif';
    }

    // Extract border radius preference
    if (prompt.includes('rounded') || prompt.includes('soft')) {
      branding.borderRadius = '12px';
    } else if (prompt.includes('sharp') || prompt.includes('square')) {
      branding.borderRadius = '0px';
    }

    // Dark mode detection
    if (prompt.includes('dark mode') || prompt.includes('dark theme')) {
      branding.backgroundColor = '#1F2937';
      branding.textColor = '#F9FAFB';
    }

    return branding;
  }

  /**
   * Extract feature-specific configurations
   */
  private extractFeatureGenerationConfigs(
    prompt: string,
    enabledFeatures: string[]
  ): FeatureGenerationConfig[] {
    const configs: FeatureGenerationConfig[] = [];

    for (const featureId of enabledFeatures) {
      const config = this.extractConfigForFeature(prompt, featureId);
      if (config) {
        configs.push(config);
      }
    }

    return configs;
  }

  /**
   * Extract config for a specific feature
   */
  private extractConfigForFeature(prompt: string, featureId: string): FeatureGenerationConfig | null {
    switch (featureId) {
      case 'user-auth':
        return {
          featureId,
          settings: {
            enableSocialLogin: prompt.includes('social login') || prompt.includes('google login'),
            requireEmailVerification: !prompt.includes('no verification'),
            sessionDuration: prompt.includes('remember me') ? 30 : 7,
          },
        };

      case 'product-catalog':
        return {
          featureId,
          settings: {
            enableVariants: prompt.includes('variant') || prompt.includes('size') || prompt.includes('color'),
            trackInventory: !prompt.includes('no inventory') && !prompt.includes('digital'),
            showReviews: prompt.includes('review'),
          },
        };

      case 'shopping-cart':
        return {
          featureId,
          settings: {
            enableCoupons: prompt.includes('coupon') || prompt.includes('discount'),
            enableGuestCheckout: prompt.includes('guest checkout'),
            enableSavedCarts: prompt.includes('save cart') || prompt.includes('wishlist'),
          },
        };

      case 'payments':
        return {
          featureId,
          settings: {
            providers: this.extractPaymentProviders(prompt),
            enableSubscriptions: prompt.includes('subscription') || prompt.includes('recurring'),
            enableRefunds: !prompt.includes('no refund'),
          },
        };

      case 'search':
        return {
          featureId,
          settings: {
            enableFilters: !prompt.includes('simple search'),
            enableAutocomplete: !prompt.includes('no autocomplete'),
            searchEntities: prompt.includes('search everything') ? 'all' : 'products',
          },
        };

      case 'blog':
        return {
          featureId,
          settings: {
            enableComments: !prompt.includes('no comment'),
            enableCategories: !prompt.includes('no categor'),
            enableTags: !prompt.includes('no tag'),
          },
        };

      case 'booking':
        return {
          featureId,
          settings: {
            enableRecurring: prompt.includes('recurring') || prompt.includes('weekly'),
            enableCancellation: !prompt.includes('no cancel'),
            slotDuration: this.extractDuration(prompt),
          },
        };

      default:
        return null;
    }
  }

  /**
   * Extract payment providers from prompt
   */
  private extractPaymentProviders(prompt: string): string[] {
    const providers: string[] = [];

    if (prompt.includes('stripe')) providers.push('stripe');
    if (prompt.includes('paypal')) providers.push('paypal');
    if (prompt.includes('square')) providers.push('square');
    if (prompt.includes('razorpay')) providers.push('razorpay');

    // Default to stripe if none specified
    if (providers.length === 0) {
      providers.push('stripe');
    }

    return providers;
  }

  /**
   * Extract duration value from prompt
   */
  private extractDuration(prompt: string): number {
    const match = prompt.match(/(\d+)\s*(?:minute|min|hour|hr)/i);
    if (match) {
      const value = parseInt(match[1]);
      if (prompt.includes('hour') || prompt.includes('hr')) {
        return value * 60;
      }
      return value;
    }
    return 60; // Default 60 minutes
  }

  /**
   * Extract app metadata from prompt
   */
  private extractMetadata(prompt: string): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Extract app name (look for quoted text or "called X" pattern)
    const nameMatch = prompt.match(/(?:called|named|create)\s+["']?(\w+(?:\s+\w+)*)["']?/i);
    if (nameMatch) {
      metadata.appName = nameMatch[1];
    }

    // Extract description
    const descMatch = prompt.match(/(?:for|that|which)\s+(.+?)(?:\.|,|with|and|$)/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    // Extract target audience
    if (prompt.includes('small business')) {
      metadata.targetAudience = 'small-business';
    } else if (prompt.includes('enterprise')) {
      metadata.targetAudience = 'enterprise';
    } else if (prompt.includes('startup')) {
      metadata.targetAudience = 'startup';
    }

    return metadata;
  }

  /**
   * Extract content suggestions based on app type
   */
  private extractContentSuggestions(
    prompt: string,
    appType: string
  ): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};

    switch (appType) {
      case 'ecommerce':
        suggestions.categories = this.extractListFromPrompt(prompt, 'categor');
        suggestions.products = this.extractListFromPrompt(prompt, 'product');
        break;

      case 'blog':
        suggestions.categories = this.extractListFromPrompt(prompt, 'topic');
        suggestions.tags = this.extractListFromPrompt(prompt, 'tag');
        break;

      case 'booking':
        suggestions.services = this.extractListFromPrompt(prompt, 'service');
        suggestions.durations = this.extractListFromPrompt(prompt, 'duration');
        break;

      case 'crm':
        suggestions.stages = this.extractListFromPrompt(prompt, 'stage');
        suggestions.statuses = ['lead', 'prospect', 'customer', 'churned'];
        break;
    }

    return suggestions;
  }

  /**
   * Extract list items from prompt
   */
  private extractListFromPrompt(prompt: string, keyword: string): string[] {
    const items: string[] = [];

    // Look for "X, Y, and Z" patterns
    const listMatch = prompt.match(new RegExp(`${keyword}[^:]*:\\s*([^.]+)`, 'i'));
    if (listMatch) {
      const parts = listMatch[1].split(/,\s*(?:and\s*)?/);
      items.push(...parts.map(p => p.trim()).filter(p => p.length > 0));
    }

    return items;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    branding: BrandingConfig,
    featureConfigs: FeatureGenerationConfig[]
  ): number {
    let score = 0.5; // Base confidence

    // Increase if explicit branding was found
    if (branding.primaryColor !== DEFAULT_BRANDING.primaryColor) {
      score += 0.15;
    }

    // Increase for each feature config
    score += Math.min(featureConfigs.length * 0.05, 0.25);

    return Math.min(score, 1.0);
  }

  /**
   * Generate CSS variables from branding config
   */
  generateCSSVariables(branding: BrandingConfig): string {
    return `
:root {
  --color-primary: ${branding.primaryColor};
  --color-secondary: ${branding.secondaryColor};
  --color-accent: ${branding.accentColor};
  --color-background: ${branding.backgroundColor};
  --color-text: ${branding.textColor};
  --font-family: ${branding.fontFamily};
  --border-radius: ${branding.borderRadius};
}
`.trim();
  }

  /**
   * Generate Tailwind config from branding
   */
  generateTailwindColors(branding: BrandingConfig): Record<string, string> {
    return {
      primary: branding.primaryColor,
      secondary: branding.secondaryColor,
      accent: branding.accentColor,
    };
  }
}
