/**
 * React Native Product Grid Two Column Generator
 * Generates a 2-column product grid (alias for default product-grid)
 */

import { generateRNProductGrid } from './product-grid.generator';

export function generateRNProductGridTwoColumn(): { code: string; imports: string[] } {
  // Re-export the default product grid (which is 2-column by default)
  return generateRNProductGrid();
}
