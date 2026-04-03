'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  Share2,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  Sparkles,
  X,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// ============ INTERFACES ============
interface SocialMediaSchedulerToolProps {
  uiConfig?: UIConfig;
}

interface ScheduledPost {
  id: string;
  content: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin';
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed' | 'draft';
  hashtags: string[];
  mediaUrl?: string;
  createdAt: string;
  postedAt?: string;
}

// ============ CONSTANTS ============
const platforms = [
  { label: 'Twitter/X', value: 'twitter', maxLength: 280 },
  { label: 'Instagram', value: 'instagram', maxLength: 2200 },
  { label: 'Facebook', value: 'facebook', maxLength: 63206 },
  { label: 'LinkedIn', value: 'linkedin', maxLength: 3000 },
] as const;

const COLUMNS: ColumnConfig[] = [
  { key: 'content', header: 'Content', type: 'string' },
  { key: 'platform', header: 'Platform', type: 'string' },
  { key: 'scheduledDate', header: 'Date', type: 'date' },
  { key: 'scheduledTime', header: 'Time', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'hashtags', header: 'Hashtags', type: 'string' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().substring(0, 5);

// ============ MAIN COMPONENT ============
export const SocialMediaSchedulerTool: React.FC<SocialMediaSchedulerToolProps> = ({
  uiConfig,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Use the useToolData hook for backend persistence
  const {
    data: scheduledPosts,
    addItem: addPost,
    updateItem: updatePost,
    deleteItem: deletePost,
    exportCSV: exportPostsCSV,
    exportExcel: exportPostsExcel,
    exportJSON: exportPostsJSON,
    exportPDF: exportPostsPDF,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<ScheduledPost>('social-media-scheduler', [], COLUMNS);

  // ============ LOCAL STATE ============
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<ScheduledPost, 'id' | 'createdAt'>>({
    content: '',
    platform: 'twitter',
    scheduledDate: getCurrentDate(),
    scheduledTime: getCurrentTime(),
    status: 'draft',
    hashtags: [],
  });

  const [newHashtag, setNewHashtag] = useState('');

  // ============ EFFECTS ============
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.content) {
        setFormData((prev) => ({ ...prev, content: params.content }));
        hasPrefill = true;
      }
      if (params.platform) {
        const validPlatform = platforms.find((p) => p.value === params.platform);
        if (validPlatform) {
          setFormData((prev) => ({ ...prev, platform: validPlatform.value }));
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  // ============ HANDLERS ============
  const handleAddPost = () => {
    if (!formData.content.trim()) {
      setValidationMessage('Please enter post content');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (editingPost) {
      updatePost(editingPost.id, {
        ...formData,
        postedAt: editingPost.postedAt,
      });
      setEditingPost(null);
    } else {
      addPost({
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    // Reset form
    setFormData({
      content: '',
      platform: 'twitter',
      scheduledDate: getCurrentDate(),
      scheduledTime: getCurrentTime(),
      status: 'draft',
      hashtags: [],
    });
    setNewHashtag('');
    setShowForm(false);
  };

  const handleAddHashtag = () => {
    if (newHashtag.trim() && !formData.hashtags.includes(newHashtag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag],
      }));
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index),
    }));
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      platform: post.platform,
      scheduledDate: post.scheduledDate,
      scheduledTime: post.scheduledTime,
      status: post.status,
      hashtags: post.hashtags,
      mediaUrl: post.mediaUrl,
    });
    setShowForm(true);
  };

  const handleDeletePost = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to delete this scheduled post?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    deletePost(id);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setFormData({
      content: '',
      platform: 'twitter',
      scheduledDate: getCurrentDate(),
      scheduledTime: getCurrentTime(),
      status: 'draft',
      hashtags: [],
    });
    setNewHashtag('');
    setShowForm(false);
  };

  const getPlatformLabel = (value: string) => {
    return platforms.find((p) => p.value === value)?.label || value;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredPosts = scheduledPosts.sort((a, b) => {
    const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  const platformMaxLength = platforms.find((p) => p.value === formData.platform)
    ?.maxLength || 280;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Calendar className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('tools.socialMediaScheduler.socialMediaScheduler', 'Social Media Scheduler')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.socialMediaScheduler.scheduleAndManageSocialMedia', 'Schedule and manage social media posts')}
              </p>
              {isPrefilled && (
                <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('tools.socialMediaScheduler.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="social-media-scheduler" toolName="Social Media Scheduler" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-lg transition-all shadow-lg shadow-[#0D9488]/20"
          >
            <Plus className="w-4 h-4" />
            {t('tools.socialMediaScheduler.newPost', 'New Post')}
          </button>

          {filteredPosts.length > 0 && (
            <ExportDropdown
              data={filteredPosts}
              columns={COLUMNS}
              onExportCSV={() => exportPostsCSV()}
              onExportExcel={() => exportPostsExcel()}
              onExportJSON={() => exportPostsJSON()}
              onExportPDF={() => exportPostsPDF()}
              filename="social-media-schedule"
            />
          )}

          {editingPost && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
              {t('tools.socialMediaScheduler.cancel', 'Cancel')}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {editingPost ? t('tools.socialMediaScheduler.editPost', 'Edit Post') : t('tools.socialMediaScheduler.createNewPost', 'Create New Post')}
            </h4>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.socialMediaScheduler.platform2', 'Platform')}
              </label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    platform: e.target.value as typeof formData.platform,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} (max {p.maxLength} chars)
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.socialMediaScheduler.postContent', 'Post Content')}
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.content.length} / {platformMaxLength}
                </span>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder={t('tools.socialMediaScheduler.writeYourPostContentHere', 'Write your post content here...')}
                rows={4}
                maxLength={platformMaxLength}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 ${
                  formData.content.length > platformMaxLength * 0.9
                    ? 'border-yellow-300 dark:border-yellow-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.socialMediaScheduler.date', 'Date')}
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.socialMediaScheduler.time', 'Time')}
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledTime: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.socialMediaScheduler.hashtags', 'Hashtags')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                  placeholder={t('tools.socialMediaScheduler.addHashtagWithout', 'Add hashtag (without #)')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleAddHashtag}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                >
                  {t('tools.socialMediaScheduler.add', 'Add')}
                </button>
              </div>
              {formData.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.hashtags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-[#0D9488]/10 text-[#0D9488] rounded-lg text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveHashtag(index)}
                        className="text-[#0D9488] hover:text-[#0D9488]/70"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tools.socialMediaScheduler.status2', 'Status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as typeof formData.status,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="draft">{t('tools.socialMediaScheduler.draft', 'Draft')}</option>
                <option value="scheduled">{t('tools.socialMediaScheduler.scheduled', 'Scheduled')}</option>
                <option value="posted">{t('tools.socialMediaScheduler.posted', 'Posted')}</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAddPost}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tools.socialMediaScheduler.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingPost ? t('tools.socialMediaScheduler.updatePost', 'Update Post') : t('tools.socialMediaScheduler.savePost', 'Save Post')}
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
              >
                {t('tools.socialMediaScheduler.cancel2', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Scheduled Posts ({filteredPosts.length})
            </h4>
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                        {post.content}
                      </p>
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-[#0D9488]/10 text-[#0D9488] rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('tools.socialMediaScheduler.platform', 'Platform')}</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getPlatformLabel(post.platform)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('tools.socialMediaScheduler.scheduled2', 'Scheduled')}</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {post.scheduledDate} {post.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{t('tools.socialMediaScheduler.status', 'Status')}</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {getStatusIcon(post.status)}
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => handleCopy(post.content)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            {t('tools.socialMediaScheduler.copied', 'Copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {t('tools.socialMediaScheduler.copy', 'Copy')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-400 rounded transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('tools.socialMediaScheduler.edit', 'Edit')}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-400 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {showForm
                ? t('tools.socialMediaScheduler.noPostsScheduledYet', 'No posts scheduled yet') : t('tools.socialMediaScheduler.noPostsScheduledYetClick', 'No posts scheduled yet. Click "New Post" to create one.')}
            </p>
          </div>
        )}
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default SocialMediaSchedulerTool;
