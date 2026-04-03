import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Hash, Repeat, Package, Ruler, StickyNote, Plus, Minus, RotateCcw, Info, Sparkles, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface ProjectNotes {
  note: string;
  timestamp: Date;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'rowCount', header: 'Row Count' },
  { key: 'targetRows', header: 'Target Rows' },
  { key: 'stitchCount', header: 'Stitch Count' },
  { key: 'stitchesPerRow', header: 'Stitches Per Row' },
  { key: 'repeatCount', header: 'Repeat Count' },
  { key: 'rowsPerRepeat', header: 'Rows Per Repeat' },
  { key: 'totalRepeats', header: 'Total Repeats' },
  { key: 'yarnPerRow', header: 'Yarn Per Row (m)' },
  { key: 'skeinLength', header: 'Skein Length (m)' },
  { key: 'gaugeStitches', header: 'Gauge Stitches' },
  { key: 'gaugeRows', header: 'Gauge Rows' },
  { key: 'gaugeWidth', header: 'Gauge Width (cm)' },
  { key: 'gaugeHeight', header: 'Gauge Height (cm)' },
  { key: 'desiredWidth', header: 'Desired Width (cm)' },
  { key: 'desiredHeight', header: 'Desired Height (cm)' },
  { key: 'timestamp', header: 'Timestamp', type: 'date' },
];

interface KnittingRowCounterToolProps {
  uiConfig?: UIConfig;
}

export const KnittingRowCounterTool: React.FC<KnittingRowCounterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Row Counter
  const [rowCount, setRowCount] = useState(0);
  const [targetRows, setTargetRows] = useState('');

  // Stitch Counter
  const [stitchCount, setStitchCount] = useState(0);
  const [stitchesPerRow, setStitchesPerRow] = useState('');

  // Pattern Repeat Tracker
  const [repeatCount, setRepeatCount] = useState(0);
  const [rowsPerRepeat, setRowsPerRepeat] = useState('8');
  const [totalRepeats, setTotalRepeats] = useState('10');

  // Yarn Usage Estimate
  const [yarnPerRow, setYarnPerRow] = useState('2.5'); // meters per row
  const [skeinLength, setSkeinLength] = useState('200'); // meters per skein

  // Gauge Calculator
  const [gaugeStitches, setGaugeStitches] = useState('20');
  const [gaugeRows, setGaugeRows] = useState('28');
  const [gaugeWidth, setGaugeWidth] = useState('10'); // cm
  const [gaugeHeight, setGaugeHeight] = useState('10'); // cm
  const [desiredWidth, setDesiredWidth] = useState('50'); // cm
  const [desiredHeight, setDesiredHeight] = useState('60'); // cm

  // Project Notes
  const [notes, setNotes] = useState<ProjectNotes[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'counter' | 'pattern' | 'yarn' | 'gauge' | 'notes'>('counter');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & Record<string, any>;
      let hasChanges = false;

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        // Restore all saved form fields
        if (params.rowCount !== undefined) setRowCount(Number(params.rowCount));
        if (params.targetRows !== undefined) setTargetRows(String(params.targetRows));
        if (params.stitchCount !== undefined) setStitchCount(Number(params.stitchCount));
        if (params.stitchesPerRow !== undefined) setStitchesPerRow(String(params.stitchesPerRow));
        if (params.repeatCount !== undefined) setRepeatCount(Number(params.repeatCount));
        if (params.rowsPerRepeat !== undefined) setRowsPerRepeat(String(params.rowsPerRepeat));
        if (params.totalRepeats !== undefined) setTotalRepeats(String(params.totalRepeats));
        if (params.yarnPerRow !== undefined) setYarnPerRow(String(params.yarnPerRow));
        if (params.skeinLength !== undefined) setSkeinLength(String(params.skeinLength));
        if (params.gaugeStitches !== undefined) setGaugeStitches(String(params.gaugeStitches));
        if (params.gaugeRows !== undefined) setGaugeRows(String(params.gaugeRows));
        if (params.gaugeWidth !== undefined) setGaugeWidth(String(params.gaugeWidth));
        if (params.gaugeHeight !== undefined) setGaugeHeight(String(params.gaugeHeight));
        if (params.desiredWidth !== undefined) setDesiredWidth(String(params.desiredWidth));
        if (params.desiredHeight !== undefined) setDesiredHeight(String(params.desiredHeight));
        if (params.activeTab) setActiveTab(params.activeTab as any);
        setIsEditFromGallery(true);
        setIsPrefilled(true);
      } else {
        // Regular prefill from AI
        if (params.targetRows) {
          setTargetRows(String(params.targetRows));
          hasChanges = true;
        }
        if (params.stitchesPerRow) {
          setStitchesPerRow(String(params.stitchesPerRow));
          hasChanges = true;
        }
        if (params.rowsPerRepeat) {
          setRowsPerRepeat(String(params.rowsPerRepeat));
          hasChanges = true;
        }
        if (params.totalRepeats) {
          setTotalRepeats(String(params.totalRepeats));
          hasChanges = true;
        }

        if (hasChanges) {
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Prepare export data
  const exportData = {
    rowCount: rowCount.toString(),
    targetRows,
    stitchCount: stitchCount.toString(),
    stitchesPerRow,
    repeatCount: repeatCount.toString(),
    rowsPerRepeat,
    totalRepeats,
    yarnPerRow,
    skeinLength,
    gaugeStitches,
    gaugeRows,
    gaugeWidth,
    gaugeHeight,
    desiredWidth,
    desiredHeight,
    timestamp: new Date(),
  };

  const handleExportCSV = () => {
    exportToCSV([exportData], COLUMNS, { filename: 'knitting-project' });
  };

  const handleExportExcel = () => {
    exportToExcel([exportData], COLUMNS, { filename: 'knitting-project' });
  };

  const handleExportJSON = () => {
    exportToJSON([exportData], { filename: 'knitting-project' });
  };

  const handleExportPDF = async () => {
    await exportToPDF([exportData], COLUMNS, {
      filename: 'knitting-project',
      title: 'Knitting Project Data',
      subtitle: 'Project progress and calculations',
    });
  };

  const handlePrint = () => {
    printData([exportData], COLUMNS, { title: 'Knitting Project Data' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil([exportData], COLUMNS, 'tab');
  };

  const calculations = useMemo(() => {
    // Row progress
    const target = parseInt(targetRows) || 0;
    const rowProgress = target > 0 ? Math.min((rowCount / target) * 100, 100) : 0;

    // Total stitches
    const stitchesRow = parseInt(stitchesPerRow) || 0;
    const totalStitches = rowCount * stitchesRow + stitchCount;

    // Pattern repeat progress
    const rowsRepeat = parseInt(rowsPerRepeat) || 1;
    const totalReps = parseInt(totalRepeats) || 0;
    const currentRowInRepeat = rowCount % rowsRepeat;
    const completedRepeats = Math.floor(rowCount / rowsRepeat);
    const repeatProgress = totalReps > 0 ? Math.min((completedRepeats / totalReps) * 100, 100) : 0;

    // Yarn usage
    const yarnRow = parseFloat(yarnPerRow) || 0;
    const skeinLen = parseFloat(skeinLength) || 1;
    const yarnUsed = rowCount * yarnRow;
    const skeinsUsed = yarnUsed / skeinLen;
    const yarnRemaining = target > 0 ? (target - rowCount) * yarnRow : 0;
    const skeinsNeeded = Math.ceil((target * yarnRow) / skeinLen);

    // Gauge calculations
    const gStitches = parseFloat(gaugeStitches) || 1;
    const gRows = parseFloat(gaugeRows) || 1;
    const gWidth = parseFloat(gaugeWidth) || 1;
    const gHeight = parseFloat(gaugeHeight) || 1;
    const dWidth = parseFloat(desiredWidth) || 0;
    const dHeight = parseFloat(desiredHeight) || 0;

    const stitchesPerCm = gStitches / gWidth;
    const rowsPerCm = gRows / gHeight;
    const neededStitches = Math.round(dWidth * stitchesPerCm);
    const neededRows = Math.round(dHeight * rowsPerCm);

    return {
      rowProgress: rowProgress.toFixed(0),
      totalStitches,
      currentRowInRepeat,
      completedRepeats,
      repeatProgress: repeatProgress.toFixed(0),
      yarnUsed: yarnUsed.toFixed(1),
      skeinsUsed: skeinsUsed.toFixed(2),
      yarnRemaining: yarnRemaining.toFixed(1),
      skeinsNeeded,
      stitchesPerCm: stitchesPerCm.toFixed(2),
      rowsPerCm: rowsPerCm.toFixed(2),
      neededStitches,
      neededRows,
    };
  }, [
    rowCount,
    targetRows,
    stitchesPerRow,
    stitchCount,
    rowsPerRepeat,
    totalRepeats,
    yarnPerRow,
    skeinLength,
    gaugeStitches,
    gaugeRows,
    gaugeWidth,
    gaugeHeight,
    desiredWidth,
    desiredHeight,
  ]);

  const handleAddNote = () => {
    if (currentNote.trim()) {
      setNotes([...notes, { note: currentNote.trim(), timestamp: new Date() }]);
      setCurrentNote('');
    }
  };

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const resetCounters = () => {
    setRowCount(0);
    setStitchCount(0);
    setRepeatCount(0);
  };

  // Handle save to gallery
  const handleSave = () => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSave && typeof params.onSave === 'function') {
      params.onSave({
        toolId: 'knitting-row-counter',
        rowCount,
        targetRows,
        stitchCount,
        stitchesPerRow,
        repeatCount,
        rowsPerRepeat,
        totalRepeats,
        yarnPerRow,
        skeinLength,
        gaugeStitches,
        gaugeRows,
        gaugeWidth,
        gaugeHeight,
        desiredWidth,
        desiredHeight,
        activeTab,
      });
    }
    // Call onSaveCallback if provided
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  const tabs = [
    { id: 'counter' as const, label: 'Counter', icon: Hash },
    { id: 'pattern' as const, label: 'Pattern', icon: Repeat },
    { id: 'yarn' as const, label: 'Yarn', icon: Package },
    { id: 'gauge' as const, label: 'Gauge', icon: Ruler },
    { id: 'notes' as const, label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Scissors className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.knittingRowCounter', 'Knitting Row Counter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.knittingRowCounter.trackYourKnittingProjectProgress', 'Track your knitting project progress')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(uiConfig?.params as Record<string, any>)?.onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditFromGallery ? t('tools.knittingRowCounter.update', 'Update') : t('tools.knittingRowCounter.save', 'Save')}
            </button>
          )}
          <ExportDropdown
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportJSON={handleExportJSON}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          onCopyToClipboard={handleCopyToClipboard}
          showImport={false}
          theme={isDark ? 'dark' : 'light'}
        />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.knittingRowCounter.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Counter Tab */}
        {activeTab === 'counter' && (
          <div className="space-y-6">
            {/* Row Counter */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.rowCounter', 'Row Counter')}</span>
                <button
                  onClick={resetCounters}
                  className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setRowCount(Math.max(0, rowCount - 1))}
                  className={`p-4 rounded-full ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <div className="text-5xl font-bold text-pink-500">{rowCount}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>rows</div>
                </div>
                <button
                  onClick={() => setRowCount(rowCount + 1)}
                  className="p-4 rounded-full bg-pink-500 text-white hover:bg-pink-600"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              {/* Target Rows */}
              <div className="mt-4 space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.knittingRowCounter.targetRowsOptional', 'Target Rows (optional)')}
                </label>
                <input
                  type="number"
                  value={targetRows}
                  onChange={(e) => setTargetRows(e.target.value)}
                  placeholder="e.g., 100"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                {targetRows && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.knittingRowCounter.progress', 'Progress')}</span>
                      <span className="text-pink-500">{calculations.rowProgress}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-pink-500 transition-all"
                        style={{ width: `${calculations.rowProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stitch Counter */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.stitchCounter', 'Stitch Counter')}</span>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setStitchCount(Math.max(0, stitchCount - 1))}
                  className={`p-3 rounded-full ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-500">{stitchCount}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>stitches</div>
                </div>
                <button
                  onClick={() => setStitchCount(stitchCount + 1)}
                  className="p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.knittingRowCounter.stitchesPerRow', 'Stitches per Row')}
                </label>
                <input
                  type="number"
                  value={stitchesPerRow}
                  onChange={(e) => setStitchesPerRow(e.target.value)}
                  placeholder="e.g., 40"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              {stitchesPerRow && (
                <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.totalStitches', 'Total Stitches')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.totalStitches.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pattern Repeat Tab */}
        {activeTab === 'pattern' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.patternRepeatTracker', 'Pattern Repeat Tracker')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.knittingRowCounter.trackYourProgressThroughPattern', 'Track your progress through pattern repeats')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.knittingRowCounter.rowsPerRepeat', 'Rows per Repeat')}
                </label>
                <input
                  type="number"
                  value={rowsPerRepeat}
                  onChange={(e) => setRowsPerRepeat(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.knittingRowCounter.totalRepeatsNeeded', 'Total Repeats Needed')}
                </label>
                <input
                  type="number"
                  value={totalRepeats}
                  onChange={(e) => setTotalRepeats(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-center mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.currentRowInPattern', 'Current Row in Pattern')}</div>
                <div className="text-4xl font-bold text-pink-500">
                  {calculations.currentRowInRepeat + 1} <span className="text-xl">/ {rowsPerRepeat}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.repeatsCompleted', 'Repeats Completed')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {calculations.completedRepeats}
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.repeatsRemaining', 'Repeats Remaining')}</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.max(0, parseInt(totalRepeats) - calculations.completedRepeats)}
                  </div>
                </div>
              </div>
              {totalRepeats && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.knittingRowCounter.patternProgress', 'Pattern Progress')}</span>
                    <span className="text-pink-500">{calculations.repeatProgress}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-pink-500 transition-all"
                      style={{ width: `${calculations.repeatProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Yarn Usage Tab */}
        {activeTab === 'yarn' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.yarnUsageEstimate', 'Yarn Usage Estimate')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.knittingRowCounter.calculateHowMuchYarnYou', 'Calculate how much yarn you need for your project')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.knittingRowCounter.yarnPerRowMeters', 'Yarn per Row (meters)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={yarnPerRow}
                  onChange={(e) => setYarnPerRow(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.knittingRowCounter.skeinLengthMeters', 'Skein Length (meters)')}
                </label>
                <input
                  type="number"
                  value={skeinLength}
                  onChange={(e) => setSkeinLength(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-pink-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.yarnUsed', 'Yarn Used')}</span>
                </div>
                <div className="text-3xl font-bold text-pink-500">{calculations.yarnUsed}m</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ~{calculations.skeinsUsed} skeins
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.yarnRemaining', 'Yarn Remaining')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.yarnRemaining}m</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  to target ({targetRows || 0} rows)
                </div>
              </div>
            </div>

            {targetRows && (
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.totalSkeinsNeeded', 'Total Skeins Needed')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.skeinsNeeded} skeins
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  for {targetRows} rows at {yarnPerRow}m per row
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gauge Calculator Tab */}
        {activeTab === 'gauge' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.gaugeCalculator', 'Gauge Calculator')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.knittingRowCounter.calculateStitchesAndRowsNeeded', 'Calculate stitches and rows needed based on your gauge swatch')}
              </p>
            </div>

            <div className="space-y-4">
              <h5 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.knittingRowCounter.yourGaugeSwatch', 'Your Gauge Swatch')}</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.stitches', 'Stitches')}
                  </label>
                  <input
                    type="number"
                    value={gaugeStitches}
                    onChange={(e) => setGaugeStitches(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.widthCm', 'Width (cm)')}
                  </label>
                  <input
                    type="number"
                    value={gaugeWidth}
                    onChange={(e) => setGaugeWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.rows', 'Rows')}
                  </label>
                  <input
                    type="number"
                    value={gaugeRows}
                    onChange={(e) => setGaugeRows(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.heightCm', 'Height (cm)')}
                  </label>
                  <input
                    type="number"
                    value={gaugeHeight}
                    onChange={(e) => setGaugeHeight(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.stitchesPerCm', 'Stitches per cm')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.stitchesPerCm}</div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.knittingRowCounter.rowsPerCm', 'Rows per cm')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.rowsPerCm}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.knittingRowCounter.desiredDimensions', 'Desired Dimensions')}</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.widthCm2', 'Width (cm)')}
                  </label>
                  <input
                    type="number"
                    value={desiredWidth}
                    onChange={(e) => setDesiredWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.knittingRowCounter.heightCm2', 'Height (cm)')}
                  </label>
                  <input
                    type="number"
                    value={desiredHeight}
                    onChange={(e) => setDesiredHeight(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-pink-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.castOn', 'Cast On')}</span>
                </div>
                <div className="text-3xl font-bold text-pink-500">{calculations.neededStitches}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>stitches</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.work', 'Work')}</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{calculations.neededRows}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>rows</div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.knittingRowCounter.projectNotes', 'Project Notes')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.knittingRowCounter.keepTrackOfPatternModifications', 'Keep track of pattern modifications, reminders, and ideas')}
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder={t('tools.knittingRowCounter.addANote', 'Add a note...')}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
              />
              <button
                onClick={handleAddNote}
                disabled={!currentNote.trim()}
                className={`w-full py-2 rounded-lg font-medium ${
                  currentNote.trim()
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('tools.knittingRowCounter.addNote', 'Add Note')}
              </button>
            </div>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('tools.knittingRowCounter.noNotesYet', 'No notes yet')}</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{note.note}</p>
                      <button
                        onClick={() => handleDeleteNote(index)}
                        className={`text-xs ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        Delete
                      </button>
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {note.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.knittingRowCounter.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.knittingRowCounter.tapTheButtonAfterCompleting', 'Tap the + button after completing each row')}</li>
                <li>{t('tools.knittingRowCounter.createAGaugeSwatchBefore', 'Create a gauge swatch before starting your project')}</li>
                <li>{t('tools.knittingRowCounter.addNotesForPatternModifications', 'Add notes for pattern modifications or reminders')}</li>
                <li>{t('tools.knittingRowCounter.trackYarnUsageToAvoid', 'Track yarn usage to avoid running short')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnittingRowCounterTool;
