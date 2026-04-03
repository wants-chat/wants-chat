import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateResumeManager = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource;

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
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  FileUp,
  Clock,
  Calendar,
  File,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Resume {
  id: string;
  name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  is_primary?: boolean;
  uploaded_at?: string;
  created_at?: string;
}

interface ResumeManagerProps {
  [key: string]: any;
  className?: string;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ ${dataName}: propData, className }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch candidate profile with resume
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => api.get<any>('/candidate_profiles').then(res => res.data),
    enabled: !!user,
  });

  const profile = profileData?.data || profileData || propData || {};
  const currentResume: Resume | null = profile?.resume_url ? {
    id: profile.id || '1',
    name: profile.resume_name || 'Resume.pdf',
    file_url: profile.resume_url,
    file_size: profile.resume_size,
    file_type: profile.resume_type || 'application/pdf',
    is_primary: true,
    uploaded_at: profile.resume_uploaded_at || profile.updated_at,
  } : null;

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      return api.post<any>('/candidate/resume/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete<any>('/candidate/resume');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        <div className="max-w-4xl mx-auto px-4">
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-8", className)}>
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Resume
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage your resume. Your resume will be shared with employers when you apply for jobs.
          </p>
        </div>

        {/* Current Resume Card */}
        {currentResume ? (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Current Resume</CardTitle>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                {/* File Icon */}
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                  {getFileIcon(currentResume.file_type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {currentResume.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <File className="h-4 w-4 mr-1" />
                      {formatFileSize(currentResume.file_size)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Uploaded {formatDate(currentResume.uploaded_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentResume.file_url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentResume.file_url;
                      link.download = currentResume.name;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your resume?')) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Upload New Resume Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentResume ? 'Replace Resume' : 'Upload Resume'}
            </CardTitle>
            <CardDescription>
              {currentResume
                ? 'Upload a new resume to replace your current one'
                : 'Upload your resume to start applying for jobs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                uploadMutation.isPending && "pointer-events-none opacity-60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {uploadMutation.isPending ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Uploading...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadProgress}% complete
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: \`\${uploadProgress}%\` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your resume here'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or click to browse from your computer
                  </p>
                  <Button variant="outline" className="pointer-events-none">
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </>
              )}
            </div>

            {/* File Requirements */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                File Requirements
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Accepted formats: PDF, DOC, DOCX
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Maximum file size: 5MB
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Make sure your resume is up to date
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {uploadMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Failed to upload resume. Please try again.</span>
              </div>
            )}

            {/* Success Message */}
            {uploadMutation.isSuccess && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Resume uploaded successfully!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Resume Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <span>Keep your resume concise - ideally 1-2 pages for most roles</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <span>Use clear, professional formatting with consistent fonts and spacing</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <span>Tailor your resume to highlight relevant skills for each application</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium mr-3">
                  4
                </span>
                <span>Include quantifiable achievements and results when possible</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeManager;
`;
};
