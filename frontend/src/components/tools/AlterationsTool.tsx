import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, DollarSign, Clock, Plus, Trash2, Calculator, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface AlterationItem {
  id: string;
  type: string;
  description: string;
  price: number;
  estimatedMinutes: number;
}

const alterationTypes = [
  { type: 'Hem Pants', basePrice: 15, minutes: 20 },
  { type: 'Hem Dress', basePrice: 20, minutes: 25 },
  { type: 'Take In Waist', basePrice: 25, minutes: 30 },
  { type: 'Let Out Waist', basePrice: 30, minutes: 35 },
  { type: 'Shorten Sleeves', basePrice: 18, minutes: 20 },
  { type: 'Replace Zipper', basePrice: 25, minutes: 30 },
  { type: 'Taper Pants', basePrice: 22, minutes: 25 },
  { type: 'Add Lining', basePrice: 35, minutes: 45 },
  { type: 'Repair Seam', basePrice: 12, minutes: 15 },
  { type: 'Patch Hole', basePrice: 15, minutes: 20 },
];

const COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Alteration Type', type: 'string' },
  { key: 'description', header: 'Description', type: 'string' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'estimatedMinutes', header: 'Est. Time (min)', type: 'number' },
];

interface AlterationsToolProps {
  uiConfig?: UIConfig;
}

export const AlterationsTool: React.FC<AlterationsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Use the useToolData hook for backend persistence
  const {
    data: items,
    addItem: addItemToData,
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
  } = useToolData<AlterationItem>('alterations-calculator', [], COLUMNS);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      // Handle gallery editing - restore all saved form fields
      if (params.isEditFromGallery) {
        if (params.selectedType) setSelectedType(params.selectedType);
        if (params.description) setDescription(params.description);
        if (params.customPrice) setCustomPrice(params.customPrice);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else if (params.text || params.content || params.type) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const handleAddItem = () => {
    const alterationType = alterationTypes.find(a => a.type === selectedType);
    if (!alterationType) return;

    const newItem: AlterationItem = {
      id: Date.now().toString(),
      type: selectedType,
      description: description || selectedType,
      price: customPrice ? parseFloat(customPrice) : alterationType.basePrice,
      estimatedMinutes: alterationType.minutes,
    };

    addItemToData(newItem);

    // Call onSaveCallback if this is a gallery edit
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback({
        toolId: 'alterations',
        selectedType,
        description,
        customPrice,
        type: selectedType,
        price: customPrice ? parseFloat(customPrice) : alterationType.basePrice,
        estimatedMinutes: alterationType.minutes,
      });
    }

    setSelectedType('');
    setDescription('');
    setCustomPrice('');
  };

  const removeItem = (id: string) => {
    deleteItem(id);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalMinutes = items.reduce((sum, item) => sum + item.estimatedMinutes, 0);

  const inputClass = `w-full p-3 rounded-lg border ${
    isDark
      ? 'bg-[#1a1a1a] border-[#333] text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`;

  const cardClass = `p-4 rounded-lg ${
    isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'
  }`;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] mb-4">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.alterations.alterationsCalculator', 'Alterations Calculator')}
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {t('tools.alterations.calculateAlterationCostsAndTime', 'Calculate alteration costs and time estimates')}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <WidgetEmbedButton toolSlug="alterations" toolName="Alterations" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
          {items.length > 0 && (
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'alterations' })}
              onExportExcel={() => exportExcel({ filename: 'alterations' })}
              onExportJSON={() => exportJSON({ filename: 'alterations' })}
              onExportPDF={() => exportPDF({
                filename: 'alterations',
                title: 'Alterations Calculator',
                subtitle: `Total: $${totalPrice.toFixed(2)} | Est. Time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
              })}
              onPrint={() => print('Alterations Calculator')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.alterations.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
        </div>
      )}

      <div className={cardClass}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.alterations.addAlteration', 'Add Alteration')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('tools.alterations.selectAlterationType', 'Select alteration type')}</option>
            {alterationTypes.map(alt => (
              <option key={alt.type} value={alt.type}>
                {alt.type} (${alt.basePrice})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder={t('tools.alterations.descriptionOptional', 'Description (optional)')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder={t('tools.alterations.customPriceOptional', 'Custom price (optional)')}
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={handleAddItem}
            disabled={!selectedType}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B8276] transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {t('tools.alterations.addItem', 'Add Item')}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.alterations.alterationItems', 'Alteration Items')}
          </h3>
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-[#252525]' : 'bg-white'
                }`}
              >
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.type}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.description} • {item.estimatedMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0D9488]">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-[#0D9488]/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#0D9488]" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.alterations.totalCost', 'Total Cost')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.alterations.estimatedTime', 'Estimated Time')}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlterationsTool;
