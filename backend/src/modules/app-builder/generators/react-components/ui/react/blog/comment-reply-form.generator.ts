import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCommentReplyForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'nested' | 'popup' = 'inline'
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

  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'comments'}`;
  };
  const apiRoute = getApiRoute();
  const entity = dataSource || 'comments';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    inline: `
${commonImports}
import { Reply, X, Quote } from 'lucide-react';

interface ReplyTo {
  author: string;
  comment: string;
  date: string;
}

interface InlineReplyFormProps {
  ${dataName}?: any;
  className?: string;
  replyTo: ReplyTo;
  onSubmit?: (reply: string) => void;
  onCancel?: () => void;
  characterLimit?: number;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({
  ${dataName}: propData,
  className,
  replyTo,
  onSubmit,
  onCancel,
  characterLimit = 500
}) => {
  const [replyText, setReplyText] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('inlineTitle')};
  const subtitle = ${getField('inlineSubtitle')};
  const replyPlaceholder = ${getField('replyPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (replyText.trim()) {
      if (onSubmit) {
        onSubmit(replyText);
      } else {
        console.log('Reply submitted:', replyText);
      }
      setReplyText('');
    }
  };

  const handleCancel = () => {
    setReplyText('');
    if (onCancel) {
      onCancel();
    }
  };

  const remainingChars = characterLimit - replyText.length;

  return (
    <div className={cn("border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-6 py-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-r-2xl shadow-lg", className)}>
      {/* Reply Context */}
      <div className="mb-4">
        <div className="flex items-start gap-3 mb-3">
          <Quote className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              {title} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{replyTo.author}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              "{replyTo.comment}"
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>
      </div>

      {/* Reply Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Textarea
            placeholder={replyPlaceholder}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-24 bg-white dark:bg-gray-800 rounded-xl border-2 focus:border-blue-500 transition-all duration-300 shadow-sm"
            maxLength={characterLimit}
          />
          <div className="flex items-center justify-between mt-2">
            <p className={\`text-xs font-medium \${
              remainingChars < 50
                ? 'bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                : 'text-gray-500 dark:text-gray-400'
            }\`}>
              {remainingChars} characters remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 rounded-xl">
            <Reply className="h-4 w-4" />
            {submitButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-xl border-2 hover:border-gray-400 transition-all duration-300"
          >
            <X className="h-4 w-4" />
            {cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InlineReplyForm;
    `,

    nested: `
${commonImports}
import { Reply, User, CornerDownRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ReplyTo {
  author: string;
  comment: string;
}

interface NestedReplyFormProps {
  ${dataName}?: any;
  className?: string;
  replyTo: ReplyTo;
  onSubmit?: (reply: { name: string; reply: string }) => void;
  onCancel?: () => void;
  level?: number;
}

const NestedReplyForm: React.FC<NestedReplyFormProps> = ({
  ${dataName}: propData,
  className,
  replyTo,
  onSubmit,
  onCancel,
  level = 0
}) => {
  const [name, setName] = useState('');
  const [replyText, setReplyText] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('nestedTitle')};
  const replyPlaceholder = ${getField('replyPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() && replyText.trim()) {
      if (onSubmit) {
        onSubmit({ name, reply: replyText });
      } else {
        console.log('Reply submitted:', { name, reply: replyText });
      }
      setName('');
      setReplyText('');
    }
  };

  const indentClass = level > 0 ? 'ml-8' : '';

  return (
    <div className={cn(\`\${indentClass} mt-4\`, className)}>
      <div className="flex gap-2 mb-3">
        <CornerDownRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title} <span className="text-blue-600">@{replyTo.author}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 line-clamp-1">
            "{replyTo.comment}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            required
          />
        </div>

        <Textarea
          placeholder={replyPlaceholder}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="min-h-20"
          required
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="flex items-center gap-2">
            <Reply className="h-3 w-3" />
            {submitButton}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            {cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NestedReplyForm;
    `,

    popup: `
${commonImports}
import { Reply, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReplyTo {
  author: string;
  comment: string;
}

interface PopupReplyFormProps {
  ${dataName}?: any;
  className?: string;
  isOpen: boolean;
  replyTo: ReplyTo;
  onSubmit?: (reply: string) => void;
  onClose?: () => void;
}

const PopupReplyForm: React.FC<PopupReplyFormProps> = ({
  ${dataName}: propData,
  className,
  isOpen,
  replyTo,
  onSubmit,
  onClose
}) => {
  const [replyText, setReplyText] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('popupTitle')};
  const subtitle = ${getField('popupSubtitle')};
  const replyPlaceholder = ${getField('replyPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const cancelButton = ${getField('cancelButton')};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (replyText.trim()) {
      if (onSubmit) {
        onSubmit(replyText);
      } else {
        console.log('Reply submitted:', replyText);
      }
      setReplyText('');
      if (onClose) {
        onClose();
      }
    }
  };

  const handleClose = () => {
    setReplyText('');
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto">
        <Card className={cn("shadow-2xl", className)}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Reply className="h-5 w-5" />
                {title} {replyTo.author}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>

          <CardContent>
            {/* Original Comment Quote */}
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{replyTo.comment}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                — {replyTo.author}
              </p>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder={replyPlaceholder}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-32"
                autoFocus
                required
              />

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {cancelButton}
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  {submitButton}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PopupReplyForm;
    `
  };

  return variants[variant] || variants.inline;
};
