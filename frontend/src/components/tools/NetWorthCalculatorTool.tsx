import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank, Plus, Trash2, Copy, Check, TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'cash' | 'investments' | 'property' | 'vehicle' | 'other';
}

interface Liability {
  id: string;
  name: string;
  value: number;
  category: 'mortgage' | 'loan' | 'credit' | 'other';
}

interface NetWorthCalculatorToolProps {
  uiConfig?: UIConfig;
}

const ASSET_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Asset Name', type: 'string' },
  { key: 'value', header: 'Value', type: 'currency' },
  { key: 'category', header: 'Category', type: 'string' },
];

const LIABILITY_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Liability Name', type: 'string' },
  { key: 'value', header: 'Value', type: 'currency' },
  { key: 'category', header: 'Category', type: 'string' },
];

const COMBINED_COLUMNS: ColumnConfig[] = [
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'value', header: 'Value', type: 'currency' },
  { key: 'category', header: 'Category', type: 'string' },
];

export const NetWorthCalculatorTool: React.FC<NetWorthCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for assets with backend persistence
  const {
    data: assets,
    setData: setAssets,
    addItem: addAssetItem,
    updateItem: updateAssetItem,
    deleteItem: deleteAssetItem,
    exportCSV: exportAssetsCSV,
    exportExcel: exportAssetsExcel,
    exportJSON: exportAssetsJSON,
    exportPDF: exportAssetsPDF,
    importCSV: importAssetsCSV,
    importJSON: importAssetsJSON,
    copyToClipboard: copyAssetsToClipboard,
    print: printAssets,
    isLoading: isAssetsLoading,
    isSaving: isAssetsSaving,
    isSynced: isAssetsSynced,
    lastSaved: assetsLastSaved,
    syncError: assetsSyncError,
    forceSync: forceAssetsSync,
  } = useToolData<Asset>('net-worth-assets', [], ASSET_COLUMNS);

  // Use the useToolData hook for liabilities with backend persistence
  const {
    data: liabilities,
    setData: setLiabilities,
    addItem: addLiabilityItem,
    updateItem: updateLiabilityItem,
    deleteItem: deleteLiabilityItem,
    exportCSV: exportLiabilitiesCSV,
    exportExcel: exportLiabilitiesExcel,
    exportJSON: exportLiabilitiesJSON,
    exportPDF: exportLiabilitiesPDF,
    importCSV: importLiabilitiesCSV,
    importJSON: importLiabilitiesJSON,
    copyToClipboard: copyLiabilitiesToClipboard,
    print: printLiabilities,
    isLoading: isLiabilitiesLoading,
    isSaving: isLiabilitiesSaving,
    isSynced: isLiabilitiesSynced,
    lastSaved: liabilitiesLastSaved,
    syncError: liabilitiesSyncError,
    forceSync: forceLiabilitiesSync,
  } = useToolData<Liability>('net-worth-liabilities', [], LIABILITY_COLUMNS);

  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Combined sync status
  const isLoading = isAssetsLoading || isLiabilitiesLoading;
  const isSaving = isAssetsSaving || isLiabilitiesSaving;
  const isSynced = isAssetsSynced && isLiabilitiesSynced;
  const syncError = assetsSyncError || liabilitiesSyncError;
  const lastSaved = assetsLastSaved && liabilitiesLastSaved
    ? (new Date(assetsLastSaved) > new Date(liabilitiesLastSaved) ? assetsLastSaved : liabilitiesLastSaved)
    : assetsLastSaved || liabilitiesLastSaved;

  const forceSync = async () => {
    await Promise.all([forceAssetsSync(), forceLiabilitiesSync()]);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setAssets([{ id: '1', name: 'Asset', value: params.amount, category: 'other' }]);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        const newAssets = params.numbers.map((val, idx) => ({
          id: (idx + 1).toString(),
          name: `Asset ${idx + 1}`,
          value: val,
          category: 'other' as const,
        }));
        setAssets(newAssets);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    const assetsByCategory = assets.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.value;
      return acc;
    }, {} as Record<string, number>);

    return { totalAssets, totalLiabilities, netWorth, debtToAssetRatio, assetsByCategory };
  }, [assets, liabilities]);

  const addAsset = () => {
    addAssetItem({ id: Date.now().toString(), name: '', value: 0, category: 'cash' });
  };

  const addLiability = () => {
    addLiabilityItem({ id: Date.now().toString(), name: '', value: 0, category: 'other' });
  };

  const updateAsset = (id: string, field: keyof Asset, value: string | number) => {
    updateAssetItem(id, { [field]: value });
  };

  const updateLiability = (id: string, field: keyof Liability, value: string | number) => {
    updateLiabilityItem(id, { [field]: value });
  };

  const handleCopy = () => {
    const text = `Net Worth: $${calculations.netWorth.toLocaleString()}\nTotal Assets: $${calculations.totalAssets.toLocaleString()}\nTotal Liabilities: $${calculations.totalLiabilities.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  // Prepare export data - combine assets and liabilities with a type indicator
  const exportData = useMemo(() => {
    const assetData = assets.map(a => ({
      type: 'Asset',
      name: a.name,
      value: a.value,
      category: a.category.charAt(0).toUpperCase() + a.category.slice(1),
    }));
    const liabilityData = liabilities.map(l => ({
      type: 'Liability',
      name: l.name,
      value: l.value,
      category: l.category.charAt(0).toUpperCase() + l.category.slice(1),
    }));
    return [...assetData, ...liabilityData];
  }, [assets, liabilities]);

  // Export functions using the hook's export capabilities
  const handleExportCSV = () => {
    exportAssetsCSV({ filename: 'net-worth-assets' });
    exportLiabilitiesCSV({ filename: 'net-worth-liabilities' });
  };

  const handleExportExcel = () => {
    exportAssetsExcel({ filename: 'net-worth-assets' });
    exportLiabilitiesExcel({ filename: 'net-worth-liabilities' });
  };

  const handleExportJSON = () => {
    exportAssetsJSON({ filename: 'net-worth-assets' });
    exportLiabilitiesJSON({ filename: 'net-worth-liabilities' });
  };

  const handleExportPDF = async () => {
    const summary = `Net Worth: ${formatCurrency(calculations.netWorth)} | Total Assets: ${formatCurrency(calculations.totalAssets)} | Total Liabilities: ${formatCurrency(calculations.totalLiabilities)}`;
    await exportAssetsPDF({
      filename: 'net-worth-report',
      title: 'Net Worth Calculator - Assets',
      subtitle: summary,
    });
    await exportLiabilitiesPDF({
      filename: 'net-worth-liabilities',
      title: 'Net Worth Calculator - Liabilities',
      subtitle: summary,
    });
  };

  const handlePrint = () => {
    printAssets('Net Worth Calculator - Assets');
    printLiabilities('Net Worth Calculator - Liabilities');
  };

  const handleCopyToClipboard = async () => {
    await copyAssetsToClipboard('tab');
    await copyLiabilitiesToClipboard('tab');
    return true;
  };

  const handleImportCSV = async (file: File) => {
    // Import to assets by default (user can also import to liabilities separately)
    await importAssetsCSV(file);
  };

  const handleImportJSON = async (file: File) => {
    // Import to assets by default (user can also import to liabilities separately)
    await importAssetsJSON(file);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.netWorthCalculator.netWorthCalculator', 'Net Worth Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.netWorthCalculator.trackYourAssetsAndLiabilities', 'Track your assets and liabilities')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="net-worth-calculator" toolName="Net Worth Calculator" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              onImportCSV={handleImportCSV}
              onImportJSON={handleImportJSON}
              disabled={exportData.length === 0}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.netWorthCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Net Worth Display */}
        <div className={`p-6 rounded-xl text-center ${calculations.netWorth >= 0 ? (isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100')} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.netWorthCalculator.netWorth', 'Net Worth')}</div>
          <div className={`text-4xl font-bold my-2 ${calculations.netWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {calculations.netWorth >= 0 ? <TrendingUp className="w-8 h-8 inline mr-2" /> : <TrendingDown className="w-8 h-8 inline mr-2" />}
            {formatCurrency(calculations.netWorth)}
          </div>
          <button onClick={handleCopy} className={`mt-2 px-3 py-1 text-sm rounded-lg ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
            {copied ? t('tools.netWorthCalculator.copied', 'Copied!') : t('tools.netWorthCalculator.copy', 'Copy')}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className={`text-2xl font-bold text-green-500`}>{formatCurrency(calculations.totalAssets)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.netWorthCalculator.totalAssets', 'Total Assets')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <div className={`text-2xl font-bold text-red-500`}>{formatCurrency(calculations.totalLiabilities)}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.netWorthCalculator.totalLiabilities', 'Total Liabilities')}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.debtToAssetRatio.toFixed(1)}%</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.netWorthCalculator.debtToAsset', 'Debt-to-Asset')}</div>
          </div>
        </div>

        {/* Assets */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>{t('tools.netWorthCalculator.assets', 'Assets')}</h4>
          {assets.map((asset) => (
            <div key={asset.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} grid grid-cols-12 gap-2 items-center`}>
              <input type="text" value={asset.name} onChange={(e) => updateAsset(asset.id, 'name', e.target.value)} placeholder={t('tools.netWorthCalculator.assetName', 'Asset name')} className={`col-span-5 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <input type="number" value={asset.value} onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)} className={`col-span-4 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <select value={asset.category} onChange={(e) => updateAsset(asset.id, 'category', e.target.value)} className={`col-span-2 px-2 py-2 rounded-lg border text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="cash">{t('tools.netWorthCalculator.cash', 'Cash')}</option>
                <option value="investments">{t('tools.netWorthCalculator.investments', 'Investments')}</option>
                <option value="property">{t('tools.netWorthCalculator.property', 'Property')}</option>
                <option value="vehicle">{t('tools.netWorthCalculator.vehicle', 'Vehicle')}</option>
                <option value="other">{t('tools.netWorthCalculator.other', 'Other')}</option>
              </select>
              <button onClick={() => deleteAssetItem(asset.id)} className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addAsset} className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-green-800 text-green-400' : 'border-green-300 text-green-600'}`}><Plus className="w-4 h-4" /> {t('tools.netWorthCalculator.addAsset', 'Add Asset')}</button>
        </div>

        {/* Liabilities */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t('tools.netWorthCalculator.liabilities', 'Liabilities')}</h4>
          {liabilities.map((liability) => (
            <div key={liability.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} grid grid-cols-12 gap-2 items-center`}>
              <input type="text" value={liability.name} onChange={(e) => updateLiability(liability.id, 'name', e.target.value)} placeholder={t('tools.netWorthCalculator.liabilityName', 'Liability name')} className={`col-span-5 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <input type="number" value={liability.value} onChange={(e) => updateLiability(liability.id, 'value', parseFloat(e.target.value) || 0)} className={`col-span-4 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
              <select value={liability.category} onChange={(e) => updateLiability(liability.id, 'category', e.target.value)} className={`col-span-2 px-2 py-2 rounded-lg border text-xs ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="mortgage">{t('tools.netWorthCalculator.mortgage', 'Mortgage')}</option>
                <option value="loan">{t('tools.netWorthCalculator.loan', 'Loan')}</option>
                <option value="credit">{t('tools.netWorthCalculator.credit', 'Credit')}</option>
                <option value="other">{t('tools.netWorthCalculator.other2', 'Other')}</option>
              </select>
              <button onClick={() => deleteLiabilityItem(liability.id)} className={`col-span-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addLiability} className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-red-800 text-red-400' : 'border-red-300 text-red-600'}`}><Plus className="w-4 h-4" /> {t('tools.netWorthCalculator.addLiability', 'Add Liability')}</button>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCalculatorTool;
