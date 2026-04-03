import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFileUploadMultiple = (
  resolved: ResolvedComponent,
  variant: 'list' | 'grid' | 'compact' = 'list'
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
import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, X, FileText, CheckCircle, AlertCircle, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    list: `
${commonImports}

interface FileUploadMultipleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
  error?: string;
}

const FileUploadMultiple: React.FC<FileUploadMultipleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadButtonText = ${getField('uploadButtonText')};
  const dropZoneText = ${getField('dropZoneText')};
  const uploadingText = ${getField('uploadingText')};
  const uploadCompleteText = ${getField('uploadCompleteText')};
  const removeFileText = ${getField('removeFileText')};
  const removeAllText = ${getField('removeAllText')};
  const uploadAllText = ${getField('uploadAllText')};
  const maxFilesText = ${getField('maxFilesText')};
  const maxTotalSizeText = ${getField('maxTotalSizeText')};
  const acceptedFormatsText = ${getField('acceptedFormatsText')};
  const errorMaxFilesText = ${getField('errorMaxFilesText')};
  const errorMaxSizeText = ${getField('errorMaxSizeText')};
  const errorTotalSizeText = ${getField('errorTotalSizeText')};
  const errorFileTypeText = ${getField('errorFileTypeText')};
  const successUploadText = ${getField('successUploadText')};
  const filesSelectedText = ${getField('filesSelectedText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFileSize = ${getField('maxFileSize')};
  const maxFiles = ${getField('maxFiles')};
  const maxTotalSize = ${getField('maxTotalSize')};
  const fileSizeLabel = ${getField('fileSizeLabel')};
  const totalSizeLabel = ${getField('totalSizeLabel')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((total, item) => total + item.file.size, 0);
  };

  const validateFiles = (newFiles: File[]): string | null => {
    if (files.length + newFiles.length > maxFiles) {
      return \`\${errorMaxFilesText} (\${maxFiles})\`;
    }

    for (const file of newFiles) {
      if (file.size > maxFileSize) {
        return \`\${file.name}: \${errorMaxSizeText}\`;
      }

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedTypes = acceptedFileTypes.split(',');

      if (!acceptedTypes.includes(fileExtension)) {
        return \`\${file.name}: \${errorFileTypeText}\`;
      }
    }

    const totalSize = getTotalSize() + newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSize) {
      return errorTotalSizeText;
    }

    return null;
  };

  const simulateUpload = (fileItem: FileWithProgress, index: number) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = {
            ...updated[index],
            progress: 100,
            uploading: false,
            complete: true
          };
          return updated;
        }
        updated[index] = {
          ...updated[index],
          progress: updated[index].progress + 10
        };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles);
    const validationError = validateFiles(newFiles);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const newFileItems: FileWithProgress[] = newFiles.map(file => ({
      file,
      progress: 0,
      uploading: true,
      complete: false
    }));

    setFiles(prev => {
      const updated = [...prev, ...newFileItems];
      newFileItems.forEach((item, i) => {
        simulateUpload(item, prev.length + i);
      });
      return updated;
    });

    if (onUpload) onUpload(newFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [files]);

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleRemoveAll = () => {
    setFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-6",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
        )}
      >
        <Upload className={cn(
          "w-10 h-10 mx-auto mb-3 transition-colors",
          isDragging ? "text-blue-500" : "text-gray-400"
        )} />
        <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
          {dropZoneText}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {maxFilesText} {maxFiles} • {maxTotalSizeText}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{acceptedFormatsText}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {files.length} {filesSelectedText} • {totalSizeLabel} {formatFileSize(getTotalSize())}
            </p>
            <button
              onClick={handleRemoveAll}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              {removeAllText}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <FileText className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                      {item.file.name}
                    </p>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      disabled={item.uploading}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {fileSizeLabel} {formatFileSize(item.file.size)}
                  </p>

                  {item.uploading && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{uploadingText}...</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: \`\${item.progress}%\` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.complete && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{item.file.name} {successUploadText}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadMultiple;
    `,

    grid: `
${commonImports}

interface FileUploadMultipleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
  preview?: string;
}

const FileUploadMultiple: React.FC<FileUploadMultipleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadButtonText = ${getField('uploadButtonText')};
  const removeFileText = ${getField('removeFileText')};
  const uploadingText = ${getField('uploadingText')};
  const uploadCompleteText = ${getField('uploadCompleteText')};
  const maxFilesText = ${getField('maxFilesText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFileSize = ${getField('maxFileSize')};
  const maxFiles = ${getField('maxFiles')};
  const errorMaxFilesText = ${getField('errorMaxFilesText')};
  const errorMaxSizeText = ${getField('errorMaxSizeText')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const simulateUpload = (index: number) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = {
            ...updated[index],
            progress: 100,
            uploading: false,
            complete: true
          };
          return updated;
        }
        updated[index] = {
          ...updated[index],
          progress: updated[index].progress + 10
        };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles);

    if (files.length + newFiles.length > maxFiles) {
      setError(\`\${errorMaxFilesText} (\${maxFiles})\`);
      return;
    }

    setError(null);

    for (const file of newFiles) {
      const preview = await createPreview(file);
      setFiles(prev => {
        const newItem: FileWithProgress = {
          file,
          progress: 0,
          uploading: true,
          complete: false,
          preview
        };
        const updated = [...prev, newItem];
        simulateUpload(updated.length - 1);
        return updated;
      });
    }

    if (onUpload) onUpload(newFiles);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelect(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((item: any, index: number) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              {item.preview ? (
                <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {item.uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray={\`\${item.progress * 2.83} 283\`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">{item.progress}%</span>
                </div>
              )}

              {item.complete && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={item.uploading}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
              {item.file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatFileSize(item.file.size)}
            </p>
          </div>
        ))}

        {files.length < maxFiles && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">{uploadButtonText}</span>
            <span className="text-xs">{maxFilesText} {maxFiles}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUploadMultiple;
    `,

    compact: `
${commonImports}

interface FileUploadMultipleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
}

const FileUploadMultiple: React.FC<FileUploadMultipleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const uploadButtonText = ${getField('uploadButtonText')};
  const filesSelectedText = ${getField('filesSelectedText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFiles = ${getField('maxFiles')};

  const simulateUpload = (index: number) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = {
            ...updated[index],
            progress: 100,
            uploading: false,
            complete: true
          };
          return updated;
        }
        updated[index] = {
          ...updated[index],
          progress: updated[index].progress + 10
        };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles);

    for (const file of newFiles) {
      setFiles(prev => {
        const newItem: FileWithProgress = {
          file,
          progress: 0,
          uploading: true,
          complete: false
        };
        const updated = [...prev, newItem];
        simulateUpload(updated.length - 1);
        return updated;
      });
    }

    if (onUpload) onUpload(newFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getOverallProgress = () => {
    if (files.length === 0) return 0;
    const total = files.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(total / files.length);
  };

  return (
    <div className={cn("w-full max-w-md", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploadButtonText}
          </button>
          {files.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {files.length} {filesSelectedText}
            </span>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: \`\${getOverallProgress()}%\` }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-right">
                {getOverallProgress()}%
              </span>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {files.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-gray-900 dark:text-white truncate flex-1">
                    {item.file.name}
                  </span>
                  {item.complete ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : item.uploading ? (
                    <span className="text-xs text-gray-500 w-8 text-right">{item.progress}%</span>
                  ) : null}
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    disabled={item.uploading}
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadMultiple;
    `
  };

  return variants[variant] || variants.list;
};
