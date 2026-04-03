import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAddressAutocomplete = (
  resolved: ResolvedComponent,
  variant: 'google' | 'mapbox' | 'manual' = 'google'
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

  const dataName = dataSource.split('.').pop() || 'data';

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
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input, Loader2 } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Check, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    google: `
${commonImports}

interface Address {
  id: number;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (address: Address) => void;
}

const AddressAutocompleteComponent: React.FC<AddressAutocompleteProps> = ({
  ${dataName},
  className,
  onChange
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

  const addressData = propData || fetchedData || {};

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholder = ${getField('placeholder')};
  const mockSuggestions: Address[] = ${getField('mockSuggestions')};
  const noResultsMessage = ${getField('noResultsMessage')};

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.length >= 3) {
      // Simulate API call to Google Places API
      const filtered = mockSuggestions.filter((suggestion: Address) =>
        suggestion.address.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setQuery(address.address);
    setShowSuggestions(false);

    if (onChange) {
      onChange(address);
    }

    console.log('Selected address:', address);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)} ref={containerRef}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <Label htmlFor="address" className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          Search Address
        </Label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="address"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSelectAddress(suggestion)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-3"
                  >
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {suggestion.street}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.city}, {suggestion.state} {suggestion.zip}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {noResultsMessage}
              </div>
            )}
          </div>
        )}

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Selected Address
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {selectedAddress.street}<br />
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}<br />
                  {selectedAddress.country}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressAutocompleteComponent;
    `,

    mapbox: `
${commonImports}

interface Address {
  id: number;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (address: Address) => void;
}

const AddressAutocompleteComponent: React.FC<AddressAutocompleteProps> = ({
  ${dataName},
  className,
  onChange
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

  const addressData = propData || fetchedData || {};

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockSuggestions: Address[] = ${getField('mockSuggestions')};

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.length >= 3) {
      setIsLoading(true);

      // Simulate Mapbox API call
      setTimeout(() => {
        const filtered = mockSuggestions.filter((suggestion: Address) =>
          suggestion.address.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setQuery('');
    setShowSuggestions(false);

    if (onChange) {
      onChange(address);
    }
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Address
          </h3>

          <div className="relative">
            <Input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type to search..."
              className="mb-2"
            />

            {showSuggestions && (
              <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onClick={() => handleSelectAddress(suggestion)}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <div className="text-sm font-medium">{suggestion.street}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.city}, {suggestion.state}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Address Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Selected Address
          </h3>

          {selectedAddress ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedAddress.street}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAddress.country}
                </div>
              </div>

              <Button
                onClick={() => setSelectedAddress(null)}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Change Address
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-600 py-8">
              No address selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressAutocompleteComponent;
    `,

    manual: `
${commonImports}

interface AddressAutocompleteProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (address: any) => void;
}

const AddressAutocompleteComponent: React.FC<AddressAutocompleteProps> = ({
  ${dataName},
  className,
  onChange
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

  const addressData = propData || fetchedData || {};

  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const addressLine1Label = ${getField('addressLine1Label')};
  const addressLine2Label = ${getField('addressLine2Label')};
  const cityLabel = ${getField('cityLabel')};
  const stateLabel = ${getField('stateLabel')};
  const zipCodeLabel = ${getField('zipCodeLabel')};
  const countryLabel = ${getField('countryLabel')};

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Enter Address
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="addressLine1">{addressLine1Label} *</Label>
            <Input
              id="addressLine1"
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              placeholder="123 Main Street"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">{addressLine2Label}</Label>
            <Input
              id="addressLine2"
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{cityLabel} *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">{stateLabel} *</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="NY"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">{zipCodeLabel} *</Label>
              <Input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="10001"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">{countryLabel} *</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="mt-1 block w-full h-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>

          {/* Address Preview */}
          {formData.addressLine1 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address Preview:
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>{formData.addressLine1}</div>
                {formData.addressLine2 && <div>{formData.addressLine2}</div>}
                <div>
                  {formData.city && \`\${formData.city}, \`}
                  {formData.state && \`\${formData.state} \`}
                  {formData.zipCode}
                </div>
                {formData.country && <div>{formData.country}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressAutocompleteComponent;
    `
  };

  return variants[variant] || variants.google;
};
