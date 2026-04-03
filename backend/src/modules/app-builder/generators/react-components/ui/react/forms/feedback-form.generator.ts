import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFeedbackForm = (
  resolved: ResolvedComponent,
  variant: 'stars' | 'numbers' | 'detailed' = 'stars'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Star, CheckCircle, ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    stars: `
${commonImports}

interface FeedbackFormStarsProps {
  ${dataName}?: any;
  entity?: string;
  onSuccess?: (data: any) => void;
  className?: string;
  submitButtonText?: string;
  [key: string]: any;
}

const FeedbackFormStars: React.FC<FeedbackFormStarsProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  onSuccess,
  className,
  submitButtonText
}) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    rating: 0,
    email: '',
    comments: '',
    anonymous: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const ratingTitle = ${getField('ratingTitle')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const commentsLabel = ${getField('commentsLabel')};
  const commentsPlaceholder = ${getField('commentsPlaceholder')};
  const anonymousLabel = ${getField('anonymousLabel')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setFormState({ rating: 0, email: '', comments: '', anonymous: false });
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setErrors({ submit: errorMessage });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (formState.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formState.anonymous && !formState.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('loading');
    setErrors({});
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-gray-200/50 dark:border-gray-700/50">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {mainTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {mainDescription}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              {successTitle}
            </h4>
            <p className="text-green-700 dark:text-green-300 text-lg font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-300">{errors.submit}</span>
              </div>
            )}

            <div>
              <Label className="text-center block mb-5 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {ratingTitle}
              </Label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, rating: star }))}
                    className="transition-all duration-300 hover:scale-125 focus:scale-125 active:scale-95"
                  >
                    <Star
                      className={\`h-14 w-14 \${
                        star <= formState.rating
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg animate-pulse'
                          : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200 dark:hover:text-yellow-700'
                      }\`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{errors.rating}</p>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <input
                type="checkbox"
                id="anonymous"
                name="anonymous"
                checked={formState.anonymous}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                {anonymousLabel}
              </Label>
            </div>

            {!formState.anonymous && (
              <div>
                <Label htmlFor="email">{emailLabel} *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="mt-2 h-11"
                  placeholder={emailPlaceholder}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="comments">{commentsLabel}</Label>
              <textarea
                id="comments"
                name="comments"
                value={formState.comments}
                onChange={handleChange}
                rows={5}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={commentsPlaceholder}
              />
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl text-lg font-bold"
            >
              {status === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {sendingButton}
                </>
              ) : (
                <>
                  <Send className="h-6 w-6 mr-3" />
                  {submitButtonText || submitButton}
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackFormStars;
    `,

    numbers: `
${commonImports}

interface FeedbackFormNumbersProps {
  ${dataName}?: any;
  entity?: string;
  onSuccess?: (data: any) => void;
  className?: string;
  submitButtonText?: string;
  [key: string]: any;
}

const FeedbackFormNumbers: React.FC<FeedbackFormNumbersProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  onSuccess,
  className,
  submitButtonText
}) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    rating: 0,
    category: '',
    comments: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

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

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const categoryLabel = ${getField('categoryLabel')};
  const categories = ${getField('categories')};
  const commentsLabel = ${getField('commentsLabel')};
  const commentsPlaceholder = ${getField('commentsPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setFormState({ rating: 0, category: '', comments: '' });
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Feedback submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formState.rating === 0) return;

    setStatus('loading');
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-gray-200/50 dark:border-gray-700/50">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {mainTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {mainDescription}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              {successTitle}
            </h4>
            <p className="text-green-700 dark:text-green-300 text-lg font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-center block mb-4 text-lg font-semibold">
                Rate from 0 to 10
              </Label>
              <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, rating: num }))}
                    className={\`w-14 h-14 rounded-xl border-2 font-bold text-lg transition-all duration-300 \${
                      formState.rating === num
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white scale-110 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:scale-105'
                    }\`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="category">{categoryLabel}</Label>
              <select
                id="category"
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {categories.map((cat: any) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="comments">{commentsLabel}</Label>
              <textarea
                id="comments"
                name="comments"
                value={formState.comments}
                onChange={handleChange}
                rows={5}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={commentsPlaceholder}
              />
            </div>

            <Button
              type="submit"
              disabled={status === 'loading' || formState.rating === 0}
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl text-lg font-bold"
            >
              {status === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {sendingButton}
                </>
              ) : (
                <>
                  <Send className="h-6 w-6 mr-3" />
                  {submitButton}
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackFormNumbers;
    `,

    detailed: `
${commonImports}

interface FeedbackFormDetailedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSuccess?: (data: any) => void;
  [key: string]: any;
}

const FeedbackFormDetailed: React.FC<FeedbackFormDetailedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    satisfaction: '',
    category: '',
    rating: 0,
    name: '',
    email: '',
    comments: '',
    anonymous: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

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

  const sourceData = propData || fetchedData || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const satisfactionTitle = ${getField('satisfactionTitle')};
  const satisfactionOptions = ${getField('satisfactionOptions')};
  const categoryLabel = ${getField('categoryLabel')};
  const categories = ${getField('categories')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const commentsLabel = ${getField('commentsLabel')};
  const commentsPlaceholder = ${getField('commentsPlaceholder')};
  const anonymousLabel = ${getField('anonymousLabel')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`/\${entity}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) {
        onSuccess(data);
      }
      setTimeout(() => {
        setFormState({
          satisfaction: '',
          category: '',
          rating: 0,
          name: '',
          email: '',
          comments: '',
          anonymous: false
        });
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Feedback submission error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus('loading');
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mainTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {mainDescription}
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                {successTitle}
              </h4>
              <p className="text-green-700 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  {satisfactionTitle}
                </Label>
                <div className="space-y-2">
                  {satisfactionOptions.map((option: any) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="satisfaction"
                        value={option.value}
                        checked={formState.satisfaction === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="category">{categoryLabel} *</Label>
                <select
                  id="category"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {categories.map((cat: any) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-3 block">Rate Your Experience (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={\`h-10 w-10 \${
                          star <= formState.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }\`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  checked={formState.anonymous}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  {anonymousLabel}
                </Label>
              </div>

              {!formState.anonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{nameLabel}</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={namePlaceholder}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{emailLabel}</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={emailPlaceholder}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="comments">{commentsLabel}</Label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formState.comments}
                  onChange={handleChange}
                  rows={5}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={commentsPlaceholder}
                />
              </div>

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {sendingButton}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {submitButton}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormDetailed;
    `
  };

  return variants[variant] || variants.stars;
};
