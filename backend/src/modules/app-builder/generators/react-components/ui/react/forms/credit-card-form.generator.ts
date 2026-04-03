import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCreditCardForm = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'inline' | 'modal' = 'standard'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    standard: `
${commonImports}

interface CreditCardFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSubmit?: (cardData: any) => void;
}

const CreditCardFormComponent: React.FC<CreditCardFormProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSubmit
}) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}/payments\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
    },
    onError: (err: any) => {
      console.error('Payment error:', err);
      alert(err.message || 'Payment failed');
    },
  });

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
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cardType, setCardType] = useState<string | null>(null);

  const cardNumberLabel = ${getField('cardNumberLabel')};
  const cardHolderLabel = ${getField('cardHolderLabel')};
  const expiryDateLabel = ${getField('expiryDateLabel')};
  const cvvLabel = ${getField('cvvLabel')};
  const saveCardLabel = ${getField('saveCardLabel')};
  const cardNumberPlaceholder = ${getField('cardNumberPlaceholder')};
  const cardHolderPlaceholder = ${getField('cardHolderPlaceholder')};
  const expiryPlaceholder = ${getField('expiryPlaceholder')};
  const cvvPlaceholder = ${getField('cvvPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const securePaymentMessage = ${getField('securePaymentMessage')};

  // Card number formatting
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Detect card type
  const detectCardType = (number: string) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) {
        return type;
      }
    }
    return null;
  };

  // Expiry formatting
  const formatExpiry = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  // Validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!cardNumber || cardNumber.replace(/\\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!cardHolder || cardHolder.length < 3) {
      newErrors.cardHolder = 'Please enter the cardholder name';
    }
    if (!expiry || expiry.length !== 5) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted.replace(/\\s/g, '')));
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    if (errors.expiry) {
      setErrors({ ...errors, expiry: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const data = {
        cardNumber: cardNumber.replace(/\\s/g, ''),
        cardHolder,
        expiry,
        cvv,
        saveCard,
        cardType
      };
      submitMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6", className)}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard className="w-6 h-6" />
        Payment Information
      </h3>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {cardNumberLabel}
        </label>
        <div className="relative">
          <Input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder={cardNumberPlaceholder}
            maxLength={19}
            className={cn(
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12",
              errors.cardNumber && "border-red-500 dark:border-red-500"
            )}
          />
          {cardType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {cardType}
              </div>
            </div>
          )}
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Card Holder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {cardHolderLabel}
        </label>
        <Input
          type="text"
          value={cardHolder}
          onChange={(e) => {
            setCardHolder(e.target.value.toUpperCase());
            if (errors.cardHolder) setErrors({ ...errors, cardHolder: '' });
          }}
          placeholder={cardHolderPlaceholder}
          className={cn(
            "uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white",
            errors.cardHolder && "border-red-500 dark:border-red-500"
          )}
        />
        {errors.cardHolder && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cardHolder}
          </p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {expiryDateLabel}
          </label>
          <Input
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
            placeholder={expiryPlaceholder}
            maxLength={5}
            className={cn(
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              errors.expiry && "border-red-500 dark:border-red-500"
            )}
          />
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.expiry}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {cvvLabel}
          </label>
          <Input
            type="text"
            value={cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setCvv(value);
              if (errors.cvv) setErrors({ ...errors, cvv: '' });
            }}
            placeholder={cvvPlaceholder}
            maxLength={4}
            className={cn(
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              errors.cvv && "border-red-500 dark:border-red-500"
            )}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Save Card Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="save-card"
          checked={saveCard}
          onCheckedChange={(checked) => setSaveCard(checked as boolean)}
        />
        <label
          htmlFor="save-card"
          className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {saveCardLabel}
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-base font-semibold"
      >
        {submitButton}
      </Button>

      {/* Security Message */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Lock className="w-3 h-3" />
        <span>{securePaymentMessage}</span>
      </div>
    </form>
  );
};

export default CreditCardFormComponent;
    `,

    inline: `
${commonImports}

interface CreditCardFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSubmit?: (cardData: any) => void;
}

const CreditCardFormComponent: React.FC<CreditCardFormProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSubmit
}) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}/payments\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
    },
    onError: (err: any) => {
      console.error('Payment error:', err);
    },
  });

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
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cardType, setCardType] = useState<string | null>(null);

  const cardNumberLabel = ${getField('cardNumberLabel')};
  const cardHolderLabel = ${getField('cardHolderLabel')};
  const expiryDateLabel = ${getField('expiryDateLabel')};
  const cvvLabel = ${getField('cvvLabel')};
  const saveCardLabel = ${getField('saveCardLabel')};
  const cardNumberPlaceholder = ${getField('cardNumberPlaceholder')};
  const cardHolderPlaceholder = ${getField('cardHolderPlaceholder')};
  const expiryPlaceholder = ${getField('expiryPlaceholder')};
  const cvvPlaceholder = ${getField('cvvPlaceholder')};
  const submitButton = ${getField('submitButton')};

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const detectCardType = (number: string) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type;
    }
    return null;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted.replace(/\\s/g, '')));
  };

  const handleSubmit = () => {
    const data = {
      cardNumber: cardNumber.replace(/\\s/g, ''),
      cardHolder,
      expiry,
      cvv,
      saveCard,
      cardType
    };
    submitMutation.mutate(data);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Single Line - Card Number with Icon */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder={cardNumberPlaceholder}
            maxLength={19}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10"
          />
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {cardType && (
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
              {cardType}
            </span>
          </div>
        )}
      </div>

      {/* Name, Expiry, CVV in one row */}
      <div className="grid grid-cols-4 gap-2">
        <Input
          type="text"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
          placeholder={cardHolderPlaceholder}
          className="col-span-2 uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Input
          type="text"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          placeholder={expiryPlaceholder}
          maxLength={5}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Input
          type="text"
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={cvvPlaceholder}
          maxLength={4}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Save card and submit */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Checkbox
            id="save-card-inline"
            checked={saveCard}
            onCheckedChange={(checked) => setSaveCard(checked as boolean)}
          />
          <label htmlFor="save-card-inline" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            {saveCardLabel}
          </label>
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitButton}
        </Button>
      </div>
    </div>
  );
};

export default CreditCardFormComponent;
    `,

    modal: `
${commonImports}

interface CreditCardFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (cardData: any) => void;
}

const CreditCardFormComponent: React.FC<CreditCardFormProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  isOpen = false,
  onClose,
  onSubmit
}) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}/payments\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onSubmit) onSubmit(data);
      if (onClose) onClose();
    },
    onError: (err: any) => {
      console.error('Payment error:', err);
      setErrors({ submit: err.message || 'Payment failed' });
    },
  });

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
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cardType, setCardType] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const cardNumberLabel = ${getField('cardNumberLabel')};
  const cardHolderLabel = ${getField('cardHolderLabel')};
  const expiryDateLabel = ${getField('expiryDateLabel')};
  const cvvLabel = ${getField('cvvLabel')};
  const saveCardLabel = ${getField('saveCardLabel')};
  const cardNumberPlaceholder = ${getField('cardNumberPlaceholder')};
  const cardHolderPlaceholder = ${getField('cardHolderPlaceholder')};
  const expiryPlaceholder = ${getField('expiryPlaceholder')};
  const cvvPlaceholder = ${getField('cvvPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};
  const cardTypeMessage = ${getField('cardTypeMessage')};

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const detectCardType = (number: string) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type;
    }
    return null;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!cardNumber || cardNumber.replace(/\\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number';
    }
    if (!cardHolder || cardHolder.length < 3) {
      newErrors.cardHolder = 'Invalid name';
    }
    if (!expiry || expiry.length !== 5) {
      newErrors.expiry = 'Invalid date';
    }
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const data = {
        cardNumber: cardNumber.replace(/\\s/g, ''),
        cardHolder,
        expiry,
        cvv,
        saveCard,
        cardType
      };
      submitMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900 dark:bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-7 h-7" />
            Payment Details
          </h2>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {cardNumberLabel}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardNumber(formatted);
                    setCardType(detectCardType(formatted.replace(/\\s/g, '')));
                  }}
                  placeholder={cardNumberPlaceholder}
                  maxLength={19}
                  className={cn(
                    "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    errors.cardNumber && "border-red-500"
                  )}
                />
                {cardType && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                    {cardType}
                  </div>
                )}
              </div>
            </div>

            {/* Card Holder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {cardHolderLabel}
              </label>
              <Input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder={cardHolderPlaceholder}
                className="uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {expiryDateLabel}
                </label>
                <Input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder={expiryPlaceholder}
                  maxLength={5}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {cvvLabel}
                </label>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={cvvPlaceholder}
                  maxLength={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Save Card */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-card-modal"
                checked={saveCard}
                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
              />
              <label htmlFor="save-card-modal" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                {saveCardLabel}
              </label>
            </div>

            {/* Card Types */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {cardTypeMessage}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {cancelButton}
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {submitButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditCardFormComponent;
    `
  };

  return variants[variant] || variants.standard;
};
