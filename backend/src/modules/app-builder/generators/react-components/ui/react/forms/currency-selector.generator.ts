import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCurrencySelector = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'modal' | 'search' = 'dropdown'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Check, ChevronDown, Search, Info, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
}

interface CurrencySelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onCurrencyChange?: (currency: Currency) => void;
}

const CurrencySelectorComponent: React.FC<CurrencySelectorProps> = ({
  ${dataName},
  className,
  onCurrencyChange
}) => {
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

  const currencyData = propData || fetchedData || {};

  const currentCurrencyCode = ${getField('currentCurrency')};
  const currencies = ${getField('currencies')};
  const conversionNotice = ${getField('conversionNotice')};

  const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrencyCode);

  const currentCurr = currencies.find((curr: Currency) => curr.code === selectedCurrency);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency.code);
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
    localStorage.setItem('selectedCurrency', currency.code);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Currency Settings
          </CardTitle>
          <CardDescription>
            Select your preferred currency for pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency-dropdown">Current Currency</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="currency-dropdown"
                  variant="outline"
                  className="w-full justify-between"
                  aria-label="Select currency"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentCurr?.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">
                        {currentCurr?.symbol} {currentCurr?.code}
                      </div>
                      <div className="text-xs text-gray-500">{currentCurr?.name}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-y-auto">
                {currencies.map((currency: Currency) => (
                  <DropdownMenuItem
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <div className="font-medium">
                            {currency.symbol} {currency.code}
                          </div>
                          <div className="text-xs text-gray-500">{currency.name}</div>
                        </div>
                      </div>
                      {selectedCurrency === currency.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              {conversionNotice}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencySelectorComponent;
    `,

    modal: `
${commonImports}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
}

interface CurrencySelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onCurrencyChange?: (currency: Currency) => void;
}

const CurrencySelectorComponent: React.FC<CurrencySelectorProps> = ({
  ${dataName},
  className,
  onCurrencyChange
}) => {
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

  const currencyData = propData || fetchedData || {};

  const title = ${getField('title')};
  const currentCurrencyCode = ${getField('currentCurrency')};
  const currencies = ${getField('currencies')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const applyButton = ${getField('applyButton')};
  const cancelButton = ${getField('cancelButton')};
  const conversionNotice = ${getField('conversionNotice')};

  const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrencyCode);
  const [tempSelection, setTempSelection] = useState<string>(currentCurrencyCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const currentCurr = currencies.find((curr: Currency) => curr.code === selectedCurrency);

  const filteredCurrencies = currencies.filter((curr: Currency) =>
    curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    setSelectedCurrency(tempSelection);
    const currency = currencies.find((curr: Currency) => curr.code === tempSelection);
    if (currency && onCurrencyChange) {
      onCurrencyChange(currency);
    }
    localStorage.setItem('selectedCurrency', tempSelection);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelection(selectedCurrency);
    setSearchQuery('');
    setOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" size="lg">
            <DollarSign className="w-5 h-5" />
            <span className="text-xl">{currentCurr?.flag}</span>
            <span>{currentCurr?.symbol} {currentCurr?.code}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              Choose your preferred currency for pricing
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              {conversionNotice}
            </AlertDescription>
          </Alert>

          <div className="flex-1 overflow-y-auto space-y-1 py-4">
            {filteredCurrencies.map((currency: Currency) => (
              <button
                key={currency.code}
                onClick={() => setTempSelection(currency.code)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors",
                  tempSelection === currency.code && "bg-blue-50 border-2 border-blue-500"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">
                      {currency.symbol} {currency.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currency.name} - {currency.country}
                    </div>
                  </div>
                </div>
                {tempSelection === currency.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              {cancelButton}
            </Button>
            <Button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {applyButton}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurrencySelectorComponent;
    `,

    search: `
${commonImports}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
}

interface CurrencySelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onCurrencyChange?: (currency: Currency) => void;
}

const CurrencySelectorComponent: React.FC<CurrencySelectorProps> = ({
  ${dataName},
  className,
  onCurrencyChange
}) => {
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

  const currencyData = propData || fetchedData || {};

  const title = ${getField('title')};
  const currentCurrencyCode = ${getField('currentCurrency')};
  const currencies = ${getField('currencies')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const conversionNotice = ${getField('conversionNotice')};

  const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrencyCode);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = currencies.filter((curr: Currency) =>
    curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency.code);
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
    localStorage.setItem('selectedCurrency', currency.code);
  };

  // Group popular currencies
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
  const popular = currencies.filter((c: Currency) => popularCurrencies.includes(c.code));
  const others = filteredCurrencies.filter((c: Currency) => !popularCurrencies.includes(c.code));

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Select your preferred currency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              {conversionNotice}
            </AlertDescription>
          </Alert>

          {!searchQuery && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Currencies</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {popular.map((currency: Currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md",
                      selectedCurrency === currency.code
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-3xl">{currency.flag}</span>
                    <div className="text-center">
                      <div className="font-bold text-lg">{currency.symbol}</div>
                      <div className="text-xs font-medium">{currency.code}</div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-600 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {searchQuery ? 'Search Results' : 'All Currencies'}
            </h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {(searchQuery ? filteredCurrencies : others).map((currency: Currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors",
                    selectedCurrency === currency.code && "bg-blue-50 border-2 border-blue-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">
                        {currency.symbol} {currency.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currency.name} - {currency.country}
                      </div>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredCurrencies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No currencies found matching "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencySelectorComponent;
    `
  };

  return variants[variant] || variants.dropdown;
};
