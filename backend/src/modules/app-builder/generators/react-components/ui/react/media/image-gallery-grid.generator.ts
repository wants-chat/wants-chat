import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateImageGalleryGrid = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'fourColumn' = 'threeColumn'
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
    return `/${dataSource || 'gallery'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'gallery';

  const gridColumns = {
    twoColumn: 'grid-cols-1 md:grid-cols-2',
    threeColumn: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    fourColumn: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const commonImports = `
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .gallery-grid {
      @apply w-full;
    }

    .gallery-item {
      @apply relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-300;
    }

    .gallery-item:hover {
      @apply ring-2 ring-blue-500 shadow-lg;
    }

    .gallery-image {
      @apply w-full h-full object-cover transition-transform duration-500;
    }

    .gallery-item:hover .gallery-image {
      @apply scale-110;
    }

    .image-overlay {
      @apply absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 flex flex-col justify-end p-4;
    }

    .gallery-item:hover .image-overlay {
      @apply opacity-100;
    }

    .image-caption {
      @apply text-white font-semibold text-sm mb-1;
    }

    .image-photographer {
      @apply text-gray-300 text-xs;
    }

    .lightbox-container {
      @apply relative w-full h-screen flex items-center justify-center;
    }

    .lightbox-image {
      @apply max-w-[90vw] max-h-[90vh] object-contain;
    }

    .lightbox-button {
      @apply absolute bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-50;
    }

    .image-counter {
      @apply absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium;
    }

    .zoom-indicator {
      @apply absolute top-4 left-4 bg-white/90 p-2 rounded-full opacity-0 transition-opacity;
    }

    .gallery-item:hover .zoom-indicator {
      @apply opacity-100;
    }
  `;

  const variants = {
    twoColumn: `
${commonImports}

interface ImageGalleryGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryGrid: React.FC<ImageGalleryGridProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const images = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableLightbox = galleryData.enableLightbox ?? ${getField('enableLightbox')};
  const enableHoverOverlay = galleryData.enableHoverOverlay ?? ${getField('enableHoverOverlay')};
  const showCaptions = galleryData.showCaptions ?? ${getField('showCaptions')};
  const closeText = galleryData.closeText || ${getField('closeText')};
  const previousText = galleryData.previousText || ${getField('previousText')};
  const nextText = galleryData.nextText || ${getField('nextText')};
  const ofText = galleryData.ofText || ${getField('ofText')};

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setSelectedImage(index);
    }
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  return (
    <>
<div className={className}>
        <div className={\`gallery-grid grid ${gridColumns.twoColumn} gap-\${gap}\`}>
          {images.map((image: any, index: number) => (
            <div
              key={image.id || index}
              className="gallery-item aspect-[4/3]"
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              onClick={() => openLightbox(index)}
            >
              {loadedImages.has(index) ? (
                <>
                  <img
                    src={image.url || '/api/placeholder/800/600'}
                    alt={image.caption || \`Gallery image \${index + 1}\`}
                    className="gallery-image"
                  />
                  {enableHoverOverlay && (
                    <div className="image-overlay">
                      {showCaptions && (
                        <>
                          <h3 className="image-caption">{image.caption}</h3>
                          {image.photographer && (
                            <p className="image-photographer">by {image.photographer}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {enableLightbox && (
                    <div className="zoom-indicator">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {enableLightbox && selectedImage !== null && (
          <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
              <div className="lightbox-container">
                <button
                  onClick={closeLightbox}
                  className="lightbox-button top-4 right-4"
                  aria-label={closeText}
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="lightbox-button top-1/2 -translate-y-1/2 left-4"
                  aria-label={previousText}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="lightbox-button top-1/2 -translate-y-1/2 right-4"
                  aria-label={nextText}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <img
                  src={images[selectedImage]?.url || '/api/placeholder/1200/900'}
                  alt={images[selectedImage]?.caption || \`Gallery image \${selectedImage + 1}\`}
                  className="lightbox-image"
                />

                <div className="image-counter">
                  {selectedImage + 1} {ofText} {images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ImageGalleryGrid;
    `,

    threeColumn: `
${commonImports}

interface ImageGalleryGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryGrid: React.FC<ImageGalleryGridProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const images = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableLightbox = galleryData.enableLightbox ?? ${getField('enableLightbox')};
  const enableHoverOverlay = galleryData.enableHoverOverlay ?? ${getField('enableHoverOverlay')};
  const showCaptions = galleryData.showCaptions ?? ${getField('showCaptions')};
  const closeText = galleryData.closeText || ${getField('closeText')};
  const previousText = galleryData.previousText || ${getField('previousText')};
  const nextText = galleryData.nextText || ${getField('nextText')};
  const ofText = galleryData.ofText || ${getField('ofText')};

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setSelectedImage(index);
    }
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  return (
    <>
<div className={className}>
        <div className={\`gallery-grid grid ${gridColumns.threeColumn} gap-\${gap}\`}>
          {images.map((image: any, index: number) => (
            <div
              key={image.id || index}
              className="gallery-item aspect-square"
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              onClick={() => openLightbox(index)}
            >
              {loadedImages.has(index) ? (
                <>
                  <img
                    src={image.url || '/api/placeholder/800/800'}
                    alt={image.caption || \`Gallery image \${index + 1}\`}
                    className="gallery-image"
                  />
                  {enableHoverOverlay && (
                    <div className="image-overlay">
                      {showCaptions && (
                        <>
                          <h3 className="image-caption">{image.caption}</h3>
                          {image.photographer && (
                            <p className="image-photographer">by {image.photographer}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {enableLightbox && (
                    <div className="zoom-indicator">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {enableLightbox && selectedImage !== null && (
          <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
              <div className="lightbox-container">
                <button
                  onClick={closeLightbox}
                  className="lightbox-button top-4 right-4"
                  aria-label={closeText}
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="lightbox-button top-1/2 -translate-y-1/2 left-4"
                  aria-label={previousText}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="lightbox-button top-1/2 -translate-y-1/2 right-4"
                  aria-label={nextText}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <img
                  src={images[selectedImage]?.url || '/api/placeholder/1200/1200'}
                  alt={images[selectedImage]?.caption || \`Gallery image \${selectedImage + 1}\`}
                  className="lightbox-image"
                />

                <div className="image-counter">
                  {selectedImage + 1} {ofText} {images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ImageGalleryGrid;
    `,

    fourColumn: `
${commonImports}

interface ImageGalleryGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryGrid: React.FC<ImageGalleryGridProps> = ({ ${dataName}: propData, className }) => {
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

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const images = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableLightbox = galleryData.enableLightbox ?? ${getField('enableLightbox')};
  const enableHoverOverlay = galleryData.enableHoverOverlay ?? ${getField('enableHoverOverlay')};
  const showCaptions = galleryData.showCaptions ?? ${getField('showCaptions')};
  const closeText = galleryData.closeText || ${getField('closeText')};
  const previousText = galleryData.previousText || ${getField('previousText')};
  const nextText = galleryData.nextText || ${getField('nextText')};
  const ofText = galleryData.ofText || ${getField('ofText')};

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setSelectedImage(index);
    }
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  return (
    <>
<div className={className}>
        <div className={\`gallery-grid grid ${gridColumns.fourColumn} gap-\${gap}\`}>
          {images.map((image: any, index: number) => (
            <div
              key={image.id || index}
              className="gallery-item aspect-square"
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              onClick={() => openLightbox(index)}
            >
              {loadedImages.has(index) ? (
                <>
                  <img
                    src={image.url || '/api/placeholder/600/600'}
                    alt={image.caption || \`Gallery image \${index + 1}\`}
                    className="gallery-image"
                  />
                  {enableHoverOverlay && (
                    <div className="image-overlay">
                      {showCaptions && (
                        <>
                          <h3 className="image-caption">{image.caption}</h3>
                          {image.photographer && (
                            <p className="image-photographer">by {image.photographer}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {enableLightbox && (
                    <div className="zoom-indicator">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {enableLightbox && selectedImage !== null && (
          <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
              <div className="lightbox-container">
                <button
                  onClick={closeLightbox}
                  className="lightbox-button top-4 right-4"
                  aria-label={closeText}
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="lightbox-button top-1/2 -translate-y-1/2 left-4"
                  aria-label={previousText}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="lightbox-button top-1/2 -translate-y-1/2 right-4"
                  aria-label={nextText}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <img
                  src={images[selectedImage]?.url || '/api/placeholder/1200/1200'}
                  alt={images[selectedImage]?.caption || \`Gallery image \${selectedImage + 1}\`}
                  className="lightbox-image"
                />

                <div className="image-counter">
                  {selectedImage + 1} {ofText} {images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ImageGalleryGrid;
    `
  };

  return variants[variant] || variants.threeColumn;
};
