'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Clock,
  User,
  BarChart3,
  List,
  Grid3X3,
  Folder,
  FileText,
  Video,
  Mic,
  Mail,
  Image,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

// Types
type ContentType = 'blog-post' | 'social-media' | 'video' | 'podcast' | 'newsletter' | 'infographic';
type Platform = 'website' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook';
type ContentStatus = 'idea' | 'draft' | 'in-review' | 'scheduled' | 'published';
type TabType = 'calendar' | 'content' | 'campaigns' | 'analytics';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  platform: Platform;
  status: ContentStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  author: string;
  campaign: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  color: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ContentCalendarState {
  items: ContentItem[];
  campaigns: Campaign[];
}

// Column configuration for export
const CONTENT_EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'contentType', header: 'Content Type', type: 'string' },
  { key: 'platform', header: 'Platform', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'scheduledDate', header: 'Scheduled Date', type: 'date' },
  { key: 'scheduledTime', header: 'Scheduled Time', type: 'string' },
  { key: 'author', header: 'Author', type: 'string' },
  { key: 'campaign', header: 'Campaign', type: 'string' },
  { key: 'tags', header: 'Tags', type: 'string', format: (value: string[]) => Array.isArray(value) ? value.join(', ') : String(value || '') },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'updatedAt', header: 'Updated At', type: 'date' },
];

// Constants
const CONTENT_TYPES: { value: ContentType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: 'blog-post', label: 'Blog Post', icon: FileText },
  { value: 'social-media', label: 'Social Media', icon: Grid3X3 },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'podcast', label: 'Podcast', icon: Mic },
  { value: 'newsletter', label: 'Newsletter', icon: Mail },
  { value: 'infographic', label: 'Infographic', icon: Image },
];

const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'website', label: 'Website', color: '#3B82F6' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
  { value: 'twitter', label: 'Twitter/X', color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'tiktok', label: 'TikTok', color: '#000000' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
];

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string; dot: string }> = {
  idea: { label: 'Idea', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
  draft: { label: 'Draft', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  'in-review': { label: 'In Review', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  published: { label: 'Published', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
};

const CAMPAIGN_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STORAGE_KEY = 'content-calendar-data';

// Helper functions
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

const isToday = (dateStr: string): boolean => dateStr === formatDate(new Date());

// Generate sample data
const generateSampleData = (): ContentCalendarState => {
  const today = new Date();
  const campaigns: Campaign[] = [
    {
      id: generateId(),
      name: 'Q1 Product Launch',
      description: 'Launch campaign for new product line',
      color: '#3B82F6',
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 0)),
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Brand Awareness',
      description: 'Ongoing brand visibility campaign',
      color: '#10B981',
      startDate: formatDate(new Date(today.getFullYear(), 0, 1)),
      endDate: formatDate(new Date(today.getFullYear(), 11, 31)),
      createdAt: new Date().toISOString(),
    },
  ];

  const items: ContentItem[] = [
    {
      id: generateId(),
      title: 'Welcome to Our Blog',
      description: 'Introduction post for new readers',
      contentType: 'blog-post',
      platform: 'website',
      status: 'published',
      scheduledDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)),
      scheduledTime: '09:00',
      author: 'Marketing Team',
      campaign: campaigns[1].name,
      tags: ['introduction', 'welcome'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Product Feature Highlight',
      description: 'Showcasing key product features',
      contentType: 'video',
      platform: 'youtube',
      status: 'scheduled',
      scheduledDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)),
      scheduledTime: '14:00',
      author: 'Video Team',
      campaign: campaigns[0].name,
      tags: ['product', 'features', 'demo'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Weekly Tips & Tricks',
      description: 'Social media carousel with tips',
      contentType: 'social-media',
      platform: 'instagram',
      status: 'draft',
      scheduledDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
      scheduledTime: '10:00',
      author: 'Social Media Manager',
      campaign: campaigns[1].name,
      tags: ['tips', 'weekly'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Industry Podcast Episode',
      description: 'Interview with industry expert',
      contentType: 'podcast',
      platform: 'website',
      status: 'idea',
      scheduledDate: null,
      scheduledTime: null,
      author: 'Content Team',
      campaign: '',
      tags: ['podcast', 'interview'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { items, campaigns };
};

// Props interface
interface ContentCalendarToolProps {
  uiConfig?: UIConfig;
}

// Main component
export const ContentCalendarTool: React.FC<ContentCalendarToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Initialize sample data
  const sampleData = generateSampleData();

  // Use hook for content items data
  const {
    data: contentItems,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV: exportItemsCSV,
    exportExcel: exportItemsExcel,
    exportJSON: exportItemsJSON,
    exportPDF: exportItemsPDF,
  } = useToolData<ContentItem>('content-calendar', sampleData.items, CONTENT_EXPORT_COLUMNS);

  // Local state for campaigns (not synced)
  const [campaigns, setCampaigns] = useState<Campaign[]>(sampleData.campaigns);

  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form state for content
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    contentType: 'blog-post' as ContentType,
    platform: 'website' as Platform,
    status: 'idea' as ContentStatus,
    scheduledDate: '',
    scheduledTime: '09:00',
    author: '',
    campaign: '',
    tags: '',
  });

  // Form state for campaign
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    color: CAMPAIGN_COLORS[0],
    startDate: '',
    endDate: '',
  });

  // Persist campaigns to localStorage
  useEffect(() => {
    localStorage.setItem('content-calendar-campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.text || params.content) {
        setContentForm(prev => ({
          ...prev,
          title: params.title || params.text || '',
          description: params.description || params.content || '',
        }));
        setShowContentModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Filtered content items
  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.contentType === filterType;
      const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesType && matchesPlatform && matchesStatus;
    });
  }, [contentItems, searchQuery, filterType, filterPlatform, filterStatus]);

  // Get items for a specific date
  const getItemsForDate = (dateStr: string): ContentItem[] => {
    return filteredItems.filter((item) => item.scheduledDate === dateStr);
  };

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDate(new Date()));
  };

  // Content CRUD operations
  const openAddContentModal = (date?: string) => {
    setEditingItem(null);
    setContentForm({
      title: '',
      description: '',
      contentType: 'blog-post',
      platform: 'website',
      status: 'idea',
      scheduledDate: date || selectedDate || '',
      scheduledTime: '09:00',
      author: '',
      campaign: '',
      tags: '',
    });
    setShowContentModal(true);
  };

  const openEditContentModal = (item: ContentItem) => {
    setEditingItem(item);
    setContentForm({
      title: item.title,
      description: item.description,
      contentType: item.contentType,
      platform: item.platform,
      status: item.status,
      scheduledDate: item.scheduledDate || '',
      scheduledTime: item.scheduledTime || '09:00',
      author: item.author,
      campaign: item.campaign,
      tags: item.tags.join(', '),
    });
    setShowContentModal(true);
  };

  const handleSaveContent = () => {
    if (!contentForm.title.trim()) {
      setValidationMessage('Please enter a title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const tagsArray = contentForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingItem) {
      updateItem(editingItem.id, {
        ...contentForm,
        scheduledDate: contentForm.scheduledDate || null,
        scheduledTime: contentForm.scheduledTime || null,
        tags: tagsArray,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newItem: ContentItem = {
        id: generateId(),
        ...contentForm,
        scheduledDate: contentForm.scheduledDate || null,
        scheduledTime: contentForm.scheduledTime || null,
        tags: tagsArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addItem(newItem);
    }

    setShowContentModal(false);
    setEditingItem(null);
  };

  const handleDeleteContent = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Content Item',
      message: 'Are you sure you want to delete this content item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteItem(id);
    }
  };

  // Campaign CRUD operations
  const openAddCampaignModal = () => {
    setEditingCampaign(null);
    setCampaignForm({
      name: '',
      description: '',
      color: CAMPAIGN_COLORS[0],
      startDate: '',
      endDate: '',
    });
    setShowCampaignModal(true);
  };

  const openEditCampaignModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description,
      color: campaign.color,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    });
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = () => {
    if (!campaignForm.name.trim()) {
      setValidationMessage('Please enter a campaign name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingCampaign) {
      setCampaigns(prev =>
        prev.map(c =>
          c.id === editingCampaign.id
            ? { ...c, ...campaignForm }
            : c
        )
      );
    } else {
      const newCampaign: Campaign = {
        id: generateId(),
        ...campaignForm,
        createdAt: new Date().toISOString(),
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }

    setShowCampaignModal(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  // Analytics data
  const analyticsData = useMemo(() => {
    const byStatus: Record<ContentStatus, number> = {
      idea: 0,
      draft: 0,
      'in-review': 0,
      scheduled: 0,
      published: 0,
    };
    const byType: Record<ContentType, number> = {
      'blog-post': 0,
      'social-media': 0,
      video: 0,
      podcast: 0,
      newsletter: 0,
      infographic: 0,
    };
    const byPlatform: Record<Platform, number> = {
      website: 0,
      instagram: 0,
      twitter: 0,
      linkedin: 0,
      youtube: 0,
      tiktok: 0,
      facebook: 0,
    };

    contentItems.forEach(item => {
      byStatus[item.status]++;
      byType[item.contentType]++;
      byPlatform[item.platform]++;
    });

    return { byStatus, byType, byPlatform, total: contentItems.length };
  }, [contentItems]);

  // Render calendar grid
  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dateStr = isCurrentMonth ? formatDate(new Date(year, month, day)) : '';
      const dayItems = isCurrentMonth ? getItemsForDate(dateStr) : [];
      const isSelected = selectedDate === dateStr;
      const isTodayDate = isCurrentMonth && isToday(dateStr);

      days.push(
        <div
          key={i}
          onClick={() => {
            if (isCurrentMonth) {
              setSelectedDate(dateStr);
            }
          }}
          className={`
            min-h-[100px] p-2 border-b border-r transition-colors cursor-pointer
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
            ${isCurrentMonth ? '' : 'invisible'}
            ${isSelected ? (isDark ? 'bg-teal-900/30' : 'bg-teal-50') : ''}
            ${isCurrentMonth ? (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50') : ''}
          `}
        >
          {isCurrentMonth && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                    ${isTodayDate ? 'bg-[#0D9488] text-white' : isDark ? 'text-white' : 'text-gray-900'}
                  `}
                >
                  {day}
                </span>
                {dayItems.length > 0 && (
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {dayItems.length}
                  </span>
                )}
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[60px]">
                {dayItems.slice(0, 3).map((item) => {
                  const typeConfig = CONTENT_TYPES.find(t => t.value === item.contentType);
                  const TypeIcon = typeConfig?.icon || FileText;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditContentModal(item);
                      }}
                      className={`
                        px-1.5 py-0.5 rounded text-xs truncate flex items-center gap-1
                        ${STATUS_CONFIG[item.status].bg} ${STATUS_CONFIG[item.status].text}
                      `}
                      title={item.title}
                    >
                      <TypeIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} pl-1`}>
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  // Render content list item
  const renderContentItem = (item: ContentItem) => {
    const typeConfig = CONTENT_TYPES.find(t => t.value === item.contentType);
    const TypeIcon = typeConfig?.icon || FileText;
    const platformConfig = PLATFORMS.find(p => p.value === item.platform);

    return (
      <div
        key={item.id}
        className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg ${STATUS_CONFIG[item.status].bg}`}
            >
              <TypeIcon className={`w-5 h-5 ${STATUS_CONFIG[item.status].text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.title}
              </h4>
              <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[item.status].bg} ${STATUS_CONFIG[item.status].text}`}
                >
                  {STATUS_CONFIG[item.status].label}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: platformConfig?.color || '#6B7280' }}
                >
                  {platformConfig?.label || item.platform}
                </span>
                {item.scheduledDate && (
                  <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(item.scheduledDate).toLocaleDateString()}
                    {item.scheduledTime && ` at ${formatTime(item.scheduledTime)}`}
                  </span>
                )}
                {item.author && (
                  <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-3 h-3" />
                    {item.author}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => openEditContentModal(item)}
              className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              title={t('tools.contentCalendar.edit', 'Edit')}
            >
              <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => handleDeleteContent(item.id)}
              className={`p-1.5 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-[700px] p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0D9488] rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.contentCalendar.contentCalendar', 'Content Calendar')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.contentCalendar.planAndScheduleYourContent', 'Plan and schedule your content')}
            </p>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.contentCalendar.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <WidgetEmbedButton toolSlug="content-calendar" toolName="Content Calendar" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            showLabel={true}
            size="md"
          />
          <ExportDropdown
            onExportCSV={() => exportItemsCSV({ filename: 'content-calendar' })}
            onExportExcel={() => exportItemsExcel({ filename: 'content-calendar' })}
            onExportJSON={() => exportItemsJSON({ filename: 'content-calendar' })}
            onExportPDF={() => exportItemsPDF({ filename: 'content-calendar', title: 'Content Calendar', subtitle: `${contentItems.length} content items` })}
            onPrint={() => printData(contentItems, CONTENT_EXPORT_COLUMNS, { title: 'Content Calendar' })}
            onCopyToClipboard={() => copyUtil(contentItems, CONTENT_EXPORT_COLUMNS)}
            disabled={contentItems.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
          <button
            onClick={() => openAddContentModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('tools.contentCalendar.addContent', 'Add Content')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {[
          { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
          { id: 'content' as TabType, label: 'Content', icon: List },
          { id: 'campaigns' as TabType, label: 'Campaigns', icon: Folder },
          { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={t('tools.contentCalendar.searchContent', 'Search content...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
          className={`px-3 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
        >
          <option value="all">{t('tools.contentCalendar.allTypes', 'All Types')}</option>
          {CONTENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
          className={`px-3 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
        >
          <option value="all">{t('tools.contentCalendar.allPlatforms', 'All Platforms')}</option>
          {PLATFORMS.map((platform) => (
            <option key={platform.value} value={platform.value}>{platform.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ContentStatus | 'all')}
          className={`px-3 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
        >
          <option value="all">{t('tools.contentCalendar.allStatuses', 'All Statuses')}</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'calendar' && (
        <div>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <h3 className={`text-lg font-semibold min-w-[160px] text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {MONTHS[month]} {year}
              </h3>
              <button
                onClick={goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.contentCalendar.today', 'Today')}
            </button>
          </div>

          {/* Days Header */}
          <div className={`grid grid-cols-7 border-t border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className={`py-2 text-center text-sm font-medium border-r border-b ${
                  isDark ? 'border-gray-700 text-gray-400 bg-gray-900' : 'border-gray-200 text-gray-600 bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className={`grid grid-cols-7 border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {renderCalendarDays()}
          </div>

          {/* Selected Date Detail */}
          {selectedDate && (
            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
                <button
                  onClick={() => openAddContentModal(selectedDate)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.contentCalendar.add', 'Add')}
                </button>
              </div>
              {getItemsForDate(selectedDate).length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.contentCalendar.noContentScheduledForThis', 'No content scheduled for this day')}
                </p>
              ) : (
                <div className="space-y-2">
                  {getItemsForDate(selectedDate).map(renderContentItem)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.contentCalendar.noContentItemsFound', 'No content items found')}</p>
              <button
                onClick={() => openAddContentModal()}
                className="mt-3 text-[#0D9488] hover:underline"
              >
                {t('tools.contentCalendar.createYourFirstContentItem', 'Create your first content item')}
              </button>
            </div>
          ) : (
            filteredItems.map(renderContentItem)
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Campaigns ({campaigns.length})
            </h3>
            <button
              onClick={openAddCampaignModal}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('tools.contentCalendar.addCampaign', 'Add Campaign')}
            </button>
          </div>
          {campaigns.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('tools.contentCalendar.noCampaignsYet', 'No campaigns yet')}</p>
              <button
                onClick={openAddCampaignModal}
                className="mt-3 text-[#0D9488] hover:underline"
              >
                {t('tools.contentCalendar.createYourFirstCampaign', 'Create your first campaign')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => {
                const campaignItems = contentItems.filter(item => item.campaign === campaign.name);
                return (
                  <div
                    key={campaign.id}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    style={{ borderLeftWidth: '4px', borderLeftColor: campaign.color }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {campaign.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {campaign.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCampaignModal(campaign)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className={`p-1 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>{campaignItems.length} content items</p>
                      <p>
                        {campaign.startDate && campaign.endDate
                          ? `${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}`
                          : 'No dates set'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Content */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.contentCalendar.totalContentItems', 'Total Content Items')}
            </h4>
            <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {analyticsData.total}
            </p>
          </div>

          {/* By Status */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.contentCalendar.byStatus', 'By Status')}
            </h4>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analyticsData.byStatus[key as ContentStatus]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Type */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.contentCalendar.byContentType', 'By Content Type')}
            </h4>
            <div className="space-y-2">
              {CONTENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <type.icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {type.label}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analyticsData.byType[type.value]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Platform */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} md:col-span-2 lg:col-span-3`}>
            <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.contentCalendar.byPlatform', 'By Platform')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.value}
                  className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-white'}`}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: platform.color }}
                  >
                    {analyticsData.byPlatform[platform.value]}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {platform.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingItem ? t('tools.contentCalendar.editContent', 'Edit Content') : t('tools.contentCalendar.addContent2', 'Add Content')}
              </h3>
              <button
                onClick={() => setShowContentModal(false)}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.title', 'Title *')}
                </label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder={t('tools.contentCalendar.contentTitle', 'Content title')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.description', 'Description')}
                </label>
                <textarea
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  placeholder={t('tools.contentCalendar.briefDescription', 'Brief description')}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Type and Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.contentType', 'Content Type')}
                  </label>
                  <select
                    value={contentForm.contentType}
                    onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value as ContentType })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.platform', 'Platform')}
                  </label>
                  <select
                    value={contentForm.platform}
                    onChange={(e) => setContentForm({ ...contentForm, platform: e.target.value as Platform })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>{platform.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.status', 'Status')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setContentForm({ ...contentForm, status: key as ContentStatus })}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        contentForm.status === key
                          ? `${config.bg} ${config.text} border-transparent ring-2 ring-[#0D9488]`
                          : isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.scheduledDate', 'Scheduled Date')}
                  </label>
                  <input
                    type="date"
                    value={contentForm.scheduledDate}
                    onChange={(e) => setContentForm({ ...contentForm, scheduledDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.time', 'Time')}
                  </label>
                  <input
                    type="time"
                    value={contentForm.scheduledTime}
                    onChange={(e) => setContentForm({ ...contentForm, scheduledTime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Author and Campaign */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.authorCreator', 'Author/Creator')}
                  </label>
                  <input
                    type="text"
                    value={contentForm.author}
                    onChange={(e) => setContentForm({ ...contentForm, author: e.target.value })}
                    placeholder={t('tools.contentCalendar.authorName', 'Author name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.campaign', 'Campaign')}
                  </label>
                  <select
                    value={contentForm.campaign}
                    onChange={(e) => setContentForm({ ...contentForm, campaign: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.contentCalendar.noCampaign', 'No Campaign')}</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.name}>{campaign.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.tags', 'Tags')}
                </label>
                <input
                  type="text"
                  value={contentForm.tags}
                  onChange={(e) => setContentForm({ ...contentForm, tags: e.target.value })}
                  placeholder={t('tools.contentCalendar.commaSeparatedTags', 'Comma-separated tags')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowContentModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('tools.contentCalendar.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveContent}
                className="flex-1 py-2 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                {editingItem ? t('tools.contentCalendar.saveChanges', 'Save Changes') : t('tools.contentCalendar.addContent3', 'Add Content')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingCampaign ? t('tools.contentCalendar.editCampaign', 'Edit Campaign') : t('tools.contentCalendar.addCampaign2', 'Add Campaign')}
              </h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.campaignName', 'Campaign Name *')}
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder={t('tools.contentCalendar.campaignName2', 'Campaign name')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.description2', 'Description')}
                </label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  placeholder={t('tools.contentCalendar.campaignDescription', 'Campaign description')}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.contentCalendar.color', 'Color')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CAMPAIGN_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCampaignForm({ ...campaignForm, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        campaignForm.color === color ? 'ring-2 ring-offset-2 ring-[#0D9488] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.startDate', 'Start Date')}
                  </label>
                  <input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.contentCalendar.endDate', 'End Date')}
                  </label>
                  <input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex gap-3 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowCampaignModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('tools.contentCalendar.cancel2', 'Cancel')}
              </button>
              <button
                onClick={handleSaveCampaign}
                className="flex-1 py-2 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg font-medium transition-colors"
              >
                {editingCampaign ? t('tools.contentCalendar.saveChanges2', 'Save Changes') : t('tools.contentCalendar.addCampaign3', 'Add Campaign')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 z-40">
          {validationMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default ContentCalendarTool;
