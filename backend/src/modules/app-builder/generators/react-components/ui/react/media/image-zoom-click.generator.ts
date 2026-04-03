import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateImageZoomClick = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'inline' | 'pinch' = 'modal'
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
    return `/${dataSource || 'image'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'image';

  const commonImports = `
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ZoomIn, ZoomOut, X, Maximize2, RotateCcw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';`;

  const commonStyles = `
    .zoom-wrapper { @apply relative cursor-pointer; }
    .zoom-image { @apply w-full h-full object-contain transition-transform duration-300; }
    .zoom-controls { @apply absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-2 flex gap-2 shadow-lg; }
    .zoom-btn { @apply text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
    .zoom-indicator { @apply absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-lg text-sm font-medium; }
    .pan-container { @apply overflow-hidden cursor-grab active:cursor-grabbing; }
  `;

  const variants = {
    modal: `${commonImports}
interface ImageZoomClickProps { ${dataName}?: any; className?: string; }
const ImageZoomClick: React.FC<ImageZoomClickProps> = ({ ${dataName}: propData, className }) => {
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

  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const zoomData = ${dataName} || {};
  const image = zoomData.image || ${getField('image')};
  const zoomedImage = zoomData.zoomedImage || ${getField('zoomedImage')};
  const maxZoom = zoomData.maxZoom || ${getField('maxZoom')};
  const minZoom = zoomData.minZoom || ${getField('minZoom')};
  const zoomStep = zoomData.zoomStep || ${getField('zoomStep')};

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  const handleReset = () => { setZoomLevel(1); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (<>
<div className={className}>
      <div className="zoom-wrapper" onClick={() => setIsOpen(true)}>
        <img src={image} alt="Click to zoom" className="zoom-image rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors rounded-lg">
          <Maximize2 className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
          <div className="relative w-full h-screen flex items-center justify-center overflow-hidden" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg z-50"><X className="w-5 h-5" /></button>
            <img src={zoomedImage} alt="Zoomed" className="zoom-image max-w-none" style={{ transform: \`scale(\${zoomLevel}) translate(\${position.x / zoomLevel}px, \${position.y / zoomLevel}px)\` }} />
            <div className="zoom-indicator">{Math.round(zoomLevel * 100)}%</div>
            <div className="zoom-controls">
              <button onClick={handleZoomOut} className="zoom-btn" disabled={zoomLevel <= minZoom}><ZoomOut className="w-5 h-5" /></button>
              <button onClick={handleReset} className="zoom-btn"><RotateCcw className="w-5 h-5" /></button>
              <button onClick={handleZoomIn} className="zoom-btn" disabled={zoomLevel >= maxZoom}><ZoomIn className="w-5 h-5" /></button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </>);
};
export default ImageZoomClick;`,

    inline: `${commonImports}
interface ImageZoomClickProps { ${dataName}?: any; className?: string; }
const ImageZoomClick: React.FC<ImageZoomClickProps> = ({ ${dataName}: propData, className }) => {
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

  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const zoomData = ${dataName} || {};
  const image = zoomData.image || ${getField('image')};
  const maxZoom = zoomData.maxZoom || ${getField('maxZoom')};
  const minZoom = zoomData.minZoom || ${getField('minZoom')};
  const zoomStep = zoomData.zoomStep || ${getField('zoomStep')};

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  const handleReset = () => { setZoomLevel(1); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (<>
<div className={className}>
      <div className="relative">
        <div className={\`pan-container rounded-lg bg-gray-100 dark:bg-gray-900 \${zoomLevel > 1 ? 'cursor-grab' : ''}\`} style={{ height: '600px' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <img src={image} alt="Zoomable" className="zoom-image" style={{ transform: \`scale(\${zoomLevel}) translate(\${position.x / zoomLevel}px, \${position.y / zoomLevel}px)\` }} />
        </div>
        <div className="zoom-indicator">{Math.round(zoomLevel * 100)}%</div>
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-btn" disabled={zoomLevel <= minZoom}><ZoomOut className="w-5 h-5" /></button>
          <button onClick={handleReset} className="zoom-btn"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleZoomIn} className="zoom-btn" disabled={zoomLevel >= maxZoom}><ZoomIn className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  </>);
};
export default ImageZoomClick;`,

    pinch: `${commonImports}
interface ImageZoomClickProps { ${dataName}?: any; className?: string; }
const ImageZoomClick: React.FC<ImageZoomClickProps> = ({ ${dataName}: propData, className }) => {
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

  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const zoomData = ${dataName} || {};
  const image = zoomData.image || ${getField('image')};
  const maxZoom = zoomData.maxZoom || ${getField('maxZoom')};
  const minZoom = zoomData.minZoom || ${getField('minZoom')};
  const zoomStep = zoomData.zoomStep || ${getField('zoomStep')};

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  const handleReset = () => { setZoomLevel(1); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance > 0) {
      const distance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const delta = distance - touchDistance;
      const zoomChange = delta * 0.01;
      setZoomLevel(prev => Math.max(minZoom, Math.min(maxZoom, prev + zoomChange)));
      setTouchDistance(distance);
    }
  };

  return (<>
<div className={className}>
      <div className="relative">
        <div className={\`pan-container rounded-lg bg-gray-100 dark:bg-gray-900 \${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''}\`} style={{ height: '600px', touchAction: 'none' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
          <img src={image} alt="Zoomable" className="zoom-image" style={{ transform: \`scale(\${zoomLevel}) translate(\${position.x / zoomLevel}px, \${position.y / zoomLevel}px)\` }} />
          {zoomLevel === 1 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
              Pinch to zoom or use buttons below
            </div>
          )}
        </div>
        <div className="zoom-indicator">{Math.round(zoomLevel * 100)}%</div>
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-btn" disabled={zoomLevel <= minZoom}><ZoomOut className="w-5 h-5" /></button>
          <button onClick={handleReset} className="zoom-btn"><RotateCcw className="w-5 h-5" /></button>
          <button onClick={handleZoomIn} className="zoom-btn" disabled={zoomLevel >= maxZoom}><ZoomIn className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  </>);
};
export default ImageZoomClick;`
  };

  return variants[variant] || variants.modal;
};
