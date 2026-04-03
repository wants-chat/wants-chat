import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLightboxModalViewer = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'advanced' | 'gallery' = 'advanced'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2, Maximize, Minimize, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .lightbox-overlay {
      @apply fixed inset-0 bg-black/95 z-50;
    }

    .lightbox-content {
      @apply relative w-full h-screen flex items-center justify-center;
    }

    .lightbox-image-container {
      @apply relative flex items-center justify-center flex-1 overflow-hidden;
    }

    .lightbox-image {
      @apply max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300;
    }

    .lightbox-controls {
      @apply absolute top-4 right-4 flex gap-2 z-10;
    }

    .lightbox-button {
      @apply bg-white/90 hover:bg-white text-gray-900 p-2 rounded-lg shadow-lg transition-all;
    }

    .nav-button {
      @apply absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all;
    }

    .nav-button.left {
      @apply left-4;
    }

    .nav-button.right {
      @apply right-4;
    }

    .image-info {
      @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white;
    }

    .image-title {
      @apply text-xl font-semibold mb-1;
    }

    .image-description {
      @apply text-sm text-gray-300;
    }

    .image-counter {
      @apply absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-sm font-medium;
    }

    .thumbnail-strip {
      @apply absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex gap-2 overflow-x-auto;
    }

    .thumbnail {
      @apply w-20 h-16 rounded cursor-pointer opacity-50 hover:opacity-100 transition-opacity border-2 border-transparent;
    }

    .thumbnail.active {
      @apply opacity-100 border-white;
    }

    .zoom-level {
      @apply absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-lg text-xs font-medium;
    }
  `;

  const variants = {
    simple: `
${commonImports}

interface LightboxModalViewerProps {
  ${dataName}?: any;
  isOpen?: boolean;
  initialIndex?: number;
  onClose?: () => void;
  className?: string;
}

const LightboxModalViewer: React.FC<LightboxModalViewerProps> = ({
  ${dataName}: propData,
  isOpen = false,
  initialIndex = 0,
  onClose,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const lightboxData = ${dataName} || {};

  const images = lightboxData.images || ${getField('images')};
  const closeText = lightboxData.closeText || ${getField('closeText')};
  const previousText = lightboxData.previousText || ${getField('previousText')};
  const nextText = lightboxData.nextText || ${getField('nextText')};

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
    setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  if (isLoading && !propData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, currentIndex]);

  const currentImage = images[currentIndex];

  return (
    <>
<Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
          <div className="lightbox-content">
            <button
              onClick={handleClose}
              className="lightbox-button absolute top-4 right-4"
              aria-label={closeText}
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="nav-button left"
                  aria-label={previousText}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="nav-button right"
                  aria-label={nextText}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="lightbox-image-container">
              <img
                src={currentImage?.url || '/api/placeholder/1920/1080'}
                alt={currentImage?.title || \`Image \${currentIndex + 1}\`}
                className="lightbox-image"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LightboxModalViewer;
    `,

    advanced: `
${commonImports}

interface LightboxModalViewerProps {
  ${dataName}?: any;
  isOpen?: boolean;
  initialIndex?: number;
  onClose?: () => void;
  className?: string;
}

const LightboxModalViewer: React.FC<LightboxModalViewerProps> = ({
  ${dataName}: propData,
  isOpen = false,
  initialIndex = 0,
  onClose,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const lightboxData = ${dataName} || {};

  const images = lightboxData.images || ${getField('images')};
  const enableZoom = lightboxData.enableZoom ?? ${getField('enableZoom')};
  const enableDownload = lightboxData.enableDownload ?? ${getField('enableDownload')};
  const enableShare = lightboxData.enableShare ?? ${getField('enableShare')};
  const maxZoom = lightboxData.maxZoom || ${getField('maxZoom')};
  const minZoom = lightboxData.minZoom || ${getField('minZoom')};
  const closeText = lightboxData.closeText || ${getField('closeText')};
  const previousText = lightboxData.previousText || ${getField('previousText')};
  const nextText = lightboxData.nextText || ${getField('nextText')};
  const zoomInText = lightboxData.zoomInText || ${getField('zoomInText')};
  const zoomOutText = lightboxData.zoomOutText || ${getField('zoomOutText')};
  const downloadText = lightboxData.downloadText || ${getField('downloadText')};
  const shareText = lightboxData.shareText || ${getField('shareText')};
  const ofText = lightboxData.ofText || ${getField('ofText')};

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [open, setOpen] = useState(isOpen);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
    setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  if (isLoading && !propData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    setOpen(false);
    setZoomLevel(1);
    onClose?.();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, minZoom));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage?.url || '';
    link.download = currentImage?.title || \`image-\${currentIndex + 1}.jpg\`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: currentImage?.title || 'Image',
        text: currentImage?.description || '',
        url: currentImage?.url || ''
      });
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === '+' || e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, currentIndex, zoomLevel]);

  const currentImage = images[currentIndex];

  return (
    <>
<Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
          <div className="lightbox-content">
            <div className="lightbox-controls">
              {enableZoom && (
                <>
                  <button
                    onClick={handleZoomIn}
                    className="lightbox-button"
                    aria-label={zoomInText}
                    disabled={zoomLevel >= maxZoom}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="lightbox-button"
                    aria-label={zoomOutText}
                    disabled={zoomLevel <= minZoom}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={toggleFullscreen}
                className="lightbox-button"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
              {enableDownload && (
                <button
                  onClick={handleDownload}
                  className="lightbox-button"
                  aria-label={downloadText}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {enableShare && (
                <button
                  onClick={handleShare}
                  className="lightbox-button"
                  aria-label={shareText}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="lightbox-button"
                aria-label={closeText}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {images.length > 1 && (
              <>
                <div className="image-counter">
                  {currentIndex + 1} {ofText} {images.length}
                </div>

                <button
                  onClick={handlePrevious}
                  className="nav-button left"
                  aria-label={previousText}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="nav-button right"
                  aria-label={nextText}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="lightbox-image-container">
              <img
                src={currentImage?.url || '/api/placeholder/1920/1080'}
                alt={currentImage?.title || \`Image \${currentIndex + 1}\`}
                className="lightbox-image"
                style={{ transform: \`scale(\${zoomLevel})\` }}
              />
            </div>

            {currentImage?.title && (
              <div className="image-info">
                <h2 className="image-title">{currentImage.title}</h2>
                {currentImage.description && (
                  <p className="image-description">{currentImage.description}</p>
                )}
              </div>
            )}

            {enableZoom && zoomLevel > 1 && (
              <div className="zoom-level">
                {Math.round(zoomLevel * 100)}%
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LightboxModalViewer;
    `,

    gallery: `
${commonImports}

interface LightboxModalViewerProps {
  ${dataName}?: any;
  isOpen?: boolean;
  initialIndex?: number;
  onClose?: () => void;
  className?: string;
}

const LightboxModalViewer: React.FC<LightboxModalViewerProps> = ({
  ${dataName}: propData,
  isOpen = false,
  initialIndex = 0,
  onClose,
  className
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const lightboxData = ${dataName} || {};

  const images = lightboxData.images || ${getField('images')};
  const enableZoom = lightboxData.enableZoom ?? ${getField('enableZoom')};
  const enableDownload = lightboxData.enableDownload ?? ${getField('enableDownload')};
  const maxZoom = lightboxData.maxZoom || ${getField('maxZoom')};
  const minZoom = lightboxData.minZoom || ${getField('minZoom')};
  const closeText = lightboxData.closeText || ${getField('closeText')};
  const previousText = lightboxData.previousText || ${getField('previousText')};
  const nextText = lightboxData.nextText || ${getField('nextText')};
  const zoomInText = lightboxData.zoomInText || ${getField('zoomInText')};
  const zoomOutText = lightboxData.zoomOutText || ${getField('zoomOutText')};
  const downloadText = lightboxData.downloadText || ${getField('downloadText')};
  const ofText = lightboxData.ofText || ${getField('ofText')};

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [open, setOpen] = useState(isOpen);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setOpen(isOpen);
    setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  if (isLoading && !propData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    setOpen(false);
    setZoomLevel(1);
    onClose?.();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, minZoom));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage?.url || '';
    link.download = currentImage?.title || \`image-\${currentIndex + 1}.jpg\`;
    link.click();
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === '+' || e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, currentIndex, zoomLevel]);

  const currentImage = images[currentIndex];

  return (
    <>
<Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
          <div className="lightbox-content">
            <div className="lightbox-controls">
              {enableZoom && (
                <>
                  <button
                    onClick={handleZoomIn}
                    className="lightbox-button"
                    aria-label={zoomInText}
                    disabled={zoomLevel >= maxZoom}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="lightbox-button"
                    aria-label={zoomOutText}
                    disabled={zoomLevel <= minZoom}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </>
              )}
              {enableDownload && (
                <button
                  onClick={handleDownload}
                  className="lightbox-button"
                  aria-label={downloadText}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="lightbox-button"
                aria-label={closeText}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="image-counter">
              {currentIndex + 1} {ofText} {images.length}
            </div>

            <button
              onClick={handlePrevious}
              className="nav-button left"
              aria-label={previousText}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="nav-button right"
              aria-label={nextText}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="lightbox-image-container" style={{ marginBottom: '120px' }}>
              <img
                src={currentImage?.url || '/api/placeholder/1920/1080'}
                alt={currentImage?.title || \`Image \${currentIndex + 1}\`}
                className="lightbox-image"
                style={{ transform: \`scale(\${zoomLevel})\` }}
              />
            </div>

            {/* Thumbnail Strip */}
            <div className="thumbnail-strip">
              {images.map((image: any, index: number) => (
                <img
                  key={image.id || index}
                  src={image.thumbnail || image.url || '/api/placeholder/200/150'}
                  alt={image.title || \`Thumbnail \${index + 1}\`}
                  className={\`thumbnail \${currentIndex === index ? 'active' : ''}\`}
                  onClick={() => selectImage(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LightboxModalViewer;
    `
  };

  return variants[variant] || variants.advanced;
};
