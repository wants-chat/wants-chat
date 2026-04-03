import { AppBlueprint } from '../../../interfaces/app-builder.types';

export function generateUiConfigFile(blueprint: AppBlueprint): string {
  const variant = blueprint.uiStyle?.variant || 'minimal';
  const colorScheme = blueprint.uiStyle?.colorScheme || 'blue';

  return `import { type DesignVariant, type ColorScheme } from './design-variants';

// Global UI configuration for the application
// These values are set during app generation based on the detected or specified design style
export const UI_VARIANT: DesignVariant = '${variant}';
export const UI_COLOR_SCHEME: ColorScheme = '${colorScheme}';
`;
}
