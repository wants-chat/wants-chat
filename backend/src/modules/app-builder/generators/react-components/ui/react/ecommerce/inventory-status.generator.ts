import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateInventoryStatus = (
  resolved: ResolvedComponent,
  variant: 'badge' | 'inline' | 'detailed' = 'badge'
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

  const formatDate = `(dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }`;

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Bell, Package, Clock, CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';`;

  const commonStyles = `
    .inventory-status-container {
      @apply w-full;
    }

    .product-card {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700;
    }

    .product-image {
      @apply w-full h-full object-cover;
    }

    .status-badge {
      @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold;
    }

    .status-in-stock {
      @apply bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300;
    }

    .status-low-stock {
      @apply bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300;
    }

    .status-out-of-stock {
      @apply bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300;
    }

    .status-coming-soon {
      @apply bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300;
    }

    .status-pre-order {
      @apply bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300;
    }

    .stock-indicator-bar {
      @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
    }

    .stock-indicator-fill {
      @apply h-full transition-all duration-500;
    }

    .notification-form {
      @apply space-y-4;
    }
  `;

  const variants = {
    badge: `
${commonImports}

interface InventoryStatusProps {
  ${dataName}?: any;
  className?: string;
  onRefresh?: (data?: any) => void;
  onAddToCart?: (product: any) => void;
  onNotify?: (product: any) => void;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ ${dataName}, className }) => {
  const sourceData = ${dataName} || {};
  const productsList = ${getField('products')};

  const inStockText = ${getField('inStockText')};
  const lowStockText = ${getField('lowStockText')};
  const outOfStockText = ${getField('outOfStockText')};
  const comingSoonText = ${getField('comingSoonText')};
  const preOrderText = ${getField('preOrderText')};
  const addToCartText = ${getField('addToCartText')};
  const notifyMeText = ${getField('notifyMeText')};

  const formatPrice = ${formatPrice};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return (
          <Badge className="status-badge status-in-stock">
            <CheckCircle className="w-3 h-3" />
            {inStockText}
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge className="status-badge status-low-stock">
            <AlertTriangle className="w-3 h-3" />
            {lowStockText}
          </Badge>
        );
      case 'out_of_stock':
        return (
          <Badge className="status-badge status-out-of-stock">
            <XCircle className="w-3 h-3" />
            {outOfStockText}
          </Badge>
        );
      case 'coming_soon':
        return (
          <Badge className="status-badge status-coming-soon">
            <Clock className="w-3 h-3" />
            {comingSoonText}
          </Badge>
        );
      case 'pre_order':
        return (
          <Badge className="status-badge status-pre-order">
            <Calendar className="w-3 h-3" />
            {preOrderText}
          </Badge>
        );
      default:
        return null;
    }
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const notifyMe = (product: any) => {
    console.log('Notify me for product:', product);
  };

  return (
    <>
<div className="inventory-status-container p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsList.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const image = ${getField('image')};
            const status = ${getField('status')};
            const stockCount = ${getField('stockCount')};

            return (
              <Card key={productId} className="product-card">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={image || '/api/placeholder/300/300'}
                    alt={name}
                    className="product-image"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(status)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {name}
                  </h3>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {formatPrice(price)}
                  </p>

                  {status === 'in_stock' && (
                    <Button className="w-full" onClick={() => addToCart(product)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addToCartText}
                    </Button>
                  )}

                  {status === 'low_stock' && (
                    <>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                        Only {stockCount} left!
                      </p>
                      <Button className="w-full" onClick={() => addToCart(product)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {addToCartText}
                      </Button>
                    </>
                  )}

                  {(status === 'out_of_stock' || status === 'coming_soon') && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => notifyMe(product)}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {notifyMeText}
                    </Button>
                  )}

                  {status === 'pre_order' && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => addToCart(product)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Pre-Order Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InventoryStatus;
    `,

    inline: `
${commonImports}

interface InventoryStatusProps {
  ${dataName}?: any;
  className?: string;
  onRefresh?: (data?: any) => void;
  onAddToCart?: (product: any) => void;
  onNotify?: (product: any) => void;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ ${dataName}, className }) => {
  const sourceData = ${dataName} || {};
  const productsList = ${getField('products')};

  const inStockText = ${getField('inStockText')};
  const lowStockText = ${getField('lowStockText')};
  const outOfStockText = ${getField('outOfStockText')};
  const addToCartText = ${getField('addToCartText')};

  const formatPrice = ${formatPrice};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600 dark:text-green-400';
      case 'low_stock':
        return 'text-orange-600 dark:text-orange-400';
      case 'out_of_stock':
        return 'text-red-600 dark:text-red-400';
      case 'coming_soon':
        return 'text-blue-600 dark:text-blue-400';
      case 'pre_order':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string, stockCount: number) => {
    switch (status) {
      case 'in_stock':
        return \`\${inStockText} (\${stockCount} available)\`;
      case 'low_stock':
        return \`\${lowStockText} - Only \${stockCount} left!\`;
      case 'out_of_stock':
        return outOfStockText;
      case 'coming_soon':
        return 'Coming Soon';
      case 'pre_order':
        return 'Pre-Order Available';
      default:
        return '';
    }
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="inventory-status-container p-4 md:p-6">
        <div className="space-y-3">
          {productsList.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const image = ${getField('image')};
            const status = ${getField('status')};
            const stockCount = ${getField('stockCount')};

            return (
              <Card key={productId} className="product-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={image || '/api/placeholder/80/80'}
                      alt={name}
                      className="w-20 h-20 object-cover rounded-md"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {name}
                      </h4>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </p>
                      <p className={\`text-sm font-medium mt-1 \${getStatusColor(status)}\`}>
                        <Package className="w-4 h-4 inline mr-1" />
                        {getStatusText(status, stockCount)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={status === 'out_of_stock' || status === 'coming_soon'}
                    >
                      {addToCartText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InventoryStatus;
    `,

    detailed: `
${commonImports}

interface InventoryStatusProps {
  ${dataName}?: any;
  className?: string;
  onRefresh?: (data?: any) => void;
  onAddToCart?: (product: any) => void;
  onNotify?: (product: any) => void;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ ${dataName}, className }) => {
  const sourceData = ${dataName} || {};
  const productsList = ${getField('products')};

  const [notificationEmail, setNotificationEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const inStockText = ${getField('inStockText')};
  const lowStockText = ${getField('lowStockText')};
  const outOfStockText = ${getField('outOfStockText')};
  const comingSoonText = ${getField('comingSoonText')};
  const addToCartText = ${getField('addToCartText')};
  const notifyMeText = ${getField('notifyMeText')};
  const restockAlertText = ${getField('restockAlertText')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const subscribeText = ${getField('subscribeText')};
  const notificationSuccessText = ${getField('notificationSuccessText')};

  const formatPrice = ${formatPrice};
  const formatDate = ${formatDate};

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const handleNotify = (productId: any) => {
    console.log('Subscribing for notifications:', {
      productId,
      email: notificationEmail
    });
    setShowNotification(true);
    setNotificationEmail('');
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getStockPercentage = (stockCount: number, lowStockThreshold: number) => {
    const maxStock = lowStockThreshold * 4;
    return Math.min((stockCount / maxStock) * 100, 100);
  };

  const getStockBarColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-500';
      case 'low_stock':
        return 'bg-orange-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <>
<div className="inventory-status-container p-4 md:p-6">
        {showNotification && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            {notificationSuccessText}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productsList.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const image = ${getField('image')};
            const status = ${getField('status')};
            const stockCount = ${getField('stockCount')};
            const lowStockThreshold = ${getField('lowStockThreshold')};
            const restockDate = ${getField('restockDate')};
            const releaseDate = ${getField('releaseDate')};

            return (
              <Card key={productId} className="product-card">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={image || '/api/placeholder/150/150'}
                      alt={name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {name}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {formatPrice(price)}
                      </p>

                      {/* In Stock */}
                      {status === 'in_stock' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">{inStockText}</span>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Availability</span>
                              <span>{stockCount} units</span>
                            </div>
                            <div className="stock-indicator-bar">
                              <div
                                className={\`stock-indicator-fill \${getStockBarColor(status)}\`}
                                style={{ width: \`\${getStockPercentage(stockCount, lowStockThreshold)}%\` }}
                              />
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => addToCart(product)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addToCartText}
                          </Button>
                        </div>
                      )}

                      {/* Low Stock */}
                      {status === 'low_stock' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">
                              {lowStockText} - Only {stockCount} left!
                            </span>
                          </div>
                          <div>
                            <div className="stock-indicator-bar">
                              <div
                                className={\`stock-indicator-fill \${getStockBarColor(status)}\`}
                                style={{ width: \`\${getStockPercentage(stockCount, lowStockThreshold)}%\` }}
                              />
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => addToCart(product)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addToCartText}
                          </Button>
                        </div>
                      )}

                      {/* Out of Stock */}
                      {status === 'out_of_stock' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span className="font-semibold">{outOfStockText}</span>
                          </div>
                          {restockDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expected restock: {formatDate(restockDate)}
                            </p>
                          )}
                          <div className="notification-form">
                            <Input
                              type="email"
                              placeholder={emailPlaceholder}
                              value={notificationEmail}
                              onChange={(e) => setNotificationEmail(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleNotify(productId)}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              {restockAlertText}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Coming Soon */}
                      {status === 'coming_soon' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold">{comingSoonText}</span>
                          </div>
                          {releaseDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Available from: {formatDate(releaseDate)}
                            </p>
                          )}
                          <div className="notification-form">
                            <Input
                              type="email"
                              placeholder={emailPlaceholder}
                              value={notificationEmail}
                              onChange={(e) => setNotificationEmail(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleNotify(productId)}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              {notifyMeText}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Pre-Order */}
                      {status === 'pre_order' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                            <Calendar className="w-5 h-5" />
                            <span className="font-semibold">Pre-Order Available</span>
                          </div>
                          {releaseDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ships on: {formatDate(releaseDate)}
                            </p>
                          )}
                          <Button className="w-full" onClick={() => addToCart(product)}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Pre-Order Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InventoryStatus;
    `
  };

  return variants[variant] || variants.badge;
};
