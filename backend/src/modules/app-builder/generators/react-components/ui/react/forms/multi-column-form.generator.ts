import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMultiColumnForm = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'responsive' = 'twoColumn'
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
import { Send, User, Mail, Phone, Building, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    twoColumn: `
${commonImports}

interface MultiColumnFormTwoColumnProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const MultiColumnFormTwoColumn: React.FC<MultiColumnFormTwoColumnProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        setFormState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          message: ''
        });
        setStatus('idle');
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('error');
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

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const companyLabel = ${getField('companyLabel')};
  const companyPlaceholder = ${getField('companyPlaceholder')};
  const jobTitleLabel = ${getField('jobTitleLabel')};
  const jobTitlePlaceholder = ${getField('jobTitlePlaceholder')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
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
    if (!validateForm()) return;
    setStatus('loading');
    submitMutation.mutate(formState);
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">{firstNameLabel} *</Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      className="pl-10 h-11"
                      placeholder={firstNamePlaceholder}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">{lastNameLabel} *</Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      className="pl-10 h-11"
                      placeholder={lastNamePlaceholder}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="phone">{phoneLabel}</Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="pl-10 h-11"
                      placeholder={phonePlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company">{companyLabel}</Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="company"
                      name="company"
                      value={formState.company}
                      onChange={handleChange}
                      className="pl-10 h-11"
                      placeholder={companyPlaceholder}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobTitle">{jobTitleLabel}</Label>
                  <Input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formState.jobTitle}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={jobTitlePlaceholder}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">{messageLabel}</Label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={messagePlaceholder}
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

export default MultiColumnFormTwoColumn;
    `,

    threeColumn: `
${commonImports}

interface MultiColumnFormThreeColumnProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const MultiColumnFormThreeColumn: React.FC<MultiColumnFormThreeColumnProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    city: '',
    state: '',
    zip: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        setFormState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          city: '',
          state: '',
          zip: ''
        });
        setStatus('idle');
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('error');
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

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const personalInfoTitle = ${getField('personalInfoTitle')};
  const contactInfoTitle = ${getField('contactInfoTitle')};
  const addressInfoTitle = ${getField('addressInfoTitle')};
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const companyLabel = ${getField('companyLabel')};
  const companyPlaceholder = ${getField('companyPlaceholder')};
  const jobTitleLabel = ${getField('jobTitleLabel')};
  const jobTitlePlaceholder = ${getField('jobTitlePlaceholder')};
  const cityLabel = ${getField('cityLabel')};
  const cityPlaceholder = ${getField('cityPlaceholder')};
  const stateLabel = ${getField('stateLabel')};
  const statePlaceholder = ${getField('statePlaceholder')};
  const zipLabel = ${getField('zipLabel')};
  const zipPlaceholder = ${getField('zipPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-6xl mx-auto">
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {personalInfoTitle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="firstName">{firstNameLabel} *</Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={firstNamePlaceholder}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">{lastNameLabel} *</Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={lastNamePlaceholder}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
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
                      className="mt-2 h-11"
                      placeholder={emailPlaceholder}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {contactInfoTitle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="phone">{phoneLabel}</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={phonePlaceholder}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">{companyLabel}</Label>
                    <Input
                      type="text"
                      id="company"
                      name="company"
                      value={formState.company}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={companyPlaceholder}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobTitle">{jobTitleLabel}</Label>
                    <Input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formState.jobTitle}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={jobTitlePlaceholder}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {addressInfoTitle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">{cityLabel}</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={formState.city}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={cityPlaceholder}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">{stateLabel}</Label>
                    <Input
                      type="text"
                      id="state"
                      name="state"
                      value={formState.state}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={statePlaceholder}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip">{zipLabel}</Label>
                    <Input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formState.zip}
                      onChange={handleChange}
                      className="mt-2 h-11"
                      placeholder={zipPlaceholder}
                    />
                  </div>
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

export default MultiColumnFormThreeColumn;
    `,

    responsive: `
${commonImports}

interface MultiColumnFormResponsiveProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const MultiColumnFormResponsive: React.FC<MultiColumnFormResponsiveProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        setFormState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          message: ''
        });
        setStatus('idle');
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('error');
      console.error('Form submission error:', err);
    },
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
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const addressLabel = ${getField('addressLabel')};
  const addressPlaceholder = ${getField('addressPlaceholder')};
  const cityLabel = ${getField('cityLabel')};
  const cityPlaceholder = ${getField('cityPlaceholder')};
  const stateLabel = ${getField('stateLabel')};
  const statePlaceholder = ${getField('statePlaceholder')};
  const zipLabel = ${getField('zipLabel')};
  const zipPlaceholder = ${getField('zipPlaceholder')};
  const countryLabel = ${getField('countryLabel')};
  const countryOptions = ${getField('countryOptions')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
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
    if (!validateForm()) return;
    setStatus('loading');
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="mb-8">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields - Full width on mobile, 2 columns on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="firstName">{firstNameLabel} *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formState.firstName}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={firstNamePlaceholder}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">{lastNameLabel} *</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formState.lastName}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={lastNamePlaceholder}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                <div>
                  <Label htmlFor="phone">{phoneLabel}</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={phonePlaceholder}
                  />
                </div>
              </div>

              {/* Address Field - Full width */}
              <div>
                <Label htmlFor="address">{addressLabel}</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formState.address}
                  onChange={handleChange}
                  className="mt-2 h-11"
                  placeholder={addressPlaceholder}
                />
              </div>

              {/* City, State, ZIP - Responsive: Stack on mobile, 3 columns on lg+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="city">{cityLabel}</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formState.city}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={cityPlaceholder}
                  />
                </div>

                <div>
                  <Label htmlFor="state">{stateLabel}</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    value={formState.state}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={statePlaceholder}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="zip">{zipLabel}</Label>
                  <Input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formState.zip}
                    onChange={handleChange}
                    className="mt-2 h-11"
                    placeholder={zipPlaceholder}
                  />
                </div>
              </div>

              {/* Country Field */}
              <div>
                <Label htmlFor="country">{countryLabel}</Label>
                <select
                  id="country"
                  name="country"
                  value={formState.country}
                  onChange={handleChange}
                  className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {countryOptions.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Field */}
              <div>
                <Label htmlFor="message">{messageLabel}</Label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={messagePlaceholder}
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

export default MultiColumnFormResponsive;
    `
  };

  return variants[variant] || variants.twoColumn;
};
