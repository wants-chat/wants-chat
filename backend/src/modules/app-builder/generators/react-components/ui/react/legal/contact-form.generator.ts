import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateContactForm = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'minimal' | 'modern' | 'split' | 'glass' = 'simple'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    simple: `
${commonImports}

interface ContactFormSimpleProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
}

const ContactFormSimple: React.FC<ContactFormSimpleProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/20 flex items-center justify-center p-4", className)}>
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 p-10 max-w-2xl w-full">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mainTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {mainDescription}
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
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
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  placeholder={namePlaceholder}
                />
              </div>
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  placeholder={emailPlaceholder}
                />
              </div>
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
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={messagePlaceholder}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
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

export default ContactFormSimple;
    `,

    detailed: `
${commonImports}
import { MapPin, Clock } from 'lucide-react';

interface ContactFormDetailedProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
}

const ContactFormDetailed: React.FC<ContactFormDetailedProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
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
  const subjectLabel = ${getField('subjectLabel')};
  const subjectOptions = ${getField('subjectOptions')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};
  const contactEmail = ${getField('contactEmail')};
  const contactPhone = ${getField('contactPhone')};
  const contactAddress = ${getField('contactAddress')};
  const businessHours = ${getField('businessHours')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Address
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contactAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Phone
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contactPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      Business Hours
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {businessHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                Quick Response
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                    {successTitle}
                  </h4>
                  <p className="text-green-700 dark:text-green-300 mb-1">
                    Thank you for contacting us, {formData.firstName}!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {mainTitle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {mainDescription}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{firstNameLabel} *</Label>
                        <Input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="mt-2 h-11"
                          placeholder={firstNamePlaceholder}
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName">{lastNameLabel} *</Label>
                        <Input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="mt-2 h-11"
                          placeholder={lastNamePlaceholder}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">{emailLabel} *</Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-2 h-11"
                          placeholder={emailPlaceholder}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">{phoneLabel}</Label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-2 h-11"
                          placeholder={phonePlaceholder}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">{companyLabel}</Label>
                        <Input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="mt-2 h-11"
                          placeholder={companyPlaceholder}
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject">{subjectLabel} *</Label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-2 block w-full h-11 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {subjectOptions.map((option: any) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">{messageLabel} *</Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={messagePlaceholder}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFormDetailed;
    `,

    minimal: `
${commonImports}
import { ArrowRight, CheckCircle } from 'lucide-react';

interface ContactFormMinimalProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
}

const ContactFormMinimal: React.FC<ContactFormMinimalProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({ email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full">
        {submitted ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {successTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {successMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {mainTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {mainDescription}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-4 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors text-lg"
                  placeholder={emailPlaceholder}
                />
              </div>

              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="block w-full px-4 py-4 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors text-lg"
                  placeholder={messagePlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-gray-900"></div>
                ) : (
                  <>
                    <span>{submitButton}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactFormMinimal;
    `,

    modern: `
${commonImports}
import { CheckCircle2 } from 'lucide-react';

interface ContactFormModernProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
}

const ContactFormModern: React.FC<ContactFormModernProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
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
  const features = ${getField('features')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          {submitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {successTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll get back to you shortly at <strong>{formData.email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {nameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={\`h-5 w-5 transition-colors \${
                      focusedField === 'name' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                    }\`} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="block w-full pl-10 pr-3 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 transition-all duration-200"
                    placeholder={namePlaceholder}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={\`h-5 w-5 transition-colors \${
                      focusedField === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                    }\`} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="block w-full pl-10 pr-3 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 transition-all duration-200"
                    placeholder={emailPlaceholder}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {subjectLabel}
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="block w-full px-3 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 transition-all duration-200"
                >
                  {subjectOptions.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {messageLabel}
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MessageSquare className={\`h-5 w-5 transition-colors \${
                      focusedField === 'message' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                    }\`} />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={5}
                    className="block w-full pl-10 pr-3 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-400 transition-all duration-200"
                    placeholder={messagePlaceholder}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{sendingButton}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <span>{submitButton}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          {features.map((feature: string, idx: number) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactFormModern;
    `,

    split: `
${commonImports}
import { MapPin, CheckCircle2, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

interface ContactFormSplitProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
}

const ContactFormSplit: React.FC<ContactFormSplitProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
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
  const contactEmail = ${getField('contactEmail')};
  const contactPhone = ${getField('contactPhone')};
  const contactAddress = ${getField('contactAddress')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Information */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-8 lg:p-12 flex flex-col justify-center text-white">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-white rounded-full"></div>
            <div className="absolute top-1/2 -right-12 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute -bottom-12 left-1/3 w-72 h-72 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              Let's Build Something Amazing Together
            </h1>
            <p className="text-base text-white/90 mb-6 leading-relaxed">
              We're here to help bring your ideas to life. Drop us a message and we'll get back to you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Email Us</h3>
                  <p className="text-white/80 text-sm">{contactEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Call Us</h3>
                  <p className="text-white/80 text-sm">{contactPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Visit Us</h3>
                  <p className="text-white/80 text-sm">{contactAddress}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-white/80 mb-3 text-sm">Follow us on social media</p>
              <div className="flex gap-4">
                <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
                  <Instagram className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
                  <Facebook className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white dark:bg-gray-800 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-xl mx-auto w-full">
            {submitted ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 animate-bounce">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {successTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                  Thanks for reaching out!
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  We'll get back to you at <strong className="text-gray-900 dark:text-white">{formData.email}</strong>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {mainTitle}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {mainDescription}
                  </p>
                </div>

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
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12"
                        placeholder={namePlaceholder}
                      />
                    </div>
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
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12"
                        placeholder={emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">{subjectLabel} *</Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-2 block w-full h-12 px-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {subjectOptions.map((option: any) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder={messagePlaceholder}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {loading ? (
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

                  <p className="text-center text-sm text-gray-500 dark:text-gray-500">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFormSplit;
    `,

    glass: `
${commonImports}
import { Calendar, CheckCircle } from 'lucide-react';

interface ContactFormGlassProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (payload: any) => void | Promise<void>;
  title?: string;
  submitButtonText?: string;
  showSubject?: boolean;
  data?: any;
  [key: string]: any;
}

const ContactFormGlass: React.FC<ContactFormGlassProps> = ({ ${dataName}: propData, className }) => {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contactData = ${dataName} || {};
  
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const messageLabel = ${getField('messageLabel')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', date: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn("min-h-screen relative overflow-hidden", className)}>
      <style>{\`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      \`}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 dark:from-purple-900 dark:via-pink-900 dark:to-red-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          <div className="backdrop-blur-2xl bg-white/20 dark:bg-white/10 rounded-3xl shadow-2xl border border-white/30 dark:border-white/20 p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {mainTitle}
              </h2>
              <p className="text-white/90 text-lg">
                {mainDescription}
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/30 backdrop-blur-xl rounded-full mb-6 animate-pulse">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                  {successTitle}
                </h3>
                <p className="text-white/90 text-lg">
                  {successMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                        placeholder={namePlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                        placeholder={emailPlaceholder}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                        placeholder={phonePlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="block w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    placeholder={messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/30 hover:bg-white/40 backdrop-blur-xl border border-white/40 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-lg">{sendingButton}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      <span className="text-lg">{submitButton}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="text-white/80 text-sm">
              We'll respond within 24 hours • All information is kept confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFormGlass;
    `
  };

  return variants[variant] || variants.simple;
};
