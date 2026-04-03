import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useCreateInsurance, useUpdateInsurance, useInsuranceById } from '../../hooks/useServices';
import type { InsuranceFormData } from '../../types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ChevronLeft, 
  Security as Shield, 
  CreditCard, 
  CalendarMonth as Calendar, 
  Person as User, 
  Phone, 
  Business as Building, 
  Upload, 
  Save, 
  Warning as AlertCircle, 
  Check, 
  Description as FileText, 
  AttachMoney as DollarSign
} from '@mui/icons-material';
import { countryCodes } from '../../data/countryCodes';

interface CoverageItem {
  service: string;
  coverage: string;
  notes: string;
}

const AddInsurance: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const { user } = useAuth();
  const createInsuranceMutation = useCreateInsurance();
  const updateInsuranceMutation = useUpdateInsurance();
  const { data: existingInsurance, loading: insuranceLoading, error: insuranceError } = useInsuranceById(editId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cardFrontFile, setCardFrontFile] = useState<File | null>(null);
  const [cardBackFile, setCardBackFile] = useState<File | null>(null);
  const hasSetUserName = useRef(false);
  const hasPopulatedEditData = useRef(false);
  
  const [formData, setFormData] = useState<Omit<InsuranceFormData, 'cardFrontFile' | 'cardBackFile'>>({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    planType: '',
    planName: '',
    memberName: '',
    memberId: '',
    relationship: 'self',
    effectiveDate: '',
    expirationDate: '',
    copayPrimary: '',
    copaySpecialist: '',
    copayER: '',
    deductible: '',
    deductibleMet: '0',
    outOfPocketMax: '',
    outOfPocketMet: '0',
    insuranceCountryCode: '+1',
    insurancePhoneNumber: '',
    insuranceWebsite: '',
    employerName: '',
    notes: ''
  });

  const [coverageDetails, setCoverageDetails] = useState<CoverageItem[]>([
    { service: 'Preventive Care', coverage: '', notes: '' },
    { service: 'Primary Care Visit', coverage: '', notes: '' },
    { service: 'Specialist Visit', coverage: '', notes: '' },
    { service: 'Emergency Room', coverage: '', notes: '' },
    { service: 'Urgent Care', coverage: '', notes: '' },
    { service: 'Hospital Stay', coverage: '', notes: '' },
    { service: 'Surgery', coverage: '', notes: '' },
    { service: 'Mental Health', coverage: '', notes: '' },
    { service: 'Prescription Drugs', coverage: '', notes: '' },
    { service: 'Lab Work', coverage: '', notes: '' },
    { service: 'X-Ray/Imaging', coverage: '', notes: '' },
    { service: 'Physical Therapy', coverage: '', notes: '' }
  ]);

  const [errors, setErrors] = useState<Partial<InsuranceFormData>>({});
  const [insuranceCountryDropdownOpen, setInsuranceCountryDropdownOpen] = useState(false);
  const [insuranceCountrySearchTerm, setInsuranceCountrySearchTerm] = useState('');
  const insuranceDropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof InsuranceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const filteredInsuranceCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(insuranceCountrySearchTerm.toLowerCase()) ||
    country.code.includes(insuranceCountrySearchTerm)
  );

  const selectedInsuranceCountry = countryCodes.find(country => country.code === formData.insuranceCountryCode);

  // Pre-populate form when editing existing insurance
  useEffect(() => {
    if (isEditMode && existingInsurance && !hasPopulatedEditData.current) {
      // Parse phone number to extract country code and number
      let countryCode = '+1';
      let phoneNumber = '';

      if (existingInsurance.insurance_phone || existingInsurance.insurancePhone) {
        const phone = existingInsurance.insurance_phone || existingInsurance.insurancePhone || '';
        const phoneMatch = phone.match(/^(\+\d{1,3})\s*(.+)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1];
          phoneNumber = phoneMatch[2];
        } else {
          phoneNumber = phone;
        }
      }

      setFormData({
        provider: existingInsurance.provider || '',
        policyNumber: existingInsurance.policy_number || existingInsurance.policyNumber || '',
        groupNumber: existingInsurance.group_number || existingInsurance.groupNumber || '',
        planType: existingInsurance.plan_type || existingInsurance.planType || '',
        planName: existingInsurance.plan_name || existingInsurance.planName || '',
        memberName: user?.name || existingInsurance.member_name || existingInsurance.memberName || '',
        memberId: existingInsurance.member_id || existingInsurance.memberId || '',
        relationship: existingInsurance.relationship || 'self',
        effectiveDate: (existingInsurance.effective_date || existingInsurance.effectiveDate)
          ? new Date(existingInsurance.effective_date || existingInsurance.effectiveDate!).toISOString().split('T')[0]
          : '',
        expirationDate: (existingInsurance.expiration_date || existingInsurance.expirationDate)
          ? new Date(existingInsurance.expiration_date || existingInsurance.expirationDate!).toISOString().split('T')[0]
          : '',
        copayPrimary: existingInsurance.copay_primary || existingInsurance.copayPrimary || '',
        copaySpecialist: existingInsurance.copay_specialist || existingInsurance.copaySpecialist || '',
        copayER: existingInsurance.copay_er || existingInsurance.copayER || '',
        deductible: existingInsurance.deductible || '',
        deductibleMet: existingInsurance.deductible_met || existingInsurance.deductibleMet || '0',
        outOfPocketMax: existingInsurance.out_of_pocket_max || existingInsurance.outOfPocketMax || '',
        outOfPocketMet: existingInsurance.out_of_pocket_met || existingInsurance.outOfPocketMet || '0',
        insuranceCountryCode: countryCode,
        insurancePhoneNumber: phoneNumber,
        insuranceWebsite: existingInsurance.insurance_website || existingInsurance.insuranceWebsite || '',
        employerName: existingInsurance.employer_name || existingInsurance.employerName || '',
        notes: existingInsurance.notes || ''
      });

      // Pre-populate coverage details if they exist
      if (existingInsurance.coverage_details || existingInsurance.coverageDetails) {
        const apiCoverage = existingInsurance.coverage_details || existingInsurance.coverageDetails || [];
        const updatedCoverage = coverageDetails.map(item => {
          const existingItem = apiCoverage.find((c: any) => c.service === item.service);
          return existingItem ? { ...item, ...existingItem, notes: existingItem.notes || '' } : item;
        });
        setCoverageDetails(updatedCoverage);
      }

      hasPopulatedEditData.current = true;
    }
  }, [isEditMode, existingInsurance, coverageDetails, user?.name]);

  // Set user name in create mode (only once)
  useEffect(() => {
    if (user?.name && !isEditMode && !hasSetUserName.current) {
      handleInputChange('memberName', user.name);
      hasSetUserName.current = true;
    }
  }, [user?.name, isEditMode]);

  // Reset refs when edit mode changes
  useEffect(() => {
    hasSetUserName.current = false;
    hasPopulatedEditData.current = false;
  }, [isEditMode]);

  // Handle click outside to close insurance dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (insuranceDropdownRef.current && !insuranceDropdownRef.current.contains(event.target as Node)) {
        setInsuranceCountryDropdownOpen(false);
        setInsuranceCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCoverageChange = (index: number, field: keyof CoverageItem, value: string) => {
    const newCoverage = [...coverageDetails];
    newCoverage[index] = {
      ...newCoverage[index],
      [field]: value
    };
    setCoverageDetails(newCoverage);
  };

  const validateForm = () => {
    const newErrors: Partial<InsuranceFormData> = {};
    
    // Required field validations
    if (!formData.provider.trim()) {
      newErrors.provider = 'Insurance provider is required';
    }
    
    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required';
    } else if (formData.policyNumber.length < 3) {
      newErrors.policyNumber = 'Policy number must be at least 3 characters';
    }
    
    if (!formData.memberName.trim()) {
      newErrors.memberName = 'Member name is required';
    } else if (formData.memberName.length < 2) {
      newErrors.memberName = 'Member name must be at least 2 characters';
    }
    
    if (!formData.memberId.trim()) {
      newErrors.memberId = 'Member ID is required';
    } else if (formData.memberId.length < 3) {
      newErrors.memberId = 'Member ID must be at least 3 characters';
    }
    
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    } else {
      // Validate effective date is not in the future beyond reasonable limits (1 year)
      const effectiveDate = new Date(formData.effectiveDate);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      if (effectiveDate > oneYearFromNow) {
        newErrors.effectiveDate = 'Effective date cannot be more than 1 year in the future';
      }
    }
    
    // Date consistency validation
    if (formData.effectiveDate && formData.expirationDate) {
      const effectiveDate = new Date(formData.effectiveDate);
      const expirationDate = new Date(formData.expirationDate);
      
      if (expirationDate <= effectiveDate) {
        newErrors.expirationDate = 'Expiration date must be after effective date';
      }
    }
    
    // Phone number validation (if provided)
    if (formData.insurancePhoneNumber && formData.insurancePhoneNumber.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\.]{7,15}$/;
      if (!phoneRegex.test(formData.insurancePhoneNumber.replace(/\s/g, ''))) {
        newErrors.insurancePhoneNumber = 'Please enter a valid phone number (7-15 digits)';
      }
    }
    
    // Email validation (if provided)
    if (formData.insuranceWebsite && formData.insuranceWebsite.trim()) {
      const urlRegex = /^https?:\/\/.{3,}$/;
      if (!urlRegex.test(formData.insuranceWebsite)) {
        newErrors.insuranceWebsite = 'Please enter a valid website URL (e.g., https://example.com)';
      }
    }
    
    // Financial field validations (if provided)
    const validateCurrency = (value: string, fieldName: string) => {
      if (value && value.trim()) {
        // Remove currency symbols and spaces for validation
        const cleanValue = value.replace(/[\$,\s]/g, '');
        if (!/^\d+(\.\d{1,2})?$/.test(cleanValue)) {
          return `${fieldName} must be a valid currency amount (e.g., $100.00)`;
        }
        const numValue = parseFloat(cleanValue);
        if (numValue < 0) {
          return `${fieldName} cannot be negative`;
        }
        if (numValue > 999999) {
          return `${fieldName} seems unusually high, please verify`;
        }
      }
      return null;
    };
    
    const copayError = validateCurrency(formData.copayPrimary || '', 'Primary care copay');
    if (copayError) newErrors.copayPrimary = copayError;
    
    const specialistCopayError = validateCurrency(formData.copaySpecialist || '', 'Specialist copay');
    if (specialistCopayError) newErrors.copaySpecialist = specialistCopayError;
    
    const erCopayError = validateCurrency(formData.copayER || '', 'Emergency room copay');
    if (erCopayError) newErrors.copayER = erCopayError;
    
    const deductibleError = validateCurrency(formData.deductible || '', 'Deductible');
    if (deductibleError) newErrors.deductible = deductibleError;
    
    const deductibleMetError = validateCurrency(formData.deductibleMet || '', 'Deductible met');
    if (deductibleMetError) newErrors.deductibleMet = deductibleMetError;
    
    const outOfPocketMaxError = validateCurrency(formData.outOfPocketMax || '', 'Out-of-pocket maximum');
    if (outOfPocketMaxError) newErrors.outOfPocketMax = outOfPocketMaxError;
    
    const outOfPocketMetError = validateCurrency(formData.outOfPocketMet || '', 'Out-of-pocket met');
    if (outOfPocketMetError) newErrors.outOfPocketMet = outOfPocketMetError;
    
    // Cross-validation for financial fields
    if (formData.deductible && formData.deductibleMet) {
      const deductible = parseFloat(formData.deductible.replace(/[\$,\s]/g, ''));
      const deductibleMet = parseFloat(formData.deductibleMet.replace(/[\$,\s]/g, ''));
      
      if (deductibleMet > deductible) {
        newErrors.deductibleMet = 'Amount met cannot exceed total deductible';
      }
    }
    
    if (formData.outOfPocketMax && formData.outOfPocketMet) {
      const outOfPocketMax = parseFloat(formData.outOfPocketMax.replace(/[\$,\s]/g, ''));
      const outOfPocketMet = parseFloat(formData.outOfPocketMet.replace(/[\$,\s]/g, ''));
      
      if (outOfPocketMet > outOfPocketMax) {
        newErrors.outOfPocketMet = 'Amount met cannot exceed out-of-pocket maximum';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      if (side === 'front') {
        setCardFrontFile(file);
      } else {
        setCardBackFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setApiError(null);

      // Prepare data for API
      const insuranceData: InsuranceFormData = {
        ...formData,
        coverageDetails: coverageDetails.filter(item => item.coverage),
        cardFrontFile: cardFrontFile || undefined,
        cardBackFile: cardBackFile || undefined
      };

      if (isEditMode && editId) {
        await updateInsuranceMutation.mutate({ id: editId, data: insuranceData });
      } else {
        await createInsuranceMutation.mutate(insuranceData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/health/medical-records?tab=insurance');
      }, 2000);
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} insurance record:`, error);
      setApiError(error?.message || `Failed to ${isEditMode ? 'update' : 'save'} insurance information. Please try again.`);
    }
  };

  const handleCancel = () => {
    navigate('/health/medical-records?tab=insurance');
  };

  const providers = [
    'Blue Cross Blue Shield',
    'UnitedHealthcare',
    'Kaiser Permanente',
    'Aetna',
    'Cigna',
    'Humana',
    'Anthem',
    'Centene',
    'Molina Healthcare',
    'WellCare',
    'Medicare',
    'Medicaid',
    'Tricare',
    'Other'
  ];

  const planTypes = [
    'PPO (Preferred Provider Organization)',
    'HMO (Health Maintenance Organization)',
    'EPO (Exclusive Provider Organization)',
    'POS (Point of Service)',
    'HDHP (High Deductible Health Plan)',
    'Medicare Advantage',
    'Medicare Supplement',
    'Medicaid',
    'Catastrophic',
    'Other'
  ];

  const relationships = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'other', label: 'Other' }
  ];

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medical Records', href: '/health/medical-records' },
    { label: isEditMode ? 'Edit Insurance' : 'Add Insurance', icon: Shield }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Loading state for edit mode */}
        {isEditMode && insuranceLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Loading insurance information...</p>
            </div>
          </div>
        )}

        {/* Error state for edit mode */}
        {isEditMode && insuranceError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-100">Error Loading Insurance</h4>
                <p className="text-sm text-red-200">
                  {String(insuranceError) || 'Failed to load insurance information. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-sm font-semibold text-green-100">Success!</h4>
                <p className="text-sm text-green-200">
                  Insurance information has been {isEditMode ? 'updated' : 'added'} successfully. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-red-100">Error</h4>
                <p className="text-sm text-red-200">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Only show form if not loading in edit mode */}
        {(!isEditMode || !insuranceLoading) && !insuranceError && (
          <>
            {/* Insurance Card Upload */}
            <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <Upload className="h-6 w-6 text-primary" />
              Insurance Card Upload
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Upload clear photos of both sides of your insurance card for quick reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-teal-500/30 rounded-xl p-8 bg-teal-500/10 hover:bg-teal-500/15 transition-colors">
                <div className="text-center">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-base font-semibold text-white mb-3">
                    Front of Insurance Card
                  </p>
                  <p className="text-sm text-white/60 mb-4">
                    Member information and primary details
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCardUpload(e, 'front')}
                    className="hidden"
                    id="card-front-upload"
                  />
                  <Label htmlFor="card-front-upload">
                    <Button 
                      className="cursor-pointer h-12 px-6 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:border-teal-500 hover:bg-teal-500/10 font-medium"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {cardFrontFile ? 'Change Front Image' : 'Upload Front Image'}
                    </Button>
                  </Label>
                  {cardFrontFile && (
                    <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                      <p className="text-sm text-green-300 font-medium">{cardFrontFile.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-teal-500/30 rounded-xl p-8 bg-teal-500/10 hover:bg-teal-500/15 transition-colors">
                <div className="text-center">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-base font-semibold text-white mb-3">
                    Back of Insurance Card
                  </p>
                  <p className="text-sm text-white/60 mb-4">
                    Contact information and additional details
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCardUpload(e, 'back')}
                    className="hidden"
                    id="card-back-upload"
                  />
                  <Label htmlFor="card-back-upload">
                    <Button 
                      className="cursor-pointer h-12 px-6 rounded-xl border-2 border-teal-500/30 bg-transparent text-teal-400 hover:border-teal-500 hover:bg-teal-500/10 font-medium"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {cardBackFile ? 'Change Back Image' : 'Upload Back Image'}
                    </Button>
                  </Label>
                  {cardBackFile && (
                    <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                      <p className="text-sm text-green-300 font-medium">{cardBackFile.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <Shield className="h-6 w-6 text-primary" />
              Insurance Information
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Enter your complete insurance plan details and member information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-sm font-semibold text-white/80">Insurance Provider *</Label>
                  <Select value={formData.provider} onValueChange={(value) => handleInputChange('provider', value)}>
                    <SelectTrigger id="provider" className={`h-12 rounded-xl bg-white/10 border-white/20 text-white ${errors.provider ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select your insurance provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider} className="text-white hover:bg-white/10">{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provider && <p className="text-sm text-red-500">{errors.provider}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-semibold text-white/80">Policy Number *</Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                    placeholder="Enter your policy number (e.g., ABC123456789)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.policyNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.policyNumber && <p className="text-sm text-red-500">{errors.policyNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupNumber" className="text-sm font-semibold text-white/80">Group Number</Label>
                  <Input
                    id="groupNumber"
                    value={formData.groupNumber}
                    onChange={(e) => handleInputChange('groupNumber', e.target.value)}
                    placeholder="Enter group number (e.g., GRP987654)"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planType" className="text-sm font-semibold text-white/80">Plan Type</Label>
                  <Select value={formData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
                    <SelectTrigger id="planType" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select your plan type" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      {planTypes.map(type => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-white/10">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planName" className="text-sm font-semibold text-white/80">Plan Name</Label>
                  <Input
                    id="planName"
                    value={formData.planName}
                    onChange={(e) => handleInputChange('planName', e.target.value)}
                    placeholder="Enter plan name (e.g., Gold Plus PPO)"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName" className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    Employer/Organization
                  </Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    placeholder="Enter company/organization name (if through employer)"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName" className="text-sm font-semibold text-white/80">Member Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-primary" />
                    <Input
                      id="memberName"
                      value={formData.memberName}
                      onChange={(e) => handleInputChange('memberName', e.target.value)}
                      placeholder="Enter full member name"
                      disabled={!!user?.name}
                      className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${!!user?.name ? 'bg-white/5 text-white/50 cursor-not-allowed' : ''} ${errors.memberName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {!!user?.name && (
                    <p className="text-xs text-white/50">Name is automatically pulled from your account</p>
                  )}
                  {errors.memberName && <p className="text-sm text-red-500">{errors.memberName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memberId" className="text-sm font-semibold text-white/80">Member ID *</Label>
                  <Input
                    id="memberId"
                    value={formData.memberId}
                    onChange={(e) => handleInputChange('memberId', e.target.value)}
                    placeholder="Enter member ID (e.g., M123456789)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.memberId ? 'border-red-500' : ''}`}
                  />
                  {errors.memberId && <p className="text-sm text-red-500">{errors.memberId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-sm font-semibold text-white/80">Relationship to Policyholder</Label>
                  <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                    <SelectTrigger id="relationship" className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border border-teal-400/30">
                      {relationships.map(rel => (
                        <SelectItem key={rel.value} value={rel.value} className="text-white hover:bg-white/10">{rel.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate" className="text-sm font-semibold text-white/80">Effective Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-primary" />
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.effectiveDate ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate" className="text-sm font-semibold text-white/80">Expiration Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-primary" />
                      <Input
                        id="expirationDate"
                        type="date"
                        value={formData.expirationDate}
                        onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.expirationDate ? 'border-red-500' : ''}`}
                        min={formData.effectiveDate}
                      />
                    </div>
                    {errors.expirationDate && <p className="text-sm text-red-500">{errors.expirationDate}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurancePhoneNumber" className="text-sm font-semibold text-white/80">Insurance Phone</Label>
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative w-32" ref={insuranceDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setInsuranceCountryDropdownOpen(!insuranceCountryDropdownOpen)}
                        className="w-full px-3 py-3 text-left border border-white/20 rounded-xl bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500 h-12"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{selectedInsuranceCountry?.flag}</span>
                          <span className="text-sm text-white/80">{selectedInsuranceCountry?.code}</span>
                        </div>
                      </button>
                      
                      {insuranceCountryDropdownOpen && (
                        <div className="absolute z-50 w-80 mt-1 bg-teal-800/90 border border-teal-400/30 rounded-xl shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2 border-b border-white/10">
                            <Input
                              type="text"
                              placeholder="Search country..."
                              value={insuranceCountrySearchTerm}
                              onChange={(e) => setInsuranceCountrySearchTerm(e.target.value)}
                              className="w-full text-sm h-10 rounded-lg"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredInsuranceCountries.map((country) => (
                              <button
                                key={country.iso}
                                type="button"
                                onClick={() => {
                                  handleInputChange('insuranceCountryCode', country.code);
                                  setInsuranceCountryDropdownOpen(false);
                                  setInsuranceCountrySearchTerm('');
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-3"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm text-white">{country.name}</span>
                                <span className="text-sm text-white/50 ml-auto">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-primary" />
                      <Input
                        id="insurancePhoneNumber"
                        type="tel"
                        value={formData.insurancePhoneNumber}
                        onChange={(e) => handleInputChange('insurancePhoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                        className={`pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.insurancePhoneNumber ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                  {errors.insurancePhoneNumber && <p className="text-sm text-red-500">{errors.insurancePhoneNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceWebsite" className="text-sm font-semibold text-white/80">Insurance Website</Label>
                  <Input
                    id="insuranceWebsite"
                    type="url"
                    value={formData.insuranceWebsite}
                    onChange={(e) => handleInputChange('insuranceWebsite', e.target.value)}
                    placeholder="Enter insurance company website URL"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.insuranceWebsite ? 'border-red-500' : ''}`}
                  />
                  {errors.insuranceWebsite && <p className="text-sm text-red-500">{errors.insuranceWebsite}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <DollarSign className="h-6 w-6 text-primary" />
              Financial Information
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Enter copayments, deductibles, and out-of-pocket maximum information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Copayments
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="copayPrimary" className="text-sm font-semibold text-white/80">Primary Care</Label>
                  <Input
                    id="copayPrimary"
                    value={formData.copayPrimary}
                    onChange={(e) => handleInputChange('copayPrimary', e.target.value)}
                    placeholder="Enter amount (e.g., $20)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.copayPrimary ? 'border-red-500' : ''}`}
                  />
                  {errors.copayPrimary && <p className="text-sm text-red-500">{errors.copayPrimary}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copaySpecialist" className="text-sm font-semibold text-white/80">Specialist</Label>
                  <Input
                    id="copaySpecialist"
                    value={formData.copaySpecialist}
                    onChange={(e) => handleInputChange('copaySpecialist', e.target.value)}
                    placeholder="Enter amount (e.g., $40)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.copaySpecialist ? 'border-red-500' : ''}`}
                  />
                  {errors.copaySpecialist && <p className="text-sm text-red-500">{errors.copaySpecialist}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copayER" className="text-sm font-semibold text-white/80">Emergency Room</Label>
                  <Input
                    id="copayER"
                    value={formData.copayER}
                    onChange={(e) => handleInputChange('copayER', e.target.value)}
                    placeholder="Enter amount (e.g., $250)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.copayER ? 'border-red-500' : ''}`}
                  />
                  {errors.copayER && <p className="text-sm text-red-500">{errors.copayER}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Deductible
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="deductible" className="text-sm font-semibold text-white/80">Annual Deductible</Label>
                  <Input
                    id="deductible"
                    value={formData.deductible}
                    onChange={(e) => handleInputChange('deductible', e.target.value)}
                    placeholder="Enter amount (e.g., $1,500)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.deductible ? 'border-red-500' : ''}`}
                  />
                  {errors.deductible && <p className="text-sm text-red-500">{errors.deductible}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductibleMet" className="text-sm font-semibold text-white/80">Amount Met</Label>
                  <Input
                    id="deductibleMet"
                    value={formData.deductibleMet}
                    onChange={(e) => handleInputChange('deductibleMet', e.target.value)}
                    placeholder="Enter amount met (e.g., $0)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.deductibleMet ? 'border-red-500' : ''}`}
                  />
                  {errors.deductibleMet && <p className="text-sm text-red-500">{errors.deductibleMet}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Out-of-Pocket
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="outOfPocketMax" className="text-sm font-semibold text-white/80">Annual Maximum</Label>
                  <Input
                    id="outOfPocketMax"
                    value={formData.outOfPocketMax}
                    onChange={(e) => handleInputChange('outOfPocketMax', e.target.value)}
                    placeholder="Enter amount (e.g., $5,000)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.outOfPocketMax ? 'border-red-500' : ''}`}
                  />
                  {errors.outOfPocketMax && <p className="text-sm text-red-500">{errors.outOfPocketMax}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outOfPocketMet" className="text-sm font-semibold text-white/80">Amount Met</Label>
                  <Input
                    id="outOfPocketMet"
                    value={formData.outOfPocketMet}
                    onChange={(e) => handleInputChange('outOfPocketMet', e.target.value)}
                    placeholder="Enter amount met (e.g., $0)"
                    className={`h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 ${errors.outOfPocketMet ? 'border-red-500' : ''}`}
                  />
                  {errors.outOfPocketMet && <p className="text-sm text-red-500">{errors.outOfPocketMet}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Details */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <FileText className="h-6 w-6 text-primary" />
              Coverage Details
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Specify coverage percentages and benefits for different medical services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coverageDetails.map((item, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm font-semibold text-white/80">{item.service}</Label>
                  <Input
                    value={item.coverage}
                    onChange={(e) => handleCoverageChange(index, 'coverage', e.target.value)}
                    placeholder="Enter coverage (e.g., 80% after deductible)"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <FileText className="h-6 w-6 text-primary" />
              Additional Notes
            </CardTitle>
            <CardDescription className="text-base text-white/60">
              Add any special coverage details, limitations, or important information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional information about your insurance coverage, special benefits, limitations, or important notes..."
              className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={5}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center gap-4">
          <Button
            onClick={handleCancel}
            className="h-12 px-6 rounded-xl font-medium border-2 border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:border-white/40 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createInsuranceMutation.loading || updateInsuranceMutation.loading || (isEditMode && insuranceLoading)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(createInsuranceMutation.loading || updateInsuranceMutation.loading) ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {isEditMode ? 'Updating Insurance...' : 'Saving Insurance...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update Insurance Information' : 'Save Insurance Information'}
              </>
            )}
          </Button>
        </div>

            <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 mt-0.5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-100">Privacy Notice</h4>
                  <p className="text-sm text-amber-200 mt-1">
                    Your insurance information is stored securely and locally on your device. 
                    Always verify coverage details with your insurance provider before receiving medical services.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AddInsurance;