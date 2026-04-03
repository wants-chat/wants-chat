'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import useToolData from '../../hooks/useToolData';
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
import {
  MessageSquare,
  Phone,
  Mail,
  Video,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Bell,
  Users,
  FileText,
  Paperclip,
  Reply,
  Star,
  StarOff,
  Archive,
  Filter,
  Sparkles,
} from 'lucide-react';

interface ParentCommunicationToolProps {
  uiConfig?: UIConfig;
}

// Types
interface CommunicationMessage {
  id: string;
  parentId: string;
  parentName: string;
  childId: string;
  childName: string;
  type: 'email' | 'phone' | 'in-person' | 'app-message' | 'video-call' | 'note';
  direction: 'incoming' | 'outgoing';
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied';
  attachments: string[];
  isStarred: boolean;
  isArchived: boolean;
  requiresFollowUp: boolean;
  followUpDate?: string;
  followUpCompleted: boolean;
  tags: string[];
  sentBy: string;
  sentAt: string;
  readAt?: string;
  repliedAt?: string;
  parentResponse?: string;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'event' | 'policy' | 'reminder' | 'emergency';
  targetAudience: 'all' | 'classroom' | 'specific';
  classroomIds: string[];
  recipientIds: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishDate: string;
  expiryDate?: string;
  isPublished: boolean;
  readBy: string[];
  acknowledgedBy: string[];
  requiresAcknowledgment: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Column configurations for export
const messageColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'parentName', header: 'Parent', type: 'string' },
  { key: 'childName', header: 'Child', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'subject', header: 'Subject', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'sentAt', header: 'Sent At', type: 'date' },
];

const announcementColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'publishDate', header: 'Publish Date', type: 'date' },
  { key: 'isPublished', header: 'Published', type: 'boolean' },
];

// Constants
const MESSAGE_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'in-person', label: 'In-Person', icon: Users },
  { value: 'app-message', label: 'App Message', icon: MessageSquare },
  { value: 'video-call', label: 'Video Call', icon: Video },
  { value: 'note', label: 'Note', icon: FileText },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const ANNOUNCEMENT_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'policy', label: 'Policy Update' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'emergency', label: 'Emergency' },
];

const MESSAGE_TEMPLATES = [
  { id: 'pickup', title: 'Pickup Reminder', content: 'This is a friendly reminder about pickup time today...' },
  { id: 'supply', title: 'Supply Request', content: 'We noticed that your child is running low on the following supplies...' },
  { id: 'behavior', title: 'Behavior Update', content: 'We wanted to share some observations about your child\'s behavior today...' },
  { id: 'milestone', title: 'Milestone Achievement', content: 'We are excited to share that your child has reached a new milestone...' },
  { id: 'illness', title: 'Illness Notification', content: 'We are writing to inform you that your child is showing signs of...' },
  { id: 'payment', title: 'Payment Reminder', content: 'This is a reminder that tuition payment is due on...' },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type TabType = 'inbox' | 'sent' | 'announcements' | 'compose';

export const ParentCommunicationTool: React.FC<ParentCommunicationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CommunicationMessage | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: messages,
    addItem: addMessage,
    updateItem: updateMessage,
    deleteItem: deleteMessage,
    isSynced: messagesSynced,
    isSaving: messagesSaving,
    lastSaved: messagesLastSaved,
    syncError: messagesSyncError,
    forceSync: forceMessagesSync,
  } = useToolData<CommunicationMessage>('parent-communications', [], messageColumns);

  const {
    data: announcements,
    addItem: addAnnouncement,
    updateItem: updateAnnouncement,
    deleteItem: deleteAnnouncement,
  } = useToolData<Announcement>('daycare-announcements', [], announcementColumns);

  // Message form state
  const [messageForm, setMessageForm] = useState<Partial<CommunicationMessage>>({
    parentName: '',
    childName: '',
    type: 'email',
    direction: 'outgoing',
    subject: '',
    content: '',
    priority: 'normal',
    tags: [],
    requiresFollowUp: false,
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'normal',
    requiresAcknowledgment: false,
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as Record<string, any>;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.parentName) setMessageForm(prev => ({ ...prev, parentName: params.parentName }));
        if (params.childName) setMessageForm(prev => ({ ...prev, childName: params.childName }));
        if (params.subject) setMessageForm(prev => ({ ...prev, subject: params.subject }));
        if (params.content) setMessageForm(prev => ({ ...prev, content: params.content }));
        if (params.type) setMessageForm(prev => ({ ...prev, type: params.type }));
        if (params.priority) setMessageForm(prev => ({ ...prev, priority: params.priority }));
        if (params.requiresFollowUp !== undefined) setMessageForm(prev => ({ ...prev, requiresFollowUp: params.requiresFollowUp }));
        if (params.followUpDate) setMessageForm(prev => ({ ...prev, followUpDate: params.followUpDate }));
        if (params.activeTab) setActiveTab(params.activeTab);
        setShowComposeModal(true);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Normal prefill
        if (params.parentName) setMessageForm(prev => ({ ...prev, parentName: params.parentName }));
        if (params.childName) setMessageForm(prev => ({ ...prev, childName: params.childName }));
        if (params.subject) setMessageForm(prev => ({ ...prev, subject: params.subject }));
        setShowComposeModal(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isPrefilled]);

  // Apply template
  useEffect(() => {
    if (selectedTemplate) {
      const template = MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        setMessageForm(prev => ({
          ...prev,
          subject: template.title,
          content: template.content,
        }));
      }
    }
  }, [selectedTemplate]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesSearch =
        searchTerm === '' ||
        message.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
      const matchesType = filterType === 'all' || message.type === filterType;
      const matchesStarred = !showStarredOnly || message.isStarred;
      const matchesTab = activeTab === 'inbox' ? message.direction === 'incoming' : message.direction === 'outgoing';
      const isNotArchived = !message.isArchived;

      return matchesSearch && matchesPriority && matchesType && matchesStarred && matchesTab && isNotArchived;
    });
  }, [messages, searchTerm, filterPriority, filterType, showStarredOnly, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const unread = messages.filter(m => m.direction === 'incoming' && m.status !== 'read' && m.status !== 'replied').length;
    const needsFollowUp = messages.filter(m => m.requiresFollowUp && !m.followUpCompleted).length;
    const urgent = messages.filter(m => m.priority === 'urgent' && !m.isArchived).length;
    return { unread, needsFollowUp, urgent };
  }, [messages]);

  // Toggle star
  const toggleStar = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      updateMessage(messageId, { ...message, isStarred: !message.isStarred });
    }
  };

  // Archive message
  const archiveMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      updateMessage(messageId, { ...message, isArchived: true });
    }
  };

  // Mark as read
  const markAsRead = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.status !== 'read') {
      updateMessage(messageId, { ...message, status: 'read', readAt: new Date().toISOString() });
    }
  };

  // Complete follow-up
  const completeFollowUp = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      updateMessage(messageId, { ...message, followUpCompleted: true });
    }
  };

  // Send message
  const sendMessage = () => {
    if (!messageForm.parentName || !messageForm.subject || !messageForm.content) {
      setValidationMessage('Please fill in parent name, subject, and content');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const message: CommunicationMessage = {
      id: editingMessage?.id || generateId(),
      parentId: editingMessage?.parentId || generateId(),
      parentName: messageForm.parentName || '',
      childId: editingMessage?.childId || generateId(),
      childName: messageForm.childName || '',
      type: messageForm.type || 'email',
      direction: messageForm.direction || 'outgoing',
      subject: messageForm.subject || '',
      content: messageForm.content || '',
      priority: messageForm.priority || 'normal',
      status: 'sent',
      attachments: messageForm.attachments || [],
      isStarred: messageForm.isStarred || false,
      isArchived: false,
      requiresFollowUp: messageForm.requiresFollowUp || false,
      followUpDate: messageForm.followUpDate,
      followUpCompleted: false,
      tags: messageForm.tags || [],
      sentBy: 'Staff',
      sentAt: now,
      createdAt: editingMessage?.createdAt || now,
      updatedAt: now,
    };

    if (editingMessage) {
      updateMessage(editingMessage.id, {
        ...message,
        metadata: {
          toolId: 'parent-communication',
          parentName: messageForm.parentName,
          childName: messageForm.childName,
          subject: messageForm.subject,
          content: messageForm.content,
          type: messageForm.type,
          priority: messageForm.priority,
          requiresFollowUp: messageForm.requiresFollowUp,
          followUpDate: messageForm.followUpDate,
        },
      } as CommunicationMessage);
    } else {
      addMessage({
        ...message,
        metadata: {
          toolId: 'parent-communication',
          parentName: messageForm.parentName,
          childName: messageForm.childName,
          subject: messageForm.subject,
          content: messageForm.content,
          type: messageForm.type,
          priority: messageForm.priority,
          requiresFollowUp: messageForm.requiresFollowUp,
          followUpDate: messageForm.followUpDate,
        },
      } as CommunicationMessage);
    }

    // Call onSaveCallback if provided (for gallery saves)
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }

    resetMessageForm();
  };

  // Publish announcement
  const publishAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) {
      setValidationMessage('Please fill in title and content');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const now = new Date().toISOString();
    const announcement: Announcement = {
      id: editingAnnouncement?.id || generateId(),
      title: announcementForm.title || '',
      content: announcementForm.content || '',
      type: announcementForm.type || 'general',
      targetAudience: announcementForm.targetAudience || 'all',
      classroomIds: announcementForm.classroomIds || [],
      recipientIds: announcementForm.recipientIds || [],
      priority: announcementForm.priority || 'normal',
      publishDate: announcementForm.publishDate || now,
      expiryDate: announcementForm.expiryDate,
      isPublished: true,
      readBy: editingAnnouncement?.readBy || [],
      acknowledgedBy: editingAnnouncement?.acknowledgedBy || [],
      requiresAcknowledgment: announcementForm.requiresAcknowledgment || false,
      createdBy: 'Staff',
      createdAt: editingAnnouncement?.createdAt || now,
      updatedAt: now,
    };

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, announcement);
    } else {
      addAnnouncement(announcement);
    }

    resetAnnouncementForm();
  };

  // Reset forms
  const resetMessageForm = () => {
    setMessageForm({
      parentName: '',
      childName: '',
      type: 'email',
      direction: 'outgoing',
      subject: '',
      content: '',
      priority: 'normal',
      tags: [],
      requiresFollowUp: false,
    });
    setEditingMessage(null);
    setShowComposeModal(false);
    setSelectedTemplate('');
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'general',
      targetAudience: 'all',
      priority: 'normal',
      requiresAcknowledgment: false,
    });
    setEditingAnnouncement(null);
    setShowAnnouncementModal(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const messageType = MESSAGE_TYPES.find(t => t.value === type);
    return messageType?.icon || MessageSquare;
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const tabClass = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    active
      ? 'bg-[#0D9488] text-white'
      : theme === 'dark'
        ? 'text-gray-400 hover:bg-gray-700'
        : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.parentCommunication.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.parentCommunication.parentCommunicationLog', 'Parent Communication Log')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.parentCommunication.trackAndManageAllParent', 'Track and manage all parent communications')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="parent-communication" toolName="Parent Communication" />

              <SyncStatus
                isSynced={messagesSynced}
                isSaving={messagesSaving}
                lastSaved={messagesLastSaved}
                syncError={messagesSyncError}
                onForceSync={forceMessagesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(messages, messageColumns, 'parent-communications')}
                onExportExcel={() => exportToExcel(messages, messageColumns, 'parent-communications')}
                onExportJSON={() => exportToJSON(messages, 'parent-communications')}
                onExportPDF={() => exportToPDF(messages, messageColumns, 'Parent Communications')}
                onCopy={() => copyUtil(messages, messageColumns)}
                onPrint={() => printData(messages, messageColumns, 'Parent Communications')}
                theme={theme}
              />
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4" />
                {t('tools.parentCommunication.announcement', 'Announcement')}
              </button>
              <button
                onClick={() => setShowComposeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tools.parentCommunication.newMessage', 'New Message')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats.unread > 0 ? 'bg-blue-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.unread} Unread
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats.needsFollowUp > 0 ? 'bg-yellow-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.needsFollowUp} Need Follow-up
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats.urgent > 0 ? 'bg-red-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.urgent} Urgent
              </span>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('inbox')} className={tabClass(activeTab === 'inbox')}>
                {t('tools.parentCommunication.inbox', 'Inbox')}
              </button>
              <button onClick={() => setActiveTab('sent')} className={tabClass(activeTab === 'sent')}>
                {t('tools.parentCommunication.sent', 'Sent')}
              </button>
              <button onClick={() => setActiveTab('announcements')} className={tabClass(activeTab === 'announcements')}>
                {t('tools.parentCommunication.announcements', 'Announcements')}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative min-w-[200px]">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={t('tools.parentCommunication.searchMessages', 'Search messages...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
              >
                <option value="all">{t('tools.parentCommunication.allPriorities', 'All Priorities')}</option>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={inputClass}
                style={{ width: 'auto' }}
              >
                <option value="all">{t('tools.parentCommunication.allTypes', 'All Types')}</option>
                {MESSAGE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`p-2 rounded-lg ${
                  showStarredOnly
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Star className="w-5 h-5" fill={showStarredOnly ? t('tools.parentCommunication.currentcolor', 'currentColor') : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        {activeTab !== 'announcements' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.parentCommunication.noMessagesFound', 'No Messages Found')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {messages.length === 0 ? t('tools.parentCommunication.startCommunicatingWithParents', 'Start communicating with parents.') : t('tools.parentCommunication.noMessagesMatchYourFilters', 'No messages match your filters.')}
                </p>
                {messages.length === 0 && (
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                  >
                    {t('tools.parentCommunication.sendFirstMessage', 'Send First Message')}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMessages.map((message) => {
                  const TypeIcon = getTypeIcon(message.type);

                  return (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        message.status !== 'read' && message.direction === 'incoming' ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => markAsRead(message.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
                            className={`p-1 rounded ${message.isStarred ? 'text-yellow-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            <Star className="w-5 h-5" fill={message.isStarred ? t('tools.parentCommunication.currentcolor2', 'currentColor') : 'none'} />
                          </button>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <TypeIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-medium ${
                                message.status !== 'read' && message.direction === 'incoming'
                                  ? 'font-bold'
                                  : ''
                              } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {message.subject}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </span>
                              {message.requiresFollowUp && !message.followUpCompleted && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  {t('tools.parentCommunication.followUp', 'Follow-up')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {message.parentName} ({message.childName})
                              </span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                {formatDateTime(message.sentAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.requiresFollowUp && !message.followUpCompleted && (
                            <button
                              onClick={(e) => { e.stopPropagation(); completeFollowUp(message.id); }}
                              className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
                              title={t('tools.parentCommunication.markFollowUpComplete', 'Mark follow-up complete')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === message.id ? null : message.id); }}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            {expandedId === message.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); archiveMessage(message.id); }}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            title={t('tools.parentCommunication.archive', 'Archive')}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMessage(message.id); }}
                            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedId === message.id && (
                        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <p className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {message.content}
                            </p>
                          </div>
                          {message.parentResponse && (
                            <div className={`mt-4 p-4 rounded-lg border-l-4 border-[#0D9488] ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-green-50'}`}>
                              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.parentCommunication.parentResponse', 'Parent Response:')}
                              </p>
                              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {message.parentResponse}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-4">
                            <button
                              onClick={() => {
                                setMessageForm({
                                  parentName: message.parentName,
                                  childName: message.childName,
                                  type: message.type,
                                  direction: 'outgoing',
                                  subject: `Re: ${message.subject}`,
                                  content: '',
                                  priority: message.priority,
                                });
                                setShowComposeModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              {t('tools.parentCommunication.reply', 'Reply')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Announcements List */}
        {activeTab === 'announcements' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
            {announcements.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.parentCommunication.noAnnouncements', 'No Announcements')}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.parentCommunication.createAnnouncementsToCommunicateWith', 'Create announcements to communicate with all parents.')}
                </p>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  {t('tools.parentCommunication.createAnnouncement', 'Create Announcement')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {announcement.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {ANNOUNCEMENT_TYPES.find(t => t.value === announcement.type)?.label}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {announcement.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Published: {formatDate(announcement.publishDate)}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Read by: {announcement.readBy.length}
                          </span>
                          {announcement.requiresAcknowledgment && (
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Acknowledged: {announcement.acknowledgedBy.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAnnouncementForm(announcement);
                            setEditingAnnouncement(announcement);
                            setShowAnnouncementModal(true);
                          }}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compose Message Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingMessage ? t('tools.parentCommunication.editMessage', 'Edit Message') : t('tools.parentCommunication.newMessage2', 'New Message')}
                </h2>
                <button
                  onClick={resetMessageForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Template Selection */}
                <div>
                  <label className={labelClass}>{t('tools.parentCommunication.useTemplate', 'Use Template')}</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t('tools.parentCommunication.selectATemplate', 'Select a template...')}</option>
                    {MESSAGE_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.parentName', 'Parent Name *')}</label>
                    <input
                      type="text"
                      value={messageForm.parentName || ''}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, parentName: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.parentCommunication.parentSName', 'Parent\'s name')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.childName', 'Child Name')}</label>
                    <input
                      type="text"
                      value={messageForm.childName || ''}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, childName: e.target.value }))}
                      className={inputClass}
                      placeholder={t('tools.parentCommunication.childSName', 'Child\'s name')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.type', 'Type')}</label>
                    <select
                      value={messageForm.type || 'email'}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className={inputClass}
                    >
                      {MESSAGE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.priority', 'Priority')}</label>
                    <select
                      value={messageForm.priority || 'normal'}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.parentCommunication.subject', 'Subject *')}</label>
                  <input
                    type="text"
                    value={messageForm.subject || ''}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.parentCommunication.messageSubject', 'Message subject')}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t('tools.parentCommunication.content', 'Content *')}</label>
                  <textarea
                    value={messageForm.content || ''}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className={inputClass}
                    placeholder={t('tools.parentCommunication.writeYourMessage', 'Write your message...')}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageForm.requiresFollowUp || false}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, requiresFollowUp: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.parentCommunication.requiresFollowUp', 'Requires Follow-up')}
                    </span>
                  </label>
                  {messageForm.requiresFollowUp && (
                    <input
                      type="date"
                      value={messageForm.followUpDate || ''}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className={inputClass}
                      style={{ width: 'auto' }}
                    />
                  )}
                </div>
              </div>

              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={resetMessageForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.parentCommunication.cancel', 'Cancel')}
                </button>
                <button
                  onClick={sendMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {t('tools.parentCommunication.sendMessage', 'Send Message')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingAnnouncement ? t('tools.parentCommunication.editAnnouncement', 'Edit Announcement') : t('tools.parentCommunication.newAnnouncement', 'New Announcement')}
                </h2>
                <button
                  onClick={resetAnnouncementForm}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>{t('tools.parentCommunication.title', 'Title *')}</label>
                  <input
                    type="text"
                    value={announcementForm.title || ''}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    className={inputClass}
                    placeholder={t('tools.parentCommunication.announcementTitle', 'Announcement title')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.type2', 'Type')}</label>
                    <select
                      value={announcementForm.type || 'general'}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className={inputClass}
                    >
                      {ANNOUNCEMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.priority2', 'Priority')}</label>
                    <select
                      value={announcementForm.priority || 'normal'}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className={inputClass}
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('tools.parentCommunication.content2', 'Content *')}</label>
                  <textarea
                    value={announcementForm.content || ''}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className={inputClass}
                    placeholder={t('tools.parentCommunication.writeYourAnnouncement', 'Write your announcement...')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.publishDate', 'Publish Date')}</label>
                    <input
                      type="date"
                      value={announcementForm.publishDate || ''}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, publishDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('tools.parentCommunication.expiryDate', 'Expiry Date')}</label>
                    <input
                      type="date"
                      value={announcementForm.expiryDate || ''}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementForm.requiresAcknowledgment || false}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.parentCommunication.requireParentAcknowledgment', 'Require parent acknowledgment')}
                  </span>
                </label>
              </div>

              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={resetAnnouncementForm}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('tools.parentCommunication.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={publishAnnouncement}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7A6E] transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {t('tools.parentCommunication.publishAnnouncement', 'Publish Announcement')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default ParentCommunicationTool;
