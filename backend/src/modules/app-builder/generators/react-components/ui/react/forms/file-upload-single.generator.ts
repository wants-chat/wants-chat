import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFileUploadSingle = (
  resolved: ResolvedComponent,
  variant: 'button' | 'dropzone' | 'compact' = 'dropzone'
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
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    button: `
${commonImports}

interface FileUploadSingleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (file: File) => void;
}

const FileUploadSingle: React.FC<FileUploadSingleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const uploadButtonText = ${getField('uploadButtonText')};
  const uploadingText = ${getField('uploadingText')};
  const uploadCompleteText = ${getField('uploadCompleteText')};
  const removeFileText = ${getField('removeFileText')};
  const maxFileSizeText = ${getField('maxFileSizeText')};
  const acceptedFormatsText = ${getField('acceptedFormatsText')};
  const errorMaxSizeText = ${getField('errorMaxSizeText')};
  const errorFileTypeText = ${getField('errorFileTypeText')};
  const successUploadText = ${getField('successUploadText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFileSize = ${getField('maxFileSize')};
  const fileSizeLabel = ${getField('fileSizeLabel')};
  const fileTypeLabel = ${getField('fileTypeLabel')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return errorMaxSizeText;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',');

    if (!acceptedTypes.includes(fileExtension)) {
      return errorFileTypeText;
    }

    return null;
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          if (onUpload) onUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadComplete(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto p-6", className)}>
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedFileTypes}
          className="hidden"
        />

        {!file ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploadButtonText}
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {fileSizeLabel} {formatFileSize(file.size)} • {fileTypeLabel} {file.type || 'Unknown'}
                </p>

                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{uploadingText}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: \`\${progress}%\` }}
                      />
                    </div>
                  </div>
                )}

                {uploadComplete && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{successUploadText}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRemoveFile}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                disabled={uploading}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>{maxFileSizeText}</p>
          <p>{acceptedFormatsText}</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadSingle;
    `,

    dropzone: `
${commonImports}

interface FileUploadSingleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (file: File) => void;
}

const FileUploadSingle: React.FC<FileUploadSingleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dropZoneText = ${getField('dropZoneText')};
  const uploadingText = ${getField('uploadingText')};
  const uploadCompleteText = ${getField('uploadCompleteText')};
  const removeFileText = ${getField('removeFileText')};
  const maxFileSizeText = ${getField('maxFileSizeText')};
  const acceptedFormatsText = ${getField('acceptedFormatsText')};
  const errorMaxSizeText = ${getField('errorMaxSizeText')};
  const errorFileTypeText = ${getField('errorFileTypeText')};
  const successUploadText = ${getField('successUploadText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFileSize = ${getField('maxFileSize')};
  const fileSizeLabel = ${getField('fileSizeLabel')};
  const fileTypeLabel = ${getField('fileTypeLabel')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return errorMaxSizeText;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',');

    if (!acceptedTypes.includes(fileExtension)) {
      return errorFileTypeText;
    }

    return null;
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          if (onUpload) onUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
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

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadComplete(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
          )}
        >
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4 transition-colors",
            isDragging ? "text-blue-500" : "text-gray-400"
          )} />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {dropZoneText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{maxFileSizeText}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{acceptedFormatsText}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fileSizeLabel} {formatFileSize(file.size)} • {fileTypeLabel} {file.type || 'Unknown'}
              </p>

              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{uploadingText}</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: \`\${progress}%\` }}
                    />
                  </div>
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center gap-2 mt-3 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{successUploadText}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadSingle;
    `,

    compact: `
${commonImports}

interface FileUploadSingleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (file: File) => void;
}

const FileUploadSingle: React.FC<FileUploadSingleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const uploadButtonText = ${getField('uploadButtonText')};
  const removeFileText = ${getField('removeFileText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const maxFileSize = ${getField('maxFileSize')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          if (onUpload) onUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      simulateUpload(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        {!file ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploadButtonText}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              {uploading ? (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: \`\${progress}%\` }}
                  />
                </div>
              ) : uploadComplete ? (
                <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
              ) : null}
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              disabled={uploading}
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSingle;
    `
  };

  return variants[variant] || variants.dropzone;
};
