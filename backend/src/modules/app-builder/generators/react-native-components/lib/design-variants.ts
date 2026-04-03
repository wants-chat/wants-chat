/**
 * React Native Design Variant System
 *
 * Similar to the web design variant system but using React Native StyleSheet
 * This provides consistent theming across mobile components
 */

export type DesignVariant =
  | 'glassmorphism'
  | 'neumorphism'
  | 'brutalist'
  | 'minimal'
  | 'corporate'
  | 'creative';

export type ColorScheme =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'pink'
  | 'indigo'
  | 'teal'
  | 'red'
  | 'neutral'
  | 'warm';

export interface VariantColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Background colors
  background: string;
  backgroundDark: string;

  // Text colors
  text: string;
  textSecondary: string;
  textLight: string;

  // Accent colors
  accent: string;
  accentDark: string;

  // Border colors
  border: string;
  borderLight: string;

  // Card/Surface colors
  surface: string;
  surfaceHover: string;

  // Button colors
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;

  // Badge colors
  badgeBg: string;
  badgeText: string;
}

/**
 * Get color palette based on color scheme
 */
function getColorPalette(colorScheme: ColorScheme): VariantColors {
  const palettes: Record<ColorScheme, VariantColors> = {
    blue: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      primaryLight: '#60a5fa',
      background: '#ffffff',
      backgroundDark: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#3b82f6',
      accentDark: '#1e40af',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      buttonBorder: '#3b82f6',
      badgeBg: '#dbeafe',
      badgeText: '#1e40af',
    },
    purple: {
      primary: '#9333ea',
      primaryDark: '#7e22ce',
      primaryLight: '#a855f7',
      background: '#ffffff',
      backgroundDark: '#faf5ff',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#9333ea',
      accentDark: '#6b21a8',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#faf5ff',
      buttonBg: '#9333ea',
      buttonText: '#ffffff',
      buttonBorder: '#9333ea',
      badgeBg: '#f3e8ff',
      badgeText: '#6b21a8',
    },
    green: {
      primary: '#10b981',
      primaryDark: '#059669',
      primaryLight: '#34d399',
      background: '#ffffff',
      backgroundDark: '#f0fdf4',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#10b981',
      accentDark: '#047857',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#f0fdf4',
      buttonBg: '#10b981',
      buttonText: '#ffffff',
      buttonBorder: '#10b981',
      badgeBg: '#d1fae5',
      badgeText: '#065f46',
    },
    orange: {
      primary: '#f97316',
      primaryDark: '#ea580c',
      primaryLight: '#fb923c',
      background: '#ffffff',
      backgroundDark: '#fff7ed',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#f97316',
      accentDark: '#c2410c',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#fff7ed',
      buttonBg: '#f97316',
      buttonText: '#ffffff',
      buttonBorder: '#f97316',
      badgeBg: '#ffedd5',
      badgeText: '#9a3412',
    },
    pink: {
      primary: '#ec4899',
      primaryDark: '#db2777',
      primaryLight: '#f472b6',
      background: '#ffffff',
      backgroundDark: '#fdf2f8',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#ec4899',
      accentDark: '#be185d',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#fdf2f8',
      buttonBg: '#ec4899',
      buttonText: '#ffffff',
      buttonBorder: '#ec4899',
      badgeBg: '#fce7f3',
      badgeText: '#9f1239',
    },
    indigo: {
      primary: '#6366f1',
      primaryDark: '#4f46e5',
      primaryLight: '#818cf8',
      background: '#ffffff',
      backgroundDark: '#eef2ff',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#6366f1',
      accentDark: '#3730a3',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#eef2ff',
      buttonBg: '#6366f1',
      buttonText: '#ffffff',
      buttonBorder: '#6366f1',
      badgeBg: '#e0e7ff',
      badgeText: '#3730a3',
    },
    teal: {
      primary: '#14b8a6',
      primaryDark: '#0d9488',
      primaryLight: '#2dd4bf',
      background: '#ffffff',
      backgroundDark: '#f0fdfa',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#14b8a6',
      accentDark: '#115e59',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#f0fdfa',
      buttonBg: '#14b8a6',
      buttonText: '#ffffff',
      buttonBorder: '#14b8a6',
      badgeBg: '#ccfbf1',
      badgeText: '#134e4a',
    },
    red: {
      primary: '#ef4444',
      primaryDark: '#dc2626',
      primaryLight: '#f87171',
      background: '#ffffff',
      backgroundDark: '#fef2f2',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#ef4444',
      accentDark: '#991b1b',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#fef2f2',
      buttonBg: '#ef4444',
      buttonText: '#ffffff',
      buttonBorder: '#ef4444',
      badgeBg: '#fee2e2',
      badgeText: '#991b1b',
    },
    neutral: {
      primary: '#6b7280',
      primaryDark: '#4b5563',
      primaryLight: '#9ca3af',
      background: '#ffffff',
      backgroundDark: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#6b7280',
      accentDark: '#374151',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      buttonBg: '#6b7280',
      buttonText: '#ffffff',
      buttonBorder: '#6b7280',
      badgeBg: '#f3f4f6',
      badgeText: '#374151',
    },
    warm: {
      primary: '#f59e0b',
      primaryDark: '#d97706',
      primaryLight: '#fbbf24',
      background: '#ffffff',
      backgroundDark: '#fffbeb',
      text: '#111827',
      textSecondary: '#6b7280',
      textLight: '#9ca3af',
      accent: '#f59e0b',
      accentDark: '#92400e',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      surface: '#ffffff',
      surfaceHover: '#fffbeb',
      buttonBg: '#f59e0b',
      buttonText: '#ffffff',
      buttonBorder: '#f59e0b',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
    },
  };

  return palettes[colorScheme];
}

/**
 * Get variant-specific style modifiers
 */
function getVariantModifiers(variant: DesignVariant, colors: VariantColors) {
  const modifiers = {
    glassmorphism: {
      surfaceOpacity: 0.7,
      borderRadius: 16,
      overlayColor: `${colors.primary}33`, // 20% opacity
      shadowOpacity: 0.15,
      shadowRadius: 20,
      borderWidth: 1,
      borderColor: `${colors.primary}22`,
    },
    neumorphism: {
      surfaceOpacity: 1,
      borderRadius: 20,
      overlayColor: 'transparent',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    brutalist: {
      surfaceOpacity: 1,
      borderRadius: 0,
      overlayColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      borderWidth: 4,
      borderColor: colors.text,
    },
    minimal: {
      surfaceOpacity: 1,
      borderRadius: 8,
      overlayColor: 'transparent',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    corporate: {
      surfaceOpacity: 1,
      borderRadius: 4,
      overlayColor: 'transparent',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    creative: {
      surfaceOpacity: 1,
      borderRadius: 24,
      overlayColor: `${colors.primary}15`, // 8% opacity
      shadowOpacity: 0.2,
      shadowRadius: 15,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  };

  return modifiers[variant];
}

/**
 * Main function to get complete variant styles for React Native
 */
export function getVariantStyles(
  variant: DesignVariant = 'minimal',
  colorScheme: ColorScheme = 'blue'
) {
  const colors = getColorPalette(colorScheme);
  const modifiers = getVariantModifiers(variant, colors);

  return {
    colors,
    modifiers,
    variant,
    colorScheme,
  };
}

/**
 * Generate code string for design variant import
 */
export function generateVariantImport(): string {
  return `import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';`;
}

/**
 * Generate code string for variant props interface
 */
export function generateVariantPropsInterface(): string {
  return `  variant?: DesignVariant;
  colorScheme?: ColorScheme;`;
}

/**
 * Generate code string for variant props defaults
 */
export function generateVariantPropsDefaults(): string {
  return `  variant = 'minimal',
  colorScheme = 'blue'`;
}

/**
 * Generate code string for using variant styles in component
 */
export function generateVariantStylesUsage(): string {
  return `  const variantStyles = getVariantStyles(variant, colorScheme);
  const { colors, modifiers } = variantStyles;`;
}
