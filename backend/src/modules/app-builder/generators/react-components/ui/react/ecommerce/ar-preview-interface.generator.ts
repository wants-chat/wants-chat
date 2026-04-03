import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateARPreviewInterface = (
  resolved: ResolvedComponent,
  variant: 'camera' | 'upload' | 'hybrid' = 'camera'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Camera, Upload, Share2, RotateCw, Move, ZoomIn, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    camera: `
${commonImports}

interface ARPreviewProps {
  ${dataName}?: any;
  className?: string;
  onARActivate?: () => void;
  onPhotoTaken?: (photo: Blob) => void;
  onShare?: () => void;
}

const ARPreviewInterface: React.FC<ARPreviewProps> = ({
  ${dataName}: initialData,
  className,
  onARActivate,
  onPhotoTaken,
  onShare
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const arData = ${dataName} || {};

  const product = ${getField('product')};
  const arFeatures = ${getField('arFeatures')} as string[];
  const instructions = ${getField('instructions')};
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const activateARText = ${getField('activateARText')};
  const takePhotoText = ${getField('takePhotoText')};
  const shareText = ${getField('shareText')};
  const placeObjectText = ${getField('placeObjectText')};
  const instructionsText = ${getField('instructionsText')};

  const [isARActive, setIsARActive] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleActivateAR = () => {
    setIsARActive(true);
    setShowInstructions(true);
    onARActivate?.();
  };

  const handlePlace = () => {
    setIsPlaced(true);
    setShowInstructions(false);
  };

  const handleTakePhoto = () => {
    // Simulate photo capture
    onPhotoTaken?.(new Blob());
  };

  const handleShare = () => {
    onShare?.();
  };

  return (
    <div className={cn("min-h-screen bg-black", className)}>
      {!isARActive ? (
        // AR Intro Screen
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🛋️</div>
              <h1 className="text-4xl font-bold text-white mb-3">
                {product.name}
              </h1>
              <p className="text-xl text-blue-100">
                {subtitle}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
              <h3 className="text-white font-semibold mb-4">Features:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {arFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleActivateAR}
              className="w-full px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Camera className="w-6 h-6" />
              {activateARText}
            </button>

            <div className="mt-6 text-center text-blue-100 text-sm">
              <p>Dimensions: {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height}</p>
            </div>
          </div>
        </div>
      ) : (
        // AR Camera View
        <div className="relative min-h-screen">
          {/* Camera Feed Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg opacity-75">Camera Feed</p>
            </div>

            {/* Placed Object */}
            {isPlaced && (
              <div className="absolute inset-0 flex items-end justify-center pb-32">
                <div className="text-8xl animate-pulse">🛋️</div>
              </div>
            )}

            {/* Surface Detection Grid */}
            {!isPlaced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-4 opacity-30">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-8 h-8 border border-blue-400 rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions Overlay */}
          {showInstructions && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-md">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  {instructionsText}
                </h3>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {instructions.camera.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Place Button */}
          {!isPlaced && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handlePlace}
                className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-medium shadow-lg flex items-center gap-2"
              >
                <Move className="w-5 h-5" />
                {placeObjectText}
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {isPlaced && (
                <>
                  <button
                    onClick={handleTakePhoto}
                    className="w-16 h-16 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-900" />
                  </button>

                  <button
                    onClick={() => setIsPlaced(false)}
                    className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors"
                  >
                    <RotateCw className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARPreviewInterface;
    `,

    upload: `
${commonImports}

interface ARPreviewProps {
  ${dataName}?: any;
  className?: string;
  onPhotoUpload?: (file: File) => void;
  onSave?: (result: any) => void;
}

const ARPreviewInterface: React.FC<ARPreviewProps> = ({
  ${dataName},
  className,
  onPhotoUpload,
  onSave
}) => {
  const arData = ${dataName} || {};

  const product = ${getField('product')};
  const title = ${getField('title')};
  const uploadPhotoText = ${getField('uploadPhotoText')};
  const placeObjectText = ${getField('placeObjectText')};
  const adjustText = ${getField('adjustText')};
  const saveText = ${getField('saveText')};

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoUpload?.(file);
    }
  };

  const handlePlace = () => {
    setIsPlaced(true);
  };

  const handleSave = () => {
    onSave?.({ position, scale, rotation, image: uploadedImage });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {product.name}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                {uploadedImage ? (
                  <>
                    <img
                      src={uploadedImage}
                      alt="Uploaded space"
                      className="w-full h-full object-cover"
                    />
                    {isPlaced && (
                      <div
                        className="absolute text-6xl cursor-move"
                        style={{
                          left: \`\${position.x}%\`,
                          top: \`\${position.y}%\`,
                          transform: \`translate(-50%, -50%) scale(\${scale}) rotate(\${rotation}deg)\`,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        🛋️
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {uploadPhotoText}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      Upload a photo of your space to preview the product
                    </p>
                    <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>

              {uploadedImage && !isPlaced && (
                <div className="p-6 bg-gray-50 dark:bg-gray-750">
                  <button
                    onClick={handlePlace}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Move className="w-5 h-5" />
                    {placeObjectText}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {isPlaced && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {adjustText}
                  </h3>

                  <div className="space-y-4">
                    {/* Scale */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Size
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                        {Math.round(scale * 100)}%
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rotation
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                        {rotation}°
                      </div>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={position.x}
                            onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                            X: {position.x}%
                          </div>
                        </div>
                        <div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={position.y}
                            onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                            Y: {position.y}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Image className="w-5 h-5" />
                  {saveText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARPreviewInterface;
    `,

    hybrid: `
${commonImports}

interface ARPreviewProps {
  ${dataName}?: any;
  className?: string;
  onModeSelect?: (mode: 'camera' | 'upload') => void;
}

const ARPreviewInterface: React.FC<ARPreviewProps> = ({
  ${dataName},
  className,
  onModeSelect
}) => {
  const arData = ${dataName} || {};

  const product = ${getField('product')};
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const useCameraText = ${getField('useCameraText')};
  const uploadPhotoText = ${getField('uploadPhotoText')};
  const arFeatures = ${getField('arFeatures')} as string[];
  const requirementsText = ${getField('requirementsText')};
  const requirementsList = ${getField('requirementsList')} as string[];

  const [selectedMode, setSelectedMode] = useState<'camera' | 'upload' | null>(null);

  const handleModeSelect = (mode: 'camera' | 'upload') => {
    setSelectedMode(mode);
    onModeSelect?.(mode);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🛋️</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Camera Mode */}
          <button
            onClick={() => handleModeSelect('camera')}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {useCameraText}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Use your device camera to place and view the product in real-time with augmented reality.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
              Try AR Mode
              <Camera className="w-4 h-4 ml-2" />
            </div>
          </button>

          {/* Upload Mode */}
          <button
            onClick={() => handleModeSelect('upload')}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {uploadPhotoText}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a photo of your space and digitally place the product to visualize how it looks.
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
              Upload Photo
              <Upload className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {arFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {requirementsText}
          </h3>
          <ul className="space-y-2">
            {requirementsList.map((requirement, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARPreviewInterface;
    `
  };

  return variants[variant] || variants.camera;
};
