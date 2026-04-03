'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Ruler,
  Layers,
  Settings,
  Save,
  RotateCcw,
  Copy,
  FileText,
  Sparkles,
  X,
  Edit2,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface MaterialCalculatorToolProps {
  uiConfig?: UIConfig;
}

// Types
type MaterialType = 'vinyl_banner' | 'vinyl_adhesive' | 'paper' | 'fabric' | 'foam_board' | 'acrylic' | 'aluminum' | 'coroplast' | 'pvc' | 'canvas';
type FinishType = 'none' | 'lamination_gloss' | 'lamination_matte' | 'uv_coating' | 'mounting';

interface MaterialSpec {
  type: MaterialType;
  name: string;
  costPerSqFt: number;
  rollWidth: number; // inches
  minOrder: number; // sq ft
  wasteFactor: number; // percentage
}

interface FinishSpec {
  type: FinishType;
  name: string;
  costPerSqFt: number;
}

interface MaterialEstimate {
  id: string;
  name: string;
  customerName: string;
  projectName: string;
  material: MaterialType;
  finish: FinishType;
  width: number;
  height: number;
  unit: 'inches' | 'feet';
  quantity: number;
  includeWaste: boolean;
  customWasteFactor: number | null;
  laborRate: number;
  laborHours: number;
  markup: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  material: MaterialType;
  finish: FinishType;
  width: number;
  height: number;
  unit: 'inches' | 'feet';
  markup: number;
  laborRate: number;
  createdAt: string;
}

// Constants
const MATERIALS: MaterialSpec[] = [
  { type: 'vinyl_banner', name: 'Vinyl Banner (13oz)', costPerSqFt: 0.45, rollWidth: 54, minOrder: 1, wasteFactor: 10 },
  { type: 'vinyl_adhesive', name: 'Adhesive Vinyl', costPerSqFt: 0.65, rollWidth: 54, minOrder: 1, wasteFactor: 15 },
  { type: 'paper', name: 'Paper (Poster)', costPerSqFt: 0.25, rollWidth: 42, minOrder: 1, wasteFactor: 5 },
  { type: 'fabric', name: 'Fabric (Dye-Sub)', costPerSqFt: 1.20, rollWidth: 120, minOrder: 1, wasteFactor: 10 },
  { type: 'foam_board', name: 'Foam Board (3/16")', costPerSqFt: 0.85, rollWidth: 48, minOrder: 1, wasteFactor: 20 },
  { type: 'acrylic', name: 'Acrylic (1/4")', costPerSqFt: 4.50, rollWidth: 48, minOrder: 1, wasteFactor: 15 },
  { type: 'aluminum', name: 'Aluminum Composite', costPerSqFt: 3.25, rollWidth: 48, minOrder: 1, wasteFactor: 15 },
  { type: 'coroplast', name: 'Coroplast (4mm)', costPerSqFt: 0.55, rollWidth: 48, minOrder: 1, wasteFactor: 10 },
  { type: 'pvc', name: 'PVC Board (3mm)', costPerSqFt: 1.10, rollWidth: 48, minOrder: 1, wasteFactor: 15 },
  { type: 'canvas', name: 'Canvas', costPerSqFt: 0.95, rollWidth: 60, minOrder: 1, wasteFactor: 8 },
];

const FINISHES: FinishSpec[] = [
  { type: 'none', name: 'No Finish', costPerSqFt: 0 },
  { type: 'lamination_gloss', name: 'Gloss Lamination', costPerSqFt: 0.35 },
  { type: 'lamination_matte', name: 'Matte Lamination', costPerSqFt: 0.35 },
  { type: 'uv_coating', name: 'UV Coating', costPerSqFt: 0.25 },
  { type: 'mounting', name: 'Mounting', costPerSqFt: 0.50 },
];

// Column configuration for exports
const ESTIMATE_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Estimate', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'projectName', header: 'Project', type: 'string' },
  { key: 'material', header: 'Material', type: 'string' },
  { key: 'width', header: 'Width', type: 'number' },
  { key: 'height', header: 'Height', type: 'number' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const MaterialCalculatorTool: React.FC<MaterialCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hook for backend sync
  const {
    data: estimates,
    addItem: addEstimateToBackend,
    updateItem: updateEstimateBackend,
    deleteItem: deleteEstimateBackend,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<MaterialEstimate>('material-estimates', [], ESTIMATE_COLUMNS);

  const {
    data: templates,
    addItem: addTemplateToBackend,
    deleteItem: deleteTemplateBackend,
  } = useToolData<SavedTemplate>('material-templates', [], []);

  // Current calculation state
  const [currentCalc, setCurrentCalc] = useState({
    name: '',
    customerName: '',
    projectName: '',
    material: 'vinyl_banner' as MaterialType,
    finish: 'none' as FinishType,
    width: 24,
    height: 36,
    unit: 'inches' as 'inches' | 'feet',
    quantity: 1,
    includeWaste: true,
    customWasteFactor: null as number | null,
    laborRate: 35,
    laborHours: 0.5,
    markup: 100, // 100% markup
    notes: '',
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'estimates' | 'templates'>('calculator');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Handle prefill from uiConfig
  React.useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      if (params.width || params.height || params.material) {
        setCurrentCalc({
          ...currentCalc,
          width: params.width || 24,
          height: params.height || 36,
          material: params.material || 'vinyl_banner',
          quantity: params.quantity || 1,
          customerName: params.customerName || '',
          projectName: params.projectName || '',
        });
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate costs
  const calculations = useMemo(() => {
    const materialSpec = MATERIALS.find((m) => m.type === currentCalc.material)!;
    const finishSpec = FINISHES.find((f) => f.type === currentCalc.finish)!;

    // Convert to square feet
    let widthFt = currentCalc.width;
    let heightFt = currentCalc.height;
    if (currentCalc.unit === 'inches') {
      widthFt = currentCalc.width / 12;
      heightFt = currentCalc.height / 12;
    }

    const sqFtPerPiece = widthFt * heightFt;
    const totalSqFt = sqFtPerPiece * currentCalc.quantity;

    // Apply waste factor
    const wasteFactor = currentCalc.customWasteFactor !== null
      ? currentCalc.customWasteFactor
      : materialSpec.wasteFactor;
    const wasteAmount = currentCalc.includeWaste ? totalSqFt * (wasteFactor / 100) : 0;
    const totalSqFtWithWaste = totalSqFt + wasteAmount;

    // Material cost
    const materialCost = totalSqFtWithWaste * materialSpec.costPerSqFt;

    // Finish cost
    const finishCost = totalSqFt * finishSpec.costPerSqFt;

    // Labor cost
    const laborCost = currentCalc.laborRate * currentCalc.laborHours * currentCalc.quantity;

    // Subtotal
    const subtotal = materialCost + finishCost + laborCost;

    // Markup
    const markupAmount = subtotal * (currentCalc.markup / 100);
    const total = subtotal + markupAmount;

    // Per piece
    const costPerPiece = total / currentCalc.quantity;

    // Roll usage (for planning)
    const rollWidthFt = materialSpec.rollWidth / 12;
    const piecesPerRollWidth = Math.floor(rollWidthFt / widthFt);
    const linearFeetNeeded = piecesPerRollWidth > 0 ? (heightFt * Math.ceil(currentCalc.quantity / piecesPerRollWidth)) : heightFt * currentCalc.quantity;

    return {
      sqFtPerPiece,
      totalSqFt,
      wasteFactor,
      wasteAmount,
      totalSqFtWithWaste,
      materialCost,
      finishCost,
      laborCost,
      subtotal,
      markupAmount,
      total,
      costPerPiece,
      linearFeetNeeded,
      piecesPerRollWidth,
      materialSpec,
      finishSpec,
    };
  }, [currentCalc]);

  // Save estimate
  const saveEstimate = () => {
    if (!currentCalc.name) {
      setValidationMessage('Please enter an estimate name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const estimate: MaterialEstimate = {
      id: generateId(),
      name: currentCalc.name,
      customerName: currentCalc.customerName,
      projectName: currentCalc.projectName,
      material: currentCalc.material,
      finish: currentCalc.finish,
      width: currentCalc.width,
      height: currentCalc.height,
      unit: currentCalc.unit,
      quantity: currentCalc.quantity,
      includeWaste: currentCalc.includeWaste,
      customWasteFactor: currentCalc.customWasteFactor,
      laborRate: currentCalc.laborRate,
      laborHours: currentCalc.laborHours,
      markup: currentCalc.markup,
      notes: currentCalc.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEstimateToBackend(estimate);
    setShowSaveForm(false);
    setCurrentCalc({ ...currentCalc, name: '' });
  };

  // Save template
  const saveTemplate = () => {
    if (!currentCalc.name) {
      setValidationMessage('Please enter a template name');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const template: SavedTemplate = {
      id: generateId(),
      name: currentCalc.name,
      material: currentCalc.material,
      finish: currentCalc.finish,
      width: currentCalc.width,
      height: currentCalc.height,
      unit: currentCalc.unit,
      markup: currentCalc.markup,
      laborRate: currentCalc.laborRate,
      createdAt: new Date().toISOString(),
    };

    addTemplateToBackend(template);
    setShowSaveForm(false);
    setSaveAsTemplate(false);
    setCurrentCalc({ ...currentCalc, name: '' });
  };

  // Load template
  const loadTemplate = (template: SavedTemplate) => {
    setCurrentCalc({
      ...currentCalc,
      material: template.material,
      finish: template.finish,
      width: template.width,
      height: template.height,
      unit: template.unit,
      markup: template.markup,
      laborRate: template.laborRate,
    });
    setActiveTab('calculator');
  };

  // Load estimate
  const loadEstimate = (estimate: MaterialEstimate) => {
    setCurrentCalc({
      name: estimate.name,
      customerName: estimate.customerName,
      projectName: estimate.projectName,
      material: estimate.material,
      finish: estimate.finish,
      width: estimate.width,
      height: estimate.height,
      unit: estimate.unit,
      quantity: estimate.quantity,
      includeWaste: estimate.includeWaste,
      customWasteFactor: estimate.customWasteFactor,
      laborRate: estimate.laborRate,
      laborHours: estimate.laborHours,
      markup: estimate.markup,
      notes: estimate.notes,
    });
    setActiveTab('calculator');
  };

  // Reset calculator
  const resetCalculator = () => {
    setCurrentCalc({
      name: '',
      customerName: '',
      projectName: '',
      material: 'vinyl_banner',
      finish: 'none',
      width: 24,
      height: 36,
      unit: 'inches',
      quantity: 1,
      includeWaste: true,
      customWasteFactor: null,
      laborRate: 35,
      laborHours: 0.5,
      markup: 100,
      notes: '',
    });
  };

  // Copy quote to clipboard
  const copyQuote = () => {
    const quote = `
Material Quote
==============
Customer: ${currentCalc.customerName || 'N/A'}
Project: ${currentCalc.projectName || 'N/A'}

Size: ${currentCalc.width} x ${currentCalc.height} ${currentCalc.unit}
Quantity: ${currentCalc.quantity}
Material: ${calculations.materialSpec.name}
Finish: ${calculations.finishSpec.name}

Material Cost: ${formatCurrency(calculations.materialCost)}
Finish Cost: ${formatCurrency(calculations.finishCost)}
Labor: ${formatCurrency(calculations.laborCost)}
---
Subtotal: ${formatCurrency(calculations.subtotal)}
Markup (${currentCalc.markup}%): ${formatCurrency(calculations.markupAmount)}
---
TOTAL: ${formatCurrency(calculations.total)}
Per Piece: ${formatCurrency(calculations.costPerPiece)}

${currentCalc.notes ? `Notes: ${currentCalc.notes}` : ''}
    `.trim();

    navigator.clipboard.writeText(quote);
    setValidationMessage('Quote copied to clipboard!');
    setTimeout(() => setValidationMessage(null), 3000);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.materialCalculator.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.materialCalculator.materialCalculator', 'Material Calculator')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.materialCalculator.calculateMaterialCostsWasteAnd', 'Calculate material costs, waste, and pricing for print jobs')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="material-calculator" toolName="Material Calculator" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => exportToCSV(estimates, ESTIMATE_COLUMNS, { filename: 'material-estimates' })}
                onExportExcel={() => exportToExcel(estimates, ESTIMATE_COLUMNS, { filename: 'material-estimates' })}
                onExportJSON={() => exportToJSON(estimates, { filename: 'material-estimates' })}
                onExportPDF={async () => {
                  await exportToPDF(estimates, ESTIMATE_COLUMNS, {
                    filename: 'material-estimates',
                    title: 'Material Estimates',
                    subtitle: `${estimates.length} saved estimates`,
                  });
                }}
                onPrint={() => printData(estimates, ESTIMATE_COLUMNS, { title: 'Material Estimates' })}
                onCopyToClipboard={async () => await copyUtil(estimates, ESTIMATE_COLUMNS, 'tab')}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
              { id: 'estimates', label: 'Saved Estimates', icon: <FileText className="w-4 h-4" /> },
              { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.materialCalculator.jobDetails', 'Job Details')}
              </h2>

              <div className="space-y-4">
                {/* Customer & Project */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('tools.materialCalculator.customerName', 'Customer Name')}
                    value={currentCalc.customerName}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, customerName: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t('tools.materialCalculator.projectName', 'Project Name')}
                    value={currentCalc.projectName}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, projectName: e.target.value })}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Material Selection */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.material', 'Material')}</label>
                  <select
                    value={currentCalc.material}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, material: e.target.value as MaterialType })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {MATERIALS.map((m) => (
                      <option key={m.type} value={m.type}>
                        {m.name} - {formatCurrency(m.costPerSqFt)}/sq ft
                      </option>
                    ))}
                  </select>
                </div>

                {/* Finish Selection */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.finish', 'Finish')}</label>
                  <select
                    value={currentCalc.finish}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, finish: e.target.value as FinishType })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {FINISHES.map((f) => (
                      <option key={f.type} value={f.type}>
                        {f.name} {f.costPerSqFt > 0 ? `- ${formatCurrency(f.costPerSqFt)}/sq ft` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dimensions */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.dimensions', 'Dimensions')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      placeholder={t('tools.materialCalculator.width', 'Width')}
                      value={currentCalc.width}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, width: parseFloat(e.target.value) || 0 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder={t('tools.materialCalculator.height', 'Height')}
                      value={currentCalc.height}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, height: parseFloat(e.target.value) || 0 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <select
                      value={currentCalc.unit}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, unit: e.target.value as 'inches' | 'feet' })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="inches">{t('tools.materialCalculator.inches', 'Inches')}</option>
                      <option value="feet">{t('tools.materialCalculator.feet', 'Feet')}</option>
                    </select>
                    <input
                      type="number"
                      placeholder={t('tools.materialCalculator.qty2', 'Qty')}
                      value={currentCalc.quantity}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, quantity: parseInt(e.target.value) || 1 })}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Waste Factor */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentCalc.includeWaste}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, includeWaste: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0D9488]"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.materialCalculator.includeWasteFactor', 'Include Waste Factor')}</span>
                  </label>
                  {currentCalc.includeWaste && (
                    <input
                      type="number"
                      placeholder={`${calculations.wasteFactor}%`}
                      value={currentCalc.customWasteFactor !== null ? currentCalc.customWasteFactor : ''}
                      onChange={(e) => setCurrentCalc({ ...currentCalc, customWasteFactor: e.target.value ? parseFloat(e.target.value) : null })}
                      className={`w-20 px-2 py-1 rounded border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  )}
                </div>

                {/* Labor */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.labor', 'Labor')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      <input
                        type="number"
                        placeholder={t('tools.materialCalculator.rateHr', 'Rate/hr')}
                        value={currentCalc.laborRate}
                        onChange={(e) => setCurrentCalc({ ...currentCalc, laborRate: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-7 pr-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.25"
                        placeholder={t('tools.materialCalculator.hoursPiece', 'Hours/piece')}
                        value={currentCalc.laborHours}
                        onChange={(e) => setCurrentCalc({ ...currentCalc, laborHours: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>hrs</span>
                    </div>
                  </div>
                </div>

                {/* Markup */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.markup', 'Markup (%)')}</label>
                  <input
                    type="number"
                    value={currentCalc.markup}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, markup: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.notes', 'Notes')}</label>
                  <textarea
                    placeholder={t('tools.materialCalculator.specialInstructionsNotes', 'Special instructions, notes...')}
                    value={currentCalc.notes}
                    onChange={(e) => setCurrentCalc({ ...currentCalc, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={resetCalculator}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('tools.materialCalculator.reset', 'Reset')}
                  </button>
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    <Save className="w-4 h-4" />
                    {t('tools.materialCalculator.save', 'Save')}
                  </button>
                  <button
                    onClick={copyQuote}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {t('tools.materialCalculator.copyQuote', 'Copy Quote')}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.materialCalculator.costBreakdown', 'Cost Breakdown')}
              </h2>

              <div className="space-y-4">
                {/* Material Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.material2', 'Material')}</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.materialSpec.name}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Roll Width: {calculations.materialSpec.rollWidth}" | {formatCurrency(calculations.materialSpec.costPerSqFt)}/sq ft
                  </p>
                </div>

                {/* Size Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.perPiece', 'Per Piece')}</p>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.sqFtPerPiece.toFixed(2)} sq ft
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.totalArea', 'Total Area')}</p>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.totalSqFt.toFixed(2)} sq ft
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>With Waste ({calculations.wasteFactor}%)</p>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {calculations.totalSqFtWithWaste.toFixed(2)} sq ft
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className={`space-y-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('tools.materialCalculator.materialCost', 'Material Cost')}</span>
                    <span>{formatCurrency(calculations.materialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Finish ({calculations.finishSpec.name})</span>
                    <span>{formatCurrency(calculations.finishCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Labor ({currentCalc.laborHours * currentCalc.quantity} hrs)</span>
                    <span>{formatCurrency(calculations.laborCost)}</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <span className="font-medium">{t('tools.materialCalculator.subtotal', 'Subtotal')}</span>
                    <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Markup ({currentCalc.markup}%)</span>
                    <span>{formatCurrency(calculations.markupAmount)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className={`p-4 rounded-lg bg-[#0D9488]/10 border border-[#0D9488]/20`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.materialCalculator.total', 'TOTAL')}</span>
                    <span className="text-2xl font-bold text-[#0D9488]">{formatCurrency(calculations.total)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.materialCalculator.pricePerPiece', 'Price per piece')}</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(calculations.costPerPiece)}
                    </span>
                  </div>
                </div>

                {/* Production Info */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.materialCalculator.productionNotes', 'Production Notes')}</p>
                  <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Linear feet needed: {calculations.linearFeetNeeded.toFixed(1)} ft</li>
                    <li>Pieces per roll width: {calculations.piecesPerRollWidth}</li>
                    <li>Roll width: {calculations.materialSpec.rollWidth}"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estimates Tab */}
        {activeTab === 'estimates' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.materialCalculator.savedEstimates', 'Saved Estimates')}
            </h2>

            {estimates.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.materialCalculator.noSavedEstimates', 'No saved estimates')}</p>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="mt-4 text-[#0D9488] hover:underline"
                >
                  {t('tools.materialCalculator.createYourFirstEstimate', 'Create your first estimate')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.name', 'Name')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.customer', 'Customer')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.material3', 'Material')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.size', 'Size')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.qty', 'Qty')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.date', 'Date')}</th>
                      <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('tools.materialCalculator.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((est) => (
                      <tr
                        key={est.id}
                        className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{est.name}</td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{est.customerName || '-'}</td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {MATERIALS.find((m) => m.type === est.material)?.name}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {est.width} x {est.height} {est.unit}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{est.quantity}</td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(est.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadEstimate(est)}
                              className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                              title={t('tools.materialCalculator.load', 'Load')}
                            >
                              <Edit2 className="w-4 h-4 text-[#0D9488]" />
                            </button>
                            <button
                              onClick={() => deleteEstimateBackend(est.id)}
                              className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.materialCalculator.savedTemplates', 'Saved Templates')}
            </h2>

            {templates.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('tools.materialCalculator.noSavedTemplates', 'No saved templates')}</p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('tools.materialCalculator.saveACalculationAsA', 'Save a calculation as a template to reuse later')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {MATERIALS.find((m) => m.type === template.material)?.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {template.width} x {template.height} {template.unit}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Markup: {template.markup}%
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="flex-1 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 text-sm"
                      >
                        {t('tools.materialCalculator.useTemplate', 'Use Template')}
                      </button>
                      <button
                        onClick={() => deleteTemplateBackend(template.id)}
                        className={`p-1.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Form Modal */}
        {showSaveForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Save {saveAsTemplate ? t('tools.materialCalculator.template', 'Template') : t('tools.materialCalculator.estimate', 'Estimate')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setSaveAsTemplate(false);
                    }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder={saveAsTemplate ? t('tools.materialCalculator.templateName', 'Template Name *') : t('tools.materialCalculator.estimateName', 'Estimate Name *')}
                  value={currentCalc.name}
                  onChange={(e) => setCurrentCalc({ ...currentCalc, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D9488]"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.materialCalculator.saveAsReusableTemplate', 'Save as reusable template')}
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setSaveAsTemplate(false);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('tools.materialCalculator.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={saveAsTemplate ? saveTemplate : saveEstimate}
                    className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90"
                  >
                    {t('tools.materialCalculator.save2', 'Save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-[#0D9488] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {validationMessage}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog />
      </div>
    </div>
  );
};

export default MaterialCalculatorTool;
