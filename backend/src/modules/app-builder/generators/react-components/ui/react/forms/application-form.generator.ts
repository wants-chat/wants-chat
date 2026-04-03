import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateApplicationForm = (
  resolved: ResolvedComponent,
  variant: 'job' | 'university' | 'general' = 'job'
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
    return `/${dataSource || 'applications'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Upload, CheckCircle, User, Mail, Phone, Briefcase, GraduationCap, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    job: `
${commonImports}

interface ApplicationFormJobProps {
  ${dataName}?: any;
  entity?: string;
  onSuccess?: (data: any) => void;
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  cancelButtonLink?: string;
  mode?: 'create' | 'edit';
  [key: string]: any;
}

const ApplicationFormJob: React.FC<ApplicationFormJobProps> = ({
  ${dataName},
  entity = '${dataSource}',
  onSuccess,
  className,
  submitButtonText,
  cancelButtonText,
  cancelButtonLink,
  mode: modeProp
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = modeProp === 'edit' || !!id;
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    education: '',
    school: '',
    degree: '',
    graduationYear: '',
    company: '',
    position: '',
    yearsExperience: '',
    skills: [] as string[],
    resume: null as File | null,
    coverLetter: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode && id) {
        const response = await api.put<any>(\`/\${entity}/\${id}\`, data);
        return response?.data || response;
      } else {
        const response = await api.post<any>(\`/\${entity}\`, data);
        return response?.data || response;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
      if (onSuccess) onSuccess(data);
      setTimeout(() => {
        if (cancelButtonLink) {
          navigate(cancelButtonLink);
        } else if (!isEditMode) {
          setFormState({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            education: '',
            school: '',
            degree: '',
            graduationYear: '',
            company: '',
            position: '',
            yearsExperience: '',
            skills: [],
            resume: null,
            coverLetter: ''
          });
          setStatus('idle');
        }
      }, 2000);
    },
    onError: (err: any) => {
      setStatus('idle');
      const errorMessage = err.response?.data?.message || err.message || \`Failed to \${isEditMode ? 'update' : 'submit'} application\`;
      setErrors({ submit: errorMessage });
      console.error('Application submission error:', err);
    },
  });

  // Fetch existing data in edit mode
  const { data: existingData, isLoading: isFetching, error: fetchError } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<any>(\`/\${entity}/\${id}\`);
      return response.data || response;
    },
    enabled: isEditMode && !!id,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (existingData) {
      setFormState({
        firstName: existingData.firstName || '',
        lastName: existingData.lastName || '',
        email: existingData.email || '',
        phone: existingData.phone || '',
        address: existingData.address || '',
        city: existingData.city || '',
        state: existingData.state || '',
        zip: existingData.zip || '',
        education: existingData.education || '',
        school: existingData.school || '',
        degree: existingData.degree || '',
        graduationYear: existingData.graduationYear || '',
        company: existingData.company || '',
        position: existingData.position || '',
        yearsExperience: existingData.yearsExperience || '',
        skills: existingData.skills || [],
        resume: null,
        coverLetter: existingData.coverLetter || ''
      });
    }
  }, [existingData]);

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
  const educationTitle = ${getField('educationTitle')};
  const experienceTitle = ${getField('experienceTitle')};
  const skillsTitle = ${getField('skillsTitle')};
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
  const educationLabel = ${getField('educationLabel')};
  const educationLevels = ${getField('educationLevels')};
  const schoolLabel = ${getField('schoolLabel')};
  const schoolPlaceholder = ${getField('schoolPlaceholder')};
  const degreeLabel = ${getField('degreeLabel')};
  const degreePlaceholder = ${getField('degreePlaceholder')};
  const graduationYearLabel = ${getField('graduationYearLabel')};
  const companyLabel = ${getField('companyLabel')};
  const companyPlaceholder = ${getField('companyPlaceholder')};
  const positionLabel = ${getField('positionLabel')};
  const positionPlaceholder = ${getField('positionPlaceholder')};
  const yearsExperienceLabel = ${getField('yearsExperienceLabel')};
  const skillsLabel = ${getField('skillsLabel')};
  const skillsList = ${getField('skillsList')};
  const resumeLabel = ${getField('resumeLabel')};
  const coverLetterLabel = ${getField('coverLetterLabel')};
  const coverLetterPlaceholder = ${getField('coverLetterPlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormState(prev => ({ ...prev, resume: file }));
  };

  const toggleSkill = (skill: string) => {
    setFormState(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('loading');
    setErrors({});
    submitMutation.mutate(formState);
  };

  // Show loading state while fetching data in edit mode
  if (isFetching) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center", className)}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading application data...</p>
        </div>
      </div>
    );
  }

  // Show error if data fetch failed
  if (fetchError) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Failed to Load Data</h3>
            <p className="text-red-700 dark:text-red-300">{(fetchError as any)?.message || 'Could not load application data'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isEditMode ? 'Edit Application' : mainTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update the application details below' : mainDescription}
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
                {successTitle}
              </h4>
              <p className="text-lg text-green-700 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {personalInfoTitle}
                </h4>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <Label htmlFor="phone">{phoneLabel} *</Label>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {educationTitle}
                </h4>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="education">{educationLabel} *</Label>
                      <select
                        id="education"
                        name="education"
                        value={formState.education}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        {educationLevels.map((level: any) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="school">{schoolLabel} *</Label>
                      <Input
                        type="text"
                        id="school"
                        name="school"
                        value={formState.school}
                        onChange={handleChange}
                        required
                        className="mt-2 h-11"
                        placeholder={schoolPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="degree">{degreeLabel}</Label>
                      <Input
                        type="text"
                        id="degree"
                        name="degree"
                        value={formState.degree}
                        onChange={handleChange}
                        className="mt-2 h-11"
                        placeholder={degreePlaceholder}
                      />
                    </div>

                    <div>
                      <Label htmlFor="graduationYear">{graduationYearLabel}</Label>
                      <Input
                        type="text"
                        id="graduationYear"
                        name="graduationYear"
                        value={formState.graduationYear}
                        onChange={handleChange}
                        className="mt-2 h-11"
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {experienceTitle}
                </h4>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <Label htmlFor="position">{positionLabel}</Label>
                      <Input
                        type="text"
                        id="position"
                        name="position"
                        value={formState.position}
                        onChange={handleChange}
                        className="mt-2 h-11"
                        placeholder={positionPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="yearsExperience">{yearsExperienceLabel}</Label>
                    <Input
                      type="number"
                      id="yearsExperience"
                      name="yearsExperience"
                      value={formState.yearsExperience}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      className="mt-2 h-11"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Documents */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {skillsTitle}
                </h4>
                <div className="space-y-5">
                  <div>
                    <Label>{skillsLabel}</Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skillsList.map((skill: string) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={\`px-4 py-2 rounded-lg border-2 transition-all \${
                            formState.skills.includes(skill)
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                          }\`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="resume">{resumeLabel} *</Label>
                    <div className="mt-2">
                      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formState.resume ? formState.resume.name : 'Click to upload resume (PDF, DOC)'}
                        </span>
                        <input
                          type="file"
                          id="resume"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverLetter">{coverLetterLabel}</Label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formState.coverLetter}
                      onChange={handleChange}
                      rows={6}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={coverLetterPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {cancelButtonText && cancelButtonLink && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(cancelButtonLink)}
                    className="flex-1 h-12"
                    disabled={status === 'loading'}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className={\`\${cancelButtonText ? 'flex-1' : 'w-full'} h-12 bg-blue-600 hover:bg-blue-700\`}
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : sendingButton}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {submitButtonText || (isEditMode ? 'Update Application' : submitButton)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormJob;
    `,

    university: `
${commonImports}

interface ApplicationFormUniversityProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ApplicationFormUniversity: React.FC<ApplicationFormUniversityProps> = ({ ${dataName}, className }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    education: '',
    school: '',
    graduationYear: '',
    program: '',
    statement: '',
    resume: null as File | null
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('University application error:', err);
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

  const mainTitle = 'University Application';
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const educationLabel = ${getField('educationLabel')};
  const educationLevels = ${getField('educationLevels')};
  const schoolLabel = ${getField('schoolLabel')};
  const schoolPlaceholder = ${getField('schoolPlaceholder')};
  const graduationYearLabel = ${getField('graduationYearLabel')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormState(prev => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    submitMutation.mutate(formState);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mainTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Begin your academic journey with us
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
                {successTitle}
              </h4>
              <p className="text-lg text-green-700 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">{firstNameLabel} *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formState.firstName}
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
                    value={formState.lastName}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={lastNamePlaceholder}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <Label htmlFor="phone">{phoneLabel} *</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={phonePlaceholder}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="program">Desired Program *</Label>
                <Input
                  type="text"
                  id="program"
                  name="program"
                  value={formState.program}
                  onChange={handleChange}
                  required
                  className="mt-2 h-11"
                  placeholder="Computer Science, Engineering, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="education">{educationLabel} *</Label>
                  <select
                    id="education"
                    name="education"
                    value={formState.education}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {educationLevels.map((level: any) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="graduationYear">{graduationYearLabel} *</Label>
                  <Input
                    type="text"
                    id="graduationYear"
                    name="graduationYear"
                    value={formState.graduationYear}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="school">{schoolLabel} *</Label>
                <Input
                  type="text"
                  id="school"
                  name="school"
                  value={formState.school}
                  onChange={handleChange}
                  required
                  className="mt-2 h-11"
                  placeholder={schoolPlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="statement">Personal Statement *</Label>
                <textarea
                  id="statement"
                  name="statement"
                  value={formState.statement}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tell us about yourself, your goals, and why you want to join our university..."
                />
              </div>

              <div>
                <Label htmlFor="resume">Upload Transcript/CV *</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {formState.resume ? formState.resume.name : 'Click to upload document'}
                    </span>
                    <input
                      type="file"
                      id="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
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

export default ApplicationFormUniversity;
    `,

    general: `
${commonImports}

interface ApplicationFormGeneralProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ApplicationFormGeneral: React.FC<ApplicationFormGeneralProps> = ({ ${dataName}, className }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: '',
    attachments: [] as File[]
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setStatus('success');
    },
    onError: (err: any) => {
      setStatus('idle');
      console.error('General application error:', err);
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

  const mainTitle = 'General Application';
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const submitButton = ${getField('submitButton')};
  const sendingButton = ${getField('sendingButton')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    submitMutation.mutate(formState);
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
              Submit your general application
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="firstName">{firstNameLabel} *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formState.firstName}
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
                    value={formState.lastName}
                    onChange={handleChange}
                    required
                    className="mt-2 h-11"
                    placeholder={lastNamePlaceholder}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div>
                <Label htmlFor="description">Application Details *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Provide details about your application..."
                />
              </div>

              <div>
                <Label>Attachments</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Upload className="h-6 w-6 text-gray-400" />
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

              <div className="flex gap-4">
                {cancelButtonText && cancelButtonLink && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(cancelButtonLink)}
                    className="flex-1 h-12"
                    disabled={status === 'loading'}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className={\`\${cancelButtonText ? 'flex-1' : 'w-full'} h-12 bg-blue-600 hover:bg-blue-700\`}
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : sendingButton}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {submitButtonText || (isEditMode ? 'Update Application' : submitButton)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormGeneral;
    `
  };

  return variants[variant] || variants.job;
};
