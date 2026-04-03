import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductComparisonTable = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'sideBySide' = 'table'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming
  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  const formatPrice = `(price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }`;

  const getRatingStars = `(rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={\`full-\${i}\`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-4 h-4 text-gray-300" />
        ))}
      </>
    );
  }`;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ShoppingCart, X, Download, Star, Check, AlertCircle, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const commonStyles = `
    .product-comparison {
      @apply w-full;
    }

    .comparison-table {
      @apply overflow-x-auto;
    }

    .table-header {
      @apply bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
    }

    .table-cell {
      @apply p-4 border-b border-gray-200 dark:border-gray-700;
    }

    .product-cell {
      @apply min-w-[200px] text-center;
    }

    .attribute-cell {
      @apply min-w-[180px] font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800;
    }

    .difference-highlight {
      @apply bg-yellow-50 dark:bg-yellow-900/20;
    }

    .comparison-card {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700;
    }

    .product-image-comparison {
      @apply w-full h-48 object-cover rounded-t-lg;
    }

    .remove-button {
      @apply p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors;
    }
  `;

  const variants = {
    table: `
${commonImports}

interface ProductComparisonTableProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const sourceData = ${dataName} || fetchedData || {};
  const allProducts = productData.products || ${getField('products')};

  const [selectedProducts, setSelectedProducts] = useState(allProducts?.slice(0, 3) || []);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Set<any>>(new Set());

  const addToCartText = ${getField('addToCartText')};
  const removeText = ${getField('removeText')};
  const exportText = ${getField('exportText')};
  const highlightDifferencesText = ${getField('highlightDifferencesText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("product-comparison flex justify-center items-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("product-comparison text-center py-12", className)}>
        <p className="text-red-500">Failed to load comparison data</p>
      </div>
    );
  }

  const removeProduct = (productId: any) => {
    setSelectedProducts(prev => prev.filter((p: any) => {
      const id = ${getField('id').replace('product.', 'p.')};
      return id !== productId;
    }));
    console.log('Removed product:', productId);
  };

  const toggleLike = (productId: any) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const exportComparison = () => {
    console.log('Exporting comparison data:', selectedProducts);
  };

  const checkDifference = (attribute: string, values: any[]) => {
    if (!highlightDifferences) return false;
    const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))];
    return uniqueValues.length > 1;
  };

  return (
    <>
<div className="product-comparison p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Product Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Compare features and find your perfect match
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <Switch
                checked={highlightDifferences}
                onCheckedChange={setHighlightDifferences}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {highlightDifferencesText}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={exportComparison}
              className="shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportText}
            </Button>
          </div>
        </div>

        {selectedProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No products selected for comparison
            </p>
          </Card>
        ) : (
          <div className="comparison-table">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="table-cell attribute-cell">Attribute</th>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const name = ${getField('name')};
                    const image = ${getField('image')};
                    const isLiked = likedProducts.has(productId);

                    return (
                      <th key={productId} className="table-cell product-cell">
                        <div className="relative group">
                          <div className="absolute -top-2 -right-2 flex gap-2 z-10">
                            <button
                              onClick={() => toggleLike(productId)}
                              className={cn(
                                "p-2 rounded-full transition-all duration-300 shadow-md hover:scale-110",
                                isLiked
                                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900"
                              )}
                              title="Add to favorites"
                            >
                              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            </button>
                            <button
                              onClick={() => removeProduct(productId)}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md hover:scale-110"
                              title={removeText}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="relative overflow-hidden rounded-lg mb-3">
                            <img
                              src={image || '/api/placeholder/200/200'}
                              alt={name}
                              className="w-32 h-32 object-cover mx-auto transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {name}
                          </h3>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell attribute-cell">Price</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const price = ${getField('price')};
                    const originalPrice = ${getField('originalPrice')};
                    const discount = ${getField('discount')};

                    const prices = selectedProducts.map((p: any) => ${getField('price').replace('product.', 'p.')});
                    const isDifferent = checkDifference('price', prices);

                    return (
                      <td
                        key={productId}
                        className={\`table-cell product-cell \${isDifferent ? 'difference-highlight' : ''}\`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(price)}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <>
                              <span className="text-sm line-through text-gray-400">
                                {formatPrice(originalPrice)}
                              </span>
                              {discount && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  -{discount}%
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell">Rating</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const productRating = ${getField('rating')};
                    const reviewCount = ${getField('reviewCount')};

                    const ratings = selectedProducts.map((p: any) => ${getField('rating').replace('product.', 'p.')});
                    const isDifferent = checkDifference('rating', ratings);

                    return (
                      <td
                        key={productId}
                        className={\`table-cell product-cell \${isDifferent ? 'difference-highlight' : ''}\`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            {getRatingStars(productRating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {productRating}
                          </span>
                          {reviewCount && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell">Brand</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const brand = ${getField('brand')};

                    const brands = selectedProducts.map((p: any) => ${getField('brand').replace('product.', 'p.')});
                    const isDifferent = checkDifference('brand', brands);

                    return (
                      <td
                        key={productId}
                        className={\`table-cell product-cell \${isDifferent ? 'difference-highlight' : ''}\`}
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {brand || 'N/A'}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell">Category</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const category = ${getField('category')};

                    const categories = selectedProducts.map((p: any) => ${getField('category').replace('product.', 'p.')});
                    const isDifferent = checkDifference('category', categories);

                    return (
                      <td
                        key={productId}
                        className={\`table-cell product-cell \${isDifferent ? 'difference-highlight' : ''}\`}
                      >
                        <Badge variant="secondary">{category}</Badge>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell">Availability</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const inStock = ${getField('inStock')};
                    const stockCount = ${getField('stockCount')};

                    const availability = selectedProducts.map((p: any) => ${getField('inStock').replace('product.', 'p.')});
                    const isDifferent = checkDifference('availability', availability);

                    return (
                      <td
                        key={productId}
                        className={\`table-cell product-cell \${isDifferent ? 'difference-highlight' : ''}\`}
                      >
                        {inStock ? (
                          <div className="flex flex-col items-center gap-1">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              In Stock
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {stockCount} available
                            </span>
                          </div>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                            Out of Stock
                          </Badge>
                        )}
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell">Features</td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const features = ${getField('features')};

                    return (
                      <td key={productId} className="table-cell product-cell">
                        <ul className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {features && features.length > 0 ? (
                            features.slice(0, 4).map((feature: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-1">
                                <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-xs">{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-400">No features listed</li>
                          )}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="table-cell attribute-cell"></td>
                  {selectedProducts.map((product: any) => {
                    const productId = ${getField('id')};
                    const inStock = ${getField('inStock')};

                    return (
                      <td key={productId} className="table-cell product-cell">
                        <Button
                          className={cn(
                            "w-full font-bold group transition-all duration-300 shadow-md hover:shadow-lg",
                            inStock
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              : "bg-gray-400"
                          )}
                          onClick={() => addToCart(product)}
                          disabled={!inStock}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          {addToCartText}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductComparisonTable;
    `,

    cards: `
${commonImports}
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProductComparisonTableProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const sourceData = ${dataName} || fetchedData || {};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-red-500">Failed to load comparison data</p>
      </div>
    );
  }

  const allProducts = productData.products || ${getField('products')};

  const [selectedProducts, setSelectedProducts] = useState(allProducts.slice(0, 3));
  const [likedProducts, setLikedProducts] = useState<Set<any>>(new Set());

  const addToCartText = ${getField('addToCartText')};
  const removeText = ${getField('removeText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const removeProduct = (productId: any) => {
    setSelectedProducts(prev => prev.filter((p: any) => {
      const id = ${getField('id').replace('product.', 'p.')};
      return id !== productId;
    }));
    console.log('Removed product:', productId);
  };

  const toggleLike = (productId: any) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="product-comparison p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Product Comparison
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Compare side-by-side and choose wisely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedProducts.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const category = ${getField('category')};
            const brand = ${getField('brand')};
            const features = ${getField('features')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const inStock = ${getField('inStock')};
            const stockCount = ${getField('stockCount')};
            const isLiked = likedProducts.has(productId);

            return (
              <Card key={productId} className="comparison-card relative group hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button
                    onClick={() => toggleLike(productId)}
                    className={cn(
                      "p-2 rounded-full transition-all duration-300 shadow-md hover:scale-110",
                      isLiked
                        ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                        : "bg-white/90 dark:bg-gray-700/90 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900"
                    )}
                    title="Add to favorites"
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </button>
                  <button
                    onClick={() => removeProduct(productId)}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md hover:scale-110"
                    title={removeText}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src={image || '/api/placeholder/400/300'}
                    alt={name}
                    className="product-image-comparison transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">{category}</Badge>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {name}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Brand</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {brand}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        {getRatingStars(productRating)}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                          {productRating} ({reviewCount})
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(price)}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <>
                            <span className="text-sm line-through text-gray-400">
                              {formatPrice(originalPrice)}
                            </span>
                            {discount && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                -{discount}%
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Availability</p>
                      {inStock ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          In Stock ({stockCount})
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Features</p>
                      <ul className="space-y-1">
                        {features && features.slice(0, 3).map((feature: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "w-full font-bold group/btn transition-all duration-300 shadow-md hover:shadow-lg",
                      inStock
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-gray-400"
                    )}
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    {addToCartText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductComparisonTable;
    `,

    sideBySide: `
${commonImports}
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProductComparisonTableProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const sourceData = ${dataName} || fetchedData || {};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-red-500">Failed to load comparison data</p>
      </div>
    );
  }

  const allProducts = productData.products || ${getField('products')};

  const [selectedProducts, setSelectedProducts] = useState(allProducts.slice(0, 2));
  const [likedProducts, setLikedProducts] = useState<Set<any>>(new Set());

  const addToCartText = ${getField('addToCartText')};
  const removeText = ${getField('removeText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const removeProduct = (productId: any) => {
    setSelectedProducts(prev => prev.filter((p: any) => {
      const id = ${getField('id').replace('product.', 'p.')};
      return id !== productId;
    }));
    console.log('Removed product:', productId);
  };

  const toggleLike = (productId: any) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const attributes = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'brand', label: 'Brand' },
    { key: 'category', label: 'Category' },
    { key: 'availability', label: 'Availability' },
    { key: 'features', label: 'Features' }
  ];

  return (
    <>
<div className="product-comparison p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Side-by-Side Comparison
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Compare features in detail
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedProducts.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const category = ${getField('category')};
            const brand = ${getField('brand')};
            const features = ${getField('features')};
            const specs = ${getField('specs')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const inStock = ${getField('inStock')};
            const stockCount = ${getField('stockCount')};
            const isLiked = likedProducts.has(productId);

            return (
              <Card key={productId} className="comparison-card relative group hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button
                    onClick={() => toggleLike(productId)}
                    className={cn(
                      "p-2 rounded-full transition-all duration-300 shadow-md hover:scale-110",
                      isLiked
                        ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                        : "bg-white/90 dark:bg-gray-700/90 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900"
                    )}
                    title="Add to favorites"
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </button>
                  <button
                    onClick={() => removeProduct(productId)}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md hover:scale-110"
                    title={removeText}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={image || '/api/placeholder/300/300'}
                      alt={name}
                      className="w-48 h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                      {name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {attributes.map((attr) => (
                      <div key={attr.key}>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                          {attr.label}
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          {attr.key === 'price' && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(price)}
                              </span>
                              {originalPrice && originalPrice > price && (
                                <>
                                  <span className="text-sm line-through text-gray-400">
                                    {formatPrice(originalPrice)}
                                  </span>
                                  {discount && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                      -{discount}%
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {attr.key === 'rating' && (
                            <div className="flex items-center gap-2">
                              {getRatingStars(productRating)}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {productRating} ({reviewCount})
                              </span>
                            </div>
                          )}

                          {attr.key === 'brand' && (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {brand}
                            </span>
                          )}

                          {attr.key === 'category' && (
                            <Badge variant="secondary">{category}</Badge>
                          )}

                          {attr.key === 'availability' && (
                            inStock ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                In Stock ({stockCount})
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                                Out of Stock
                              </Badge>
                            )
                          )}

                          {attr.key === 'features' && (
                            <ul className="space-y-1">
                              {features && features.slice(0, 4).map((feature: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <Button
                    className={cn(
                      "w-full font-bold group/btn transition-all duration-300 shadow-md hover:shadow-lg",
                      inStock
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-gray-400"
                    )}
                    size="lg"
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                    {addToCartText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductComparisonTable;
    `
  };

  return variants[variant] || variants.table;
};
