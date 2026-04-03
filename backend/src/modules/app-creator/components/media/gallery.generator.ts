/**
 * Gallery Component Generators
 */

export interface GalleryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGallery(options: GalleryOptions = {}): string {
  const { componentName = 'Gallery', endpoint = '/images' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ZoomIn, Download, Heart, Share2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  albumId?: string;
  columns?: 2 | 3 | 4;
}

const ${componentName}: React.FC<${componentName}Props> = ({ albumId, columns = 3 }) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery', albumId],
    queryFn: async () => {
      const url = '${endpoint}' + (albumId ? '?album_id=' + albumId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 md:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <>
      <div className={\`grid gap-4 \${gridCols[columns]}\`}>
        {images && images.length > 0 ? (
          images.map((image: any) => (
            <div
              key={image.id}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.thumbnail_url || image.url}
                alt={image.title || ''}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">No images found</div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.title || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedImage.title && (
              <div className="mt-4 text-white">
                <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-gray-300 mt-1">{selectedImage.description}</p>
                )}
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

export function generateLightbox(options: GalleryOptions = {}): string {
  const { componentName = 'Lightbox' } = options;

  return `import React, { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';

interface Image {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface ${componentName}Props {
  images: Image[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const currentImage = images[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <span className="text-sm opacity-70">{currentIndex + 1} / {images.length}</span>
          {currentImage.title && <h3 className="font-medium">{currentImage.title}</h3>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.5, 3))}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-lg">
            <Download className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-lg">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center p-16 overflow-auto">
        <img
          src={currentImage.url}
          alt={currentImage.title || ''}
          style={{ transform: \`scale(\${zoom})\` }}
          className="max-w-full max-h-full object-contain transition-transform"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => { setCurrentIndex(index); setZoom(1); }}
              className={\`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all \${
                index === currentIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-75'
              }\`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateImageUpload(options: GalleryOptions = {}): string {
  const { componentName = 'ImageUpload', endpoint = '/images' } = options;

  return `import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Image, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  onUploadComplete?: (images: any[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onUploadComplete, multiple = true, maxFiles = 10 }) => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const response = await api.post('${endpoint}/upload', formData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast.success('Images uploaded successfully!');
      onUploadComplete?.(data);
      setFiles([]);
      setPreviews([]);
    },
    onError: () => toast.error('Failed to upload images'),
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith('image/'));
    const combined = multiple ? [...files, ...imageFiles].slice(0, maxFiles) : [imageFiles[0]];
    setFiles(combined);
    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={\`border-2 border-dashed rounded-xl p-8 text-center transition-colors \${
          dragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }\`}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {multiple ? \`Up to \${maxFiles} images\` : 'Single image'} • PNG, JPG, GIF
          </p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload {files.length} image{files.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
