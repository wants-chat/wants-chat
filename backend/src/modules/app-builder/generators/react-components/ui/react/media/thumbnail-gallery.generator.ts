import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateThumbnailGallery = (
  resolved: ResolvedComponent,
  variant: 'bottom' | 'side' | 'grid' = 'bottom'
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
    return `/${dataSource || 'gallery'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'gallery';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .gallery-main { @apply relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden; }
    .main-image { @apply w-full h-full object-contain; }
    .thumbnail-list { @apply flex gap-2 overflow-x-auto; }
    .thumbnail { @apply cursor-pointer rounded border-2 transition-all flex-shrink-0; }
    .thumbnail.active { @apply border-blue-500 ring-2 ring-blue-200; }
    .thumbnail:not(.active) { @apply border-transparent hover:border-gray-400; }
    .thumbnail-image { @apply w-full h-full object-cover; }
    .counter { @apply absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm; }
    .nav-btn { @apply absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100; }
  `;

  const variants = {
    bottom: `${commonImports}
interface ThumbnailGalleryProps { ${dataName}?: any; className?: string; }
const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};
  const images = galleryData.images || ${getField('images')};
  const currentImage = images[selectedIndex];

  return (<>
<div className={className}>
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl group" style={{ height: '500px' }}>
          <img src={currentImage.url} alt={currentImage.title} className="w-full h-full object-contain" />
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">{selectedIndex + 1} / {images.length}</div>
          <button onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)} className="absolute top-1/2 -translate-y-1/2 left-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)} className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img: any, idx: number) => (
            <div key={img.id} onClick={() => setSelectedIndex(idx)} className={\`cursor-pointer rounded-xl border-2 transition-all duration-300 flex-shrink-0 hover:scale-105 \${selectedIndex === idx ? 'border-blue-500 dark:border-purple-500 ring-4 ring-blue-200 dark:ring-purple-900/50 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-700'}\`}>
              <img src={img.thumbnail || img.url} alt={img.title} className="w-24 h-16 object-cover rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default ThumbnailGallery;`,

    side: `${commonImports}
interface ThumbnailGalleryProps { ${dataName}?: any; className?: string; }
const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};
  const images = galleryData.images || ${getField('images')};
  const currentImage = images[selectedIndex];

  return (<>
<div className={className}>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2">
          {images.map((img: any, idx: number) => (
            <div key={img.id} onClick={() => setSelectedIndex(idx)} className={\`cursor-pointer rounded-xl border-2 transition-all duration-300 hover:scale-105 \${selectedIndex === idx ? 'border-blue-500 dark:border-purple-500 ring-4 ring-blue-200 dark:ring-purple-900/50 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-700'}\`}>
              <img src={img.thumbnail || img.url} alt={img.title} className="w-20 h-20 object-cover rounded-lg" />
            </div>
          ))}
        </div>
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl flex-1 group" style={{ height: '600px' }}>
          <img src={currentImage.url} alt={currentImage.title} className="w-full h-full object-contain" />
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">{selectedIndex + 1} / {images.length}</div>
          <button onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)} className="absolute top-1/2 -translate-y-1/2 left-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)} className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  </>);
};
export default ThumbnailGallery;`,

    grid: `${commonImports}
interface ThumbnailGalleryProps { ${dataName}?: any; className?: string; }
const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};
  const images = galleryData.images || ${getField('images')};
  const currentImage = images[selectedIndex];

  return (<>
<div className={className}>
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl group" style={{ height: '500px' }}>
          <img src={currentImage.url} alt={currentImage.title} className="w-full h-full object-contain" />
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">{selectedIndex + 1} / {images.length}</div>
          <button onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)} className="absolute top-1/2 -translate-y-1/2 left-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)} className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {images.map((img: any, idx: number) => (
            <div key={img.id} onClick={() => setSelectedIndex(idx)} className={\`cursor-pointer rounded-xl border-2 transition-all duration-300 hover:scale-105 \${selectedIndex === idx ? 'border-blue-500 dark:border-purple-500 ring-4 ring-blue-200 dark:ring-purple-900/50 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-700'}\`}>
              <img src={img.thumbnail || img.url} alt={img.title} className="aspect-square object-cover rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
};
export default ThumbnailGallery;`
  };

  return variants[variant] || variants.bottom;
};
