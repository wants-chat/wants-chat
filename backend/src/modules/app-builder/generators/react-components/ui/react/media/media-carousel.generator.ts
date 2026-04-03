import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMediaCarousel = (
  resolved: ResolvedComponent,
  variant: 'auto' | 'manual' | 'mixed' = 'auto'
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
    return `/${dataSource || 'media'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'media';

  const commonImports = `
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Maximize, Play, Pause, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';`;

  const commonStyles = `
    .carousel-container { @apply relative w-full bg-black rounded-lg overflow-hidden; }
    .carousel-viewport { @apply relative w-full; padding-bottom: 56.25%; }
    .carousel-media { @apply absolute top-0 left-0 w-full h-full object-cover; }
    .carousel-nav { @apply absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100; }
    .carousel-nav.left { @apply left-4; }
    .carousel-nav.right { @apply right-4; }
    .carousel-caption { @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white; }
    .caption-text { @apply text-xl font-semibold; }
    .thumbnail-strip { @apply absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex gap-2 overflow-x-auto opacity-0 group-hover:opacity-100 transition-opacity; }
    .thumbnail { @apply w-24 h-16 rounded cursor-pointer opacity-50 hover:opacity-100 transition-opacity border-2 border-transparent; }
    .thumbnail.active { @apply opacity-100 border-white; }
    .carousel-controls { @apply absolute top-4 right-4 flex gap-2 z-10; }
    .control-button { @apply bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all; }
    .indicator-dots { @apply absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10; }
    .dot { @apply w-2 h-2 rounded-full bg-white/50 cursor-pointer transition-all; }
    .dot.active { @apply bg-white w-8; }
  `;

  const variants = {
    auto: `${commonImports}
interface MediaCarouselProps { ${dataName}?: any; className?: string; }
const MediaCarousel: React.FC<MediaCarouselProps> = ({ ${dataName}: propData, className }) => {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const carouselData = ${dataName} || {};
  const items = carouselData.items || ${getField('items')};
  const interval = carouselData.interval || ${getField('interval')};
  const currentItem = items[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, interval]);

  return (<>
<div className={className}>
      <div className="carousel-container group" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div className="carousel-viewport">
          {currentItem.type === 'image' ? (
            <img src={currentItem.url} alt={currentItem.caption} className="carousel-media" />
          ) : (
            <video src={currentItem.url} className="carousel-media" autoPlay muted loop />
          )}
        </div>
        <button onClick={handlePrevious} className="carousel-nav left"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={handleNext} className="carousel-nav right"><ChevronRight className="w-6 h-6" /></button>
        {currentItem.caption && (
          <div className="carousel-caption"><div className="caption-text">{currentItem.caption}</div></div>
        )}
        <div className="indicator-dots">
          {items.map((_: any, idx: number) => (
            <button key={idx} onClick={() => setCurrentIndex(idx)} className={\`dot \${currentIndex === idx ? 'active' : ''}\`} />
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default MediaCarousel;`,

    manual: `${commonImports}
interface MediaCarouselProps { ${dataName}?: any; className?: string; }
const MediaCarousel: React.FC<MediaCarouselProps> = ({ ${dataName}: propData, className }) => {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const carouselData = ${dataName} || {};
  const items = carouselData.items || ${getField('items')};
  const showThumbnails = carouselData.showThumbnails ?? ${getField('showThumbnails')};
  const currentItem = items[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (<>
<div className={className}>
      <div className="carousel-container group">
        <div className="carousel-viewport">
          {currentItem.type === 'image' ? (
            <img src={currentItem.url} alt={currentItem.caption} className="carousel-media" />
          ) : (
            <video src={currentItem.url} className="carousel-media" controls />
          )}
        </div>
        <button onClick={handlePrevious} className="carousel-nav left"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={handleNext} className="carousel-nav right"><ChevronRight className="w-6 h-6" /></button>
        <div className="carousel-controls">
          <button onClick={() => setIsFullscreen(true)} className="control-button"><Maximize className="w-4 h-4" /></button>
        </div>
        {currentItem.caption && (
          <div className="carousel-caption"><div className="caption-text">{currentItem.caption}</div></div>
        )}
        {showThumbnails && (
          <div className="thumbnail-strip" style={{ paddingBottom: '80px' }}>
            {items.map((item: any, idx: number) => (
              <img key={item.id} src={item.thumbnail || item.url} alt={item.caption} onClick={() => setCurrentIndex(idx)} className={\`thumbnail \${currentIndex === idx ? 'active' : ''}\`} />
            ))}
          </div>
        )}
      </div>
      {isFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
            <div className="relative w-full h-screen flex items-center justify-center">
              <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg z-50"><X className="w-5 h-5" /></button>
              {currentItem.type === 'image' ? (
                <img src={currentItem.url} alt={currentItem.caption} className="max-w-[90vw] max-h-[90vh] object-contain" />
              ) : (
                <video src={currentItem.url} className="max-w-[90vw] max-h-[90vh]" controls autoPlay />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  </>);
};
export default MediaCarousel;`,

    mixed: `${commonImports}
interface MediaCarouselProps { ${dataName}?: any; className?: string; }
const MediaCarousel: React.FC<MediaCarouselProps> = ({ ${dataName}: propData, className }) => {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const carouselData = ${dataName} || {};
  const items = carouselData.items || ${getField('items')};
  const autoAdvance = carouselData.autoAdvance ?? ${getField('autoAdvance')};
  const interval = carouselData.interval || ${getField('interval')};
  const showThumbnails = carouselData.showThumbnails ?? ${getField('showThumbnails')};
  const [isPlaying, setIsPlaying] = useState(autoAdvance);
  const currentItem = items[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(handleNext, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, interval]);

  return (<>
<div className={className}>
      <div className="carousel-container group">
        <div className="carousel-viewport">
          {currentItem.type === 'image' ? (
            <img src={currentItem.url} alt={currentItem.caption} className="carousel-media" />
          ) : (
            <video src={currentItem.url} className="carousel-media" controls />
          )}
        </div>
        <button onClick={handlePrevious} className="carousel-nav left"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={handleNext} className="carousel-nav right"><ChevronRight className="w-6 h-6" /></button>
        <div className="carousel-controls">
          <button onClick={() => setIsPlaying(!isPlaying)} className="control-button">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsFullscreen(true)} className="control-button"><Maximize className="w-4 h-4" /></button>
        </div>
        {currentItem.caption && (
          <div className="carousel-caption"><div className="caption-text">{currentItem.caption}</div></div>
        )}
        {showThumbnails && (
          <div className="thumbnail-strip" style={{ paddingBottom: '80px' }}>
            {items.map((item: any, idx: number) => (
              <img key={item.id} src={item.thumbnail || item.url} alt={item.caption} onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }} className={\`thumbnail \${currentIndex === idx ? 'active' : ''}\`} />
            ))}
          </div>
        )}
      </div>
      {isFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
            <div className="relative w-full h-screen flex items-center justify-center">
              <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg z-50"><X className="w-5 h-5" /></button>
              {currentItem.type === 'image' ? (
                <img src={currentItem.url} alt={currentItem.caption} className="max-w-[90vw] max-h-[90vh] object-contain" />
              ) : (
                <video src={currentItem.url} className="max-w-[90vw] max-h-[90vh]" controls autoPlay />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  </>);
};
export default MediaCarousel;`
  };

  return variants[variant] || variants.auto;
};
