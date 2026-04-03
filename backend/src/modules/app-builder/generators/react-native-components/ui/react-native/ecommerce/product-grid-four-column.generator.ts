/**
 * React Native Product Grid Four Column Generator
 * Generates a 4-column product grid (for tablets/large screens)
 * Note: On mobile, this will likely render as 2-column due to screen size
 */

export function generateRNProductGridFourColumn(): { code: string; imports: string[] } {
  const imports = [
    `import React from 'react';`,
    `import { View, StyleSheet } from 'react-native';`,
    `import ProductGrid from './product-grid.generator';`,
  ];

  const code = `${imports.join('\n')}

interface ProductGridFourColumnProps {
  products?: any[];
  data?: any[];
  onProductClick?: (product: any) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  [key: string]: any;
}

export default function ProductGridFourColumn(props: ProductGridFourColumnProps) {
  // Use the base ProductGrid with 4 columns
  // Note: On small mobile screens, this may auto-adjust to fewer columns
  return <ProductGrid {...props} columns={4} />;
}

const styles = StyleSheet.create({});`;

  return { code, imports };
}
