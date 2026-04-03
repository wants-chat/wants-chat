import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, Users, MessageCircle, Vote, ChevronRight, Plus, Check, Trash2, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface Member {
  id: string;
  name: string;
  currentPage: number;
  avatar?: string;
}

interface DiscussionQuestion {
  id: string;
  question: string;
  answered: boolean;
}

interface BookCandidate {
  id: string;
  title: string;
  author: string;
  votes: number;
  votedBy: string[];
}

interface ScheduleMilestone {
  id: string;
  label: string;
  targetPage: number;
  targetDate: string;
  completed: boolean;
}

interface BookClubTrackerToolProps {
  uiConfig?: UIConfig;
}

// Column configurations for different export types
const MEMBER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Member Name', type: 'string' },
  { key: 'currentPage', header: 'Current Page', type: 'number' },
  { key: 'progress', header: 'Progress %', type: 'number' },
];

const SCHEDULE_COLUMNS: ColumnConfig[] = [
  { key: 'label', header: 'Milestone', type: 'string' },
  { key: 'targetPage', header: 'Target Page', type: 'number' },
  { key: 'targetDate', header: 'Due Date', type: 'date' },
  { key: 'completed', header: 'Completed', type: 'boolean' },
];

const QUESTIONS_COLUMNS: ColumnConfig[] = [
  { key: 'question', header: 'Discussion Question', type: 'string' },
  { key: 'answered', header: 'Answered', type: 'boolean' },
];

const VOTING_COLUMNS: ColumnConfig[] = [
  { key: 'title', header: 'Book Title', type: 'string' },
  { key: 'author', header: 'Author', type: 'string' },
  { key: 'votes', header: 'Votes', type: 'number' },
  { key: 'voters', header: 'Voted By', type: 'string' },
];

// Combined export columns for comprehensive overview
const COMBINED_COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Category', type: 'string' },
  { key: 'item', header: 'Item', type: 'string' },
  { key: 'detail1', header: 'Detail 1', type: 'string' },
  { key: 'detail2', header: 'Detail 2', type: 'string' },
  { key: 'status', header: 'Status', type: 'string' },
];

// Default data for first load
const DEFAULT_MEMBERS: Member[] = [
  { id: '1', name: 'Alice', currentPage: 120 },
  { id: '2', name: 'Bob', currentPage: 85 },
  { id: '3', name: 'Carol', currentPage: 145 },
  { id: '4', name: 'David', currentPage: 60 },
];

const DEFAULT_SCHEDULE: ScheduleMilestone[] = [
  { id: '1', label: 'Chapters 1-3', targetPage: 45, targetDate: '2024-01-15', completed: true },
  { id: '2', label: 'Chapters 4-6', targetPage: 90, targetDate: '2024-01-22', completed: true },
  { id: '3', label: 'Chapters 7-9', targetPage: 135, targetDate: '2024-01-29', completed: false },
  { id: '4', label: 'Final Discussion', targetPage: 180, targetDate: '2024-02-05', completed: false },
];

const DEFAULT_QUESTIONS: DiscussionQuestion[] = [
  { id: '1', question: 'What does the green light symbolize?', answered: false },
  { id: '2', question: 'How does Fitzgerald portray the American Dream?', answered: false },
  { id: '3', question: 'What is the significance of the eyes of Doctor T.J. Eckleburg?', answered: true },
];

const DEFAULT_CANDIDATES: BookCandidate[] = [
  { id: '1', title: '1984', author: 'George Orwell', votes: 3, votedBy: ['Alice', 'Bob', 'Carol'] },
  { id: '2', title: 'Pride and Prejudice', author: 'Jane Austen', votes: 2, votedBy: ['David', 'Alice'] },
  { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', votes: 1, votedBy: ['Carol'] },
];

export const BookClubTrackerTool: React.FC<BookClubTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Current book state
  const [currentBook, setCurrentBook] = useState({
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    totalPages: 180,
    coverColor: 'emerald',
  });

  // Initialize data hooks for backend sync
  const {
    data: members,
    addItem: addMember,
    updateItem: updateMember,
    deleteItem: deleteMember,
    isSynced: membersSynced,
    isSaving: membersSaving,
    lastSaved: membersLastSaved,
    syncError: membersSyncError,
    forceSync: forceSyncMembers,
  } = useToolData<Member>('book-club-members', DEFAULT_MEMBERS, MEMBER_COLUMNS);

  const {
    data: schedule,
    addItem: addScheduleItem,
    updateItem: updateScheduleItem,
    deleteItem: deleteScheduleItem,
    isSynced: scheduleSynced,
    isSaving: scheduleSaving,
    lastSaved: scheduleLastSaved,
    syncError: scheduleSyncError,
    forceSync: forceSyncSchedule,
  } = useToolData<ScheduleMilestone>('book-club-schedule', DEFAULT_SCHEDULE, SCHEDULE_COLUMNS);

  const {
    data: questions,
    addItem: addQuestion,
    updateItem: updateQuestion,
    deleteItem: deleteQuestion,
    isSynced: questionsSynced,
    isSaving: questionsSaving,
    lastSaved: questionsLastSaved,
    syncError: questionsSyncError,
    forceSync: forceSyncQuestions,
  } = useToolData<DiscussionQuestion>('book-club-questions', DEFAULT_QUESTIONS, QUESTIONS_COLUMNS);

  const {
    data: bookCandidates,
    addItem: addNewBookCandidate,
    updateItem: updateBookCandidate,
    deleteItem: deleteBookCandidate,
    isSynced: candidatesSynced,
    isSaving: candidatesSaving,
    lastSaved: candidatesLastSaved,
    syncError: candidatesSyncError,
    forceSync: forceSyncCandidates,
  } = useToolData<BookCandidate>('book-club-voting', DEFAULT_CANDIDATES, VOTING_COLUMNS);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'discussion' | 'voting'>('overview');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [currentUserName, setCurrentUserName] = useState('Alice');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.bookTitle) {
        setCurrentBook(prev => ({ ...prev, title: data.bookTitle as string }));
      }
      if (data.author) {
        setCurrentBook(prev => ({ ...prev, author: data.author as string }));
      }
      if (data.totalPages) {
        setCurrentBook(prev => ({ ...prev, totalPages: Number(data.totalPages) }));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.currentBook) setCurrentBook(params.currentBook);
      if (params.activeTab) setActiveTab(params.activeTab);
      if (params.currentUserName) setCurrentUserName(params.currentUserName);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  // Calculate group progress
  const groupProgress = useMemo(() => {
    const totalProgress = members.reduce((sum, member) => sum + member.currentPage, 0);
    const averageProgress = totalProgress / members.length;
    const percentComplete = (averageProgress / currentBook.totalPages) * 100;
    return {
      average: Math.round(averageProgress),
      percent: Math.round(percentComplete),
      furthestAhead: Math.max(...members.map(m => m.currentPage)),
      furthestBehind: Math.min(...members.map(m => m.currentPage)),
    };
  }, [members, currentBook.totalPages]);

  // Update member progress
  const updateMemberProgress = (memberId: string, newPage: number) => {
    const clampedPage = Math.min(Math.max(0, newPage), currentBook.totalPages);
    updateMember(memberId, { currentPage: clampedPage });
  };

  // Toggle question answered
  const toggleQuestionAnswered = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, { answered: !question.answered });
    }
  };

  // Add new question
  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      addQuestion({
        id: Date.now().toString(),
        question: newQuestionText.trim(),
        answered: false,
      });
      setNewQuestionText('');

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    }
  };

  // Remove question
  const removeQuestion = (questionId: string) => {
    deleteQuestion(questionId);
  };

  // Vote for a book
  const voteForBook = (bookId: string) => {
    const book = bookCandidates.find(b => b.id === bookId);
    if (book) {
      if (book.votedBy.includes(currentUserName)) {
        // Remove vote
        updateBookCandidate(bookId, {
          votes: book.votes - 1,
          votedBy: book.votedBy.filter(name => name !== currentUserName),
        });
      } else {
        // Add vote
        updateBookCandidate(bookId, {
          votes: book.votes + 1,
          votedBy: [...book.votedBy, currentUserName],
        });
      }
    }
  };

  // Add new book candidate
  const handleAddBookCandidate = () => {
    if (newBookTitle.trim() && newBookAuthor.trim()) {
      addNewBookCandidate({
        id: Date.now().toString(),
        title: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        votes: 0,
        votedBy: [],
      });
      setNewBookTitle('');
      setNewBookAuthor('');

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    }
  };

  // Toggle schedule milestone
  const toggleMilestone = (milestoneId: string) => {
    const milestone = schedule.find(m => m.id === milestoneId);
    if (milestone) {
      updateScheduleItem(milestoneId, { completed: !milestone.completed });
    }
  };

  // Prepare export data based on active tab
  const getExportData = () => {
    switch (activeTab) {
      case 'overview':
        return members.map(member => ({
          name: member.name,
          currentPage: member.currentPage,
          progress: Math.round((member.currentPage / currentBook.totalPages) * 100),
        }));
      case 'schedule':
        return schedule.map(milestone => ({
          label: milestone.label,
          targetPage: milestone.targetPage,
          targetDate: milestone.targetDate,
          completed: milestone.completed,
        }));
      case 'discussion':
        return questions.map(q => ({
          question: q.question,
          answered: q.answered,
        }));
      case 'voting':
        return bookCandidates.map(book => ({
          title: book.title,
          author: book.author,
          votes: book.votes,
          voters: book.votedBy.join(', '),
        }));
      default:
        return [];
    }
  };

  const getExportColumns = () => {
    switch (activeTab) {
      case 'overview':
        return MEMBER_COLUMNS;
      case 'schedule':
        return SCHEDULE_COLUMNS;
      case 'discussion':
        return QUESTIONS_COLUMNS;
      case 'voting':
        return VOTING_COLUMNS;
      default:
        return COMBINED_COLUMNS;
    }
  };

  const getExportFilename = () => {
    const bookSlug = currentBook.title.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    switch (activeTab) {
      case 'overview':
        return `book-club-members-${bookSlug}`;
      case 'schedule':
        return `book-club-schedule-${bookSlug}`;
      case 'discussion':
        return `book-club-questions-${bookSlug}`;
      case 'voting':
        return `book-club-voting`;
      default:
        return `book-club-data`;
    }
  };

  const getExportTitle = () => {
    switch (activeTab) {
      case 'overview':
        return `Book Club - Member Progress: ${currentBook.title}`;
      case 'schedule':
        return `Book Club - Reading Schedule: ${currentBook.title}`;
      case 'discussion':
        return `Book Club - Discussion Questions: ${currentBook.title}`;
      case 'voting':
        return `Book Club - Next Book Voting`;
      default:
        return `Book Club Tracker`;
    }
  };

  // Get full export data (all sections combined)
  const getFullExportData = () => {
    return {
      currentBook: {
        title: currentBook.title,
        author: currentBook.author,
        totalPages: currentBook.totalPages,
        groupProgress: groupProgress.percent,
      },
      members: members.map(m => ({
        name: m.name,
        currentPage: m.currentPage,
        progress: Math.round((m.currentPage / currentBook.totalPages) * 100),
      })),
      schedule: schedule.map(s => ({
        label: s.label,
        targetPage: s.targetPage,
        targetDate: s.targetDate,
        completed: s.completed,
      })),
      discussionQuestions: questions.map(q => ({
        question: q.question,
        answered: q.answered,
      })),
      nextBookVoting: bookCandidates.map(b => ({
        title: b.title,
        author: b.author,
        votes: b.votes,
        votedBy: b.votedBy,
      })),
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'discussion', label: 'Discussion', icon: MessageCircle },
    { id: 'voting', label: 'Next Book', icon: Vote },
  ] as const;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bookClubTracker.bookClubTracker', 'Book Club Tracker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookClubTracker.manageYourReadingGroup', 'Manage your reading group')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={() => exportToCSV(getExportData(), getExportColumns(), { filename: getExportFilename() })}
            onExportExcel={() => exportToExcel(getExportData(), getExportColumns(), { filename: getExportFilename() })}
            onExportJSON={() => exportToJSON(getFullExportData(), { filename: getExportFilename() })}
            onExportPDF={async () => {
              await exportToPDF(getExportData(), getExportColumns(), {
                filename: getExportFilename(),
                title: getExportTitle(),
              });
            }}
            onPrint={() => printData(getExportData(), getExportColumns(), { title: getExportTitle() })}
            onCopyToClipboard={() => copyUtil(getExportData(), getExportColumns(), 'tab')}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
        {/* Sync Status Indicators */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bookClubTracker.members', 'Members:')}</span>
            <WidgetEmbedButton toolSlug="book-club-tracker" toolName="Book Club Tracker" />

            <SyncStatus
              isSynced={membersSynced}
              isSaving={membersSaving}
              lastSaved={membersLastSaved}
              syncError={membersSyncError}
              onForceSync={forceSyncMembers}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bookClubTracker.schedule', 'Schedule:')}</span>
            <SyncStatus
              isSynced={scheduleSynced}
              isSaving={scheduleSaving}
              lastSaved={scheduleLastSaved}
              syncError={scheduleSyncError}
              onForceSync={forceSyncSchedule}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bookClubTracker.questions', 'Questions:')}</span>
            <SyncStatus
              isSynced={questionsSynced}
              isSaving={questionsSaving}
              lastSaved={questionsLastSaved}
              syncError={questionsSyncError}
              onForceSync={forceSyncQuestions}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bookClubTracker.voting', 'Voting:')}</span>
            <SyncStatus
              isSynced={candidatesSynced}
              isSaving={candidatesSaving}
              lastSaved={candidatesLastSaved}
              syncError={candidatesSyncError}
              onForceSync={forceSyncCandidates}
              theme={isDark ? 'dark' : 'light'}
              showLabel={true}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Book Display */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentBook.title}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                by {currentBook.author}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-500">{groupProgress.percent}%</div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.bookClubTracker.groupProgress', 'group progress')}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${groupProgress.percent}%` }}
            />
          </div>
          <div className={`mt-2 flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>Avg: Page {groupProgress.average}</span>
            <span>{currentBook.totalPages} pages total</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Users className="w-4 h-4 inline mr-2" />
                {t('tools.bookClubTracker.memberProgress', 'Member Progress')}
              </h4>
            </div>
            <div className="space-y-3">
              {members.map(member => {
                const progress = (member.currentPage / currentBook.totalPages) * 100;
                return (
                  <div key={member.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-medium text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {member.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={member.currentPage}
                          onChange={e => updateMemberProgress(member.id, parseInt(e.target.value) || 0)}
                          className={`w-16 px-2 py-1 text-sm rounded border text-center ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          min={0}
                          max={currentBook.totalPages}
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          / {currentBook.totalPages}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('tools.bookClubTracker.readingSchedule', 'Reading Schedule')}
            </h4>
            <div className="space-y-2">
              {schedule.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.completed
                      ? isDark
                        ? 'bg-emerald-900/20 border-emerald-800'
                        : 'bg-emerald-50 border-emerald-200'
                      : isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMilestone(milestone.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          milestone.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isDark
                            ? 'border-gray-600 hover:border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-500'
                        }`}
                      >
                        {milestone.completed && <Check className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {milestone.label}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {new Date(milestone.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Page {milestone.targetPage}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {Math.round((milestone.targetPage / currentBook.totalPages) * 100)}% of book
                      </p>
                    </div>
                  </div>
                  {index < schedule.length - 1 && (
                    <div className="ml-3 mt-2 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <MessageCircle className="w-4 h-4 inline mr-2" />
              {t('tools.bookClubTracker.discussionQuestions', 'Discussion Questions')}
            </h4>

            {/* Add new question */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                placeholder={t('tools.bookClubTracker.addADiscussionQuestion', 'Add a discussion question...')}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'
                }`}
                onKeyPress={e => e.key === 'Enter' && handleAddQuestion()}
              />
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestionText.trim()}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-2">
              {questions.map(question => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    question.answered
                      ? isDark
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                      : isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleQuestionAnswered(question.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        question.answered
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isDark
                          ? 'border-gray-600 hover:border-emerald-500'
                          : 'border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      {question.answered && <Check className="w-3 h-3" />}
                    </button>
                    <p
                      className={`flex-1 ${
                        question.answered
                          ? isDark
                            ? 'text-gray-500 line-through'
                            : 'text-gray-400 line-through'
                          : isDark
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {question.question}
                    </p>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className={`p-1 rounded hover:bg-red-500/10 ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('tools.bookClubTracker.noDiscussionQuestionsYetAdd', 'No discussion questions yet. Add one above!')}</p>
              </div>
            )}
          </div>
        )}

        {/* Voting Tab */}
        {activeTab === 'voting' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Vote className="w-4 h-4 inline mr-2" />
                {t('tools.bookClubTracker.voteForNextBook', 'Vote for Next Book')}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bookClubTracker.votingAs', 'Voting as:')}</span>
                <select
                  value={currentUserName}
                  onChange={e => setCurrentUserName(e.target.value)}
                  className={`px-2 py-1 text-sm rounded border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add new book candidate */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.bookClubTracker.suggestABook', 'Suggest a book:')}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  placeholder={t('tools.bookClubTracker.bookTitle', 'Book title')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'
                  }`}
                />
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={e => setNewBookAuthor(e.target.value)}
                  placeholder={t('tools.bookClubTracker.author', 'Author')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'
                  }`}
                />
                <button
                  onClick={handleAddBookCandidate}
                  disabled={!newBookTitle.trim() || !newBookAuthor.trim()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Book candidates list */}
            <div className="space-y-2">
              {bookCandidates
                .sort((a, b) => b.votes - a.votes)
                .map((book, index) => {
                  const hasVoted = book.votedBy.includes(currentUserName);
                  return (
                    <div
                      key={book.id}
                      className={`p-4 rounded-lg border ${
                        index === 0 && book.votes > 0
                          ? isDark
                            ? 'bg-emerald-900/20 border-emerald-800'
                            : 'bg-emerald-50 border-emerald-200'
                          : isDark
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {index === 0 && book.votes > 0 && (
                            <span className="text-lg">🏆</span>
                          )}
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {book.title}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              by {book.author}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className={`font-bold text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              {book.votes}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              vote{book.votes !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => voteForBook(book.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              hasVoted
                                ? 'bg-emerald-500 text-white'
                                : isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            {hasVoted ? t('tools.bookClubTracker.voted', 'Voted') : t('tools.bookClubTracker.vote', 'Vote')}
                          </button>
                        </div>
                      </div>
                      {book.votedBy.length > 0 && (
                        <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Voted by: {book.votedBy.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.bookClubTracker.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Update your page progress regularly to keep the group in sync</li>
                <li>- Add discussion questions as you read to capture your thoughts</li>
                <li>- Vote for the next book early to help with planning</li>
                <li>- Check the schedule to stay on track with milestones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookClubTrackerTool;
