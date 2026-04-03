import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductQuickView = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' = 'compact'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Star, Check, ExternalLink, X, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .quick-view-modal {
      @apply max-w-4xl;
    }

    .quick-view-content {
      @apply p-0;
    }

    .image-container {
      @apply relative bg-gray-100 rounded-lg overflow-hidden;
    }

    .product-image {
      @apply w-full h-full object-cover;
    }

    .image-thumbnails {
      @apply flex gap-2 mt-2;
    }

    .thumbnail {
      @apply w-16 h-16 cursor-pointer border-2 border-transparent rounded overflow-hidden transition-all hover:border-blue-500;
    }

    .thumbnail.active {
      @apply border-blue-500;
    }

    .variant-selector {
      @apply space-y-3;
    }

    .variant-option {
      @apply px-3 py-2 border-2 rounded-lg cursor-pointer transition-all text-sm;
    }

    .variant-option.selected {
      @apply border-blue-500 bg-blue-50;
    }

    .variant-option.unavailable {
      @apply opacity-50 cursor-not-allowed;
    }

    .color-swatch {
      @apply w-8 h-8 rounded-full border-2 cursor-pointer transition-all;
    }

    .color-swatch.selected {
      @apply ring-2 ring-blue-500 ring-offset-2;
    }

    .quantity-selector {
      @apply flex items-center gap-2;
    }

    .view-details-link {
      @apply text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm;
    }
  `;

  const variants = {
    compact: `
${commonImports}

interface ProductQuickViewProps {
  ${dataName}?: any;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ ${dataName}: initialData, isOpen, onClose, className }) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading && !${dataName}) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </DialogContent>
      </Dialog>
    );
  }

  const sourceData = ${dataName} || {};
  const product = productData.product || ${getField('product')};

  const addToCartText = ${getField('addToCartText')};
  const viewFullDetailsText = ${getField('viewFullDetailsText')};
  const quantityLabel = ${getField('quantityLabel')};
  const inStockText = ${getField('inStockText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const productId = ${getField('id')};
  const name = ${getField('name')};
  const price = ${getField('price')};
  const originalPrice = ${getField('originalPrice')};
  const images = ${getField('images')} || [${getField('image')}];
  const description = ${getField('description')};
  const brand = ${getField('brand')};
  const sku = ${getField('sku')};
  const productRating = ${getField('rating')};
  const reviewCount = ${getField('reviewCount')};
  const discount = ${getField('discount')};
  const badge = ${getField('badge')};
  const inStock = ${getField('inStock')};

  const handleAddToCart = () => {
    console.log('Quick add to cart:', { productId, quantity });
    onClose();
  };

  const handleViewFullDetails = () => {
    console.log('View full details:', productId);
    onClose();
  };

  return (
    <>
<Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="quick-view-modal quick-view-content max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quick View - {name}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Section */}
            <div>
              <div className="image-container h-80">
                {badge && (
                  <Badge className="absolute top-2 left-2 z-10 bg-blue-500">
                    {badge}
                  </Badge>
                )}
                <img
                  src={images[selectedImage] || '/api/placeholder/500/500'}
                  alt={name}
                  className="product-image"
                />
              </div>
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.slice(0, 4).map((img: any, idx: number) => (
                    <div
                      key={idx}
                      className={\`thumbnail \${selectedImage === idx ? 'active' : ''}\`}
                      onClick={() => setSelectedImage(idx)}
                    >
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

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{name}</h2>
                {brand && <p className="text-sm text-gray-600">by {brand}</p>}
                {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
              </div>

              {productRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getRatingStars(productRating)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{productRating}</span>
                  {reviewCount && (
                    <span className="text-sm text-gray-500">({reviewCount})</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
                    {discount && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        -{discount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <Badge variant="outline" className={inStock ? 'text-green-600' : 'text-red-600'}>
                <Check className="w-3 h-3 mr-1" />
                {inStock ? inStockText : outOfStockText}
              </Badge>

              {description && (
                <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
              )}

              <Separator />

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-bold mb-2 block text-gray-900 dark:text-white">{quantityLabel}</label>
                <div className="quantity-selector">
                  <Button
                    variant="outline"
                    className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg font-bold">-</span>
                  </Button>
                  <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <Button
                    variant="outline"
                    className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg font-bold">+</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full font-bold"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addToCartText}
                </Button>
                <button
                  onClick={handleViewFullDetails}
                  className="view-details-link w-full text-center font-bold"
                >
                  {viewFullDetailsText}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductQuickView;
    `,

    detailed: `
${commonImports}

interface ProductQuickViewProps {
  ${dataName}?: any;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ ${dataName}: initialData, isOpen, onClose, className }) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading && !${dataName}) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </DialogContent>
      </Dialog>
    );
  }

  const sourceData = ${dataName} || {};
  const product = productData.product || ${getField('product')};

  const addToCartText = ${getField('addToCartText')};
  const viewFullDetailsText = ${getField('viewFullDetailsText')};
  const quantityLabel = ${getField('quantityLabel')};
  const sizeLabel = ${getField('sizeLabel')};
  const colorLabel = ${getField('colorLabel')};
  const inStockText = ${getField('inStockText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const productId = ${getField('id')};
  const name = ${getField('name')};
  const price = ${getField('price')};
  const originalPrice = ${getField('originalPrice')};
  const images = ${getField('images')} || [${getField('image')}];
  const description = ${getField('description')};
  const brand = ${getField('brand')};
  const category = ${getField('category')};
  const sku = ${getField('sku')};
  const productRating = ${getField('rating')};
  const reviewCount = ${getField('reviewCount')};
  const discount = ${getField('discount')};
  const badge = ${getField('badge')};
  const inStock = ${getField('inStock')};
  const variants = ${getField('variants')} || { colors: [], sizes: [] };
  const features = ${getField('features')} || [];

  const handleAddToCart = () => {
    console.log('Quick add to cart:', {
      productId,
      quantity,
      color: variants.colors[selectedColor],
      size: variants.sizes[selectedSize]
    });
    onClose();
  };

  const handleViewFullDetails = () => {
    console.log('View full details:', productId);
    onClose();
  };

  return (
    <>
<Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="quick-view-modal quick-view-content max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quick View - {name}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Section */}
            <div>
              <div className="image-container h-96">
                {badge && (
                  <Badge className="absolute top-2 left-2 z-10 bg-blue-500">
                    {badge}
                  </Badge>
                )}
                <img
                  src={images[selectedImage] || '/api/placeholder/600/600'}
                  alt={name}
                  className="product-image"
                />
              </div>
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.map((img: any, idx: number) => (
                    <div
                      key={idx}
                      className={\`thumbnail \${selectedImage === idx ? 'active' : ''}\`}
                      onClick={() => setSelectedImage(idx)}
                    >
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

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{name}</h2>
                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {brand && <span className="font-bold">{brand}</span>}
                  {category && <span>• {category}</span>}
                </div>
                {sku && <p className="text-xs text-gray-500 mt-1">SKU: {sku}</p>}
              </div>

              {productRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getRatingStars(productRating)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{productRating}</span>
                  {reviewCount && (
                    <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
                    {discount && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Save {discount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <Badge variant="outline" className={inStock ? 'text-green-600' : 'text-red-600'}>
                <Check className="w-3 h-3 mr-1" />
                {inStock ? inStockText : outOfStockText}
              </Badge>

              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}

              {features && features.length > 0 && (
                <ul className="space-y-1">
                  {features.slice(0, 4).map((feature: any, idx: number) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Separator />

              {/* Variant Selection */}
              <div className="variant-selector">
                {variants.colors && variants.colors.length > 0 && (
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900 dark:text-white">{colorLabel}</label>
                    <div className="flex gap-2">
                      {variants.colors.map((color: any, idx: number) => (
                        <div
                          key={idx}
                          className={\`color-swatch \${selectedColor === idx ? 'selected' : ''} \${!color.available ? 'opacity-50 cursor-not-allowed' : ''}\`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => color.available && setSelectedColor(idx)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {variants.sizes && variants.sizes.length > 0 && (
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900 dark:text-white">{sizeLabel}</label>
                    <div className="flex gap-2">
                      {variants.sizes.map((size: any, idx: number) => (
                        <div
                          key={idx}
                          className={\`variant-option \${selectedSize === idx ? 'selected' : ''} \${!size.available ? 'unavailable' : ''}\`}
                          onClick={() => size.available && setSelectedSize(idx)}
                        >
                          {size.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-bold mb-2 block text-gray-900 dark:text-white">{quantityLabel}</label>
                <div className="quantity-selector">
                  <Button
                    variant="outline"
                    className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg font-bold">-</span>
                  </Button>
                  <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <Button
                    variant="outline"
                    className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg font-bold">+</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full font-bold"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addToCartText}
                </Button>
                <button
                  onClick={handleViewFullDetails}
                  className="view-details-link w-full text-center font-bold"
                >
                  {viewFullDetailsText}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductQuickView;
    `
  };

  return variants[variant] || variants.compact;
};
