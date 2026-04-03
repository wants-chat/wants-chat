import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePasswordChangeForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'secure' = 'inline'
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
    inline: `
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordChangeFormProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function PasswordChangeForm({ ${dataName}, className, onSubmit, onCancel }: PasswordChangeFormProps) {
  const sourceData = ${dataName} || {};

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPasswordLabel = ${getField('currentPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const currentPasswordPlaceholder = ${getField('currentPasswordPlaceholder')};
  const newPasswordPlaceholder = ${getField('newPasswordPlaceholder')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const changePasswordButton = ${getField('changePasswordButton')};
  const cancelButton = ${getField('cancelButton')};
  const showPasswordButton = ${getField('showPasswordButton')};
  const hidePasswordButton = ${getField('hidePasswordButton')};
  const successMessage = ${getField('successMessage')};
  const validation = ${getField('validation')};
  const strengthLabels = ${getField('strengthLabels')};
  const passwordStrengthTitle = ${getField('passwordStrengthTitle')};

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 25) return strengthLabels.weak;
    if (strength < 50) return strengthLabels.fair;
    if (strength < 75) return strengthLabels.good;
    return strengthLabels.strong;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = validation.currentPasswordRequired;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = validation.newPasswordRequired;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = validation.passwordTooShort;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = validation.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = validation.passwordsNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for password change
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/change-password', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onSubmit) {
        onSubmit(data);
      }
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      setErrors({ currentPassword: error?.message || 'Password change failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleCancel = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    if (onCancel) onCancel();
  };

  const isSubmitting = submitMutation.isPending;

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6", className)}>
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-300">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
            {currentPasswordLabel}
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder={currentPasswordPlaceholder}
              className={cn(
                "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.currentPassword && "border-red-500 dark:border-red-500"
              )}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.currentPassword}</span>
            </div>
          )}
        </div>

        {/* New Password */}
        <div>
          <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
            {newPasswordLabel}
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder={newPasswordPlaceholder}
              className={cn(
                "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.newPassword && "border-red-500 dark:border-red-500"
              )}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.newPassword}</span>
            </div>
          )}

          {/* Password Strength */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{passwordStrengthTitle}</span>
                <span className={cn(
                  "font-medium",
                  passwordStrength < 25 && "text-red-600 dark:text-red-400",
                  passwordStrength >= 25 && passwordStrength < 50 && "text-orange-600 dark:text-orange-400",
                  passwordStrength >= 50 && passwordStrength < 75 && "text-yellow-600 dark:text-yellow-400",
                  passwordStrength >= 75 && "text-green-600 dark:text-green-400"
                )}>
                  {getStrengthLabel(passwordStrength)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full transition-all", getStrengthColor(passwordStrength))}
                  style={{ width: \`\${passwordStrength}%\` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
            {confirmPasswordLabel}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder={confirmPasswordPlaceholder}
              className={cn(
                "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.confirmPassword && "border-red-500 dark:border-red-500"
              )}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing...' : changePasswordButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
    `,

    modal: `
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordChangeFormProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
}

export default function PasswordChangeForm({ ${dataName}, className, isOpen = true, onClose, onSubmit }: PasswordChangeFormProps) {
  const sourceData = ${dataName} || {};

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPasswordLabel = ${getField('currentPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const currentPasswordPlaceholder = ${getField('currentPasswordPlaceholder')};
  const newPasswordPlaceholder = ${getField('newPasswordPlaceholder')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const changePasswordButton = ${getField('changePasswordButton')};
  const cancelButton = ${getField('cancelButton')};
  const successMessage = ${getField('successMessage')};
  const validation = ${getField('validation')};
  const strengthLabels = ${getField('strengthLabels')};
  const passwordStrengthTitle = ${getField('passwordStrengthTitle')};

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 25) return strengthLabels.weak;
    if (strength < 50) return strengthLabels.fair;
    if (strength < 75) return strengthLabels.good;
    return strengthLabels.strong;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = validation.currentPasswordRequired;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = validation.newPasswordRequired;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = validation.passwordTooShort;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = validation.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = validation.passwordsNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for password change
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/change-password', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      if (onSubmit) {
        onSubmit(data);
      }
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
      }, 1500);
    },
    onError: (error: any) => {
      setErrors({ currentPassword: error?.message || 'Password change failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    if (onClose) onClose();
  };

  const isSubmitting = submitMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Change Password</DialogTitle>
        </DialogHeader>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-300">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {currentPasswordLabel}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                placeholder={currentPasswordPlaceholder}
                className={cn(
                  "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                  errors.currentPassword && "border-red-500 dark:border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {newPasswordLabel}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder={newPasswordPlaceholder}
                className={cn(
                  "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                  errors.newPassword && "border-red-500 dark:border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.newPassword}</p>
            )}

            {/* Password Strength */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{passwordStrengthTitle}</span>
                  <span className={cn(
                    "font-medium",
                    passwordStrength < 25 && "text-red-600",
                    passwordStrength >= 25 && passwordStrength < 50 && "text-orange-600",
                    passwordStrength >= 50 && passwordStrength < 75 && "text-yellow-600",
                    passwordStrength >= 75 && "text-green-600"
                  )}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", getStrengthColor(passwordStrength))}
                    style={{ width: \`\${passwordStrength}%\` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
              {confirmPasswordLabel}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder={confirmPasswordPlaceholder}
                className={cn(
                  "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                  errors.confirmPassword && "border-red-500 dark:border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : changePasswordButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
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

    secure: `
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Check, X, AlertCircle, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordChangeFormProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function PasswordChangeForm({ ${dataName}, className, onSubmit, onCancel }: PasswordChangeFormProps) {
  const sourceData = ${dataName} || {};

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPasswordLabel = ${getField('currentPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const currentPasswordPlaceholder = ${getField('currentPasswordPlaceholder')};
  const newPasswordPlaceholder = ${getField('newPasswordPlaceholder')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const changePasswordButton = ${getField('changePasswordButton')};
  const cancelButton = ${getField('cancelButton')};
  const successMessage = ${getField('successMessage')};
  const validation = ${getField('validation')};
  const strengthLabels = ${getField('strengthLabels')};
  const passwordStrengthTitle = ${getField('passwordStrengthTitle')};
  const passwordRequirements = ${getField('passwordRequirements')};
  const requirementsTitle = ${getField('requirementsTitle')};

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 25) return strengthLabels.weak;
    if (strength < 50) return strengthLabels.fair;
    if (strength < 75) return strengthLabels.good;
    return strengthLabels.strong;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const checkRequirement = (password: string, requirement: string): boolean => {
    if (requirement.includes('8 characters')) return password.length >= 8;
    if (requirement.includes('uppercase')) return /[A-Z]/.test(password);
    if (requirement.includes('lowercase')) return /[a-z]/.test(password);
    if (requirement.includes('number')) return /[0-9]/.test(password);
    if (requirement.includes('special')) return /[^A-Za-z0-9]/.test(password);
    return false;
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = validation.currentPasswordRequired;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = validation.newPasswordRequired;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = validation.passwordTooShort;
    } else if (passwordStrength < 75) {
      newErrors.newPassword = validation.passwordRequirements;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = validation.confirmPasswordRequired;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = validation.passwordsNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for password change
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/change-password', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onSubmit) {
        onSubmit(data);
      }
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      setErrors({ currentPassword: error?.message || 'Password change failed. Please try again.' });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleCancel = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    if (onCancel) onCancel();
  };

  const isSubmitting = submitMutation.isPending;

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Secure Password Change</h4>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            For your security, please ensure your new password meets all requirements below.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-300">{successMessage}</span>
        </div>
      )}

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
                {currentPasswordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder={currentPasswordPlaceholder}
                  className={cn(
                    "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    errors.currentPassword && "border-red-500 dark:border-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.currentPassword}</span>
                </div>
              )}
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
                {newPasswordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  placeholder={newPasswordPlaceholder}
                  className={cn(
                    "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    errors.newPassword && "border-red-500 dark:border-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.newPassword}</span>
                </div>
              )}

              {/* Password Strength */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{passwordStrengthTitle}</span>
                    <span className={cn(
                      "font-medium",
                      passwordStrength < 25 && "text-red-600",
                      passwordStrength >= 25 && passwordStrength < 50 && "text-orange-600",
                      passwordStrength >= 50 && passwordStrength < 75 && "text-yellow-600",
                      passwordStrength >= 75 && "text-green-600"
                    )}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={cn("h-2.5 rounded-full transition-all", getStrengthColor(passwordStrength))}
                      style={{ width: \`\${passwordStrength}%\` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{requirementsTitle}</h4>
                <ul className="space-y-1">
                  {passwordRequirements.map((req: string, index: number) => {
                    const isMet = checkRequirement(formData.newPassword, req);
                    return (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {isMet ? (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={cn(
                          isMet ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {req}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 mb-2 block">
                {confirmPasswordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder={confirmPasswordPlaceholder}
                  className={cn(
                    "pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    errors.confirmPassword && "border-red-500 dark:border-red-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={isSubmitting || passwordStrength < 75}
              >
                {isSubmitting ? 'Changing...' : changePasswordButton}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                {cancelButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.inline;
};
