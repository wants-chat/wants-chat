import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePaymentMethod = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'list' | 'savedMethods' = 'cards'
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

  const variants = {
    cards: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PaymentMethodProps {
  ${dataName}?: any;
  payments?: any;
  className?: string;
  onSaveCard?: (cardData: any) => void;
  onContinue?: (cardData: any) => void;
  onSelectPaymentMethod?: (method: any) => void;
  onPaymentMethodSelect?: (methodId: string) => void;
  onSubmit?: (data: any) => void;
  orderId?: string;
  onAddPaymentMethod?: (payload: any) => void;
  onDeletePaymentMethod?: (methodId: string) => void;
}

export default function PaymentMethod({ ${dataName}: initialData, className, onSaveCard, onContinue, onSelectPaymentMethod, onPaymentMethodSelect, onSubmit, orderId, onAddPaymentMethod }: PaymentMethodProps) {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  // Mutation for saving payment method
  const savePaymentMethodMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/payment-methods', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method saved successfully!');
      if (onSaveCard) onSaveCard(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save payment method');
    },
  });

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const paymentData = ${dataName} || {};

  const [cardNumber, setCardNumber] = useState(${getField('cardNumber')});
  const [cardholderName, setCardholderName] = useState(${getField('cardholderName')});
  const [expiryMonth, setExpiryMonth] = useState(${getField('expiryMonth')});
  const [expiryYear, setExpiryYear] = useState(${getField('expiryYear')});
  const [cvv, setCvv] = useState(${getField('cvv')});
  const [saveCard, setSaveCard] = useState(false);

  const paymentMethodTitle = ${getField('paymentMethodTitle')};
  const continueButton = ${getField('continueButton')};

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Detect card type
  const getCardType = () => {
    const firstDigit = cardNumber.replace(/\\s/g, '')[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Card';
  };

  // Event handlers
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\\s/g, '');
    if (cleaned.length <= 16 && /^\\d*$/.test(cleaned)) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleContinue = () => {
    const cardData = {
      cardNumber: cardNumber.replace(/\\s/g, ''),
      cardholderName,
      expiryMonth,
      expiryYear,
      cvv,
      saveCard
    };
    console.log('Continuing with payment:', cardData);

    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
      toast.error('Please fill in all card details');
      return;
    }

    // Use mutation to save payment method if saveCard is true
    if (saveCard) {
      savePaymentMethodMutation.mutate({
        card_number: cardNumber.replace(/\\s/g, ''),
        cardholder_name: cardholderName,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        card_type: getCardType(),
        last_four: cardNumber.slice(-4)
      }, {
        onSuccess: () => {
          if (onContinue) {
            onContinue(cardData);
          }
        }
      });
    } else {
      if (onContinue) {
        onContinue(cardData);
      } else {
        toast.success(\`Payment method ready!\\n\\nCard: \${getCardType()} ending in \${cardNumber.slice(-4)}\`);
      }
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="dark:bg-gray-800 border-gray-200/50 dark:border-gray-700 rounded-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            {paymentMethodTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Card Preview */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6 shadow-2xl transform hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-8 bg-yellow-400 rounded"></div>
                <span className="text-sm opacity-80">{getCardType()}</span>
              </div>
              <div className="mb-4">
                <div className="text-lg tracking-wider">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70 mb-1">Cardholder</div>
                  <div className="text-sm">{cardholderName || 'YOUR NAME'}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">Expires</div>
                  <div className="text-sm">{expiryMonth && expiryYear ? \`\${expiryMonth}/\${expiryYear}\` : 'MM/YY'}</div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month *</Label>
                <Input
                  id="expiryMonth"
                  value={expiryMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\\d{0,2}$/.test(val) && (val === '' || parseInt(val) <= 12)) {
                      setExpiryMonth(val);
                    }
                  }}
                  placeholder="MM"
                  maxLength={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Year *</Label>
                <Input
                  id="expiryYear"
                  value={expiryYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\\d{0,4}$/.test(val)) {
                      setExpiryYear(val);
                    }
                  }}
                  placeholder="YYYY"
                  maxLength={4}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\\d{0,4}$/.test(val)) {
                      setCvv(val);
                    }
                  }}
                  placeholder="123"
                  maxLength={4}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="saveCard"
                checked={saveCard}
                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
              />
              <Label htmlFor="saveCard" className="cursor-pointer">
                Save card for future purchases
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={savePaymentMethodMutation.isPending}
            >
              {savePaymentMethodMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                continueButton
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    `,

    list: `
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Smartphone, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodProps {
  ${dataName}?: any;
  payments?: any;
  className?: string;
  onSelectMethod?: (methodId: string) => void;
  onContinue?: (methodId: string) => void;
  onSelectPaymentMethod?: (method: any) => void;
  orderId?: string;
  onAddPaymentMethod?: (payload: any) => void;
  onDeletePaymentMethod?: (methodId: string) => void;
}

export default function PaymentMethod({ ${dataName}, className, onSelectMethod, onContinue, onSelectPaymentMethod, orderId, onAddPaymentMethod }: PaymentMethodProps) {
  const paymentData = ${dataName} || {};

  const paymentOptions = ${getField('paymentOptions')};
  const [selectedMethod, setSelectedMethod] = useState(paymentOptions[0]?.id);

  const selectPaymentTitle = ${getField('selectPaymentTitle')};
  const continueButton = ${getField('continueButton')};

  const iconMap: any = {
    CreditCard: CreditCard,
    Wallet: Wallet,
    Smartphone: Smartphone,
    Building: Building
  };

  // Event handlers
  const handleSelectMethod = (methodId: string) => {
    console.log('Payment method selected:', methodId);
    setSelectedMethod(methodId);
    const method = paymentOptions.find((opt: any) => opt.id === methodId);
    if (onSelectMethod) {
      onSelectMethod(methodId);
    }
    if (onSelectPaymentMethod && method) {
      onSelectPaymentMethod(method);
    }
  };

  const handleContinue = () => {
    const method = paymentOptions.find((opt: any) => opt.id === selectedMethod);
    console.log('Continue with payment method:', method);
    if (onContinue) {
      onContinue(selectedMethod);
    } else {
      alert(\`Proceeding with:\\n\\n\${method.name}\\n\${method.description}\`);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">{selectPaymentTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={handleSelectMethod}>
            <div className="space-y-3">
              {paymentOptions.map((option: any) => {
                const Icon = iconMap[option.icon] || CreditCard;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all",
                      selectedMethod === option.id
                        ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    onClick={() => handleSelectMethod(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex items-start gap-3 ml-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="cursor-pointer font-bold text-gray-900 dark:text-white">
                          {option.name}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <Button
            onClick={handleContinue}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          >
            {continueButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    `,

    savedMethods: `
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodProps {
  ${dataName}?: any;
  payments?: any;
  className?: string;
  onSelectMethod?: (method: any) => void;
  onAddNew?: () => void;
  onEdit?: (method: any) => void;
  onDelete?: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
  onContinue?: (method: any) => void;
  onSelectPaymentMethod?: (method: any) => void;
  orderId?: string;
  onAddPaymentMethod?: (payload: any) => void;
  onDeletePaymentMethod?: (methodId: string) => void;
}

export default function PaymentMethod({ ${dataName}, className, onSelectMethod, onAddNew, onEdit, onDelete, onSetDefault, onContinue, onSelectPaymentMethod, orderId, onAddPaymentMethod }: PaymentMethodProps) {
  const paymentData = ${dataName} || {};

  const savedMethods = ${getField('savedMethods')};
  const [selectedMethodId, setSelectedMethodId] = useState(savedMethods[0]?.id);

  const savedCardsTitle = ${getField('savedCardsTitle')};
  const addCardButton = ${getField('addCardButton')};
  const continueButton = ${getField('continueButton')};
  const editButton = ${getField('editButton')};
  const deleteButton = ${getField('deleteButton')};
  const setDefaultButton = ${getField('setDefaultButton')};

  // Get card icon based on type
  const getCardIcon = (type: string) => {
    const colors: any = {
      'Visa': 'bg-blue-600',
      'Mastercard': 'bg-orange-600',
      'American Express': 'bg-green-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  // Event handlers
  const handleSelectMethod = (method: any) => {
    console.log('Payment method selected:', method);
    setSelectedMethodId(method.id);
    if (onSelectMethod) {
      onSelectMethod(method);
    }
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(method);
    }
  };

  const handleAddNew = () => {
    console.log('Add new card clicked');
    if (onAddNew) {
      onAddNew();
    } else if (onAddPaymentMethod) {
      onAddPaymentMethod({ orderId });
    } else {
      alert('Opening form to add new payment method...');
    }
  };

  const handleEdit = (method: any) => {
    console.log('Edit method:', method);
    if (onEdit) {
      onEdit(method);
    } else {
      alert(\`Edit card ending in \${method.last4}\`);
    }
  };

  const handleDelete = (methodId: string) => {
    console.log('Delete method:', methodId);
    if (onDelete) {
      onDelete(methodId);
    } else {
      alert('Delete this payment method?\\n\\nThis action cannot be undone.');
    }
  };

  const handleSetDefault = (methodId: string) => {
    console.log('Set default method:', methodId);
    if (onSetDefault) {
      onSetDefault(methodId);
    } else {
      alert('This card is now set as default');
    }
  };

  const handleContinue = () => {
    const selectedMethod = savedMethods.find((m: any) => m.id === selectedMethodId);
    console.log('Continue with method:', selectedMethod);
    if (onContinue) {
      onContinue(selectedMethod);
    } else {
      alert(\`Proceeding with payment:\\n\\n\${selectedMethod.type} ending in \${selectedMethod.last4}\\nExpiry: \${selectedMethod.expiry}\`);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              {savedCardsTitle}
            </CardTitle>
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addCardButton}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {savedMethods.map((method: any) => (
              <div
                key={method.id}
                className={cn(
                  "relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                  selectedMethodId === method.id
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => handleSelectMethod(method)}
              >
                {/* Card Icon */}
                <div className={\`w-12 h-8 \${getCardIcon(method.type)} rounded flex items-center justify-center text-white text-xs font-bold mr-4\`}>
                  {method.type.slice(0, 4)}
                </div>

                {/* Card Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {method.type} •••• {method.last4}
                    </p>
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expires {method.expiry}</p>
                </div>

                {/* Selection Indicator */}
                {selectedMethodId === method.id && (
                  <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(method);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {!method.isDefault && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(method.id);
                        }}
                      >
                        {setDefaultButton}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(method.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {continueButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.cards;
};
