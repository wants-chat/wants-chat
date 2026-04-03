import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductImageGallery = (
  resolved: ResolvedComponent,
  variant: 'thumbnails' | 'carousel' | 'grid' = 'thumbnails'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .gallery-container {
      @apply w-full;
    }

    .main-image-container {
      @apply relative bg-gray-100 rounded-lg overflow-hidden;
    }

    .main-image {
      @apply w-full h-full object-contain transition-transform duration-300;
    }

    .thumbnail-container {
      @apply flex gap-2 overflow-x-auto;
    }

    .thumbnail {
      @apply cursor-pointer border-2 border-transparent rounded-lg overflow-hidden transition-all hover:border-blue-500 flex-shrink-0;
    }

    .thumbnail.active {
      @apply border-blue-500 ring-2 ring-blue-200;
    }

    .thumbnail-image {
      @apply w-full h-full object-cover;
    }

    .nav-button {
      @apply absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10;
    }

    .nav-button.left {
      @apply left-4;
    }

    .nav-button.right {
      @apply right-4;
    }

    .zoom-controls {
      @apply absolute top-4 right-4 flex gap-2 z-10;
    }

    .zoom-button {
      @apply bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all;
    }

    .lightbox-overlay {
      @apply fixed inset-0 bg-black/90 z-50 flex items-center justify-center;
    }

    .lightbox-image {
      @apply max-w-[90vw] max-h-[90vh] object-contain;
    }

    .image-counter {
      @apply absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-sm font-bold;
    }
  `;

  const variants = {
    thumbnails: `
${commonImports}

interface ProductImageGalleryProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ ${dataName}, className, showThumbnails = true }) => {
  const galleryData = ${dataName} || {};
  const galleryObj = galleryData.gallery || ${getField('gallery')};

  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  const productName = galleryObj.productName || '';
  const imagesList = galleryObj.images || [];
  const zoomEnabled = galleryObj.zoomEnabled !== undefined ? galleryObj.zoomEnabled : false;
  const previousText = ${getField('previousText')};
  const nextText = ${getField('nextText')};
  const closeText = ${getField('closeText')};
  const imageCounterText = ${getField('imageCounterText')};

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLightboxOpen, selectedImage]);

  return (
    <>
<div className="gallery-container space-y-4">
        {/* Main Image */}
        <div
          className="main-image-container h-96 md:h-[500px] group relative cursor-zoom-in"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={openLightbox}
        >
          <img
            src={imagesList[selectedImage]?.url || imagesList[selectedImage] || '/api/placeholder/800/800'}
            alt={imagesList[selectedImage]?.alt || \`\${productName} - Image \${selectedImage + 1}\`}
            className="main-image"
            style={{ transform: isHovering && zoomEnabled ? 'scale(1.2)' : 'scale(1)' }}
          />

          {/* Navigation Buttons */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="nav-button left opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={previousText}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="nav-button right opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={nextText}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Indicator */}
          {zoomEnabled && (
            <div className="zoom-controls opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="zoom-button" onClick={openLightbox}>
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {imagesList.length > 1 && (
          <div className="thumbnail-container pb-2">
            {imagesList.map((image: any, idx: number) => (
              <div
                key={image.id || idx}
                className={\`thumbnail \${selectedImage === idx ? 'active' : ''}\`}
                onClick={() => setSelectedImage(idx)}
              >
                <img
                  src={image.thumbnail || image.url || image || '/api/placeholder/150/150'}
                  alt={image.alt || \`Thumbnail \${idx + 1}\`}
                  className="thumbnail-image w-20 h-20"
                />
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {isLightboxOpen && (
          <Dialog open={isLightboxOpen} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
              <div className="relative w-full h-screen flex items-center justify-center">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full z-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full z-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full z-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="zoom-controls">
                  <button onClick={handleZoomIn} className="zoom-button">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={handleZoomOut} className="zoom-button">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                <img
                  src={imagesList[selectedImage]?.url || imagesList[selectedImage] || '/api/placeholder/1200/1200'}
                  alt={imagesList[selectedImage]?.alt || \`\${productName} - Image \${selectedImage + 1}\`}
                  className="lightbox-image"
                  style={{ transform: \`scale(\${zoomLevel})\`, transition: 'transform 0.3s' }}
                />

                <div className="image-counter">
                  {selectedImage + 1} {imageCounterText} {imagesList.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ProductImageGallery;
    `,

    carousel: `
${commonImports}

interface ProductImageGalleryProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ ${dataName}, className, showThumbnails = true }) => {
  const galleryData = ${dataName} || {};
  const galleryObj = galleryData.gallery || ${getField('gallery')};

  const [selectedImage, setSelectedImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const productName = galleryObj.productName || '';
  const imagesList = galleryObj.images || [];
  const previousText = ${getField('previousText')};
  const nextText = ${getField('nextText')};

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(handleNext, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, selectedImage]);

  return (
    <>
<div className="gallery-container">
        <div
          className="main-image-container h-96 md:h-[600px] group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <img
            src={imagesList[selectedImage]?.url || imagesList[selectedImage] || '/api/placeholder/1000/1000'}
            alt={imagesList[selectedImage]?.alt || \`\${productName} - Image \${selectedImage + 1}\`}
            className="main-image"
          />

          {imagesList.length > 1 && (
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

          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imagesList.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={\`w-2 h-2 rounded-full transition-all \${
                  selectedImage === idx ? 'bg-white w-8' : 'bg-white/50'
                }\`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductImageGallery;
    `,

    grid: `
${commonImports}

interface ProductImageGalleryProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ ${dataName}, className, showThumbnails = true }) => {
  const galleryData = ${dataName} || {};
  const galleryObj = galleryData.gallery || ${getField('gallery')};

  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const productName = galleryObj.productName || '';
  const imagesList = galleryObj.images || [];
  const closeText = ${getField('closeText')};
  const imageCounterText = ${getField('imageCounterText')};

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
<div className="gallery-container">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagesList.map((image: any, idx: number) => (
            <div
              key={image.id || idx}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={image.url || image || '/api/placeholder/400/400'}
                alt={image.alt || \`\${productName} - Image \${idx + 1}\`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <Dialog open={isLightboxOpen} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-screen-xl p-0 bg-black border-none">
              <div className="relative w-full h-screen flex items-center justify-center">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full z-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full z-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full z-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <img
                  src={imagesList[selectedImage]?.url || imagesList[selectedImage] || '/api/placeholder/1200/1200'}
                  alt={imagesList[selectedImage]?.alt || \`\${productName} - Image \${selectedImage + 1}\`}
                  className="lightbox-image"
                />

                <div className="image-counter">
                  {selectedImage + 1} {imageCounterText} {imagesList.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ProductImageGallery;
    `
  };

  return variants[variant] || variants.thumbnails;
};
