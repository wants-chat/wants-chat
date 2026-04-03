import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateEmptyCartState = (
  resolved: ResolvedComponent,
  variant: 'minimal' | 'withSuggestions' | 'illustrated' = 'minimal'
) => {
  const dataSource = resolved.dataSource;

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

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, Package, ArrowRight, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    minimal: `
${commonImports}

interface EmptyCartStateProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const EmptyCartStateComponent: React.FC<EmptyCartStateProps> = ({
  ${dataName}: initialData,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cartData = ${dataName} || {};

  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};

  // Event handlers
  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    alert('Redirecting to shop...');
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center p-4", className)}>
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-100 dark:border-blue-900/50">
            <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
          {emptyTitle}
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          {emptyMessage}
        </p>

        {/* Action Button */}
        <Button
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 dark:from-blue-500 dark:via-blue-600 dark:to-blue-500 h-14 px-10 text-lg font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 rounded-xl hover:scale-105"
          onClick={handleContinueShopping}
        >
          {continueShoppingButton}
        </Button>
      </div>
    </div>
  );
};

export default EmptyCartStateComponent;
    `,

    withSuggestions: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
}

interface EmptyCartStateProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const EmptyCartStateComponent: React.FC<EmptyCartStateProps> = ({
  ${dataName}: initialData,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cartData = ${dataName} || {};

  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const continueShoppingButton = ${getField('continueShoppingButton')};
  const suggestedProductsTitle = ${getField('suggestedProductsTitle')};
  const recentlyViewedTitle = ${getField('recentlyViewedTitle')};
  const suggestedProducts = ${getField('suggestedProducts')};
  const recentlyViewedProducts = ${getField('recentlyViewedProducts')};

  // Event handlers
  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    alert('Redirecting to shop...');
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    alert(\`View \${product.name}\\nPrice: $\${Number(product.price).toFixed(2)}\`);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart clicked:', product);
    alert(\`\${product.name} added to cart!\\nPrice: $\${Number(product.price).toFixed(2)}\`);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Empty State */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl p-16 text-center mb-16 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-2xl">
              <ShoppingBag className="w-14 h-14 text-white" />
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
            {emptyTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {emptyMessage}
          </p>
          <Button
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 dark:from-blue-500 dark:via-blue-600 dark:to-blue-500 h-14 px-10 text-lg font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 rounded-xl hover:scale-105"
            onClick={handleContinueShopping}
          >
            {continueShoppingButton}
          </Button>
        </div>

        {/* Suggested Products */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {suggestedProductsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedProducts.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleProductClick(product)}
                />
                <div className="p-4">
                  <h4
                    className="font-medium text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      \${Number(product.price).toFixed(2)}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {recentlyViewedTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentlyViewedProducts.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleProductClick(product)}
                />
                <div className="flex-1">
                  <h4
                    className="font-medium text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h4>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    \${Number(product.price).toFixed(2)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCartStateComponent;
    `,

    illustrated: `
${commonImports}

interface EmptyCartStateProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const EmptyCartStateComponent: React.FC<EmptyCartStateProps> = ({
  ${dataName}: initialData,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cartData = ${dataName} || {};

  const emptyTitle = ${getField('emptyTitle')};
  const emptyMessage = ${getField('emptyMessage')};
  const emptyDescription = ${getField('emptyDescription')};
  const browseProductsButton = ${getField('browseProductsButton')};
  const viewCategoriesButton = ${getField('viewCategoriesButton')};

  // Event handlers
  const handleBrowseProducts = () => {
    console.log('Browse products clicked');
    alert('Navigating to all products...');
  };

  const handleViewCategories = () => {
    console.log('View categories clicked');
    alert('Navigating to categories...');
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4", className)}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          {/* Shopping Cart Illustration */}
          <div className="w-48 h-48 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
            <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-blue-200 dark:border-blue-800">
              <ShoppingCart className="w-24 h-24 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-0 right-1/4 animate-bounce">
            <Package className="w-8 h-8 text-purple-400 dark:text-purple-500" />
          </div>
          <div className="absolute bottom-0 left-1/4 animate-pulse">
            <ShoppingBag className="w-8 h-8 text-blue-400 dark:text-blue-500" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {emptyTitle}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">
          {emptyMessage}
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-10">
          {emptyDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-12 px-8 text-base"
            onClick={handleBrowseProducts}
          >
            {browseProductsButton}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={handleViewCategories}
          >
            {viewCategoriesButton}
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">On orders over $50</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quality Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Handpicked selection</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">30-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCartStateComponent;
    `
  };

  return variants[variant] || variants.minimal;
};
