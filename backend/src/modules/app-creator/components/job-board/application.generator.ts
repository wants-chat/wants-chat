/**
 * Application Component Generator
 */

export interface ApplicationOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateApplicationForm(options: ApplicationOptions = {}): string {
  const { componentName = 'ApplicationForm', endpoint = '/applications' } = options;

  return `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Upload, User, Mail, Phone, FileText, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_url: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const submitApplication = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value as string);
      });
      formDataToSend.append('job_id', jobId || '');
      if (resumeFile) formDataToSend.append('resume', resumeFile);
      return api.post('${endpoint}', formDataToSend);
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      navigate('/applications');
    },
    onError: () => toast.error('Failed to submit application'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Apply for this Position</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" /> Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-1" /> Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Upload className="w-4 h-4 inline mr-1" /> Resume *
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (max 5MB)</p>
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" /> LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" /> Portfolio URL
            </label>
            <input
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              placeholder="https://..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-1" /> Cover Letter
          </label>
          <textarea
            value={formData.cover_letter}
            onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
            placeholder="Tell us why you're a great fit for this role..."
            rows={6}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitApplication.isPending}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitApplication.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateApplicationList(options: ApplicationOptions = {}): string {
  const { componentName = 'ApplicationList', endpoint = '/applications' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Briefcase, Clock, ChevronRight, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    reviewing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    offered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Applications</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {applications && applications.length > 0 ? (
          applications.map((app: any) => (
            <Link
              key={app.id}
              to={\`/applications/\${app.id}\`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {app.company_logo ? (
                  <img src={app.company_logo} alt={app.company_name} className="w-12 h-12 rounded-lg object-contain bg-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{app.job_title}</p>
                  <p className="text-sm text-gray-500">{app.company_name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${statusColors[app.status] || statusColors.submitted}\`}>
                  {app.status || 'Submitted'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No applications yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCandidateProfile(options: ApplicationOptions = {}): string {
  const { componentName = 'CandidateProfile', endpoint = '/profile' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, X, Edit2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
    onSuccess: (data) => setFormData(data),
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('${endpoint}', data),
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleSave = () => {
    if (formData) {
      updateProfile.mutate(formData);
    }
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill && formData) {
      setFormData({ ...formData, skills: [...(formData.skills || []), skill] });
    }
  };

  const removeSkill = (index: number) => {
    if (formData) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((_: any, i: number) => i !== index),
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Profile</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); setFormData(profile); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          {formData?.avatar_url ? (
            <img src={formData.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
          {isEditing ? (
            <input
              type="text"
              value={formData?.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-xl font-bold p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h3>
              {profile?.title && <p className="text-gray-500">{profile.title}</p>}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {(formData?.skills || []).map((skill: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                {skill}
                {isEditing && (
                  <button onClick={() => removeSkill(i)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <button
                onClick={addSkill}
                className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-500 hover:border-blue-600 hover:text-blue-600"
              >
                <Plus className="w-3 h-3" />
                Add Skill
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={formData?.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell employers about yourself..."
            rows={4}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
          />
        ) : profile?.bio && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">About</h4>
            <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
