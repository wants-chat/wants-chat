import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { App } from '../../services/appCatalogService';
import { appFilesService, FileTreeItem, FileContent } from '../../services/appFilesService';
import { chatService } from '../../services/chatService';
import { FileTree } from './FileTree';
import { CodeViewer } from './CodeViewer';
import {
  X,
  ExternalLink,
  Play,
  Code,
  Server,
  Loader2,
  Briefcase,
  Zap,
  Code2,
  Heart,
  BookOpen,
  Star,
  Wrench,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  FileJson,
  PanelLeftClose,
  PanelLeft,
  Smartphone,
  Github,
} from 'lucide-react';
import { GitHubSyncModal } from './GitHubSyncModal';
import { toast } from 'sonner';

type TabType = 'preview' | 'api-docs' | 'frontend-code' | 'backend-code' | 'mobile-code';

interface AppPreviewPanelProps {
  app: App;
  onClose: () => void;
  className?: string;
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  'business-finance': Briefcase,
  'productivity': Zap,
  'developer-tools': Code2,
  'healthcare': Heart,
  'education': BookOpen,
  'lifestyle': Star,
  'utilities': Wrench,
  'security': Lock,
};

// Building steps for the loading animation (keys for translation)
const buildingStepKeys = [
  { key: 'analyzingStructure', duration: 800 },
  { key: 'loadingTechStacks', duration: 600 },
  { key: 'fetchingFeatures', duration: 700 },
  { key: 'preparingCode', duration: 900 },
  { key: 'buildingPreview', duration: 1000 },
  { key: 'almostReady', duration: 500 },
];

export const AppPreviewPanel: React.FC<AppPreviewPanelProps> = ({
  app,
  onClose,
  className,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [apiDocsLoading, setApiDocsLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [apiDocsKey, setApiDocsKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [buildStepKey, setBuildStepKey] = useState(buildingStepKeys[0].key);
  const [isBuilding, setIsBuilding] = useState(true);

  // Code viewing state
  const [frontendTree, setFrontendTree] = useState<FileTreeItem[]>([]);
  const [backendTree, setBackendTree] = useState<FileTreeItem[]>([]);
  const [mobileTree, setMobileTree] = useState<FileTreeItem[]>([]);
  const [frontendTreeLoading, setFrontendTreeLoading] = useState(false);
  const [backendTreeLoading, setBackendTreeLoading] = useState(false);
  const [mobileTreeLoading, setMobileTreeLoading] = useState(false);
  const [selectedFrontendFile, setSelectedFrontendFile] = useState<string | null>(null);
  const [selectedBackendFile, setSelectedBackendFile] = useState<string | null>(null);
  const [selectedMobileFile, setSelectedMobileFile] = useState<string | null>(null);
  const [frontendFileContent, setFrontendFileContent] = useState<FileContent | null>(null);
  const [backendFileContent, setBackendFileContent] = useState<FileContent | null>(null);
  const [mobileFileContent, setMobileFileContent] = useState<FileContent | null>(null);
  const [frontendContentLoading, setFrontendContentLoading] = useState(false);
  const [backendContentLoading, setBackendContentLoading] = useState(false);
  const [mobileContentLoading, setMobileContentLoading] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);

  // Code editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('');
  const [editingType, setEditingType] = useState<'frontend' | 'backend' | 'mobile' | null>(null);

  // GitHub sync state
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const CategoryIcon = categoryIcons[app.category] || Wrench;

  // Handle AI code modification
  const handleEditWithAI = useCallback((
    type: 'frontend' | 'backend' | 'mobile',
    filePath: string,
    instruction: string
  ) => {
    const socket = chatService.getSocket();
    if (!socket) {
      toast.error(t('appPreview.notConnected'));
      return;
    }

    setIsEditing(true);
    setEditingType(type);
    setEditProgress(t('appPreview.loadingFile'));

    // Send modification request
    socket.emit('code:modify', {
      appId: app.id,
      type,
      filePath,
      instruction,
    });

    // Listen for progress updates
    const handleProgress = (data: { status: string; message: string }) => {
      setEditProgress(data.message);
    };

    // Listen for completion
    const handleModified = (data: { appId: string; type: string; filePath: string; content: string; language: string }) => {
      if (data.appId === app.id && data.type === type) {
        // Update the file content
        if (type === 'frontend') {
          setFrontendFileContent({ content: data.content, path: data.filePath, language: data.language });
        } else if (type === 'backend') {
          setBackendFileContent({ content: data.content, path: data.filePath, language: data.language });
        } else if (type === 'mobile') {
          setMobileFileContent({ content: data.content, path: data.filePath, language: data.language });
        }
        toast.success(t('appPreview.codeModified'));
        setIsEditing(false);
        setEditProgress('');
        setEditingType(null);

        // Cleanup listeners
        socket.off('code:progress', handleProgress);
        socket.off('code:modified', handleModified);
        socket.off('code:error', handleError);
      }
    };

    // Listen for errors
    const handleError = (data: { message: string }) => {
      toast.error(t('appPreview.editFailed', { message: data.message }));
      setIsEditing(false);
      setEditProgress('');
      setEditingType(null);

      // Cleanup listeners
      socket.off('code:progress', handleProgress);
      socket.off('code:modified', handleModified);
      socket.off('code:error', handleError);
    };

    socket.on('code:progress', handleProgress);
    socket.on('code:modified', handleModified);
    socket.on('code:error', handleError);
  }, [app.id]);

  // Building animation effect
  useEffect(() => {
    if (!isBuilding) return;

    let currentStep = 0;

    const runStep = () => {
      if (currentStep >= buildingStepKeys.length) {
        setIsBuilding(false);
        return;
      }

      setBuildStep(currentStep);
      setBuildStepKey(buildingStepKeys[currentStep].key);

      setTimeout(() => {
        currentStep++;
        runStep();
      }, buildingStepKeys[currentStep].duration);
    };

    runStep();
  }, []);

  // Load file trees when switching to code tabs
  useEffect(() => {
    if (activeTab === 'frontend-code' && (!frontendTree || frontendTree.length === 0) && !frontendTreeLoading) {
      loadFrontendTree();
    }
    if (activeTab === 'backend-code' && (!backendTree || backendTree.length === 0) && !backendTreeLoading && app.hasBackend) {
      loadBackendTree();
    }
    if (activeTab === 'mobile-code' && (!mobileTree || mobileTree.length === 0) && !mobileTreeLoading && app.hasMobile) {
      loadMobileTree();
    }
  }, [activeTab]);

  const loadFrontendTree = async () => {
    setFrontendTreeLoading(true);
    try {
      const tree = await appFilesService.getFileTree(app.id, 'frontend');
      setFrontendTree(tree);
    } catch (error) {
      console.error('Failed to load frontend file tree:', error);
      toast.error(t('appPreview.failedToLoadFrontend'));
    } finally {
      setFrontendTreeLoading(false);
    }
  };

  const loadBackendTree = async () => {
    setBackendTreeLoading(true);
    try {
      const tree = await appFilesService.getFileTree(app.id, 'backend');
      setBackendTree(tree);
    } catch (error) {
      console.error('Failed to load backend file tree:', error);
      toast.error(t('appPreview.failedToLoadBackend'));
    } finally {
      setBackendTreeLoading(false);
    }
  };

  const loadMobileTree = async () => {
    setMobileTreeLoading(true);
    try {
      const tree = await appFilesService.getFileTree(app.id, 'mobile');
      setMobileTree(tree);
    } catch (error) {
      console.error('Failed to load mobile file tree:', error);
      toast.error(t('appPreview.failedToLoadMobile'));
    } finally {
      setMobileTreeLoading(false);
    }
  };

  const handleSelectFrontendFile = async (filePath: string) => {
    setSelectedFrontendFile(filePath);
    setFrontendContentLoading(true);
    try {
      const content = await appFilesService.getFileContent(app.id, 'frontend', filePath);
      setFrontendFileContent(content);
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error(t('appPreview.failedToLoadFile'));
    } finally {
      setFrontendContentLoading(false);
    }
  };

  const handleSelectBackendFile = async (filePath: string) => {
    setSelectedBackendFile(filePath);
    setBackendContentLoading(true);
    try {
      const content = await appFilesService.getFileContent(app.id, 'backend', filePath);
      setBackendFileContent(content);
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error(t('appPreview.failedToLoadFile'));
    } finally {
      setBackendContentLoading(false);
    }
  };

  const handleSelectMobileFile = async (filePath: string) => {
    setSelectedMobileFile(filePath);
    setMobileContentLoading(true);
    try {
      const content = await appFilesService.getFileContent(app.id, 'mobile', filePath);
      setMobileFileContent(content);
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error(t('appPreview.failedToLoadFile'));
    } finally {
      setMobileContentLoading(false);
    }
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
    console.log('[AppPreviewPanel] Preview iframe loaded:', app.frontendUrl);
  };

  const handlePreviewError = () => {
    setPreviewLoading(false);
    console.error('[AppPreviewPanel] Preview iframe failed to load:', app.frontendUrl);
  };

  // Debug: Log the app data when panel opens
  useEffect(() => {
    console.log('[AppPreviewPanel] App data:', {
      name: app.name,
      frontendUrl: app.frontendUrl,
      backendUrl: app.backendUrl,
      status: app.status,
    });
  }, [app]);

  const handleApiDocsLoad = () => {
    setApiDocsLoading(false);
  };

  const handleRefresh = () => {
    if (activeTab === 'preview') {
      setPreviewLoading(true);
      setPreviewKey(prev => prev + 1);
    } else if (activeTab === 'api-docs') {
      setApiDocsLoading(true);
      setApiDocsKey(prev => prev + 1);
    } else if (activeTab === 'frontend-code') {
      setFrontendTree([]);
      loadFrontendTree();
      if (selectedFrontendFile) {
        handleSelectFrontendFile(selectedFrontendFile);
      }
    } else if (activeTab === 'backend-code') {
      setBackendTree([]);
      loadBackendTree();
      if (selectedBackendFile) {
        handleSelectBackendFile(selectedBackendFile);
      }
    } else if (activeTab === 'mobile-code') {
      setMobileTree([]);
      loadMobileTree();
      if (selectedMobileFile) {
        handleSelectMobileFile(selectedMobileFile);
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (activeTab === 'api-docs' && app.apiDocsUrl) {
      window.open(app.apiDocsUrl, '_blank');
    } else {
      window.open(app.frontendUrl, '_blank');
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('appPreview.urlCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('appPreview.failedToCopyUrl'));
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType; disabled?: boolean }> = [
    { id: 'preview', label: t('appPreview.preview'), icon: Play },
    { id: 'api-docs', label: t('appPreview.apiDocs'), icon: FileJson, disabled: !app.apiDocsUrl },
    { id: 'frontend-code', label: t('appPreview.frontend'), icon: Code },
    { id: 'backend-code', label: t('appPreview.backend'), icon: Server, disabled: !app.hasBackend },
    { id: 'mobile-code', label: t('appPreview.mobile'), icon: Smartphone, disabled: !app.hasMobile },
  ];

  // Show building animation
  if (isBuilding) {
    return (
      <div
        className={cn(
          "h-full flex flex-col overflow-hidden border-l",
          isDark
            ? 'bg-[#1a1a1a] border-[#2a2a2a]'
            : 'bg-white border-slate-200',
          className
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Animated App Icon */}
          <div className="relative mb-8">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              isDark ? 'bg-[#2a2a2a]' : 'bg-slate-100'
            )}>
              <CategoryIcon className="w-10 h-10 text-[#0D9488]" />
            </div>
            {/* Spinning ring */}
            <div className="absolute -inset-2">
              <div className="w-full h-full rounded-2xl border-2 border-[#0D9488]/30 border-t-[#0D9488] animate-spin" />
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-[#0D9488] animate-pulse" />
          </div>

          {/* App name */}
          <h3 className={cn(
            "text-xl font-bold mb-2",
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            {app.name}
          </h3>

          {/* Progress bar */}
          <div className="w-64 mb-4">
            <div className={cn(
              "h-1.5 rounded-full overflow-hidden",
              isDark ? 'bg-[#2a2a2a]' : 'bg-slate-200'
            )}>
              <div
                className="h-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] transition-all duration-500 ease-out"
                style={{ width: `${((buildStep + 1) / buildingStepKeys.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Building step text */}
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0D9488]" />
            <p className={cn(
              "text-sm",
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              {t(`appPreview.${buildStepKey}`)}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 mt-6">
            {buildingStepKeys.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index <= buildStep
                    ? 'bg-[#0D9488]'
                    : isDark ? 'bg-[#2a2a2a]' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden border-l",
        isDark
          ? 'bg-[#1a1a1a] border-[#2a2a2a]'
          : 'bg-white border-slate-200',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b shrink-0",
          isDark ? 'border-[#2a2a2a]' : 'border-slate-200'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isDark ? 'bg-[#2a2a2a]' : 'bg-slate-100'
            )}
          >
            <CategoryIcon className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="min-w-0">
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {app.name}
            </h3>
            <p
              className={cn(
                "text-xs truncate",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {app.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowGitHubModal(true)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
            title={t('appPreview.githubSync')}
          >
            <Github className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
            title={t('appPreview.openInNewTab')}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
            title={t('appPreview.closePanel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={cn(
          "flex items-center gap-1 px-4 py-2 border-b shrink-0 overflow-x-auto",
          isDark ? 'border-[#2a2a2a]' : 'border-slate-200'
        )}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? 'bg-[#0D9488]/10 text-[#0D9488]'
                  : tab.disabled
                    ? isDark
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 cursor-not-allowed'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-[#2a2a2a]'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}

        {/* Toggle file tree button for code tabs */}
        {(activeTab === 'frontend-code' || activeTab === 'backend-code' || activeTab === 'mobile-code') && (
          <button
            onClick={() => setShowFileTree(!showFileTree)}
            className={cn(
              "ml-auto p-1.5 rounded-lg transition-colors shrink-0",
              isDark
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
            title={showFileTree ? t('appPreview.hideFileTree') : t('appPreview.showFileTree')}
          >
            {showFileTree ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            (activeTab === 'frontend-code' || activeTab === 'backend-code' || activeTab === 'mobile-code') ? '' : 'ml-auto',
            isDark
              ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
          )}
          title={t('appPreview.refresh')}
        >
          <RefreshCw className={cn(
            "w-4 h-4",
            ((activeTab === 'preview' && previewLoading) ||
             (activeTab === 'api-docs' && apiDocsLoading) ||
             (activeTab === 'frontend-code' && frontendTreeLoading) ||
             (activeTab === 'backend-code' && backendTreeLoading) ||
             (activeTab === 'mobile-code' && mobileTreeLoading)) && "animate-spin"
          )} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Preview Tab - Frontend iframe */}
        {activeTab === 'preview' && (
          <div className="absolute inset-0">
            {previewLoading && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center z-10",
                  isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
                  <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {t('appPreview.loadingPreview')}
                  </p>
                </div>
              </div>
            )}
            {app.frontendUrl ? (
              <iframe
                key={previewKey}
                src={app.frontendUrl}
                className="absolute inset-0 w-full h-full border-0"
                title={`${app.name} Preview`}
                onLoad={handlePreviewLoad}
                onError={handlePreviewError}
              />
            ) : (
              <div className={cn(
                "h-full flex flex-col items-center justify-center",
                isDark ? 'bg-[#1a1a1a] text-slate-400' : 'bg-white text-slate-500'
              )}>
                <Code className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">{t('appPreview.noPreviewUrl')}</p>
                <p className="text-xs mt-1 opacity-70">{t('appPreview.appMayBeDeploying')}</p>
              </div>
            )}
          </div>
        )}

        {/* API Docs Tab - Backend API docs iframe */}
        {activeTab === 'api-docs' && app.apiDocsUrl && (
          <div className="h-full relative">
            {apiDocsLoading && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center z-10",
                  isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
                  <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {t('appPreview.loadingApiDocs')}
                  </p>
                </div>
              </div>
            )}
            <iframe
              key={apiDocsKey}
              src={app.apiDocsUrl}
              className="w-full h-full border-0"
              title={`${app.name} API Documentation`}
              onLoad={handleApiDocsLoad}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}

        {/* Frontend Code Tab */}
        {activeTab === 'frontend-code' && (
          <div className="h-full flex">
            {/* File Tree Sidebar */}
            {showFileTree && (
              <div
                className={cn(
                  "w-64 shrink-0 border-r overflow-hidden flex flex-col",
                  isDark ? 'border-[#2a2a2a] bg-[#0a0a0a]' : 'border-slate-200 bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 border-b text-xs font-medium uppercase tracking-wide",
                    isDark ? 'border-[#2a2a2a] text-slate-500' : 'border-slate-200 text-slate-400'
                  )}
                >
                  {t('appPreview.frontendSrc')}
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FileTree
                    items={frontendTree}
                    selectedFile={selectedFrontendFile}
                    onSelectFile={handleSelectFrontendFile}
                    isLoading={frontendTreeLoading}
                  />
                </div>
              </div>
            )}

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <CodeViewer
                content={frontendFileContent?.content || ''}
                language={frontendFileContent?.language || 'text'}
                filePath={frontendFileContent?.path || ''}
                isLoading={frontendContentLoading}
                appId={app.id}
                codeType="frontend"
                onEditWithAI={(filePath, instruction) => handleEditWithAI('frontend', filePath, instruction)}
                isEditing={isEditing && editingType === 'frontend'}
                editProgress={editingType === 'frontend' ? editProgress : undefined}
              />
            </div>
          </div>
        )}

        {/* Backend Code Tab */}
        {activeTab === 'backend-code' && app.hasBackend && (
          <div className="h-full flex">
            {/* File Tree Sidebar */}
            {showFileTree && (
              <div
                className={cn(
                  "w-64 shrink-0 border-r overflow-hidden flex flex-col",
                  isDark ? 'border-[#2a2a2a] bg-[#0a0a0a]' : 'border-slate-200 bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 border-b text-xs font-medium uppercase tracking-wide",
                    isDark ? 'border-[#2a2a2a] text-slate-500' : 'border-slate-200 text-slate-400'
                  )}
                >
                  {t('appPreview.backendSrc')}
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FileTree
                    items={backendTree}
                    selectedFile={selectedBackendFile}
                    onSelectFile={handleSelectBackendFile}
                    isLoading={backendTreeLoading}
                  />
                </div>
              </div>
            )}

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <CodeViewer
                content={backendFileContent?.content || ''}
                language={backendFileContent?.language || 'text'}
                filePath={backendFileContent?.path || ''}
                isLoading={backendContentLoading}
                appId={app.id}
                codeType="backend"
                onEditWithAI={(filePath, instruction) => handleEditWithAI('backend', filePath, instruction)}
                isEditing={isEditing && editingType === 'backend'}
                editProgress={editingType === 'backend' ? editProgress : undefined}
              />
            </div>
          </div>
        )}

        {/* Mobile Code Tab */}
        {activeTab === 'mobile-code' && app.hasMobile && (
          <div className="h-full flex">
            {/* File Tree Sidebar */}
            {showFileTree && (
              <div
                className={cn(
                  "w-64 shrink-0 border-r overflow-hidden flex flex-col",
                  isDark ? 'border-[#2a2a2a] bg-[#0a0a0a]' : 'border-slate-200 bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 border-b text-xs font-medium uppercase tracking-wide",
                    isDark ? 'border-[#2a2a2a] text-slate-500' : 'border-slate-200 text-slate-400'
                  )}
                >
                  {t('appPreview.mobileSrc')}
                </div>
                <div className="flex-1 overflow-y-auto">
                  <FileTree
                    items={mobileTree}
                    selectedFile={selectedMobileFile}
                    onSelectFile={handleSelectMobileFile}
                    isLoading={mobileTreeLoading}
                  />
                </div>
              </div>
            )}

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <CodeViewer
                content={mobileFileContent?.content || ''}
                language={mobileFileContent?.language || 'text'}
                filePath={mobileFileContent?.path || ''}
                isLoading={mobileContentLoading}
                appId={app.id}
                codeType="mobile"
                onEditWithAI={(filePath, instruction) => handleEditWithAI('mobile', filePath, instruction)}
                isEditing={isEditing && editingType === 'mobile'}
                editProgress={editingType === 'mobile' ? editProgress : undefined}
              />
            </div>
          </div>
        )}
      </div>

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        appId={app.id}
        appName={app.name}
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
      />
    </div>
  );
};

export default AppPreviewPanel;
