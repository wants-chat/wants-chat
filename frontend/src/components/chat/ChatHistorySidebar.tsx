import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import {
  MessageSquare,
  Search,
  Trash2,
  Pin,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  isArchived: boolean;
  isPinned: boolean;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation?: (conversationId: string) => void;
  onNewChat: () => void;
  currentConversationId?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onNewChat,
  currentConversationId,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Load conversations when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/chat/conversations?limit=100');
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs.map((c: any) => ({
        ...c,
        isPinned: c.isPinned ?? false,
        isArchived: c.isArchived ?? false,
      })));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error(t('chatHistory.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation?.(id);
    onClose();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await api.delete(`/chat/conversations/${conversationToDelete}`);
      setConversations(prev => prev.filter(c => c.id !== conversationToDelete));
      toast.success(t('chatHistory.conversationDeleted'));
    } catch (error) {
      toast.error(t('chatHistory.failedToDelete'));
    } finally {
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handlePinConversation = async (id: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/chat/conversations/${id}`, { is_pinned: !isPinned });
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, isPinned: !isPinned } : c)
      );
      toast.success(isPinned ? t('chatHistory.unpinned') : t('chatHistory.pinned'));
    } catch (error) {
      toast.error(t('chatHistory.failedToUpdate'));
    }
  };

  // Filter by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    if (!conv.title) return false;
    return conv.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort: pinned first, then by date
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
    const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const pinnedConvs = sortedConversations.filter(c => c.isPinned);
  const regularConvs = sortedConversations.filter(c => !c.isPinned);

  const getDisplayTitle = (conv: Conversation) => conv.title;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('chatHistory.justNow');
    if (diffMins < 60) return t('chatHistory.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('chatHistory.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('chatHistory.yesterday');
    if (diffDays < 7) return t('chatHistory.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <div className={cn(
        'relative w-80 h-full flex flex-col shadow-xl',
        theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {t('chatHistory.title')}
          </h2>
          <button onClick={onClose} className={cn(
            'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white font-medium hover:from-[#14B8A6] hover:to-[#0D9488] transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('chatHistory.newChat')}
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-100')}>
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('chatHistory.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'flex-1 bg-transparent text-sm outline-none',
                theme === 'dark' ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'
              )}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sortedConversations.length === 0 ? (
            <div className={cn('text-center py-8 text-sm', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>
              {t('chatHistory.noConversations')}
            </div>
          ) : (
            <>
              {pinnedConvs.length > 0 && (
                <div className="mb-2">
                  <div className={cn('px-2 py-1 text-xs font-medium uppercase', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>
                    {t('chatHistory.pinned')}
                  </div>
                  {pinnedConvs.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === currentConversationId}
                      theme={theme}
                      onSelect={handleSelectConversation}
                      onDelete={handleDeleteConversation}
                      onPin={handlePinConversation}
                      getDisplayTitle={getDisplayTitle}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {regularConvs.length > 0 && (
                <div>
                  <div className={cn('px-2 py-1 text-xs font-medium uppercase', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>
                    {t('chatHistory.recent')}
                  </div>
                  {regularConvs.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === currentConversationId}
                      theme={theme}
                      onSelect={handleSelectConversation}
                      onDelete={handleDeleteConversation}
                      onPin={handlePinConversation}
                      getDisplayTitle={getDisplayTitle}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className={cn(
            'w-72 rounded-xl p-5 shadow-lg',
            theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'
          )}>
            <h3 className={cn(
              'text-base font-semibold mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {t('chatHistory.deleteConversation')}
            </h3>
            <p className={cn(
              'text-sm mb-5',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {t('chatHistory.deleteConfirmation')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  theme === 'dark'
                    ? 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {t('chatHistory.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('chatHistory.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ConversationItem({
  conv, isActive, theme, onSelect, onDelete, onPin, getDisplayTitle, formatDate,
}: {
  conv: Conversation;
  isActive: boolean;
  theme: string;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  getDisplayTitle: (conv: Conversation) => string | null;
  formatDate: (date: string | null) => string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(conv.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors',
        isActive
          ? theme === 'dark' ? 'bg-[#0D9488]/20 text-[#14B8A6]' : 'bg-[#0D9488]/10 text-[#0D9488]'
          : theme === 'dark' ? 'hover:bg-[#2a2a2a] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
      )}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{getDisplayTitle(conv)}</div>
        <div className={cn('text-xs', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>
          {formatDate(conv.lastMessageAt || conv.createdAt)}
        </div>
      </div>

      {isHovered && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => onPin(conv.id, conv.isPinned, e)}
            className={cn('p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600', conv.isPinned ? 'text-[#0D9488]' : 'text-gray-400')}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => onDelete(conv.id, e)}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatHistorySidebar;
