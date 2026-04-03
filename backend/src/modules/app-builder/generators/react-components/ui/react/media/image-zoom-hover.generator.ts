import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateImageZoomHover = (
  resolved: ResolvedComponent,
  variant: 'lens' | 'magnifier' | 'side' = 'lens'
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
import { ZoomIn, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .zoom-container { @apply relative inline-block overflow-hidden rounded-lg; }
    .zoom-image { @apply w-full h-full object-cover; }
    .zoom-lens { @apply absolute border-2 border-white shadow-lg pointer-events-none bg-white/20; }
    .zoom-result { @apply absolute top-0 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-xl; }
    .zoom-indicator { @apply absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full opacity-0 transition-opacity; }
    .zoom-container:hover .zoom-indicator { @apply opacity-100; }
  `;

  const variants = {
    lens: `${commonImports}
interface ImageZoomHoverProps { ${dataName}?: any; className?: string; }
const ImageZoomHover: React.FC<ImageZoomHoverProps> = ({ ${dataName}: propData, className }) => {
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

  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const lensSize = 150;

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
  const magnification = zoomData.magnification || ${getField('magnification')};

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    const bgX = ((x / rect.width) * 100);
    const bgY = ((y / rect.height) * 100);

    setLensPosition({ x: lensX, y: lensY });
    setBgPosition({ x: bgX, y: bgY });
    setShowLens(true);
  };

  const handleMouseLeave = () => setShowLens(false);

  return (<>
<div className={className}>
      <div className="zoom-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <img ref={imageRef} src={image} alt="Zoomable" className="zoom-image" />
        {showLens && (
          <>
            <div className="zoom-lens" style={{ left: \`\${lensPosition.x}px\`, top: \`\${lensPosition.y}px\`, width: \`\${lensSize}px\`, height: \`\${lensSize}px\` }} />
            <div className="zoom-result" style={{ left: '110%', width: '400px', height: '400px', backgroundImage: \`url(\${zoomedImage})\`, backgroundPosition: \`\${bgPosition.x}% \${bgPosition.y}%\`, backgroundSize: \`\${magnification * 100}%\` }} />
          </>
        )}
        <div className="zoom-indicator"><ZoomIn className="w-4 h-4" /></div>
      </div>
    </div>
  </>);
};
export default ImageZoomHover;`,

    magnifier: `${commonImports}
interface ImageZoomHoverProps { ${dataName}?: any; className?: string; }
const ImageZoomHover: React.FC<ImageZoomHoverProps> = ({ ${dataName}: propData, className }) => {
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

  const [showMagnifier, setShowMagnifier] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const magnifierSize = 200;

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
  const magnification = zoomData.magnification || ${getField('magnification')};

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => setShowMagnifier(false);

  return (<>
<div className={className}>
      <div className="zoom-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <img ref={imageRef} src={image} alt="Zoomable" className="zoom-image" />
        {showMagnifier && (
          <div className="absolute rounded-full border-4 border-white shadow-2xl pointer-events-none overflow-hidden" style={{ left: \`\${position.x - magnifierSize / 2}px\`, top: \`\${position.y - magnifierSize / 2}px\`, width: \`\${magnifierSize}px\`, height: \`\${magnifierSize}px\`, backgroundImage: \`url(\${zoomedImage})\`, backgroundPosition: \`\${(position.x / (imageRef.current?.width || 1)) * 100}% \${(position.y / (imageRef.current?.height || 1)) * 100}%\`, backgroundSize: \`\${magnification * 100}%\` }} />
        )}
        <div className="zoom-indicator"><ZoomIn className="w-4 h-4" /></div>
      </div>
    </div>
  </>);
};
export default ImageZoomHover;`,

    side: `${commonImports}
interface ImageZoomHoverProps { ${dataName}?: any; className?: string; }
const ImageZoomHover: React.FC<ImageZoomHoverProps> = ({ ${dataName}: propData, className }) => {
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

  const [isHovering, setIsHovering] = useState(false);
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLImageElement>(null);

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
  const magnification = zoomData.magnification || ${getField('magnification')};

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    setBgPosition({ x: bgX, y: bgY });
    setIsHovering(true);
  };

  const handleMouseLeave = () => setIsHovering(false);

  return (<>
<div className={className}>
      <div className="flex gap-4">
        <div className="zoom-container flex-1" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <img ref={imageRef} src={image} alt="Zoomable" className="zoom-image" />
          <div className="zoom-indicator"><ZoomIn className="w-4 h-4" /></div>
        </div>
        <div className={\`flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-opacity \${isHovering ? 'opacity-100' : 'opacity-0'}\`} style={{ backgroundImage: \`url(\${zoomedImage})\`, backgroundPosition: \`\${bgPosition.x}% \${bgPosition.y}%\`, backgroundSize: \`\${magnification * 100}%\`, backgroundRepeat: 'no-repeat', minHeight: '400px' }} />
      </div>
    </div>
  </>);
};
export default ImageZoomHover;`
  };

  return variants[variant] || variants.lens;
};
