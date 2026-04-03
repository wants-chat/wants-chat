import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePhoneNumberInput = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withFlag' | 'international' = 'basic'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input, Loader2 } from '@/components/ui/input';
import { Phone, ChevronDown, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface PhoneNumberInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (phoneNumber: string) => void;
}

const PhoneNumberInputComponent: React.FC<PhoneNumberInputProps> = ({
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

  const phoneData = propData || fetchedData || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const placeholder = ${getField('placeholder')};

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    const match = cleaned.match(/^(\\d{3})(\\d{3})(\\d{4})$/);
    if (match) {
      return \`(\${match[1]}) \${match[2]}-\${match[3]}\`;
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '');
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    setError('');
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default PhoneNumberInputComponent;
    `,

    withFlag: `
${commonImports}

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
}

interface PhoneNumberInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (phoneNumber: string, countryCode: string) => void;
}

const PhoneNumberInputComponent: React.FC<PhoneNumberInputProps> = ({
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

  const phoneData = propData || fetchedData || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(${getField('defaultCountry')});
  const [showDropdown, setShowDropdown] = useState(false);

  const countries: Country[] = ${getField('countries')};
  const placeholderWithCode = ${getField('placeholderWithCode')};

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '');
    setPhoneNumber(value);
    if (onChange) {
      onChange(value, selectedCountry.code);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    if (onChange) {
      onChange(phoneNumber, country.code);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex gap-2">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-10 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-sm font-bold">{selectedCountry.dialCode}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-64 overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="flex-1 text-left text-sm">{country.name}</span>
                    <span className="text-sm text-gray-500">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholderWithCode}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default PhoneNumberInputComponent;
    `,

    international: `
${commonImports}

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
}

interface PhoneNumberInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (phoneNumber: string, countryCode: string) => void;
}

const PhoneNumberInputComponent: React.FC<PhoneNumberInputProps> = ({
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

  const phoneData = propData || fetchedData || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(${getField('defaultCountry')});
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isValid, setIsValid] = useState(true);

  const countries: Country[] = ${getField('countries')};

  const filteredCountries = countries.filter((country: Country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '');
    setPhoneNumber(value);

    // Basic validation
    const isValidLength = value.length >= 10 && value.length <= 15;
    setIsValid(isValidLength);

    if (onChange) {
      onChange(value, selectedCountry.code);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchQuery('');
    if (onChange) {
      onChange(phoneNumber, country.code);
    }
  };

  const getFormattedNumber = () => {
    if (!phoneNumber) return '';
    return \`\${selectedCountry.dialCode} \${phoneNumber}\`;
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-stretch">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-full px-4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
            >
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span className="text-sm font-bold">{selectedCountry.dialCode}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search countries..."
                      className="h-8"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCountries.map((country: Country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className={cn(
                          "w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700",
                          selectedCountry.code === country.code && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-bold">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.dialCode}</div>
                        </div>
                        {selectedCountry.code === country.code && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={selectedCountry.format}
            className={cn(
              "flex-1 border-0 rounded-l-none focus-visible:ring-0",
              !isValid && phoneNumber && "text-red-600"
            )}
          />
        </div>

        {phoneNumber && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">International format:</span>
              <span className="font-mono font-bold">{getFormattedNumber()}</span>
            </div>
            {!isValid && (
              <div className="mt-1 text-red-600 text-xs">Please enter a valid phone number</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneNumberInputComponent;
    `
  };

  return variants[variant] || variants.basic;
};
