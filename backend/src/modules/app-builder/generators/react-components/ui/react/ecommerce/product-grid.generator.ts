import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductGrid = (
  resolved: ResolvedComponent,
  variant: 'productGridWithCart' | 'productGridWithRatings' | 'productGridMinimal' | 'productGridDetailed' | 'productGridWithColorSelector' | 'productGridLarge' | 'productGridWithBadges' | 'jobCardGrid' = 'productGridMinimal'
) => {
  const dataSource = resolved.dataSource;

  // Auto-detect job grid variant based on entity/data source
  const isJobsEntity = dataSource?.toLowerCase().includes('job') ||
                       resolved.data?.entity?.toLowerCase().includes('job');
  const effectiveVariant = isJobsEntity ? 'jobCardGrid' : variant;
  
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

  // Get API route from serverFunction for add-to-cart action (similar to form generator)
  const getAddToCartApiRoute = () => {
    if (!resolved.actions || resolved.actions.length === 0) {
      return null;
    }

    // Look for create action with onClick trigger (add-to-cart)
    const addToCartAction = resolved.actions.find(
      action => action.type === 'create' && action.trigger === 'onClick' && action.serverFunction
    );

    if (addToCartAction?.serverFunction?.route) {
      // Remove /api/v1/ prefix if present since api client adds it
      // Convert hyphens to underscores to match backend route naming convention
      return addToCartAction.serverFunction.route.replace(/^\/api\/v1\//, '').replace(/-/g, '_');
    }

    return null;
  };

  const addToCartApiRoute = getAddToCartApiRoute();
  const useApiForCart = !!addToCartApiRoute;

  // Check if we should pass restaurant_id to cart (for food-delivery apps)
  const passRestaurantIdToCart = resolved.props?.passRestaurantIdToCart === true;
  const useLocalStorageCart = resolved.props?.useLocalStorageCart === true;
  const cartItemFields = resolved.props?.cartItemFields || [];

  // Check if restaurant ID should come from URL route params (e.g., ':id' from /restaurants/:id)
  const restaurantIdFromRoute = resolved.props?.restaurantIdFromRoute;
  // Extract param name from route pattern (e.g., ':id' -> 'id')
  const routeParamName = restaurantIdFromRoute ? restaurantIdFromRoute.replace(':', '') : null;
  const needsUseParams = !!routeParamName;

  // Get API route for data fetching
  const getDataFetchApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'products'}`;
  };

  const dataFetchApiRoute = getDataFetchApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useNavigate${needsUseParams ? ', useParams' : ''} } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, StarHalf, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';`;

  const variants = {
    productGridWithCart: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  reviews_count?: number;
  image?: string;
  image_url?: string;
  cover_image?: string;
  featured_image?: string;
  original_price?: number;
  originalPrice?: number;
  backgroundColor?: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  onProductClick,
  restaurantId,
  onAddToCart,
  className
}) => {
  const navigate = useNavigate();
  // Use either the generic 'data' prop or the specific prop name
  const propData = data || ${dataName};

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'products'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        return [];
      }
    },
    enabled: !propData || (Array.isArray(propData) && propData.length === 0),
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const sourceData = propData || fetchedData || {};

  // Normalize data structure - handle both array and object with products property
  const productsList: Product[] = Array.isArray(sourceData)
    ? sourceData
    : (sourceData?.products || sourceData?.items || []);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors", className)}>
        <div className="p-6 lg:p-12 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors", className)}>
        <div className="p-6 lg:p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-500">
            <p>Failed to load products. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no products available
  if (!productsList || productsList.length === 0) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors", className)}>
        <div className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <ShoppingCart className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Products will appear here once they are added.</p>
          </div>
        </div>
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')} || 'Add to Cart';
  const reviewsText = ${getField('reviewsText')} || 'reviews';

  const handleAddToCart = async (product: Product) => {
    try {
      ${useApiForCart ? `
      // Use API for cart (server-side cart)
      const quantity = 1;
      const unitPrice = parseFloat(product.price) || 0;
      const response = await api.post<any>('${addToCartApiRoute}', {
        menu_item_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        customizations: null
      });

      if (response.data) {
        toast.success('Added to cart!');
        navigate('/cart');
        // Call prop callback if provided
        if (onAddToCart) {
          onAddToCart(product);
        }
      }` : `
      // Use localStorage for cart (client-side cart)
      const existingCart = localStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];

      // Get restaurant_id from props or product (for food-delivery apps)
      const itemRestaurantId = restaurantId || (product as any).restaurant_id || (product as any).restaurantId || null;

      // Check if item already in cart
      const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.productId === product.id);

      if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item with restaurant_id if available
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          restaurant_id: itemRestaurantId,
        });
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Show success message and navigate to cart
      toast.success('Added to cart!');
      navigate('/cart');

      // Call prop callback if provided
      if (onAddToCart) {
        onAddToCart(product);
      }`}
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page
    const productId = (product as any).id || (product as any)._id;
    if (productId) {
      navigate(\`/products/\${productId}\`);
    }
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const ProductImage = ({ image, bg }: { image: string; bg: string }) => {
    return (
      <div className="w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => {
            if (index < fullStars) {
              return <Star key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />;
            } else if (index === fullStars && hasHalfStar) {
              return <StarHalf key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />;
            } else {
              return <Star key={index} className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
            }
          })}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors", className)}>
      <div className="p-6 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsList.map((product: Product) => {
            // Handle images field (JSONB array from database)
            let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
            if (!image && product.images) {
              if (Array.isArray(product.images)) {
                image = product.images[0] || '';
              } else if (typeof product.images === 'string') {
                try {
                  const parsed = JSON.parse(product.images);
                  image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                } catch (e) {
                  image = product.images;
                }
              }
            }

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => handleProductClick(product)}
              >
                <ProductImage image={image} bg={product.backgroundColor || '#f0f0f0'} />

                <div className="p-6">
                  <div className="mb-3">
                    {(product.original_price || product.originalPrice || product.compare_at_price) && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through mr-2">
                        \${parseFloat(product.original_price || product.originalPrice || product.compare_at_price).toFixed(2)}
                      </span>
                    )}
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    \${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug">
                  {product.name}
                </h3>

                {(product.rating || product.reviews_count || product.reviewCount) && (
                  <div className="mb-5">
                    <StarRating rating={product.rating || 0} reviewCount={product.reviews_count || product.reviewCount || 0} />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-11"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {addToCartText}
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridWithRatings: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  onProductClick,
  restaurantId,
  className
}) => {
  const navigate = useNavigate();
  // Normalize data structure - handle both array and object with products property
  const sourceData = ${dataName} || {};
  const productsList = Array.isArray(sourceData)
    ? sourceData
    : (sourceData?.products || sourceData?.items || []);

  const reviewsSuffix = ${getField('reviewsSuffix')};

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page
    const productId = (product as any).id || (product as any)._id;
    if (productId) {
      navigate(\`/products/\${productId}\`);
    }
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const ProductImage = ({ image, bg }: { image: string; bg: string }) => {
    return (
      <div className="w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star 
              key={index} 
              className={cn(
                "w-4 h-4",
                index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{reviewCount} {reviewsSuffix}</span>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((product: Product) => {
              // Handle images field (JSONB array from database)
              let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
              if (!image && product.images) {
                if (Array.isArray(product.images)) {
                  image = product.images[0] || '';
                } else if (typeof product.images === 'string') {
                  try {
                    const parsed = JSON.parse(product.images);
                    image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                  } catch (e) {
                    image = product.images;
                  }
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImage image={image} bg={product.backgroundColor} />

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        \${parseFloat(product.price).toFixed(2)}
                      </span>
                      {(product.original_price || product.originalPrice || product.compare_at_price) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          \${parseFloat(product.original_price || product.originalPrice || product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                </div>

                <StarRating rating={product.rating} reviewCount={product.reviewCount} />
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridMinimal: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  featuredProducts,
  arrayOfProducts,
  onProductClick,
  onAddToCart,
  className
}) => {
  const navigate = useNavigate();${needsUseParams ? `
  const { ${routeParamName} } = useParams();` : ''}
  // Use whichever prop is provided (data has priority)
  const propData = data || featuredProducts || arrayOfProducts;

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'products'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        return [];
      }
    },
    enabled: !propData || (Array.isArray(propData) && propData.length === 0),
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const productsData = propData || fetchedData;

  // Normalize data structure - handle both array and object with products property
  let productsList = [];

  if (Array.isArray(productsData)) {
    productsList = productsData;
  } else if (productsData?.data?.data && Array.isArray(productsData.data.data)) {
    // Double nested data: {data: {success, message, data: [...]}}
    productsList = productsData.data.data;
  } else if (productsData?.data && Array.isArray(productsData.data)) {
    productsList = productsData.data;
  } else if (productsData?.products && Array.isArray(productsData.products)) {
    productsList = productsData.products;
  } else if (productsData?.items && Array.isArray(productsData.items)) {
    productsList = productsData.items;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
        <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
        <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-500">
            <p>Failed to load products. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Smart default button text based on data type or explicit prop
  const hasEnrollmentData = productsList.length > 0 && productsList[0]?.progress_percentage !== undefined;
  const defaultButtonText = hasEnrollmentData ? 'Continue Learning' : 'Add to Cart';
  const addToCartText = productsData?.addToCartText || defaultButtonText;

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page
    const productId = (product as any).id || (product as any)._id;
    if (productId) {
      navigate(\`/products/\${productId}\`);
    }
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Helper function to extract image from product
  const getProductImage = (product: any): string => {
    let image = product.course?.thumbnail_url || product.thumbnail_url || product.image_url || product.imageUrl || product.image;
    if (!image && product.images) {
      if (Array.isArray(product.images)) {
        image = product.images[0];
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          image = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
          image = product.images;
        }
      }
    }
    return image || '';
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Prevent card click

    try {
      // Extract product details with fallbacks for different data structures
      const productId = product.id || product._id;
      const productName = product.course?.title || product.title || product.name || 'Product';
      const productPrice = product.course?.price || product.price || 0;
      const productImage = getProductImage(product);

      ${useApiForCart ? `
      // Use API for cart (server-side cart)
      const quantity = 1;
      const unitPrice = parseFloat(productPrice) || 0;
      const response = await api.post<any>('${addToCartApiRoute}', {
        menu_item_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        customizations: null
      });

      if (response.data) {
        toast.success('Added to cart!');
        navigate('/cart');
        // Call prop callback if provided
        if (onAddToCart) {
          onAddToCart(product);
        }
      }` : `
      // Use localStorage for cart (client-side cart)
      const existingCart = localStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];

      // Get restaurant_id from route params or product (for food-delivery apps)
      const itemRestaurantId = ${routeParamName ? routeParamName : `(product as any).restaurant_id || (product as any).restaurantId`} || null;

      // Check if item already in cart
      const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.productId === productId);

      if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item with restaurant_id if available
        cart.push({
          productId: productId,
          name: productName,
          price: productPrice,
          quantity: 1,
          image: productImage,
          restaurant_id: itemRestaurantId,
        });
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Show success message and navigate to cart
      toast.success('Added to cart!');
      navigate('/cart');

      // Call prop callback if provided
      if (onAddToCart) {
        onAddToCart(product);
      }`}
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const ProductImage = ({ image, bg }: { image: string; bg: string }) => {
    return (
      <div className="w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(productsList) && productsList.map((product: any) => {
              // Intelligently extract display fields - support multiple data structures
              const name = product.course?.title || product.title || product.name || 'Untitled';
              const image = getProductImage(product);
              const price = product.course?.price || product.price;
              const originalPrice = product.course?.original_price || product.original_price || product.originalPrice || product.compare_at_price;
              const hasProgress = product.progress_percentage !== undefined;
              const productId = product.id || product._id;

              return (
                <div
                  key={productId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImage image={image} bg={product.backgroundColor} />

                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {name}
                    </h3>

                    {hasProgress ? (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: \`\${product.progress_percentage || 0}%\` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(product.progress_percentage || 0)}% Complete
                        </span>
                      </div>
                    ) : price !== undefined ? (
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        {originalPrice && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            \${parseFloat(originalPrice).toFixed(2)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          \${parseFloat(price).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="mb-4"></div>
                    )}

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addToCartText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridDetailed: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  className
}) => {
  const sourceData = ${dataName} || {};
  const productsList = sourceData.products || ${getField('productGridDetailed')};
  
  const priceLabel = ${getField('priceLabel')};
  const reviewsText = ${getField('reviewsText')};

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
  };

  const ProductImage = ({ image, bg }: { image: string; bg: string }) => {
    return (
      <div className="w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star 
              key={index} 
              className={cn(
                "w-4 h-4",
                index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">({reviewCount}) {reviewsText}</span>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {productsList.map((product: Product) => {
              // Handle images field (JSONB array from database)
              let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
              if (!image && product.images) {
                if (Array.isArray(product.images)) {
                  image = product.images[0] || '';
                } else if (typeof product.images === 'string') {
                  try {
                    const parsed = JSON.parse(product.images);
                    image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                  } catch (e) {
                    image = product.images;
                  }
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImage image={image} bg={product.backgroundColor} />
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {product.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {priceLabel} \${product.price}
                    </span>
                  </div>
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridWithColorSelector: `
${commonImports}

interface ColorVariant {
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  colors: ColorVariant[];
  selectedColor: string;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  className
}) => {
  const sourceData = ${dataName} || {};
  const initialProducts = sourceData.products || ${getField('productGridWithColorSelector')};

  const [productsList, setProductsList] = useState<Product[]>(initialProducts);

  const updateSelectedColor = (productId: string, color: string) => {
    setProductsList(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, selectedColor: color }
          : product
      )
    );
    console.log('Color changed for product:', productId, 'to:', color);
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
  };

  const ProductImage = ({ image, bg, selectedColor }: { image: string; bg: string; selectedColor: string }) => {
    return (
      <div className="w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const ColorSelector = ({ colors, selectedColor, onColorChange }: {
    colors: ColorVariant[];
    selectedColor: string;
    onColorChange: (color: string) => void;
  }) => (
    <div className="flex space-x-2">
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onColorChange(color.value);
          }}
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all",
            color.value,
            selectedColor === color.value 
              ? "border-gray-800 scale-110" 
              : "border-gray-300 hover:border-gray-500"
          )}
          title={color.name}
        />
      ))}
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsList.map((product) => {
              // Handle images field (JSONB array from database)
              let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
              if (!image && product.images) {
                if (Array.isArray(product.images)) {
                  image = product.images[0] || '';
                } else if (typeof product.images === 'string') {
                  try {
                    const parsed = JSON.parse(product.images);
                    image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                  } catch (e) {
                    image = product.images;
                  }
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImage
                    image={image}
                    bg={product.backgroundColor}
                    selectedColor={product.selectedColor}
                  />

                  <div className="p-4 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{product.category}</div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        \${parseFloat(product.price).toFixed(2)}
                      </span>
                      {(product.original_price || product.originalPrice || product.compare_at_price) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          \${parseFloat(product.original_price || product.originalPrice || product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                </div>

                <div className="flex justify-center">
                  <ColorSelector
                    colors={product.colors}
                    selectedColor={product.selectedColor}
                    onColorChange={(color) => updateSelectedColor(product.id, color)}
                  />
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridLarge: `
${commonImports}

interface ColorVariant {
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  colors: ColorVariant[];
  selectedColor: string;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  className
}) => {
  const sourceData = ${dataName} || {};
  const initialProducts = sourceData.products || ${getField('productGridLarge')};

  const [productsList, setProductsList] = useState<Product[]>(initialProducts);

  const updateSelectedColor = (productId: string, color: string) => {
    setProductsList(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, selectedColor: color }
          : product
      )
    );
    console.log('Color changed for product:', productId, 'to:', color);
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
  };

  const ProductImage = ({ image, bg, selectedColor }: { image: string; bg: string; selectedColor: string }) => {
    return (
      <div className="w-full h-56 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  const ColorSelector = ({ colors, selectedColor, onColorChange }: {
    colors: ColorVariant[];
    selectedColor: string;
    onColorChange: (color: string) => void;
  }) => (
    <div className="flex justify-center space-x-3">
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onColorChange(color.value);
          }}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-all",
            color.value,
            selectedColor === color.value 
              ? "border-gray-900 scale-110 shadow-lg" 
              : "border-gray-300 hover:border-gray-500"
          )}
          title={color.name}
        />
      ))}
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsList.map((product) => {
              // Handle images field (JSONB array from database)
              let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
              if (!image && product.images) {
                if (Array.isArray(product.images)) {
                  image = product.images[0] || '';
                } else if (typeof product.images === 'string') {
                  try {
                    const parsed = JSON.parse(product.images);
                    image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                  } catch (e) {
                    image = product.images;
                  }
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImage
                    image={image}
                    bg={product.backgroundColor}
                    selectedColor={product.selectedColor}
                  />
              
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h3>

                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  \${parseFloat(product.price).toFixed(2)}
                </div>

                <ColorSelector
                  colors={product.colors}
                  selectedColor={product.selectedColor}
                  onColorChange={(color) => updateSelectedColor(product.id, color)}
                />
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    productGridWithBadges: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  tag?: 'New' | 'Hot';
  tagColor: string;
  image: string;
  backgroundColor: string;
}

interface ProductGridProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
  gap?: string;
  showFilters?: boolean;
}

const ProductGridComponent: React.FC<ProductGridProps> = ({
  data,
  ${dataName},
  className
}) => {
  const sourceData = ${dataName} || {};
  const productsList = sourceData.products || ${getField('productGridWithBadges')};

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
  };

  const ProductImage = ({ image, bg }: { image: string; bg: string }) => {
    return (
      <div className="w-full h-64 overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt="Product"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900 transition-colors", className)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {productsList.map((product: Product) => {
              // Handle images field (JSONB array from database)
              let image = product.cover_image || product.image_url || product.image || product.featured_image || '';
              if (!image && product.images) {
                if (Array.isArray(product.images)) {
                  image = product.images[0] || '';
                } else if (typeof product.images === 'string') {
                  try {
                    const parsed = JSON.parse(product.images);
                    image = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                  } catch (e) {
                    image = product.images;
                  }
                }
              }

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.tag && (
                    <div className={cn(
                      "absolute top-4 left-4 z-10 px-3 py-1 rounded-lg text-white text-sm font-bold",
                      product.tagColor
                    )}>
                      {product.tag}
                    </div>
                  )}

                  <ProductImage image={image} bg={product.backgroundColor} />

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center space-x-2">
                      {(product.original_price || product.originalPrice || product.compare_at_price) && (
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          £{parseFloat(product.original_price || product.originalPrice || product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    £{parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridComponent;
    `,

    jobCardGrid: `
${commonImports}
import { MapPin, Briefcase, Clock, DollarSign, Building2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_id?: string;
  company_name?: string;
  image_url?: string;
  company?: { name: string; logo_url?: string; image_url?: string };
  location: string;
  job_type: string;
  remote_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  published_at?: string;
  created_at?: string;
}

interface JobCardGridProps {
  [key: string]: any;
  className?: string;
  detailRoute?: string;
}

const JobCardGrid: React.FC<JobCardGridProps> = ({
  data,
  ${dataName},
  className,
  detailRoute = '/jobs/:id'
}) => {
  const navigate = useNavigate();
  const sourceData = data || ${dataName};

  // Normalize data
  let jobsList = Array.isArray(sourceData)
    ? sourceData
    : (sourceData?.jobs || sourceData?.items || sourceData?.data || []);

  if (!Array.isArray(jobsList)) {
    jobsList = [];
  }

  const handleJobClick = (job: Job) => {
    const route = detailRoute.replace(':id', job.id);
    navigate(route);
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const symbol = curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr;
    if (min && max) {
      return \`\${symbol}\${(min/1000).toFixed(0)}k - \${symbol}\${(max/1000).toFixed(0)}k\`;
    }
    if (min) return \`From \${symbol}\${(min/1000).toFixed(0)}k\`;
    if (max) return \`Up to \${symbol}\${(max/1000).toFixed(0)}k\`;
    return null;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return \`\${diffDays} days ago\`;
    if (diffDays < 30) return \`\${Math.floor(diffDays / 7)} weeks ago\`;
    return date.toLocaleDateString();
  };

  const getJobTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'contract': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'freelance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'internship': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (jobsList.length === 0) {
    return (
      <div className={cn("py-12", className)}>
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Check back later for new opportunities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobsList.map((job: Job) => {
          const companyName = job.company?.name || job.company_name || 'Company';
          const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

          return (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Company Logo/Image with Fallback */}
                <div className="flex-shrink-0">
                  {(job.company?.image_url || job.image_url) ? (
                    <img
                      src={job.company?.image_url || job.image_url || ''}
                      alt={companyName}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                    style={{ display: (job.company?.image_url || job.image_url) ? 'none' : 'flex' }}
                  >
                    <span className="text-xl font-bold text-white">
                      {companyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{companyName}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getJobTypeBadgeColor(job.job_type))}>
                  {job.job_type?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                </span>
                {job.remote_type && job.remote_type !== 'on-site' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    {job.remote_type?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                )}
                {job.experience_level && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {job.experience_level?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{job.location || 'Location not specified'}</span>
                </div>
                {salary && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{salary}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {formatDate(job.published_at || job.created_at)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  onClick={(e) => { e.stopPropagation(); handleJobClick(job); }}
                >
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobCardGrid;
    `
  };

  return variants[effectiveVariant] || variants.productGridMinimal;
};
