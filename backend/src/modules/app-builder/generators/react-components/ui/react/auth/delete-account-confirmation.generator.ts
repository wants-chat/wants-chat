import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDeleteAccountConfirmation = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'page' | 'secure' = 'modal'
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
    return `/${dataSource || 'auth'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'auth';

  const variants = {
    modal: `
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteAccountConfirmationProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: (data: any) => void;
}

export default function DeleteAccountConfirmation({ ${dataName}, className, isOpen = true, onClose, onConfirm }: DeleteAccountConfirmationProps) {
  const sourceData = ${dataName} || {};

  const [formData, setFormData] = useState({
    reason: '',
    reasonDetail: '',
    password: '',
    exportData: false,
    finalConfirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const title = ${getField('title')};
  const warningTitle = ${getField('warningTitle')};
  const warningMessage = ${getField('warningMessage')};
  const reasonOptions = ${getField('reasonOptions')};
  const reasonLabel = ${getField('reasonLabel')};
  const reasonPlaceholder = ${getField('reasonPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const exportDataLabel = ${getField('exportDataLabel')};
  const finalConfirmLabel = ${getField('finalConfirmLabel')};
  const deleteButton = ${getField('deleteButton')};
  const cancelButton = ${getField('cancelButton')};
  const validation = ${getField('validation')};

  // Mutation for account deletion
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/delete-account', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      if (onConfirm) {
        onConfirm(data);
      }
      if (onClose) {
        onClose();
      }
    },
    onError: (error: any) => {
      setErrors({ password: error?.message || 'Account deletion failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = validation.passwordRequired;
    }

    if (!formData.finalConfirm) {
      newErrors.finalConfirm = validation.confirmationRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate(formData);
  };

  const isDeleting = submitMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Warning */}
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium bg-gradient-to-r from-red-900 to-red-700 dark:from-red-300 dark:to-red-100 bg-clip-text text-transparent mb-1">{warningTitle}</h4>
              <p className="text-sm text-red-800 dark:text-red-400">{warningMessage}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{reasonLabel}</Label>
            <Select value={formData.reason} onValueChange={(value) => handleChange('reason', value)}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                {reasonOptions.map((option: any) => (
                  <SelectItem key={option.value} value={option.value} className="dark:text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Detail */}
          {formData.reason === 'other' && (
            <div>
              <Textarea
                value={formData.reasonDetail}
                onChange={(e) => handleChange('reasonDetail', e.target.value)}
                placeholder={reasonPlaceholder}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
            </div>
          )}

          {/* Export Data */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="exportData"
              checked={formData.exportData}
              onCheckedChange={(checked) => handleChange('exportData', checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="exportData" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              {exportDataLabel}
            </Label>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {passwordLabel}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={passwordPlaceholder}
              className={cn(
                "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.password && "border-red-500 dark:border-red-500"
              )}
            />
            {errors.password && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Final Confirmation */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Checkbox
              id="finalConfirm"
              checked={formData.finalConfirm}
              onCheckedChange={(checked) => handleChange('finalConfirm', checked)}
              className={cn(
                "mt-1 dark:border-gray-600",
                errors.finalConfirm && "border-red-500"
              )}
            />
            <Label htmlFor="finalConfirm" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
              {finalConfirmLabel}
            </Label>
          </div>
          {errors.finalConfirm && (
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.finalConfirm}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="destructive"
              className="flex-1 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isDeleting || !formData.finalConfirm}
            >
              {isDeleting ? 'Deleting...' : deleteButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 dark:border-gray-600 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isDeleting}
            >
              {cancelButton}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
    `,

    page: `
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2, AlertCircle, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteAccountConfirmationProps {
  ${dataName}?: any;
  className?: string;
  onConfirm?: (data: any) => void;
  onCancel?: () => void;
}

export default function DeleteAccountConfirmation({ ${dataName}, className, onConfirm, onCancel }: DeleteAccountConfirmationProps) {
  const sourceData = ${dataName} || {};

  const [formData, setFormData] = useState({
    reason: '',
    reasonDetail: '',
    password: '',
    exportData: false,
    finalConfirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const title = ${getField('title')};
  const confirmationTitle = ${getField('confirmationTitle')};
  const warningTitle = ${getField('warningTitle')};
  const warningMessage = ${getField('warningMessage')};
  const reasonOptions = ${getField('reasonOptions')};
  const reasonLabel = ${getField('reasonLabel')};
  const reasonPlaceholder = ${getField('reasonPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const exportDataLabel = ${getField('exportDataLabel')};
  const finalConfirmLabel = ${getField('finalConfirmLabel')};
  const deleteButton = ${getField('deleteButton')};
  const cancelButton = ${getField('cancelButton')};
  const backButton = ${getField('backButton')};
  const validation = ${getField('validation')};
  const exportInfo = ${getField('exportInfo')};

  // Mutation for account deletion
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/delete-account', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      if (onConfirm) {
        onConfirm(data);
      }
    },
    onError: (error: any) => {
      setErrors({ password: error?.message || 'Account deletion failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = validation.passwordRequired;
    }

    if (!formData.finalConfirm) {
      newErrors.finalConfirm = validation.confirmationRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const isDeleting = submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-3xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backButton}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            {title}
          </h1>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">{warningTitle}</h2>
              <p className="text-red-800 dark:text-red-400 leading-relaxed">{warningMessage}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Confirmation Question */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{confirmationTitle}</h3>

              {/* Reason */}
              <div className="mb-4">
                <Label className="text-gray-700 dark:text-gray-300 mb-2 block">{reasonLabel}</Label>
                <Select value={formData.reason} onValueChange={(value) => handleChange('reason', value)}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {reasonOptions.map((option: any) => (
                      <SelectItem key={option.value} value={option.value} className="dark:text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason Detail */}
              {formData.reason === 'other' && (
                <div className="mb-4">
                  <Textarea
                    value={formData.reasonDetail}
                    onChange={(e) => handleChange('reasonDetail', e.target.value)}
                    placeholder={reasonPlaceholder}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download Your Data</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{exportInfo}</p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="exportData"
                      checked={formData.exportData}
                      onCheckedChange={(checked) => handleChange('exportData', checked)}
                      className="dark:border-gray-600"
                    />
                    <Label htmlFor="exportData" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                      {exportDataLabel}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Confirmation */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 border-2 border-red-200 dark:border-red-900">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Final Confirmation</h3>

              {/* Password */}
              <div className="mb-6">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 mb-2 block">
                  {passwordLabel}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={passwordPlaceholder}
                  className={cn(
                    "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    errors.password && "border-red-500 dark:border-red-500"
                  )}
                />
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Final Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Checkbox
                  id="finalConfirm"
                  checked={formData.finalConfirm}
                  onCheckedChange={(checked) => handleChange('finalConfirm', checked)}
                  className={cn(
                    "mt-1 dark:border-gray-600",
                    errors.finalConfirm && "border-red-500"
                  )}
                />
                <Label htmlFor="finalConfirm" className="text-gray-800 dark:text-gray-200 cursor-pointer leading-relaxed">
                  {finalConfirmLabel}
                </Label>
              </div>
              {errors.finalConfirm && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.finalConfirm}</p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={isDeleting || !formData.finalConfirm}
            >
              {isDeleting ? 'Deleting Account...' : deleteButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
              disabled={isDeleting}
            >
              {cancelButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
    `,

    secure: `
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2, AlertCircle, Shield, Download, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteAccountConfirmationProps {
  ${dataName}?: any;
  className?: string;
  onConfirm?: (data: any) => void;
  onCancel?: () => void;
}

export default function DeleteAccountConfirmation({ ${dataName}, className, onConfirm, onCancel }: DeleteAccountConfirmationProps) {
  const sourceData = ${dataName} || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    reason: '',
    reasonDetail: '',
    password: '',
    exportData: false,
    finalConfirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const title = ${getField('title')};
  const confirmationTitle = ${getField('confirmationTitle')};
  const warningTitle = ${getField('warningTitle')};
  const warningMessage = ${getField('warningMessage')};
  const reasonOptions = ${getField('reasonOptions')};
  const reasonLabel = ${getField('reasonLabel')};
  const reasonPlaceholder = ${getField('reasonPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const exportDataLabel = ${getField('exportDataLabel')};
  const finalConfirmLabel = ${getField('finalConfirmLabel')};
  const deleteButton = ${getField('deleteButton')};
  const cancelButton = ${getField('cancelButton')};
  const validation = ${getField('validation')};
  const exportInfo = ${getField('exportInfo')};
  const steps = ${getField('steps')};

  // Mutation for account deletion
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/delete-account', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      if (onConfirm) {
        onConfirm(data);
      }
    },
    onError: (error: any) => {
      setErrors({ password: error?.message || 'Account deletion failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = validation.passwordRequired;
      }

      if (!formData.finalConfirm) {
        newErrors.finalConfirm = validation.confirmationRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    submitMutation.mutate(formData);
  };

  const isDeleting = submitMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Security Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            For your security, we require multiple confirmations before proceeding with account deletion.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step: string, index: number) => {
              const stepNum = index + 1;
              const isComplete = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;

              return (
                <div key={stepNum} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium mb-2 transition-colors",
                      isComplete && "bg-green-600 text-white",
                      isCurrent && "bg-blue-600 text-white",
                      !isComplete && !isCurrent && "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}>
                      {isComplete ? <Check className="w-5 h-5" /> : stepNum}
                    </div>
                    <span className={cn(
                      "text-sm text-center",
                      isCurrent ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400"
                    )}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-4 rounded",
                      stepNum < currentStep ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">{warningTitle}</h2>
              <p className="text-red-800 dark:text-red-400 leading-relaxed">{warningMessage}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Reason */}
          {currentStep === 1 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{reasonLabel}</h3>

                <div className="space-y-4">
                  <Select value={formData.reason} onValueChange={(value) => handleChange('reason', value)}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {reasonOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value} className="dark:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.reason === 'other' && (
                    <Textarea
                      value={formData.reasonDetail}
                      onChange={(e) => handleChange('reasonDetail', e.target.value)}
                      placeholder={reasonPlaceholder}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={4}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Data Export */}
          {currentStep === 2 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download Your Data</h3>
                    <p className="text-gray-600 dark:text-gray-400">{exportInfo}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="exportData"
                      checked={formData.exportData}
                      onCheckedChange={(checked) => handleChange('exportData', checked)}
                      className="dark:border-gray-600"
                    />
                    <Label htmlFor="exportData" className="text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                      {exportDataLabel}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Final Confirmation */}
          {currentStep === 3 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700 border-2 border-red-200 dark:border-red-900 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{confirmationTitle}</h3>

                <div className="space-y-6">
                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 mb-2 block">
                      {passwordLabel}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={passwordPlaceholder}
                      className={cn(
                        "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                        errors.password && "border-red-500 dark:border-red-500"
                      )}
                    />
                    {errors.password && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Final Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Checkbox
                      id="finalConfirm"
                      checked={formData.finalConfirm}
                      onCheckedChange={(checked) => handleChange('finalConfirm', checked)}
                      className={cn(
                        "mt-1 dark:border-gray-600",
                        errors.finalConfirm && "border-red-500"
                      )}
                    />
                    <Label htmlFor="finalConfirm" className="text-gray-800 dark:text-gray-200 cursor-pointer leading-relaxed">
                      {finalConfirmLabel}
                    </Label>
                  </div>
                  {errors.finalConfirm && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{errors.finalConfirm}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="dark:border-gray-600 dark:text-gray-300"
                disabled={isDeleting}
              >
                Back
              </Button>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="dark:border-gray-600 dark:text-gray-300"
              disabled={isDeleting}
            >
              {cancelButton}
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeleting || !formData.finalConfirm}
              >
                {isDeleting ? 'Deleting Account...' : deleteButton}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.modal;
};
