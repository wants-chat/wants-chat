import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBeforeAfterSlider = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'vertical' | 'hover' = 'horizontal'
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
    return `/${dataSource || 'slider'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'slider';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .slider-container { @apply relative w-full overflow-hidden rounded-lg select-none; }
    .slider-images { @apply relative w-full h-full; }
    .image-layer { @apply absolute top-0 left-0 w-full h-full object-cover; }
    .before-image { @apply z-0; }
    .after-image { @apply z-10; }
    .slider-handle { @apply absolute z-20 cursor-ew-resize flex items-center justify-center; }
    .slider-handle.horizontal { @apply top-0 bottom-0 w-1 bg-white shadow-lg; }
    .slider-handle.vertical { @apply left-0 right-0 h-1 bg-white shadow-lg cursor-ns-resize; }
    .handle-button { @apply absolute bg-white rounded-full p-2 shadow-lg; }
    .handle-button.horizontal { @apply -left-4; }
    .handle-button.vertical { @apply -top-4; }
    .label { @apply absolute z-20 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold; }
    .label.before { @apply top-4 left-4; }
    .label.after { @apply top-4 right-4; }
  `;

  const variants = {
    horizontal: `${commonImports}
interface BeforeAfterSliderProps { ${dataName}?: any; className?: string; }
const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ ${dataName}: propData, className }) => {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};
  const beforeImage = sliderData.beforeImage || ${getField('beforeImage')};
  const afterImage = sliderData.afterImage || ${getField('afterImage')};
  const beforeLabel = sliderData.beforeLabel || ${getField('beforeLabel')};
  const afterLabel = sliderData.afterLabel || ${getField('afterLabel')};
  const initialPosition = sliderData.initialPosition || ${getField('initialPosition')};
  const [sliderPosition, setSliderPosition] = useState(initialPosition);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (<>
<div className={className}>
      <div ref={containerRef} className="slider-container" style={{ height: '500px' }}>
        <div className="slider-images">
          <img src={beforeImage} alt={beforeLabel} className="image-layer before-image" />
          <div className="image-layer after-image" style={{ clipPath: \`inset(0 \${100 - sliderPosition}% 0 0)\` }}>
            <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
          </div>
          <div className="slider-handle horizontal" style={{ left: \`\${sliderPosition}%\` }} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
            <div className="handle-button horizontal"><ChevronLeft className="w-4 h-4 absolute left-0" /><ChevronRight className="w-4 h-4 absolute right-0" /></div>
          </div>
          <div className="label before">{beforeLabel}</div>
          <div className="label after">{afterLabel}</div>
        </div>
      </div>
    </div>
  </>);
};
export default BeforeAfterSlider;`,

    vertical: `${commonImports}
interface BeforeAfterSliderProps { ${dataName}?: any; className?: string; }
const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ ${dataName}: propData, className }) => {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};
  const beforeImage = sliderData.beforeImage || ${getField('beforeImage')};
  const afterImage = sliderData.afterImage || ${getField('afterImage')};
  const beforeLabel = sliderData.beforeLabel || ${getField('beforeLabel')};
  const afterLabel = sliderData.afterLabel || ${getField('afterLabel')};
  const initialPosition = sliderData.initialPosition || ${getField('initialPosition')};
  const [sliderPosition, setSliderPosition] = useState(initialPosition);

  const handleMove = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = (y / rect.height) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientY);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (<>
<div className={className}>
      <div ref={containerRef} className="slider-container" style={{ height: '600px' }}>
        <div className="slider-images">
          <img src={beforeImage} alt={beforeLabel} className="image-layer before-image" />
          <div className="image-layer after-image" style={{ clipPath: \`inset(\${sliderPosition}% 0 0 0)\` }}>
            <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
          </div>
          <div className="slider-handle vertical" style={{ top: \`\${sliderPosition}%\` }} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
            <div className="handle-button vertical"><div className="bg-white rounded-full p-2 shadow-lg">↕</div></div>
          </div>
          <div className="label before">{beforeLabel}</div>
          <div className="label after" style={{ top: 'auto', bottom: '1rem' }}>{afterLabel}</div>
        </div>
      </div>
    </div>
  </>);
};
export default BeforeAfterSlider;`,

    hover: `${commonImports}
interface BeforeAfterSliderProps { ${dataName}?: any; className?: string; }
const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ ${dataName}: propData, className }) => {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};
  const beforeImage = sliderData.beforeImage || ${getField('beforeImage')};
  const afterImage = sliderData.afterImage || ${getField('afterImage')};
  const beforeLabel = sliderData.beforeLabel || ${getField('beforeLabel')};
  const afterLabel = sliderData.afterLabel || ${getField('afterLabel')};

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseLeave = () => {
    setSliderPosition(50);
  };

  return (<>
<div className={className}>
      <div ref={containerRef} className="slider-container" style={{ height: '500px' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="slider-images">
          <img src={beforeImage} alt={beforeLabel} className="image-layer before-image" />
          <div className="image-layer after-image transition-all duration-100" style={{ clipPath: \`inset(0 \${100 - sliderPosition}% 0 0)\` }}>
            <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
          </div>
          <div className="slider-handle horizontal transition-all duration-100" style={{ left: \`\${sliderPosition}%\` }}>
            <div className="handle-button horizontal"><ChevronLeft className="w-4 h-4 absolute left-0" /><ChevronRight className="w-4 h-4 absolute right-0" /></div>
          </div>
          <div className="label before">{beforeLabel}</div>
          <div className="label after">{afterLabel}</div>
        </div>
      </div>
    </div>
  </>);
};
export default BeforeAfterSlider;`
  };

  return variants[variant] || variants.horizontal;
};
