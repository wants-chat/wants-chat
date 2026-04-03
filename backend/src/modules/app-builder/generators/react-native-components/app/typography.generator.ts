/**
 * Generate typography
 *
 * Defines typography styles for the application including:
 * - Heading levels (h1, h2, h3)
 * - Body text
 * - Small text
 *
 * Each style includes font size and font weight configuration
 *
 * @returns Generated theme/typography.ts code as string
 */
export function generateTypography(): string {
  return `export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  small: { fontSize: 14, fontWeight: 'normal' as const },
};`;
}
