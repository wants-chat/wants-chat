import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateImageGalleryMasonry = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'pinterest' = 'threeColumn'
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

  const columnConfigs = {
    twoColumn: 2,
    threeColumn: 3,
    pinterest: 4
  };

  const commonImports = `
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .masonry-container {
      @apply w-full relative;
    }

    .masonry-grid {
      @apply flex gap-4;
    }

    .masonry-column {
      @apply flex-1 flex flex-col gap-4;
    }

    .masonry-item {
      @apply relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-300;
    }

    .masonry-item:hover {
      @apply shadow-xl ring-2 ring-blue-500;
    }

    .masonry-image {
      @apply w-full object-cover transition-transform duration-500;
    }

    .masonry-item:hover .masonry-image {
      @apply scale-105;
    }

    .image-overlay {
      @apply absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 flex items-end p-4;
    }

    .masonry-item:hover .image-overlay {
      @apply opacity-100;
    }

    .image-caption {
      @apply text-white font-semibold text-sm;
    }

    .loading-indicator {
      @apply flex items-center justify-center py-8 text-gray-600 dark:text-gray-400;
    }

    .sentinel {
      @apply h-10 w-full;
    }
  `;

  const variants = {
    twoColumn: `
${commonImports}

interface ImageGalleryMasonryProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryMasonry: React.FC<ImageGalleryMasonryProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const columnCount = ${columnConfigs.twoColumn};
  const sentinelRef = useRef<HTMLDivElement>(null);

  if (isFetching && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const allImages = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableInfiniteScroll = galleryData.enableInfiniteScroll ?? ${getField('enableInfiniteScroll')};
  const itemsPerLoad = galleryData.itemsPerLoad || ${getField('itemsPerLoad')};
  const loadingText = galleryData.loadingText || ${getField('loadingText')};
  const noMoreText = galleryData.noMoreText || ${getField('noMoreText')};

  const [displayedImages, setDisplayedImages] = useState(allImages.slice(0, itemsPerLoad));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(allImages.length > itemsPerLoad);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const currentLength = displayedImages.length;
      const nextImages = allImages.slice(currentLength, currentLength + itemsPerLoad);

      if (nextImages.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedImages([...displayedImages, ...nextImages]);
        setHasMore(currentLength + nextImages.length < allImages.length);
      }
      setIsLoading(false);
    }, 800);
  }, [displayedImages, allImages, isLoading, hasMore]);

  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, loadMore]);

  const getColumns = () => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    displayedImages.forEach((image: any) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumn].push(image);
      columnHeights[shortestColumn] += image.height || 300;
    });

    return columns;
  };

  const columns = getColumns();

  return (
    <>
<div className={className}>
        <div className="masonry-container">
          <div className="masonry-grid">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="masonry-column">
                {column.map((image: any) => (
                  <div key={image.id} className="masonry-item">
                    <img
                      src={image.url || '/api/placeholder/600/800'}
                      alt={image.caption || \`Gallery image\`}
                      className="masonry-image"
                      style={{ height: \`\${image.height || 300}px\` }}
                    />
                    <div className="image-overlay">
                      <h3 className="image-caption">{image.caption}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {enableInfiniteScroll && (
            <>
              <div ref={sentinelRef} className="sentinel" />
              {isLoading && (
                <div className="loading-indicator">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>{loadingText}</span>
                </div>
              )}
              {!hasMore && displayedImages.length > 0 && (
                <div className="loading-indicator">
                  <span>{noMoreText}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageGalleryMasonry;
    `,

    threeColumn: `
${commonImports}

interface ImageGalleryMasonryProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryMasonry: React.FC<ImageGalleryMasonryProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const columnCount = ${columnConfigs.threeColumn};
  const sentinelRef = useRef<HTMLDivElement>(null);

  if (isFetching && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const allImages = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableInfiniteScroll = galleryData.enableInfiniteScroll ?? ${getField('enableInfiniteScroll')};
  const itemsPerLoad = galleryData.itemsPerLoad || ${getField('itemsPerLoad')};
  const loadingText = galleryData.loadingText || ${getField('loadingText')};
  const noMoreText = galleryData.noMoreText || ${getField('noMoreText')};

  const [displayedImages, setDisplayedImages] = useState(allImages.slice(0, itemsPerLoad));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(allImages.length > itemsPerLoad);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const currentLength = displayedImages.length;
      const nextImages = allImages.slice(currentLength, currentLength + itemsPerLoad);

      if (nextImages.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedImages([...displayedImages, ...nextImages]);
        setHasMore(currentLength + nextImages.length < allImages.length);
      }
      setIsLoading(false);
    }, 800);
  }, [displayedImages, allImages, isLoading, hasMore]);

  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, loadMore]);

  const getColumns = () => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    displayedImages.forEach((image: any) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumn].push(image);
      columnHeights[shortestColumn] += image.height || 300;
    });

    return columns;
  };

  const columns = getColumns();

  return (
    <>
<div className={className}>
        <div className="masonry-container">
          <div className="masonry-grid">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="masonry-column">
                {column.map((image: any) => (
                  <div key={image.id} className="masonry-item">
                    <img
                      src={image.url || '/api/placeholder/600/800'}
                      alt={image.caption || \`Gallery image\`}
                      className="masonry-image"
                      style={{ height: \`\${image.height || 300}px\` }}
                    />
                    <div className="image-overlay">
                      <h3 className="image-caption">{image.caption}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {enableInfiniteScroll && (
            <>
              <div ref={sentinelRef} className="sentinel" />
              {isLoading && (
                <div className="loading-indicator">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>{loadingText}</span>
                </div>
              )}
              {!hasMore && displayedImages.length > 0 && (
                <div className="loading-indicator">
                  <span>{noMoreText}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageGalleryMasonry;
    `,

    pinterest: `
${commonImports}

interface ImageGalleryMasonryProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ImageGalleryMasonry: React.FC<ImageGalleryMasonryProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [columnCount, setColumnCount] = useState(${columnConfigs.pinterest});
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumnCount(1);
      } else if (window.innerWidth < 1024) {
        setColumnCount(2);
      } else if (window.innerWidth < 1536) {
        setColumnCount(3);
      } else {
        setColumnCount(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isFetching && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const galleryData = ${dataName} || {};

  const allImages = galleryData.images || ${getField('images')};
  const gap = galleryData.gap || ${getField('gap')};
  const enableInfiniteScroll = galleryData.enableInfiniteScroll ?? ${getField('enableInfiniteScroll')};
  const itemsPerLoad = galleryData.itemsPerLoad || ${getField('itemsPerLoad')};
  const loadingText = galleryData.loadingText || ${getField('loadingText')};
  const noMoreText = galleryData.noMoreText || ${getField('noMoreText')};

  const [displayedImages, setDisplayedImages] = useState(allImages.slice(0, itemsPerLoad));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(allImages.length > itemsPerLoad);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const currentLength = displayedImages.length;
      const nextImages = allImages.slice(currentLength, currentLength + itemsPerLoad);

      if (nextImages.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedImages([...displayedImages, ...nextImages]);
        setHasMore(currentLength + nextImages.length < allImages.length);
      }
      setIsLoading(false);
    }, 800);
  }, [displayedImages, allImages, isLoading, hasMore]);

  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, loadMore]);

  const getColumns = () => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    displayedImages.forEach((image: any) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumn].push(image);
      columnHeights[shortestColumn] += image.height || 300;
    });

    return columns;
  };

  const columns = getColumns();

  return (
    <>
<div className={className}>
        <div className="masonry-container">
          <div className="masonry-grid">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="masonry-column">
                {column.map((image: any) => (
                  <div key={image.id} className="masonry-item group">
                    <img
                      src={image.url || '/api/placeholder/600/800'}
                      alt={image.caption || \`Gallery image\`}
                      className="masonry-image"
                      style={{ height: \`\${image.height || 300}px\` }}
                    />
                    <div className="image-overlay">
                      <h3 className="image-caption">{image.caption}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {enableInfiniteScroll && (
            <>
              <div ref={sentinelRef} className="sentinel" />
              {isLoading && (
                <div className="loading-indicator">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>{loadingText}</span>
                </div>
              )}
              {!hasMore && displayedImages.length > 0 && (
                <div className="loading-indicator">
                  <span>{noMoreText}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageGalleryMasonry;
    `
  };

  return variants[variant] || variants.threeColumn;
};
