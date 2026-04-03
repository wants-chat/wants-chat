import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCartSummarySidebar = (
  resolved: ResolvedComponent,
  variant: 'sticky' | 'floating' | 'detailed' = 'sticky'
) => {
  const dataSource = resolved.dataSource;

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
import { ShoppingCart, Lock, ChevronRight, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    sticky: `
${commonImports}

interface CartSummarySidebarProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const CartSummarySidebarComponent: React.FC<CartSummarySidebarProps> = ({
  ${dataName}: dataProp,
  className,
  onCheckout
}) => {
  const summaryData = dataProp || {};

  const summaryTitle = summaryData.summaryTitle || '';
  const checkoutButton = summaryData.checkoutButton || '';
  const subtotalLabel = summaryData.subtotalLabel || '';
  const shippingLabel = summaryData.shippingLabel || '';
  const taxLabel = summaryData.taxLabel || '';
  const discountLabel = summaryData.discountLabel || '';
  const totalLabel = summaryData.totalLabel || '';
  const subtotal = Number(summaryData.subtotal) || 0;
  const shipping = Number(summaryData.shipping) || 0;
  const tax = Number(summaryData.tax) || 0;
  const discount = Number(summaryData.discount) || 0;
  const itemCount = Number(summaryData.itemCount) || 0;
  const itemsLabel = summaryData.itemsLabel || '';
  const shippingMessage = summaryData.shippingMessage || '';
  const taxMessage = summaryData.taxMessage || '';
  const secureCheckoutMessage = summaryData.secureCheckoutMessage || '';

  const total = subtotal + shipping + tax - discount;

  // Event handlers
  const handleCheckout = () => {
    console.log('Checkout clicked', { subtotal, shipping, tax, discount, total });
    if (onCheckout) {
      onCheckout();
    }
    alert(\`Proceeding to checkout\\nTotal: $\${total.toFixed(2)}\`);
  };

  return (
    <div className={cn("sticky top-8", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {summaryTitle}
        </h2>

        {/* Item Count */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ShoppingCart className="w-4 h-4" />
            <span>{itemCount} {itemsLabel}</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
            <span className="font-medium text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {shipping === 0 ? shippingMessage : \`$\${shipping.toFixed(2)}\`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{taxLabel}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tax === 0 ? taxMessage : \`$\${tax.toFixed(2)}\`}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>{discountLabel}</span>
              <span className="font-medium">-\${discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalLabel}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              \${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base font-semibold"
          onClick={handleCheckout}
        >
          {checkoutButton}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Security Message */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Lock className="w-3 h-3" />
          <span>{secureCheckoutMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummarySidebarComponent;
    `,

    floating: `
${commonImports}

interface CartSummarySidebarProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const CartSummarySidebarComponent: React.FC<CartSummarySidebarProps> = ({
  ${dataName}: dataProp,
  className,
  onCheckout
}) => {
  const summaryData = dataProp || {};

  const summaryTitle = summaryData.summaryTitle || '';
  const checkoutButton = summaryData.checkoutButton || '';
  const subtotalLabel = summaryData.subtotalLabel || '';
  const totalLabel = summaryData.totalLabel || '';
  const subtotal = Number(summaryData.subtotal) || 0;
  const shipping = Number(summaryData.shipping) || 0;
  const tax = Number(summaryData.tax) || 0;
  const discount = Number(summaryData.discount) || 0;
  const itemCount = Number(summaryData.itemCount) || 0;
  const freeShippingMessage = summaryData.freeShippingMessage || '';

  const total = subtotal + shipping + tax - discount;

  // Event handlers
  const handleCheckout = () => {
    console.log('Checkout clicked', { total });
    if (onCheckout) {
      onCheckout();
    }
    alert(\`Proceeding to checkout\\nTotal: $\${total.toFixed(2)}\`);
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-30 lg:hidden", className)}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Summary Info */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{totalLabel}:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                \${total.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {itemCount} items
            </p>
          </div>

          {/* Checkout Button */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-12 px-8"
            onClick={handleCheckout}
          >
            {checkoutButton}
          </Button>
        </div>

        {/* Free Shipping Progress */}
        {shipping === 0 && (
          <div className="mt-3">
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              🎉 {freeShippingMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSummarySidebarComponent;
    `,

    detailed: `
${commonImports}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CartSummarySidebarProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const CartSummarySidebarComponent: React.FC<CartSummarySidebarProps> = ({
  ${dataName}: dataProp,
  className,
  onCheckout
}) => {
  const summaryData = dataProp || {};

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showDetails, setShowDetails] = useState(false);

  const pricingTitle = summaryData.pricingTitle || '';
  const checkoutButton = summaryData.checkoutButton || '';
  const subtotalLabel = summaryData.subtotalLabel || '';
  const shippingLabel = summaryData.shippingLabel || '';
  const taxLabel = summaryData.taxLabel || '';
  const discountLabel = summaryData.discountLabel || '';
  const totalLabel = summaryData.totalLabel || '';
  const savingsLabel = summaryData.savingsLabel || '';
  const subtotal = Number(summaryData.subtotal) || 0;
  const shipping = Number(summaryData.shipping) || 0;
  const tax = Number(summaryData.tax) || 0;
  const discount = Number(summaryData.discount) || 0;
  const itemCount = Number(summaryData.itemCount) || 0;
  const itemsLabel = summaryData.itemsLabel || '';
  const currencies = summaryData.currencies || ([] as any[]);
  const freeShippingMessage = summaryData.freeShippingMessage || '';

  const total = subtotal + shipping + tax - discount;
  const selectedCurrencyObj = currencies.find((c: Currency) => c.code === selectedCurrency);

  // Event handlers
  const handleCheckout = () => {
    console.log('Checkout clicked', { total, currency: selectedCurrency });
    if (onCheckout) {
      onCheckout();
    }
    alert(\`Proceeding to checkout\\nTotal: \${selectedCurrencyObj?.symbol}\${total.toFixed(2)}\`);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    console.log('Currency changed:', currency);
  };

  return (
    <div className={cn("sticky top-8", className)}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Header with Currency Selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {pricingTitle}
          </h2>
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-24 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
              {currencies.map((currency: Currency) => (
                <SelectItem key={currency.code} value={currency.code} className="dark:text-white dark:focus:bg-gray-600">
                  {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Count Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {itemCount} {itemsLabel}
          </span>
        </div>

        {/* Quick Total */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600 dark:text-gray-400">{totalLabel}</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedCurrencyObj?.symbol}{total.toFixed(2)}
              </div>
              {discount > 0 && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  {savingsLabel}: {selectedCurrencyObj?.symbol}{discount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-3 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Details</span>
          <Info className={cn(
            "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform",
            showDetails && "rotate-180"
          )} />
        </button>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{subtotalLabel}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedCurrencyObj?.symbol}{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{shippingLabel}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {shipping === 0 ? 'Free' : \`\${selectedCurrencyObj?.symbol}\${shipping.toFixed(2)}\`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{taxLabel}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedCurrencyObj?.symbol}{tax.toFixed(2)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">{discountLabel}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -{selectedCurrencyObj?.symbol}{discount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Free Shipping Message */}
        {shipping === 0 && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              ✓ {freeShippingMessage}
            </p>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 text-base font-semibold"
          onClick={handleCheckout}
        >
          {checkoutButton}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Security Badges */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <span>•</span>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummarySidebarComponent;
    `
  };

  return variants[variant] || variants.sticky;
};
