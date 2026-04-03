/**
 * Asset Generator
 *
 * Generates asset management components:
 * - AssetBrowser: Browse and manage digital/physical assets
 * - MovementHistory: Track asset movement and location history
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface AssetBrowserOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showGrid?: boolean;
  showUpload?: boolean;
  assetTypes?: string[];
}

export interface MovementHistoryOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showMap?: boolean;
  showTimeline?: boolean;
}

/**
 * Generate an AssetBrowser component
 */
export function generateAssetBrowser(options: AssetBrowserOptions = {}): string {
  const {
    componentName = 'AssetBrowser',
    entity = 'asset',
    showFilters = true,
    showSearch = true,
    showGrid = true,
    showUpload = true,
    assetTypes = ['All', 'Documents', 'Images', 'Videos', 'Other'],
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Grid,
  List,
  Upload,
  Filter,
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  ChevronRight,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Asset {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface ${componentName}Props {
  assets?: Asset[];
  className?: string;
  onSelect?: (asset: Asset) => void;
  onUpload?: (files: File[]) => void;
  onDelete?: (asset: Asset) => void;
  selectable?: boolean;
  multiSelect?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  assets: propAssets,
  className,
  onSelect,
  onUpload,
  onDelete,
  selectable = false,
  multiSelect = false,
}) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const assetTypes = ${JSON.stringify(assetTypes)};

  // Fetch assets
  const { data: fetchedAssets = [], isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch assets:', err);
        return [];
      }
    },
    enabled: !propAssets || propAssets.length === 0,
  });

  const assets = propAssets && propAssets.length > 0 ? propAssets : fetchedAssets;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => {
      const matchesSearch = !searchQuery ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' ||
        asset.type?.toLowerCase().includes(selectedType.toLowerCase());
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, selectedType]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return \`\${bytes.toFixed(1)} \${units[i]}\`;
  };

  const getFileIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('image')) return Image;
    if (lowerType.includes('video')) return Video;
    if (lowerType.includes('audio')) return Music;
    if (lowerType.includes('pdf') || lowerType.includes('document')) return FileText;
    if (lowerType.includes('zip') || lowerType.includes('archive')) return Archive;
    return File;
  };

  const handleSelect = (asset: Asset) => {
    if (selectable) {
      if (multiSelect) {
        setSelectedAssets(prev => {
          const newSet = new Set(prev);
          if (newSet.has(asset.id)) {
            newSet.delete(asset.id);
          } else {
            newSet.add(asset.id);
          }
          return newSet;
        });
      } else {
        setSelectedAssets(new Set([asset.id]));
      }
    }
    if (onSelect) onSelect(asset);
  };

  const handleDelete = async (asset: Asset) => {
    if (onDelete) {
      onDelete(asset);
    } else {
      await deleteMutation.mutateAsync(asset.id);
    }
    setOpenMenu(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onUpload) {
      onUpload(files);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn('space-y-4', className)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            ${showSearch ? `{/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>` : ''}

            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-2',
                  view === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'p-2',
                  view === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            ${showUpload ? `{/* Upload Button */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  if (files.length > 0 && onUpload) onUpload(files);
                };
                input.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>` : ''}
          </div>
        </div>

        ${showFilters ? `{/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {assetTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {type}
            </button>
          ))}
        </div>` : ''}

        {/* Drop Zone Overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-50 bg-blue-500/20 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop files to upload
              </p>
            </div>
          </div>
        )}

        {/* Assets Grid/List */}
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No assets found</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset: Asset) => {
              const FileIcon = getFileIcon(asset.type);
              const isSelected = selectedAssets.has(asset.id);

              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={cn(
                    'relative group bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden cursor-pointer transition-all',
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative">
                    {asset.thumbnail || (asset.type?.includes('image') && asset.url) ? (
                      <img
                        src={asset.thumbnail || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Selection Checkbox */}
                    {selectable && (
                      <div className={cn(
                        'absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white/80 border-gray-300 group-hover:border-blue-400'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === asset.id ? null : asset.id);
                        }}
                        className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === asset.id && (
                        <div className="absolute right-0 top-8 z-10 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); setOpenMenu(null); }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> Preview
                          </button>
                          {asset.url && (
                            <a
                              href={asset.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" /> Download
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {asset.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(asset.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {selectable && <th className="w-10 px-4 py-3" />}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Modified</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssets.map((asset: Asset) => {
                  const FileIcon = getFileIcon(asset.type);
                  const isSelected = selectedAssets.has(asset.id);

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => handleSelect(asset)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{asset.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatFileSize(asset.size)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === asset.id ? null : asset.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setPreviewAsset(null)} />
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            {previewAsset.type?.includes('image') && previewAsset.url ? (
              <img
                src={previewAsset.url}
                alt={previewAsset.name}
                className="max-h-[80vh] mx-auto rounded-lg"
              />
            ) : previewAsset.type?.includes('video') && previewAsset.url ? (
              <video
                src={previewAsset.url}
                controls
                className="max-h-[80vh] mx-auto rounded-lg"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                {React.createElement(getFileIcon(previewAsset.type), { className: 'w-24 h-24 text-gray-400 mx-auto mb-4' })}
                <p className="text-xl font-medium text-gray-900 dark:text-white">{previewAsset.name}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{formatFileSize(previewAsset.size)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a MovementHistory component
 */
export function generateMovementHistory(options: MovementHistoryOptions = {}): string {
  const {
    componentName = 'MovementHistory',
    entity = 'movement',
    showMap = false,
    showTimeline = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Clock,
  ArrowRight,
  User,
  Package,
  Truck,
  Building,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Movement {
  id: string;
  assetId?: string;
  assetName?: string;
  fromLocation?: string;
  toLocation?: string;
  movedBy?: string;
  movedAt: string;
  reason?: string;
  status?: 'completed' | 'in_transit' | 'pending';
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

interface ${componentName}Props {
  assetId?: string;
  movements?: Movement[];
  className?: string;
  onMovementClick?: (movement: Movement) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  assetId,
  movements: propMovements,
  className,
  onMovementClick,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Fetch movements
  const { data: fetchedMovements = [], isLoading } = useQuery({
    queryKey: ['${queryKey}', assetId],
    queryFn: async () => {
      try {
        const url = assetId ? \`${endpoint}?assetId=\${assetId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch movements:', err);
        return [];
      }
    },
    enabled: !propMovements || propMovements.length === 0,
  });

  const movements = propMovements && propMovements.length > 0 ? propMovements : fetchedMovements;

  // Filter movements
  const filteredMovements = useMemo(() => {
    return movements.filter((movement: Movement) => {
      const matchesStatus = filterStatus === 'all' || movement.status === filterStatus;
      const matchesDateStart = !dateRange.start || new Date(movement.movedAt) >= new Date(dateRange.start);
      const matchesDateEnd = !dateRange.end || new Date(movement.movedAt) <= new Date(dateRange.end);
      return matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }, [movements, filterStatus, dateRange]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status || ''] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getLocationIcon = (location?: string) => {
    if (!location) return MapPin;
    const lower = location.toLowerCase();
    if (lower.includes('warehouse')) return Building;
    if (lower.includes('transit') || lower.includes('shipping')) return Truck;
    if (lower.includes('customer') || lower.includes('client')) return User;
    return MapPin;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Movement History</h2>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_transit">In Transit</option>
            <option value="pending">Pending</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredMovements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No movement history found</p>
        </div>
      ) : (
        ${showTimeline ? `<div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Timeline Items */}
          <div className="space-y-4">
            {filteredMovements.map((movement: Movement, index: number) => {
              const isExpanded = expanded.has(movement.id);
              const { date, time } = formatDateTime(movement.movedAt);
              const FromIcon = getLocationIcon(movement.fromLocation);
              const ToIcon = getLocationIcon(movement.toLocation);

              return (
                <div key={movement.id} className="relative pl-14">
                  {/* Timeline Dot */}
                  <div className={cn(
                    'absolute left-4 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900',
                    movement.status === 'completed'
                      ? 'bg-green-500'
                      : movement.status === 'in_transit'
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  )} />

                  {/* Card */}
                  <div
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onMovementClick ? onMovementClick(movement) : toggleExpand(movement.id)}
                  >
                    {/* Main Row */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(movement.status))}>
                            {movement.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                          {movement.assetName && (
                            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Package className="w-4 h-4" />
                              {movement.assetName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {date}
                          <Clock className="w-4 h-4 ml-2" />
                          {time}
                        </div>
                      </div>

                      {/* Location Flow */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <FromIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {movement.fromLocation || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2 flex-1">
                          <ToIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {movement.toLocation || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(movement.id); }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {movement.movedBy && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Moved By</p>
                              <p className="text-gray-900 dark:text-white flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {movement.movedBy}
                              </p>
                            </div>
                          )}
                          {movement.reason && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Reason</p>
                              <p className="text-gray-900 dark:text-white">{movement.reason}</p>
                            </div>
                          )}
                          {movement.notes && (
                            <div className="col-span-2">
                              <p className="text-gray-500 dark:text-gray-400">Notes</p>
                              <p className="text-gray-900 dark:text-white">{movement.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>` : `<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMovements.map((movement: Movement) => (
                <tr
                  key={movement.id}
                  onClick={() => onMovementClick && onMovementClick(movement)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{movement.assetName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{movement.fromLocation || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{movement.toLocation || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(movement.status))}>
                      {movement.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(movement.movedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>`}
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate asset browser for specific domain
 */
export function generateDomainAssetBrowser(
  domain: string,
  options?: Partial<AssetBrowserOptions>
): string {
  return generateAssetBrowser({
    componentName: pascalCase(domain) + 'AssetBrowser',
    entity: domain,
    ...options,
  });
}

/**
 * Generate movement history for specific domain
 */
export function generateDomainMovementHistory(
  domain: string,
  options?: Partial<MovementHistoryOptions>
): string {
  return generateMovementHistory({
    componentName: pascalCase(domain) + 'MovementHistory',
    entity: domain + '_movement',
    ...options,
  });
}
