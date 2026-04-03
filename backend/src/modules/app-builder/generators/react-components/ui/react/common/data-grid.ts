import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataGrid = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming
  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart : 'data';
  };

  const dataName = getDataPath();

  return `import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  ${dataName}?: any[];
  columns?: ColumnDef[];
  searchable?: boolean;
  sortable?: boolean;
  loading?: boolean;
  pageSize?: number;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (item: any) => void;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  ${dataName},
  columns,
  searchable = true,
  sortable = true,
  loading = false,
  pageSize = 10,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  className
}) => {
  const initialData = ${dataName} || [];
  const [gridData, setGridData] = useState<any[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);

  // Update data when props change
  React.useEffect(() => {
    const newData = ${dataName} || [];
    setGridData(newData);
  }, [${dataName}]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return gridData;

    return gridData.filter((item: any) => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [gridData, searchTerm, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
  };

  const handleView = (item: any) => {
    onView ? onView(item) : alert('View: ' + (item.name || item.id || 'item'));
    setOpenDropdown(null);
  };

  const handleEdit = (item: any) => {
    onEdit ? onEdit(item) : alert('Edit: ' + (item.name || item.id || 'item'));
    setOpenDropdown(null);
  };

  const handleDelete = (item: any) => {
    const itemId = item.id || item._id;
    if (confirm('Are you sure you want to delete this item?')) {
      const newData = gridData.filter(d => (d.id || d._id) !== itemId);
      setGridData(newData);
      onDelete && onDelete(itemId);
    }
    setOpenDropdown(null);
  };

  const toggleDropdown = (itemId: string | number) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  // Default columns if not provided
  const defaultColumns: ColumnDef[] = columns || Object.keys(gridData[0] || {}).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    sortable: true
  }));

  const showActions = onView || onEdit || onDelete;

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {defaultColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'py-4 px-6 font-medium text-gray-900 dark:text-gray-100',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.align !== 'center' && column.align !== 'right' && 'text-left',
                      column.sortable && sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortable && sortKey === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {showActions && (
                  <th className="w-12 py-4 px-6 font-medium text-gray-900 dark:text-gray-100 text-center">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={defaultColumns.length + (showActions ? 1 : 0)}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any, index: number) => {
                  const itemId = item.id || item._id || index;

                  return (
                    <tr
                      key={itemId}
                      className={cn(
                        'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {defaultColumns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'py-4 px-6 text-gray-600 dark:text-gray-300',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </td>
                      ))}
                      {showActions && (
                        <td className="py-4 px-6 relative text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(itemId);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>

                          {openDropdown === itemId && (
                            <div className="absolute right-0 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              {onView && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleView(item);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
  `.trim();
};