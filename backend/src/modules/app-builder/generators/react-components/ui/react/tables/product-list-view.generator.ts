import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductListView = (
  resolved: ResolvedComponent,
  variant: 'detailed' | 'compact' | 'withSpecs' = 'detailed'
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

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Star, Check, Package, Tag, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';`;

  const commonStyles = `
    .product-list-view {
      @apply w-full;
    }

    .list-container {
      @apply space-y-4;
    }

    .list-item-card {
      @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700;
    }

    .thumbnail-container {
      @apply relative overflow-hidden bg-gray-50 dark:bg-gray-700;
    }

    .thumbnail-image {
      @apply w-full h-full object-cover;
    }

    .product-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md shadow-md;
    }

    .price-container {
      @apply flex items-center gap-2 flex-wrap;
    }

    .current-price {
      @apply text-2xl font-bold text-gray-900 dark:text-white;
    }

    .original-price {
      @apply line-through text-gray-400 text-lg;
    }

    .discount-badge {
      @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded text-xs font-bold;
    }

    .spec-item {
      @apply flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300;
    }

    .spec-label {
      @apply font-bold text-gray-700 dark:text-gray-200;
    }
  `;

  const variants = {
    detailed: `
${commonImports}

interface ProductListViewProps {
  className?: string;
  [key: string]: any;
}

const ProductListView: React.FC<ProductListViewProps> = ({ className }) => {
  // Fetch products from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'products'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'products'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const products = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.products || []);
  const [wishlist, setWishlist] = useState<any[]>([]);

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const buyNow = (product: any) => {
    console.log('Buy now:', product);
  };

  const viewDetails = (product: any) => {
    console.log('View details:', product);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load products</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
<div className="product-list-view p-4 md:p-6">
        <div className="list-container">
          {products.map((product: any) => {
            const productId = product?.id || product?._id;
            const name = product?.name || '';
            const price = product?.price || 0;
            const originalPrice = product?.originalPrice || product?.original_price || 0;
            const image = product?.image || product?.imageUrl || product?.image_url || '';
            const description = product?.description || '';
            const category = product?.category || '';
            const brand = product?.brand || '';
            const sku = product?.sku || '';
            const features = product?.features || ([] as any[]);
            const productRating = product?.rating || 0;
            const reviewCount = product?.reviewCount || product?.review_count || 0;
            const discount = product?.discount || 0;
            const badge = product?.badge || '';
            const inStock = product?.inStock !== undefined ? product.inStock : (product?.in_stock !== undefined ? product.in_stock : true);

            return (
              <Card key={productId} className="list-item-card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="thumbnail-container w-full md:w-80 h-64 md:h-auto">
                      {badge && (
                        <Badge className="product-badge bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={image || '/api/placeholder/400/400'}
                        alt={name}
                        className="thumbnail-image"
                      />
                    </div>

                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              {name}
                            </h2>
                            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {brand && (
                                <span>
                                  <span className="spec-label">Brand:</span> {brand}
                                </span>
                              )}
                              {category && (
                                <span>
                                  <span className="spec-label">Category:</span> {category}
                                </span>
                              )}
                              {sku && (
                                <span>
                                  <span className="spec-label">SKU:</span> {sku}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => toggleWishlist(productId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <Heart
                              className={\`w-6 h-6 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}\`}
                            />
                          </button>
                        </div>

                        {productRating && (
                          <div className="flex items-center gap-2 mb-4">
                            {getRatingStars(productRating)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {productRating}
                            </span>
                            {reviewCount && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({reviewCount} reviews)
                              </span>
                            )}
                          </div>
                        )}

                        {description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            {description}
                          </p>
                        )}

                        {features && features.length > 0 && (
                          <div className="mb-4">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {features.map((feature: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="price-container">
                          <span className="current-price">{formatPrice(price)}</span>
                          {originalPrice && originalPrice > price && (
                            <>
                              <span className="original-price">{formatPrice(originalPrice)}</span>
                              {discount && (
                                <span className="discount-badge">Save {discount}%</span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => viewDetails(product)}
                          >
                            View Details
                          </Button>
                          {inStock ? (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => addToCart(product)}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button onClick={() => buyNow(product)}>
                                Buy Now
                              </Button>
                            </>
                          ) : (
                            <Button disabled>
                              Out of Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductListView;
    `,

    compact: `
${commonImports}

interface ProductListViewProps {
  className?: string;
  [key: string]: any;
}

const ProductListView: React.FC<ProductListViewProps> = ({ className }) => {
  // Fetch products from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'products'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'products'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const products = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.products || []);
  const [wishlist, setWishlist] = useState<any[]>([]);

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load products</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
<div className="product-list-view p-4 md:p-6">
        <div className="list-container">
          {products.map((product: any) => {
            const productId = product?.id || product?._id;
            const name = product?.name || '';
            const price = product?.price || 0;
            const originalPrice = product?.originalPrice || product?.original_price || 0;
            const image = product?.image || product?.imageUrl || product?.image_url || '';
            const description = product?.description || '';
            const productRating = product?.rating || 0;
            const reviewCount = product?.reviewCount || product?.review_count || 0;
            const discount = product?.discount || 0;
            const badge = product?.badge || '';
            const inStock = product?.inStock !== undefined ? product.inStock : (product?.in_stock !== undefined ? product.in_stock : true);

            return (
              <Card key={productId} className="list-item-card">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="thumbnail-container w-32 h-32 flex-shrink-0 rounded-md">
                      {badge && (
                        <Badge className="product-badge bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={image || '/api/placeholder/150/150'}
                        alt={name}
                        className="thumbnail-image rounded-md"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {name}
                        </h3>

                        {productRating && (
                          <div className="flex items-center gap-1 mb-2">
                            {getRatingStars(productRating)}
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              ({reviewCount})
                            </span>
                          </div>
                        )}

                        {description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-3">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(price)}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="text-sm line-through text-gray-400">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleWishlist(productId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <Heart
                              className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}\`}
                            />
                          </button>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={!inStock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductListView;
    `,

    withSpecs: `
${commonImports}

interface ProductListViewProps {
  className?: string;
  [key: string]: any;
}

const ProductListView: React.FC<ProductListViewProps> = ({ className }) => {
  // Fetch products from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'products'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'products'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const products = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.products || []);
  const [wishlist, setWishlist] = useState<any[]>([]);

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-list-view p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load products</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  return (
    <>
<div className="product-list-view p-4 md:p-6">
        <div className="list-container">
          {products.map((product: any) => {
            const productId = product?.id || product?._id;
            const name = product?.name || '';
            const price = product?.price || 0;
            const originalPrice = product?.originalPrice || product?.original_price || 0;
            const image = product?.image || product?.imageUrl || product?.image_url || '';
            const description = product?.description || '';
            const category = product?.category || '';
            const brand = product?.brand || '';
            const specs = product?.specs || ({} as any);
            const productRating = product?.rating || 0;
            const reviewCount = product?.reviewCount || product?.review_count || 0;
            const discount = product?.discount || 0;
            const badge = product?.badge || '';
            const inStock = product?.inStock !== undefined ? product.inStock : (product?.in_stock !== undefined ? product.in_stock : true);
            const stockCount = product?.stockCount || product?.stock_count || 0;

            return (
              <Card key={productId} className="list-item-card">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="thumbnail-container w-full lg:w-72 h-72 lg:h-auto">
                      {badge && (
                        <Badge className="product-badge bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={image || '/api/placeholder/400/400'}
                        alt={name}
                        className="thumbnail-image"
                      />
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {name}
                          </h2>
                          {productRating && (
                            <div className="flex items-center gap-2 mb-3">
                              {getRatingStars(productRating)}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {productRating}
                              </span>
                              {reviewCount && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ({reviewCount} reviews)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleWishlist(productId)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Heart
                            className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}\`}
                          />
                        </button>
                      </div>

                      {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                        {brand && (
                          <div className="spec-item">
                            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>
                              <span className="spec-label">Brand:</span> {brand}
                            </span>
                          </div>
                        )}
                        {category && (
                          <div className="spec-item">
                            <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>
                              <span className="spec-label">Category:</span> {category}
                            </span>
                          </div>
                        )}
                        <div className="spec-item">
                          <Check className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>
                            <span className="spec-label">Availability:</span>{' '}
                            {inStock ? (
                              <span className="text-green-600 font-bold">
                                In Stock ({stockCount} available)
                              </span>
                            ) : (
                              <span className="text-red-600 font-bold">Out of Stock</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {specs && typeof specs === 'object' && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                            Specifications
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(specs).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex gap-2 text-sm">
                                <span className="spec-label capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-gray-600 dark:text-gray-300">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator className="my-4" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="price-container">
                          <span className="current-price">{formatPrice(price)}</span>
                          {originalPrice && originalPrice > price && (
                            <>
                              <span className="original-price">{formatPrice(originalPrice)}</span>
                              {discount && (
                                <span className="discount-badge">-{discount}%</span>
                              )}
                            </>
                          )}
                        </div>

                        <Button
                          size="lg"
                          onClick={() => addToCart(product)}
                          disabled={!inStock}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductListView;
    `
  };

  return variants[variant] || variants.detailed;
};
