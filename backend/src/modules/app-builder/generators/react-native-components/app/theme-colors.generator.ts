/**
 * Generate theme colors
 *
 * Defines the color palette for the application including:
 * - Primary and secondary colors
 * - Status colors (success, warning, error)
 * - Background and card colors
 * - Text colors for different emphases
 * - Border color
 *
 * @returns Generated theme/colors.ts code as string
 */
export function generateThemeColors(): string {
  return `export const colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};`;
}
