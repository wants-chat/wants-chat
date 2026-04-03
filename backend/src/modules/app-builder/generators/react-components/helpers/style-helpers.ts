import { UIStyleVariant } from '../../../interfaces/app-builder.types';

/**
 * Style Helpers for Dynamic Component Styling
 *
 * Generates Tailwind CSS classes based on UIStyleVariant
 */

export interface StyleClasses {
  // Primary button/action color
  primary: string;
  primaryHover: string;

  // Secondary/badge color
  secondary: string;
  secondaryHover: string;

  // Background colors
  background: string;
  cardBackground: string;

  // Card styling (based on variant)
  card: string;
  cardBorder: string;
  cardShadow: string;
  cardHoverShadow: string;

  // Button styling
  button: string;
  buttonHover: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Gradient effects
  gradient: string;
  gradientHover: string;
}

/**
 * Get style classes based on UI style variant
 */
export function getStyleClasses(uiStyle?: UIStyleVariant): StyleClasses {
  const variant = uiStyle?.variant || 'minimal';
  const colorScheme = uiStyle?.colorScheme || 'blue';

  const colors = getColorClasses(colorScheme);
  const variantStyles = getVariantClasses(variant);

  return {
    ...colors,
    ...variantStyles,
  };
}

/**
 * Get color-specific classes
 */
function getColorClasses(colorScheme: UIStyleVariant['colorScheme']): Pick<StyleClasses, 'primary' | 'primaryHover' | 'secondary' | 'secondaryHover' | 'textPrimary' | 'gradient' | 'gradientHover'> {
  const colorMap: Record<UIStyleVariant['colorScheme'], any> = {
    blue: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-blue-100 text-blue-800',
      secondaryHover: 'hover:bg-blue-200',
      textPrimary: 'text-blue-600',
      gradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600',
      gradientHover: 'hover:from-blue-700 hover:via-blue-800 hover:to-blue-700',
    },
    purple: {
      primary: 'bg-purple-600',
      primaryHover: 'hover:bg-purple-700',
      secondary: 'bg-purple-100 text-purple-800',
      secondaryHover: 'hover:bg-purple-200',
      textPrimary: 'text-purple-600',
      gradient: 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600',
      gradientHover: 'hover:from-purple-700 hover:via-purple-800 hover:to-purple-700',
    },
    green: {
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-700',
      secondary: 'bg-green-100 text-green-800',
      secondaryHover: 'hover:bg-green-200',
      textPrimary: 'text-green-600',
      gradient: 'bg-gradient-to-r from-green-600 via-green-700 to-green-600',
      gradientHover: 'hover:from-green-700 hover:via-green-800 hover:to-green-700',
    },
    orange: {
      primary: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-700',
      secondary: 'bg-orange-100 text-orange-800',
      secondaryHover: 'hover:bg-orange-200',
      textPrimary: 'text-orange-600',
      gradient: 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600',
      gradientHover: 'hover:from-orange-700 hover:via-orange-800 hover:to-orange-700',
    },
    pink: {
      primary: 'bg-pink-600',
      primaryHover: 'hover:bg-pink-700',
      secondary: 'bg-pink-100 text-pink-800',
      secondaryHover: 'hover:bg-pink-200',
      textPrimary: 'text-pink-600',
      gradient: 'bg-gradient-to-r from-pink-600 via-pink-700 to-pink-600',
      gradientHover: 'hover:from-pink-700 hover:via-pink-800 hover:to-pink-700',
    },
    indigo: {
      primary: 'bg-indigo-600',
      primaryHover: 'hover:bg-indigo-700',
      secondary: 'bg-indigo-100 text-indigo-800',
      secondaryHover: 'hover:bg-indigo-200',
      textPrimary: 'text-indigo-600',
      gradient: 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600',
      gradientHover: 'hover:from-indigo-700 hover:via-indigo-800 hover:to-indigo-700',
    },
    teal: {
      primary: 'bg-teal-600',
      primaryHover: 'hover:bg-teal-700',
      secondary: 'bg-teal-100 text-teal-800',
      secondaryHover: 'hover:bg-teal-200',
      textPrimary: 'text-teal-600',
      gradient: 'bg-gradient-to-r from-teal-600 via-teal-700 to-teal-600',
      gradientHover: 'hover:from-teal-700 hover:via-teal-800 hover:to-teal-700',
    },
    red: {
      primary: 'bg-red-600',
      primaryHover: 'hover:bg-red-700',
      secondary: 'bg-red-100 text-red-800',
      secondaryHover: 'hover:bg-red-200',
      textPrimary: 'text-red-600',
      gradient: 'bg-gradient-to-r from-red-600 via-red-700 to-red-600',
      gradientHover: 'hover:from-red-700 hover:via-red-800 hover:to-red-700',
    },
    neutral: {
      primary: 'bg-gray-800',
      primaryHover: 'hover:bg-gray-900',
      secondary: 'bg-gray-100 text-gray-800',
      secondaryHover: 'hover:bg-gray-200',
      textPrimary: 'text-gray-700',
      gradient: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700',
      gradientHover: 'hover:from-gray-800 hover:via-gray-900 hover:to-gray-800',
    },
    warm: {
      primary: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      secondary: 'bg-amber-100 text-amber-800',
      secondaryHover: 'hover:bg-amber-200',
      textPrimary: 'text-amber-600',
      gradient: 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600',
      gradientHover: 'hover:from-amber-700 hover:via-amber-800 hover:to-amber-700',
    },
  };

  return colorMap[colorScheme];
}

/**
 * Get variant-specific classes
 */
function getVariantClasses(variant: UIStyleVariant['variant']): Pick<StyleClasses, 'background' | 'cardBackground' | 'card' | 'cardBorder' | 'cardShadow' | 'cardHoverShadow' | 'button' | 'buttonHover' | 'textSecondary' | 'textMuted'> {
  const variantMap: Record<UIStyleVariant['variant'], any> = {
    glassmorphism: {
      background: 'bg-gradient-to-br from-white/80 to-gray-50/90 backdrop-blur-xl',
      cardBackground: 'bg-white/60 backdrop-blur-lg',
      card: 'bg-white/60 backdrop-blur-lg',
      cardBorder: 'border border-white/20',
      cardShadow: 'shadow-xl',
      cardHoverShadow: 'hover:shadow-2xl',
      button: 'backdrop-blur-sm bg-white/10 border border-white/20',
      buttonHover: 'hover:bg-white/20',
      textSecondary: 'text-gray-700 dark:text-gray-300',
      textMuted: 'text-gray-500 dark:text-gray-400',
    },
    neumorphism: {
      background: 'bg-gray-100',
      cardBackground: 'bg-gray-100',
      card: 'bg-gray-100',
      cardBorder: '',
      cardShadow: 'shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]',
      cardHoverShadow: 'hover:shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]',
      button: 'shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]',
      buttonHover: 'active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
    },
    brutalist: {
      background: 'bg-white',
      cardBackground: 'bg-white',
      card: 'bg-white',
      cardBorder: 'border-4 border-black',
      cardShadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      cardHoverShadow: 'hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
      button: 'border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      buttonHover: 'active:shadow-none active:translate-x-1 active:translate-y-1',
      textSecondary: 'text-gray-900',
      textMuted: 'text-gray-600',
    },
    minimal: {
      background: 'bg-white',
      cardBackground: 'bg-white',
      card: 'bg-white',
      cardBorder: 'border border-gray-200',
      cardShadow: 'shadow-sm',
      cardHoverShadow: 'hover:shadow-md',
      button: 'border border-gray-300',
      buttonHover: 'hover:bg-gray-50',
      textSecondary: 'text-gray-700 dark:text-gray-300',
      textMuted: 'text-gray-600 dark:text-gray-400',
    },
    corporate: {
      background: 'bg-gray-50',
      cardBackground: 'bg-white',
      card: 'bg-white',
      cardBorder: 'border border-gray-200',
      cardShadow: 'shadow-sm',
      cardHoverShadow: 'hover:shadow-lg',
      button: '',
      buttonHover: '',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
    },
    creative: {
      background: 'bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50',
      cardBackground: 'bg-white',
      card: 'bg-white rounded-3xl',
      cardBorder: 'border-2',
      cardShadow: 'shadow-xl',
      cardHoverShadow: 'hover:shadow-2xl',
      button: 'rounded-full shadow-lg',
      buttonHover: 'transform hover:scale-105',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
    },
  };

  return variantMap[variant];
}
