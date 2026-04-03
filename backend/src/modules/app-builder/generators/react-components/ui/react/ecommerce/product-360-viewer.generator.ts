import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProduct360Viewer = (
  resolved: ResolvedComponent,
  variant: 'drag' | 'auto' | 'interactive' = 'drag'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RotateCw, ZoomIn, ZoomOut, Maximize, Play, Pause, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .viewer-container { @apply relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden; }
    .viewer-canvas { @apply relative w-full cursor-grab active:cursor-grabbing; padding-bottom: 100%; }
    .product-image { @apply absolute top-0 left-0 w-full h-full object-contain transition-transform; }
    .viewer-controls { @apply absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-2 flex gap-2 shadow-lg; }
    .control-btn { @apply h-10 w-10 p-0 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed; }
    .loading-overlay { @apply absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900; }
    .progress-indicator { @apply absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100; }
    .drag-hint { @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 transition-opacity pointer-events-none; }
    .viewer-container:hover .drag-hint { @apply opacity-100; }
  `;

  const variants = {
    drag: `${commonImports}
interface Product360ViewerProps { ${dataName}?: any; className?: string; }
const Product360Viewer: React.FC<Product360ViewerProps> = ({ ${dataName}, className }) => {
  const viewerData = ${dataName} || {};
  const frames = viewerData.frames || ${getField('frames')};
  const enableZoom = viewerData.enableZoom ?? ${getField('enableZoom')};
  const maxZoom = viewerData.maxZoom || ${getField('maxZoom')};
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    let loaded = 0;
    frames.forEach((src: string) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadedImages(loaded);
        if (loaded === frames.length) setIsLoading(false);
      };
      img.src = src;
    });
  }, [frames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + direction + frames.length) % frames.length);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, maxZoom));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));

  return (<>
<div className={className}>
      <div className="viewer-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading {loadedImages}/{frames.length}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="viewer-canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <img src={frames[currentFrame]} alt={\`360 view frame \${currentFrame}\`} className="product-image" style={{ transform: \`scale(\${zoomLevel})\` }} />
              <div className="drag-hint">← Drag to rotate →</div>
            </div>
            <div className="progress-indicator">{Math.round((currentFrame / frames.length) * 360)}°</div>
            <div className="viewer-controls">
              {enableZoom && (
                <>
                  <button onClick={handleZoomIn} className="control-btn" disabled={zoomLevel >= maxZoom}><ZoomIn className="w-5 h-5" /></button>
                  <button onClick={handleZoomOut} className="control-btn" disabled={zoomLevel <= 1}><ZoomOut className="w-5 h-5" /></button>
                </>
              )}
              <button onClick={() => setCurrentFrame(0)} className="control-btn"><RotateCw className="w-5 h-5" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  </>);
};
export default Product360Viewer;`,

    auto: `${commonImports}
interface Product360ViewerProps { ${dataName}?: any; className?: string; }
const Product360Viewer: React.FC<Product360ViewerProps> = ({ ${dataName}, className }) => {
  const viewerData = ${dataName} || {};
  const frames = viewerData.frames || ${getField('frames')};
  const rotationSpeed = viewerData.rotationSpeed || ${getField('rotationSpeed')};
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    let loaded = 0;
    frames.forEach((src: string) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadedImages(loaded);
        if (loaded === frames.length) setIsLoading(false);
      };
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    if (!isPlaying || isLoading) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, rotationSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, rotationSpeed, isLoading]);

  return (<>
<div className={className}>
      <div className="viewer-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading {loadedImages}/{frames.length}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="viewer-canvas">
              <img src={frames[currentFrame]} alt={\`360 view frame \${currentFrame}\`} className="product-image" />
            </div>
            <div className="progress-indicator">{Math.round((currentFrame / frames.length) * 360)}°</div>
            <div className="viewer-controls">
              <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={() => setCurrentFrame(0)} className="control-btn"><RotateCw className="w-5 h-5" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  </>);
};
export default Product360Viewer;`,

    interactive: `${commonImports}
interface Product360ViewerProps { ${dataName}?: any; className?: string; }
const Product360Viewer: React.FC<Product360ViewerProps> = ({ ${dataName}, className }) => {
  const viewerData = ${dataName} || {};
  const frames = viewerData.frames || ${getField('frames')};
  const autoRotate = viewerData.autoRotate ?? ${getField('autoRotate')};
  const rotationSpeed = viewerData.rotationSpeed || ${getField('rotationSpeed')};
  const enableZoom = viewerData.enableZoom ?? ${getField('enableZoom')};
  const maxZoom = viewerData.maxZoom || ${getField('maxZoom')};
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let loaded = 0;
    frames.forEach((src: string) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadedImages(loaded);
        if (loaded === frames.length) setIsLoading(false);
      };
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    if (!isPlaying || isLoading || isDragging) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, rotationSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, rotationSpeed, isLoading, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + direction + frames.length) % frames.length);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, maxZoom));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (<>
<div className={className}>
      <div ref={containerRef} className="viewer-container">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading {loadedImages}/{frames.length}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="viewer-canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <img src={frames[currentFrame]} alt={\`360 view frame \${currentFrame}\`} className="product-image" style={{ transform: \`scale(\${zoomLevel})\` }} />
              {!isDragging && !isPlaying && <div className="drag-hint">← Drag to rotate →</div>}
            </div>
            <div className="progress-indicator">{Math.round((currentFrame / frames.length) * 360)}°</div>
            <div className="viewer-controls">
              <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              {enableZoom && (
                <>
                  <button onClick={handleZoomIn} className="control-btn" disabled={zoomLevel >= maxZoom}><ZoomIn className="w-5 h-5" /></button>
                  <button onClick={handleZoomOut} className="control-btn" disabled={zoomLevel <= 1}><ZoomOut className="w-5 h-5" /></button>
                </>
              )}
              <button onClick={toggleFullscreen} className="control-btn"><Maximize className="w-5 h-5" /></button>
              <button onClick={() => setCurrentFrame(0)} className="control-btn"><RotateCw className="w-5 h-5" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  </>);
};
export default Product360Viewer;`
  };

  return variants[variant] || variants.drag;
};
