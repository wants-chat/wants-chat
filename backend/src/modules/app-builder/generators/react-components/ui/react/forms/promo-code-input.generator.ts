import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePromoCodeInput = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'sidebar' = 'inline'
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
import { Button, Loader2 } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    inline: `
${commonImports}

interface PromoCodeInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onApply?: (code: string) => void;
  onRemove?: () => void;
}

const PromoCodeInputComponent: React.FC<PromoCodeInputProps> = ({
  ${dataName},
  className,
  onApply,
  onRemove
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

  const promoData = propData || fetchedData || {};

  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const promoCodeLabel = ${getField('promoCodeLabel')};
  const promoCodePlaceholder = ${getField('promoCodePlaceholder')};
  const applyButton = ${getField('applyButton')};
  const removeButton = ${getField('removeButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const validCodes = ${getField('validCodes')};

  // Event handlers
  const handleApply = () => {
    console.log('Apply promo code:', code);

    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    // Simulate validation (in real app, this would be an API call)
    if (validCodes.includes(code.toUpperCase())) {
      setAppliedCode(code.toUpperCase());
      setError(null);

      // Calculate discount based on code
      const discountValue = code.includes('10') ? 10 : code.includes('20') ? 20 : code.includes('25') ? 25 : 15;
      setDiscount(discountValue);

      if (onApply) {
        onApply(code.toUpperCase());
      }
      alert(\`\${successMessage}\\n\${discountValue}% discount applied!\`);
    } else {
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleRemove = () => {
    console.log('Remove promo code:', appliedCode);
    setAppliedCode(null);
    setCode('');
    setError(null);
    setDiscount(0);
    if (onRemove) {
      onRemove();
    }
    alert('Promo code removed');
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Tag className="w-4 h-4 inline mr-2" />
        {promoCodeLabel}
      </label>

      {appliedCode ? (
        // Applied State
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-md">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {appliedCode} applied
            </p>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                {discount}% discount
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 rounded-full text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Input State
        <>
          <div className="flex gap-2">
            <Input
              placeholder={promoCodePlaceholder}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              className={cn(
                "flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border-2 transition-all duration-300",
                error ? "border-red-500 dark:border-red-500" : "focus:border-blue-400 dark:focus:border-purple-500"
              )}
            />
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={handleApply}
            >
              {applyButton}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromoCodeInputComponent;
    `,

    modal: `
${commonImports}

interface PromoCodeInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onApply?: (code: string, discount: number) => void;
}

const PromoCodeInputComponent: React.FC<PromoCodeInputProps> = ({
  ${dataName},
  className,
  isOpen = false,
  onClose,
  onApply
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

  const promoData = propData || fetchedData || {};

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const promoCodeLabel = ${getField('promoCodeLabel')};
  const promoCodePlaceholder = ${getField('promoCodePlaceholder')};
  const promoCodeDescription = ${getField('promoCodeDescription')};
  const verifyButton = ${getField('verifyButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const validCodes = ${getField('validCodes')};

  // Event handlers
  const handleApply = async () => {
    console.log('Verify promo code:', code);

    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setValidating(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      if (validCodes.includes(code.toUpperCase())) {
        const discountValue = code.includes('10') ? 10 : code.includes('20') ? 20 : code.includes('25') ? 25 : 15;

        if (onApply) {
          onApply(code.toUpperCase(), discountValue);
        }

        alert(\`\${successMessage}\\n\${discountValue}% discount applied!\`);

        if (onClose) {
          onClose();
        }
      } else {
        setError(errorMessage);
      }
      setValidating(false);
    }, 800);
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
          className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-gray-200 dark:border-gray-700", className)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">
                {promoCodeLabel}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {promoCodeDescription}
          </p>

          {/* Input */}
          <div className="space-y-4">
            <Input
              placeholder={promoCodePlaceholder}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              className={cn(
                "text-center text-lg font-bold tracking-wider dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2 transition-all duration-300",
                error ? "border-red-500 dark:border-red-500" : "focus:border-blue-400 dark:focus:border-purple-500"
              )}
              disabled={validating}
            />

            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Sample Codes (for demo) */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Try these codes:</p>
              </div>
              <p className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{validCodes.join(' • ')}</p>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleApply}
              disabled={validating}
            >
              {validating ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Verifying...
                </div>
              ) : (
                verifyButton
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoCodeInputComponent;
    `,

    sidebar: `
${commonImports}

interface AppliedCode {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

interface PromoCodeInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onApply?: (code: string) => void;
  onRemove?: () => void;
}

const PromoCodeInputComponent: React.FC<PromoCodeInputProps> = ({
  ${dataName},
  className,
  onApply,
  onRemove
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

  const promoData = propData || fetchedData || {};

  const [code, setCode] = useState('');
  const [appliedCodes, setAppliedCodes] = useState<AppliedCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const promoCodeLabel = ${getField('promoCodeLabel')};
  const promoCodePlaceholder = ${getField('promoCodePlaceholder')};
  const applyButton = ${getField('applyButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const discountMessage = ${getField('discountMessage')};
  const validCodes = ${getField('validCodes')};

  // Event handlers
  const handleApply = () => {
    console.log('Apply promo code:', code);

    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    // Check if already applied
    if (appliedCodes.some(c => c.code === code.toUpperCase())) {
      setError('This code is already applied');
      return;
    }

    // Validate code
    if (validCodes.includes(code.toUpperCase())) {
      const discountValue = code.includes('10') ? 10 : code.includes('20') ? 20 : code.includes('25') ? 25 : 15;
      const discountType = code.includes('FREESHIP') ? 'fixed' : 'percentage';

      const newCode: AppliedCode = {
        code: code.toUpperCase(),
        discount: discountValue,
        discountType
      };

      setAppliedCodes([...appliedCodes, newCode]);
      setCode('');
      setError(null);
      setShowInput(false);

      if (onApply) {
        onApply(code.toUpperCase());
      }

      alert(\`\${successMessage}\\n\${discountValue}\${discountType === 'percentage' ? '%' : '$'} discount applied!\`);
    } else {
      setError(errorMessage);
    }
  };

  const handleRemove = (codeToRemove: string) => {
    console.log('Remove promo code:', codeToRemove);
    setAppliedCodes(appliedCodes.filter(c => c.code !== codeToRemove));
    if (onRemove) {
      onRemove();
    }
    alert(\`\${codeToRemove} removed\`);
  };

  const totalDiscount = appliedCodes.reduce((sum, code) => sum + code.discount, 0);

  return (
    <div className={cn("bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
            <Tag className="w-5 h-5 text-white" />
          </div>
          {promoCodeLabel}
        </h3>
        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            + Add Code
          </button>
        )}
      </div>

      {/* Applied Codes */}
      {appliedCodes.length > 0 && (
        <div className="space-y-2 mb-4">
          {appliedCodes.map((appliedCode) => (
            <div
              key={appliedCode.code}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {appliedCode.code}
                  </p>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">
                      -{appliedCode.discount}{appliedCode.discountType === 'percentage' ? '%' : '$'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(appliedCode.code)}
                className="p-1.5 rounded-full text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {appliedCodes.length > 0 && (
            <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{discountMessage}:</span>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {totalDiscount}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      {showInput && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder={promoCodePlaceholder}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              className={cn(
                "flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border-2 transition-all duration-300",
                error ? "border-red-500 dark:border-red-500" : "focus:border-blue-400 dark:focus:border-purple-500"
              )}
            />
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleApply}
            >
              {applyButton}
            </Button>
            <button
              onClick={() => {
                setShowInput(false);
                setCode('');
                setError(null);
              }}
              className="p-2 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Sample Codes */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Try: </span>
              <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{validCodes.join(' • ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {appliedCodes.length === 0 && !showInput && (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
            <Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No promo codes applied
          </p>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setShowInput(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Add Promo Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInputComponent;
    `
  };

  return variants[variant] || variants.inline;
};
