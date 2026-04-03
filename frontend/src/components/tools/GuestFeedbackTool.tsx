'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  X,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Bed,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface GuestFeedbackToolProps {
  uiConfig?: UIConfig;
}

interface GuestFeedback {
  id: string;
  guestName: string;
  roomNumber: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  category: FeedbackCategory;
  subcategory: string;
  rating: number;
  sentiment: Sentiment;
  title: string;
  description: string;
  staffMentioned: string;
  department: string;
  status: FeedbackStatus;
  priority: Priority;
  response: string;
  respondedBy: string;
  respondedAt: string;
  followUpRequired: boolean;
  followUpNotes: string;
  source: FeedbackSource;
  createdAt: string;
}

type FeedbackCategory = 'room' | 'service' | 'dining' | 'amenities' | 'cleanliness' | 'location' | 'value' | 'staff' | 'other';
type Sentiment = 'positive' | 'neutral' | 'negative';
type FeedbackStatus = 'new' | 'in-review' | 'responded' | 'resolved' | 'escalated';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type FeedbackSource = 'in-person' | 'email' | 'survey' | 'phone' | 'online-review' | 'social-media';

const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'room', label: 'Room' },
  { value: 'service', label: 'Service' },
  { value: 'dining', label: 'Dining' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'cleanliness', label: 'Cleanliness' },
  { value: 'location', label: 'Location' },
  { value: 'value', label: 'Value' },
  { value: 'staff', label: 'Staff' },
  { value: 'other', label: 'Other' },
];

const FEEDBACK_STATUSES: { value: FeedbackStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'in-review', label: 'In Review', color: 'yellow' },
  { value: 'responded', label: 'Responded', color: 'purple' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'escalated', label: 'Escalated', color: 'red' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const FEEDBACK_SOURCES: { value: FeedbackSource; label: string }[] = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'email', label: 'Email' },
  { value: 'survey', label: 'Survey' },
  { value: 'phone', label: 'Phone' },
  { value: 'online-review', label: 'Online Review' },
  { value: 'social-media', label: 'Social Media' },
];

const feedbackColumns: ColumnConfig[] = [
  { key: 'id', header: 'Feedback ID', type: 'string' },
  { key: 'guestName', header: 'Guest Name', type: 'string' },
  { key: 'roomNumber', header: 'Room', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'sentiment', header: 'Sentiment', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'createdAt', header: 'Date', type: 'date' },
];

const generateSampleFeedback = (): GuestFeedback[] => {
  const today = new Date();
  return [
    {
      id: 'FB-001',
      guestName: 'Sarah Johnson',
      roomNumber: '412',
      email: 'sjohnson@email.com',
      checkInDate: new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
      category: 'service',
      subcategory: 'Front Desk',
      rating: 5,
      sentiment: 'positive',
      title: 'Exceptional Check-in Experience',
      description: 'Maria at the front desk was absolutely wonderful. She upgraded our room and made our anniversary trip very special. Would definitely recommend!',
      staffMentioned: 'Maria Rodriguez',
      department: 'Front Office',
      status: 'resolved',
      priority: 'low',
      response: 'Thank you for your kind words! We have shared your feedback with Maria and our front office team. Looking forward to welcoming you back!',
      respondedBy: 'John Manager',
      respondedAt: new Date(today.getTime() - 1 * 86400000).toISOString(),
      followUpRequired: false,
      followUpNotes: '',
      source: 'survey',
      createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 'FB-002',
      guestName: 'Michael Chen',
      roomNumber: '305',
      email: 'mchen@corp.com',
      checkInDate: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0],
      category: 'room',
      subcategory: 'HVAC',
      rating: 2,
      sentiment: 'negative',
      title: 'AC Not Working Properly',
      description: 'The air conditioning in our room keeps making a loud noise and does not cool the room effectively. Called maintenance twice but issue persists.',
      staffMentioned: '',
      department: 'Maintenance',
      status: 'escalated',
      priority: 'urgent',
      response: '',
      respondedBy: '',
      respondedAt: '',
      followUpRequired: true,
      followUpNotes: 'Guest still in-house. Consider room change if not fixed by tonight.',
      source: 'in-person',
      createdAt: new Date(today.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 'FB-003',
      guestName: 'Emily Watson',
      roomNumber: '518',
      email: 'ewatson@email.com',
      checkInDate: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() - 4 * 86400000).toISOString().split('T')[0],
      category: 'dining',
      subcategory: 'Restaurant',
      rating: 4,
      sentiment: 'positive',
      title: 'Great Breakfast Buffet',
      description: 'The breakfast buffet had excellent variety and everything was fresh. Only suggestion would be to add more vegan options.',
      staffMentioned: '',
      department: 'F&B',
      status: 'in-review',
      priority: 'medium',
      response: '',
      respondedBy: '',
      respondedAt: '',
      followUpRequired: false,
      followUpNotes: 'Forward suggestion to F&B manager',
      source: 'online-review',
      createdAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: 'FB-004',
      guestName: 'David Brown',
      roomNumber: '201',
      email: 'dbrown@email.com',
      checkInDate: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(today.getTime() + 1 * 86400000).toISOString().split('T')[0],
      category: 'cleanliness',
      subcategory: 'Housekeeping',
      rating: 3,
      sentiment: 'neutral',
      title: 'Room Not Ready on Time',
      description: 'Arrived at 3pm but room was not ready until 4:30pm. The front desk was apologetic and offered a drink voucher which was appreciated.',
      staffMentioned: '',
      department: 'Housekeeping',
      status: 'new',
      priority: 'medium',
      response: '',
      respondedBy: '',
      respondedAt: '',
      followUpRequired: true,
      followUpNotes: 'Check with housekeeping supervisor about delay',
      source: 'email',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const GuestFeedbackTool: React.FC<GuestFeedbackToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const feedbackData = useToolData<GuestFeedback>(
    'guest-feedback',
    generateSampleFeedback(),
    feedbackColumns,
    { autoSave: true }
  );

  const feedbacks = feedbackData.data;

  const [showForm, setShowForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<GuestFeedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('');
  const [filterSentiment, setFilterSentiment] = useState<Sentiment | ''>('');

  const [newFeedback, setNewFeedback] = useState<Partial<GuestFeedback>>({
    guestName: '',
    roomNumber: '',
    email: '',
    checkInDate: '',
    checkOutDate: '',
    category: 'service',
    subcategory: '',
    rating: 3,
    sentiment: 'neutral',
    title: '',
    description: '',
    staffMentioned: '',
    department: '',
    status: 'new',
    priority: 'medium',
    response: '',
    followUpRequired: false,
    followUpNotes: '',
    source: 'survey',
  });

  const handleAddFeedback = () => {
    if (!newFeedback.guestName || !newFeedback.title) return;
    const feedback: GuestFeedback = {
      id: `FB-${Date.now().toString().slice(-6)}`,
      guestName: newFeedback.guestName || '',
      roomNumber: newFeedback.roomNumber || '',
      email: newFeedback.email || '',
      checkInDate: newFeedback.checkInDate || '',
      checkOutDate: newFeedback.checkOutDate || '',
      category: newFeedback.category as FeedbackCategory || 'other',
      subcategory: newFeedback.subcategory || '',
      rating: newFeedback.rating || 3,
      sentiment: determineSentiment(newFeedback.rating || 3),
      title: newFeedback.title || '',
      description: newFeedback.description || '',
      staffMentioned: newFeedback.staffMentioned || '',
      department: newFeedback.department || '',
      status: 'new',
      priority: determinePriority(newFeedback.rating || 3),
      response: '',
      respondedBy: '',
      respondedAt: '',
      followUpRequired: newFeedback.followUpRequired || false,
      followUpNotes: newFeedback.followUpNotes || '',
      source: newFeedback.source as FeedbackSource || 'survey',
      createdAt: new Date().toISOString(),
    };
    feedbackData.addItem(feedback);
    resetNewFeedback();
    setShowForm(false);
  };

  const determineSentiment = (rating: number): Sentiment => {
    if (rating >= 4) return 'positive';
    if (rating >= 3) return 'neutral';
    return 'negative';
  };

  const determinePriority = (rating: number): Priority => {
    if (rating <= 1) return 'urgent';
    if (rating <= 2) return 'high';
    if (rating <= 3) return 'medium';
    return 'low';
  };

  const resetNewFeedback = () => {
    setNewFeedback({
      guestName: '',
      roomNumber: '',
      email: '',
      checkInDate: '',
      checkOutDate: '',
      category: 'service',
      subcategory: '',
      rating: 3,
      sentiment: 'neutral',
      title: '',
      description: '',
      staffMentioned: '',
      department: '',
      status: 'new',
      priority: 'medium',
      response: '',
      followUpRequired: false,
      followUpNotes: '',
      source: 'survey',
    });
  };

  const handleUpdateFeedback = () => {
    if (!editingFeedback) return;
    feedbackData.updateItem(editingFeedback.id, editingFeedback);
    setEditingFeedback(null);
  };

  const handleDeleteFeedback = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Feedback',
      message: 'Are you sure you want to delete this feedback?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) feedbackData.deleteItem(id);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Feedback',
      message: 'Are you sure you want to reset all feedback to sample data?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) feedbackData.resetToDefault(generateSampleFeedback());
  };

  const filteredFeedback = useMemo(() => {
    return feedbacks.filter(f => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!f.guestName.toLowerCase().includes(q) &&
            !f.title.toLowerCase().includes(q) &&
            !f.description.toLowerCase().includes(q) &&
            !f.roomNumber.toLowerCase().includes(q)) return false;
      }
      if (filterCategory && f.category !== filterCategory) return false;
      if (filterStatus && f.status !== filterStatus) return false;
      if (filterSentiment && f.sentiment !== filterSentiment) return false;
      return true;
    });
  }, [feedbacks, searchQuery, filterCategory, filterStatus, filterSentiment]);

  const stats = useMemo(() => {
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
      : 0;
    return {
      total: feedbacks.length,
      positive: feedbacks.filter(f => f.sentiment === 'positive').length,
      negative: feedbacks.filter(f => f.sentiment === 'negative').length,
      avgRating: avgRating.toFixed(1),
      needsResponse: feedbacks.filter(f => f.status === 'new' || f.status === 'in-review').length,
    };
  }, [feedbacks]);

  const inputClass = `w-full px-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`;
  const cardClass = `p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`;

  const getStatusColor = (status: FeedbackStatus) => {
    const colors: Record<string, string> = {
      new: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
      'in-review': isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      responded: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      resolved: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      escalated: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.new;
  };

  const getSentimentIcon = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const renderStars = (rating: number, editable = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => editable && onChange && onChange(star)}
            disabled={!editable}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderForm = (feedback: Partial<GuestFeedback>, isEditing = false) => {
    const setData = isEditing
      ? (updates: Partial<GuestFeedback>) => setEditingFeedback({ ...editingFeedback!, ...updates })
      : (updates: Partial<GuestFeedback>) => setNewFeedback({ ...newFeedback, ...updates });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Guest Name *</label>
            <input type="text" value={feedback.guestName || ''} onChange={(e) => setData({ guestName: e.target.value })} placeholder="Guest name" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Room Number</label>
            <input type="text" value={feedback.roomNumber || ''} onChange={(e) => setData({ roomNumber: e.target.value })} placeholder="Room #" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input type="email" value={feedback.email || ''} onChange={(e) => setData({ email: e.target.value })} placeholder="guest@email.com" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select value={feedback.category || 'service'} onChange={(e) => setData({ category: e.target.value as FeedbackCategory })} className={inputClass}>
              {FEEDBACK_CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Source</label>
            <select value={feedback.source || 'survey'} onChange={(e) => setData({ source: e.target.value as FeedbackSource })} className={inputClass}>
              {FEEDBACK_SOURCES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
            <div className="pt-2">
              {renderStars(feedback.rating || 3, true, (r) => setData({ rating: r, sentiment: determineSentiment(r) }))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
          <input type="text" value={feedback.title || ''} onChange={(e) => setData({ title: e.target.value })} placeholder="Brief summary of feedback" className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea value={feedback.description || ''} onChange={(e) => setData({ description: e.target.value })} placeholder="Detailed feedback..." rows={3} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Staff Mentioned</label>
            <input type="text" value={feedback.staffMentioned || ''} onChange={(e) => setData({ staffMentioned: e.target.value })} placeholder="Staff name (if any)" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
            <input type="text" value={feedback.department || ''} onChange={(e) => setData({ department: e.target.value })} placeholder="Related department" className={inputClass} />
          </div>
        </div>

        {isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <select value={feedback.status || 'new'} onChange={(e) => setData({ status: e.target.value as FeedbackStatus })} className={inputClass}>
                  {FEEDBACK_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                <select value={feedback.priority || 'medium'} onChange={(e) => setData({ priority: e.target.value as Priority })} className={inputClass}>
                  {PRIORITIES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Response</label>
              <textarea value={feedback.response || ''} onChange={(e) => setData({ response: e.target.value })} placeholder="Your response to the guest..." rows={2} className={inputClass} />
            </div>
          </>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={feedback.followUpRequired || false}
              onChange={(e) => setData({ followUpRequired: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Follow-up Required</span>
          </label>
        </div>

        {feedback.followUpRequired && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Follow-up Notes</label>
            <input type="text" value={feedback.followUpNotes || ''} onChange={(e) => setData({ followUpNotes: e.target.value })} placeholder="Notes for follow-up..." className={inputClass} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488]/10 rounded-xl"><MessageSquare className="w-6 h-6 text-[#0D9488]" /></div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestFeedback.title')}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WidgetEmbedButton toolSlug="guest-feedback" toolName="Guest Feedback" />

              <SyncStatus isSynced={feedbackData.isSynced} isSaving={feedbackData.isSaving} lastSaved={feedbackData.lastSaved} syncError={feedbackData.syncError} onForceSync={() => feedbackData.forceSync()} theme={isDark ? 'dark' : 'light'} showLabel={true} size="sm" />
              <ExportDropdown onExportCSV={() => feedbackData.exportCSV({ filename: 'guest-feedback' })} onExportExcel={() => feedbackData.exportExcel({ filename: 'guest-feedback' })} onExportJSON={() => feedbackData.exportJSON({ filename: 'guest-feedback' })} onExportPDF={() => feedbackData.exportPDF({ filename: 'guest-feedback', title: 'Guest Feedback' })} onPrint={() => feedbackData.print('Guest Feedback')} onCopyToClipboard={() => feedbackData.copyToClipboard('tab')} theme={isDark ? 'dark' : 'light'} />
              <button onClick={handleReset} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><RefreshCw className="w-4 h-4" />{t('tools.guestFeedback.reset')}</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.stats.totalFeedback')}</p><p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.stats.avgRating')}</p><p className="text-2xl font-bold text-yellow-500">{stats.avgRating} <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /></p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.stats.positive')}</p><p className="text-2xl font-bold text-green-500">{stats.positive}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.stats.negative')}</p><p className="text-2xl font-bold text-red-500">{stats.negative}</p></div>
          <div className={cardClass}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.guestFeedback.stats.needsResponse')}</p><p className="text-2xl font-bold text-blue-500">{stats.needsResponse}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('tools.guestFeedback.searchPlaceholder')} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FeedbackCategory | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestFeedback.allCategories')}</option>
            {FEEDBACK_CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestFeedback.allStatuses')}</option>
            {FEEDBACK_STATUSES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value as Sentiment | '')} className={`${inputClass} w-auto`}>
            <option value="">{t('tools.guestFeedback.allSentiment')}</option>
            <option value="positive">{t('tools.guestFeedback.positive')}</option>
            <option value="neutral">{t('tools.guestFeedback.neutral')}</option>
            <option value="negative">{t('tools.guestFeedback.negative')}</option>
          </select>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl hover:bg-[#0B8276] flex items-center gap-2"><Plus className="w-5 h-5" />{t('tools.guestFeedback.addFeedback')}</button>
        </div>

        {/* Forms */}
        {showForm && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestFeedback.addGuestFeedback')}</h3>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(newFeedback)}
            <button onClick={handleAddFeedback} disabled={!newFeedback.guestName || !newFeedback.title} className="mt-4 w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />{t('tools.guestFeedback.addFeedback')}</button>
          </div>
        )}

        {editingFeedback && (
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.guestFeedback.editFeedback')}</h3>
              <button onClick={() => setEditingFeedback(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
            </div>
            {renderForm(editingFeedback, true)}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdateFeedback} className="flex-1 py-3 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-medium rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('tools.guestFeedback.save')}</button>
              <button onClick={() => setEditingFeedback(null)} className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{t('tools.guestFeedback.cancel')}</button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-3">
          {filteredFeedback.map(feedback => (
            <div key={feedback.id} className={cardClass}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{feedback.title}</h4>
                    {getSentimentIcon(feedback.sentiment)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(feedback.status)}`}>{FEEDBACK_STATUSES.find(s => s.value === feedback.status)?.label}</span>
                    {feedback.followUpRequired && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>Follow-up</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-2 flex-wrap">
                    <div className="flex items-center gap-1"><User className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feedback.guestName}</span></div>
                    {feedback.roomNumber && <div className="flex items-center gap-1"><Bed className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Room {feedback.roomNumber}</span></div>}
                    <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{FEEDBACK_CATEGORIES.find(c => c.value === feedback.category)?.label}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{feedback.description}</p>
                  {feedback.response && (
                    <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Response:</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{feedback.response}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Clock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{FEEDBACK_SOURCES.find(s => s.value === feedback.source)?.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setEditingFeedback(feedback)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
                  <button onClick={() => handleDeleteFeedback(feedback.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className={`text-center py-12 ${cardClass}`}>
            <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.guestFeedback.noFeedbackFound')}</p>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default GuestFeedbackTool;
