import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, PieChart, LineChart, TrendingUp, Upload, RefreshCw, Download, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
];

// Column configuration for export functionality
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'label', header: 'Label', type: 'string' },
  { key: 'value', header: 'Value', type: 'number' },
  { key: 'color', header: 'Color', type: 'string' },
];

interface DataVisualizerToolProps {
  uiConfig?: UIConfig;
}

export const DataVisualizerTool: React.FC<DataVisualizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence
  const {
    data,
    setData,
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
  } = useToolData<DataPoint>('data-visualizer', [], COLUMNS);

  const [dataInput, setDataInput] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('My Chart');
  const [error, setError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        dataInput?: string;
        chartType?: ChartType;
        chartTitle?: string;
      };
      if (params.dataInput) setDataInput(params.dataInput);
      if (params.chartType) setChartType(params.chartType);
      if (params.chartTitle) setChartTitle(params.chartTitle);
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const sampleData = `Sales,Revenue
Q1,12000
Q2,19000
Q3,15000
Q4,22000`;

  const parseData = () => {
    if (!dataInput.trim()) {
      setError('Please enter data');
      return;
    }

    try {
      const lines = dataInput.trim().split('\n');
      const parsed: DataPoint[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Try CSV format first
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const label = parts[0];
          const value = parseFloat(parts[1]);

          // Skip header row if it contains non-numeric value
          if (i === 0 && isNaN(value)) continue;

          if (!isNaN(value)) {
            parsed.push({
              id: `dp-${Date.now()}-${parsed.length}`,
              label,
              value,
              color: colors[parsed.length % colors.length],
            });
          }
        }
      }

      if (parsed.length === 0) {
        setError('No valid data found. Use format: Label,Value');
        return;
      }

      setData(parsed);
      setError(null);
    } catch (e) {
      setError('Failed to parse data');
    }
  };

  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const renderBarChart = () => {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{item.value.toLocaleString()}</span>
            </div>
            <div className={`h-8 rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    const width = 400;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((item, index) => ({
      x: padding + (index / (data.length - 1 || 1)) * chartWidth,
      y: height - padding - (item.value / maxValue) * chartHeight,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={height - padding - ratio * chartHeight}
              x2={width - padding}
              y2={height - padding - ratio * chartHeight}
              stroke={isDark ? '#374151' : '#E5E7EB'}
              strokeDasharray="4"
            />
            <text
              x={padding - 10}
              y={height - padding - ratio * chartHeight}
              className="text-xs"
              fill={isDark ? '#9CA3AF' : '#6B7280'}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="#3B82F6" />
            <circle cx={p.x} cy={p.y} r="3" fill="white" />
            <text
              x={p.x}
              y={height - padding + 15}
              className="text-xs"
              fill={isDark ? '#9CA3AF' : '#6B7280'}
              textAnchor="middle"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderPieChart = (isDoughnut: boolean = false) => {
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const innerRadius = isDoughnut ? 50 : 0;

    let currentAngle = -90;

    return (
      <div className="flex flex-col items-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const x1Inner = center + innerRadius * Math.cos(startRad);
            const y1Inner = center + innerRadius * Math.sin(startRad);
            const x2Inner = center + innerRadius * Math.cos(endRad);
            const y2Inner = center + innerRadius * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            const pathD = isDoughnut
              ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`
              : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={index}
                d={pathD}
                fill={item.color}
                stroke={isDark ? '#1F2937' : '#FFFFFF'}
                strokeWidth="2"
                className="transition-all hover:opacity-80"
              />
            );
          })}
          {isDoughnut && (
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-bold"
              fill={isDark ? '#FFFFFF' : '#1F2937'}
            >
              {total.toLocaleString()}
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDownloadSvg = () => {
    const svgElement = document.querySelector('.chart-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartTitle.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartTypes: { type: ChartType; icon: any; label: string }[] = [
    { type: 'bar', icon: BarChart3, label: 'Bar' },
    { type: 'line', icon: LineChart, label: 'Line' },
    { type: 'pie', icon: PieChart, label: 'Pie' },
    { type: 'doughnut', icon: TrendingUp, label: 'Doughnut' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-violet-900/20' : 'bg-gradient-to-r from-white to-violet-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dataVisualizer.dataVisualizer', 'Data Visualizer')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataVisualizer.createChartsFromYourData', 'Create charts from your data')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="data-visualizer" toolName="Data Visualizer" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            {data.length > 0 && (
              <ExportDropdown
                onExportCSV={() => exportCSV({ filename: chartTitle.replace(/\s+/g, '-').toLowerCase() })}
                onExportExcel={() => exportExcel({ filename: chartTitle.replace(/\s+/g, '-').toLowerCase() })}
                onExportJSON={() => exportJSON({ filename: chartTitle.replace(/\s+/g, '-').toLowerCase() })}
                onExportPDF={() => exportPDF({ filename: chartTitle.replace(/\s+/g, '-').toLowerCase(), title: chartTitle })}
                onPrint={() => print(chartTitle)}
                onCopyToClipboard={() => copyToClipboard('tab')}
                onImportCSV={async (file) => { await importCSV(file); }}
                onImportJSON={async (file) => { await importJSON(file); }}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.dataVisualizer.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Data Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.dataVisualizer.enterDataCsvFormatLabel', 'Enter Data (CSV format: Label,Value)')}
            </label>
            <button
              onClick={() => setDataInput(sampleData)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.dataVisualizer.loadSample', 'Load Sample')}
            </button>
          </div>
          <textarea
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            placeholder={t('tools.dataVisualizer.q112000Nq219000Nq3', 'Q1,12000\\nQ2,19000\\nQ3,15000\\nQ4,22000')}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
          />
          <button
            onClick={parseData}
            className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t('tools.dataVisualizer.generateChart', 'Generate Chart')}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {data.length > 0 && (
          <>
            {/* Chart Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.dataVisualizer.chartTitle', 'Chart Title')}
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.dataVisualizer.chartType', 'Chart Type')}
                </label>
                <div className="flex gap-2">
                  {chartTypes.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setChartType(item.type)}
                      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                        chartType === item.type
                          ? 'bg-violet-500 text-white'
                          : isDark
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Display */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`text-lg font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {chartTitle}
              </h4>
              <div className="chart-container">
                {chartType === 'bar' && renderBarChart()}
                {chartType === 'line' && renderLineChart()}
                {chartType === 'pie' && renderPieChart(false)}
                {chartType === 'doughnut' && renderPieChart(true)}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataVisualizer.total', 'Total')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {total.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataVisualizer.average', 'Average')}</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {(total / data.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataVisualizer.max', 'Max')}</p>
                <p className={`text-xl font-bold text-green-500`}>
                  {maxValue.toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dataVisualizer.min', 'Min')}</p>
                <p className={`text-xl font-bold text-blue-500`}>
                  {Math.min(...data.map(d => d.value)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {(chartType === 'line' || chartType === 'pie' || chartType === 'doughnut') && (
                <button
                  onClick={handleDownloadSvg}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('tools.dataVisualizer.downloadSvg', 'Download SVG')}
                </button>
              )}
              <button
                onClick={() => { setData([]); setDataInput(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {t('tools.dataVisualizer.clearData', 'Clear Data')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataVisualizerTool;
