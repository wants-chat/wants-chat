import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCartItemRow = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'editable' = 'compact'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    compact: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemRowProps {
  ${dataName}?: any;
  className?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

const CartItemRowComponent: React.FC<CartItemRowProps> = ({
  ${dataName},
  className,
  onQuantityChange,
  onRemove
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const itemData = ${dataName} || fetchedData || ${getField('cartItemCompact')};

  const [quantity, setQuantity] = useState(itemData?.quantity || 1);

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-6", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-6 text-red-500", className)}>
        Failed to load cart item
      </div>
    );
  }

  if (!itemData) {
    return null;
  }

  const quantityLabel = ${getField('quantityLabel')};
  const priceLabel = ${getField('priceLabel')};
  const totalLabel = ${getField('totalLabel')};

  // Event handlers
  const handleProductClick = () => {
    console.log('Product clicked:', itemData);
    alert(\`\${itemData.name}\\nPrice: $\${Number(itemData.price).toFixed(2)}\`);
  };

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(itemData.id, newQuantity);
    }
    console.log(\`Quantity updated: \${newQuantity}\`);
  };

  const handleRemove = () => {
    console.log('Item removed:', itemData);
    if (onRemove) {
      onRemove(itemData.id);
    }
    alert(\`\${itemData.name} removed from cart\`);
  };

  const lineTotal = itemData.price * quantity;

  return (
    <div className={cn("flex items-center gap-4 py-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200", className)}>
      {/* Product Image */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
        <img
          src={itemData.image}
          alt={itemData.name}
          className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={handleProductClick}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4
          className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-base"
          onClick={handleProductClick}
        >
          {itemData.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
          {priceLabel}: <span className="text-blue-600 dark:text-blue-400">\${Number(itemData.price).toFixed(2)}</span>
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 rounded-full p-1">
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
          onClick={() => updateQuantity(-1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">{quantity}</span>
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
          onClick={() => updateQuantity(1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Line Total */}
      <div className="w-28 text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{totalLabel}</p>
        <p className="font-bold text-lg text-gray-900 dark:text-white">\${lineTotal.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItemRowComponent;
    `,

    detailed: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  brand: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemRowProps {
  ${dataName}?: any;
  className?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  onSaveForLater?: (id: string) => void;
}

const CartItemRowComponent: React.FC<CartItemRowProps> = ({
  ${dataName},
  className,
  onQuantityChange,
  onRemove,
  onSaveForLater
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const itemData = ${dataName} || fetchedData || ${getField('cartItemDetailed')};

  const [quantity, setQuantity] = useState(itemData?.quantity || 1);

  const quantityLabel = ${getField('quantityLabel')};
  const colorLabel = ${getField('colorLabel')};
  const sizeLabel = ${getField('sizeLabel')};
  const removeLabel = ${getField('removeLabel')};
  const saveLabel = ${getField('saveLabel')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-8 text-red-500", className)}>
        Failed to load cart item
      </div>
    );
  }

  if (!itemData) {
    return null;
  }

  // Event handlers
  const handleProductClick = () => {
    console.log('Product clicked:', itemData);
    alert(\`\${itemData.name}\\n\${itemData.description}\\nBrand: \${itemData.brand}\\nSKU: \${itemData.sku}\`);
  };

  const updateQuantity = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(itemData.id, newQuantity);
    }
    console.log(\`Quantity updated: \${newQuantity}\`);
  };

  const handleRemove = () => {
    console.log('Item removed:', itemData);
    if (onRemove) {
      onRemove(itemData.id);
    }
    alert(\`\${itemData.name} removed from cart\`);
  };

  const handleSaveForLater = () => {
    console.log('Save for later clicked:', itemData);
    if (onSaveForLater) {
      onSaveForLater(itemData.id);
    }
    alert(\`\${itemData.name} saved for later\`);
  };

  const lineTotal = itemData.price * quantity;

  return (
    <div className={cn("flex gap-6 py-8 border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent dark:hover:from-gray-800/30 dark:hover:to-transparent transition-all duration-300", className)}>
      {/* Product Image */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
        <img
          src={itemData.image}
          alt={itemData.name}
          className="w-36 h-36 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-2xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-600"
          onClick={handleProductClick}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleProductClick}
            >
              {itemData.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{itemData.description}</p>
            <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Brand: {itemData.brand}</span>
              <span>SKU: {itemData.sku}</span>
            </div>
            <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{colorLabel}: {itemData.color}</span>
              <span>{sizeLabel}: {itemData.size}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">\${Number(itemData.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{quantityLabel}:</span>
            <Select value={quantity.toString()} onValueChange={(val) => updateQuantity(parseInt(val))}>
              <SelectTrigger className="w-20 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()} className="dark:text-white dark:focus:bg-gray-600">
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Line Total: <span className="font-semibold text-gray-900 dark:text-white">\${lineTotal.toFixed(2)}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveForLater}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              {saveLabel}
            </button>
            <button
              onClick={handleRemove}
              className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {removeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRowComponent;
    `,

    editable: `
${commonImports}

interface CartItem {
  id: string;
  name: string;
  description: string;
  color: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  inStock: boolean;
  image: string;
}

interface CartItemRowProps {
  ${dataName}?: any;
  className?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onColorChange?: (id: string, color: string) => void;
  onSizeChange?: (id: string, size: string) => void;
  onRemove?: (id: string) => void;
}

const CartItemRowComponent: React.FC<CartItemRowProps> = ({
  ${dataName},
  className,
  onQuantityChange,
  onColorChange,
  onSizeChange,
  onRemove
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const itemData = ${dataName} || fetchedData || ${getField('cartItemEditable')};

  const [quantity, setQuantity] = useState(itemData?.quantity || 1);
  const [color, setColor] = useState(itemData?.color);
  const [size, setSize] = useState(itemData?.size);

  const quantityLabel = ${getField('quantityLabel')};
  const colorLabel = ${getField('colorLabel')};
  const sizeLabel = ${getField('sizeLabel')};
  const removeLabel = ${getField('removeLabel')};
  const colorOptions = ${getField('colorOptions')};
  const sizeOptions = ${getField('sizeOptions')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center py-8 text-red-500", className)}>
        Failed to load cart item
      </div>
    );
  }

  if (!itemData) {
    return null;
  }

  // Event handlers
  const handleProductClick = () => {
    console.log('Product clicked:', itemData);
    alert(\`\${itemData.name}\\n\${itemData.description}\\nPrice: $\${Number(itemData.price).toFixed(2)}\`);
  };

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(itemData.id, newQuantity);
    }
    console.log(\`Quantity updated: \${newQuantity}\`);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (onColorChange) {
      onColorChange(itemData.id, newColor);
    }
    console.log(\`Color changed: \${newColor}\`);
  };

  const handleSizeChange = (newSize: string) => {
    setSize(newSize);
    if (onSizeChange) {
      onSizeChange(itemData.id, newSize);
    }
    console.log(\`Size changed: \${newSize}\`);
  };

  const handleRemove = () => {
    console.log('Item removed:', itemData);
    if (onRemove) {
      onRemove(itemData.id);
    }
    alert(\`\${itemData.name} removed from cart\`);
  };

  const lineTotal = itemData.price * quantity;
  const savings = itemData.originalPrice ? (itemData.originalPrice - itemData.price) * quantity : 0;

  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300", className)}>
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-0 hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
          <img
            src={itemData.image}
            alt={itemData.name}
            className="w-36 h-36 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-2xl flex-shrink-0 object-cover cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-600"
            onClick={handleProductClick}
          />
          {itemData.originalPrice && itemData.originalPrice > itemData.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round(((itemData.originalPrice - itemData.price) / itemData.originalPrice) * 100)}%
            </div>
          )}
          {!itemData.inStock && (
            <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleProductClick}
              >
                {itemData.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{itemData.description}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Price */}
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                \${Number(itemData.price).toFixed(2)}
              </span>
              {itemData.originalPrice && itemData.originalPrice > itemData.price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  \${itemData.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Variant Selectors */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {/* Color Selector */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{colorLabel}</label>
              <Select value={color} onValueChange={handleColorChange}>
                <SelectTrigger className="h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {colorOptions.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="dark:text-white dark:focus:bg-gray-600">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{sizeLabel}</label>
              <Select value={size} onValueChange={handleSizeChange}>
                <SelectTrigger className="h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {sizeOptions.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="dark:text-white dark:focus:bg-gray-600">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{quantityLabel}</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-9 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => updateQuantity(-1)}
                  disabled={!itemData.inStock}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm text-gray-900 dark:text-white">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-9 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => updateQuantity(1)}
                  disabled={!itemData.inStock}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {savings > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  You save \${savings.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total: </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">\${lineTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRowComponent;
    `
  };

  return variants[variant] || variants.compact;
};
