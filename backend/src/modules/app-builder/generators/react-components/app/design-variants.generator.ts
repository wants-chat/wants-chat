export const generateDesignVariantsFile = () => {
  return `export type DesignVariant = 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'modern' | 'classic' | 'bold' | 'corporate' | 'creative';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'gray' | 'neutral' | 'warm';

export interface VariantStyles {
  container: string;
  card: string;
  cardHover: string;
  cardHoverShadow: string;
  cardBorder: string;
  cardShadow: string;
  title: string;
  subtitle: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  badge: string;
  button: string;
  buttonHover: string;
  accent: string;
  border: string;
  background: string;
  gradient: string;
}

const getColorStyles = (colorScheme: ColorScheme = 'blue') => {
  const colorMap = {
    blue: {
      primary: 'blue',
      secondary: 'indigo',
      titleColor: 'text-blue-900 dark:text-blue-100',
      accentColor: 'bg-blue-500',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600',
    },
    purple: {
      primary: 'purple',
      secondary: 'pink',
      titleColor: 'text-purple-900 dark:text-purple-100',
      accentColor: 'bg-purple-500',
      borderColor: 'border-purple-200',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-600',
    },
    green: {
      primary: 'green',
      secondary: 'emerald',
      titleColor: 'text-green-900 dark:text-green-100',
      accentColor: 'bg-green-500',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-600',
    },
    orange: {
      primary: 'orange',
      secondary: 'amber',
      titleColor: 'text-orange-900 dark:text-orange-100',
      accentColor: 'bg-orange-500',
      borderColor: 'border-orange-200',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-amber-600',
    },
    pink: {
      primary: 'pink',
      secondary: 'rose',
      titleColor: 'text-pink-900 dark:text-pink-100',
      accentColor: 'bg-pink-500',
      borderColor: 'border-pink-200',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-rose-600',
    },
    indigo: {
      primary: 'indigo',
      secondary: 'violet',
      titleColor: 'text-indigo-900 dark:text-indigo-100',
      accentColor: 'bg-indigo-500',
      borderColor: 'border-indigo-200',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-violet-600',
    },
    teal: {
      primary: 'teal',
      secondary: 'cyan',
      titleColor: 'text-teal-900 dark:text-teal-100',
      accentColor: 'bg-teal-500',
      borderColor: 'border-teal-200',
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-cyan-600',
    },
    red: {
      primary: 'red',
      secondary: 'orange',
      titleColor: 'text-red-900 dark:text-red-100',
      accentColor: 'bg-red-500',
      borderColor: 'border-red-200',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-orange-600',
    },
    gray: {
      primary: 'gray',
      secondary: 'slate',
      titleColor: 'text-gray-900 dark:text-gray-100',
      accentColor: 'bg-gray-500',
      borderColor: 'border-gray-200',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-slate-600',
    },
    neutral: {
      primary: 'gray',
      secondary: 'slate',
      titleColor: 'text-gray-900 dark:text-gray-100',
      accentColor: 'bg-gray-500',
      borderColor: 'border-gray-200',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-slate-600',
    },
    warm: {
      primary: 'amber',
      secondary: 'orange',
      titleColor: 'text-amber-900 dark:text-amber-100',
      accentColor: 'bg-amber-500',
      borderColor: 'border-amber-200',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
    },
  };

  return colorMap[colorScheme] || colorMap.blue;
};

const getVariantBaseStyles = (variant: DesignVariant = 'minimal') => {
  const variantMap = {
    glassmorphism: {
      container: 'backdrop-blur-lg bg-white/30 dark:bg-gray-900/30',
      card: 'backdrop-blur-md bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/20',
      cardShadow: 'shadow-xl shadow-black/5',
      cardHover: 'hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-2xl',
      titleBase: 'font-bold',
      badge: 'backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border border-white/30',
      button: 'backdrop-blur-md bg-white/50 dark:bg-gray-800/50 border border-white/30',
      buttonHover: 'hover:bg-white/70 dark:hover:bg-gray-700/70',
      background: 'bg-gradient-to-br from-white/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50',
    },
    neumorphism: {
      container: 'bg-gray-100 dark:bg-gray-900',
      card: 'bg-gray-100 dark:bg-gray-900',
      cardShadow: 'shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#000000,-8px_-8px_16px_#1a1a1a]',
      cardHover: 'hover:shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:hover:shadow-[12px_12px_24px_#000000,-12px_-12px_24px_#1a1a1a]',
      titleBase: 'font-bold',
      badge: 'shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#000000,inset_-2px_-2px_4px_#1a1a1a]',
      button: 'shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#000000,-4px_-4px_8px_#1a1a1a]',
      buttonHover: 'hover:shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#000000,-2px_-2px_4px_#1a1a1a]',
      background: 'bg-gray-100 dark:bg-gray-900',
    },
    brutalist: {
      container: 'bg-white dark:bg-black',
      card: 'bg-white dark:bg-black border-4 border-black dark:border-white',
      cardShadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]',
      cardHover: 'hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-4px] hover:translate-y-[-4px]',
      titleBase: 'font-black uppercase',
      badge: 'border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500',
      button: 'border-4 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]',
      buttonHover: 'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px]',
      background: 'bg-white dark:bg-black',
    },
    minimal: {
      container: 'bg-white dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      cardShadow: 'shadow-sm',
      cardHover: 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
      titleBase: 'font-semibold text-gray-900 dark:text-gray-100',
      badge: 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      button: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
      buttonHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    modern: {
      container: 'bg-white dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-900 shadow-lg',
      cardShadow: 'shadow-lg',
      cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      titleBase: 'font-semibold text-gray-900 dark:text-gray-100',
      badge: 'bg-gray-100 dark:bg-gray-800',
      button: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
      buttonHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-100 dark:border-gray-800',
    },
    classic: {
      container: 'bg-white dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-900 border-2',
      cardShadow: '',
      cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      titleBase: 'font-semibold text-gray-900 dark:text-gray-100',
      badge: 'bg-gray-100 dark:bg-gray-800',
      button: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
      buttonHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
    },
    bold: {
      container: 'bg-white dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-900 shadow-xl',
      cardShadow: 'shadow-xl',
      cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      titleBase: 'font-bold',
      badge: 'bg-gray-100 dark:bg-gray-800',
      button: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
      buttonHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    corporate: {
      container: 'bg-gray-50 dark:bg-gray-900',
      card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      cardShadow: 'shadow-lg',
      cardHover: 'hover:shadow-xl',
      titleBase: 'font-bold',
      badge: 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800',
      button: 'bg-blue-600 dark:bg-blue-700 text-white border-none',
      buttonHover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
      background: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
    },
    creative: {
      container: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20',
      card: 'bg-white dark:bg-gray-800 border-2 border-transparent',
      cardShadow: 'shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20',
      cardHover: 'hover:shadow-3xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/30 hover:scale-[1.02] hover:border-purple-300 dark:hover:border-purple-600',
      titleBase: 'font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
      badge: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border border-purple-200 dark:border-purple-700',
      button: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none',
      buttonHover: 'hover:from-purple-600 hover:to-pink-600 hover:shadow-lg',
      background: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20',
    },
  };

  return variantMap[variant] || variantMap.minimal;
};

export function getVariantStyles(variant: DesignVariant = 'minimal', colorScheme: ColorScheme = 'blue'): VariantStyles {
  const colorStyles = getColorStyles(colorScheme);
  const variantStyles = getVariantBaseStyles(variant);

  return {
    container: variantStyles.container,
    card: \`\${variantStyles.card} \${variantStyles.cardShadow}\`,
    cardHover: variantStyles.cardHover,
    cardHoverShadow: variantStyles.cardHover,
    cardBorder: colorStyles.borderColor,
    cardShadow: variantStyles.cardShadow,
    title: \`\${variantStyles.titleBase} \${colorStyles.titleColor}\`,
    subtitle: \`text-gray-600 dark:text-gray-400\`,
    text: \`text-gray-700 dark:text-gray-300\`,
    textPrimary: \`text-\${colorStyles.primary}-600 dark:text-\${colorStyles.primary}-400\`,
    textSecondary: 'text-gray-700 dark:text-gray-300',
    textMuted: 'text-gray-500 dark:text-gray-400',
    badge: \`\${variantStyles.badge} text-\${colorStyles.primary}-700 dark:text-\${colorStyles.primary}-300\`,
    button: \`\${variantStyles.button} \${colorStyles.accentColor} text-white\`,
    buttonHover: variantStyles.buttonHover,
    accent: colorStyles.accentColor,
    border: colorStyles.borderColor,
    background: variantStyles.background,
    gradient: \`bg-gradient-to-r \${colorStyles.gradientFrom} \${colorStyles.gradientTo}\`,
  };
}
`;
};
