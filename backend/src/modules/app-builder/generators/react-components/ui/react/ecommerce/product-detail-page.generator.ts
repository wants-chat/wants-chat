import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductDetailPage = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'minimal' | 'withReviews' = 'standard'
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


  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Truck, RefreshCw, Shield, ZoomIn, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';`;

  const commonStyles = `
    .product-detail-container {
      @apply w-full max-w-7xl mx-auto;
    }

    .image-gallery-container {
      @apply relative bg-gray-100 rounded-lg overflow-hidden;
    }

    .main-image {
      @apply w-full h-full object-cover transition-transform duration-300;
    }

    .thumbnail-grid {
      @apply grid grid-cols-4 gap-2 mt-4;
    }

    .thumbnail {
      @apply cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:border-blue-500;
    }

    .thumbnail.active {
      @apply border-blue-500;
    }

    .variant-option {
      @apply px-4 py-2 border-2 rounded-lg cursor-pointer transition-all;
    }

    .variant-option.selected {
      @apply border-blue-500 bg-blue-50;
    }

    .variant-option.unavailable {
      @apply opacity-50 cursor-not-allowed;
    }

    .zoom-indicator {
      @apply absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full;
    }

    .color-swatch {
      @apply w-8 h-8 rounded-full border-2 cursor-pointer transition-all;
    }

    .color-swatch.selected {
      @apply ring-2 ring-blue-500 ring-offset-2;
    }
  `;

  const variants = {
    standard: `
${commonImports}

interface ProductDetailPageProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName}, className, onAddToCart, onAddToWishlist, onSubmitReview }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (data: { product_id: string; quantity: number; color?: string | null; size?: string | null }) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully!');
      if (onAddToCart) onAddToCart(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to cart');
    },
  });

  // Default demo product data
  const defaultProduct: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    compare_at_price?: number;
    images: string[];
    description: string;
    longDescription: string;
    brand: string;
    category: string;
    sku: string;
    discount: number;
    badge: string;
    inStock: boolean;
    stockCount: number;
    colors?: string;
    sizes?: string;
    variants: { colors: string[]; sizes: string[] };
    features: string[];
    specifications: Record<string, string>;
    shipping: {
      freeShipping: boolean;
      estimatedDays: string;
      returnPolicy: string;
      standard?: string;
      express?: string;
      returns?: string;
      warranty?: string;
    };
  } = {
    id: '1',
    name: 'Premium Product',
    price: 99.99,
    originalPrice: 149.99,
    compare_at_price: 149.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    description: 'High-quality product with amazing features',
    longDescription: 'This is a detailed description of our premium product. It features top-notch quality and exceptional craftsmanship.',
    brand: 'Premium Brand',
    category: 'Electronics',
    sku: 'PROD-001',
    discount: 33,
    badge: 'Bestseller',
    inStock: true,
    stockCount: 50,
    colors: '["Black", "White", "Blue"]',
    sizes: '["S", "M", "L", "XL"]',
    variants: { colors: ['Black', 'White', 'Blue'], sizes: ['S', 'M', 'L', 'XL'] },
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    specifications: { Weight: '1.5 kg', Dimensions: '30x20x10 cm', Material: 'Premium Quality' },
    shipping: { freeShipping: true, estimatedDays: '3-5', returnPolicy: '30 days', standard: 'Free standard shipping', express: 'Express available', returns: '30-day returns', warranty: '1 year warranty' }
  };

  // Extract product from various possible data structures
  let product: any = defaultProduct;
  const sourceData = ${dataName};

  if (sourceData) {
    // Direct product object
    if (sourceData.id || sourceData.name) {
      product = sourceData;
    }
    // Nested in data property
    else if (sourceData.data) {
      if (sourceData.data.id || sourceData.data.name) {
        product = sourceData.data;
      }
      // Double nested
      else if (sourceData.data.data && (sourceData.data.data.id || sourceData.data.data.name)) {
        product = sourceData.data.data;
      }
    }
    // Nested in product property
    else if (sourceData.product && (sourceData.product.id || sourceData.product.name)) {
      product = sourceData.product;
    }
  }

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const addToCartText = ${getField('addToCartText')} || 'Add to Cart';
  const addToWishlistText = ${getField('addToWishlistText')} || 'Add to Wishlist';
  const quantityLabel = ${getField('quantityLabel')} || 'Quantity';
  const sizeLabel = ${getField('sizeLabel')} || 'Size';
  const colorLabel = ${getField('colorLabel')} || 'Color';
  const inStockText = ${getField('inStockText')} || 'In Stock';
  const outOfStockText = ${getField('outOfStockText')} || 'Out of Stock';
  const onlyLeftText = ${getField('onlyLeftText')} || 'Only';
  const leftInStockText = ${getField('leftInStockText')} || 'left in stock';
  const freeShippingText = ${getField('freeShippingText')} || 'Free Shipping';
  const returnsText = ${getField('returnsText')} || 'Easy Returns';
  const warrantyText = ${getField('warrantyText')} || '1 Year Warranty';
  const descriptionTab = ${getField('descriptionTab')} || 'Description';
  const specificationsTab = ${getField('specificationsTab')} || 'Specifications';
  const shippingTab = ${getField('shippingTab')} || 'Shipping';

  const formatPrice = ${formatPrice};

  const renderDescription = (text: string) => {
    if (!text) return null;

    // Simple markdown parsing
    let formatted = text
      // Bold: **text** -> <strong>text</strong>
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      // Italic: *text* -> <em>text</em>
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      // Bullet points: • text -> <li>text</li>
      .split('\\n')
      .map(line => {
        if (line.trim().startsWith('•')) {
          return \`<li class="ml-4">\${line.trim().substring(1).trim()}</li>\`;
        }
        return line ? \`<p class="mb-2">\${line}</p>\` : '';
      })
      .join('');

    return <div className="text-gray-600 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const productId = product.id || ${getField('id')} || '1';
  const name = product.name || ${getField('name')} || 'Product Name';
  const price = product.price || ${getField('price')} || 99.99;
  const originalPrice = product.originalPrice || product.compare_at_price || ${getField('originalPrice')} || ${getField('compare_at_price')} || null;

  // Handle images field (JSONB array from database)
  let images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
  const rawImages = product.images || ${getField('images')};
  if (rawImages) {
    if (Array.isArray(rawImages)) {
      images = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        images = [rawImages];
      }
    }
  }
  const description = product.description || ${getField('description')} || 'Product description';
  const longDescription = product.longDescription || ${getField('longDescription')} || description;
  const brand = product.brand || ${getField('brand')} || 'Brand Name';
  const category = product.category || ${getField('category')} || 'Category';
  const sku = product.sku || ${getField('sku')} || 'SKU-001';
  const discount = product.discount || ${getField('discount')} || 0;
  const badge = product.badge || ${getField('badge')} || '';
  const inStock = product.inStock !== undefined ? product.inStock : (${getField('inStock')} || true);
  const stockCount = product.stockCount || ${getField('stockCount')} || 10;
  const variants = product.variants || ${getField('variants')} || { colors: [], sizes: [] };
  const features = product.features || ${getField('features')} || [];
  const specifications = product.specifications || ${getField('specifications')} || {};
  const shipping: {
    freeShipping?: boolean;
    estimatedDays?: string;
    returnPolicy?: string;
    standard?: string;
    express?: string;
    returns?: string;
    warranty?: string;
  } = product.shipping || ${getField('shipping')} || {};

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (!productId) return;

    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const wishlist = JSON.parse(stored);
        const isInWishlist = wishlist.some((item: any) => item.productId === productId);
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // Use mutation to add to cart via API
    addToCartMutation.mutate({
      product_id: productId,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize
    }, {
      onSuccess: () => {
        // Also update localStorage for offline support
        try {
          const stored = localStorage.getItem('cart');
          let cart = stored ? JSON.parse(stored) : [];

          const existingItem = cart.find((item: any) => item.productId === productId);

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.push({
              productId: productId,
              name: name,
              price: price,
              image: images[0],
              quantity: quantity,
              color: selectedColor,
              size: selectedSize,
              sku: sku
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }

        // Navigate to cart page
        navigate('/cart');
      }
    });
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    const newWishlistedState = !isWishlisted;
    setIsWishlisted(newWishlistedState);

    try {
      const stored = localStorage.getItem('wishlist');
      let wishlist = stored ? JSON.parse(stored) : [];

      if (newWishlistedState) {
        const wishlistItem = {
          productId: productId,
          name: name,
          price: price,
          image: images[0],
          description: description,
          sku: sku,
          addedAt: new Date().toISOString()
        };

        const exists = wishlist.some((item: any) => item.productId === productId);
        if (!exists) {
          wishlist.push(wishlistItem);
        }
      } else {
        wishlist = wishlist.filter((item: any) => item.productId !== productId);
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist));

      if (onAddToWishlist) {
        onAddToWishlist({ productId, wishlisted: newWishlistedState });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <>
<div className="product-detail-container p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl aspect-square group">
              <img
                src={images[selectedImage] || '/api/placeholder/800/800'}
                alt={name}
                className="w-full h-full object-contain transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=800&background=random\`;
                }}
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={\`relative border-2 rounded-lg overflow-hidden transition-all aspect-square \${
                      selectedImage === idx
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }\`}
                  >
                    <img
                      src={img || '/api/placeholder/200/200'}
                      alt={\`\${name} \${idx + 1}\`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=200&background=random\`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {badge && <Badge className="mb-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold shadow-sm">{badge}</Badge>}
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {brand && <span className="font-medium text-gray-900 dark:text-gray-100">{brand}</span>}
                {category && <span>• {category}</span>}
                {sku && <span>• SKU: {sku}</span>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-xl line-through text-gray-400 dark:text-gray-500">{formatPrice(originalPrice)}</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 font-semibold">
                      Save {discount}%
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {inStock ? (
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                    <Check className="w-3 h-3 mr-1" />
                    {inStockText}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                    {outOfStockText}
                  </Badge>
                )}
                {stockCount && stockCount < 10 && (
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    {onlyLeftText} {stockCount} {leftInStockText}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Color Selector */}
            {product.colors && (() => {
              try {
                const colors = JSON.parse(product.colors);
                if (Array.isArray(colors) && colors.length > 0) {
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {colorLabel}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {colors.map((color: string) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={\`px-4 py-2 border-2 rounded-lg transition-all \${
                              selectedColor === color
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 text-gray-700 dark:text-gray-300'
                            }\`}
                          >
                            {selectedColor === color && <Check className="w-4 h-4 inline mr-1" />}
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (e) {
                return null;
              }
              return null;
            })()}

            {/* Size Selector */}
            {product.sizes && (() => {
              try {
                const sizes = JSON.parse(product.sizes);
                if (Array.isArray(sizes) && sizes.length > 0) {
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {sizeLabel}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {sizes.map((size: string) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={\`px-4 py-2 border-2 rounded-lg transition-all min-w-[60px] \${
                              selectedSize === size
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 text-gray-700 dark:text-gray-300'
                            }\`}
                          >
                            {selectedSize === size && <Check className="w-4 h-4 inline mr-1" />}
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (e) {
                return null;
              }
              return null;
            })()}

            {/* Quantity Selector */}
            <div>
              <label className="font-medium mb-2 block text-gray-900 dark:text-white">{quantityLabel}</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <span className="w-16 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-md hover:shadow-xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock || addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                {addToCartMutation.isPending ? 'Adding...' : addToCartText}
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{freeShippingText}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{returnsText}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{warrantyText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="shadow-xl border-gray-200 dark:border-gray-800">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="description" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-semibold">{descriptionTab}</TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-semibold">{specificationsTab}</TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-semibold">{shippingTab}</TabsTrigger>
            </TabsList>
            <CardContent className="mt-6">
              <TabsContent value="description" className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">About this product</h3>
                  {renderDescription(longDescription || description)}
                </div>
                {features && features.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Key Features</h3>
                    <ul className="space-y-3">
                      {features.map((feature: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="specifications" className="space-y-4">
                {Object.keys(specifications).length > 0 ? (
                  <div>
                    <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Technical Specifications</h3>
                    <div className="grid gap-1">
                      {Object.entries(specifications).map(([key, value]: [string, any], idx: number) => (
                        <div
                          key={key}
                          className={\`flex justify-between py-4 px-4 \${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} rounded-lg\`}
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">{key}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-right ml-4">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No specifications available for this product.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="shipping" className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Shipping & Returns</h3>
                  <div className="space-y-4">
                    {shipping.freeShipping !== false && (
                      <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Free Shipping</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipping.standard || 'Free standard shipping on all orders. Estimated delivery in 3-5 business days.'}
                          </p>
                        </div>
                      </div>
                    )}
                    {shipping.express && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Express Shipping</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.express}</p>
                        </div>
                      </div>
                    )}
                    {(shipping.returns || shipping.returnPolicy) && (
                      <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Returns</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipping.returns || '30-day money-back guarantee. Return any item within 30 days for a full refund.'}
                          </p>
                        </div>
                      </div>
                    )}
                    {shipping.warranty && (
                      <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Warranty</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.warranty}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
};

export default ProductDetailPage;
    `,

    minimal: `
${commonImports}

interface ProductDetailPageProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName}, className, onAddToCart, onAddToWishlist, onShare, onSubmitReview }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (data: { product_id: string; quantity: number }) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully!');
      if (onAddToCart) onAddToCart(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to cart');
    },
  });

  // Extract product from various possible data structures
  let product = null;
  const sourceData = ${dataName};

  if (sourceData) {
    // Direct product object
    if (sourceData.id || sourceData.name) {
      product = sourceData;
    }
    // Nested in data property
    else if (sourceData.data) {
      if (sourceData.data.id || sourceData.data.name) {
        product = sourceData.data;
      }
      // Double nested
      else if (sourceData.data.data && (sourceData.data.data.id || sourceData.data.data.name)) {
        product = sourceData.data.data;
      }
    }
    // Nested in product property
    else if (sourceData.product && (sourceData.product.id || sourceData.product.name)) {
      product = sourceData.product;
    }
  }

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartText = ${getField('addToCartText')} || 'Add to Cart';
  const quantityLabel = ${getField('quantityLabel')} || 'Quantity';
  const inStockText = ${getField('inStockText')} || 'In Stock';
  const outOfStockText = ${getField('outOfStockText')} || 'Out of Stock';

  const formatPrice = ${formatPrice};

  const productId = product?.id || ${getField('id')};
  const name = product?.name || ${getField('name')};
  const price = product?.price || ${getField('price')};
  const originalPrice = product?.originalPrice || product?.compare_at_price || ${getField('originalPrice')} || ${getField('compare_at_price')};

  // Handle images field (JSONB array from database)
  let images = [];
  const rawImages = product?.images || ${getField('images')};
  if (rawImages) {
    if (Array.isArray(rawImages)) {
      images = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        images = [rawImages];
      }
    }
  }

  const description = product?.description || ${getField('description')};
  const inStock = product?.inStock !== undefined ? product.inStock : ${getField('inStock')};
  const sku = product?.sku || ${getField('sku')} || '';

  const handleAddToCart = () => {
    if (!product) return;

    // Use mutation to add to cart via API
    addToCartMutation.mutate({
      product_id: productId,
      quantity: quantity
    }, {
      onSuccess: () => {
        // Also update localStorage for offline support
        try {
          const stored = localStorage.getItem('cart');
          let cart = stored ? JSON.parse(stored) : [];

          const existingItem = cart.find((item: any) => item.productId === productId);

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.push({
              productId: productId,
              name: name,
              price: price,
              image: images[0],
              quantity: quantity,
              sku: sku
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }

        // Navigate to cart page
        navigate('/cart');
      }
    });
  };

  return (
    <>
<div className="product-detail-container p-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-square">
              <img
                src={images[selectedImage] || '/api/placeholder/600/600'}
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=600&background=random\`;
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={\`border-2 rounded-lg overflow-hidden transition-all aspect-square \${
                      selectedImage === idx
                        ? 'border-blue-500 ring-1 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }\`}
                  >
                    <img
                      src={img || '/api/placeholder/100/100'}
                      alt={\`\${name} \${idx + 1}\`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=100&background=random\`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {description && (
              <p className="text-gray-600">{description}</p>
            )}

            <div>
              <label className="font-medium mb-2 block text-gray-900 dark:text-white">{quantityLabel}</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <span className="w-14 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!inStock || addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {addToCartMutation.isPending ? 'Adding...' : (inStock ? addToCartText : outOfStockText)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
    `,

    withReviews: `
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Star, Truck, RefreshCw, Shield, ZoomIn, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ ${dataName}, className, onAddToCart, onAddToWishlist, onShare, onSubmitReview }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (data: { product_id: string; quantity: number }) => {
      const response = await api.post<any>('/cart', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully!');
      if (onAddToCart) onAddToCart(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add to cart');
    },
  });

  // Extract product from various possible data structures
  let product = null;
  const sourceData = ${dataName};

  if (sourceData) {
    // Direct product object
    if (sourceData.id || sourceData.name) {
      product = sourceData;
    }
    // Nested in data property
    else if (sourceData.data) {
      if (sourceData.data.id || sourceData.data.name) {
        product = sourceData.data;
      }
      // Double nested
      else if (sourceData.data.data && (sourceData.data.data.id || sourceData.data.data.name)) {
        product = sourceData.data.data;
      }
    }
    // Nested in product property
    else if (sourceData.product && (sourceData.product.id || sourceData.product.name)) {
      product = sourceData.product;
    }
  }

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  const addToCartText = ${getField('addToCartText')} || 'Add to Cart';
  const quantityLabel = ${getField('quantityLabel')} || 'Quantity';
  const colorLabel = ${getField('colorLabel')} || 'Color';
  const inStockText = ${getField('inStockText')} || 'In Stock';
  const outOfStockText = ${getField('outOfStockText')} || 'Out of Stock';
  const descriptionTab = ${getField('descriptionTab')} || 'Description';
  const reviewsTab = ${getField('reviewsTab')} || 'Reviews';
  const writeReviewText = ${getField('writeReviewText')} || 'Write a Review';

  const formatPrice = ${formatPrice};
  const getRatingStars = (rating: number) => {
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
  };

  const productId = product?.id || ${getField('id')};
  const name = product?.name || ${getField('name')};
  const price = product?.price || ${getField('price')};
  const originalPrice = product?.originalPrice || product?.compare_at_price || ${getField('originalPrice')} || ${getField('compare_at_price')};

  // Handle images field (JSONB array from database)
  let images = [];
  const rawImages = product?.images || ${getField('images')};
  if (rawImages) {
    if (Array.isArray(rawImages)) {
      images = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        images = [rawImages];
      }
    }
  }

  const description = product?.description || ${getField('description')};
  const longDescription = product?.longDescription || ${getField('longDescription')};
  const brand = product?.brand || ${getField('brand')};
  const inStock = product?.inStock !== undefined ? product.inStock : ${getField('inStock')};
  const variants = product?.variants || ${getField('variants')} || { colors: [] };
  const features = product?.features || ${getField('features')} || [];
  const reviews = product?.reviews || ${getField('reviews')} || [];
  const sku = product?.sku || ${getField('sku')} || '';

  const handleAddToCart = () => {
    if (!product) return;

    // Use mutation to add to cart via API
    addToCartMutation.mutate({
      product_id: productId,
      quantity: quantity
    }, {
      onSuccess: () => {
        // Also update localStorage for offline support
        try {
          const stored = localStorage.getItem('cart');
          let cart = stored ? JSON.parse(stored) : [];

          const existingItem = cart.find((item: any) => item.productId === productId);

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.push({
              productId: productId,
              name: name,
              price: price,
              image: images[0],
              quantity: quantity,
              sku: sku
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }

        // Navigate to cart page
        navigate('/cart');
      }
    });
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', { productId, ...newReview });
    if (onSubmitReview) {
      onSubmitReview({ productId, ...newReview });
    }
    toast.success('Thank you for your review!');
    setShowReviewForm(false);
    setNewReview({ rating: 5, title: '', comment: '' });
  };

  return (
    <>
<div className="product-detail-container p-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl aspect-square">
              <img
                src={images[selectedImage] || '/api/placeholder/800/800'}
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=800&background=random\`;
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={\`border-2 rounded-lg overflow-hidden transition-all aspect-square \${
                      selectedImage === idx
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }\`}
                  >
                    <img
                      src={img || '/api/placeholder/200/200'}
                      alt={\`\${name} \${idx + 1}\`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=200&background=random\`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              {brand && <p className="text-gray-600">by {brand}</p>}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{formatPrice(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xl line-through text-gray-400">{formatPrice(originalPrice)}</span>
              )}
            </div>

            <Badge variant="outline" className="text-green-600">
              <Check className="w-3 h-3 mr-1" />
              {inStock ? inStockText : outOfStockText}
            </Badge>

            {variants.colors && variants.colors.length > 0 && (
              <div>
                <label className="font-medium mb-2 block">{colorLabel}</label>
                <div className="flex gap-2">
                  {variants.colors.map((color: any, idx: number) => (
                    <div
                      key={idx}
                      className={\`color-swatch \${selectedColor === idx ? 'selected' : ''}\`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(idx)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="font-medium mb-2 block text-gray-900 dark:text-white">{quantityLabel}</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <span className="w-16 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock || addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                {addToCartMutation.isPending ? 'Adding...' : addToCartText}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="description">{descriptionTab}</TabsTrigger>
              <TabsTrigger value="reviews">{reviewsTab}</TabsTrigger>
            </TabsList>
            <CardContent className="mt-6">
              <TabsContent value="description" className="space-y-4">
                <p className="text-gray-600">{longDescription || description}</p>
                {features && features.length > 0 && (
                  <ul className="space-y-2">
                    {features.map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Reviews</h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {showReviewForm ? 'Cancel' : writeReviewText}
                  </Button>
                </div>

                {/* Write Review Form */}
                {showReviewForm && (
                  <Card className="border-2 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">Write Your Review</h4>

                      {/* Star Rating Selector */}
                      <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">Rating *</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={\`w-8 h-8 \${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">Review Title *</label>
                        <input
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          placeholder="Summarize your experience"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      {/* Review Comment */}
                      <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">Your Review *</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Tell us about your experience with this product"
                          rows={5}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={!newReview.title || !newReview.comment}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Review
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReviewForm(false);
                            setNewReview({ rating: 5, title: '', comment: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Reviews */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{review.author}</p>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs mt-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                  <Check className="w-3 h-3 mr-1" />
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {getRatingStars(review.rating)}
                            </div>
                          </div>
                          <p className="font-medium mb-1 text-gray-900 dark:text-white">{review.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{review.date}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
};

export default ProductDetailPage;
    `
  };

  return variants[variant] || variants.standard;
};
