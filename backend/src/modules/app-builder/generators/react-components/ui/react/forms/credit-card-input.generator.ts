import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCreditCardInput = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withIcons' | 'secure' = 'basic'
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
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface CreditCardInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (cardData: any) => void;
}

const CreditCardInputComponent: React.FC<CreditCardInputProps> = ({
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

  const sourceData = propData || fetchedData || {};

  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const cardNumberLabel = ${getField('cardNumberLabel')};
  const cardholderLabel = ${getField('cardholderLabel')};
  const expiryLabel = ${getField('expiryLabel')};
  const cvvLabel = ${getField('cvvLabel')};

  const cardNumberPlaceholder = ${getField('cardNumberPlaceholder')};
  const cardholderPlaceholder = ${getField('cardholderPlaceholder')};
  const expiryPlaceholder = ${getField('expiryPlaceholder')};
  const cvvPlaceholder = ${getField('cvvPlaceholder')};

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 16);
    setCardNumber(formatCardNumber(value));
    notifyChange({ cardNumber: value, cardholder, expiry, cvv });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setExpiry(formatExpiry(value));
    notifyChange({ cardNumber, cardholder, expiry: value, cvv });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setCvv(value);
    notifyChange({ cardNumber, cardholder, expiry, cvv: value });
  };

  const notifyChange = (data: any) => {
    if (onChange) {
      onChange(data);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">{cardNumberLabel}</Label>
          <Input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder={cardNumberPlaceholder}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cardholder">{cardholderLabel}</Label>
          <Input
            id="cardholder"
            type="text"
            value={cardholder}
            onChange={(e) => {
              setCardholder(e.target.value);
              notifyChange({ cardNumber, cardholder: e.target.value, expiry, cvv });
            }}
            placeholder={cardholderPlaceholder}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">{expiryLabel}</Label>
            <Input
              id="expiry"
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder={expiryPlaceholder}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cvv">{cvvLabel}</Label>
            <Input
              id="cvv"
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder={cvvPlaceholder}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardInputComponent;
    `,

    withIcons: `
${commonImports}

interface CardType {
  type: string;
  pattern: RegExp;
  icon: string;
  name: string;
}

interface CreditCardInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (cardData: any) => void;
}

const CreditCardInputComponent: React.FC<CreditCardInputProps> = ({
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

  const sourceData = propData || fetchedData || {};

  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [detectedCard, setDetectedCard] = useState<CardType | null>(null);

  const cardTypes: CardType[] = ${getField('cardTypes')};

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\\s/g, '');
    const detected = cardTypes.find((card: CardType) => card.pattern.test(cleaned));
    setDetectedCard(detected || null);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 16);
    setCardNumber(formatCardNumber(value));
    detectCardType(value);
    notifyChange({ cardNumber: value, cardholder, expiry, cvv, cardType: detectedCard?.type });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setExpiry(formatExpiry(value));
    notifyChange({ cardNumber, cardholder, expiry: value, cvv, cardType: detectedCard?.type });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setCvv(value);
    notifyChange({ cardNumber, cardholder, expiry, cvv: value, cardType: detectedCard?.type });
  };

  const notifyChange = (data: any) => {
    if (onChange) {
      onChange(data);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl text-white mb-4">
        <div className="flex justify-between items-start mb-8">
          <CreditCard className="h-8 w-8" />
          {detectedCard && (
            <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              {detectedCard.name}
            </div>
          )}
        </div>
        <div className="font-mono text-xl mb-4 tracking-wider">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-xs opacity-70 mb-1">Cardholder</div>
            <div className="font-medium">{cardholder || 'YOUR NAME'}</div>
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">Expires</div>
            <div className="font-medium">{expiry || 'MM/YY'}</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative mt-1">
            <Input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
            />
            {detectedCard && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl">
                {detectedCard.icon}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="cardholder">Cardholder Name</Label>
          <Input
            id="cardholder"
            type="text"
            value={cardholder}
            onChange={(e) => {
              setCardholder(e.target.value.toUpperCase());
              notifyChange({ cardNumber, cardholder: e.target.value, expiry, cvv, cardType: detectedCard?.type });
            }}
            placeholder="JOHN DOE"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardInputComponent;
    `,

    secure: `
${commonImports}

interface CreditCardInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (cardData: any) => void;
}

const CreditCardInputComponent: React.FC<CreditCardInputProps> = ({
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

  const sourceData = propData || fetchedData || {};

  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateCard = () => {
    const newErrors: any = {};

    // Luhn algorithm for card validation
    const cardDigits = cardNumber.replace(/\\s/g, '');
    if (cardDigits.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry validation
    const [month, year] = expiry.split('/');
    if (month && (parseInt(month) < 1 || parseInt(month) > 12)) {
      newErrors.expiry = 'Invalid month';
    }

    // CVV validation
    if (cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 16);
    setCardNumber(formatCardNumber(value));
    setErrors({ ...errors, cardNumber: null });
    notifyChange({ cardNumber: value, cardholder, expiry, cvv });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setExpiry(formatExpiry(value));
    setErrors({ ...errors, expiry: null });
    notifyChange({ cardNumber, cardholder, expiry: value, cvv });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\D/g, '').slice(0, 4);
    setCvv(value);
    setErrors({ ...errors, cvv: null });
    notifyChange({ cardNumber, cardholder, expiry, cvv: value });
  };

  const notifyChange = (data: any) => {
    if (onChange) {
      onChange(data);
    }
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">256-bit SSL encrypted</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onBlur={validateCard}
                placeholder="1234 5678 9012 3456"
                className={cn("pl-10", errors.cardNumber && "border-red-500")}
              />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cardholder">Cardholder Name</Label>
            <Input
              id="cardholder"
              type="text"
              value={cardholder}
              onChange={(e) => {
                setCardholder(e.target.value);
                notifyChange({ cardNumber, cardholder: e.target.value, expiry, cvv });
              }}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                onBlur={validateCard}
                placeholder="MM/YY"
                className={cn("mt-1", errors.expiry && "border-red-500")}
              />
              {errors.expiry && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative mt-1">
                <Input
                  id="cvv"
                  type={showCvv ? "text" : "password"}
                  value={cvv}
                  onChange={handleCvvChange}
                  onBlur={validateCard}
                  placeholder="123"
                  className={cn("pr-10", errors.cvv && "border-red-500")}
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCvv ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardInputComponent;
    `
  };

  return variants[variant] || variants.basic;
};
