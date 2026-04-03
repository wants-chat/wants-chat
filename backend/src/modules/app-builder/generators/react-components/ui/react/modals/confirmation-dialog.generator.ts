import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateConfirmationDialog = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'danger' | 'checkbox' = 'simple'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  const variants = {
    simple: `
${commonImports}

interface ConfirmationDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ConfirmationDialog({ ${dataName}: propData, className }: ConfirmationDialogProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const dialogData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const dialog = ${getField('simpleDialog')};

  const handleConfirm = () => {
    console.log('Confirmed');
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    setIsOpen(false);
  };

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200",
        className
      )}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {dialog.title}
          </h2>
          <p className="text-base text-gray-900 dark:text-white font-medium mb-2">
            {dialog.question}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dialog.explanation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {dialog.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {dialog.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    danger: `
${commonImports}

interface ConfirmationDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ConfirmationDialog({ ${dataName}: propData, className }: ConfirmationDialogProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const dialogData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const dialog = ${getField('dangerDialog')};

  const handleConfirm = () => {
    console.log('Danger action confirmed');
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('Danger action cancelled');
    setIsOpen(false);
  };

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200",
        className
      )}>
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {dialog.title}
          </h2>
          <p className="text-base text-gray-900 dark:text-white font-medium mb-2">
            {dialog.question}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dialog.explanation}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {dialog.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {dialog.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    checkbox: `
${commonImports}

interface ConfirmationDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ConfirmationDialog({ ${dataName}: propData, className }: ConfirmationDialogProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const dialogData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const dialog = ${getField('checkboxDialog')};

  const handleConfirm = () => {
    console.log('Confirmed with remember choice:', dontAskAgain);
    if (dontAskAgain) {
      localStorage.setItem('confirmation_preference', 'true');
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    setIsOpen(false);
  };

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200",
        className
      )}>
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {dialog.title}
          </h2>
          <p className="text-base text-gray-900 dark:text-white font-medium mb-2">
            {dialog.question}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dialog.explanation}
          </p>
        </div>

        {/* Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {dialog.checkboxLabel}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {dialog.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              dialog.isDanger
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            )}
          >
            {dialog.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
