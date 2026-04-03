import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { contentApi, UserContent, ContentStats } from '../lib/contentApi';
import { appsApi, UserApp, AppStats } from '../lib/appsApi';
import {
  Image,
  Video,
  FileText,
  Music,
  Sparkles,
  Heart,
  Download,
  Trash2,
  Loader2,
  Play,
  X,
  Grid,
  List,
  Search,
  Code2,
  ExternalLink,
  GitBranch,
  Rocket,
  Globe,
  Smartphone,
  Server,
  Edit3,
  Copy,
  Check,
} from 'lucide-react';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import { useToolStack } from '../contexts/ToolStackContext';
import { UIConfig } from '../components/ContextualUI';

type MainTab = 'content' | 'apps';
type ContentTab = 'all' | 'image' | 'video' | 'logo' | 'pdf' | 'audio' | 'text' | 'favorites';
type AppsTab = 'all' | 'deployed' | 'draft' | 'synced' | 'favorites';

const contentTabConfig: { id: ContentTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'logo', label: 'Logos', icon: Sparkles },
  { id: 'pdf', label: 'PDFs', icon: FileText },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'favorites', label: 'Favorites', icon: Heart },
];

const appsTabConfig: { id: AppsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Apps', icon: Code2 },
  { id: 'deployed', label: 'Deployed', icon: Rocket },
  { id: 'draft', label: 'Drafts', icon: FileText },
  { id: 'synced', label: 'GitHub Synced', icon: GitBranch },
  { id: 'favorites', label: 'Favorites', icon: Heart },
];

// Keep backward compatibility
const tabConfig = contentTabConfig;

const ContentGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { openTool } = useToolStack();

  // Main tab state
  const [mainTab, setMainTab] = useState<MainTab>('content');

  // Content state
  const [activeTab, setActiveTab] = useState<ContentTab>('all');
  const [contents, setContents] = useState<UserContent[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);

  // Apps state
  const [activeAppsTab, setActiveAppsTab] = useState<AppsTab>('all');
  const [apps, setApps] = useState<UserApp[]>([]);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [selectedApp, setSelectedApp] = useState<UserApp | null>(null);

  // Shared state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<UserContent | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle copy text content
  const handleCopyText = async (content: UserContent) => {
    const text = content.metadata?.text || content.prompt || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle edit in tool - opens tool modal with saved data
  const handleEditInTool = (content: UserContent) => {
    const toolId = content.metadata?.toolId || content.toolId;
    if (toolId) {
      // Build UIConfig with saved metadata as params for prefilling
      const uiConfig: UIConfig = {
        type: 'tool',
        toolId: toolId,
        title: content.title || 'Edit Content',
        params: {
          // Pass all saved metadata for prefilling
          ...content.metadata,
          // Also pass the content ID for reference
          contentId: content.id,
          // Flag to indicate this is an edit from gallery
          isEditFromGallery: true,
        },
      };

      // Store refresh callback reference for later use
      const refreshCallback = () => {
        loadContent();
        loadStats();
      };

      // Add callback to params so tool can call it after saving
      uiConfig.params = {
        ...uiConfig.params,
        onSaveCallback: refreshCallback,
      };

      // Open the tool modal with the saved data and refresh callback
      openTool(uiConfig, undefined, refreshCallback);

      // Close the content preview modal
      setSelectedContent(null);
    }
  };

  // Load content and stats when on content tab
  useEffect(() => {
    if (mainTab === 'content') {
      loadContent();
      loadStats();
    }
  }, [activeTab, mainTab]);

  // Load apps and stats when on apps tab
  useEffect(() => {
    if (mainTab === 'apps') {
      loadApps();
      loadAppStats();
    }
  }, [activeAppsTab, mainTab]);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const options: any = { limit: 50 };
      if (activeTab === 'favorites') {
        options.isFavorite = true;
      } else if (activeTab !== 'all') {
        options.contentType = activeTab;
      }

      const result = await contentApi.listContent(options);
      if (result.success && result.data) {
        setContents(result.data.items);
      } else {
        setError(result.error || 'Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await contentApi.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Apps loading functions
  const loadApps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const options: any = { limit: 50 };
      if (activeAppsTab === 'favorites') {
        options.isFavorite = true;
      } else if (activeAppsTab === 'deployed') {
        options.status = 'deployed';
      } else if (activeAppsTab === 'draft') {
        options.status = 'draft';
      } else if (activeAppsTab === 'synced') {
        options.hasGitHub = true;
      }

      const result = await appsApi.listApps(options);
      if (result.success && result.data) {
        setApps(result.data.items);
      } else {
        setError(result.error || 'Failed to load apps');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppStats = async () => {
    try {
      const result = await appsApi.getStats();
      if (result.success && result.data) {
        setAppStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load app stats:', err);
    }
  };

  const handleToggleAppFavorite = async (app: UserApp, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await appsApi.toggleFavorite(app.id);
      if (result.success && result.data) {
        setApps(prev =>
          prev.map(a => (a.id === app.id ? result.data! : a))
        );
        loadAppStats();
      }
    } catch (err) {
      console.error('Failed to toggle app favorite:', err);
    }
  };

  const handleDeleteApp = async (app: UserApp, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this app?')) return;

    setIsDeleting(app.id);
    try {
      const result = await appsApi.deleteApp(app.id);
      if (result.success) {
        setApps(prev => prev.filter(a => a.id !== app.id));
        loadAppStats();
        if (selectedApp?.id === app.id) {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete app:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenApp = (app: UserApp) => {
    // Navigate to chat page with the conversation ID if available, else fall back to metadata
    const chatId = app.conversationId || app.metadata?.conversationId;
    if (chatId) {
      navigate(`/chat/${chatId}`);
    } else {
      // Fallback: show the app in a new chat context (won't have history)
      console.warn('App has no conversation_id, opening in new chat');
      navigate(`/chat?appId=${app.id}`);
    }
  };

  const handleToggleFavorite = async (content: UserContent, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await contentApi.toggleFavorite(content.id);
      if (result.success && result.data) {
        setContents(prev =>
          prev.map(c => (c.id === content.id ? result.data! : c))
        );
        loadStats();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (content: UserContent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this content?')) return;

    setIsDeleting(content.id);
    try {
      const result = await contentApi.deleteContent(content.id);
      if (result.success) {
        setContents(prev => prev.filter(c => c.id !== content.id));
        loadStats();
        if (selectedContent?.id === content.id) {
          setSelectedContent(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (content: UserContent, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // For text content, create a text file from metadata
      if (content.contentType === 'text') {
        const text = content.metadata?.text || content.prompt || '';
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = content.filename || `${content.title || 'text'}-${content.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // For other content types, fetch the URL
      const response = await fetch(content.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = content.filename || `${content.contentType}-${content.id}.${getExtension(content.contentType)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const getExtension = (type: string): string => {
    const extensions: Record<string, string> = {
      image: 'jpg',
      video: 'mp4',
      logo: 'png',
      audio: 'mp3',
      pdf: 'pdf',
      text: 'txt',
    };
    return extensions[type] || 'txt';
  };

  const filteredContents = contents.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(query) ||
      c.prompt?.toLowerCase().includes(query) ||
      c.model?.toLowerCase().includes(query)
    );
  });

  const filteredApps = apps.filter(a => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query) ||
      a.generationPrompt?.toLowerCase().includes(query)
    );
  });

  const getContentIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      image: Image,
      video: Video,
      logo: Sparkles,
      audio: Music,
      pdf: FileText,
      text: FileText,
    };
    return icons[type] || FileText;
  };

  return (
    <div className={cn(
      "flex h-full",
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
    )}>
      {/* Shared Sidebar */}
      <AppSidebar activePage="content" />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 overflow-hidden flex flex-col",
        theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
      )}>
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-xl",
          theme === 'dark'
            ? 'bg-[#1a1a1a]/90 border-[#2a2a2a]'
            : 'bg-white/90 border-gray-200'
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Main Tab Switcher */}
                <div className={cn(
                  "flex items-center gap-1 p-1 rounded-lg",
                  theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100'
                )}>
                  <button
                    onClick={() => setMainTab('content')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                      mainTab === 'content'
                        ? 'bg-[#0D9488] text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Image className="w-4 h-4" />
                    {t('content.title')}
                  </button>
                  <button
                    onClick={() => setMainTab('apps')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                      mainTab === 'apps'
                        ? 'bg-[#0D9488] text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Code2 className="w-4 h-4" />
                    {t('content.apps')}
                  </button>
                </div>
              </div>

            {/* Stats - Show content stats or app stats based on main tab */}
            {mainTab === 'content' && stats && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className={cn(
                  "flex items-center gap-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <Grid className="w-4 h-4" />
                  <span>{stats.total} {t('content.items')}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{stats.favorites} {t('content.favorites')}</span>
                </div>
              </div>
            )}
            {mainTab === 'apps' && appStats && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className={cn(
                  "flex items-center gap-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <Code2 className="w-4 h-4" />
                  <span>{appStats.total} apps</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <Rocket className="w-4 h-4 text-green-500" />
                  <span>{appStats.deployed} deployed</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  <span>{appStats.withGitHub} synced</span>
                </div>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid'
                    ? 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'hover:bg-[#2a2a2a] text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list'
                    ? 'bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                      ? 'hover:bg-[#2a2a2a] text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs - Content or Apps */}
          <div className="flex items-center gap-1 pb-3 overflow-x-auto">
            {mainTab === 'content' ? (
              contentTabConfig.map(tab => {
                const Icon = tab.icon;
                const count = tab.id === 'all'
                  ? stats?.total
                  : tab.id === 'favorites'
                    ? stats?.favorites
                    : stats?.byType[tab.id];

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/25'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`content.tabs.${tab.id}`)}
                    {count !== undefined && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        activeTab === tab.id
                          ? 'bg-white/20'
                          : theme === 'dark'
                            ? 'bg-[#2a2a2a]'
                            : 'bg-gray-200'
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              appsTabConfig.map(tab => {
                const Icon = tab.icon;
                const count = tab.id === 'all'
                  ? appStats?.total
                  : tab.id === 'favorites'
                    ? appStats?.favorites
                    : tab.id === 'deployed'
                      ? appStats?.deployed
                      : tab.id === 'synced'
                        ? appStats?.withGitHub
                        : appStats?.byStatus['draft'];

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAppsTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeAppsTab === tab.id
                        ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/25'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`content.appsTabs.${tab.id}`)}
                    {count !== undefined && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        activeAppsTab === tab.id
                          ? 'bg-white/20'
                          : theme === 'dark'
                            ? 'bg-[#2a2a2a]'
                            : 'bg-gray-200'
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mainTab === 'content' ? t('content.searchPlaceholder') : t('content.appsSearchPlaceholder')}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
              theme === 'dark'
                ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#0D9488]'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20'
            )}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
          </div>
        ) : error ? (
          <div className={cn(
            "text-center py-20",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            <p>{error}</p>
            <button
              onClick={mainTab === 'content' ? loadContent : loadApps}
              className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : mainTab === 'apps' ? (
          /* Apps View */
          filteredApps.length === 0 ? (
            <div className={cn(
              "text-center py-20",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              <Code2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No apps yet</p>
              <p className="text-sm">
                Generate apps using AI to see them here.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                Create an App
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className={cn(
                    "group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] ring-1 ring-[#3a3a3a]'
                      : 'bg-white ring-1 ring-gray-200 shadow-sm'
                  )}
                >
                  {/* App Thumbnail */}
                  <div className="aspect-video relative">
                    {app.thumbnailUrl ? (
                      <img
                        src={app.thumbnailUrl}
                        alt={app.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        theme === 'dark' ? 'bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      )}>
                        <Code2 className={cn(
                          "w-12 h-12",
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        )} />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        app.status === 'deployed' ? 'bg-green-500/90 text-white' :
                        app.status === 'building' ? 'bg-yellow-500/90 text-white' :
                        app.status === 'failed' ? 'bg-red-500/90 text-white' :
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      )}>
                        {app.status}
                      </span>
                    </div>

                    {/* GitHub Badge */}
                    {app.github && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-500/90 text-white flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          synced
                        </span>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <button
                          onClick={(e) => handleToggleAppFavorite(app, e)}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            app.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                          )} />
                        </button>
                        <div className="flex items-center gap-1">
                          {app.frontendUrl && (
                            <a
                              href={app.frontendUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-white" />
                            </a>
                          )}
                          <button
                            onClick={(e) => handleDeleteApp(app, e)}
                            disabled={isDeleting === app.id}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
                          >
                            {isDeleting === app.id ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="p-3">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {app.name}
                    </p>
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    )}>
                      {app.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {app.hasFrontend && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        )}>
                          <Globe className="w-3 h-3 inline mr-1" />
                          Web
                        </span>
                      )}
                      {app.hasBackend && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                        )}>
                          <Server className="w-3 h-3 inline mr-1" />
                          API
                        </span>
                      )}
                      {app.hasMobile && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                        )}>
                          <Smartphone className="w-3 h-3 inline mr-1" />
                          Mobile
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Apps List View */
            <div className="space-y-2">
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                      : 'bg-white hover:bg-gray-50 shadow-sm'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {app.thumbnailUrl ? (
                      <img
                        src={app.thumbnailUrl}
                        alt={app.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                      )}>
                        <Code2 className={cn(
                          "w-6 h-6",
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        )} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-medium truncate",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {app.name}
                      </p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        app.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                        app.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                        app.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      )}>
                        {app.status}
                      </span>
                      {app.github && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          synced
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm truncate",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {app.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      {app.hasFrontend && <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Web</span>}
                      {app.hasBackend && <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>API</span>}
                      {app.hasMobile && <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Mobile</span>}
                      <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleAppFavorite(app, e)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        app.isFavorite
                          ? 'text-red-500'
                          : theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      <Heart className={cn("w-5 h-5", app.isFavorite && 'fill-current')} />
                    </button>
                    {app.frontendUrl && (
                      <a
                        href={app.frontendUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDeleteApp(app, e)}
                      disabled={isDeleting === app.id}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-red-400'
                          : 'text-gray-400 hover:text-red-500'
                      )}
                    >
                      {isDeleting === app.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredContents.length === 0 ? (
          /* Content Empty State */
          <div className={cn(
            "text-center py-20",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No content yet</p>
            <p className="text-sm">
              Generate some images or videos using AI tools to see them here.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredContents.map(content => (
              <div
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={cn(
                  "group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl",
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] ring-1 ring-[#3a3a3a]'
                    : 'bg-white ring-1 ring-gray-200 shadow-sm'
                )}
              >
                {/* Thumbnail */}
                <div className="aspect-square relative">
                  {content.contentType === 'video' ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <video
                        src={content.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  ) : content.contentType === 'image' || content.contentType === 'logo' ? (
                    <img
                      src={content.url}
                      alt={content.title || 'Content'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center",
                      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                    )}>
                      {React.createElement(getContentIcon(content.contentType), {
                        className: cn(
                          "w-12 h-12",
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        )
                      })}
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <button
                        onClick={(e) => handleToggleFavorite(content, e)}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <Heart className={cn(
                          "w-4 h-4",
                          content.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                        )} />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDownload(content, e)}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(content, e)}
                          disabled={isDeleting === content.id}
                          className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
                        >
                          {isDeleting === content.id ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {content.title || 'Untitled'}
                  </p>
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  )}>
                    {content.model || content.contentType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredContents.map(content => {
              const Icon = getContentIcon(content.contentType);
              return (
                <div
                  key={content.id}
                  onClick={() => setSelectedContent(content)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                      : 'bg-white hover:bg-gray-50 shadow-sm'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {content.contentType === 'video' || content.contentType === 'image' || content.contentType === 'logo' ? (
                      content.contentType === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <img
                          src={content.url}
                          alt={content.title || 'Content'}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        )} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium truncate",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {content.title || 'Untitled'}
                    </p>
                    <p className={cn(
                      "text-sm truncate",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {content.prompt || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                        {content.model || content.contentType}
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                        {new Date(content.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(content, e)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        content.isFavorite
                          ? 'text-red-500'
                          : theme === 'dark'
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      <Heart className={cn("w-5 h-5", content.isFavorite && 'fill-current')} />
                    </button>
                    <button
                      onClick={(e) => handleDownload(content, e)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-gray-300'
                          : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(content, e)}
                      disabled={isDeleting === content.id}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-red-400'
                          : 'text-gray-400 hover:text-red-500'
                      )}
                    >
                      {isDeleting === content.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>

      {/* Content Preview Modal */}
      {selectedContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedContent(null)}
        >
          <div
            className={cn(
              "relative max-w-4xl max-h-[90vh] w-full mx-4 rounded-2xl overflow-hidden",
              theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="max-h-[70vh] overflow-auto">
              {selectedContent.contentType === 'video' ? (
                <video
                  src={selectedContent.url}
                  controls
                  autoPlay
                  className="w-full"
                />
              ) : selectedContent.contentType === 'image' || selectedContent.contentType === 'logo' ? (
                <img
                  src={selectedContent.url}
                  alt={selectedContent.title || 'Content'}
                  className="w-full"
                />
              ) : selectedContent.contentType === 'text' ? (
                <div className={cn(
                  "p-6 whitespace-pre-wrap leading-relaxed",
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                )}>
                  {selectedContent.metadata?.text || selectedContent.prompt || 'No content available'}
                </div>
              ) : (
                <div className="p-8 flex items-center justify-center">
                  {React.createElement(getContentIcon(selectedContent.contentType), {
                    className: "w-24 h-24 text-gray-400"
                  })}
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className={cn(
              "p-6 border-t",
              theme === 'dark' ? 'border-[#2a2a2a]' : 'border-gray-200'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {selectedContent.title || 'Untitled'}
                  </h3>
                  {selectedContent.prompt && (
                    <p className={cn(
                      "mt-1 text-sm",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {selectedContent.prompt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                    {selectedContent.model && (
                      <span className={cn(
                        "px-2 py-1 rounded-full",
                        theme === 'dark' ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-600'
                      )}>
                        {selectedContent.model}
                      </span>
                    )}
                    {selectedContent.width && selectedContent.height && (
                      <span className={cn(
                        "px-2 py-1 rounded-full",
                        theme === 'dark' ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-600'
                      )}>
                        {selectedContent.width} x {selectedContent.height}
                      </span>
                    )}
                    {selectedContent.duration && (
                      <span className={cn(
                        "px-2 py-1 rounded-full",
                        theme === 'dark' ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-600'
                      )}>
                        {selectedContent.duration}s
                      </span>
                    )}
                    <span className={cn(
                      "text-xs",
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    )}>
                      {new Date(selectedContent.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Copy button for text content */}
                  {selectedContent.contentType === 'text' && (
                    <button
                      onClick={() => handleCopyText(selectedContent)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        copied
                          ? 'bg-green-500/10 text-green-500'
                          : theme === 'dark'
                            ? 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  )}
                  {/* Edit in Tool button */}
                  {(selectedContent.metadata?.toolId || selectedContent.toolId) && (
                    <button
                      onClick={() => handleEditInTool(selectedContent)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        theme === 'dark'
                          ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                          : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                      )}
                      title="Edit in Tool"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleToggleFavorite(selectedContent, e)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      selectedContent.isFavorite
                        ? 'bg-red-500/10 text-red-500'
                        : theme === 'dark'
                          ? 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                          : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Heart className={cn("w-5 h-5", selectedContent.isFavorite && 'fill-current')} />
                  </button>
                  <button
                    onClick={(e) => handleDownload(selectedContent, e)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark'
                        ? 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      handleDelete(selectedContent, e);
                      setSelectedContent(null);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark'
                        ? 'bg-[#2a2a2a] text-gray-400 hover:text-red-400'
                        : 'bg-gray-100 text-gray-600 hover:text-red-500'
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGalleryPage;
