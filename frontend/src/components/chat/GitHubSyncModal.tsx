import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import {
  githubService,
  GitHubConnection,
  GitHubRepo,
  AppGitHubLink,
  GitHubSyncStatus,
} from '../../services/githubService';
import {
  X,
  Github,
  Loader2,
  Check,
  ExternalLink,
  GitBranch,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  RefreshCw,
  AlertCircle,
  Link2,
  Unlink,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface GitHubSyncModalProps {
  appId: string;
  appName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  appId,
  appName,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  // Connection state
  const [connection, setConnection] = useState<GitHubConnection | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);

  // Repository state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  // Sync state
  const [appLink, setAppLink] = useState<AppGitHubLink | null>(null);
  const [syncStatus, setSyncStatus] = useState<GitHubSyncStatus | null>(null);

  // Action state
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  // Form state
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState(appName.toLowerCase().replace(/\s+/g, '-'));
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get('github');
    const githubAppId = params.get('github_app_id');

    if (githubStatus === 'connected') {
      toast.success(t('githubSync.connectedSuccess'));

      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Clean up localStorage
      localStorage.removeItem('github_connecting_app');
    } else if (githubStatus === 'error') {
      const message = params.get('message') || 'Failed to connect GitHub';
      toast.error(message);

      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Load connection status
  useEffect(() => {
    if (isOpen) {
      loadConnection();
    }
  }, [isOpen]);

  const loadConnection = async () => {
    setConnectionLoading(true);
    try {
      const conn = await githubService.getConnection();
      setConnection(conn);

      if (conn) {
        // Load repos and sync status
        await Promise.all([loadRepos(), loadSyncStatus()]);
      }
    } catch (error) {
      console.error('Failed to load connection:', error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const loadRepos = async () => {
    setReposLoading(true);
    try {
      const reposList = await githubService.listRepositories();
      setRepos(reposList);
    } catch (error) {
      console.error('Failed to load repos:', error);
      toast.error(t('githubSync.failedToLoadRepos'));
    } finally {
      setReposLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const [link, status] = await Promise.all([
        githubService.getAppLink(appId),
        githubService.getSyncStatus(appId),
      ]);
      setAppLink(link);
      setSyncStatus(status);

      // Auto-select linked repo
      if (link && repos.length > 0) {
        const linkedRepo = repos.find(r => r.fullName === link.repoFullName);
        if (linkedRepo) {
          setSelectedRepo(linkedRepo);
        }
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      // Store app context before redirect so we can restore it after OAuth
      localStorage.setItem('github_connecting_app', JSON.stringify({ appId, appName }));

      // Include app context in returnUrl
      const baseUrl = window.location.origin + window.location.pathname;
      const returnUrl = `${baseUrl}?github_app_id=${appId}`;
      const { url } = await githubService.getInstallUrl(returnUrl);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get install URL:', error);
      toast.error(t('githubSync.failedToConnect'));
    }
  };

  const handleDisconnect = async () => {
    try {
      await githubService.disconnect();
      setConnection(null);
      setRepos([]);
      setAppLink(null);
      setSyncStatus(null);
      toast.success(t('githubSync.disconnected'));
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error(t('githubSync.failedToDisconnect'));
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) {
      toast.error(t('githubSync.enterRepoName'));
      return;
    }

    setIsCreatingRepo(true);
    try {
      const repo = await githubService.createRepository({
        name: newRepoName,
        description: `Generated by Wants Chat - ${appName}`,
        isPrivate: newRepoPrivate,
      });
      setRepos(prev => [repo, ...prev]);
      setSelectedRepo(repo);
      setShowCreateRepo(false);
      toast.success(t('githubSync.repoCreated', { name: repo.name }));
    } catch (error) {
      console.error('Failed to create repo:', error);
      toast.error(t('githubSync.failedToCreateRepo'));
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRepo) {
      toast.error(t('githubSync.selectRepo'));
      return;
    }

    setIsPushing(true);
    try {
      const link = await githubService.pushToGitHub({
        appId,
        repoOwner: selectedRepo.owner,
        repoName: selectedRepo.name,
        branch,
        commitMessage: commitMessage || `Update from Wants Chat - ${new Date().toLocaleString()}`,
      });
      setAppLink(link);
      toast.success(t('githubSync.codePushed', { repo: selectedRepo.fullName }));
      await loadSyncStatus();
    } catch (error: any) {
      console.error('Failed to push:', error);
      toast.error(error.message || 'Failed to push to GitHub');
    } finally {
      setIsPushing(false);
      setCommitMessage('');
    }
  };

  const handlePull = async () => {
    if (!appLink) {
      toast.error(t('githubSync.noLinkedRepo'));
      return;
    }

    setIsPulling(true);
    try {
      await githubService.pullFromGitHub({
        appId,
        repoOwner: appLink.repoOwner,
        repoName: appLink.repoName,
        branch: appLink.branch,
      });
      toast.success(t('githubSync.codePulled', { repo: appLink.repoFullName }));
      await loadSyncStatus();
    } catch (error: any) {
      console.error('Failed to pull:', error);
      toast.error(error.message || 'Failed to pull from GitHub');
    } finally {
      setIsPulling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl shadow-2xl border",
          isDark
            ? 'bg-[#1a1a1a] border-[#2a2a2a]'
            : 'bg-white border-slate-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            isDark ? 'border-[#2a2a2a]' : 'border-slate-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? 'bg-[#2a2a2a]' : 'bg-slate-100'
            )}>
              <Github className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={cn(
                "font-semibold",
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {t('githubSync.title')}
              </h3>
              <p className={cn(
                "text-xs",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                {appName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {connectionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
            </div>
          ) : !connection ? (
            /* Not Connected State */
            <div className="text-center py-8">
              <div className={cn(
                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                isDark ? 'bg-[#2a2a2a]' : 'bg-slate-100'
              )}>
                <Github className="w-8 h-8 text-[#0D9488]" />
              </div>
              <h4 className={cn(
                "font-semibold mb-2",
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {t('githubSync.connectToGithub')}
              </h4>
              <p className={cn(
                "text-sm mb-6 max-w-sm mx-auto",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                {t('githubSync.connectDescription')}
              </p>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0B8276] text-white rounded-lg font-medium transition-colors"
              >
                <Github className="w-5 h-5" />
                {t('githubSync.connectGithub')}
              </button>
            </div>
          ) : (
            /* Connected State */
            <>
              {/* Connection Status */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg",
                isDark ? 'bg-[#0a0a0a]' : 'bg-slate-50'
              )}>
                <div className="flex items-center gap-3">
                  {connection.githubAvatar ? (
                    <img
                      src={connection.githubAvatar}
                      alt={connection.githubLogin}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isDark ? 'bg-[#2a2a2a]' : 'bg-slate-200'
                    )}>
                      <Github className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className={cn(
                      "font-medium",
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {connection.githubName || connection.githubLogin}
                    </p>
                    <p className={cn(
                      "text-xs",
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      @{connection.githubLogin}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    isDark
                      ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-red-400'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-red-500'
                  )}
                >
                  <Unlink className="w-4 h-4" />
                  {t('githubSync.disconnect')}
                </button>
              </div>

              {/* Linked Repository Status */}
              {appLink && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  isDark
                    ? 'bg-[#0D9488]/10 border-[#0D9488]/30'
                    : 'bg-teal-50 border-teal-200'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-[#0D9488]" />
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {t('githubSync.linkedTo', { repo: appLink.repoFullName })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                        {appLink.branch}
                      </span>
                    </div>
                    {appLink.lastPushedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {t('githubSync.lastPushed', { date: new Date(appLink.lastPushedAt).toLocaleDateString() })}
                        </span>
                      </div>
                    )}
                    {appLink.lastCommitSha && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {appLink.lastCommitSha.substring(0, 7)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Repository Selection */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('githubSync.repository')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedRepo?.id || ''}
                    onChange={(e) => {
                      const repo = repos.find(r => r.id === Number(e.target.value));
                      setSelectedRepo(repo || null);
                    }}
                    disabled={reposLoading}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border text-sm",
                      isDark
                        ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white'
                        : 'bg-white border-slate-200 text-slate-900',
                      "focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50"
                    )}
                  >
                    <option value="">{t('githubSync.selectRepository')}</option>
                    {repos.map(repo => (
                      <option key={repo.id} value={repo.id}>
                        {repo.fullName} {repo.isPrivate ? t('githubSync.private') : t('githubSync.public')}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateRepo(!showCreateRepo)}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      showCreateRepo
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : isDark
                          ? 'border-[#2a2a2a] hover:bg-[#2a2a2a] text-slate-400'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                    )}
                    title={t('githubSync.createNewRepo')}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={loadRepos}
                    disabled={reposLoading}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      isDark
                        ? 'border-[#2a2a2a] hover:bg-[#2a2a2a] text-slate-400'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                    )}
                    title={t('githubSync.refreshRepos')}
                  >
                    <RefreshCw className={cn("w-5 h-5", reposLoading && "animate-spin")} />
                  </button>
                </div>

                {/* Create New Repo Form */}
                {showCreateRepo && (
                  <div className={cn(
                    "mt-3 p-4 rounded-lg border",
                    isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200'
                  )}>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder={t('githubSync.repoName')}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg border text-sm",
                          isDark
                            ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                          "focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50"
                        )}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRepoPrivate}
                          onChange={(e) => setNewRepoPrivate(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span className={cn(
                          "text-sm",
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        )}>
                          {t('githubSync.privateRepository')}
                        </span>
                      </label>
                      <button
                        onClick={handleCreateRepo}
                        disabled={isCreatingRepo || !newRepoName.trim()}
                        className={cn(
                          "w-full py-2 rounded-lg text-sm font-medium transition-colors",
                          "bg-[#0D9488] hover:bg-[#0B8276] text-white",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isCreatingRepo ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('githubSync.creating')}
                          </span>
                        ) : (
                          t('githubSync.createRepository')
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Branch & Commit Message */}
              {selectedRepo && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={cn(
                        "block text-sm font-medium mb-2",
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      )}>
                        {t('githubSync.branch')}
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className={cn(
                          "w-full px-3 py-2 rounded-lg border text-sm",
                          isDark
                            ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                          "focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50"
                        )}
                      />
                    </div>
                    <div>
                      <label className={cn(
                        "block text-sm font-medium mb-2",
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      )}>
                        {t('githubSync.commitMessage')}
                      </label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder={t('githubSync.commitPlaceholder')}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg border text-sm",
                          isDark
                            ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                          "focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50"
                        )}
                      />
                    </div>
                  </div>

                  {/* Push/Pull Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handlePush}
                      disabled={isPushing || isPulling}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                        "bg-[#0D9488] hover:bg-[#0B8276] text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isPushing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('githubSync.pushing')}
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="w-5 h-5" />
                          {t('githubSync.pushToGithub')}
                        </>
                      )}
                    </button>

                    {appLink && (
                      <button
                        onClick={handlePull}
                        disabled={isPushing || isPulling}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors border",
                          isDark
                            ? 'border-[#2a2a2a] hover:bg-[#2a2a2a] text-white'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-900',
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isPulling ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('githubSync.pulling')}
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle className="w-5 h-5" />
                            {t('githubSync.pullFromGithub')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Info note */}
              <div className={cn(
                "flex items-start gap-2 p-3 rounded-lg text-xs",
                isDark ? 'bg-[#0a0a0a] text-slate-400' : 'bg-slate-50 text-slate-500'
              )}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  {t('githubSync.webhookInfo')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubSyncModal;
