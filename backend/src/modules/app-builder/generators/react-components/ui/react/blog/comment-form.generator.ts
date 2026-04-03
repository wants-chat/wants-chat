import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCommentForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'threaded' | 'modal' = 'inline'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    inline: `
${commonImports}
import { User, Mail, Globe, MessageSquare, Eye } from 'lucide-react';

interface CommentData {
  name: string;
  email: string;
  website: string;
  comment: string;
}

interface InlineCommentFormProps {
  data?: any;
  className?: string;
  onSubmit?: (comment: CommentData) => void;
  characterLimit?: number;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onTagClick?: (tag: string) => void;
}

const InlineCommentForm: React.FC<InlineCommentFormProps> = ({
  data: propData,
  className,
  onSubmit,
  characterLimit = 1000
}) => {
  const [formData, setFormData] = useState<CommentData>({
    name: '',
    email: '',
    website: '',
    comment: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Partial<CommentData>>({});

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = commentsData || {};

  const title = commentsData?.inlineTitle || 'Leave a Comment';
  const subtitle = commentsData?.inlineSubtitle || 'Your email address will not be published. Required fields are marked *';
  const namePlaceholder = commentsData?.namePlaceholder || 'Your Name *';
  const emailPlaceholder = commentsData?.emailPlaceholder || 'Your Email *';
  const websitePlaceholder = commentsData?.websitePlaceholder || 'Your Website (optional)';
  const commentPlaceholder = commentsData?.commentPlaceholder || 'Write your comment here... *';
  const submitButton = commentsData?.submitButton || 'Post Comment';
  const previewButton = commentsData?.previewButton || 'Preview';

  const handleChange = (field: keyof CommentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CommentData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (formData.comment.length > characterLimit) {
      newErrors.comment = \`Comment must be less than \${characterLimit} characters\`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        console.log('Comment submitted:', formData);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        website: '',
        comment: ''
      });
      setShowPreview(false);
    }
  };

  const remainingChars = characterLimit - formData.comment.length;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={\`pl-10 \${errors.name ? 'border-red-500' : ''}\`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={\`pl-10 \${errors.email ? 'border-red-500' : ''}\`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="url"
              placeholder={websitePlaceholder}
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Comment Textarea */}
          <div>
            {!showPreview ? (
              <>
                <Textarea
                  placeholder={commentPlaceholder}
                  value={formData.comment}
                  onChange={(e) => handleChange('comment', e.target.value)}
                  className={\`min-h-32 rounded-xl border-2 focus:border-blue-500 transition-all duration-300 \${errors.comment ? 'border-red-500 focus:border-red-500' : ''}\`}
                  maxLength={characterLimit}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.comment && (
                    <p className="text-red-500 text-xs font-medium">{errors.comment}</p>
                  )}
                  <p className={\`text-xs ml-auto font-medium \${
                    remainingChars < 100
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                      : 'text-gray-500 dark:text-gray-400'
                  }\`}>
                    {remainingChars} characters remaining
                  </p>
                </div>
              </>
            ) : (
              <div className="min-h-32 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {formData.comment}
                </p>
              </div>
            )}
          </div>

          {/* Markdown Support Hint */}
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>💡 Tip: Markdown formatting is supported</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 rounded-xl">
              <MessageSquare className="h-4 w-4" />
              {submitButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 rounded-xl border-2 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Edit' : previewButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InlineCommentForm;
    `,

    threaded: `
${commonImports}
import { User, Mail, MessageSquare, AlertCircle } from 'lucide-react';

interface CommentData {
  name: string;
  email: string;
  comment: string;
}

interface ThreadedCommentFormProps {
  data?: any;
  className?: string;
  onSubmit?: (comment: CommentData) => void;
  replyTo?: string;
  parentId?: number;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const ThreadedCommentForm: React.FC<ThreadedCommentFormProps> = ({
  ${dataName}: propData,
  className,
  onSubmit,
  replyTo,
  parentId
}) => {
  const [formData, setFormData] = useState<CommentData>({
    name: '',
    email: '',
    comment: ''
  });
  const [errors, setErrors] = useState<Partial<CommentData>>({});

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = commentsData || {};

  const title = commentsData?.threadedTitle || 'Leave a Comment';
  const subtitle = commentsData?.threadedSubtitle || 'Your email address will not be published. Required fields are marked *';
  const namePlaceholder = commentsData?.namePlaceholder || 'Your Name *';
  const emailPlaceholder = commentsData?.emailPlaceholder || 'Your Email *';
  const commentPlaceholder = commentsData?.commentPlaceholder || 'Write your comment here... *';
  const submitButton = commentsData?.submitButton || 'Post Comment';

  const handleChange = (field: keyof CommentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CommentData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        console.log('Comment submitted:', { ...formData, parentId });
      }

      setFormData({ name: '', email: '', comment: '' });
    }
  };

  return (
    <div className={cn("", className)}>
      {replyTo && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Replying to <span className="font-semibold">{replyTo}</span>
          </p>
        </div>
      )}

      <div className="border dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={\`pl-10 \${errors.name ? 'border-red-500' : ''}\`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={\`pl-10 \${errors.email ? 'border-red-500' : ''}\`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment *
            </label>
            <Textarea
              placeholder={commentPlaceholder}
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              className={\`min-h-24 \${errors.comment ? 'border-red-500' : ''}\`}
            />
            {errors.comment && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.comment}
              </p>
            )}
          </div>

          <Button type="submit" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {submitButton}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ThreadedCommentForm;
    `,

    modal: `
${commonImports}
import { User, Mail, Globe, MessageSquare, X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CommentData {
  name: string;
  email: string;
  website: string;
  comment: string;
}

interface ModalCommentFormProps {
  data?: any;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (comment: CommentData) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const ModalCommentForm: React.FC<ModalCommentFormProps> = ({
  ${dataName}: propData,
  className,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CommentData>({
    name: '',
    email: '',
    website: '',
    comment: ''
  });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = commentsData || {};

  const title = commentsData?.modalTitle || 'Leave a Comment';
  const subtitle = commentsData?.modalSubtitle || 'Your email address will not be published. Required fields are marked *';
  const namePlaceholder = commentsData?.namePlaceholder || 'Your Name *';
  const emailPlaceholder = commentsData?.emailPlaceholder || 'Your Email *';
  const websitePlaceholder = commentsData?.websitePlaceholder || 'Your Website (optional)';
  const commentPlaceholder = commentsData?.commentPlaceholder || 'Write your comment here... *';
  const submitButton = commentsData?.submitButton || 'Post Comment';
  const cancelButton = commentsData?.cancelButton || 'Cancel';

  const handleChange = (field: keyof CommentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Comment submitted:', formData);
    }

    setFormData({ name: '', email: '', website: '', comment: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                placeholder={websitePlaceholder}
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment *</label>
            <Textarea
              placeholder={commentPlaceholder}
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              className="min-h-32"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {cancelButton}
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {submitButton}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCommentForm;
    `
  };

  return variants[variant] || variants.inline;
};
