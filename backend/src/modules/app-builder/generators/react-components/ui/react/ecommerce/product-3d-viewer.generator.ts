import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProduct3DViewer = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'interactive' | 'ar' = 'basic'
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
    return `/${dataSource || 'products'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'products';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Maximize, Minimize, RotateCcw, ZoomIn, ZoomOut, Move, Sun, Eye, Layers, Box, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface ViewerProps {
  ${dataName}?: any;
  className?: string;
  onViewChange?: (view: any) => void;
}

const Product3DViewer: React.FC<ViewerProps> = ({
  ${dataName}: propData,
  className,
  onViewChange
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const viewerData = ${dataName} || {};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const product = ${getField('product')};
  const title = ${getField('title')};
  const resetViewText = ${getField('resetViewText')};
  const fullscreenText = ${getField('fullscreenText')};
  const instructionsText = ${getField('instructionsText')};

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    onViewChange?.({ rotation: { x: 0, y: 0 }, zoom: 1 });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        </div>

        {/* 3D Viewer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Viewer Canvas */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            {/* 3D Model Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-9xl transition-transform duration-300"
                style={{
                  transform: \`rotateX(\${rotation.x}deg) rotateY(\${rotation.y}deg) scale(\${zoom})\`
                }}
              >
                🎧
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="h-10 w-10 p-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={handleZoomOut}
                className="h-10 w-10 p-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={handleReset}
                className="h-10 w-10 p-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title={resetViewText}
              >
                <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-10 w-10 p-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title={fullscreenText}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
                {instructionsText}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📐</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">High Detail</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Photorealistic 3D model</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">360° View</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Explore from every angle</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Zoom Details</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">See every feature up close</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
    `,

    interactive: `
${commonImports}

interface Annotation {
  id: string;
  position: { x: number; y: number; z: number };
  title: string;
  description: string;
}

interface ViewPreset {
  id: string;
  name: string;
  rotation: { x: number; y: number; z: number };
}

interface ViewerProps {
  ${dataName}?: any;
  className?: string;
  onAnnotationClick?: (annotation: Annotation) => void;
}

const Product3DViewer: React.FC<ViewerProps> = ({
  ${dataName}: propData,
  className,
  onAnnotationClick
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const viewerData = ${dataName} || {};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const product = ${getField('product')};
  const annotations = ${getField('annotations')} as Annotation[];
  const viewPresets = ${getField('viewPresets')} as ViewPreset[];
  const annotationsText = ${getField('annotationsText')};
  const viewPresetsText = ${getField('viewPresetsText')};
  const explodedViewText = ${getField('explodedViewText')};
  const normalViewText = ${getField('normalViewText')};

  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('front');

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation.id);
    onAnnotationClick?.(annotation);
  };

  const handlePresetClick = (presetId: string) => {
    setCurrentPreset(presetId);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* View Presets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {viewPresetsText}
              </h3>
              <div className="space-y-2">
                {viewPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                      currentPreset === preset.id
                        ? "bg-blue-600 text-white font-bold hover:bg-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Annotations Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-bold text-gray-900 dark:text-gray-100">{annotationsText}</span>
                <div className={cn(
                  "w-10 h-6 rounded-full transition-colors",
                  showAnnotations ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                )}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full mt-1 transition-transform",
                    showAnnotations ? "ml-5" : "ml-1"
                  )} />
                </div>
              </button>
            </div>

            {/* Exploded View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <button
                onClick={() => setIsExploded(!isExploded)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4" />
                {isExploded ? normalViewText : explodedViewText}
              </button>
            </div>
          </div>

          {/* Center - 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                {/* 3D Model */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn("text-9xl transition-all duration-500", isExploded && "scale-125")}>
                    🎧
                  </div>
                </div>

                {/* Annotation Hotspots */}
                {showAnnotations && annotations.map((annotation, index) => (
                  <button
                    key={annotation.id}
                    onClick={() => handleAnnotationClick(annotation)}
                    className={cn(
                      "absolute w-8 h-8 rounded-full border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                      selectedAnnotation === annotation.id
                        ? "bg-blue-600 border-white scale-125"
                        : "bg-white/80 border-blue-600 hover:scale-110"
                    )}
                    style={{
                      left: \`\${50 + annotation.position.x * 100}%\`,
                      top: \`\${50 + annotation.position.y * 100}%\`
                    }}
                  >
                    <span className="text-xs font-bold text-blue-600">
                      {selectedAnnotation === annotation.id ? '✓' : index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Annotation Details */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                Features
              </h3>
              <div className="space-y-3">
                {annotations.map((annotation, index) => (
                  <div
                    key={annotation.id}
                    onClick={() => handleAnnotationClick(annotation)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all",
                      selectedAnnotation === annotation.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-600"
                        : "bg-gray-50 dark:bg-gray-750 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                          {annotation.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {annotation.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
    `,

    ar: `
${commonImports}

interface ViewerProps {
  ${dataName}?: any;
  className?: string;
  onARStart?: () => void;
}

const Product3DViewer: React.FC<ViewerProps> = ({
  ${dataName}: propData,
  className,
  onARStart
}) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const viewerData = ${dataName} || {};

  const [isARReady, setIsARReady] = useState(true);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const product = ${getField('product')};

  const handleARStart = () => {
    setIsARReady(true);
    onARStart?.();
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="text-8xl mb-6">🎧</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                View this product in your space using augmented reality
              </p>

              <button
                onClick={handleARStart}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-lg font-bold transition-all flex items-center gap-3 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Box className="w-6 h-6" />
                View in AR
              </button>

              {isARReady && (
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                  ✓ AR Ready
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Mobile Ready</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Place in Space</div>
              </div>
              <div>
                <div className="text-2xl mb-2">📸</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Take Photos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
    `
  };

  return variants[variant] || variants.basic;
};
