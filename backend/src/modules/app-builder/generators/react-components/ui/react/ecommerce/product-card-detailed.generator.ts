import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductCardDetailed = (
  resolved: ResolvedComponent,
  variant: 'expanded' | 'luxury' | 'premium' = 'expanded'
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
          <Star key={\`full-\${i}\`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-5 h-5 text-gray-300" />
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
import { Star, Heart, Share2, ShoppingCart, Truck, RefreshCw, Shield, Check, Plus, Minus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .detailed-card-container {
      @apply w-full max-w-7xl mx-auto;
    }

    .detailed-card {
      @apply bg-white dark:bg-gray-800 rounded-xl overflow-hidden;
    }

    .image-gallery-main {
      @apply relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700;
    }

    .gallery-main-image {
      @apply w-full h-full object-cover;
    }

    .image-thumbnails {
      @apply grid grid-cols-5 gap-2;
    }

    .thumbnail {
      @apply relative overflow-hidden rounded-md cursor-pointer border-2 transition-all;
    }

    .thumbnail.active {
      @apply border-blue-600;
    }

    .thumbnail:not(.active) {
      @apply border-transparent hover:border-gray-300;
    }

    .thumbnail-image {
      @apply w-full h-full object-cover;
    }

    .product-title {
      @apply text-3xl font-bold mb-2;
    }

    .product-subtitle {
      @apply text-gray-600 dark:text-gray-400 mb-4;
    }

    .rating-section {
      @apply flex items-center gap-2 mb-4;
    }

    .price-section {
      @apply mb-6;
    }

    .current-price {
      @apply text-4xl font-bold;
    }

    .original-price {
      @apply text-xl line-through text-gray-400 ml-3;
    }

    .discount-badge {
      @apply ml-3 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-semibold;
    }

    .variant-selector {
      @apply mb-6;
    }

    .variant-label {
      @apply text-sm font-semibold mb-2 block;
    }

    .variant-options {
      @apply flex flex-wrap gap-2;
    }

    .variant-option {
      @apply px-4 py-2 border-2 rounded-lg cursor-pointer transition-all;
    }

    .variant-option.selected {
      @apply border-blue-600 bg-blue-50 dark:bg-blue-900/20;
    }

    .variant-option:not(.selected) {
      @apply border-gray-300 hover:border-gray-400;
    }

    .variant-option.unavailable {
      @apply opacity-40 cursor-not-allowed;
    }

    .quantity-selector {
      @apply flex items-center gap-3 mb-6;
    }

    .quantity-button {
      @apply w-10 h-10 p-0 rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .quantity-display {
      @apply w-16 text-center text-lg font-semibold;
    }

    .action-buttons {
      @apply flex gap-3 mb-6;
    }

    .benefits-grid {
      @apply grid grid-cols-2 md:grid-cols-4 gap-4 py-6;
    }

    .benefit-item {
      @apply flex flex-col items-center text-center;
    }

    .specs-table {
      @apply w-full;
    }

    .specs-row {
      @apply border-b border-gray-200 dark:border-gray-700;
    }

    .specs-label {
      @apply py-3 px-4 bg-gray-50 dark:bg-gray-900 font-medium;
    }

    .specs-value {
      @apply py-3 px-4;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .detailed-card {
        @apply bg-gray-800;
      }
      .image-gallery-main {
        @apply bg-gray-700;
      }
    }
  `;

  const variants = {
    expanded: `
${commonImports}

interface ProductCardDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardDetailed: React.FC<ProductCardDetailedProps> = ({ ${dataName}: initialData, className }) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('description');

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};
  const products = productData.products || ${getField('products')};

  const addToCartText = ${getField('addToCartText')};
  const buyNowText = ${getField('buyNowText')};
  const addToWishlistText = ${getField('addToWishlistText')};
  const shareText = ${getField('shareText')};
  const outOfStockText = ${getField('outOfStockText')};
  const quantityLabel = ${getField('quantityLabel')};
  const skuLabel = ${getField('skuLabel')};
  const categoryLabel = ${getField('categoryLabel')};
  const brandLabel = ${getField('brandLabel')};
  const reviewsText = ${getField('reviewsText')};
  const colorsTitle = ${getField('colorsTitle')};
  const descriptionTitle = ${getField('descriptionTitle')};
  const specificationsTitle = ${getField('specificationsTitle')};
  const featuresTitle = ${getField('featuresTitle')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const handlePreviousImage = (images: any[]) => {
    setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (images: any[]) => {
    setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (product: any) => {
    console.log('Adding to cart:', product, 'Quantity:', quantity, 'Color:', selectedColor);
  };

  const handleBuyNow = (product: any) => {
    console.log('Buy now:', product, 'Quantity:', quantity, 'Color:', selectedColor);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleShare = (product: any) => {
    console.log('Sharing product:', product);
  };

  return (
    <>
<div className="detailed-card-container p-6">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const images = ${getField('images')};
          const description = ${getField('description')};
          const fullDescription = ${getField('fullDescription')};
          const features = ${getField('features')};
          const specifications = ${getField('specifications')};
          const category = ${getField('category')};
          const brand = ${getField('brand')};
          const sku = ${getField('sku')};
          const rating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};
          const discount = ${getField('discount')};
          const badge = ${getField('badge')};
          const inStock = ${getField('inStock')};
          const stockCount = ${getField('stockCount')};
          const variants = ${getField('variants')};

          const colors = variants?.colors || [];

          return (
            <Card key={productId} className="detailed-card">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    <div className="image-gallery-main aspect-square relative">
                      {badge && (
                        <Badge className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-500 text-white">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={images[selectedImageIndex] || '/api/placeholder/600/600'}
                        alt={\`\${name} - Image \${selectedImageIndex + 1}\`}
                        className="gallery-main-image"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePreviousImage(images)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleNextImage(images)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="image-thumbnails">
                        {images.slice(0, 5).map((img: any, idx: number) => (
                          <div
                            key={idx}
                            className={\`thumbnail \${selectedImageIndex === idx ? 'active' : ''}\`}
                            onClick={() => setSelectedImageIndex(idx)}
                          >
                            <img
                              src={img || '/api/placeholder/120/120'}
                              alt={\`Thumbnail \${idx + 1}\`}
                              className="thumbnail-image aspect-square"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h1 className="product-title">{name}</h1>
                      <div className="product-subtitle">
                        {brand && <span>{brandLabel}: {brand}</span>}
                        {category && <span> • {category}</span>}
                        {sku && <span> • {skuLabel}: {sku}</span>}
                      </div>
                    </div>

                    {rating && (
                      <div className="rating-section">
                        {getRatingStars(rating)}
                        <span className="font-semibold text-lg">{rating}</span>
                        {reviewCount && (
                          <span className="text-gray-600">({reviewCount} {reviewsText})</span>
                        )}
                      </div>
                    )}

                    <div className="price-section">
                      <div className="flex items-baseline">
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
                    </div>

                    <Separator />

                    {description && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {description}
                      </p>
                    )}

                    {/* Color Variants */}
                    {colors.length > 0 && (
                      <div className="variant-selector">
                        <label className="variant-label">{colorsTitle}</label>
                        <div className="variant-options">
                          {colors.map((color: any) => (
                            <button
                              key={color.value}
                              onClick={() => color.available && setSelectedColor(color.value)}
                              disabled={!color.available}
                              className={\`variant-option \${
                                selectedColor === color.value ? 'selected' : ''
                              } \${!color.available ? 'unavailable' : ''}\`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-sm font-medium">{color.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="quantity-selector">
                      <label className="font-semibold">{quantityLabel}:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="quantity-button"
                          disabled={quantity <= 1}
                        >
                          <span className="text-lg font-bold">-</span>
                        </button>
                        <span className="quantity-display font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="quantity-button"
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                      {stockCount > 0 && stockCount < 10 && (
                        <span className="text-orange-600 text-sm">
                          Only {stockCount} left in stock!
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <Button
                        size="lg"
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {inStock ? addToCartText : outOfStockText}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => toggleWishlist(productId)}
                      >
                        <Heart
                          className={\`w-5 h-5 \${
                            wishlist.includes(productId)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }\`}
                        />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleShare(product)}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {inStock && (
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleBuyNow(product)}
                      >
                        {buyNowText}
                      </Button>
                    )}

                    <Separator />

                    {/* Product Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description">{descriptionTitle}</TabsTrigger>
                        <TabsTrigger value="features">{featuresTitle}</TabsTrigger>
                        <TabsTrigger value="specifications">{specificationsTitle}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="mt-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {fullDescription || description}
                        </p>
                      </TabsContent>
                      <TabsContent value="features" className="mt-4">
                        {features && features.length > 0 ? (
                          <ul className="space-y-2">
                            {features.map((feature: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No features listed.</p>
                        )}
                      </TabsContent>
                      <TabsContent value="specifications" className="mt-4">
                        {specifications && specifications.length > 0 ? (
                          <table className="specs-table">
                            <tbody>
                              {specifications.map((spec: any, idx: number) => (
                                <tr key={idx} className="specs-row">
                                  <td className="specs-label w-1/3">{spec.label}</td>
                                  <td className="specs-value">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-500">No specifications available.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardDetailed;
    `,

    luxury: `
${commonImports}

interface ProductCardDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardDetailed: React.FC<ProductCardDetailedProps> = ({ ${dataName}: initialData, className }) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};
  const products = productData.products || ${getField('products')};

  const addToCartText = ${getField('addToCartText')};
  const buyNowText = ${getField('buyNowText')};
  const quantityLabel = ${getField('quantityLabel')};
  const freeShippingText = ${getField('freeShippingText')};
  const returnsText = ${getField('returnsText')};
  const warrantyText = ${getField('warrantyText')};
  const secureCheckoutText = ${getField('secureCheckoutText')};
  const reviewsText = ${getField('reviewsText')};
  const colorsTitle = ${getField('colorsTitle')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const handleAddToCart = (product: any) => {
    console.log('Adding to cart:', product, 'Quantity:', quantity, 'Color:', selectedColor);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <>
<div className="detailed-card-container p-8">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const images = ${getField('images')};
          const description = ${getField('description')};
          const features = ${getField('features')};
          const brand = ${getField('brand')};
          const rating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};
          const badge = ${getField('badge')};
          const inStock = ${getField('inStock')};
          const stockCount = ${getField('stockCount')};
          const variants = ${getField('variants')};
          const shippingInfo = ${getField('shippingInfo')};

          const colors = variants?.colors || [];

          return (
            <Card key={productId} className="luxury-card">
              <CardContent className="p-12">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Image Gallery */}
                  <div className="space-y-6">
                    <div className="image-gallery-main aspect-square relative rounded-2xl overflow-hidden shadow-xl">
                      {badge && (
                        <Badge className="luxury-badge absolute top-6 left-6 z-10">
                          {badge}
                        </Badge>
                      )}
                      <img
                        src={images[selectedImageIndex] || '/api/placeholder/700/700'}
                        alt={\`\${name} - Image \${selectedImageIndex + 1}\`}
                        className="gallery-main-image"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-3 justify-center">
                        {images.slice(0, 5).map((img: any, idx: number) => (
                          <div
                            key={idx}
                            className={\`thumbnail w-20 h-20 rounded-lg \${
                              selectedImageIndex === idx ? 'active ring-4 ring-amber-500' : ''
                            }\`}
                            onClick={() => setSelectedImageIndex(idx)}
                          >
                            <img
                              src={img || '/api/placeholder/80/80'}
                              alt={\`Thumbnail \${idx + 1}\`}
                              className="thumbnail-image"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-6">
                    {brand && (
                      <p className="text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        {brand}
                      </p>
                    )}

                    <h1 className="luxury-title">{name}</h1>

                    {rating && (
                      <div className="rating-section">
                        {getRatingStars(rating)}
                        <span className="font-semibold text-lg ml-2">{rating}</span>
                        {reviewCount && (
                          <span className="text-gray-600 ml-2">
                            ({reviewCount} {reviewsText})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="price-section">
                      <span className="luxury-price">{formatPrice(price)}</span>
                      {originalPrice && originalPrice > price && (
                        <span className="original-price text-2xl ml-4">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    <Separator className="my-8" />

                    {description && (
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {description}
                      </p>
                    )}

                    {colors.length > 0 && (
                      <div className="variant-selector">
                        <label className="variant-label text-base">{colorsTitle}</label>
                        <div className="variant-options">
                          {colors.map((color: any) => (
                            <button
                              key={color.value}
                              onClick={() => color.available && setSelectedColor(color.value)}
                              disabled={!color.available}
                              className={\`variant-option \${
                                selectedColor === color.value ? 'selected' : ''
                              } \${!color.available ? 'unavailable' : ''}\`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-6 h-6 rounded-full shadow-md"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="font-medium">{color.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="quantity-selector">
                      <label className="font-semibold text-base">{quantityLabel}:</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="quantity-button w-12 h-12"
                          disabled={quantity <= 1}
                        >
                          <span className="text-xl font-bold">-</span>
                        </button>
                        <span className="quantity-display text-xl w-20 font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="quantity-button w-12 h-12"
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {addToCartText}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-lg"
                        onClick={() => toggleWishlist(productId)}
                      >
                        <Heart
                          className={\`w-5 h-5 mr-2 \${
                            wishlist.includes(productId)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }\`}
                        />
                        Add to Wishlist
                      </Button>
                    </div>

                    <Separator className="my-8" />

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="benefit-item">
                        <Truck className="w-8 h-8 mb-2 text-amber-600" />
                        <span className="text-sm font-medium">{freeShippingText}</span>
                      </div>
                      <div className="benefit-item">
                        <RefreshCw className="w-8 h-8 mb-2 text-amber-600" />
                        <span className="text-sm font-medium">{returnsText}</span>
                      </div>
                      <div className="benefit-item">
                        <Shield className="w-8 h-8 mb-2 text-amber-600" />
                        <span className="text-sm font-medium">{warrantyText}</span>
                      </div>
                      <div className="benefit-item">
                        <Check className="w-8 h-8 mb-2 text-amber-600" />
                        <span className="text-sm font-medium">{secureCheckoutText}</span>
                      </div>
                    </div>

                    {features && features.length > 0 && (
                      <>
                        <Separator className="my-8" />
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                          <ul className="space-y-3">
                            {features.slice(0, 5).map((feature: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardDetailed;
    `,

    premium: `
${commonImports}

interface ProductCardDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardDetailed: React.FC<ProductCardDetailedProps> = ({ ${dataName}: initialData, className }) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};
  const products = productData.products || ${getField('products')};

  const addToCartText = ${getField('addToCartText')};
  const buyNowText = ${getField('buyNowText')};
  const quantityLabel = ${getField('quantityLabel')};
  const reviewsText = ${getField('reviewsText')};
  const colorsTitle = ${getField('colorsTitle')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const handleAddToCart = (product: any) => {
    console.log('Adding to cart:', product, 'Quantity:', quantity, 'Color:', selectedColor);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <>
<div className="detailed-card-container p-6">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const images = ${getField('images')};
          const description = ${getField('description')};
          const features = ${getField('features')};
          const specifications = ${getField('specifications')};
          const brand = ${getField('brand')};
          const rating = ${getField('rating')};
          const reviewCount = ${getField('reviewCount')};
          const discount = ${getField('discount')};
          const inStock = ${getField('inStock')};
          const variants = ${getField('variants')};

          const colors = variants?.colors || [];

          return (
            <Card key={productId} className="premium-card">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-5 gap-0">
                  {/* Image Gallery - 3 columns */}
                  <div className="lg:col-span-3 p-8 bg-gray-50 dark:bg-gray-950">
                    <div className="sticky top-8">
                      <div className="image-gallery-main aspect-square relative rounded-xl overflow-hidden mb-4">
                        <img
                          src={images[selectedImageIndex] || '/api/placeholder/800/800'}
                          alt={\`\${name} - Image \${selectedImageIndex + 1}\`}
                          className="gallery-main-image"
                        />
                      </div>
                      {images.length > 1 && (
                        <div className="grid grid-cols-6 gap-2">
                          {images.map((img: any, idx: number) => (
                            <div
                              key={idx}
                              className={\`thumbnail aspect-square \${
                                selectedImageIndex === idx ? 'active' : ''
                              }\`}
                              onClick={() => setSelectedImageIndex(idx)}
                            >
                              <img
                                src={img || '/api/placeholder/100/100'}
                                alt={\`Thumbnail \${idx + 1}\`}
                                className="thumbnail-image"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info - 2 columns */}
                  <div className="lg:col-span-2 p-8">
                    <div className="space-y-6">
                      {brand && (
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {brand}
                        </p>
                      )}

                      <h1 className="premium-title">{name}</h1>

                      {rating && (
                        <div className="rating-section">
                          {getRatingStars(rating)}
                          <span className="font-bold text-lg ml-2">{rating}</span>
                          {reviewCount && (
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {reviewCount} {reviewsText}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="price-section">
                        <div className="flex items-baseline gap-3">
                          <span className="current-price premium-highlight">
                            {formatPrice(price)}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="original-price">{formatPrice(originalPrice)}</span>
                          )}
                        </div>
                        {discount && (
                          <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            {discount}% OFF - Limited Time
                          </Badge>
                        )}
                      </div>

                      <Separator />

                      {description && (
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                          {description}
                        </p>
                      )}

                      {colors.length > 0 && (
                        <div className="variant-selector">
                          <label className="variant-label">{colorsTitle}</label>
                          <div className="flex gap-3">
                            {colors.map((color: any) => (
                              <button
                                key={color.value}
                                onClick={() => color.available && setSelectedColor(color.value)}
                                disabled={!color.available}
                                className={\`w-12 h-12 rounded-full border-4 transition-all \${
                                  selectedColor === color.value
                                    ? 'border-blue-600 scale-110'
                                    : 'border-gray-300'
                                } \${!color.available ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}\`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="quantity-selector">
                        <label className="font-semibold">{quantityLabel}</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="quantity-button"
                            disabled={quantity <= 1}
                          >
                            <span className="text-lg font-bold">-</span>
                          </button>
                          <span className="quantity-display font-bold">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="quantity-button"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {addToCartText}
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => toggleWishlist(productId)}
                          >
                            <Heart
                              className={\`w-5 h-5 \${
                                wishlist.includes(productId)
                                  ? 'fill-red-500 text-red-500'
                                  : ''
                              }\`}
                            />
                          </Button>
                          <Button size="lg" variant="outline">
                            <Share2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Compact Features List */}
                      {features && features.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Highlights</h3>
                          <ul className="space-y-2">
                            {features.slice(0, 4).map((feature: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardDetailed;
    `
  };

  return variants[variant] || variants.expanded;
};
