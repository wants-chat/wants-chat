import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateModalDialog = (
  resolved: ResolvedComponent,
  variant: 'centered' | 'drawer' | 'fullscreen' = 'centered'
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
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  const variants = {
    centered: `
${commonImports}

interface ModalDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ModalDialog({ ${dataName}: propData, className }: ModalDialogProps) {
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
  const sourceData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const modal = ${getField('centeredModal')};

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

  const handleClose = () => {
    setIsOpen(false);
    console.log('Modal closed');
  };

  const handleConfirm = () => {
    console.log('Confirmed');
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200",
        className
      )}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pr-8">
            {modal.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {modal.content}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              {modal.cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={cn(
                modal.isDanger
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              )}
            >
              {modal.confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    drawer: `
${commonImports}

interface ModalDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ModalDialog({ ${dataName}: propData, className }: ModalDialogProps) {
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
  const sourceData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const drawer = ${getField('drawerModal')};

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-gray-800 shadow-2xl w-full max-w-md ml-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const handleClose = () => {
    setIsOpen(false);
    console.log('Drawer closed');
  };

  const handleApply = () => {
    console.log('Applied filters:', selectedOptions);
    setIsOpen(false);
  };

  const handleOptionClick = (sectionTitle: string, option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [sectionTitle]: option
    }));
  };

  if (!isOpen) return null;

  const isRight = drawer.position === 'right';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 shadow-2xl w-full max-w-md ml-auto flex flex-col animate-in slide-in-from-right duration-300",
        isRight ? "ml-auto" : "mr-auto",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {drawer.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {drawer.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.options.map((option: string, optIdx: number) => (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionClick(section.title, option)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedOptions[section.title] === option
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    fullscreen: `
${commonImports}

interface ModalDialogProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ModalDialog({ ${dataName}: propData, className }: ModalDialogProps) {
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
  const sourceData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const fullscreen = ${getField('fullscreenModal')};

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleClose = () => {
    setIsOpen(false);
    console.log('Fullscreen modal closed');
  };

  const handleAccept = () => {
    console.log('Accepted');
    setIsOpen(false);
  };

  const handleDecline = () => {
    console.log('Declined');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-white dark:bg-gray-900 animate-in fade-in duration-200", className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {fullscreen.title}
          </h1>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {fullscreen.content}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex gap-3 justify-end">
          <Button
            onClick={handleDecline}
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {fullscreen.declineText}
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {fullscreen.acceptText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.centered;
};
