import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateJobDetailPage = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource;

  // Get routes from catalog actions (fully dynamic)
  const checkApplicationAction = resolved.actions?.find((a: any) => a.id === 'check-application' || a.type === 'fetch');
  const applyJobAction = resolved.actions?.find((a: any) => a.id === 'apply-job' || (a.type === 'create' && a.trigger === 'onSubmit'));

  // Extract routes - replace /api/v1/ prefix for frontend api client
  const checkApplicationRoute = checkApplicationAction?.serverFunction?.route?.replace('/api/v1/', '/') || '/applications/check';
  const applyJobRoute = applyJobAction?.serverFunction?.route?.replace('/api/v1/', '/') || '/applications';

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

  return `
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  Users,
  Eye,
  Globe,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Upload,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  company_id?: string;
  company_name?: string;
  company?: {
    id: string;
    name: string;
    logo_url?: string;
    website?: string;
    location?: string;
    description?: string;
    size?: string;
  };
  description: string;
  requirements?: string;
  responsibilities?: string;
  location: string;
  job_type: string;
  remote_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  category?: string;
  skills?: string[] | string;
  benefits?: string[] | string;
  published_at?: string;
  created_at?: string;
  deadline?: string;
  views_count?: number;
  applications_count?: number;
  status?: string;
}

interface JobDetailPageProps {
  [key: string]: any;
  className?: string;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ ${dataName}, className }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Check if we have valid job data passed as prop
  const hasValidPropData = ${dataName} && !Array.isArray(${dataName}) && ${dataName}?.id;

  // Fetch job data - always fetch if no valid prop data
  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<any>(\`/jobs/\${id}\`).then(res => res.data),
    enabled: !!id && !hasValidPropData,
  });

  // Check if user has already applied to this job
  const { data: myApplicationsData, isLoading: isCheckingApplication } = useQuery({
    queryKey: ['my-applications-for-job', id],
    queryFn: () => api.get<{ success: boolean; data: any }>(\`${checkApplicationRoute.replace(':jobId', '')}\${id}\`),
    enabled: !!id,
    retry: false,
  });

  // Check if user already applied to this job (API returns single record or null)
  const existingApplication = myApplicationsData?.data || null;
  const hasAlreadyApplied = !!existingApplication;

  // Apply mutation - route from catalog
  const applyMutation = useMutation({
    mutationFn: async (applicationData: FormData) => {
      // Don't set Content-Type manually - axios/fetch will set it with boundary automatically
      return api.post('${applyJobRoute}', applicationData);
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setIsApplyModalOpen(false);
      resetForm();
      // Invalidate applications query to refresh the "Already Applied" state
      queryClient.invalidateQueries({ queryKey: ['my-applications-for-job', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit application');
    }
  });

  const resetForm = () => {
    setCoverLetter('');
    setResumeFile(null);
    setLinkedinUrl('');
    setPortfolioUrl('');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('job_id', job.id);
    formData.append('cover_letter', coverLetter);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    if (linkedinUrl) {
      formData.append('linkedin_url', linkedinUrl);
    }
    if (portfolioUrl) {
      formData.append('portfolio_url', portfolioUrl);
    }

    applyMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }
      setResumeFile(file);
    }
  };

  // Extract job data - handle both array and object props, prefer API response
  const extractedPropData = Array.isArray(${dataName}) ? null : ${dataName};
  const job: Job = jobData?.data || jobData || extractedPropData || {};

  const formatSalary = (min?: number, max?: number, currency?: string, period?: string) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const symbol = curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr;
    const periodLabel = period ? \`/\${period}\` : '/year';

    if (min && max) {
      return \`\${symbol}\${(min).toLocaleString()} - \${symbol}\${(max).toLocaleString()}\${periodLabel}\`;
    }
    if (min) return \`From \${symbol}\${(min).toLocaleString()}\${periodLabel}\`;
    if (max) return \`Up to \${symbol}\${(max).toLocaleString()}\${periodLabel}\`;
    return null;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJobTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'contract': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'freelance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'internship': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const parseArrayField = (field: string[] | string | undefined): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [field];
      } catch {
        return field.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job?.id) {
    return (
      <div className={cn("py-12", className)}>
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Job not found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const companyName = job.company?.name || job.company_name || 'Company';
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
  const skills = parseArrayField(job.skills);
  const benefits = parseArrayField(job.benefits);

  return (
    <>
      <div className={cn("max-w-6xl mx-auto py-8 px-4", className)}>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {job.company?.logo_url ? (
                      <img
                        src={job.company.logo_url}
                        alt={companyName}
                        className="w-20 h-20 rounded-xl object-contain bg-gray-50 dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <Building2 className="h-5 w-5 mr-2" />
                      <span className="font-medium">{companyName}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn("px-3 py-1", getJobTypeBadgeColor(job.job_type))}>
                        {job.job_type?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                      </Badge>
                      {job.remote_type && job.remote_type !== 'on-site' && (
                        <Badge className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                          <Globe className="h-3 w-3 mr-1" />
                          {job.remote_type?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                      {job.experience_level && (
                        <Badge className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {job.experience_level?.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm">{job.location || 'Not specified'}</span>
                  </div>
                  {salary && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{salary}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm">{formatDate(job.published_at || job.created_at)}</span>
                  </div>
                  {job.views_count !== undefined && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Eye className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm">{job.views_count} views</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description || 'No description provided.' }}
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardContent className="p-6">
                {hasAlreadyApplied ? (
                  <>
                    <div className="w-full mb-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold py-4 px-4 rounded-lg text-center flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Already Applied
                    </div>
                    {existingApplication?.status && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: <span className="font-medium capitalize">{existingApplication.status}</span>
                        </p>
                        {existingApplication.applied_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Applied on {formatDate(existingApplication.applied_at)}
                          </p>
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate('/candidate/applications')}
                      className="w-full mb-3"
                    >
                      View My Applications
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsApplyModalOpen(true)}
                    disabled={isCheckingApplication}
                    className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
                  >
                    {isCheckingApplication ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                )}

                {job.deadline && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center text-orange-700 dark:text-orange-400 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Application deadline: {formatDate(job.deadline)}</span>
                    </div>
                  </div>
                )}

                {job.applications_count !== undefined && (
                  <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{job.applications_count} applicants</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  {job.company?.logo_url ? (
                    <img
                      src={job.company.logo_url}
                      alt={companyName}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{companyName}</h3>
                    {job.company?.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.company.location}</p>
                    )}
                  </div>
                </div>

                {job.company?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {job.company.description}
                  </p>
                )}

                {job.company?.size && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{job.company.size} employees</span>
                  </div>
                )}

                {job.company?.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate(\`/companies/\${job.company_id || job.company?.id}\`)}
                >
                  View Company Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application to {companyName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-6 py-4">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm font-medium">
                Resume/CV <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {resumeFile ? (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{resumeFile.name}</p>
                        <p className="text-xs text-gray-500">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                    <input
                      id="resume"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-sm font-medium">
                Cover Letter
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn Profile (optional)
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-sm font-medium">
                Portfolio/Website (optional)
              </Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!resumeFile || applyMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobDetailPage;
`;
};
