import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMediaUploadPreview = (
  resolved: ResolvedComponent,
  variant: 'list' | 'grid' | 'detailed' = 'list'
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
  const dataName = dataSource.split('.').pop() || 'data';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'uploads'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'uploads';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, FileText, Image as ImageIcon, Video, File, Edit, Check, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .upload-container { @apply w-full; }
    .file-list { @apply space-y-2; }
    .file-item { @apply flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700; }
    .file-preview { @apply w-16 h-16 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0; }
    .preview-image { @apply w-full h-full object-cover; }
    .file-info { @apply flex-1 min-w-0; }
    .file-name { @apply font-medium text-gray-900 dark:text-white truncate; }
    .file-size { @apply text-sm text-gray-500 dark:text-gray-400; }
    .progress-bar { @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2; }
    .progress-fill { @apply h-full bg-blue-500 transition-all; }
    .file-actions { @apply flex gap-2; }
    .action-btn { @apply p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors; }
    .remove-btn { @apply p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors; }
    .file-grid { @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4; }
    .grid-item { @apply relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4; }
  `;

  const variants = {
    list: `${commonImports}
interface MediaUploadPreviewProps { ${dataName}?: any; className?: string; }
const MediaUploadPreview: React.FC<MediaUploadPreviewProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const uploadData = ${dataName} || {};
  const initialFiles = uploadData.files || ${getField('files')};
  const [files, setFiles] = useState(initialFiles);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const removeFile = (id: number) => {
    setFiles(files.filter((f: any) => f.id !== id));
  };

  return (<>
<div className={className}>
      <div className="upload-container">
        <div className="file-list">
          {files.map((file: any) => (
            <div key={file.id} className="file-item">
              <div className="file-preview">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="preview-image" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
                {file.progress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: \`\${file.progress}%\` }} />
                  </div>
                )}
                {file.progress === 100 && (
                  <div className="text-sm text-green-500 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Upload complete
                  </div>
                )}
              </div>
              <div className="file-actions">
                {file.type.startsWith('image/') && <button className="action-btn"><Edit className="w-5 h-5" /></button>}
                <button onClick={() => removeFile(file.id)} className="remove-btn"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default MediaUploadPreview;`,

    grid: `${commonImports}
interface MediaUploadPreviewProps { ${dataName}?: any; className?: string; }
const MediaUploadPreview: React.FC<MediaUploadPreviewProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const uploadData = ${dataName} || {};
  const initialFiles = uploadData.files || ${getField('files')};
  const [files, setFiles] = useState(initialFiles);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-12 h-12 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    if (type === 'application/pdf') return <FileText className="w-12 h-12 text-red-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const removeFile = (id: number) => {
    setFiles(files.filter((f: any) => f.id !== id));
  };

  return (<>
<div className={className}>
      <div className="upload-container">
        <div className="file-grid">
          {files.map((file: any) => (
            <div key={file.id} className="grid-item">
              <button onClick={() => removeFile(file.id)} className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20"><X className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500" /></button>
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <div className="file-name text-sm mb-1">{file.name}</div>
              <div className="file-size text-xs">{formatFileSize(file.size)}</div>
              {file.progress < 100 && (
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: \`\${file.progress}%\` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default MediaUploadPreview;`,

    detailed: `${commonImports}
interface MediaUploadPreviewProps { ${dataName}?: any; className?: string; }
const MediaUploadPreview: React.FC<MediaUploadPreviewProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const uploadData = ${dataName} || {};
  const initialFiles = uploadData.files || ${getField('files')};
  const [files, setFiles] = useState(initialFiles);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-12 h-12 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    if (type === 'application/pdf') return <FileText className="w-12 h-12 text-red-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const removeFile = (id: number) => {
    setFiles(files.filter((f: any) => f.id !== id));
  };

  const totalSize = files.reduce((acc: number, file: any) => acc + file.size, 0);
  const completedFiles = files.filter((f: any) => f.progress === 100).length;

  return (<>
<div className={className}>
      <div className="upload-container">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{completedFiles} of {files.length} files</span>
          </div>
          <div className="progress-bar h-3">
            <div className="progress-fill" style={{ width: \`\${(completedFiles / files.length) * 100}%\` }} />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Total size: {formatFileSize(totalSize)}</div>
        </div>
        <div className="file-list">
          {files.map((file: any) => (
            <div key={file.id} className="file-item">
              <div className="file-preview w-24 h-24">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="preview-image" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <div className="file-info">
                <div className="file-name text-base">{file.name}</div>
                <div className="flex gap-4 mt-1">
                  <div className="file-size">{formatFileSize(file.size)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">{file.type}</div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {file.progress === 100 ? 'Complete' : \`Uploading... \${file.progress}%\`}
                    </span>
                    {file.progress < 100 && (
                      <span className="text-gray-500 dark:text-gray-500">{formatFileSize(file.size * file.progress / 100)} / {formatFileSize(file.size)}</span>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: \`\${file.progress}%\` }} />
                  </div>
                </div>
              </div>
              <div className="file-actions">
                {file.type.startsWith('image/') && file.progress === 100 && (
                  <button className="action-btn"><Edit className="w-5 h-5" /></button>
                )}
                <button onClick={() => removeFile(file.id)} className="remove-btn"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default MediaUploadPreview;`
  };

  return variants[variant] || variants.list;
};
