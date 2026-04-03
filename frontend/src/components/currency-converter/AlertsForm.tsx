import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { AlertType, AlertFrequency, CurrencyAlertFormData, CurrencyAlert } from '../../types/currency-converter/currencyAlert';
import { Bell, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { useCreateAlert } from '../../hooks/currency/useCurrencyAlerts';
import { toast } from 'sonner';

interface Currency {
  code: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
];

interface AlertsFormProps {
  initialData?: CurrencyAlert;
  onSubmit?: (data: CurrencyAlertFormData & { is_active?: boolean }) => Promise<void>;
  onSuccess?: () => void;
  isUpdating?: boolean;
  mode?: 'create' | 'edit';
}

const AlertsForm: React.FC<AlertsFormProps> = ({
  initialData,
  onSubmit,
  onSuccess,
  isUpdating = false,
  mode = 'create'
}) => {
  const { createAlert, loading: isCreating } = useCreateAlert();
  // Using Sonner toast directly
  
  const [formData, setFormData] = useState<CurrencyAlertFormData>({
    name: initialData?.name || '',
    base_currency: initialData?.base_currency || 'USD',
    target_currency: initialData?.target_currency || 'EUR',
    alert_type: initialData?.alert_type || 'above',
    threshold: initialData?.threshold || 0,
    frequency: initialData?.frequency || 'daily',
    email_notification: initialData?.email_notification ?? true,
    push_notification: initialData?.push_notification ?? false,
  });

  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        base_currency: initialData.base_currency,
        target_currency: initialData.target_currency,
        alert_type: initialData.alert_type,
        threshold: initialData.threshold,
        frequency: initialData.frequency,
        email_notification: initialData.email_notification,
        push_notification: initialData.push_notification,
      });
      setIsActive(initialData.is_active);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate threshold
    if (formData.threshold <= 0) {
      toast.error('Please enter a valid threshold value');
      return;
    }

    // Validate name
    if (!formData.name.trim()) {
      toast.error('Please enter an alert name');
      return;
    }

    // Submit to API or use provided onSubmit
    try {
      if (mode === 'edit' && onSubmit) {
        // Edit mode - use provided onSubmit
        await onSubmit({
          ...formData,
          is_active: isActive,
        });
      } else {
        // Create mode - use createAlert hook
        const result = await createAlert({
          ...formData,
          is_active: isActive,
        });

        if (result) {
          console.log('AlertsForm: Alert created successfully, result:', result);
          toast.success(`Alert "${formData.name}" has been created successfully.`);

          // Reset form
          setFormData({
            name: '',
            base_currency: 'USD',
            target_currency: 'EUR',
            alert_type: 'above',
            threshold: 0,
            frequency: 'daily',
            email_notification: true,
            push_notification: false,
          });
          setIsActive(true);

          // Call onSuccess callback to refresh list
          console.log('AlertsForm: Calling onSuccess callback, exists:', !!onSuccess);
          if (onSuccess) {
            onSuccess();
            console.log('AlertsForm: onSuccess callback called');
          }
        } else {
          console.log('AlertsForm: Alert creation failed, result was null');
          toast.error('Failed to create alert. Please try again.');
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} alert:`, error);
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  const updateFormData = (field: keyof CurrencyAlertFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      <div className="p-6 border-b border-white/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-teal-400" />
          {mode === 'edit' ? 'Edit Exchange Rate Alert' : 'Create Exchange Rate Alert'}
        </h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Name */}
          <div className="space-y-2">
            <Label htmlFor="alert-name" className="text-white">Alert Name *</Label>
            <Input
              id="alert-name"
              type="text"
              placeholder="e.g., USD to EUR Daily Alert"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/60">
              Give your alert a descriptive name to identify it easily
            </p>
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-currency" className="text-white">Base Currency</Label>
              <Select
                value={formData.base_currency}
                onValueChange={(value) => updateFormData('base_currency', value)}
              >
                <SelectTrigger id="base-currency" className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10">
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-currency" className="text-white">Target Currency</Label>
              <Select
                value={formData.target_currency}
                onValueChange={(value) => updateFormData('target_currency', value)}
              >
                <SelectTrigger id="target-currency" className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10">
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alert Type */}
          <div className="space-y-3">
            <Label className="text-white">Alert Type</Label>
            <RadioGroup
              value={formData.alert_type}
              onValueChange={(value) => updateFormData('alert_type', value as AlertType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" className="border-white/40" />
                <Label htmlFor="above" className="flex items-center gap-2 cursor-pointer text-white">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Alert when rate goes above threshold
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" className="border-white/40" />
                <Label htmlFor="below" className="flex items-center gap-2 cursor-pointer text-white">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Alert when rate goes below threshold
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="change" id="change" className="border-white/40" />
                <Label htmlFor="change" className="flex items-center gap-2 cursor-pointer text-white">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Alert on any significant change (%)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold" className="text-white">
              Threshold Value *
              {formData.alert_type === 'change' ? ' (%)' : ` (${formData.target_currency})`}
            </Label>
            <Input
              id="threshold"
              type="number"
              step="0.0001"
              placeholder={formData.alert_type === 'change' ? "e.g., 2.5" : "e.g., 0.85"}
              value={formData.threshold || ''}
              onChange={(e) => updateFormData('threshold', parseFloat(e.target.value) || 0)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/60">
              {formData.alert_type === 'above' && 'You will be notified when the exchange rate rises above this value'}
              {formData.alert_type === 'below' && 'You will be notified when the exchange rate falls below this value'}
              {formData.alert_type === 'change' && 'You will be notified when the rate changes by this percentage'}
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-white">Alert Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => updateFormData('frequency', value as AlertFrequency)}
            >
              <SelectTrigger id="frequency" className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border-teal-400/30">
                <SelectItem value="once" className="text-white hover:bg-white/10">Once (Alert only once when condition is met)</SelectItem>
                <SelectItem value="daily" className="text-white hover:bg-white/10">Daily (Check and alert daily)</SelectItem>
                <SelectItem value="weekly" className="text-white hover:bg-white/10">Weekly (Check and alert weekly)</SelectItem>
                <SelectItem value="monthly" className="text-white hover:bg-white/10">Monthly (Check and alert monthly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <Label className="text-white">Notification Preferences</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notification" className="text-sm font-medium text-white">
                  Email Notifications
                </Label>
                <p className="text-xs text-white/60">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                id="email-notification"
                checked={formData.email_notification}
                onCheckedChange={(checked) => updateFormData('email_notification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notification" className="text-sm font-medium text-white">
                  Push Notifications
                </Label>
                <p className="text-xs text-white/60">
                  Receive alerts as push notifications
                </p>
              </div>
              <Switch
                id="push-notification"
                checked={formData.push_notification}
                onCheckedChange={(checked) => updateFormData('push_notification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active" className="text-sm font-medium text-white">
                  Alert Active
                </Label>
                <p className="text-xs text-white/60">
                  Enable or disable this alert
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <p className="text-xs text-white/60">
              By creating this alert, you agree to our Terms of Service and Privacy Policy.
              Alert notifications are subject to market data availability and may have slight delays.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            disabled={(!formData.email_notification && !formData.push_notification) || isCreating || isUpdating}
          >
            {(isCreating || isUpdating) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating Alert...' : 'Creating Alert...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Alert' : 'Create Alert'
            )}
          </Button>

          {!formData.email_notification && !formData.push_notification && (
            <p className="text-xs text-red-400 text-center">
              Please enable at least one notification method
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AlertsForm;