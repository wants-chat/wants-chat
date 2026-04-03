/**
 * Product Grid Generator for App Creator
 *
 * Generates product grid components with:
 * - API data fetching
 * - Add to cart functionality
 * - Product cards with images, prices, ratings
 * - Click to navigate to detail page
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';
import { EnhancedEntityDefinition } from '../../dto/create-app.dto';

interface ProductGridOptions {
  entity?: string;
  title?: string;
  showAddToCart?: boolean;
  showRatings?: boolean;
  columns?: 3 | 4;
  limit?: number;
  detailRoute?: string;
  filterByCategory?: boolean;
}

/**
 * Generate a product grid component
 */
export function generateProductGrid(options: ProductGridOptions = {}): string {
  const {
    entity = 'product',
    title = 'Products',
    showAddToCart = true,
    showRatings = true,
    columns = 4,
    limit,
    detailRoute = '/products/:id',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = `${pascalCase(entity)}Grid`;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Star, StarHalf, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  data?: any[];
  title?: string;
  className?: string;
  onProductClick?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  limit?: number;
  showAddToCart?: boolean;
  showRatings?: boolean;
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  className,
  onProductClick,
  onAddToCart,
  limit${limit ? ` = ${limit}` : ''},
  showAddToCart = ${showAddToCart},
  showRatings = ${showRatings},
  categoryId,
}) => {
  const navigate = useNavigate();

  // Build API endpoint - filter by category if categoryId provided
  const endpoint = categoryId
    ? \`/categories/\${categoryId}/products\`
    : '/${tableName}';

  // Fetch data from API if no props provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: categoryId ? ['${tableName}', 'category', categoryId] : ['${tableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(endpoint);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  // Use prop data or fetched data
  let products = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && products.length > limit) {
    products = products.slice(0, limit);
  }

  const handleProductClick = (product: any) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      const productId = product.id || product._id;
      navigate(\`${detailRoute.replace(':id', '${productId}')}\`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    // Default localStorage cart
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => item.productId === product.id);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          name: product.name || product.title,
          price: product.price,
          quantity: 1,
          image: getProductImage(product),
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const getProductImage = (product: any): string => {
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;
    if (product.images) {
      if (Array.isArray(product.images)) return product.images[0] || '';
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          return Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          return product.images;
        }
      }
    }
    return '';
  };

  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => {
            if (i < fullStars) {
              return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
            }
            if (i === fullStars && hasHalf) {
              return <StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
            }
            return <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />;
          })}
        </div>
        {reviewCount !== undefined && (
          <span className="text-sm text-gray-500 dark:text-gray-400">({reviewCount})</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('py-12', className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('py-12', className)}>
        <div className="text-center text-red-500">Failed to load products.</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn('py-12', className)}>
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for new products.</p>
        </div>
      </div>
    );
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6">
          {products.map((product: any) => {
            const productId = product.id || product._id;
            const name = product.name || product.title || 'Untitled';
            const price = product.price;
            const originalPrice = product.original_price || product.compare_at_price;
            const image = getProductImage(product);
            const rating = product.rating || product.average_rating;
            const reviewCount = product.review_count || product.reviews_count;

            return (
              <div
                key={productId}
                onClick={() => handleProductClick(product)}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {originalPrice && price < originalPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {name}
                  </h3>

                  {showRatings && rating !== undefined && (
                    <div className="mb-3">
                      <StarRating rating={rating} reviewCount={reviewCount} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    {originalPrice && originalPrice > price && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        \${parseFloat(originalPrice).toFixed(2)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      \${price ? parseFloat(price).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {showAddToCart && (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a featured products section
 */
export function generateFeaturedProducts(options: ProductGridOptions = {}): string {
  return generateProductGrid({
    ...options,
    title: options.title || 'Featured Products',
    limit: options.limit || 4,
    columns: 4,
  });
}
