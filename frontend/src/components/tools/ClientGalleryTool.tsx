'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  FolderOpen,
  Upload,
  Download,
  Share2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Plus,
  Lock,
  Unlock,
  Link,
  Copy,
  Check,
  Calendar,
  User,
  Filter,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  Heart,
  MessageSquare,
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
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface ClientGalleryToolProps {
  uiConfig?: UIConfig;
}

// Types
type GalleryStatus = 'draft' | 'ready' | 'shared' | 'archived';
type PhotoStatus = 'pending' | 'selected' | 'rejected';

interface Gallery {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  eventDate: string;
  sessionType: string;
  status: GalleryStatus;
  isPasswordProtected: boolean;
  password: string;
  shareLink: string;
  expiresAt: string | null;
  downloadEnabled: boolean;
  selectionEnabled: boolean;
  maxSelections: number;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Photo {
  id: string;
  galleryId: string;
  filename: string;
  thumbnailUrl: string;
  fullUrl: string;
  size: number;
  width: number;
  height: number;
  status: PhotoStatus;
  isFavorite: boolean;
  isHidden: boolean;
  caption: string;
  order: number;
  createdAt: string;
}

interface Comment {
  id: string;
  photoId: string;
  galleryId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Constants
const STATUS_COLORS: Record<GalleryStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
  ready: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  shared: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  archived: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
};

const PHOTO_STATUS_COLORS: Record<PhotoStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  selected: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

// Column configurations for exports
const GALLERY_COLUMNS: ColumnConfig[] = [
  { key: 'clientName', header: 'Client', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'sessionType', header: 'Session Type', type: 'string' },
  { key: 'eventDate', header: 'Event Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'viewCount', header: 'Views', type: 'number' },
  { key: 'isPasswordProtected', header: 'Protected', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const generateShareLink = () => {
  return `https://gallery.example.com/${generateId()}`;
};

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Main Component
export const ClientGalleryTool: React.FC<ClientGalleryToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: galleries,
    addItem: addGallery,
    updateItem: updateGallery,
    deleteItem: deleteGallery,
    isSynced: galleriesSynced,
    isSaving: galleriesSaving,
    lastSaved: galleriesLastSaved,
    syncError: galleriesSyncError,
    forceSync: forceGalleriesSync,
  } = useToolData<Gallery>('client-galleries', [], GALLERY_COLUMNS);

  const {
    data: photos,
    addItem: addPhoto,
    updateItem: updatePhoto,
    deleteItem: deletePhoto,
  } = useToolData<Photo>('gallery-photos', [], []);

  const {
    data: comments,
    addItem: addComment,
    deleteItem: deleteComment,
  } = useToolData<Comment>('gallery-comments', [], []);

  // Local UI State
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form state
  const [newGallery, setNewGallery] = useState<Partial<Gallery>>({
    clientName: '',
    clientEmail: '',
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    sessionType: 'Portrait',
    status: 'draft',
    isPasswordProtected: false,
    password: '',
    downloadEnabled: true,
    selectionEnabled: true,
    maxSelections: 50,
    expiresAt: null,
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.clientName || params.title) {
        setNewGallery({
          ...newGallery,
          clientName: params.clientName || '',
          clientEmail: params.clientEmail || '',
          title: params.title || '',
          sessionType: params.sessionType || 'Portrait',
        });
        setShowGalleryForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Get photos for selected gallery
  const galleryPhotos = useMemo(() => {
    if (!selectedGallery) return [];
    return photos
      .filter(p => p.galleryId === selectedGallery.id)
      .sort((a, b) => a.order - b.order);
  }, [photos, selectedGallery]);

  // Filtered galleries
  const filteredGalleries = useMemo(() => {
    return galleries.filter(gallery => {
      const matchesSearch = searchTerm === '' ||
        gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || gallery.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [galleries, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalGalleries: galleries.length,
      sharedGalleries: galleries.filter(g => g.status === 'shared').length,
      totalPhotos: photos.length,
      totalViews: galleries.reduce((sum, g) => sum + g.viewCount, 0),
      pendingSelections: photos.filter(p => p.status === 'pending').length,
    };
  }, [galleries, photos]);

  // Add gallery
  const handleAddGallery = () => {
    if (!newGallery.clientName || !newGallery.title) {
      setValidationMessage('Please enter client name and gallery title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const gallery: Gallery = {
      id: generateId(),
      clientId: generateId(),
      clientName: newGallery.clientName || '',
      clientEmail: newGallery.clientEmail || '',
      title: newGallery.title || '',
      description: newGallery.description || '',
      eventDate: newGallery.eventDate || new Date().toISOString().split('T')[0],
      sessionType: newGallery.sessionType || 'Portrait',
      status: newGallery.status as GalleryStatus || 'draft',
      isPasswordProtected: newGallery.isPasswordProtected || false,
      password: newGallery.isPasswordProtected ? (newGallery.password || generatePassword()) : '',
      shareLink: generateShareLink(),
      expiresAt: newGallery.expiresAt || null,
      downloadEnabled: newGallery.downloadEnabled ?? true,
      selectionEnabled: newGallery.selectionEnabled ?? true,
      maxSelections: newGallery.maxSelections || 50,
      viewCount: 0,
      lastViewedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGallery(gallery);
    setShowGalleryForm(false);
    resetGalleryForm();
  };

  // Update gallery
  const handleUpdateGallery = () => {
    if (!editingGallery) return;

    updateGallery(editingGallery.id, {
      ...editingGallery,
      updatedAt: new Date().toISOString(),
    });
    setEditingGallery(null);
  };

  // Share gallery
  const shareGallery = (gallery: Gallery) => {
    updateGallery(gallery.id, {
      status: 'shared',
      updatedAt: new Date().toISOString(),
    });
  };

  // Copy share link
  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Toggle photo selection
  const togglePhotoStatus = (photo: Photo, status: PhotoStatus) => {
    updatePhoto(photo.id, { status });
  };

  // Toggle photo favorite
  const togglePhotoFavorite = (photo: Photo) => {
    updatePhoto(photo.id, { isFavorite: !photo.isFavorite });
  };

  // Reset form
  const resetGalleryForm = () => {
    setNewGallery({
      clientName: '',
      clientEmail: '',
      title: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      sessionType: 'Portrait',
      status: 'draft',
      isPasswordProtected: false,
      password: '',
      downloadEnabled: true,
      selectionEnabled: true,
      maxSelections: 50,
      expiresAt: null,
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
            <span className="text-sm font-medium">{validationMessage}</span>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.clientGallery.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.clientGallery.clientGalleryManager', 'Client Gallery Manager')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.clientGallery.sharePhotosWithClientsManage', 'Share photos with clients, manage selections and downloads')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="client-gallery" toolName="Client Gallery" />

              <SyncStatus
                isSynced={galleriesSynced}
                isSaving={galleriesSaving}
                lastSaved={galleriesLastSaved}
                syncError={galleriesSyncError}
                onForceSync={forceGalleriesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(filteredGalleries, GALLERY_COLUMNS, 'client-galleries')}
                onExportExcel={() => exportToExcel(filteredGalleries, GALLERY_COLUMNS, 'client-galleries')}
                onExportJSON={() => exportToJSON(filteredGalleries, 'client-galleries')}
                onExportPDF={() => exportToPDF(filteredGalleries, GALLERY_COLUMNS, 'Client Galleries Report', 'client-galleries')}
                onCopy={() => copyUtil(filteredGalleries, GALLERY_COLUMNS)}
                onPrint={() => printData(filteredGalleries, GALLERY_COLUMNS, 'Client Galleries Report')}
                theme={theme}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.totalGalleries', 'Total Galleries')}</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalGalleries}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.shared', 'Shared')}</p>
              <p className={`text-2xl font-bold text-green-500`}>{stats.sharedGalleries}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.totalPhotos', 'Total Photos')}</p>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.totalPhotos}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.totalViews', 'Total Views')}</p>
              <p className={`text-2xl font-bold text-purple-500`}>{stats.totalViews}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.pendingSelections', 'Pending Selections')}</p>
              <p className={`text-2xl font-bold text-yellow-500`}>{stats.pendingSelections}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedGallery ? (
          // Gallery Detail View
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedGallery(null)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <span className="sr-only">{t('tools.clientGallery.back', 'Back')}</span>
                  &larr;
                </button>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedGallery.title}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedGallery.clientName} - {formatDate(selectedGallery.eventDate)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[selectedGallery.status].bg} ${STATUS_COLORS[selectedGallery.status].text}`}>
                  {selectedGallery.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {selectedGallery.status !== 'shared' && (
                  <button
                    onClick={() => shareGallery(selectedGallery)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('tools.clientGallery.shareGallery', 'Share Gallery')}
                  </button>
                )}
                {selectedGallery.status === 'shared' && (
                  <button
                    onClick={() => copyShareLink(selectedGallery.shareLink)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {copiedLink === selectedGallery.shareLink ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        {t('tools.clientGallery.copied', 'Copied!')}
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4" />
                        {t('tools.clientGallery.copyLink', 'Copy Link')}
                      </>
                    )}
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#0D9488] text-white' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Info */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.photos', 'Photos')}</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{galleryPhotos.length}</p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.views', 'Views')}</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedGallery.viewCount}</p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.selected', 'Selected')}</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {galleryPhotos.filter(p => p.status === 'selected').length} / {selectedGallery.maxSelections}
                </p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.clientGallery.protection', 'Protection')}</p>
                <p className={`font-medium flex items-center gap-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedGallery.isPasswordProtected ? (
                    <><Lock className="w-4 h-4" /> {t('tools.clientGallery.passwordProtected', 'Password Protected')}</>
                  ) : (
                    <><Unlock className="w-4 h-4" /> {t('tools.clientGallery.public', 'Public')}</>
                  )}
                </p>
              </div>
            </div>

            {/* Photos Grid/List */}
            {galleryPhotos.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.clientGallery.noPhotosInThisGallery', 'No photos in this gallery yet')}</p>
                <p className="text-sm mt-2">{t('tools.clientGallery.uploadPhotosToShareWith', 'Upload photos to share with your client')}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Image className="w-8 h-8 opacity-30" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => togglePhotoFavorite(photo)}
                        className={`p-2 rounded-full ${photo.isFavorite ? 'bg-yellow-500' : 'bg-white/20 hover:bg-white/30'}`}
                      >
                        <Star className={`w-4 h-4 ${photo.isFavorite ? 'text-white fill-white' : 'text-white'}`} />
                      </button>
                      <button
                        onClick={() => togglePhotoStatus(photo, photo.status === 'selected' ? 'pending' : 'selected')}
                        className={`p-2 rounded-full ${photo.status === 'selected' ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'}`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-2 rounded-full bg-white/20 hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {photo.status !== 'pending' && (
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${PHOTO_STATUS_COLORS[photo.status].bg} ${PHOTO_STATUS_COLORS[photo.status].text}`}>
                        {photo.status}
                      </div>
                    )}
                    {photo.isFavorite && (
                      <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Image className="w-6 h-6 opacity-30" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{photo.filename}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {photo.width}x{photo.height} - {formatFileSize(photo.size)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${PHOTO_STATUS_COLORS[photo.status].bg} ${PHOTO_STATUS_COLORS[photo.status].text}`}>
                      {photo.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePhotoFavorite(photo)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Star className={`w-4 h-4 ${photo.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Galleries List
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button
                onClick={() => setShowGalleryForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
              >
                <Plus className="w-4 h-4" />
                {t('tools.clientGallery.newGallery', 'New Gallery')}
              </button>
              <input
                type="text"
                placeholder={t('tools.clientGallery.searchGalleries', 'Search galleries...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">{t('tools.clientGallery.allStatus', 'All Status')}</option>
                <option value="draft">{t('tools.clientGallery.draft', 'Draft')}</option>
                <option value="ready">{t('tools.clientGallery.ready', 'Ready')}</option>
                <option value="shared">{t('tools.clientGallery.shared2', 'Shared')}</option>
                <option value="archived">{t('tools.clientGallery.archived', 'Archived')}</option>
              </select>
            </div>

            {/* Galleries Grid */}
            {filteredGalleries.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.clientGallery.noGalleriesFoundCreateYour', 'No galleries found. Create your first gallery!')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGalleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    className={`rounded-lg border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedGallery(gallery)}
                  >
                    <div className={`h-32 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                      <FolderOpen className="w-12 h-12 opacity-30" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {gallery.title}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gallery.clientName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[gallery.status].bg} ${STATUS_COLORS[gallery.status].text}`}>
                          {gallery.status}
                        </span>
                      </div>
                      <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(gallery.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {gallery.viewCount}
                        </span>
                        {gallery.isPasswordProtected && <Lock className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery Form Modal */}
        {showGalleryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.clientGallery.createNewGallery', 'Create New Gallery')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientGallery.clientName', 'Client Name *')}
                    </label>
                    <input
                      type="text"
                      value={newGallery.clientName}
                      onChange={(e) => setNewGallery({ ...newGallery, clientName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientGallery.clientEmail', 'Client Email')}
                    </label>
                    <input
                      type="email"
                      value={newGallery.clientEmail}
                      onChange={(e) => setNewGallery({ ...newGallery, clientEmail: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientGallery.galleryTitle', 'Gallery Title *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('tools.clientGallery.eGSmithWeddingJune', 'e.g., Smith Wedding - June 2024')}
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientGallery.eventDate', 'Event Date')}
                    </label>
                    <input
                      type="date"
                      value={newGallery.eventDate}
                      onChange={(e) => setNewGallery({ ...newGallery, eventDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.clientGallery.sessionType', 'Session Type')}
                    </label>
                    <select
                      value={newGallery.sessionType}
                      onChange={(e) => setNewGallery({ ...newGallery, sessionType: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="Portrait">{t('tools.clientGallery.portrait', 'Portrait')}</option>
                      <option value="Wedding">{t('tools.clientGallery.wedding', 'Wedding')}</option>
                      <option value="Event">{t('tools.clientGallery.event', 'Event')}</option>
                      <option value="Product">{t('tools.clientGallery.product', 'Product')}</option>
                      <option value="Family">{t('tools.clientGallery.family', 'Family')}</option>
                      <option value="Corporate">{t('tools.clientGallery.corporate', 'Corporate')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.clientGallery.description', 'Description')}
                  </label>
                  <textarea
                    rows={3}
                    value={newGallery.description}
                    onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.clientGallery.gallerySettings', 'Gallery Settings')}</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newGallery.isPasswordProtected}
                        onChange={(e) => setNewGallery({ ...newGallery, isPasswordProtected: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clientGallery.passwordProtectGallery', 'Password protect gallery')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newGallery.downloadEnabled}
                        onChange={(e) => setNewGallery({ ...newGallery, downloadEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clientGallery.allowDownloads', 'Allow downloads')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newGallery.selectionEnabled}
                        onChange={(e) => setNewGallery({ ...newGallery, selectionEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.clientGallery.enableClientSelections', 'Enable client selections')}
                      </span>
                    </label>
                    {newGallery.selectionEnabled && (
                      <div>
                        <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('tools.clientGallery.maxSelectionsAllowed', 'Max selections allowed')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newGallery.maxSelections}
                          onChange={(e) => setNewGallery({ ...newGallery, maxSelections: parseInt(e.target.value) })}
                          className={`w-32 px-3 py-2 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowGalleryForm(false);
                    resetGalleryForm();
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.clientGallery.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleAddGallery}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                >
                  {t('tools.clientGallery.createGallery', 'Create Gallery')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ClientGalleryTool;
