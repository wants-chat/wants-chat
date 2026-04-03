import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductCard = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'compact' | 'detailed' | 'minimal' = 'grid'
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
          <Star key={\`full-\${i}\`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-3 h-3 text-gray-300" />
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Eye, Star, Check, Plus, Share2, Shield, Truck, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';`;

  const commonStyles = `
    .product-card-container {
      @apply w-full;
    }

    .product-card {
      @apply bg-white rounded-lg overflow-hidden transition-all duration-300;
    }

    .product-image-container {
      @apply relative overflow-hidden;
    }

    .product-image {
      @apply w-full h-full object-cover transition-transform duration-300;
    }

    .product-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md;
    }

    .product-actions {
      @apply flex gap-2;
    }

    .action-button {
      @apply p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors;
    }

    .price-container {
      @apply flex items-center gap-2;
    }

    .original-price {
      @apply line-through text-gray-400 text-sm;
    }

    .discount-percentage {
      @apply text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded;
    }
  `;

  const variants = {
    grid: `
${commonImports}

interface ProductCardProps {
  ${dataName}?: any;
  products?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  ${dataName}: dataProp,
  products: productsProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const styles = getVariantStyles(variant, colorScheme);
  const productData = dataProp || apiData || {};
  // Support both product (single) and products (array) props
  const products = productsProp || productData.products || (dataProp ? [dataProp] : null) || ${getField('products')};

  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Show loading state
  if (isLoading && !dataProp && !productsProp) {
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

  const quickView = (product: any) => {
    console.log('Quick view:', product);
  };

  return (
    <>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
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
            <div
              key={productId}
              className={cn(styles.card, styles.cardHover, 'rounded-xl overflow-hidden cursor-pointer')}
              onMouseEnter={() => setHoveredProduct(productId)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                {badge && (
                  <span className={cn(styles.badge, 'absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md')}>
                    {badge}
                  </span>
                )}
                <img
                  src={image || '/api/placeholder/300/300'}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {hoveredProduct === productId && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(productId);
                      }}
                      className={cn(styles.card, 'p-2 rounded-full backdrop-blur-sm')}
                    >
                      <Heart
                        className={\`w-4 h-4 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : styles.text}\`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className={cn(styles.card, 'p-2 rounded-full backdrop-blur-sm')}
                    >
                      <ShoppingCart className={\`w-4 h-4 \${styles.accent}\`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quickView(product);
                      }}
                      className={cn(styles.card, 'p-2 rounded-full backdrop-blur-sm')}
                    >
                      <Eye className={\`w-4 h-4 \${styles.accent}\`} />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className={\`font-bold text-lg mb-2 truncate \${styles.title}\`}>{name}</h3>
                {description && (
                  <p className={\`text-sm mb-3 line-clamp-2 \${styles.subtitle}\`}>{description}</p>
                )}
                {productRating && (
                  <div className="flex items-center gap-1 mb-3">
                    {getRatingStars(productRating)}
                    <span className={\`text-sm \${styles.subtitle}\`}>
                      {productRating} {reviewCount && \`(\${reviewCount})\`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={\`text-xl font-bold \${styles.title}\`}>{formatPrice(price)}</span>
                  {originalPrice && originalPrice > price && (
                    <>
                      <span className={\`line-through text-sm \${styles.subtitle}\`}>{formatPrice(originalPrice)}</span>
                      {discount && (
                        <span className={cn(styles.badge, 'text-xs font-bold px-2 py-1 rounded')}>-{discount}%</span>
                      )}
                    </>
                  )}
                </div>
                <button
                  className={cn(styles.button, styles.buttonHover, 'w-full font-bold py-2 rounded-lg transition-all')}
                  onClick={() => addToCart(product)}
                  disabled={!inStock}
                >
                  {inStock ? addToCartText : outOfStockText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductCard;
    `,

    list: `
${commonImports}

interface ProductCardProps {
  ${dataName}?: any;
  products?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  ${dataName}: propData,
  products: productsProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};
  const products = productsProp || sourceData.products || (${dataName} ? [${dataName}] : null) || ${getField('products')};

  const [wishlist, setWishlist] = useState<any[]>([]);

  // Show loading state
  if (isLoading && !propData && !productsProp) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const inStockText = ${getField('inStockText')};
  const outOfStockText = ${getField('outOfStockText')};
  const reviewsText = ${getField('reviewsText')};

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
<div className="space-y-4 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const image = ${getField('image')};
          const description = ${getField('description')};
          const category = ${getField('category')};
          const brand = ${getField('brand')};
          const features = ${getField('features')};
          const productRating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};
          const inStock = ${getField('inStock')};

          return (
            <div key={productId} className={cn(styles.card, styles.cardHover, 'rounded-xl overflow-hidden')}>
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-100 overflow-hidden">
                  <img
                    src={image || '/api/placeholder/300/200'}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={\`text-xl font-bold mb-1 \${styles.title}\`}>{name}</h3>
                      <div className={\`flex gap-2 text-sm \${styles.subtitle}\`}>
                        {brand && <span>{brand}</span>}
                        {category && <span>• {category}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWishlist(productId)}
                      className={cn(styles.card, 'p-2 rounded-full transition-colors')}
                    >
                      <Heart
                        className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : styles.subtitle}\`}
                      />
                    </button>
                  </div>

                  {description && (
                    <p className={\`mb-4 \${styles.text}\`}>{description}</p>
                  )}

                  {features && features.length > 0 && (
                    <ul className="mb-4 space-y-1">
                      {features.slice(0, 3).map((feature: any, idx: number) => (
                        <li key={idx} className={\`flex items-center text-sm \${styles.text}\`}>
                          <Check className={\`w-4 h-4 mr-2 \${styles.accent}\`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {productRating && (
                        <div className="flex items-center gap-1 mb-2">
                          {getRatingStars(productRating)}
                          <span className={\`text-sm \${styles.subtitle}\`}>
                            {productRating} {reviewCount && \`(\${reviewCount} \${reviewsText})\`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={\`text-2xl font-bold \${styles.title}\`}>{formatPrice(price)}</span>
                        {originalPrice && originalPrice > price && (
                          <span className={\`line-through \${styles.subtitle}\`}>{formatPrice(originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inStock ? (
                        <>
                          <span className={cn(styles.badge, 'px-3 py-1 rounded-full text-sm')}>
                            {inStockText}
                          </span>
                          <button onClick={() => addToCart(product)} className={cn(styles.button, styles.buttonHover, 'px-4 py-2 rounded-lg font-bold flex items-center gap-2')}>
                            <ShoppingCart className="w-4 h-4" />
                            {addToCartText}
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">
                          {outOfStockText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductCard;
    `,

    compact: `
${commonImports}

interface ProductCardProps {
  ${dataName}?: any;
  products?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  ${dataName}: propData,
  products: productsProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};
  const products = productsProp || sourceData.products || (${dataName} ? [${dataName}] : null) || ${getField('products')};

  // Show loading state
  if (isLoading && !propData && !productsProp) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatPrice = ${formatPrice};

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const image = ${getField('image')};
          const productRating = ${getField('rating')};
          const inStock = ${getField('inStock')};

          return (
            <div key={productId} className={cn(styles.card, styles.cardHover, 'rounded-lg p-3 transition-all')}>
              <img
                src={image || '/api/placeholder/150/150'}
                alt={name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h4 className={\`text-sm font-bold truncate mb-1 \${styles.title}\`} title={name}>{name}</h4>
              {productRating && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className={\`text-xs \${styles.subtitle}\`}>{productRating}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={\`text-sm font-bold \${styles.title}\`}>{formatPrice(price)}</span>
                <button
                  className={cn(styles.badge, 'h-7 w-7 rounded-full flex items-center justify-center transition-all hover:scale-110')}
                  onClick={() => addToCart(product)}
                  disabled={!inStock}
                >
                  <Plus className={\`w-4 h-4 \${styles.accent}\`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductCard;
    `,

    detailed: `
${commonImports}

interface ProductCardProps {
  ${dataName}?: any;
  products?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  ${dataName}: propData,
  products: productsProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};
  const products = productsProp || sourceData.products || (${dataName} ? [${dataName}] : null) || ${getField('products')};

  const [selectedTab, setSelectedTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Show loading state
  if (isLoading && !propData && !productsProp) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const outOfStockText = ${getField('outOfStockText')};
  const saveBadgePrefix = ${getField('saveBadgePrefix')};
  const freeShippingText = ${getField('freeShippingText')};
  const returnsText = ${getField('returnsText')};
  const warrantyText = ${getField('warrantyText')};
  const descriptionTab = ${getField('descriptionTab')};
  const featuresTab = ${getField('featuresTab')};
  const reviewsTab = ${getField('reviewsTab')};
  const noDescriptionText = ${getField('noDescriptionText')};
  const noFeaturesText = ${getField('noFeaturesText')};
  const reviewsComingSoonText = ${getField('reviewsComingSoonText')};
  const quantityLabel = ${getField('quantityLabel')};
  const onlyLeftText = ${getField('onlyLeftText')};
  const leftInStockText = ${getField('leftInStockText')};

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

  const addToCart = (product: any, qty: number) => {
    console.log('Adding to cart:', product, 'Quantity:', qty);
  };

  const share = (product: any) => {
    console.log('Sharing:', product);
  };

  const handleQuantityDecrease = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <>
<div className="space-y-8 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const images = ${getField('images')} || [${getField('image')}];
          const description = ${getField('description')};
          const features = ${getField('features')};
          const category = ${getField('category')};
          const brand = ${getField('brand')};
          const sku = ${getField('sku')};
          const productRating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};
          const inStock = ${getField('inStock')};
          const stockCount = ${getField('stockCount')};

          return (
            <div key={productId} className={cn(styles.card, 'rounded-xl overflow-hidden')}>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={images[0] || '/api/placeholder/500/500'}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.slice(0, 4).map((img: any, idx: number) => (
                          <div key={idx} className="h-20 bg-gray-100 rounded cursor-pointer hover:opacity-80 overflow-hidden">
                            <img
                              src={img || '/api/placeholder/100/100'}
                              alt={\`\${name} \${idx + 1}\`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      {category && <span className={cn(styles.badge, 'px-3 py-1 rounded-full text-sm mb-2 inline-block')}>{category}</span>}
                      <h2 className={\`text-3xl font-bold mb-2 \${styles.title}\`}>{name}</h2>
                      {brand && <p className={styles.subtitle}>by {brand}</p>}
                      {sku && <p className={\`text-sm \${styles.subtitle}\`}>SKU: {sku}</p>}
                    </div>

                    {productRating && (
                      <div className="flex items-center gap-2">
                        {getRatingStars(productRating)}
                        <span className={\`font-bold \${styles.title}\`}>{productRating}</span>
                        {reviewCount && (
                          <span className={styles.subtitle}>({reviewCount} reviews)</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={\`text-3xl font-bold \${styles.title}\`}>{formatPrice(price)}</span>
                        {originalPrice && originalPrice > price && (
                          <>
                            <span className={\`text-xl line-through \${styles.subtitle}\`}>{formatPrice(originalPrice)}</span>
                            <span className={cn(styles.badge, 'px-2 py-1 rounded text-sm')}>
                              {saveBadgePrefix} {Math.round((1 - price/originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      {stockCount && stockCount < 10 && (
                        <p className="text-orange-600 text-sm">{onlyLeftText} {stockCount} {leftInStockText}</p>
                      )}
                    </div>

                    <div className={\`border-t border-b py-4 \${styles.border}\`}>
                      <div className="flex items-center gap-4">
                        <label className={\`font-bold \${styles.title}\`}>{quantityLabel}</label>
                        <div className="flex items-center gap-2">
                          <button
                            className={cn(styles.card, styles.cardHover, 'h-10 w-10 rounded-lg flex items-center justify-center font-bold')}
                            onClick={handleQuantityDecrease}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <span className={\`w-16 text-center font-bold text-lg \${styles.title}\`}>{quantity}</span>
                          <button
                            className={cn(styles.card, styles.cardHover, 'h-10 w-10 rounded-lg flex items-center justify-center font-bold')}
                            onClick={handleQuantityIncrease}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={cn(styles.button, styles.buttonHover, 'flex-1 font-bold py-3 rounded-lg flex items-center justify-center gap-2')}
                        onClick={() => addToCart(product, quantity)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {inStock ? addToCartText : outOfStockText}
                      </button>
                      <button
                        className={cn(styles.card, styles.cardHover, 'p-3 rounded-lg')}
                        onClick={() => toggleWishlist(productId)}
                      >
                        <Heart
                          className={\`w-5 h-5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : styles.accent}\`}
                        />
                      </button>
                      <button
                        className={cn(styles.card, styles.cardHover, 'p-3 rounded-lg')}
                        onClick={() => share(product)}
                      >
                        <Share2 className={\`w-5 h-5 \${styles.accent}\`} />
                      </button>
                    </div>

                    <div className={cn(styles.card, 'flex justify-around py-4 rounded-lg')}>
                      <div className="flex items-center gap-2">
                        <Truck className={\`w-5 h-5 \${styles.accent}\`} />
                        <span className={\`text-sm \${styles.text}\`}>{freeShippingText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className={\`w-5 h-5 \${styles.accent}\`} />
                        <span className={\`text-sm \${styles.text}\`}>{returnsText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className={\`w-5 h-5 \${styles.accent}\`} />
                        <span className={\`text-sm \${styles.text}\`}>{warrantyText}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className={\`flex gap-4 border-b \${styles.border}\`}>
                        {[
                          { key: 'description', label: descriptionTab },
                          { key: 'features', label: featuresTab },
                          { key: 'reviews', label: reviewsTab }
                        ].map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            className={\`pb-2 px-1 text-sm font-medium transition-colors \${selectedTab === tab.key ? \`border-b-2 \${styles.accent}\` : styles.subtitle}\`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="pt-4">
                        {selectedTab === 'description' && (
                          <p className={styles.text}>{description || noDescriptionText}</p>
                        )}
                        {selectedTab === 'features' && (
                          features && features.length > 0 ? (
                            <ul className="space-y-2">
                              {features.map((feature: any, idx: number) => (
                                <li key={idx} className={\`flex items-start \${styles.text}\`}>
                                  <span className={\`mr-2 \${styles.accent}\`}>•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={styles.subtitle}>{noFeaturesText}</p>
                          )
                        )}
                        {selectedTab === 'reviews' && (
                          <p className={styles.subtitle}>{reviewsComingSoonText}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductCard;
    `,

    minimal: `
${commonImports}

interface ProductCardProps {
  ${dataName}?: any;
  products?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAddToCart?: (product: any) => void;
  onProductClick?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  ${dataName}: propData,
  products: productsProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const styles = getVariantStyles(variant, colorScheme);
  const sourceData = ${dataName} || {};
  const products = productsProp || sourceData.products || (${dataName} ? [${dataName}] : null) || ${getField('products')};

  // Show loading state
  if (isLoading && !propData && !productsProp) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatPrice = ${formatPrice};

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  return (
    <>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const image = ${getField('image')};
          const productRating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};

          return (
            <div
              key={productId}
              className={cn(styles.card, styles.cardHover, 'rounded-lg p-3 cursor-pointer transition-all')}
              onClick={() => handleProductClick(product)}
            >
              <img
                src={image || '/api/placeholder/200/200'}
                alt={name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h4 className={\`text-sm font-bold truncate mb-1 \${styles.title}\`}>{name}</h4>
              {productRating && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className={\`text-xs \${styles.subtitle}\`}>
                    {productRating} {reviewCount && \`(\${reviewCount})\`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={\`text-sm font-bold \${styles.title}\`}>{formatPrice(price)}</span>
                {originalPrice && originalPrice > price && (
                  <span className={\`text-xs line-through \${styles.subtitle}\`}>
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductCard;
    `
  };

  return variants[variant] || variants.grid;
};