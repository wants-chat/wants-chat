'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  Award,
  Star,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3,
  Clock,
  Send,
  ThumbsUp,
  Eye,
  Building2,
  Briefcase,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface PerformanceReviewToolProps {
  uiConfig?: UIConfig;
}

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type ReviewStatus = 'draft' | 'self-review' | 'manager-review' | 'calibration' | 'completed';
type ReviewPeriod = 'annual' | 'semi-annual' | 'quarterly' | 'probation';
type RatingLevel = 1 | 2 | 3 | 4 | 5;

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  weight: number;
  selfRating: RatingLevel | null;
  managerRating: RatingLevel | null;
  status: 'not-started' | 'in-progress' | 'completed' | 'exceeded';
  comments: string;
}

interface Competency {
  id: string;
  name: string;
  description: string;
  selfRating: RatingLevel | null;
  managerRating: RatingLevel | null;
  examples: string;
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  position: string;
  managerId: string;
  managerName: string;
  reviewPeriod: ReviewPeriod;
  periodStart: string;
  periodEnd: string;
  status: ReviewStatus;
  goals: Goal[];
  competencies: Competency[];
  selfReviewComments: string;
  managerComments: string;
  developmentPlan: string;
  overallSelfRating: RatingLevel | null;
  overallManagerRating: RatingLevel | null;
  finalRating: RatingLevel | null;
  submittedDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Constants
const REVIEW_STATUSES: { value: ReviewStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'self-review', label: 'Self Review', color: 'blue' },
  { value: 'manager-review', label: 'Manager Review', color: 'purple' },
  { value: 'calibration', label: 'Calibration', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
];

const REVIEW_PERIODS: { value: ReviewPeriod; label: string }[] = [
  { value: 'annual', label: 'Annual Review' },
  { value: 'semi-annual', label: 'Semi-Annual Review' },
  { value: 'quarterly', label: 'Quarterly Review' },
  { value: 'probation', label: 'Probation Review' },
];

const RATING_LABELS: Record<RatingLevel, { label: string; color: string }> = {
  1: { label: 'Needs Improvement', color: 'red' },
  2: { label: 'Below Expectations', color: 'orange' },
  3: { label: 'Meets Expectations', color: 'yellow' },
  4: { label: 'Exceeds Expectations', color: 'lime' },
  5: { label: 'Outstanding', color: 'green' },
};

const DEFAULT_COMPETENCIES = [
  { name: 'Communication', description: 'Effectively expresses ideas and listens to others' },
  { name: 'Teamwork', description: 'Collaborates well with colleagues and contributes to team success' },
  { name: 'Problem Solving', description: 'Identifies issues and develops effective solutions' },
  { name: 'Initiative', description: 'Takes proactive steps and seeks opportunities for improvement' },
  { name: 'Quality of Work', description: 'Produces accurate, thorough, and professional work' },
  { name: 'Time Management', description: 'Prioritizes tasks effectively and meets deadlines' },
];

// Column configuration for exports
const REVIEW_COLUMNS: ColumnConfig[] = [
  { key: 'employeeName', header: 'Employee Name', type: 'string' },
  { key: 'department', header: 'Department', type: 'string' },
  { key: 'position', header: 'Position', type: 'string' },
  { key: 'managerName', header: 'Manager', type: 'string' },
  { key: 'reviewPeriod', header: 'Review Period', type: 'string' },
  { key: 'periodStart', header: 'Period Start', type: 'date' },
  { key: 'periodEnd', header: 'Period End', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'overallSelfRating', header: 'Self Rating', type: 'number' },
  { key: 'overallManagerRating', header: 'Manager Rating', type: 'number' },
  { key: 'finalRating', header: 'Final Rating', type: 'number' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateAverageRating = (items: { selfRating: RatingLevel | null; managerRating: RatingLevel | null }[], type: 'self' | 'manager'): number | null => {
  const ratings = items
    .map((item) => (type === 'self' ? item.selfRating : item.managerRating))
    .filter((r): r is RatingLevel => r !== null);

  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
};

// Main Component
export const PerformanceReviewTool: React.FC<PerformanceReviewToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // useToolData hook for backend sync
  const {
    data: reviews,
    addItem: addReviewToBackend,
    updateItem: updateReviewBackend,
    deleteItem: deleteReviewBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PerformanceReview>('performance-reviews', [], REVIEW_COLUMNS);

  // Local UI State
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [activeTab, setActiveTab] = useState<'goals' | 'competencies' | 'summary'>('goals');

  // New review form state
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    employeeName: '',
    employeeEmail: '',
    department: '',
    position: '',
    managerName: '',
    reviewPeriod: 'annual',
    periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    periodEnd: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    status: 'draft',
    goals: [],
    competencies: [],
    selfReviewComments: '',
    managerComments: '',
    developmentPlan: '',
    overallSelfRating: null,
    overallManagerRating: null,
    finalRating: null,
  });

  // New goal/competency form state
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    targetDate: '',
    weight: 25,
  });

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
      const matchesPeriod = filterPeriod === 'all' || review.reviewPeriod === filterPeriod;
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [reviews, searchTerm, filterStatus, filterPeriod]);

  // Analytics
  const analytics = useMemo(() => {
    const total = reviews.length;
    const byStatus = reviews.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedReviews = reviews.filter((r) => r.finalRating !== null);
    const avgRating = completedReviews.length > 0
      ? Math.round((completedReviews.reduce((sum, r) => sum + (r.finalRating || 0), 0) / completedReviews.length) * 10) / 10
      : 0;

    const ratingDistribution = completedReviews.reduce((acc, r) => {
      if (r.finalRating) {
        acc[r.finalRating] = (acc[r.finalRating] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return { total, byStatus, avgRating, ratingDistribution, completedCount: completedReviews.length };
  }, [reviews]);

  // Add default competencies
  const addDefaultCompetencies = () => {
    const competencies = DEFAULT_COMPETENCIES.map((comp) => ({
      id: generateId(),
      name: comp.name,
      description: comp.description,
      selfRating: null,
      managerRating: null,
      examples: '',
    }));
    setNewReview((prev) => ({ ...prev, competencies }));
  };

  // Add goal
  const addGoal = () => {
    if (!newGoal.title) {
      setValidationMessage('Please enter a goal title');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const goal: Goal = {
      id: generateId(),
      title: newGoal.title || '',
      description: newGoal.description || '',
      targetDate: newGoal.targetDate || '',
      weight: newGoal.weight || 25,
      selfRating: null,
      managerRating: null,
      status: 'not-started',
      comments: '',
    };

    setNewReview((prev) => ({
      ...prev,
      goals: [...(prev.goals || []), goal],
    }));

    setNewGoal({ title: '', description: '', targetDate: '', weight: 25 });
  };

  // Save review
  const saveReview = () => {
    if (!newReview.employeeName || !newReview.employeeEmail) {
      setValidationMessage('Please fill in required fields (Employee Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const review: PerformanceReview = {
      id: editingReview?.id || generateId(),
      employeeId: editingReview?.employeeId || generateId(),
      employeeName: newReview.employeeName || '',
      employeeEmail: newReview.employeeEmail || '',
      department: newReview.department || '',
      position: newReview.position || '',
      managerId: editingReview?.managerId || generateId(),
      managerName: newReview.managerName || '',
      reviewPeriod: newReview.reviewPeriod || 'annual',
      periodStart: newReview.periodStart || '',
      periodEnd: newReview.periodEnd || '',
      status: newReview.status || 'draft',
      goals: newReview.goals || [],
      competencies: newReview.competencies || [],
      selfReviewComments: newReview.selfReviewComments || '',
      managerComments: newReview.managerComments || '',
      developmentPlan: newReview.developmentPlan || '',
      overallSelfRating: newReview.overallSelfRating || null,
      overallManagerRating: newReview.overallManagerRating || null,
      finalRating: newReview.finalRating || null,
      submittedDate: editingReview?.submittedDate || null,
      completedDate: newReview.status === 'completed' && !editingReview?.completedDate ? new Date().toISOString() : (editingReview?.completedDate || null),
      createdAt: editingReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingReview) {
      updateReviewBackend(review.id, review);
    } else {
      addReviewToBackend(review);
    }

    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setNewReview({
      employeeName: '',
      employeeEmail: '',
      department: '',
      position: '',
      managerName: '',
      reviewPeriod: 'annual',
      periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      periodEnd: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      status: 'draft',
      goals: [],
      competencies: [],
      selfReviewComments: '',
      managerComments: '',
      developmentPlan: '',
      overallSelfRating: null,
      overallManagerRating: null,
      finalRating: null,
    });
    setEditingReview(null);
    setNewGoal({ title: '', description: '', targetDate: '', weight: 25 });
  };

  const editReview = (review: PerformanceReview) => {
    setEditingReview(review);
    setNewReview(review);
    setViewMode('create');
  };

  const viewReviewDetail = (review: PerformanceReview) => {
    setSelectedReview(review);
    setViewMode('detail');
    setActiveTab('goals');
  };

  const deleteReview = async (reviewId: string) => {
    const confirmed = await confirm({
      title: 'Delete Performance Review',
      message: 'Are you sure you want to delete this performance review?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (confirmed) {
      deleteReviewBackend(reviewId);
      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
        setViewMode('list');
      }
    }
  };

  const updateGoalRating = (review: PerformanceReview, goalId: string, type: 'self' | 'manager', rating: RatingLevel) => {
    const updatedGoals = review.goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, [type === 'self' ? 'selfRating' : 'managerRating']: rating }
        : goal
    );

    const updatedReview = {
      ...review,
      goals: updatedGoals,
      updatedAt: new Date().toISOString(),
    };

    updateReviewBackend(review.id, updatedReview);

    if (selectedReview?.id === review.id) {
      setSelectedReview(updatedReview);
    }
  };

  const updateCompetencyRating = (review: PerformanceReview, compId: string, type: 'self' | 'manager', rating: RatingLevel) => {
    const updatedCompetencies = review.competencies.map((comp) =>
      comp.id === compId
        ? { ...comp, [type === 'self' ? 'selfRating' : 'managerRating']: rating }
        : comp
    );

    const updatedReview = {
      ...review,
      competencies: updatedCompetencies,
      updatedAt: new Date().toISOString(),
    };

    updateReviewBackend(review.id, updatedReview);

    if (selectedReview?.id === review.id) {
      setSelectedReview(updatedReview);
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    const statusConfig = REVIEW_STATUSES.find((s) => s.value === status);
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[statusConfig?.color || 'gray'];
  };

  const getRatingColor = (rating: RatingLevel | null) => {
    if (!rating) return 'bg-gray-200 dark:bg-gray-700';
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      lime: 'bg-lime-500',
      green: 'bg-green-500',
    };
    return colors[RATING_LABELS[rating].color];
  };

  // Export handlers
  const handleExport = (format: string) => {
    switch (format) {
      case 'csv':
        exportToCSV(filteredReviews, REVIEW_COLUMNS, 'performance-reviews');
        break;
      case 'excel':
        exportToExcel(filteredReviews, REVIEW_COLUMNS, 'performance-reviews');
        break;
      case 'json':
        exportToJSON(filteredReviews, 'performance-reviews');
        break;
      case 'pdf':
        exportToPDF(filteredReviews, REVIEW_COLUMNS, 'Performance Reviews Report');
        break;
      case 'print':
        printData(filteredReviews, REVIEW_COLUMNS, 'Performance Reviews Report');
        break;
    }
  };

  const renderRatingStars = (rating: RatingLevel | null, interactive = false, onClick?: (rating: RatingLevel) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              rating && star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onClick?.(star as RatingLevel)}
          />
        ))}
        {rating && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {RATING_LABELS[rating].label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <ConfirmDialog />
      {/* Validation Message Toast */}
      {validationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {validationMessage}
        </div>
      )}
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tools.performanceReview.performanceReviews', 'Performance Reviews')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('tools.performanceReview.manageEmployeePerformanceEvaluations', 'Manage employee performance evaluations')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="performance-review" toolName="Performance Review" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={syncError}
              onRetry={forceSync}
            />
            <ExportDropdown onExport={handleExport} />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedReview(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t('tools.performanceReview.allReviews', 'All Reviews')}
          </button>
          {viewMode === 'detail' && selectedReview && (
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white">
              {selectedReview.employeeName}
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setViewMode('create');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'create'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {editingReview ? t('tools.performanceReview.editReview', 'Edit Review') : t('tools.performanceReview.newReview2', 'New Review')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.performanceReview.totalReviews', 'Total Reviews')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.byStatus['self-review'] || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.performanceReview.selfReview', 'Self Review')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analytics.byStatus['manager-review'] || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.performanceReview.managerReview', 'Manager Review')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.completedCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.performanceReview.completed', 'Completed')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgRating}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('tools.performanceReview.avgRating', 'Avg Rating')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('tools.performanceReview.searchReviews', 'Search reviews...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.performanceReview.allStatuses', 'All Statuses')}</option>
                {REVIEW_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('tools.performanceReview.allPeriods', 'All Periods')}</option>
                {REVIEW_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Review List */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tools.performanceReview.noReviewsFound', 'No reviews found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {reviews.length === 0
                    ? t('tools.performanceReview.createYourFirstPerformanceReview', 'Create your first performance review to get started.') : t('tools.performanceReview.tryAdjustingYourSearchOr', 'Try adjusting your search or filters.')}
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.performanceReview.newReview', 'New Review')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => viewReviewDetail(review)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-lg font-medium text-indigo-600 dark:text-indigo-300">
                              {review.employeeName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {review.employeeName}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                {REVIEW_STATUSES.find((s) => s.value === review.status)?.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {review.position} - {review.department}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {REVIEW_PERIODS.find((p) => p.value === review.reviewPeriod)?.label}
                              </span>
                              <span>
                                {formatDate(review.periodStart)} - {formatDate(review.periodEnd)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {review.managerName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {review.finalRating ? (
                            <div className="flex items-center gap-2">
                              {renderRatingStars(review.finalRating)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <div>Goals: {review.goals.length}</div>
                              <div>Competencies: {review.competencies.length}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'detail' && selectedReview && (
          <div className="space-y-4">
            {/* Employee Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-2xl font-medium text-indigo-600 dark:text-indigo-300">
                        {selectedReview.employeeName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedReview.employeeName}
                        </h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                          {REVIEW_STATUSES.find((s) => s.value === selectedReview.status)?.label}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedReview.position} - {selectedReview.department}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{REVIEW_PERIODS.find((p) => p.value === selectedReview.reviewPeriod)?.label}</span>
                        <span>{formatDate(selectedReview.periodStart)} - {formatDate(selectedReview.periodEnd)}</span>
                        <span>Manager: {selectedReview.managerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editReview(selectedReview)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteReview(selectedReview.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Final Rating */}
                {selectedReview.finalRating && (
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.performanceReview.finalRating', 'Final Rating')}</span>
                      {renderRatingStars(selectedReview.finalRating)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {(['goals', 'competencies', 'summary'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'goals' ? `Goals (${selectedReview.goals.length})` : tab === 'competencies' ? `Competencies (${selectedReview.competencies.length})` : 'Summary'}
                </button>
              ))}
            </div>

            {activeTab === 'goals' && (
              <div className="space-y-3">
                {selectedReview.goals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('tools.performanceReview.noGoalsDefinedForThis', 'No goals defined for this review.')}
                  </div>
                ) : (
                  selectedReview.goals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded">
                            Weight: {goal.weight}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tools.performanceReview.selfRating', 'Self Rating')}</p>
                            {renderRatingStars(goal.selfRating, true, (rating) => updateGoalRating(selectedReview, goal.id, 'self', rating))}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tools.performanceReview.managerRating', 'Manager Rating')}</p>
                            {renderRatingStars(goal.managerRating, true, (rating) => updateGoalRating(selectedReview, goal.id, 'manager', rating))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'competencies' && (
              <div className="space-y-3">
                {selectedReview.competencies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('tools.performanceReview.noCompetenciesDefinedForThis', 'No competencies defined for this review.')}
                  </div>
                ) : (
                  selectedReview.competencies.map((comp) => (
                    <Card key={comp.id}>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{comp.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{comp.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tools.performanceReview.selfRating2', 'Self Rating')}</p>
                            {renderRatingStars(comp.selfRating, true, (rating) => updateCompetencyRating(selectedReview, comp.id, 'self', rating))}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tools.performanceReview.managerRating2', 'Manager Rating')}</p>
                            {renderRatingStars(comp.managerRating, true, (rating) => updateCompetencyRating(selectedReview, comp.id, 'manager', rating))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('tools.performanceReview.selfReviewComments', 'Self Review Comments')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedReview.selfReviewComments || 'No comments provided.'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('tools.performanceReview.managerComments', 'Manager Comments')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedReview.managerComments || 'No comments provided.'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('tools.performanceReview.developmentPlan', 'Development Plan')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedReview.developmentPlan || 'No development plan defined.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingReview ? t('tools.performanceReview.editPerformanceReview', 'Edit Performance Review') : t('tools.performanceReview.createPerformanceReview', 'Create Performance Review')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.employeeName', 'Employee Name *')}
                    </label>
                    <input
                      type="text"
                      value={newReview.employeeName}
                      onChange={(e) => setNewReview({ ...newReview, employeeName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={newReview.employeeEmail}
                      onChange={(e) => setNewReview({ ...newReview, employeeEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.department', 'Department')}
                    </label>
                    <input
                      type="text"
                      value={newReview.department}
                      onChange={(e) => setNewReview({ ...newReview, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.position', 'Position')}
                    </label>
                    <input
                      type="text"
                      value={newReview.position}
                      onChange={(e) => setNewReview({ ...newReview, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.managerName', 'Manager Name')}
                    </label>
                    <input
                      type="text"
                      value={newReview.managerName}
                      onChange={(e) => setNewReview({ ...newReview, managerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.reviewPeriod', 'Review Period')}
                    </label>
                    <select
                      value={newReview.reviewPeriod}
                      onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value as ReviewPeriod })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {REVIEW_PERIODS.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.periodStart', 'Period Start')}
                    </label>
                    <input
                      type="date"
                      value={newReview.periodStart}
                      onChange={(e) => setNewReview({ ...newReview, periodStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tools.performanceReview.periodEnd', 'Period End')}
                    </label>
                    <input
                      type="date"
                      value={newReview.periodEnd}
                      onChange={(e) => setNewReview({ ...newReview, periodEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.performanceReview.goals', 'Goals')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('tools.performanceReview.goalTitle', 'Goal title')}
                    />
                  </div>
                  <input
                    type="number"
                    value={newGoal.weight}
                    onChange={(e) => setNewGoal({ ...newGoal, weight: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('tools.performanceReview.weight', 'Weight %')}
                  />
                  <button
                    onClick={addGoal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {newReview.goals && newReview.goals.length > 0 && (
                  <div className="space-y-2">
                    {newReview.goals.map((goal, idx) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {goal.title}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">Weight: {goal.weight}%</span>
                        </div>
                        <button
                          onClick={() =>
                            setNewReview({
                              ...newReview,
                              goals: newReview.goals?.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competencies Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('tools.performanceReview.competencies', 'Competencies')}</CardTitle>
                  {!editingReview && (
                    <button
                      onClick={addDefaultCompetencies}
                      className="px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    >
                      {t('tools.performanceReview.addDefaultCompetencies', 'Add Default Competencies')}
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {newReview.competencies && newReview.competencies.length > 0 && (
                  <div className="space-y-2">
                    {newReview.competencies.map((comp, idx) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comp.name}
                          </span>
                          <p className="text-xs text-gray-500">{comp.description}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNewReview({
                              ...newReview,
                              competencies: newReview.competencies?.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveReview}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingReview ? t('tools.performanceReview.updateReview', 'Update Review') : t('tools.performanceReview.createReview', 'Create Review')}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setViewMode('list');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('tools.performanceReview.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceReviewTool;
