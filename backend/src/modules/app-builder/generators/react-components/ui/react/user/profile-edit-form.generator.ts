import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProfileEditForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'fullPage' = 'inline'
) => {
  const dataSource = resolved.dataSource || resolved.data?.entity;
  const fields = resolved.fieldMappings || [];

  // Check if this is a candidate profile form
  const isCandidateProfile = dataSource === 'candidate_profiles';

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
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

  // Generate field definitions from catalog fields
  const generateFieldDefinitions = () => {
    const fieldDefs = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at')
      .map((f: any) => {
        const fieldName = f.targetField;
        const label = f.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        let type = 'text';
        if (f.type === 'textarea' || fieldName === 'summary' || fieldName === 'bio' || fieldName === 'description') {
          type = 'textarea';
        } else if (f.type === 'number' || fieldName.includes('salary') || fieldName.includes('years')) {
          type = 'number';
        } else if (f.type === 'boolean' || fieldName.startsWith('is_')) {
          type = 'checkbox';
        } else if (f.type === 'select') {
          type = 'select';
        } else if (f.type === 'url' || fieldName.includes('url') || fieldName.includes('website') || fieldName.includes('linkedin') || fieldName.includes('github')) {
          type = 'url';
        } else if (f.type === 'phone' || fieldName === 'phone') {
          type = 'tel';
        } else if (f.type === 'email' || fieldName === 'email') {
          type = 'email';
        } else if (f.type === 'file' || f.type === 'image' || fieldName.includes('avatar') || fieldName.includes('photo') || fieldName.includes('image')) {
          type = 'file';
        }
        return `{ name: '${fieldName}', label: '${label}', type: '${type}', required: ${f.required || false} }`;
      });
    return `[${fieldDefs.join(',\n    ')}]`;
  };

  // Generate initial form state from fields
  const generateInitialState = () => {
    const stateFields = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at')
      .map((f: any) => {
        const fieldName = f.targetField;
        if (f.type === 'boolean' || fieldName.startsWith('is_')) {
          return `${fieldName}: data?.${fieldName} ?? false`;
        } else if (f.type === 'number' || fieldName.includes('salary') || fieldName.includes('years')) {
          return `${fieldName}: data?.${fieldName} ?? ''`;
        }
        return `${fieldName}: data?.${fieldName} || ''`;
      });
    return stateFields.join(',\n      ');
  };

  // For candidate profiles, generate a fully functional form
  if (isCandidateProfile) {
    return `
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, User, Briefcase, MapPin, Globe, Phone, Mail, Linkedin, Github, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProfileEditFormProps {
  [key: string]: any;
  className?: string;
}

export default function ProfileEditForm({ className }: ProfileEditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['candidate_profile'],
    queryFn: async () => {
      const response = await api.get<any>('/candidate_profiles/me');
      return response.data || response;
    },
  });

  const data = profileData;

  // Form state
  const [formData, setFormData] = useState({
    ${generateInitialState()}
  });

  // Update form when data loads
  useEffect(() => {
    if (data) {
      setFormData({
        ${generateInitialState()}
      });
    }
  }, [data]);

  const [isSaving, setIsSaving] = useState(false);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await api.put('/candidate_profiles/me', profileData);
      return response;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['candidate_profile'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldDefinitions = ${generateFieldDefinitions()};

  // Group fields by category
  const personalFields = fieldDefinitions.filter((f: any) =>
    ['first_name', 'last_name', 'headline', 'summary', 'location'].includes(f.name)
  );
  const contactFields = fieldDefinitions.filter((f: any) =>
    ['phone', 'website', 'linkedin_url', 'github_url'].includes(f.name)
  );
  const preferenceFields = fieldDefinitions.filter((f: any) =>
    ['skills', 'experience_years', 'desired_job_type', 'desired_salary_min', 'desired_remote_type'].includes(f.name)
  );
  const visibilityFields = fieldDefinitions.filter((f: any) =>
    ['is_available', 'is_public'].includes(f.name)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Unable to load profile</p>
        <Button variant="outline" onClick={() => navigate('/candidate/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const renderField = (field: any) => {
    const value = formData[field.name as keyof typeof formData];

    if (field.type === 'checkbox') {
      return (
        <div key={field.name} className="flex items-center justify-between py-3">
          <div>
            <Label htmlFor={field.name} className="text-gray-700 dark:text-gray-300">
              {field.label}
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {field.name === 'is_available' ? 'Show that you are open to opportunities' : 'Make your profile visible to employers'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            onClick={() => handleChange(field.name, !value)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              value ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                value ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-gray-700 dark:text-gray-300">
            {field.label}
          </Label>
          <Textarea
            id={field.name}
            value={value as string || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={\`Enter your \${field.label.toLowerCase()}\`}
            rows={4}
            className="dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      );
    }

    const getIcon = () => {
      if (field.name.includes('linkedin')) return <Linkedin className="h-4 w-4 text-gray-400" />;
      if (field.name.includes('github')) return <Github className="h-4 w-4 text-gray-400" />;
      if (field.name.includes('website') || field.type === 'url') return <Globe className="h-4 w-4 text-gray-400" />;
      if (field.name === 'phone' || field.type === 'tel') return <Phone className="h-4 w-4 text-gray-400" />;
      if (field.name === 'email' || field.type === 'email') return <Mail className="h-4 w-4 text-gray-400" />;
      if (field.name === 'location') return <MapPin className="h-4 w-4 text-gray-400" />;
      return null;
    };

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-gray-700 dark:text-gray-300">
          {field.label}
        </Label>
        <div className="relative">
          {getIcon() && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {getIcon()}
            </div>
          )}
          <Input
            id={field.name}
            type={field.type === 'number' ? 'number' : field.type}
            value={value as string || ''}
            onChange={(e) => handleChange(field.name, field.type === 'number' ? e.target.value : e.target.value)}
            placeholder={\`Enter your \${field.label.toLowerCase()}\`}
            className={cn(
              "dark:bg-gray-800 dark:border-gray-700",
              getIcon() && "pl-10"
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/candidate/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalFields.filter((f: any) => f.type !== 'textarea').map(renderField)}
            </div>
            {personalFields.filter((f: any) => f.type === 'textarea').map(renderField)}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Globe className="h-5 w-5" />
              Contact & Social Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactFields.map(renderField)}
            </div>
          </CardContent>
        </Card>

        {/* Job Preferences */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Briefcase className="h-5 w-5" />
              Job Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferenceFields.filter((f: any) => f.type !== 'textarea').map(renderField)}
            </div>
            {preferenceFields.filter((f: any) => f.type === 'textarea').map(renderField)}
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Visibility Settings</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
            {visibilityFields.map(renderField)}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {(isSaving || updateMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
`;
  }

  // Default generic form for other profile types - dynamically generates fields from catalog

  // Get routes from catalog actions (fully dynamic)
  const fetchAction = resolved.actions?.find((a: any) => a.type === 'fetch' && a.trigger === 'onLoad');
  const updateAction = resolved.actions?.find((a: any) => a.type === 'update' && a.trigger === 'onSubmit');
  const fetchRoute = fetchAction?.serverFunction?.route?.replace('/api/v1/', '/') || `/${dataSource}`;
  const updateRoute = updateAction?.serverFunction?.route?.replace('/api/v1/', '/') || `/${dataSource}`;
  const updateMethod = updateAction?.serverFunction?.httpMethod?.toLowerCase() || 'put';

  // Generate form fields JSX from catalog fields
  const generateFormFields = () => {
    const formFields = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at')
      .map((f: any) => {
        const fieldName = f.targetField;
        const label = f.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

        // Determine input type
        if (f.type === 'textarea' || fieldName === 'bio' || fieldName === 'description' || fieldName === 'summary') {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <Textarea
              id="${fieldName}"
              value={formData.${fieldName} || ''}
              onChange={(e) => handleChange('${fieldName}', e.target.value)}
              placeholder="Enter your ${label.toLowerCase()}"
              rows={4}
            />
          </div>`;
        } else if (f.type === 'boolean' || fieldName.startsWith('is_') || fieldName.endsWith('_enabled') || fieldName.endsWith('_subscribed')) {
          return `          <div className="flex items-center justify-between py-2">
            <Label htmlFor="${fieldName}" className="flex-1">${label}</Label>
            <input
              type="checkbox"
              id="${fieldName}"
              checked={!!formData.${fieldName}}
              onChange={(e) => handleChange('${fieldName}', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>`;
        } else if (f.type === 'select' && f.options) {
          const optionsStr = f.options.map((opt: any) =>
            `              <option value="${opt.value}">${opt.label}</option>`
          ).join('\n');
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <select
              id="${fieldName}"
              value={formData.${fieldName} || ''}
              onChange={(e) => handleChange('${fieldName}', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select ${label}</option>
${optionsStr}
            </select>
          </div>`;
        } else if (f.type === 'date' || fieldName.includes('date') || fieldName.includes('_of_birth')) {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <Input
              id="${fieldName}"
              type="date"
              value={formData.${fieldName} || ''}
              onChange={(e) => handleChange('${fieldName}', e.target.value)}
            />
          </div>`;
        } else if (f.type === 'file' || f.type === 'image' || fieldName.includes('avatar') || fieldName.includes('image') || fieldName.includes('photo')) {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            {/* Current avatar preview */}
            {formData.${fieldName} && (
              <div className="mb-3">
                <img
                  src={formData.${fieldName}}
                  alt="Current ${label}"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <Input
                id="${fieldName}"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const formDataUpload = new FormData();
                      formDataUpload.append('file', file);
                      formDataUpload.append('bucket', 'avatars');
                      formDataUpload.append('folder', 'profiles');
                      const response = await api.post('/storage/upload', formDataUpload) as { data?: { url?: string } };
                      if (response.data?.url) {
                        handleChange('${fieldName}', response.data.url);
                        toast.success('Image uploaded successfully');
                      }
                    } catch (error) {
                      toast.error('Failed to upload image');
                    }
                  }
                }}
                className="flex-1"
              />
              {formData.${fieldName} && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChange('${fieldName}', '')}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>`;
        } else if (fieldName === 'email') {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <Input
              id="${fieldName}"
              type="email"
              value={formData.${fieldName} || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>`;
        } else if (f.type === 'phone' || fieldName === 'phone') {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <Input
              id="${fieldName}"
              type="tel"
              value={formData.${fieldName} || ''}
              onChange={(e) => handleChange('${fieldName}', e.target.value)}
              placeholder="Enter your ${label.toLowerCase()}"
            />
          </div>`;
        } else {
          return `          <div>
            <Label htmlFor="${fieldName}">${label}</Label>
            <Input
              id="${fieldName}"
              value={formData.${fieldName} || ''}
              onChange={(e) => handleChange('${fieldName}', e.target.value)}
              placeholder="Enter your ${label.toLowerCase()}"
            />
          </div>`;
        }
      });
    return formFields.join('\n');
  };

  // Generate initial state for form from catalog fields
  const generateFormInitialState = () => {
    const stateFields = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at')
      .map((f: any) => {
        const fieldName = f.targetField;
        if (f.type === 'boolean' || fieldName.startsWith('is_') || fieldName.endsWith('_enabled') || fieldName.endsWith('_subscribed')) {
          return `    ${fieldName}: false`;
        }
        return `    ${fieldName}: ''`;
      });
    return stateFields.join(',\n');
  };

  // Generate submit data from form fields
  const generateSubmitData = () => {
    const submitFields = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at' && f.targetField !== 'email')
      .map((f: any) => `        ${f.targetField}: formData.${f.targetField}`);
    return submitFields.join(',\n');
  };

  // Generate profile data mapping
  const generateProfileMapping = () => {
    const mappings = fields
      .filter((f: any) => f.targetField !== 'id' && f.targetField !== 'user_id' && f.targetField !== 'created_at' && f.targetField !== 'updated_at')
      .map((f: any) => `            ${f.targetField}: profile.${f.targetField} || prev.${f.targetField}`);
    return mappings.join(',\n');
  };

  return `
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProfileEditFormProps {
  [key: string]: any;
  className?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export default function ProfileEditForm({ className, onSave, onCancel }: ProfileEditFormProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
${generateFormInitialState()}
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch profile data when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        // Fetch profile data from catalog-defined route
        const response: any = await api.get('${fetchRoute}');
        if (response.data || response) {
          const profile = response.data || response;
          setFormData(prev => ({
${generateProfileMapping()}
          }));
        }
      } catch (error) {
        console.log('No profile found, using defaults');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update profile via catalog-defined route
      await api.${updateMethod}('${updateRoute}', {
${generateSubmitData()}
      });

      setShowSuccess(true);
      setHasChanges(false);
      toast.success('Profile updated successfully!');

      if (onSave) {
        onSave(formData);
      }
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6", className)}>
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-300">Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
${generateFormFields()}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
`;
};
