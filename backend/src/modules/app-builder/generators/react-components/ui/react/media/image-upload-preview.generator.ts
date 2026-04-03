import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateImageUploadPreview = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withCrop' | 'advanced' = 'withCrop'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState, useRef } from 'react';
import { Upload, X, RotateCw, RotateCcw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, Check, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    basic: `
${commonImports}

interface ImageUploadPreviewProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File) => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const data = ${dataName} || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uploadImageText = ${getField('uploadImageText')};
  const changeImageText = ${getField('changeImageText')};
  const removeImageText = ${getField('removeImageText')};
  const dropImageText = ${getField('dropImageText')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};
  const maxImageSize = ${getField('maxImageSize')};
  const errorFileSizeText = ${getField('errorFileSizeText')};
  const errorFileTypeText = ${getField('errorFileTypeText')};
  const uploadingText = ${getField('uploadingText')};

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > maxImageSize) {
      setError(errorFileSizeText);
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError(errorFileTypeText);
      return;
    }

    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
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
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedImageTypes}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
            {dropImageText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-contain"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">{uploadingText}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {changeImageText}
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              {removeImageText}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ImageUploadPreview;
    `,

    withCrop: `
${commonImports}

interface ImageUploadPreviewProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File, croppedBlob?: Blob) => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const data = ${dataName} || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showCropTool, setShowCropTool] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uploadImageText = ${getField('uploadImageText')};
  const cropImageText = ${getField('cropImageText')};
  const applyCropText = ${getField('applyCropText')};
  const cancelCropText = ${getField('cancelCropText')};
  const removeImageText = ${getField('removeImageText')};
  const aspectRatioLabel = ${getField('aspectRatioLabel')};
  const aspectRatios = ${getField('aspectRatios')};
  const zoomInText = ${getField('zoomInText')};
  const zoomOutText = ${getField('zoomOutText')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};
  const processingText = ${getField('processingText')};

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setShowCropTool(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleApplyCrop = () => {
    if (!preview || !file) return;

    // In a real implementation, you would use a library like react-image-crop
    // For this example, we'll just close the crop tool
    setShowCropTool(false);

    if (onUpload) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    setShowCropTool(false);
    setZoom(1);
    setAspectRatio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedImageTypes}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {uploadImageText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to select an image to crop
          </p>
        </div>
      ) : showCropTool ? (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="relative h-96 flex items-center justify-center overflow-hidden">
              <img
                src={preview}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: \`scale(\${zoom})\` }}
              />
              {aspectRatio && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/50" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {aspectRatioLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio: any) => (
                  <button
                    key={ratio.label}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      aspectRatio === ratio.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zoom
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApplyCrop}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {applyCropText}
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                {cancelCropText}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-80 object-contain"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCropTool(true)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {cropImageText}
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              {removeImageText}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageUploadPreview;
    `,

    advanced: `
${commonImports}

interface ImageUploadPreviewProps {
  ${dataName}?: any;
  className?: string;
  onUpload?: (file: File, transformedBlob?: Blob) => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ ${dataName}: propData, className, onUpload }) => {
  const { data: fetchedData, isLoading: isDataLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const data = ${dataName} || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  if (isDataLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uploadImageText = ${getField('uploadImageText')};
  const applyCropText = ${getField('applyCropText')};
  const resetText = ${getField('resetText')};
  const removeImageText = ${getField('removeImageText')};
  const rotateLeftText = ${getField('rotateLeftText')};
  const rotateRightText = ${getField('rotateRightText')};
  const flipHorizontalText = ${getField('flipHorizontalText')};
  const flipVerticalText = ${getField('flipVerticalText')};
  const aspectRatioLabel = ${getField('aspectRatioLabel')};
  const aspectRatios = ${getField('aspectRatios')};
  const acceptedImageTypes = ${getField('acceptedImageTypes')};

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRotateLeft = () => setRotation((rotation - 90) % 360);
  const handleRotateRight = () => setRotation((rotation + 90) % 360);
  const handleFlipH = () => setFlipH(!flipH);
  const handleFlipV = () => setFlipV(!flipV);

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setAspectRatio(null);
  };

  const handleApply = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    handleReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTransformStyle = () => {
    return {
      transform: \`
        scale(\${zoom})
        rotate(\${rotation}deg)
        scaleX(\${flipH ? -1 : 1})
        scaleY(\${flipV ? -1 : 1})
      \`,
      transition: 'transform 0.3s ease'
    };
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedImageTypes}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-20 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
          <Upload className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {uploadImageText}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Advanced image editor with crop, rotate, flip and zoom
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="relative h-96 flex items-center justify-center overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                style={getTransformStyle()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Transform</h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRotateLeft}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">{rotateLeftText}</span>
                </button>
                <button
                  onClick={handleRotateRight}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-sm">{rotateRightText}</span>
                </button>
                <button
                  onClick={handleFlipH}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    flipH
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="text-sm">{flipHorizontalText}</span>
                </button>
                <button
                  onClick={handleFlipV}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    flipV
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span className="text-sm">{flipVerticalText}</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{aspectRatioLabel}</h3>

              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio: any) => (
                  <button
                    key={ratio.label}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      aspectRatio === ratio.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {applyCropText}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              {resetText}
            </button>
            <button
              onClick={handleRemove}
              className="px-6 py-3 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors"
            >
              {removeImageText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
    `
  };

  return variants[variant] || variants.withCrop;
};
