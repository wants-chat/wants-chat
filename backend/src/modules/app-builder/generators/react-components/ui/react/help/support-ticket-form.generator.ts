import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSupportTicketForm = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'priority' | 'detailed' = 'basic'
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
    return `/${dataSource || 'tickets'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'tickets';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Send, Upload, CheckCircle, AlertCircle, User, Mail, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface SupportTicketFormBasicProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketFormBasic: React.FC<SupportTicketFormBasicProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
    category: '',
    subject: '',
    description: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
  const categoryLabel = ${getField('categoryLabel')};
  const categories = ${getField('categories')};
  const subjectLabel = ${getField('subjectLabel')};
  const subjectPlaceholder = ${getField('subjectPlaceholder')};
  const descriptionLabel = ${getField('descriptionLabel')};
  const descriptionPlaceholder = ${getField('descriptionPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formState.category) newErrors.category = 'Please select a category';
    if (!formState.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formState.description.trim()) newErrors.description = 'Description is required';

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

    if (!validateForm()) return;

    setStatus('loading');
    console.log('Support ticket submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setStatus('success');

    setTimeout(() => {
      setFormState({
        name: '',
        email: '',
        category: '',
        subject: '',
        description: ''
      });
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>

              <div>
                <Label htmlFor="category">{categoryLabel} *</Label>
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
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subject">{subjectLabel} *</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  className="mt-2 h-11"
                  placeholder={subjectPlaceholder}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">{descriptionLabel} *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  rows={6}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={descriptionPlaceholder}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
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

export default SupportTicketFormBasic;
    `,

    priority: `
${commonImports}

interface SupportTicketFormPriorityProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketFormPriority: React.FC<SupportTicketFormPriorityProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
    category: '',
    priority: '',
    subject: '',
    description: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const categoryLabel = ${getField('categoryLabel')};
  const categories = ${getField('categories')};
  const priorityLabel = ${getField('priorityLabel')};
  const priorities = ${getField('priorities')};
  const subjectLabel = ${getField('subjectLabel')};
  const subjectPlaceholder = ${getField('subjectPlaceholder')};
  const descriptionLabel = ${getField('descriptionLabel')};
  const descriptionPlaceholder = ${getField('descriptionPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus('loading');
    console.log('Support ticket submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setStatus('success');

    setTimeout(() => {
      setFormState({
        name: '',
        email: '',
        category: '',
        priority: '',
        subject: '',
        description: ''
      });
      setStatus('idle');
    }, 3000);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
      urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
    };
    return colors[priority] || '';
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mainTitle}
            </h3>
            {formState.priority && (
              <div className="mt-3 inline-block">
                <span className={\`px-3 py-1 rounded-full text-sm font-medium border \${getPriorityColor(formState.priority)}\`}>
                  Priority: {priorities.find((p: any) => p.value === formState.priority)?.label}
                </span>
              </div>
            )}
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
                <Label className="text-lg font-semibold mb-3 block">{priorityLabel} *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priorities.filter((p: any) => p.value).map((priority: any) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, priority: priority.value }))}
                      className={\`p-4 rounded-lg border-2 transition-all \${
                        formState.priority === priority.value
                          ? getPriorityColor(priority.value)
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }\`}
                    >
                      <div className="text-center font-semibold">{priority.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">{nameLabel} *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={namePlaceholder}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{emailLabel} *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={emailPlaceholder}
                  />
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
                <Label htmlFor="subject">{subjectLabel} *</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 h-11"
                  placeholder={subjectPlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="description">{descriptionLabel} *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={descriptionPlaceholder}
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

export default SupportTicketFormPriority;
    `,

    detailed: `
${commonImports}

interface SupportTicketFormDetailedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SupportTicketFormDetailed: React.FC<SupportTicketFormDetailedProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
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
    category: '',
    priority: '',
    subject: '',
    description: '',
    attachments: [] as File[]
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
  const categoryLabel = ${getField('categoryLabel')};
  const categories = ${getField('categories')};
  const priorityLabel = ${getField('priorityLabel')};
  const priorities = ${getField('priorities')};
  const subjectLabel = ${getField('subjectLabel')};
  const subjectPlaceholder = ${getField('subjectPlaceholder')};
  const descriptionLabel = ${getField('descriptionLabel')};
  const descriptionPlaceholder = ${getField('descriptionPlaceholder')};
  const attachmentLabel = ${getField('attachmentLabel')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormState(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus('loading');
    console.log('Support ticket submitted:', formState);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setStatus('success');
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
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
              <p className="text-green-700 dark:text-green-300 mb-4">
                {successMessage}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ticket ID: <strong>#TICK-{Math.floor(Math.random() * 10000)}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{nameLabel} *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={namePlaceholder}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{emailLabel} *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={emailPlaceholder}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="priority">{priorityLabel} *</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formState.priority}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {priorities.map((pri: any) => (
                      <option key={pri.value} value={pri.value}>
                        {pri.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">{subjectLabel} *</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 h-11"
                  placeholder={subjectPlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="description">{descriptionLabel} *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={descriptionPlaceholder}
                />
              </div>

              <div>
                <Label>{attachmentLabel}</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Click to upload files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formState.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formState.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

export default SupportTicketFormDetailed;
    `
  };

  return variants[variant] || variants.basic;
};
