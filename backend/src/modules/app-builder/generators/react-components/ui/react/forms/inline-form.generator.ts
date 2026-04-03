import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateInlineForm = (
  resolved: ResolvedComponent,
  variant: 'newsletter' | 'search' | 'compact' = 'newsletter'
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
import { Send, Search, Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    newsletter: `
${commonImports}

interface InlineFormNewsletterProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const InlineFormNewsletter: React.FC<InlineFormNewsletterProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('error');
      setError(err.message || 'Failed to subscribe');
    },
  });

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

  const newsletterTitle = ${getField('newsletterTitle')};
  const newsletterDescription = ${getField('newsletterDescription')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const subscribeButton = ${getField('subscribeButton')};
  const sendingButton = ${getField('sendingButton')};
  const successMessage = ${getField('successMessage')};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setStatus('loading');
    submitMutation.mutate({ email });
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {newsletterTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {newsletterDescription}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  className="h-12 text-base"
                  disabled={status === 'loading'}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {sendingButton}
                  </>
                ) : (
                  <>
                    {subscribeButton}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-500">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default InlineFormNewsletter;
    `,

    search: `
${commonImports}

interface InlineFormSearchProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const InlineFormSearch: React.FC<InlineFormSearchProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'results'>('idle');

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await api.get<any>(\`${apiRoute}/search?q=\${encodeURIComponent(searchQuery)}\`);
      return response?.data || response;
    },
    onSuccess: () => {
      setStatus('results');
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Search error:', err);
    },
  });

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

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const searchButton = ${getField('searchButton')};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus('searching');
    searchMutation.mutate(query);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Find What You Need
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Search through thousands of resources
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-14 pl-12 pr-32 text-lg rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500"
              disabled={status === 'searching'}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <Button
                type="submit"
                disabled={status === 'searching' || !query.trim()}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                {status === 'searching' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  searchButton
                )}
              </Button>
            </div>
          </div>
        </form>

        {status === 'results' && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p>Found results for <strong className="text-gray-900 dark:text-white">"{query}"</strong></p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Documentation', 'Tutorials', 'API Reference', 'Examples'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InlineFormSearch;
    `,

    compact: `
${commonImports}

interface InlineFormCompactProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const InlineFormCompact: React.FC<InlineFormCompactProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    name: '',
    email: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      setTimeout(() => {
        setFormState({ name: '', email: '' });
        setStatus('idle');
      }, 3000);
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('Form submission error:', err);
    },
  });

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

  const compactTitle = ${getField('compactTitle')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const sendButton = ${getField('sendButton')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim()) return;
    setStatus('loading');
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {compactTitle}
        </h3>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder={namePlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                disabled={status === 'loading'}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder={emailPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                disabled={status === 'loading'}
              />
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700"
            >
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {sendButton}
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InlineFormCompact;
    `
  };

  return variants[variant] || variants.newsletter;
};
