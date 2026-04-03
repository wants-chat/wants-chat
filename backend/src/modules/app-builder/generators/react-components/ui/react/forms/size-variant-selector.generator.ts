import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSizeVariantSelector = (
  resolved: ResolvedComponent,
  variant: 'buttons' | 'dropdown' | 'swatches' = 'buttons'
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
import { Card, CardContent, Loader2 } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Star, Info, Check, AlertCircle, Ruler } from 'lucide-react';
import { api } from '@/lib/api';`;

  const commonStyles = `
    .size-variant-selector {
      @apply w-full;
    }

    .product-container {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-md;
    }

    .product-image {
      @apply w-full h-full object-cover rounded-lg;
    }

    .size-button {
      @apply px-4 py-2 border-2 rounded-md font-medium transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500;
    }

    .size-button-selected {
      @apply border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400;
    }

    .size-button-disabled {
      @apply opacity-40 cursor-not-allowed line-through;
    }

    .color-swatch {
      @apply w-12 h-12 rounded-full border-4 cursor-pointer transition-all duration-200 hover:scale-110;
    }

    .color-swatch-selected {
      @apply border-blue-600 dark:border-blue-400 ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2;
    }

    .color-swatch-disabled {
      @apply opacity-40 cursor-not-allowed;
    }

    .stock-indicator {
      @apply inline-flex items-center gap-1 text-sm;
    }

    .size-guide-table {
      @apply w-full text-sm;
    }

    .size-guide-table th {
      @apply bg-gray-50 dark:bg-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white;
    }

    .size-guide-table td {
      @apply px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300;
    }
  `;

  const variants = {
    buttons: `
${commonImports}

interface SizeVariantSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const SizeVariantSelector: React.FC<SizeVariantSelectorProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};
  const product = productData.product || ${getField('product')};

  const name = ${getField('name').replace('product.', 'product.')};
  const price = ${getField('price').replace('product.', 'product.')};
  const originalPrice = ${getField('originalPrice').replace('product.', 'product.')};
  const image = ${getField('image').replace('product.', 'product.')};
  const description = ${getField('description').replace('product.', 'product.')};
  const productRating = ${getField('rating').replace('product.', 'product.')};
  const reviewCount = ${getField('reviewCount').replace('product.', 'product.')};
  const sizes = product?.sizes || ${getField('sizes').replace('product.', 'product.')};
  const colors = product?.colors || ${getField('colors').replace('product.', 'product.')};
  const sizeGuide = product?.sizeGuide || ${getField('sizeGuide').replace('product.', 'product.')};

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.value || null);
  const [currentImage, setCurrentImage] = useState(image);

  const addToCartText = ${getField('addToCartText')};
  const sizeGuideText = ${getField('sizeGuideText')};
  const selectSizeText = ${getField('selectSizeText')};
  const selectColorText = ${getField('selectColorText')};
  const inStockText = ${getField('inStockText')};
  const lowStockText = ${getField('lowStockText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const selectedSizeData = sizes?.find((s: any) => s.value === selectedSize);
  const selectedColorData = colors?.find((c: any) => c.value === selectedColor);

  const handleColorSelect = (color: any) => {
    setSelectedColor(color.value);
    if (color.image) {
      setCurrentImage(color.image);
    }
    console.log('Selected color:', color);
  };

  const handleSizeSelect = (size: any) => {
    if (size.inStock) {
      setSelectedSize(size.value);
      console.log('Selected size:', size);
    }
  };

  const addToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    console.log('Adding to cart:', {
      product: name,
      size: selectedSize,
      color: selectedColor
    });
  };

  const getStockStatus = (stock: number, inStock: boolean) => {
    if (!inStock || stock === 0) return outOfStockText;
    if (stock < 5) return lowStockText;
    return inStockText;
  };

  const getStockBadgeClass = (stock: number, inStock: boolean) => {
    if (!inStock || stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    if (stock < 5) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  };

  return (
    <>
<div className="size-variant-selector p-4 md:p-6">
        <Card className="product-container">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src={currentImage || '/api/placeholder/500/500'}
                    alt={name}
                    className="product-image"
                  />
                </div>

                {/* Color swatches thumbnails */}
                {colors && colors.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color: any) => (
                      color.image && (
                        <button
                          key={color.value}
                          onClick={() => handleColorSelect(color)}
                          className={\`aspect-square rounded-md overflow-hidden border-2 \${
                            selectedColor === color.value
                              ? 'border-blue-600 dark:border-blue-400'
                              : 'border-gray-200 dark:border-gray-700'
                          }\`}
                        >
                          <img
                            src={color.image}
                            alt={color.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {name}
                  </h1>

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

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(price)}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-xl line-through text-gray-400">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  {description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {description}
                    </p>
                  )}
                </div>

                {/* Color Selection */}
                {colors && colors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectColorText}
                      </label>
                      {selectedColorData && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedColorData.label}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {colors.map((color: any) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorSelect(color)}
                          disabled={!color.inStock}
                          className={\`color-swatch \${
                            selectedColor === color.value ? 'color-swatch-selected' : 'border-gray-300 dark:border-gray-600'
                          } \${!color.inStock ? 'color-swatch-disabled' : ''}\`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        >
                          {selectedColor === color.value && (
                            <Check className="w-6 h-6 text-white drop-shadow-lg mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizes && sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectSizeText}
                      </label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
                            <Ruler className="w-4 h-4 mr-1" />
                            {sizeGuideText}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{sizeGuideText}</DialogTitle>
                          </DialogHeader>
                          <div className="overflow-x-auto">
                            <table className="size-guide-table">
                              <thead>
                                <tr>
                                  <th>Size</th>
                                  <th>Chest</th>
                                  <th>Waist</th>
                                  <th>Length</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sizeGuide?.measurements?.map((measurement: any) => (
                                  <tr key={measurement.size}>
                                    <td className="font-medium">{measurement.size}</td>
                                    <td>{measurement.chest}</td>
                                    <td>{measurement.waist}</td>
                                    <td>{measurement.length}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {sizes.map((size: any) => (
                        <button
                          key={size.value}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!size.inStock}
                          className={\`size-button \${
                            selectedSize === size.value ? 'size-button-selected' : 'border-gray-300 dark:border-gray-600'
                          } \${!size.inStock ? 'size-button-disabled' : ''}\`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>

                    {selectedSizeData && (
                      <div className="mt-3">
                        <Badge className={getStockBadgeClass(selectedSizeData.stock, selectedSizeData.inStock)}>
                          {getStockStatus(selectedSizeData.stock, selectedSizeData.inStock)}
                          {selectedSizeData.inStock && selectedSizeData.stock < 10 && (
                            <span className="ml-1">({selectedSizeData.stock} left)</span>
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={addToCart}
                  disabled={!selectedSize}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartText}
                </Button>

                {!selectedSize && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-4 h-4" />
                    Please select a size to continue
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SizeVariantSelector;
    `,

    dropdown: `
${commonImports}

interface SizeVariantSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const SizeVariantSelector: React.FC<SizeVariantSelectorProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};
  const product = productData.product || ${getField('product')};

  const name = ${getField('name').replace('product.', 'product.')};
  const price = ${getField('price').replace('product.', 'product.')};
  const image = ${getField('image').replace('product.', 'product.')};
  const sizes = product?.sizes || ${getField('sizes').replace('product.', 'product.')};
  const colors = product?.colors || ${getField('colors').replace('product.', 'product.')};

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImage, setCurrentImage] = useState(image);

  const addToCartText = ${getField('addToCartText')};
  const selectSizeText = ${getField('selectSizeText')};
  const selectColorText = ${getField('selectColorText')};

  const formatPrice = ${formatPrice};

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
    const color = colors?.find((c: any) => c.value === value);
    if (color?.image) {
      setCurrentImage(color.image);
    }
    console.log('Selected color:', value);
  };

  const addToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    console.log('Adding to cart:', {
      product: name,
      size: selectedSize,
      color: selectedColor
    });
  };

  return (
    <>
<div className="size-variant-selector p-6">
        <Card className="product-container max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img
                  src={currentImage || '/api/placeholder/500/500'}
                  alt={name}
                  className="product-image"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {name}
                </h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {selectColorText}
                  </label>
                  <Select value={selectedColor} onValueChange={handleColorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors?.map((color: any) => (
                        <SelectItem
                          key={color.value}
                          value={color.value}
                          disabled={!color.inStock}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.label}
                            {!color.inStock && ' (Out of Stock)'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {selectSizeText}
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes?.map((size: any) => (
                        <SelectItem
                          key={size.value}
                          value={size.value}
                          disabled={!size.inStock}
                        >
                          {size.label}
                          {!size.inStock && ' (Out of Stock)'}
                          {size.inStock && size.stock < 5 && \` (Only \${size.stock} left)\`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={addToCart}
                disabled={!selectedSize || !selectedColor}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCartText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SizeVariantSelector;
    `,

    swatches: `
${commonImports}

interface SizeVariantSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const SizeVariantSelector: React.FC<SizeVariantSelectorProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sourceData = propData || fetchedData || {};
  const product = productData.product || ${getField('product')};

  const name = ${getField('name').replace('product.', 'product.')};
  const price = ${getField('price').replace('product.', 'product.')};
  const image = ${getField('image').replace('product.', 'product.')};
  const description = ${getField('description').replace('product.', 'product.')};
  const sizes = product?.sizes || ${getField('sizes').replace('product.', 'product.')};
  const colors = product?.colors || ${getField('colors').replace('product.', 'product.')};

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.value || null);
  const [currentImage, setCurrentImage] = useState(image);

  const addToCartText = ${getField('addToCartText')};
  const selectSizeText = ${getField('selectSizeText')};
  const selectColorText = ${getField('selectColorText')};
  const selectedText = ${getField('selectedText')};

  const formatPrice = ${formatPrice};

  const handleColorSelect = (color: any) => {
    setSelectedColor(color.value);
    if (color.image) {
      setCurrentImage(color.image);
    }
    console.log('Selected color:', color);
  };

  const addToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    console.log('Adding to cart:', {
      product: name,
      size: selectedSize,
      color: selectedColor
    });
  };

  return (
    <>
<div className="size-variant-selector p-6">
        <Card className="product-container max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 bg-gray-50 dark:bg-gray-900">
                <div className="aspect-square overflow-hidden rounded-lg sticky top-6">
                  <img
                    src={currentImage || '/api/placeholder/500/500'}
                    alt={name}
                    className="product-image"
                  />
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {name}
                  </h1>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {formatPrice(price)}
                  </p>
                  {description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {description}
                    </p>
                  )}
                </div>

                {/* Color Swatches */}
                {colors && colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {selectColorText}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color: any) => (
                        <div key={color.value} className="relative">
                          <button
                            onClick={() => handleColorSelect(color)}
                            disabled={!color.inStock}
                            className={\`relative group \${!color.inStock ? 'opacity-40 cursor-not-allowed' : ''}\`}
                          >
                            <div
                              className={\`color-swatch \${
                                selectedColor === color.value
                                  ? 'color-swatch-selected'
                                  : 'border-gray-300 dark:border-gray-600'
                              }\`}
                              style={{ backgroundColor: color.hex }}
                            >
                              {selectedColor === color.value && (
                                <Check className="w-6 h-6 text-white drop-shadow-lg" />
                              )}
                            </div>

                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                                {color.label}
                              </span>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                    {selectedColor && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {selectedText}: {colors.find((c: any) => c.value === selectedColor)?.label}
                      </p>
                    )}
                  </div>
                )}

                {/* Size Selection */}
                {sizes && sizes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {selectSizeText}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size: any) => (
                        <button
                          key={size.value}
                          onClick={() => size.inStock && setSelectedSize(size.value)}
                          disabled={!size.inStock}
                          className={\`size-button relative \${
                            selectedSize === size.value
                              ? 'size-button-selected'
                              : 'border-gray-300 dark:border-gray-600'
                          } \${!size.inStock ? 'size-button-disabled' : ''}\`}
                        >
                          <span>{size.label}</span>
                          {size.inStock && size.stock < 5 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={addToCart}
                  disabled={!selectedSize}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartText}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SizeVariantSelector;
    `
  };

  return variants[variant] || variants.buttons;
};
