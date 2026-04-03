/**
 * Unified Design System for Fluxez UI Components
 * Use these constants across all components for consistency
 */

export const DESIGN_SYSTEM = {
  // Color Gradients
  gradients: {
    primary: 'from-blue-600 to-purple-600',
    primaryHover: 'from-blue-700 to-purple-700',
    like: 'from-pink-500 to-red-500',
    likeHover: 'from-pink-600 to-red-600',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-pink-500',
    background: 'from-gray-50 to-gray-100',
    backgroundDark: 'from-gray-900 to-gray-800',
    glow: 'from-blue-400 to-purple-600',
  },

  // Button Styles
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105',
    like: 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110',
    outline: 'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300',
  },

  // Card Styles
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden',
    glow: 'absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
  },

  // Badge Styles
  badge: {
    like: 'bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-full',
    discount: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full',
    new: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse',
  },

  // Text Styles
  text: {
    gradient: 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent',
    heading: 'font-bold text-gray-900 dark:text-white',
    subtitle: 'text-gray-600 dark:text-gray-400',
  },

  // Animations
  animation: {
    duration: 'duration-300',
    hover: 'transition-all duration-300 hover:scale-105',
    hoverButton: 'transition-all duration-300 hover:scale-110',
    glow: 'transition-opacity duration-500',
  },

  // Shadows
  shadow: {
    base: 'shadow-md',
    hover: 'hover:shadow-xl',
    large: 'shadow-2xl',
  },
};

export const getButtonClass = (variant: 'primary' | 'like' | 'outline' | 'ghost' = 'primary') => {
  return DESIGN_SYSTEM.button[variant];
};

export const getGradientClass = (type: keyof typeof DESIGN_SYSTEM.gradients) => {
  return `bg-gradient-to-r ${DESIGN_SYSTEM.gradients[type]}`;
};
