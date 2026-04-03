import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Archive,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  AlertCircle,
  Settings,
  MoreVertical,
  Check,
  Palette,
  Sparkles,
} from 'lucide-react';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import {
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useToolData } from '../../hooks/useToolData';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

// Types
interface Label {
  id: string;
  name: string;
  color: string;
}

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  labels: string[];
  dueDate: string | null;
  createdAt: string;
  archived: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cardIds: string[];
}

interface KanbanState {
  id: string; // Required for useToolData
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  labels: Label[];
}

// Export data interface for flat card representation
interface ExportableCard {
  id: string;
  title: string;
  description: string;
  priority: string;
  labels: string;
  dueDate: string;
  column: string;
  createdAt: string;
  archived: string;
}

// Column configuration for export and useToolData
const EXPORT_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'title', header: 'Title', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'column', header: 'Column', type: 'string' },
  { key: 'priority', header: 'Priority', type: 'string' },
  { key: 'labels', header: 'Labels', type: 'string' },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'createdAt', header: 'Created At', type: 'date' },
  { key: 'archived', header: 'Archived', type: 'string' },
];

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#6B7280', cardIds: [] },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6', cardIds: [] },
  { id: 'review', title: 'Review', color: '#F59E0B', cardIds: [] },
  { id: 'done', title: 'Done', color: '#10B981', cardIds: [] },
];

const DEFAULT_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#EF4444' },
  { id: 'feature', name: 'Feature', color: '#3B82F6' },
  { id: 'improvement', name: 'Improvement', color: '#8B5CF6' },
  { id: 'documentation', name: 'Documentation', color: '#10B981' },
  { id: 'urgent', name: 'Urgent', color: '#F97316' },
];

const PRIORITY_COLORS = {
  high: { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C' },
  medium: { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' },
  low: { bg: '#D1FAE5', border: '#10B981', text: '#047857' },
};

const COLUMN_COLORS = [
  '#6B7280', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

const STORAGE_KEY = 'kanban-board-state';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface KanbanBoardToolProps {
  uiConfig?: UIConfig;
}

export const KanbanBoardTool: React.FC<KanbanBoardToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Default state for useToolData
  const defaultState: KanbanState = {
    id: 'kanban-board-default',
    columns: DEFAULT_COLUMNS,
    cards: {},
    labels: DEFAULT_LABELS,
  };

  // UseToolData hook for backend sync
  const {
    data: boardStates,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard: copyToClipboardHook,
    print: printHook,
  } = useToolData<KanbanState>(
    'kanban-board',
    [defaultState],
    EXPORT_COLUMNS,
    { autoSave: true, autoSaveDelay: 1000 }
  );

  // Get current state (use first item or default)
  const state = boardStates[0] || defaultState;

  // State setter that updates via hook
  const setState = (newState: KanbanState | ((prev: KanbanState) => KanbanState)) => {
    const updated = typeof newState === 'function' ? newState(state) : newState;
    if (boardStates.length > 0) {
      updateItem(state.id, updated);
    } else {
      addItem(updated);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddCard, setShowAddCard] = useState<string | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showLabelManager, setShowLabelManager] = useState(false);

  // New column/card form state
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState(COLUMN_COLORS[0]);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCardLabels, setNewCardLabels] = useState<string[]>([]);
  const [newCardDueDate, setNewCardDueDate] = useState('');

  // Edit form state
  const [editColumnTitle, setEditColumnTitle] = useState('');
  const [editColumnColor, setEditColumnColor] = useState('');
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardPriority, setEditCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCardLabels, setEditCardLabels] = useState<string[]>([]);
  const [editCardDueDate, setEditCardDueDate] = useState('');

  // Label manager state
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.title) {
        setNewCardTitle(params.title || params.text || params.content || '');
        if (params.description) {
          setNewCardDescription(params.description);
        }
        setShowAddCard('todo');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    const filtered: Record<string, KanbanCard> = {};
    Object.entries(state.cards).forEach(([id, card]) => {
      if (card.archived && !showArchived) return;
      if (!card.archived && showArchived) return;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !card.title.toLowerCase().includes(query) &&
          !card.description.toLowerCase().includes(query)
        ) {
          return;
        }
      }

      if (filterLabels.length > 0) {
        if (!filterLabels.some((l) => card.labels.includes(l))) {
          return;
        }
      }

      filtered[id] = card;
    });
    return filtered;
  }, [state.cards, searchQuery, filterLabels, showArchived]);

  // Prepare export data - flatten cards with column info
  const exportData: ExportableCard[] = useMemo(() => {
    const cards: ExportableCard[] = [];
    state.columns.forEach((column) => {
      column.cardIds.forEach((cardId) => {
        const card = state.cards[cardId];
        if (!card) return;

        // Get label names
        const labelNames = card.labels
          .map((labelId) => state.labels.find((l) => l.id === labelId)?.name)
          .filter(Boolean)
          .join(', ');

        cards.push({
          id: card.id,
          title: card.title,
          description: card.description,
          priority: card.priority.charAt(0).toUpperCase() + card.priority.slice(1),
          labels: labelNames,
          dueDate: card.dueDate || '',
          column: column.title,
          createdAt: card.createdAt,
          archived: card.archived ? 'Yes' : 'No',
        });
      });
    });
    return cards;
  }, [state.columns, state.cards, state.labels]);

  // Helper functions
  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCardCount = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return 0;
    return column.cardIds.filter((id) => filteredCards[id]).length;
  };

  // Column operations
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn: KanbanColumn = {
      id: generateId(),
      title: newColumnTitle.trim(),
      color: newColumnColor,
      cardIds: [],
    };
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
    setNewColumnTitle('');
    setNewColumnColor(COLUMN_COLORS[0]);
    setShowAddColumn(false);
  };

  const startEditColumn = (column: KanbanColumn) => {
    setEditingColumn(column.id);
    setEditColumnTitle(column.title);
    setEditColumnColor(column.color);
    setShowColumnMenu(null);
  };

  const saveColumnEdit = (columnId: string) => {
    if (!editColumnTitle.trim()) return;
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId
          ? { ...c, title: editColumnTitle.trim(), color: editColumnColor }
          : c
      ),
    }));
    setEditingColumn(null);
  };

  const deleteColumn = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;

    const newCards = { ...state.cards };
    column.cardIds.forEach((id) => delete newCards[id]);

    setState((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== columnId),
      cards: newCards,
    }));
    setShowColumnMenu(null);
  };

  // Card operations
  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    const cardId = generateId();
    const newCard: KanbanCard = {
      id: cardId,
      title: newCardTitle.trim(),
      description: newCardDescription.trim(),
      priority: newCardPriority,
      labels: newCardLabels,
      dueDate: newCardDueDate || null,
      createdAt: new Date().toISOString(),
      archived: false,
    };

    setState((prev) => ({
      ...prev,
      cards: { ...prev.cards, [cardId]: newCard },
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, cardIds: [...c.cardIds, cardId] } : c
      ),
    }));

    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPriority('medium');
    setNewCardLabels([]);
    setNewCardDueDate('');
    setShowAddCard(null);
  };

  const startEditCard = (card: KanbanCard) => {
    setEditingCard(card.id);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description);
    setEditCardPriority(card.priority);
    setEditCardLabels(card.labels);
    setEditCardDueDate(card.dueDate || '');
  };

  const saveCardEdit = (cardId: string) => {
    if (!editCardTitle.trim()) return;
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: {
          ...prev.cards[cardId],
          title: editCardTitle.trim(),
          description: editCardDescription.trim(),
          priority: editCardPriority,
          labels: editCardLabels,
          dueDate: editCardDueDate || null,
        },
      },
    }));
    setEditingCard(null);
  };

  const deleteCard = (cardId: string) => {
    const newCards = { ...state.cards };
    delete newCards[cardId];

    setState((prev) => ({
      ...prev,
      cards: newCards,
      columns: prev.columns.map((c) => ({
        ...c,
        cardIds: c.cardIds.filter((id) => id !== cardId),
      })),
    }));
    setEditingCard(null);
  };

  const archiveCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: { ...prev.cards[cardId], archived: true },
      },
    }));
  };

  const restoreCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: { ...prev.cards[cardId], archived: false },
      },
    }));
  };

  const moveCard = (cardId: string, direction: 'left' | 'right') => {
    const currentColumnIndex = state.columns.findIndex((c) =>
      c.cardIds.includes(cardId)
    );
    if (currentColumnIndex === -1) return;

    const targetColumnIndex =
      direction === 'left' ? currentColumnIndex - 1 : currentColumnIndex + 1;
    if (targetColumnIndex < 0 || targetColumnIndex >= state.columns.length)
      return;

    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c, i) => {
        if (i === currentColumnIndex) {
          return { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) };
        }
        if (i === targetColumnIndex) {
          return { ...c, cardIds: [...c.cardIds, cardId] };
        }
        return c;
      }),
    }));
  };

  // Label operations
  const addLabel = () => {
    if (!newLabelName.trim()) return;
    const newLabel: Label = {
      id: generateId(),
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    setState((prev) => ({
      ...prev,
      labels: [...prev.labels, newLabel],
    }));
    setNewLabelName('');
    setNewLabelColor('#3B82F6');
  };

  const deleteLabel = (labelId: string) => {
    setState((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l.id !== labelId),
      cards: Object.fromEntries(
        Object.entries(prev.cards).map(([id, card]) => [
          id,
          { ...card, labels: card.labels.filter((l) => l !== labelId) },
        ])
      ),
    }));
  };

  const getLabelById = (labelId: string) =>
    state.labels.find((l) => l.id === labelId);

  return (
    <div
      className={`min-h-[600px] p-6 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2
            className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('tools.kanbanBoard.kanbanBoard', 'Kanban Board')}
          </h2>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.kanbanBoard.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
        <WidgetEmbedButton toolSlug="kanban-board" toolName="Kanban Board" />

        <SyncStatus
          isSynced={isSynced}
          isSaving={isSaving}
          lastSaved={lastSaved}
          syncError={syncError}
          onForceSync={forceSync}
          theme={isDark ? 'dark' : 'light'}
          showLabel={true}
          size="sm"
        />
        <div className="flex items-center gap-2">
          <ExportDropdown
            onExportCSV={() => exportCSV()}
            onExportExcel={() => exportExcel()}
            onExportJSON={() => exportJSON()}
            onExportPDF={() => exportPDF()}
            onPrint={() => printHook('Kanban Board')}
            onCopyToClipboard={() => copyToClipboardHook()}
            disabled={exportData.length === 0}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
          <button
            onClick={() => setShowLabelManager(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={t('tools.kanbanBoard.manageLabels2', 'Manage Labels')}
          >
            <Tag className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`p-2 rounded-lg transition-colors ${
              showArchived
                ? 'bg-[#0D9488] text-white'
                : isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={showArchived ? t('tools.kanbanBoard.showActiveCards', 'Show Active Cards') : t('tools.kanbanBoard.showArchivedCards', 'Show Archived Cards')}
          >
            <Archive className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
          <input
            type="text"
            placeholder={t('tools.kanbanBoard.searchCards', 'Search cards...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {state.labels.map((label) => (
            <button
              key={label.id}
              onClick={() =>
                setFilterLabels((prev) =>
                  prev.includes(label.id)
                    ? prev.filter((l) => l !== label.id)
                    : [...prev, label.id]
                )
              }
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                filterLabels.includes(label.id)
                  ? t('tools.kanbanBoard.ring2RingOffset2', 'ring-2 ring-offset-2 ring-[#0D9488]') : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
                borderColor: label.color,
              }}
            >
              {label.name}
            </button>
          ))}
          {filterLabels.length > 0 && (
            <button
              onClick={() => setFilterLabels([])}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.kanbanBoard.clear', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {state.columns.map((column, columnIndex) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-72 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            {/* Column Header */}
            <div
              className="p-3 rounded-t-lg flex items-center justify-between"
              style={{ borderTop: `3px solid ${column.color}` }}
            >
              {editingColumn === column.id ? (
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={editColumnTitle}
                    onChange={(e) => setEditColumnTitle(e.target.value)}
                    className={`w-full px-2 py-1 rounded border ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {COLUMN_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditColumnColor(color)}
                        className={`w-5 h-5 rounded-full ${
                          editColumnColor === color
                            ? 'ring-2 ring-offset-1 ring-[#0D9488]'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveColumnEdit(column.id)}
                      className="flex-1 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0F766E]"
                    >
                      {t('tools.kanbanBoard.save', 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingColumn(null)}
                      className={`flex-1 py-1 rounded text-sm ${
                        isDark
                          ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.kanbanBoard.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {column.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isDark
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {getCardCount(column.id)}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowColumnMenu(
                          showColumnMenu === column.id ? null : column.id
                        )
                      }
                      className={`p-1 rounded hover:bg-opacity-20 ${
                        isDark ? 'hover:bg-white' : 'hover:bg-gray-400'
                      }`}
                    >
                      <MoreVertical
                        className={`w-4 h-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      />
                    </button>
                    {showColumnMenu === column.id && (
                      <div
                        className={`absolute right-0 top-full mt-1 w-36 rounded-lg shadow-lg z-10 ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <button
                          onClick={() => startEditColumn(column)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                            isDark
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                          {t('tools.kanbanBoard.rename', 'Rename')}
                        </button>
                        <button
                          onClick={() => deleteColumn(column.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {column.cardIds
                .filter((id) => filteredCards[id])
                .map((cardId) => {
                  const card = filteredCards[cardId];
                  if (!card) return null;

                  if (editingCard === cardId) {
                    return (
                      <div
                        key={cardId}
                        className={`p-3 rounded-lg space-y-2 ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        } shadow`}
                      >
                        <input
                          type="text"
                          value={editCardTitle}
                          onChange={(e) => setEditCardTitle(e.target.value)}
                          placeholder={t('tools.kanbanBoard.cardTitle', 'Card title')}
                          className={`w-full px-2 py-1 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-700 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          autoFocus
                        />
                        <textarea
                          value={editCardDescription}
                          onChange={(e) => setEditCardDescription(e.target.value)}
                          placeholder={t('tools.kanbanBoard.description', 'Description')}
                          rows={2}
                          className={`w-full px-2 py-1 rounded border text-sm resize-none ${
                            isDark
                              ? 'bg-gray-700 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <div className="flex gap-1">
                          {(['low', 'medium', 'high'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setEditCardPriority(p)}
                              className={`flex-1 py-1 rounded text-xs font-medium capitalize ${
                                editCardPriority === p
                                  ? 'ring-2 ring-offset-1 ring-[#0D9488]'
                                  : ''
                              }`}
                              style={{
                                backgroundColor: PRIORITY_COLORS[p].bg,
                                color: PRIORITY_COLORS[p].text,
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {state.labels.map((label) => (
                            <button
                              key={label.id}
                              onClick={() =>
                                setEditCardLabels((prev) =>
                                  prev.includes(label.id)
                                    ? prev.filter((l) => l !== label.id)
                                    : [...prev, label.id]
                                )
                              }
                              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                                editCardLabels.includes(label.id)
                                  ? t('tools.kanbanBoard.ring1RingOffset1', 'ring-1 ring-offset-1 ring-[#0D9488]') : 'opacity-50'
                              }`}
                              style={{
                                backgroundColor: label.color + '20',
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </button>
                          ))}
                        </div>
                        <input
                          type="date"
                          value={editCardDueDate}
                          onChange={(e) => setEditCardDueDate(e.target.value)}
                          className={`w-full px-2 py-1 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-700 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveCardEdit(cardId)}
                            className="flex-1 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0F766E]"
                          >
                            {t('tools.kanbanBoard.save2', 'Save')}
                          </button>
                          <button
                            onClick={() => deleteCard(cardId)}
                            className="py-1 px-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCard(null)}
                            className={`flex-1 py-1 rounded text-sm ${
                              isDark
                                ? 'bg-gray-500 text-gray-200 hover:bg-gray-400'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {t('tools.kanbanBoard.cancel2', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const priorityStyle = PRIORITY_COLORS[card.priority];
                  const overdue = isOverdue(card.dueDate);

                  return (
                    <div
                      key={cardId}
                      className={`p-3 rounded-lg shadow transition-all hover:shadow-md cursor-pointer ${
                        isDark ? 'bg-gray-600' : 'bg-white'
                      }`}
                      style={{
                        borderLeft: `3px solid ${priorityStyle.border}`,
                      }}
                      onClick={() => startEditCard(card)}
                    >
                      {/* Labels */}
                      {card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.labels.map((labelId) => {
                            const label = getLabelById(labelId);
                            if (!label) return null;
                            return (
                              <span
                                key={labelId}
                                className="px-1.5 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: label.color + '20',
                                  color: label.color,
                                }}
                              >
                                {label.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Title */}
                      <h4
                        className={`font-medium text-sm mb-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {card.title}
                      </h4>

                      {/* Description */}
                      {card.description && (
                        <p
                          className={`text-xs mb-2 line-clamp-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {card.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Due Date */}
                          {card.dueDate && (
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                overdue
                                  ? 'text-red-500'
                                  : isDark
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              {overdue && <AlertCircle className="w-3 h-3" />}
                              <Calendar className="w-3 h-3" />
                              {formatDate(card.dueDate)}
                            </span>
                          )}
                        </div>

                        {/* Move buttons */}
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {columnIndex > 0 && (
                            <button
                              onClick={() => moveCard(cardId, 'left')}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDark ? 'hover:bg-white' : 'hover:bg-gray-400'
                              }`}
                              title={t('tools.kanbanBoard.moveLeft', 'Move left')}
                            >
                              <ChevronLeft
                                className={`w-4 h-4 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              />
                            </button>
                          )}
                          {columnIndex < state.columns.length - 1 && (
                            <button
                              onClick={() => moveCard(cardId, 'right')}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDark ? 'hover:bg-white' : 'hover:bg-gray-400'
                              }`}
                              title={t('tools.kanbanBoard.moveRight', 'Move right')}
                            >
                              <ChevronRight
                                className={`w-4 h-4 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              />
                            </button>
                          )}
                          {!showArchived && (
                            <button
                              onClick={() => archiveCard(cardId)}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDark ? 'hover:bg-white' : 'hover:bg-gray-400'
                              }`}
                              title={t('tools.kanbanBoard.archive', 'Archive')}
                            >
                              <Archive
                                className={`w-4 h-4 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              />
                            </button>
                          )}
                          {showArchived && (
                            <button
                              onClick={() => restoreCard(cardId)}
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                isDark ? 'hover:bg-white' : 'hover:bg-gray-400'
                              }`}
                              title={t('tools.kanbanBoard.restore', 'Restore')}
                            >
                              <Check
                                className={`w-4 h-4 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Add Card Form */}
              {showAddCard === column.id ? (
                <div
                  className={`p-3 rounded-lg space-y-2 ${
                    isDark ? 'bg-gray-600' : 'bg-white'
                  } shadow`}
                >
                  <input
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder={t('tools.kanbanBoard.cardTitle2', 'Card title')}
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    autoFocus
                  />
                  <textarea
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    placeholder={t('tools.kanbanBoard.descriptionOptional', 'Description (optional)')}
                    rows={2}
                    className={`w-full px-2 py-1 rounded border text-sm resize-none ${
                      isDark
                        ? 'bg-gray-700 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="flex gap-1">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewCardPriority(p)}
                        className={`flex-1 py-1 rounded text-xs font-medium capitalize ${
                          newCardPriority === p
                            ? 'ring-2 ring-offset-1 ring-[#0D9488]'
                            : ''
                        }`}
                        style={{
                          backgroundColor: PRIORITY_COLORS[p].bg,
                          color: PRIORITY_COLORS[p].text,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {state.labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() =>
                          setNewCardLabels((prev) =>
                            prev.includes(label.id)
                              ? prev.filter((l) => l !== label.id)
                              : [...prev, label.id]
                          )
                        }
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                          newCardLabels.includes(label.id)
                            ? t('tools.kanbanBoard.ring1RingOffset12', 'ring-1 ring-offset-1 ring-[#0D9488]') : 'opacity-50'
                        }`}
                        style={{
                          backgroundColor: label.color + '20',
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="date"
                    value={newCardDueDate}
                    onChange={(e) => setNewCardDueDate(e.target.value)}
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => addCard(column.id)}
                      className="flex-1 py-1 bg-[#0D9488] text-white rounded text-sm hover:bg-[#0F766E]"
                    >
                      {t('tools.kanbanBoard.addCard', 'Add Card')}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCard(null);
                        setNewCardTitle('');
                        setNewCardDescription('');
                        setNewCardPriority('medium');
                        setNewCardLabels([]);
                        setNewCardDueDate('');
                      }}
                      className={`flex-1 py-1 rounded text-sm ${
                        isDark
                          ? 'bg-gray-500 text-gray-200 hover:bg-gray-400'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('tools.kanbanBoard.cancel3', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                !showArchived && (
                  <button
                    onClick={() => setShowAddCard(column.id)}
                    className={`w-full py-2 flex items-center justify-center gap-1 rounded-lg text-sm transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.kanbanBoard.addCard2', 'Add Card')}
                  </button>
                )
              )}
            </div>
          </div>
        ))}

        {/* Add Column */}
        {showAddColumn ? (
          <div
            className={`flex-shrink-0 w-72 p-3 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder={t('tools.kanbanBoard.columnTitle', 'Column title')}
              className={`w-full px-3 py-2 rounded border mb-2 ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            />
            <div className="flex flex-wrap gap-1 mb-3">
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColumnColor(color)}
                  className={`w-6 h-6 rounded-full ${
                    newColumnColor === color
                      ? 'ring-2 ring-offset-2 ring-[#0D9488]'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={addColumn}
                className="flex-1 py-2 bg-[#0D9488] text-white rounded-lg text-sm hover:bg-[#0F766E]"
              >
                {t('tools.kanbanBoard.addColumn', 'Add Column')}
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnTitle('');
                  setNewColumnColor(COLUMN_COLORS[0]);
                }}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  isDark
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.kanbanBoard.cancel4', 'Cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddColumn(true)}
            className={`flex-shrink-0 w-72 h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
              isDark
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('tools.kanbanBoard.addColumn2', 'Add Column')}
          </button>
        )}
      </div>

      {/* Label Manager Modal */}
      {showLabelManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.kanbanBoard.manageLabels', 'Manage Labels')}
              </h3>
              <button
                onClick={() => setShowLabelManager(false)}
                className={`p-1 rounded hover:bg-opacity-20 ${
                  isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-gray-400 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add new label */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder={t('tools.kanbanBoard.labelName', 'Label name')}
                className={`flex-1 px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <button
                onClick={addLabel}
                className="px-4 py-2 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
              >
                {t('tools.kanbanBoard.add', 'Add')}
              </button>
            </div>

            {/* Existing labels */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {state.labels.map((label) => (
                <div
                  key={label.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: label.color }}
                    />
                    <span
                      className={isDark ? 'text-gray-200' : 'text-gray-700'}
                    >
                      {label.name}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteLabel(label.id)}
                    className="p-1 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoardTool;
