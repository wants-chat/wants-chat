/**
 * Insurance Quote Component Generators
 */

export interface QuoteOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateQuoteList(options: QuoteOptions = {}): string {
  const { componentName = 'QuoteList', endpoint = '/quotes' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Clock, CheckCircle, XCircle, DollarSign, Calendar, ChevronRight, Plus, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface Quote {
  id: string;
  quote_number: string;
  type: string;
  status: string;
  applicant_name: string;
  coverage_amount: number;
  estimated_premium: number;
  valid_until: string;
  created_at: string;
}

const ${componentName}: React.FC = () => {
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes', status, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'expired':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'converted':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
        };
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'draft', 'pending', 'approved', 'expired', 'converted'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent w-64"
            />
          </div>
          <Link
            to="/quotes/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Get Quote
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quotes && quotes.length > 0 ? (
          quotes.map((quote: Quote) => {
            const statusConfig = getStatusConfig(quote.status);
            const expiringSoon = quote.status === 'approved' && isExpiringSoon(quote.valid_until);

            return (
              <Link
                key={quote.id}
                to={\`/quotes/\${quote.id}\`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500">#{quote.quote_number}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{quote.applicant_name}</h3>
                    </div>
                    <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium \${statusConfig.color}\`}>
                      {statusConfig.icon}
                      {quote.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="text-gray-900 dark:text-white capitalize">{quote.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Coverage</span>
                      <span className="text-gray-900 dark:text-white">\${quote.coverage_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Premium</span>
                      <span className="font-semibold text-purple-600">\${quote.estimated_premium?.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Valid until {new Date(quote.valid_until).toLocaleDateString()}
                    </div>
                    {expiringSoon && (
                      <span className="text-xs text-orange-500 font-medium">Expiring soon</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No quotes found</p>
            <Link
              to="/quotes/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Get Your First Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateQuoteWizard(options: QuoteOptions = {}): string {
  const { componentName = 'QuoteWizard', endpoint = '/quotes' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Shield, User, Home, Car, Heart, Briefcase, Plane, ChevronRight, ChevronLeft, Check, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Policy Type
    type: '',
    // Step 2: Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    // Step 3: Coverage Details
    coverage_amount: 100000,
    deductible: 500,
    start_date: '',
    // Step 4: Additional Info (varies by type)
    property_address: '',
    property_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    health_conditions: [] as string[],
    smoker: false,
    occupation: '',
  });

  const steps: WizardStep[] = [
    { id: 'type', title: 'Insurance Type', description: 'Select the type of insurance you need' },
    { id: 'personal', title: 'Personal Information', description: 'Tell us about yourself' },
    { id: 'coverage', title: 'Coverage Details', description: 'Customize your coverage' },
    { id: 'additional', title: 'Additional Details', description: 'Provide specific information' },
    { id: 'review', title: 'Review & Submit', description: 'Review your quote request' },
  ];

  const policyTypes = [
    { id: 'health', label: 'Health', icon: Heart, color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    { id: 'auto', label: 'Auto', icon: Car, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    { id: 'home', label: 'Home', icon: Home, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
    { id: 'life', label: 'Life', icon: User, color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { id: 'business', label: 'Business', icon: Briefcase, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' },
    { id: 'travel', label: 'Travel', icon: Plane, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' },
  ];

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      toast.success('Quote request submitted successfully!');
      navigate('/quotes/' + (response?.data?.id || response?.id));
    },
    onError: () => toast.error('Failed to submit quote request'),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleHealthConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(condition)
        ? prev.health_conditions.filter((c) => c !== condition)
        : [...prev.health_conditions, condition],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.type;
      case 1:
        return formData.first_name && formData.last_name && formData.email && formData.date_of_birth;
      case 2:
        return formData.coverage_amount > 0 && formData.start_date;
      case 3:
        if (formData.type === 'auto') return formData.vehicle_make && formData.vehicle_model && formData.vehicle_year;
        if (formData.type === 'home') return formData.property_address && formData.property_type;
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {policyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={\`p-6 rounded-xl border-2 transition-all text-left \${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }\`}
                >
                  <div className={\`w-12 h-12 rounded-xl flex items-center justify-center mb-4 \${type.color}\`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{type.label} Insurance</h3>
                  <p className="text-sm text-gray-500 mt-1">Get coverage for your {type.label.toLowerCase()}</p>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1 text-purple-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 1:
        return (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Coverage Amount *
              </label>
              <input
                type="range"
                name="coverage_amount"
                value={formData.coverage_amount}
                onChange={handleInputChange}
                min="10000"
                max="1000000"
                step="10000"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>\$10,000</span>
                <span className="font-semibold text-purple-600">\${formData.coverage_amount.toLocaleString()}</span>
                <span>\$1,000,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deductible</label>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 1000, 2500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, deductible: amount }))}
                    className={\`py-2 rounded-lg border transition-colors \${
                      formData.deductible === amount
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                    }\`}
                  >
                    \${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Coverage Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
          </div>
        );

      case 3:
        if (formData.type === 'auto') {
          return (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Make *</label>
                  <input
                    type="text"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Model *</label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleInputChange}
                    placeholder="e.g., Camry"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Year *</label>
                <input
                  type="number"
                  name="vehicle_year"
                  value={formData.vehicle_year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2022"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>
          );
        }

        if (formData.type === 'home') {
          return (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address *</label>
                <input
                  type="text"
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type *</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                >
                  <option value="">Select type</option>
                  <option value="single_family">Single Family Home</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="apartment">Apartment</option>
                  <option value="mobile_home">Mobile Home</option>
                </select>
              </div>
            </div>
          );
        }

        if (formData.type === 'health' || formData.type === 'life') {
          const healthConditions = ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'Asthma', 'Cancer', 'None'];
          return (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pre-existing Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {healthConditions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => handleHealthConditionToggle(condition)}
                      className={\`px-3 py-1.5 rounded-full text-sm border transition-colors \${
                        formData.health_conditions.includes(condition)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                      }\`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="smoker"
                    checked={formData.smoker}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I am a smoker</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Your current occupation"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-xl mx-auto text-center text-gray-500 py-8">
            No additional information required for this insurance type.
          </div>
        );

      case 4:
        const selectedType = policyTypes.find((t) => t.id === formData.type);
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                {selectedType && (
                  <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${selectedType.color}\`}>
                    <selectedType.icon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{formData.type} Insurance Quote</h3>
                  <p className="text-sm text-gray-500">Review your information</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.first_name} {formData.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Coverage Amount</p>
                  <p className="font-medium text-gray-900 dark:text-white">\${formData.coverage_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deductible</p>
                  <p className="font-medium text-gray-900 dark:text-white">\${formData.deductible.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(formData.start_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">Disclaimer</p>
                  <p className="text-yellow-700 dark:text-yellow-500 mt-1">
                    This quote is an estimate based on the information provided. Final premium may vary after underwriting review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div
            className="absolute left-0 top-5 h-0.5 bg-purple-600 transition-all duration-300"
            style={{ width: \`\${(currentStep / (steps.length - 1)) * 100}%\` }}
          />
          {steps.map((step, index) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={\`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors \${
                  index < currentStep
                    ? 'bg-purple-600 text-white'
                    : index === currentStep
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }\`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className="mt-2 text-xs text-gray-500 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{steps[currentStep].title}</h2>
          <p className="text-gray-500 mt-1">{steps[currentStep].description}</p>
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Get Quote
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
