/**
 * Generate index.ts for src directory
 *
 * This is a barrel export file that re-exports the main App component
 * from App.tsx. This provides a clean entry point for the application.
 *
 * @returns Generated index.ts code as string
 */
export function generateIndexTs(): string {
  return `export { default } from '../App';`;
}
