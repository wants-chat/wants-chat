import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBasicContactForm = (
  resolved: ResolvedComponent,
  variant: 'minimal' | 'standard' | 'detailed' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }

    // Special defaults for specific fields
    if (fieldName === 'subjectOptions') {
      return `propData?.${fieldName} || [
    { value: '', label: 'Select a subject' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' }
  ]`;
    }

    // Field-specific fallback values
    const fieldDefaults: Record<string, string> = {
      mainTitle: 'Get in Touch',
      mainDescription: "We would love to hear from you. Send us a message and we will respond as soon as possible.",
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@example.com',
      subjectLabel: 'Subject',
      messageLabel: 'Message',
      messagePlaceholder: 'Type your message here...',
      submitButton: 'Send Message',
      sendingButton: 'Sending...',
      successTitle: 'Message Sent!',
      successMessage: "Thank you for contacting us. We will get back to you soon.",
      errorTitle: 'Error',
      errorMessage: 'Something went wrong. Please try again.'
    };

    if (fieldDefaults[fieldName]) {
      return `propData?.${fieldName} || '${fieldDefaults[fieldName]}'`;
    }

    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|categories|tags|members|avatars|methods|examples|options/i)) {
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    minimal: `
${commonImports}

interface BasicContactFormMinimalProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const BasicContactFormMinimal: React.FC<BasicContactFormMinimalProps> = ({ ${dataName}: propData, className, onSubmit }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};
  const errorTitle = ${getField('errorTitle')};
  const errorMessage = ${getField('errorMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formState.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    console.log('Form submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setStatus('success');

    setTimeout(() => {
      setFormState({ name: '', email: '', message: '' });
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/20 flex items-center justify-center p-4", className)}>
      <div className="bg-gradient-to-br from-white via-blue-50/10 to-white dark:from-gray-800 dark:via-blue-900/5 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 p-8 max-w-md w-full">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {mainTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mainDescription}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1">
              {successTitle}
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{nameLabel} *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder={namePlaceholder}
                className="mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{emailLabel} *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder={emailPlaceholder}
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">{messageLabel} *</Label>
              <textarea
                id="message"
                name="message"
                value={formState.message}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={messagePlaceholder}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>
              )}
            </div>

            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">
                    {errorTitle}
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {status === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {sendingButton}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
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

export default BasicContactFormMinimal;
    `,

    standard: `
${commonImports}

interface BasicContactFormStandardProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const BasicContactFormStandard: React.FC<BasicContactFormStandardProps> = ({ ${dataName}: propData, className, onSubmit }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const subjectLabel = ${getField('subjectLabel')};
  const subjectOptions = ${getField('subjectOptions')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};
  const errorTitle = ${getField('errorTitle')};
  const errorMessage = ${getField('errorMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formState.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formState.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    console.log('Form submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setStatus('success');

    setTimeout(() => {
      setFormState({ name: '', email: '', subject: '', message: '' });
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mainTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {mainDescription}
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
              {successTitle}
            </h4>
            <p className="text-green-700 dark:text-green-300">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">{nameLabel} *</Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder={namePlaceholder}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{emailLabel} *</Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder={emailPlaceholder}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subject">{subjectLabel} *</Label>
              <select
                id="subject"
                name="subject"
                value={formState.subject}
                onChange={handleChange}
                className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {subjectOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">{messageLabel} *</Label>
              <div className="relative mt-2">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={5}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={messagePlaceholder}
                />
              </div>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
              )}
            </div>

            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                    {errorTitle}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

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
  );
};

export default BasicContactFormStandard;
    `,

    detailed: `
${commonImports}
import { Phone, Clock } from 'lucide-react';

interface BasicContactFormDetailedProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const BasicContactFormDetailed: React.FC<BasicContactFormDetailedProps> = ({ ${dataName}: propData, className, onSubmit }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const subjectLabel = ${getField('subjectLabel')};
  const subjectOptions = ${getField('subjectOptions')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};
  const errorTitle = ${getField('errorTitle')};
  const errorMessage = ${getField('errorMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formState.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formState.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    console.log('Form submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setStatus('success');

    setTimeout(() => {
      setFormState({ name: '', email: '', subject: '', message: '' });
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {mainTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {mainDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    support@example.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Phone
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Hours
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mon-Fri: 9am-6pm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name">{nameLabel} *</Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="pl-10 h-11"
                        placeholder={namePlaceholder}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">{emailLabel} *</Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="pl-10 h-11"
                        placeholder={emailPlaceholder}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject">{subjectLabel} *</Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {subjectOptions.map((option: any) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">{messageLabel} *</Label>
                    <div className="relative mt-2">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={6}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={messagePlaceholder}
                      />
                    </div>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                    )}
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          {errorTitle}
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

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
      </div>
    </div>
  );
};

export default BasicContactFormDetailed;
    `
  };

  return variants[variant] || variants.standard;
};
