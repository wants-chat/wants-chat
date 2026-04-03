import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, User, Calendar, DollarSign, Lightbulb, Trash2, Plus, Check, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface GiftBudgetPlannerToolProps {
  uiConfig?: UIConfig;
}

type Occasion = 'birthday' | 'christmas' | 'anniversary' | 'valentines' | 'mothersday' | 'fathersday' | 'graduation' | 'wedding' | 'other';

interface Recipient {
  id: string;
  name: string;
  occasion: Occasion;
  occasionDate: string;
  budget: number;
  spent: number;
  giftIdea: string;
  purchased: boolean;
}

interface OccasionConfig {
  name: string;
  icon: string;
  color: string;
}

interface GiftIdea {
  name: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
}

// Occasions config (outside component for COLUMNS access)
const occasions: Record<Occasion, OccasionConfig> = {
  birthday: { name: 'Birthday', icon: '🎂', color: 'pink' },
  christmas: { name: 'Christmas', icon: '🎄', color: 'green' },
  anniversary: { name: 'Anniversary', icon: '💍', color: 'purple' },
  valentines: { name: "Valentine's Day", icon: '❤️', color: 'red' },
  mothersday: { name: "Mother's Day", icon: '💐', color: 'pink' },
  fathersday: { name: "Father's Day", icon: '👔', color: 'blue' },
  graduation: { name: 'Graduation', icon: '🎓', color: 'yellow' },
  wedding: { name: 'Wedding', icon: '💒', color: 'white' },
  other: { name: 'Other', icon: '🎁', color: 'gray' },
};

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Recipient Name', type: 'string' },
  { key: 'occasion', header: 'Occasion', type: 'string', format: (v) => occasions[v as Occasion]?.name || v },
  { key: 'occasionDate', header: 'Date', type: 'date' },
  { key: 'budget', header: 'Budget', type: 'currency' },
  { key: 'spent', header: 'Spent', type: 'currency' },
  { key: 'giftIdea', header: 'Gift Idea', type: 'string' },
  { key: 'purchased', header: 'Purchased', type: 'boolean' },
];

export const GiftBudgetPlannerTool: React.FC<GiftBudgetPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: recipients,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Recipient>('gift-budget-planner', [], COLUMNS);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<Occasion | 'all'>('all');

  // New recipient form state
  const [newName, setNewName] = useState('');
  const [newOccasion, setNewOccasion] = useState<Occasion>('birthday');
  const [newDate, setNewDate] = useState('');
  const [newBudget, setNewBudget] = useState('50');
  const [newGiftIdea, setNewGiftIdea] = useState('');


  const giftIdeas: GiftIdea[] = [
    { name: 'Handwritten card', priceRange: 'Under $10', minPrice: 0, maxPrice: 10 },
    { name: 'Candles or diffusers', priceRange: 'Under $10', minPrice: 0, maxPrice: 10 },
    { name: 'Chocolates or sweets', priceRange: 'Under $10', minPrice: 0, maxPrice: 10 },
    { name: 'Book by favorite author', priceRange: '$10-$25', minPrice: 10, maxPrice: 25 },
    { name: 'Plant or succulent', priceRange: '$10-$25', minPrice: 10, maxPrice: 25 },
    { name: 'Personalized mug', priceRange: '$10-$25', minPrice: 10, maxPrice: 25 },
    { name: 'Cozy blanket', priceRange: '$25-$50', minPrice: 25, maxPrice: 50 },
    { name: 'Bluetooth speaker', priceRange: '$25-$50', minPrice: 25, maxPrice: 50 },
    { name: 'Subscription box (1 month)', priceRange: '$25-$50', minPrice: 25, maxPrice: 50 },
    { name: 'Quality headphones', priceRange: '$50-$100', minPrice: 50, maxPrice: 100 },
    { name: 'Smartwatch', priceRange: '$50-$100', minPrice: 50, maxPrice: 100 },
    { name: 'Spa gift set', priceRange: '$50-$100', minPrice: 50, maxPrice: 100 },
    { name: 'Designer wallet', priceRange: '$100-$200', minPrice: 100, maxPrice: 200 },
    { name: 'Weekend getaway', priceRange: '$100-$200', minPrice: 100, maxPrice: 200 },
    { name: 'High-end perfume', priceRange: '$100-$200', minPrice: 100, maxPrice: 200 },
    { name: 'Jewelry piece', priceRange: '$200+', minPrice: 200, maxPrice: Infinity },
    { name: 'Tech gadget', priceRange: '$200+', minPrice: 200, maxPrice: Infinity },
    { name: 'Experience gift (concert, etc.)', priceRange: '$200+', minPrice: 200, maxPrice: Infinity },
  ];

  const priceRanges = ['all', 'Under $10', '$10-$25', '$25-$50', '$50-$100', '$100-$200', '$200+'];

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.occasion && ['birthday', 'christmas', 'anniversary', 'valentines', 'mothersday', 'fathersday', 'graduation', 'wedding', 'other'].includes(params.occasion)) {
        setNewOccasion(params.occasion as Occasion);
        setFilterOccasion(params.occasion as Occasion);
        hasChanges = true;
      }
      if (params.budget !== undefined) {
        setNewBudget(String(params.budget));
        hasChanges = true;
      }
      if (params.priceRange && priceRanges.includes(params.priceRange)) {
        setSelectedPriceRange(params.priceRange);
        hasChanges = true;
      }
      if (params.recipientName) {
        setNewName(params.recipientName);
        setShowAddForm(true);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const filteredGiftIdeas = useMemo(() => {
    if (selectedPriceRange === 'all') return giftIdeas;
    return giftIdeas.filter((idea) => idea.priceRange === selectedPriceRange);
  }, [selectedPriceRange]);

  const filteredRecipients = useMemo(() => {
    if (filterOccasion === 'all') return recipients;
    return recipients.filter((r) => r.occasion === filterOccasion);
  }, [recipients, filterOccasion]);

  const budgetSummary = useMemo(() => {
    const totalBudget = recipients.reduce((sum, r) => sum + r.budget, 0);
    const totalSpent = recipients.reduce((sum, r) => sum + r.spent, 0);
    const remaining = totalBudget - totalSpent;
    const purchasedCount = recipients.filter((r) => r.purchased).length;
    const upcomingCount = recipients.filter((r) => {
      const occasionDate = new Date(r.occasionDate);
      const today = new Date();
      const daysUntil = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    }).length;

    return { totalBudget, totalSpent, remaining, purchasedCount, upcomingCount, totalRecipients: recipients.length };
  }, [recipients]);

  const addRecipient = () => {
    if (!newName.trim() || !newDate) return;

    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: newName.trim(),
      occasion: newOccasion,
      occasionDate: newDate,
      budget: parseFloat(newBudget) || 50,
      spent: 0,
      giftIdea: newGiftIdea.trim(),
      purchased: false,
    };

    addItem(newRecipient);
    setNewName('');
    setNewOccasion('birthday');
    setNewDate('');
    setNewBudget('50');
    setNewGiftIdea('');
    setShowAddForm(false);
  };

  const removeRecipient = (id: string) => {
    deleteItem(id);
  };

  const togglePurchased = (id: string) => {
    const recipient = recipients.find((r) => r.id === id);
    if (recipient) {
      updateItem(id, {
        purchased: !recipient.purchased,
        spent: !recipient.purchased ? recipient.budget : 0,
      });
    }
  };

  const updateSpent = (id: string, spent: number) => {
    updateItem(id, { spent });
  };

  const getDaysUntil = (dateStr: string) => {
    const occasionDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    occasionDate.setHours(0, 0, 0, 0);
    return Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Gift className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.giftBudgetPlanner.giftBudgetPlanner', 'Gift Budget Planner')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.giftBudgetPlanner.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.giftBudgetPlanner.planAndTrackYourGift', 'Plan and track your gift spending')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="gift-budget-planner" toolName="Gift Budget Planner" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'gift-budget-planner' })}
              onExportExcel={() => exportExcel({ filename: 'gift-budget-planner' })}
              onExportJSON={() => exportJSON({ filename: 'gift-budget-planner' })}
              onExportPDF={() => exportPDF({ filename: 'gift-budget-planner', title: 'Gift Budget Planner' })}
              onPrint={() => print('Gift Budget Planner')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Budget Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.giftBudgetPlanner.totalBudget', 'Total Budget')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">${budgetSummary.totalBudget.toFixed(2)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-pink-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.giftBudgetPlanner.spent', 'Spent')}</span>
            </div>
            <div className="text-2xl font-bold text-pink-500">${budgetSummary.totalSpent.toFixed(2)}</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.giftBudgetPlanner.remaining', 'Remaining')}</span>
            </div>
            <div className={`text-2xl font-bold ${budgetSummary.remaining >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              ${budgetSummary.remaining.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.giftBudgetPlanner.purchased', 'Purchased')}</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {budgetSummary.purchasedCount}/{budgetSummary.totalRecipients}
            </div>
          </div>
        </div>

        {/* Upcoming Alert */}
        {budgetSummary.upcomingCount > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <span className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {budgetSummary.upcomingCount} occasion{budgetSummary.upcomingCount > 1 ? 's' : ''} coming up in the next 30 days!
              </span>
            </div>
          </div>
        )}

        {/* Filter by Occasion */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.giftBudgetPlanner.filterByOccasion', 'Filter by Occasion')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterOccasion('all')}
              className={`py-1.5 px-3 rounded-lg text-sm ${filterOccasion === 'all' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.giftBudgetPlanner.all', 'All')}
            </button>
            {(Object.keys(occasions) as Occasion[]).map((occ) => (
              <button
                key={occ}
                onClick={() => setFilterOccasion(occ)}
                className={`py-1.5 px-3 rounded-lg text-sm ${filterOccasion === occ ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {occasions[occ].icon} {occasions[occ].name}
              </button>
            ))}
          </div>
        </div>

        {/* Add Recipient Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-lg bg-pink-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('tools.giftBudgetPlanner.addRecipient', 'Add Recipient')}
          </button>
        )}

        {/* Add Recipient Form */}
        {showAddForm && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border space-y-4`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.giftBudgetPlanner.addNewRecipient', 'Add New Recipient')}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <User className="w-4 h-4 inline mr-1" />
                  {t('tools.giftBudgetPlanner.recipientName', 'Recipient Name')}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('tools.giftBudgetPlanner.enterName', 'Enter name')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.giftBudgetPlanner.occasion', 'Occasion')}
                </label>
                <select
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value as Occasion)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {(Object.keys(occasions) as Occasion[]).map((occ) => (
                    <option key={occ} value={occ}>
                      {occasions[occ].icon} {occasions[occ].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.giftBudgetPlanner.date', 'Date')}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.giftBudgetPlanner.budget', 'Budget ($)')}
                </label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="50"
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Lightbulb className="w-4 h-4 inline mr-1" />
                {t('tools.giftBudgetPlanner.giftIdeaOptional', 'Gift Idea (optional)')}
              </label>
              <input
                type="text"
                value={newGiftIdea}
                onChange={(e) => setNewGiftIdea(e.target.value)}
                placeholder={t('tools.giftBudgetPlanner.whatAreYouThinkingOf', 'What are you thinking of getting them?')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addRecipient}
                className="flex-1 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
              >
                {t('tools.giftBudgetPlanner.addRecipient2', 'Add Recipient')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} font-medium`}
              >
                {t('tools.giftBudgetPlanner.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Recipients List */}
        {filteredRecipients.length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recipients ({filteredRecipients.length})
            </h4>
            {filteredRecipients.map((recipient) => {
              const daysUntil = getDaysUntil(recipient.occasionDate);
              const isOverdue = daysUntil < 0;
              const isUrgent = daysUntil >= 0 && daysUntil <= 7;
              const progressPercent = Math.min((recipient.spent / recipient.budget) * 100, 100);

              return (
                <div
                  key={recipient.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${recipient.purchased ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePurchased(recipient.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          recipient.purchased
                            ? 'bg-green-500 border-green-500 text-white'
                            : isDark
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }`}
                      >
                        {recipient.purchased && <Check className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${recipient.purchased ? 'line-through' : ''}`}>
                          {recipient.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {occasions[recipient.occasion].icon} {occasions[recipient.occasion].name} - {formatDate(recipient.occasionDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isOverdue
                            ? 'bg-red-500/20 text-red-500'
                            : isUrgent
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-green-500/20 text-green-500'
                        }`}
                      >
                        {isOverdue ? `${Math.abs(daysUntil)} days ago` : daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                      </span>
                      <button
                        onClick={() => removeRecipient(recipient.id)}
                        className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {recipient.giftIdea && (
                    <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-500" />
                      {recipient.giftIdea}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          ${recipient.spent.toFixed(2)} / ${recipient.budget.toFixed(2)}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progressPercent > 100 ? 'bg-red-500' : 'bg-pink-500'
                          }`}
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                    {!recipient.purchased && (
                      <input
                        type="number"
                        value={recipient.spent || ''}
                        onChange={(e) => updateSpent(recipient.id, parseFloat(e.target.value) || 0)}
                        placeholder={t('tools.giftBudgetPlanner.spent2', 'Spent')}
                        className={`w-24 px-2 py-1 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {recipients.length === 0 && !showAddForm && (
          <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Gift className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No recipients added yet. Click &quot;Add Recipient&quot; to get started!
            </p>
          </div>
        )}

        {/* Gift Ideas Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Lightbulb className="w-4 h-4 inline mr-2 text-yellow-500" />
              {t('tools.giftBudgetPlanner.giftIdeasByPriceRange', 'Gift Ideas by Price Range')}
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedPriceRange(range)}
                className={`py-1.5 px-3 rounded-lg text-sm ${selectedPriceRange === range ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {range === 'all' ? 'All Prices' : range}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGiftIdeas.map((idea, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-between`}
              >
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{idea.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>
                  {idea.priceRange}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Lightbulb className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.giftBudgetPlanner.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Set budgets early to avoid last-minute overspending</li>
                <li>• Track spending as you go to stay on budget</li>
                <li>• Consider group gifts for expensive items</li>
                <li>• Keep gift ideas noted so you&apos;re prepared</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftBudgetPlannerTool;
