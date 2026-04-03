import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBulkActionsToolbar = (
  resolved: ResolvedComponent,
  variant: 'fixed' | 'floating' | 'dropdown' = 'fixed'
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
import { Trash2, Download, Archive, Check, X, UserPlus, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';`;

  const variants = {
    fixed: `
${commonImports}

interface BulkActionsToolbarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  selectedCount?: number;
  onAction?: (actionId: string) => void;
  onClearSelection?: () => void;
}

export default function BulkActionsToolbar({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  selectedCount = 0,
  onAction,
  onClearSelection
}: BulkActionsToolbarProps) {
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

  const toolbarData = propData || fetchedData || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const actions = propData?.actions || ([] as any[]);
  const selectedItemsText = propData?.selectedItemsText || 'items selected';
  const clearSelectionText = propData?.clearSelectionText || 'Clear selection';
  const confirmationTitle = propData?.confirmationTitle || 'Confirm Action';
  const confirmationMessage = propData?.confirmationMessage || 'Are you sure you want to proceed?';
  const processingText = propData?.processingText || 'Processing...';
  const successMessage = propData?.successMessage || 'Action completed successfully';

  const getIcon = (iconName: string) => {
    const icons: any = { Trash2, Download, Archive, Check, X, UserPlus };
    return icons[iconName] || Check;
  };

  const handleAction = (action: any) => {
    console.log('Action clicked:', action.id, 'for', selectedCount, 'items');

    if (action.requiresConfirmation) {
      setConfirmDialog(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action: any) => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          alert(\`\${successMessage}\\n\\nAction: \${action.label}\\nItems: \${selectedCount}\`);
          onClearSelection && onClearSelection();
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    onAction && onAction(action.id);
    setConfirmDialog(null);
  };

  const handleClearSelection = () => {
    console.log('Clear selection clicked');
    onClearSelection && onClearSelection();
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-700 shadow-lg',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-white font-medium">
                {selectedCount} {selectedItemsText}
              </div>
              <div className="flex items-center gap-2">
                {actions.map((action: any) => {
                  const Icon = getIcon(action.icon);
                  return (
                    <Button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={isProcessing}
                      variant="secondary"
                      size="sm"
                      className={cn(
                        'flex items-center gap-2',
                        action.variant === 'destructive' && 'bg-red-600 hover:bg-red-700 text-white'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleClearSelection}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              {clearSelectionText}
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-white text-sm mb-1">
                <span>{processingText}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-800" />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent className="dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                {confirmationTitle}
              </DialogTitle>
              <DialogDescription>
                {confirmationMessage}
                <br />
                <br />
                <strong>Action:</strong> {confirmDialog.label}
                <br />
                <strong>Selected Items:</strong> {selectedCount}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => executeAction(confirmDialog)}
                className={cn(
                  confirmDialog.variant === 'destructive'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
    `,

    floating: `
${commonImports}

interface BulkActionsToolbarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  selectedCount?: number;
  onAction?: (actionId: string) => void;
}

export default function BulkActionsToolbar({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  selectedCount = 0,
  onAction
}: BulkActionsToolbarProps) {
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

  const toolbarData = propData || fetchedData || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const actions = propData?.actions || ([] as any[]);
  const selectedItemsText = propData?.selectedItemsText || '';

  const getIcon = (iconName: string) => {
    const icons: any = { Trash2, Download, Archive, Check, X, UserPlus };
    return icons[iconName] || Check;
  };

  const handleAction = (action: any) => {
    console.log('Action:', action.id);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      alert(\`\${action.label} completed for \${selectedCount} items\`);
      onAction && onAction(action.id);
    }, 1500);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50',
      'bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700',
      'px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom',
      className
    )}>
      <div className="flex items-center gap-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
          {selectedCount}
        </span>
        <span className="text-sm text-blue-700 dark:text-blue-400">
          {selectedItemsText}
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-2">
        {actions.slice(0, 4).map((action: any) => {
          const Icon = getIcon(action.icon);
          return (
            <Button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={isProcessing}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              title={action.label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}

        {isProcessing && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        )}
      </div>
    </div>
  );
}
    `,

    dropdown: `
${commonImports}

interface BulkActionsToolbarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  selectedCount?: number;
  onAction?: (actionId: string) => void;
  onClearSelection?: () => void;
}

export default function BulkActionsToolbar({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  selectedCount = 0,
  onAction,
  onClearSelection
}: BulkActionsToolbarProps) {
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

  const toolbarData = propData || fetchedData || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  const actions = propData?.actions || ([] as any[]);
  const selectedItemsText = propData?.selectedItemsText || 'items selected';
  const selectActionText = propData?.selectActionText || 'Select action';
  const clearSelectionText = propData?.clearSelectionText || 'Clear selection';

  const getIcon = (iconName: string) => {
    const icons: any = { Trash2, Download, Archive, Check, X, UserPlus };
    return icons[iconName] || Check;
  };

  const handleAction = (action: any) => {
    console.log('Action selected:', action.id);
    setSelectedAction(action);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      alert(\`\${action.label} completed for \${selectedCount} items\`);
      onAction && onAction(action.id);
      setSelectedAction(null);
    }, 1500);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3',
      className
    )}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {selectedCount}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedItemsText}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedAction ? selectedAction.label : selectActionText}
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {actions.map((action: any) => {
                const Icon = getIcon(action.icon);
                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      'flex items-center gap-2',
                      action.variant === 'destructive' && 'text-red-600 dark:text-red-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={onClearSelection}
          variant="ghost"
          size="sm"
          disabled={isProcessing}
          className="text-gray-600 dark:text-gray-400"
        >
          <X className="w-4 h-4 mr-2" />
          {clearSelectionText}
        </Button>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.fixed;
};
