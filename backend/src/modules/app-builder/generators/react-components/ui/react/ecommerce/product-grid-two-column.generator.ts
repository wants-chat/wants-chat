import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductGridTwoColumn = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'responsive' | 'withFilters' = 'twoColumn'
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
  const entity = dataSource?.split('.').pop() || 'products';

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
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingCart, Eye, Star, Filter, X, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .product-grid-two-column {
      @apply w-full;
    }

    .two-column-grid {
      @apply grid grid-cols-1 md:grid-cols-2 gap-6;
    }

    .product-card {
      @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300;
    }

    .product-image-container {
      @apply relative overflow-hidden bg-gray-100 dark:bg-gray-700;
    }

    .product-image {
      @apply w-full h-full object-cover transition-transform duration-500;
    }

    .product-card:hover .product-image {
      @apply scale-110;
    }

    .product-badge {
      @apply absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-md shadow-md;
    }

    .product-actions {
      @apply absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300;
    }

    .product-card:hover .product-actions {
      @apply opacity-100;
    }

    .action-button {
      @apply p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
    }

    .price-container {
      @apply flex items-center gap-2 flex-wrap;
    }

    .current-price {
      @apply text-2xl font-bold text-gray-900 dark:text-white;
    }

    .original-price {
      @apply line-through text-gray-400 text-sm;
    }

    .discount-badge {
      @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded text-xs font-bold;
    }

    .filter-sidebar {
      @apply w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md;
    }

    .filter-section {
      @apply mb-6;
    }

    .filter-title {
      @apply font-bold text-lg mb-3 text-gray-900 dark:text-white;
    }
  `;

  const variants = {
    twoColumn: `
${commonImports}

interface ProductGridTwoColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridTwoColumn: React.FC<ProductGridTwoColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const products = Array.isArray(${dataName}) ? ${dataName} : (Array.isArray(${getField('products')}) ? ${getField('products')} : []);

  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const quickViewText = ${getField('quickViewText')};
  const outOfStockText = ${getField('outOfStockText')};

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

  const quickView = (product: any) => {
    console.log('Quick view:', product);
  };

  return (
    <>
<div className="product-grid-two-column p-6">
        <div className="two-column-grid">
          {products.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const description = ${getField('description')};
            const category = ${getField('category')};
            const brand = ${getField('brand')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const badge = ${getField('badge')};
            const inStock = ${getField('inStock')};

            return (
              <Card
                key={productId}
                className="product-card"
                onMouseEnter={() => setHoveredProduct(productId)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="product-image-container h-80">
                  {badge && (
                    <Badge className="product-badge bg-red-500 text-white">
                      {badge}
                    </Badge>
                  )}
                  <img
                    src={image || '/api/placeholder/400/400'}
                    alt={name}
                    className="product-image"
                  />
                  <div className="product-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(productId);
                      }}
                      className="action-button"
                      title="Add to Wishlist"
                    >
                      <Heart
                        className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}\`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quickView(product);
                      }}
                      className="action-button"
                      title={quickViewText}
                    >
                      <Eye className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-3">
                    {category && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {category}
                      </Badge>
                    )}
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">{name}</h3>
                    {brand && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">by {brand}</p>
                    )}
                  </div>

                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {description}
                    </p>
                  )}

                  {productRating && (
                    <div className="flex items-center gap-2 mb-4">
                      {getRatingStars(productRating)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {productRating}
                      </span>
                      {reviewCount && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="price-container mb-4">
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
                    className="w-full"
                    size="lg"
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {inStock ? addToCartText : outOfStockText}
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

export default ProductGridTwoColumn;
    `,

    responsive: `
${commonImports}

interface ProductGridTwoColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridTwoColumn: React.FC<ProductGridTwoColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const products = Array.isArray(${dataName}) ? ${dataName} : (Array.isArray(${getField('products')}) ? ${getField('products')} : []);

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const outOfStockText = ${getField('outOfStockText')};

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

  return (
    <>
<div className="product-grid-two-column p-4 md:p-6">
        <div className="responsive-grid">
          {products.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const description = ${getField('description')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const badge = ${getField('badge')};
            const inStock = ${getField('inStock')};

            return (
              <Card key={productId} className="product-card">
                <div className="flex flex-col sm:flex-row">
                  <div className="product-image-container w-full sm:w-1/2 h-64 sm:h-auto relative">
                    {badge && (
                      <Badge className="product-badge bg-red-500 text-white">
                        {badge}
                      </Badge>
                    )}
                    <img
                      src={image || '/api/placeholder/400/400'}
                      alt={name}
                      className="product-image"
                    />
                    <button
                      onClick={() => toggleWishlist(productId)}
                      className="absolute top-3 right-3 action-button"
                    >
                      <Heart
                        className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`}
                      />
                    </button>
                  </div>

                  <CardContent className="w-full sm:w-1/2 p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
                        {name}
                      </h3>

                      {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                          {description}
                        </p>
                      )}

                      {productRating && (
                        <div className="flex items-center gap-2 mb-3">
                          {getRatingStars(productRating)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {productRating}
                          </span>
                          {reviewCount && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="price-container mb-4">
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
                        className="w-full"
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {inStock ? addToCartText : outOfStockText}
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductGridTwoColumn;
    `,

    withFilters: `
${commonImports}

interface ProductGridTwoColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridTwoColumn: React.FC<ProductGridTwoColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const allProducts = Array.isArray(${dataName}) ? ${dataName} : (Array.isArray(${getField('products')}) ? ${getField('products')} : []);
  const categories = Array.isArray(${getField('categories')}) ? ${getField('categories')} : [];
  const sortOptions = Array.isArray(${getField('sortOptions')}) ? ${getField('sortOptions')} : [];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const outOfStockText = ${getField('outOfStockText')};
  const filterByCategory = ${getField('filterByCategory')};
  const sortByText = ${getField('sortBy')};
  const clearFilters = ${getField('clearFilters')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  // Filter and sort products
  const filteredProducts = allProducts
    .filter((product: any) => {
      const category = ${getField('category')};
      return selectedCategory === 'All' || category === selectedCategory;
    })
    .sort((a: any, b: any) => {
      const priceA = ${getField('price').replace('product.', 'a.')};
      const priceB = ${getField('price').replace('product.', 'b.')};
      const ratingA = ${getField('rating').replace('product.', 'a.')};
      const ratingB = ${getField('rating').replace('product.', 'b.')};

      switch (sortBy) {
        case 'Price: Low to High':
          return priceA - priceB;
        case 'Price: High to Low':
          return priceB - priceA;
        case 'Rating':
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

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

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSortBy('Newest');
    console.log('Filters cleared');
  };

  return (
    <>
<div className="product-grid-two-column p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={\`filter-sidebar \${showFilters ? '' : 'hidden lg:block'}\`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">{filterByCategory}</h3>
              <div className="space-y-2">
                {categories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={\`w-full text-left px-3 py-2 rounded-md transition-colors \${
                      selectedCategory === category
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }\`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">{sortByText}</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleClearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              {clearFilters}
            </Button>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Products ({filteredProducts.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="two-column-grid">
              {filteredProducts.map((product: any) => {
                const productId = ${getField('id')};
                const name = ${getField('name')};
                const price = ${getField('price')};
                const originalPrice = ${getField('originalPrice')};
                const image = ${getField('image')};
                const description = ${getField('description')};
                const productRating = ${getField('rating')};
                const reviewCount = ${getField('reviewCount')};
                const discount = ${getField('discount')};
                const badge = ${getField('badge')};
                const inStock = ${getField('inStock')};

                return (
                  <Card key={productId} className="product-card">
                    <div className="product-image-container h-72">
                      {badge && (
                        <Badge className="product-badge bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={image || '/api/placeholder/400/400'}
                        alt={name}
                        className="product-image"
                      />
                      <button
                        onClick={() => toggleWishlist(productId)}
                        className="absolute top-3 right-3 action-button"
                      >
                        <Heart
                          className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`}
                        />
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white truncate">
                        {name}
                      </h3>

                      {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {description}
                        </p>
                      )}

                      {productRating && (
                        <div className="flex items-center gap-2 mb-3">
                          {getRatingStars(productRating)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {productRating}
                          </span>
                          {reviewCount && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({reviewCount})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="price-container mb-3">
                        <span className="current-price text-xl">{formatPrice(price)}</span>
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
                        className="w-full"
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {inStock ? addToCartText : outOfStockText}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductGridTwoColumn;
    `
  };

  return variants[variant] || variants.twoColumn;
};
