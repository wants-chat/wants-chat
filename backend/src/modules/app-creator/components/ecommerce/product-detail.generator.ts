/**
 * Product Detail Component Generator
 *
 * Generates a product detail page with image, pricing,
 * quantity selector, and add-to-cart functionality.
 */

export interface ProductDetailOptions {
  componentName?: string;
  endpoint?: string;
  showRating?: boolean;
  showStock?: boolean;
  showComparePrice?: boolean;
}

export function generateProductDetail(options: ProductDetailOptions = {}): string {
  const {
    componentName = 'ProductDetail',
    endpoint = '/products',
    showRating = true,
    showStock = true,
    showComparePrice = true,
  } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Star, Loader2, ImageOff } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  // Helper to get image URL from various formats
  const getProductImage = (product: any): string => {
    if (!product) return '';
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;
    if (product.images) {
      // Handle JSON string
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) return parsed[0] || '';
          return parsed;
        } catch {
          return product.images;
        }
      }
      // Handle array
      if (Array.isArray(product.images)) return product.images[0] || '';
    }
    return '';
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.productId === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: getProductImage(product),
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product not found</h3>
      </div>
    );
  }

  const image = getProductImage(product);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {image && !imageError ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-16 h-16 mb-2" />
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          ${showRating ? `{product.rating && (
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={\`w-5 h-5 \${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`} />
              ))}
              {product.review_count && (
                <span className="text-sm text-gray-500 ml-2">({product.review_count} reviews)</span>
              )}
            </div>
          )}` : ''}
          <div className="flex items-center gap-3 mb-4">
            ${showComparePrice ? `{product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xl text-gray-400 line-through">
                \${parseFloat(product.compare_at_price).toFixed(2)}
              </span>
            )}` : ''}
            <span className="text-3xl font-bold text-blue-600">
              \${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
            </span>
            ${showComparePrice ? `{product.compare_at_price && product.compare_at_price > product.price && (
              <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                Save {Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </span>
            )}` : ''}
          </div>
          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{product.description}</p>
          )}
          ${showStock ? `{product.stock_quantity !== undefined && (
            <p className={\`text-sm mb-4 \${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}\`}>
              {product.stock_quantity > 0 ? \`\${product.stock_quantity} in stock\` : 'Out of stock'}
            </p>
          )}` : ''}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-gray-700 dark:text-gray-300">Quantity:</label>
            <div className="flex items-center border rounded-lg dark:border-gray-600">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-2 text-center border-x dark:border-gray-600 bg-transparent"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={addToCart}
            disabled={${showStock ? 'product.stock_quantity !== undefined && product.stock_quantity <= 0' : 'false'}}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
