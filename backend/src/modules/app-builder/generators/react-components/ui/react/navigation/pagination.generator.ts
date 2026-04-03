import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePagination = (
  resolved: ResolvedComponent,
  variant: 'numbers' | 'arrows' | 'compact' = 'numbers'
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

  // Parse data source for clean prop naming
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
    return `/${dataSource || 'pagination'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'pagination' : 'pagination';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    numbers: `
${commonImports}

interface PaginationProps {
  ${dataName}?: any;
  className?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onNext?: (data?: any) => void;
  onPrevious?: (data?: any) => void;
}

export default function Pagination({ ${dataName}: propData, className }: PaginationProps) {
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
  const paginationData = ${dataName} || {};

  const [currentPage, setCurrentPage] = useState(${getField('currentPage')} || 1);
  const [itemsPerPage, setItemsPerPage] = useState(${getField('itemsPerPage')} || 10);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = ${getField('totalPages')} || 10;
  const totalItems = ${getField('totalItems')} || 100;
  const pageSizeOptions = ${getField('pageSizeOptions')} || [10, 20, 50, 100];
  const maxPageButtons = ${getField('maxPageButtons')} || 5;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    console.log('Page size changed to:', size);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    handlePageChange(1);
  };

  const handleLast = () => {
    handlePageChange(totalPages);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxPageButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageButtons - 1);

    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pagination - Numbers</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Full pagination with page numbers, first/last buttons, and page size selector</p>

        {/* Sample Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Items {startItem}-{endItem} of {totalItems}
          </h2>
          <div className="space-y-3">
            {Array.from({ length: itemsPerPage }, (_, i) => {
              const itemNumber = startItem + i;
              if (itemNumber > totalItems) return null;
              return (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white">Item #{itemNumber}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {pageSizeOptions.map((size: number) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFirst}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {pageNumbers[0] > 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-colors \${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }\`}
              >
                {page}
              </button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <span className="px-2 text-gray-400">...</span>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleLast}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          {/* Page Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    arrows: `
${commonImports}

interface PaginationProps {
  ${dataName}?: any;
  className?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onNext?: (data?: any) => void;
  onPrevious?: (data?: any) => void;
}

export default function Pagination({ ${dataName}: propData, className }: PaginationProps) {
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
  const paginationData = ${dataName} || {};

  const [currentPage, setCurrentPage] = useState(${getField('currentPage')});

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = ${getField('totalPages')};
  const totalItems = ${getField('totalItems')};
  const itemsPerPage = ${getField('itemsPerPage')};
  const previousLabel = ${getField('previousLabel')};
  const nextLabel = ${getField('nextLabel')};

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pagination - Arrows</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Simple pagination with previous/next arrows only</p>

        {/* Sample Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Items {startItem}-{endItem} of {totalItems}
          </h2>
          <div className="space-y-3">
            {Array.from({ length: itemsPerPage }, (_, i) => {
              const itemNumber = startItem + i;
              if (itemNumber > totalItems) return null;
              return (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white">Item #{itemNumber}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className={cn('flex items-center justify-between', className)}>
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold">{previousLabel}</span>
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="font-bold">{nextLabel}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
    `,

    compact: `
${commonImports}

interface PaginationProps {
  ${dataName}?: any;
  className?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onNext?: (data?: any) => void;
  onPrevious?: (data?: any) => void;
}

export default function Pagination({ ${dataName}: propData, className }: PaginationProps) {
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
  const paginationData = ${dataName} || {};

  const [currentPage, setCurrentPage] = useState(${getField('currentPage')});

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = ${getField('totalPages')};
  const totalItems = ${getField('totalItems')};
  const itemsPerPage = ${getField('itemsPerPage')};

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pagination - Compact</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Minimal pagination with compact design</p>

        {/* Sample Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Showing {startItem}-{endItem} of {totalItems} items
          </h2>
          <div className="space-y-3">
            {Array.from({ length: itemsPerPage }, (_, i) => {
              const itemNumber = startItem + i;
              if (itemNumber > totalItems) return null;
              return (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-white">Item #{itemNumber}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className={cn('flex items-center justify-center gap-2', className)}>
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              min={1}
              max={totalPages}
              className="w-16 text-center bg-transparent text-gray-900 dark:text-white font-bold focus:outline-none"
            />
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400">{totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.numbers;
};
