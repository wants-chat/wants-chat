'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Palette,
  Upload,
  Trash2,
  Edit,
  Search,
  Filter,
  Plus,
  Eye,
  Star,
  Heart,
  Tag,
  Folder,
  Grid,
  List,
  Download,
  Share2,
  Clock,
  User,
  DollarSign,
  X,
  ZoomIn,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface DesignPortfolioToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type DesignCategory = 'traditional' | 'neo_traditional' | 'japanese' | 'realism' | 'blackwork' | 'geometric' | 'watercolor' | 'tribal' | 'minimalist' | 'dotwork' | 'lettering' | 'custom';
type DesignStatus = 'available' | 'sold' | 'reserved' | 'flash' | 'custom_only';

interface TattooDesign {
  id: string;
  title: string;
  description: string;
  category: DesignCategory;
  style: string;
  artistId: string;
  artistName: string;
  imageUrl: string;
  thumbnailUrl: string;
  bodyPlacement: string[];
  estimatedHours: number;
  minPrice: number;
  maxPrice: number;
  status: DesignStatus;
  isFlash: boolean;
  isFeatured: boolean;
  tags: string[];
  colors: string[];
  size: 'small' | 'medium' | 'large' | 'extra_large' | 'custom';
  views: number;
  favorites: number;
  timesBooked: number;
  createdAt: string;
  updatedAt: string;
}

// Constants
const CATEGORIES: { id: DesignCategory; label: string }[] = [
  { id: 'traditional', label: 'Traditional' },
  { id: 'neo_traditional', label: 'Neo-Traditional' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'realism', label: 'Realism' },
  { id: 'blackwork', label: 'Blackwork' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'tribal', label: 'Tribal' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'dotwork', label: 'Dotwork' },
  { id: 'lettering', label: 'Lettering' },
  { id: 'custom', label: 'Custom' },
];

const SIZE_OPTIONS = [
  { id: 'small', label: 'Small (1-3 inches)' },
  { id: 'medium', label: 'Medium (3-6 inches)' },
  { id: 'large', label: 'Large (6-12 inches)' },
  { id: 'extra_large', label: 'Extra Large (12+ inches)' },
  { id: 'custom', label: 'Custom Size' },
];

const STATUS_OPTIONS: { id: DesignStatus; label: string; color: string }[] = [
  { id: 'available', label: 'Available', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'flash', label: 'Flash', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'reserved', label: 'Reserved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'sold', label: 'Sold', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  { id: 'custom_only', label: 'Custom Only', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
];

const BODY_PLACEMENTS = [
  'Arm', 'Forearm', 'Upper Arm', 'Wrist', 'Hand', 'Finger',
  'Shoulder', 'Back', 'Chest', 'Ribs', 'Stomach', 'Hip',
  'Thigh', 'Calf', 'Ankle', 'Foot', 'Neck', 'Behind Ear', 'Face',
];

const ARTISTS = [
  { id: 'artist-1', name: 'Jake Morrison' },
  { id: 'artist-2', name: 'Maya Chen' },
  { id: 'artist-3', name: 'Alex Rivera' },
  { id: 'artist-4', name: 'Sam Williams' },
];

// Column configuration for exports
const DESIGN_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'artistName', header: 'Artist', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'style', header: 'Style', type: 'string' },
  { key: 'size', header: 'Size', type: 'string' },
  { key: 'estimatedHours', header: 'Est. Hours', type: 'number' },
  { key: 'minPrice', header: 'Min Price', type: 'currency' },
  { key: 'maxPrice', header: 'Max Price', type: 'currency' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'views', header: 'Views', type: 'number' },
  { key: 'favorites', header: 'Favorites', type: 'number' },
  { key: 'timesBooked', header: 'Times Booked', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Placeholder image URLs for demonstration
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400',
  'https://images.unsplash.com/photo-1590246814883-57c511e76c8f?w=400',
  'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400',
  'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400',
];

// Main Component
export const DesignPortfolioTool: React.FC<DesignPortfolioToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // useToolData hook for backend sync
  const {
    data: designs,
    addItem: addDesignToBackend,
    updateItem: updateDesignBackend,
    deleteItem: deleteDesignBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TattooDesign>('design-portfolio', [], DESIGN_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState<TattooDesign | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<TattooDesign | null>(null);
  const [newTag, setNewTag] = useState('');

  // New design form state
  const [newDesign, setNewDesign] = useState<Partial<TattooDesign>>({
    title: '',
    description: '',
    category: 'traditional',
    style: '',
    artistId: '',
    artistName: '',
    imageUrl: '',
    thumbnailUrl: '',
    bodyPlacement: [],
    estimatedHours: 2,
    minPrice: 150,
    maxPrice: 300,
    status: 'available',
    isFlash: false,
    isFeatured: false,
    tags: [],
    colors: [],
    size: 'medium',
    views: 0,
    favorites: 0,
    timesBooked: 0,
  });

  // Confirm dialog hook
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    return designs.filter(design => {
      const matchesSearch =
        design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || design.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || design.status === filterStatus;
      const matchesArtist = filterArtist === 'all' || design.artistId === filterArtist;
      return matchesSearch && matchesCategory && matchesStatus && matchesArtist;
    });
  }, [designs, searchTerm, filterCategory, filterStatus, filterArtist]);

  // Stats
  const stats = useMemo(() => {
    const availableCount = designs.filter(d => d.status === 'available' || d.status === 'flash').length;
    const flashCount = designs.filter(d => d.isFlash).length;
    const totalViews = designs.reduce((sum, d) => sum + d.views, 0);
    const totalBookings = designs.reduce((sum, d) => sum + d.timesBooked, 0);

    return {
      totalDesigns: designs.length,
      availableCount,
      flashCount,
      totalViews,
      totalBookings,
    };
  }, [designs]);

  // Handle artist selection
  const handleArtistChange = (artistId: string) => {
    const artist = ARTISTS.find(a => a.id === artistId);
    if (artist) {
      setNewDesign(prev => ({
        ...prev,
        artistId,
        artistName: artist.name,
      }));
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !newDesign.tags?.includes(newTag.trim())) {
      setNewDesign(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setNewDesign(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag),
    }));
  };

  // Toggle body placement
  const toggleBodyPlacement = (placement: string) => {
    setNewDesign(prev => {
      const current = prev.bodyPlacement || [];
      if (current.includes(placement)) {
        return { ...prev, bodyPlacement: current.filter(p => p !== placement) };
      } else {
        return { ...prev, bodyPlacement: [...current, placement] };
      }
    });
  };

  // Save design
  const handleSaveDesign = async () => {
    if (!newDesign.title || !newDesign.artistId) {
      return;
    }

    const now = new Date().toISOString();
    const randomImage = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

    if (editingDesign) {
      const updated: TattooDesign = {
        ...editingDesign,
        ...newDesign as TattooDesign,
        updatedAt: now,
      };
      await updateDesignBackend(updated);
      setEditingDesign(null);
    } else {
      const design: TattooDesign = {
        id: generateId(),
        ...newDesign as TattooDesign,
        imageUrl: newDesign.imageUrl || randomImage,
        thumbnailUrl: newDesign.thumbnailUrl || randomImage,
        createdAt: now,
        updatedAt: now,
      };
      await addDesignToBackend(design);
    }

    setShowForm(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewDesign({
      title: '',
      description: '',
      category: 'traditional',
      style: '',
      artistId: '',
      artistName: '',
      imageUrl: '',
      thumbnailUrl: '',
      bodyPlacement: [],
      estimatedHours: 2,
      minPrice: 150,
      maxPrice: 300,
      status: 'available',
      isFlash: false,
      isFeatured: false,
      tags: [],
      colors: [],
      size: 'medium',
      views: 0,
      favorites: 0,
      timesBooked: 0,
    });
  };

  // Edit design
  const handleEditDesign = (design: TattooDesign) => {
    setEditingDesign(design);
    setNewDesign(design);
    setShowForm(true);
  };

  // Delete design
  const handleDeleteDesign = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Design',
      message: 'Are you sure you want to delete this design?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await deleteDesignBackend(id);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (design: TattooDesign) => {
    const updated = { ...design, isFeatured: !design.isFeatured, updatedAt: new Date().toISOString() };
    await updateDesignBackend(updated);
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    const exportData = filteredDesigns.map(design => ({
      ...design,
      bodyPlacement: design.bodyPlacement.join(', '),
      tags: design.tags.join(', '),
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, DESIGN_COLUMNS, 'design-portfolio');
        break;
      case 'excel':
        exportToExcel(exportData, DESIGN_COLUMNS, 'design-portfolio');
        break;
      case 'json':
        exportToJSON(exportData, 'design-portfolio');
        break;
      case 'pdf':
        exportToPDF(exportData, DESIGN_COLUMNS, 'Design Portfolio');
        break;
    }
  };

  const getStatusBadge = (status: DesignStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.id === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color}`}>
        {statusOption?.label}
      </span>
    );
  };

  return (
    <>
      <ConfirmDialog />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-pink-600" />
              {t('tools.designPortfolio.designPortfolioManager', 'Design Portfolio Manager')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('tools.designPortfolio.manageTattooDesignsFlashSheets', 'Manage tattoo designs, flash sheets, and portfolio pieces')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="design-portfolio" toolName="Design Portfolio" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { setShowForm(true); setEditingDesign(null); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.designPortfolio.addDesign', 'Add Design')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.designPortfolio.totalDesigns', 'Total Designs')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDesigns}</p>
                </div>
                <Palette className="w-8 h-8 text-pink-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.designPortfolio.available', 'Available')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableCount}</p>
                </div>
                <Tag className="w-8 h-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.designPortfolio.flashDesigns', 'Flash Designs')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.flashCount}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.designPortfolio.totalViews', 'Total Views')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('tools.designPortfolio.timesBooked', 'Times Booked')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                </div>
                <Heart className="w-8 h-8 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.designPortfolio.searchDesignsTags', 'Search designs, tags...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">{t('tools.designPortfolio.allCategories', 'All Categories')}</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">{t('tools.designPortfolio.allStatus', 'All Status')}</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterArtist}
                onChange={(e) => setFilterArtist(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">{t('tools.designPortfolio.allArtists', 'All Artists')}</option>
                {ARTISTS.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'text-gray-500'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Designs Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                {t('tools.designPortfolio.noDesignsFoundAddYour', 'No designs found. Add your first design!')}
              </div>
            ) : (
              filteredDesigns.map(design => (
                <Card key={design.id} className="overflow-hidden group">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {design.imageUrl ? (
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDesign(design)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <ZoomIn className="w-5 h-5 text-gray-900" />
                        </button>
                        <button
                          onClick={() => handleEditDesign(design)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <Edit className="w-5 h-5 text-gray-900" />
                        </button>
                        <button
                          onClick={() => handleDeleteDesign(design.id)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {design.isFeatured && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </div>
                    )}
                    {design.isFlash && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {t('tools.designPortfolio.flash', 'Flash')}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{design.title}</h3>
                      <button
                        onClick={() => handleToggleFeatured(design)}
                        className={`p-1 rounded ${design.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}
                      >
                        <Star className="w-4 h-4" fill={design.isFeatured ? t('tools.designPortfolio.currentcolor', 'currentColor') : 'none'} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{design.artistName}</p>
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(design.status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(design.minPrice)} - {formatCurrency(design.maxPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {design.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {design.favorites}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.design', 'Design')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.artist', 'Artist')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.category', 'Category')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.priceRange', 'Price Range')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.stats', 'Stats')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('tools.designPortfolio.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDesigns.map(design => (
                      <tr key={design.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              {design.thumbnailUrl ? (
                                <img src={design.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Image className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{design.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{design.size}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">{design.artistName}</td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white capitalize">{design.category.replace('_', ' ')}</td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {formatCurrency(design.minPrice)} - {formatCurrency(design.maxPrice)}
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(design.status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" /> {design.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" /> {design.favorites}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFeatured(design)}
                              className={`p-1 rounded ${design.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`}
                              title={t('tools.designPortfolio.toggleFeatured', 'Toggle Featured')}
                            >
                              <Star className="w-4 h-4" fill={design.isFeatured ? t('tools.designPortfolio.currentcolor2', 'currentColor') : 'none'} />
                            </button>
                            <button
                              onClick={() => handleEditDesign(design)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                              title={t('tools.designPortfolio.edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDesign(design.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingDesign ? t('tools.designPortfolio.editDesign', 'Edit Design') : t('tools.designPortfolio.addNewDesign', 'Add New Design')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.title', 'Title *')}</label>
                    <input
                      type="text"
                      value={newDesign.title || ''}
                      onChange={(e) => setNewDesign({ ...newDesign, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.designPortfolio.designTitle', 'Design title')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.artist2', 'Artist *')}</label>
                    <select
                      value={newDesign.artistId || ''}
                      onChange={(e) => handleArtistChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('tools.designPortfolio.selectArtist', 'Select artist...')}</option>
                      {ARTISTS.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.description', 'Description')}</label>
                  <textarea
                    value={newDesign.description || ''}
                    onChange={(e) => setNewDesign({ ...newDesign, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.designPortfolio.designDescription', 'Design description...')}
                  />
                </div>

                {/* Category & Size */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.category2', 'Category')}</label>
                    <select
                      value={newDesign.category || 'traditional'}
                      onChange={(e) => setNewDesign({ ...newDesign, category: e.target.value as DesignCategory })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.size', 'Size')}</label>
                    <select
                      value={newDesign.size || 'medium'}
                      onChange={(e) => setNewDesign({ ...newDesign, size: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {SIZE_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.status2', 'Status')}</label>
                    <select
                      value={newDesign.status || 'available'}
                      onChange={(e) => setNewDesign({ ...newDesign, status: e.target.value as DesignStatus })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.minPrice', 'Min Price')}</label>
                    <input
                      type="number"
                      value={newDesign.minPrice || 0}
                      onChange={(e) => setNewDesign({ ...newDesign, minPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.maxPrice', 'Max Price')}</label>
                    <input
                      type="number"
                      value={newDesign.maxPrice || 0}
                      onChange={(e) => setNewDesign({ ...newDesign, maxPrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.estHours', 'Est. Hours')}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newDesign.estimatedHours || 2}
                      onChange={(e) => setNewDesign({ ...newDesign, estimatedHours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Body Placements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.designPortfolio.bodyPlacements', 'Body Placements')}</label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_PLACEMENTS.map(placement => (
                      <button
                        key={placement}
                        type="button"
                        onClick={() => toggleBodyPlacement(placement)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          newDesign.bodyPlacement?.includes(placement)
                            ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-700 dark:text-pink-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {placement}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tools.designPortfolio.tags', 'Tags')}</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={t('tools.designPortfolio.addATag', 'Add a tag...')}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                      {t('tools.designPortfolio.add', 'Add')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newDesign.tags?.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Flash & Featured */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDesign.isFlash || false}
                      onChange={(e) => setNewDesign({ ...newDesign, isFlash: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.designPortfolio.flashDesign', 'Flash Design')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDesign.isFeatured || false}
                      onChange={(e) => setNewDesign({ ...newDesign, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('tools.designPortfolio.featuredDesign', 'Featured Design')}</span>
                  </label>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.designPortfolio.imageUrl', 'Image URL')}</label>
                  <input
                    type="url"
                    value={newDesign.imageUrl || ''}
                    onChange={(e) => setNewDesign({ ...newDesign, imageUrl: e.target.value, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('tools.designPortfolio.httpsExampleComImageJpg', 'https://example.com/image.jpg')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('tools.designPortfolio.leaveEmptyForAPlaceholder', 'Leave empty for a placeholder image')}</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditingDesign(null); resetForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('tools.designPortfolio.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveDesign}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {editingDesign ? t('tools.designPortfolio.updateDesign', 'Update Design') : t('tools.designPortfolio.addDesign2', 'Add Design')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Design Preview Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDesign(null)}>
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedDesign(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedDesign.imageUrl}
                alt={selectedDesign.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-white text-center">
                <h3 className="text-xl font-semibold">{selectedDesign.title}</h3>
                <p className="text-gray-400">{selectedDesign.artistName} - {formatCurrency(selectedDesign.minPrice)} - {formatCurrency(selectedDesign.maxPrice)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default DesignPortfolioTool;
