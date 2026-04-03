import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductGridThreeColumn = (resolved: ResolvedComponent) => {
  const fields = resolved.fieldMappings || [];
  const dataSource = resolved.dataSource;

  // Get create route props
  const createRoute = resolved.props?.createRoute;
  const createLabel = resolved.props?.createLabel || 'Create New';

  // Get field mappings
  const nameField = fields.find(f => f.targetField === 'name')?.targetField || 'name';
  const priceField = fields.find(f => f.targetField === 'price')?.targetField || 'price';
  const imageField = fields.find(f => f.targetField.includes('image'))?.targetField || 'image_url';
  const descriptionField = fields.find(f => f.targetField === 'description')?.targetField || 'description';
  const categoryField = fields.find(f => f.targetField === 'category')?.targetField || 'category';

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Star, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface ProductGridProps {
  title?: string;
  entity?: string;
  data?: any[];
  limit?: number;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any; // Accept any additional props from catalog
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title = 'Products',
  entity = '${dataSource}',
  data: dataProp,
  limit = 6,
  className = '',
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

  // Only fetch if data not provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity, limit],
    queryFn: async () => {
      const response = await api.get<any>(\`/\${entity}?limit=\${limit}\`);
      return response.data || response;
    },
    enabled: !dataProp,
  });

  const data = dataProp || fetchedData || [];

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <h2 className={\`text-2xl font-bold mb-6 \${styles.title}\`}>{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className={cn('overflow-hidden', styles.card)}>
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <h2 className={\`text-2xl font-bold mb-6 \${styles.title}\`}>{title}</h2>
        <div className="text-center py-12 text-red-600 dark:text-red-400">
          Failed to load items. Please try again.
        </div>
      </div>
    );
  }

  const handleItemClick = (item: any) => {
    const itemId = item.id || item._id;
    navigate(\`/\${entity}/\${itemId}\`);
  };

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();

    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];

      // Check if item already in cart
      const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.productId === item.id);

      if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        cart.push({
          productId: item.id,
          name: item.${nameField},
          price: typeof item.${priceField} === 'string' ? parseFloat(item.${priceField}) : item.${priceField},
          quantity: 1,
          image: item.image_url || item.images,
        });
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Show success message and navigate to cart
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  return (
    <div className={cn(styles.container, className)}>
      ${createRoute ? `<div className="flex items-center justify-between mb-6">
        <h2 className={\`text-2xl font-bold \${styles.title}\`}>{title}</h2>
        <button
          onClick={() => navigate('${createRoute}')}
          className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all', styles.button, styles.buttonHover)}
        >
          <Plus className="w-4 h-4" />
          ${createLabel}
        </button>
      </div>` : `{title && (
        <h2 className={\`text-2xl font-bold mb-6 \${styles.title}\`}>{title}</h2>
      )}`}

      {data.length === 0 ? (
        <div className={\`text-center py-12 \${styles.text}\`}>
          No items available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item: any, index: number) => {
            const itemId = item.id || item._id || index;
            const name = item.${nameField} || '';
            const price = item.${priceField} || 0;
            const image = item.image_url || item.images || '';
            const description = item.${descriptionField} || '';
            const category = item.${categoryField} || '';

            return (
              <Card
                key={itemId}
                className={cn('overflow-hidden transition-all duration-300 cursor-pointer group', styles.card, styles.cardHover)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&size=400&background=random\`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}

                  {/* Category Badge */}
                  {category && (
                    <Badge className={\`absolute top-3 left-3 \${styles.badge}\`}>
                      {category}
                    </Badge>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      className={cn('p-3 rounded-full shadow-lg transition-all hover:scale-110', styles.card, styles.cardHover)}
                    >
                      <Eye className={\`w-5 h-5 \${styles.accent}\`} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className={cn('p-3 rounded-full shadow-lg transition-all hover:scale-110', styles.card, styles.cardHover)}
                      title="Add to Cart"
                    >
                      <ShoppingCart className={\`w-5 h-5 \${styles.accent}\`} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4" onClick={() => handleItemClick(item)}>
                  <h3 className={\`font-semibold text-lg mb-2 line-clamp-1 \${styles.title}\`}>
                    {name}
                  </h3>

                  {description && (
                    <p className={\`text-sm mb-3 line-clamp-2 \${styles.text}\`}>
                      {description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className={\`text-xl font-bold \${styles.title}\`}>
                      {formatPrice(price)}
                    </div>
                    <Button
                      size="sm"
                      className={cn(styles.button, styles.buttonHover)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
`;
};
