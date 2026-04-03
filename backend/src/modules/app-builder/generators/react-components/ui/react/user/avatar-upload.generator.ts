import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAvatarUpload = (
  resolved: ResolvedComponent,
  variant: 'circular' | 'square' | 'withOptions' = 'circular'
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
  const entity = dataSource?.split('.').pop() || 'avatar';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'avatar'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Upload, Camera, X, User, ZoomIn, ZoomOut, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    circular: `
${commonImports}

interface AvatarUploadProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File | string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);

  const uploadAvatarText = ${getField('uploadAvatarText')};
  const changeAvatarText = ${getField('changeAvatarText')};
  const removeAvatarText = ${getField('removeAvatarText')};
  const zoomLabel = ${getField('zoomLabel')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};
  const recommendedSizeText = ${getField('recommendedSizeText')};
  const supportedFormatsText = ${getField('supportedFormatsText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setZoom(1);
    };
    reader.readAsDataURL(selectedFile);

    // Simulate upload
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      if (onUpload) onUpload(selectedFile);
    }, 1500);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setAvatar(null);
    setFile(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto p-6", className)}>
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedImageTypes}
          className="hidden"
        />

        <div className="relative group">
          <div className="w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover transition-transform"
                style={{ transform: \`scale(\${zoom})\` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-20 h-20 text-gray-400" />
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors group-hover:scale-110"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {avatar ? changeAvatarText : uploadAvatarText}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {recommendedSizeText}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {supportedFormatsText}
          </p>
        </div>

        {avatar && (
          <div className="mt-6 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {zoomLabel}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="w-full px-4 py-2 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors"
            >
              {removeAvatarText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
    `,

    square: `
${commonImports}

interface AvatarUploadProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File | string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);

  const uploadAvatarText = ${getField('uploadAvatarText')};
  const changeAvatarText = ${getField('changeAvatarText')};
  const removeAvatarText = ${getField('removeAvatarText')};
  const zoomLabel = ${getField('zoomLabel')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};
  const supportedFormatsText = ${getField('supportedFormatsText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setZoom(1);
    };
    reader.readAsDataURL(selectedFile);

    if (onUpload) onUpload(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setAvatar(null);
    setFile(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-sm mx-auto p-6", className)}>
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedImageTypes}
          className="hidden"
        />

        <div className="relative group">
          <div className="w-48 h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover transition-transform"
                style={{ transform: \`scale(\${zoom})\` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all group-hover:scale-110"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {supportedFormatsText}
        </p>

        {avatar && (
          <div className="mt-6 w-full space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {zoomLabel}: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {changeAvatarText}
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                {removeAvatarText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
    `,

    withOptions: `
${commonImports}

interface AvatarUploadProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File | string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'upload' | 'default'>('upload');
  const [selectedDefault, setSelectedDefault] = useState<number | null>(null);

  const uploadPhotoText = ${getField('uploadPhotoText')};
  const chooseDefaultText = ${getField('chooseDefaultText')};
  const removeAvatarText = ${getField('removeAvatarText')};
  const selectAvatarText = ${getField('selectAvatarText')};
  const zoomLabel = ${getField('zoomLabel')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};
  const defaultAvatars = ${getField('defaultAvatars')};
  const supportedFormatsText = ${getField('supportedFormatsText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setSelectedDefault(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setZoom(1);
    };
    reader.readAsDataURL(selectedFile);

    if (onUpload) onUpload(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSelectDefault = (avatarUrl: string, id: number) => {
    setAvatar(avatarUrl);
    setSelectedDefault(id);
    setFile(null);
    setZoom(1);

    if (onUpload) onUpload(avatarUrl);
  };

  const handleRemove = () => {
    setAvatar(null);
    setFile(null);
    setSelectedDefault(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-6", className)}>
      <div className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover transition-transform"
                  style={{ transform: \`scale(\${zoom})\` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {avatar && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Zoom Control */}
        {avatar && file && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {zoomLabel}: {Math.round(zoom * 100)}%
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('upload')}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                selectedTab === 'upload'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {uploadPhotoText}
            </button>
            <button
              onClick={() => setSelectedTab('default')}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                selectedTab === 'default'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {chooseDefaultText}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedImageTypes}
          className="hidden"
        />

        {selectedTab === 'upload' ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Click to upload your photo
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {supportedFormatsText}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {defaultAvatars.map((defaultAvatar: any) => (
              <button
                key={defaultAvatar.id}
                onClick={() => handleSelectDefault(defaultAvatar.url, defaultAvatar.id)}
                className={cn(
                  "relative aspect-square rounded-full overflow-hidden border-4 transition-all hover:scale-105",
                  selectedDefault === defaultAvatar.id
                    ? "border-blue-600 ring-4 ring-blue-200 dark:ring-blue-900"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                )}
              >
                <img
                  src={defaultAvatar.url}
                  alt={defaultAvatar.label}
                  className="w-full h-full object-cover"
                />
                {selectedDefault === defaultAvatar.id && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
    `
  };

  return variants[variant] || variants.circular;
};
