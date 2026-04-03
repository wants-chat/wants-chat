/**
 * Generate utils.ts file
 *
 * Utility functions for common operations including:
 * - Class name concatenation (cn function)
 * - Date formatting
 * - Currency formatting
 *
 * @returns Generated utils.ts code as string
 */
export function generateUtilsFile(): string {
  return `export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}`;
}
