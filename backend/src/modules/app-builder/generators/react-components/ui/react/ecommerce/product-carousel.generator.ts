import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductCarousel = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withBadges' | 'withQuickActions' | 'minimalWithColors' | 'compactCards' | 'fashionCarousel' = 'basic'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart, Eye, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const commonStyles = `
    .carousel-container {
      @apply relative w-full overflow-hidden;
    }

    .carousel-track {
      @apply flex transition-transform duration-300 ease-in-out;
    }

    .carousel-item {
      @apply flex-shrink-0 px-2;
    }

    .product-card {
      @apply bg-white rounded-lg overflow-hidden transition-all duration-300;
    }

    .product-image {
      @apply w-full h-full object-cover transition-transform duration-300;
    }

    .product-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md;
    }

    .product-actions {
      @apply absolute top-2 right-2 flex flex-col gap-2;
    }

    .action-button {
      @apply p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-md;
    }
  `;

  const variants = {
    basic: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  slidesToShow?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  slidesToShow = ${getField('defaultSlidesToShow')},
  autoplay = ${getField('defaultAutoplay')},
  autoplaySpeed = ${getField('defaultAutoplaySpeed')},
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const handleAddToCart = (product: any) => {
    console.log('Add to cart:', product);
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
<div className={cn('carousel-container', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="relative">
          <div
            className="carousel-track"
            style={{
              transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
            }}
          >
            {products.map((product: any, index: number) => {
              const productId = ${getField('id')} || index;
              const name = ${getField('name')};
              const price = ${getField('price')};
              const image = ${getField('image')};
              const rating = ${getField('rating')};
              const reviewCount = ${getField('reviewCount')};

              return (
                <div
                  key={productId}
                  className="carousel-item"
                  style={{ width: \`\${100 / slidesToShow}%\` }}
                  onMouseEnter={() => setHoveredProduct(productId)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Card className="product-card hover:shadow-lg">
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={image || '/api/placeholder/200/200'}
                        alt={name}
                        className="product-image"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold truncate text-gray-900 dark:text-white">{name}</h3>
                      {rating && (
                        <div className="flex items-center gap-1 my-2">
                          {getRatingStars(rating)}
                          <span className="text-sm text-gray-500">
                            {rating} {reviewCount && \`(\${reviewCount})\`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {products.length > slidesToShow && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                onClick={handleNext}
                disabled={(currentIndex + 1) * slidesToShow >= products.length}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `,

    withBadges: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  slidesToShow?: number;
  autoplay?: boolean;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  slidesToShow = ${getField('defaultSlidesToShow')},
  autoplay = ${getField('defaultAutoplay')},
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

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

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const handleQuickView = (product: any) => {
    console.log('Quick view:', product);
  };

  const handleAddToCart = (product: any) => {
    console.log('Add to cart:', product);
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
<div className={cn('carousel-container', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="relative">
          <div
            className="carousel-track"
            style={{
              transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
            }}
          >
            {products.map((product: any, index: number) => {
              const productId = ${getField('id')} || index;
              const name = ${getField('name')};
              const price = ${getField('price')};
              const originalPrice = ${getField('originalPrice')};
              const image = ${getField('image')};
              const badge = ${getField('badge')};
              const discount = ${getField('discount')};
              const rating = ${getField('rating')};
              const reviewCount = ${getField('reviewCount')};
              const inStock = ${getField('inStock')};

              return (
                <div
                  key={productId}
                  className="carousel-item"
                  style={{ width: \`\${100 / slidesToShow}%\` }}
                >
                  <Card className="product-card hover:shadow-xl">
                    <div className="relative h-56 bg-gray-100">
                      {badge && (
                        <Badge className="product-badge bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      {discount && (
                        <Badge className="absolute top-2 left-16 bg-green-500 text-white">
                          -{discount}%
                        </Badge>
                      )}
                      <div className="product-actions">
                        <button
                          onClick={() => toggleWishlist(productId)}
                          className="action-button"
                        >
                          <Heart
                            className={\`w-4 h-4 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`}
                          />
                        </button>
                        <button 
                          className="action-button"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <img
                        src={image || '/api/placeholder/200/200'}
                        alt={name}
                        className="product-image hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate text-gray-900 dark:text-white">{name}</h3>
                      {rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {getRatingStars(rating)}
                          <span className="text-xs text-gray-500">
                            {rating} {reviewCount && \`(\${reviewCount})\`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-sm line-through text-gray-400">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        className="w-full font-bold"
                        size="sm"
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {inStock ? addToCartText : outOfStockText}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {products.length > slidesToShow && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
                onClick={handleNext}
                disabled={(currentIndex + 1) * slidesToShow >= products.length}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `,

    withQuickActions: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  slidesToShow?: number;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  slidesToShow = ${getField('defaultSlidesToShow')},
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addText = ${getField('addText')};

  const formatPrice = ${formatPrice};

  const handleQuickView = (product: any) => {
    console.log('Quick view:', product);
  };

  const handleAddToCart = (product: any) => {
    console.log('Add to cart:', product);
  };

  const handleAddToWishlist = (product: any) => {
    console.log('Add to wishlist:', product);
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
<div className={cn('carousel-container', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="relative">
          <div
            className="carousel-track"
            style={{
              transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
            }}
          >
            {products.map((product: any, index: number) => {
              const productId = ${getField('id')} || index;
              const name = ${getField('name')};
              const price = ${getField('price')};
              const image = ${getField('image')};
              const category = ${getField('category')};

              return (
                <div
                  key={productId}
                  className="carousel-item"
                  style={{ width: \`\${100 / slidesToShow}%\` }}
                  onMouseEnter={() => setHoveredProduct(productId)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Card className="product-card hover:shadow-xl">
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <img
                        src={image || '/api/placeholder/200/200'}
                        alt={name}
                        className="product-image"
                      />
                      {hoveredProduct === productId && (
                        <div className="quick-actions">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAddToWishlist(product)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addText}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleQuickView(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {category && (
                        <p className="text-xs text-gray-500 mb-1">{category}</p>
                      )}
                      <h3 className="font-medium text-sm mb-2 truncate text-gray-900 dark:text-white">{name}</h3>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {products.length > slidesToShow && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
                onClick={handleNext}
                disabled={(currentIndex + 1) * slidesToShow >= products.length}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `,

    minimalWithColors: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  slidesToShow?: number;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  slidesToShow = ${getField('defaultSlidesToShow')},
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatPrice = ${formatPrice};

  const handleColorSelect = (productId: string, color: any) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
    console.log('Color selected for product:', productId, 'color:', color);
  };

  const handleAddProduct = (product: any) => {
    console.log('Add product:', product);
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
<div className={cn('carousel-container', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="relative">
          <div
            className="carousel-track"
            style={{
              transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
            }}
          >
            {products.map((product: any, index: number) => {
              const productId = ${getField('id')} || index;
              const name = ${getField('name')};
              const price = ${getField('price')};
              const image = ${getField('image')};
              const colors = ${getField('colors')};

              return (
                <div
                  key={productId}
                  className="carousel-item"
                  style={{ width: \`\${100 / slidesToShow}%\` }}
                >
                  <div className="product-card p-4">
                    <div className="relative h-48 bg-gray-50 rounded-lg mb-3">
                      <img
                        src={image || '/api/placeholder/200/200'}
                        alt={name}
                        className="product-image rounded-lg"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-2 truncate text-gray-900 dark:text-white">{name}</h3>
                    {colors && colors.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {colors.map((color: any, idx: number) => (
                          <button
                            key={idx}
                            className={\`color-option \${selectedColors[productId] === color ? 'selected' : ''}\`}
                            style={{ backgroundColor: typeof color === 'string' ? color : color.hex || color.value }}
                            onClick={() => handleColorSelect(productId, color)}
                            title={typeof color === 'object' ? color.name : color}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleAddProduct(product)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length > slidesToShow && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                onClick={handleNext}
                disabled={(currentIndex + 1) * slidesToShow >= products.length}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `,

    compactCards: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  // Show loading state
  if (isLoading && !propData) {
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
<div className={cn('w-full', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="compact-grid">
          {products.slice(0, 10).map((product: any, index: number) => {
            const productId = ${getField('id')} || index;
            const name = ${getField('name')};
            const price = ${getField('price')};
            const image = ${getField('image')};
            const rating = ${getField('rating')};

            return (
              <div 
                key={productId} 
                className="compact-card"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={image || '/api/placeholder/150/150'}
                  alt={name}
                  className="compact-image"
                />
                <h4 className="text-sm font-bold truncate text-gray-900 dark:text-white">{name}</h4>
                {rating && (
                  <div className="flex items-center gap-1 my-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{rating}</span>
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(price)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `,

    fashionCarousel: `
${commonImports}

interface ProductCarouselProps {
  ${dataName}?: any;
  title?: string;
  slidesToShow?: number;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  ${dataName}: propData,
  title,
  slidesToShow = ${getField('defaultSlidesToShow')},
  className
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const carouselData = ${dataName} || {};
  const products = carouselData.products || ${getField('products')};

  const [currentIndex, setCurrentIndex] = useState(0);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const quickShopText = ${getField('quickShopText')};
  const formatPrice = ${formatPrice};

  const handleQuickShop = (product: any) => {
    console.log('Quick shop:', product);
  };

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
<div className={cn('carousel-container', className)}>
        {title && (
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
        )}

        <div className="relative">
          <div
            className="carousel-track"
            style={{
              transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
            }}
          >
            {products.map((product: any, index: number) => {
              const productId = ${getField('id')} || index;
              const name = ${getField('name')};
              const price = ${getField('price')};
              const image = ${getField('image')};
              const category = ${getField('category')};
              const badge = ${getField('badge')};

              return (
                <div
                  key={productId}
                  className="carousel-item"
                  style={{ width: \`\${100 / slidesToShow}%\` }}
                >
                  <div className="fashion-card h-96">
                    {badge && (
                      <Badge className="absolute top-3 left-3 z-10 bg-black text-white">
                        {badge}
                      </Badge>
                    )}
                    <img
                      src={image || '/api/placeholder/300/400'}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    <div className="fashion-overlay" />
                    <div className="fashion-details">
                      {category && (
                        <p className="text-xs uppercase tracking-wide mb-1 opacity-75">
                          {category}
                        </p>
                      )}
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleQuickShop(product)}
                        >
                          {quickShopText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length > slidesToShow && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={handleNext}
                disabled={(currentIndex + 1) * slidesToShow >= products.length}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCarousel;
    `
  };

  return variants[variant] || variants.basic;
};
