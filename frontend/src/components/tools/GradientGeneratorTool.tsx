import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Plus, Trash2, Palette, Check, Sparkles, Download } from 'lucide-react';
import { ToolContainer } from './ToolContainer';
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

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = 'linear' | 'radial';

interface GradientGeneratorToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

const PRESET_GRADIENTS = [
  {
    name: 'Sunset',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { color: '#FF512F', position: 0 },
      { color: '#DD2476', position: 100 },
    ],
  },
  {
    name: 'Ocean',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { color: '#2E3192', position: 0 },
      { color: '#1BFFFF', position: 100 },
    ],
  },
  {
    name: 'Forest',
    type: 'linear' as GradientType,
    angle: 90,
    stops: [
      { color: '#134E5E', position: 0 },
      { color: '#71B280', position: 100 },
    ],
  },
  {
    name: 'Purple Haze',
    type: 'linear' as GradientType,
    angle: 180,
    stops: [
      { color: '#360033', position: 0 },
      { color: '#0b8793', position: 100 },
    ],
  },
  {
    name: 'Fire',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { color: '#f12711', position: 0 },
      { color: '#f5af19', position: 100 },
    ],
  },
  {
    name: 'Ice',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { color: '#00d2ff', position: 0 },
      { color: '#928DAB', position: 100 },
    ],
  },
  {
    name: 'Rose',
    type: 'radial' as GradientType,
    angle: 0,
    stops: [
      { color: '#f857a6', position: 0 },
      { color: '#ff5858', position: 100 },
    ],
  },
  {
    name: 'Night Sky',
    type: 'linear' as GradientType,
    angle: 180,
    stops: [
      { color: '#1e3c72', position: 0 },
      { color: '#2a5298', position: 50 },
      { color: '#7e22ce', position: 100 },
    ],
  },
];

// Define columns for export
const COLUMNS: ColumnConfig[] = [
  {
    key: 'index',
    header: 'Stop Number',
    type: 'number',
  },
  {
    key: 'color',
    header: 'Color (HEX)',
    type: 'string',
  },
  {
    key: 'position',
    header: 'Position (%)',
    type: 'number',
  },
];

export const GradientGeneratorTool: React.FC<GradientGeneratorToolProps> = ({
  uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#0D9488', position: 0 },
    { id: '2', color: '#1a1a1a', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.type) setGradientType(prefillData.params.type as GradientType);
      if (prefillData.params.angle) setAngle(parseInt(prefillData.params.angle));
      if (prefillData.params.colors && Array.isArray(prefillData.params.colors)) {
        const stops = prefillData.params.colors.map((color: string, idx: number) => ({
          id: Date.now().toString() + idx,
          color,
          position: Math.round((idx / (prefillData.params.colors.length - 1)) * 100),
        }));
        setColorStops(stops);
      }
      setIsPrefilled(true);
    }
  }, [prefillData]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery) {
      // Restore form state from saved params
      if (params.gradientType) setGradientType(params.gradientType);
      if (params.angle) setAngle(params.angle);
      if (params.colorStops) setColorStops(params.colorStops);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params]);

  const generateGradientCSS = (): string => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsString})`;
    } else {
      return `radial-gradient(circle, ${stopsString})`;
    }
  };

  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#ffffff',
      position: 50,
    };
    setColorStops([...colorStops, newStop]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((stop) => stop.id !== id));
    }
  };

  const updateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(
      colorStops.map((stop) =>
        stop.id === id ? { ...stop, [field]: value } : stop
      )
    );
  };

  const copyToClipboard = async () => {
    try {
      const css = `background: ${generateGradientCSS()};`;
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Call onSaveCallback if editing from gallery
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const applyPreset = (preset: typeof PRESET_GRADIENTS[0]) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setColorStops(
      preset.stops.map((stop, idx) => ({
        id: Date.now().toString() + idx,
        color: stop.color,
        position: stop.position,
      }))
    );
  };

  // Prepare data for export
  const getExportData = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    return sortedStops.map((stop, index) => ({
      index: index + 1,
      color: stop.color,
      position: stop.position,
    }));
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(getExportData(), COLUMNS, { filename: 'gradient' });
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), COLUMNS, { filename: 'gradient' });
  };

  const handleExportJSON = () => {
    exportToJSON(getExportData(), { filename: 'gradient' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(getExportData(), COLUMNS, {
      filename: 'gradient',
      title: 'Gradient Configuration',
      subtitle: `${gradientType === 'linear' ? 'Linear' : 'Radial'} Gradient${gradientType === 'linear' ? ` at ${angle}°` : ''}`,
    });
  };

  const handlePrint = () => {
    printData(getExportData(), COLUMNS, { title: 'Gradient Configuration' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(getExportData(), COLUMNS, 'tab');
  };

  const gradientCSS = generateGradientCSS();

  return (
    <ToolContainer
      title={t('tools.gradientGenerator.gradientGenerator', 'Gradient Generator')}
      description="Create beautiful CSS gradients with live preview"
      icon={Palette}
    >
      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>{t('tools.gradientGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
          </div>
        )}
        {/* Live Preview */}
        <div
          className="h-48 rounded-lg border-2 border-gray-600 relative overflow-hidden"
          style={{ background: gradientCSS }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-semibold">{t('tools.gradientGenerator.livePreview', 'Live Preview')}</p>
            </div>
          </div>
        </div>

        {/* Gradient Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            {t('tools.gradientGenerator.gradientType', 'Gradient Type')}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setGradientType('linear')}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${
                gradientType === 'linear'
                  ? t('tools.gradientGenerator.bg0d9488TextWhite', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('tools.gradientGenerator.linear', 'Linear')}
            </button>
            <button
              onClick={() => setGradientType('radial')}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${
                gradientType === 'radial'
                  ? t('tools.gradientGenerator.bg0d9488TextWhite2', 'bg-[#0D9488] text-white') : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('tools.gradientGenerator.radial', 'Radial')}
            </button>
          </div>
        </div>

        {/* Angle Control (Linear only) */}
        {gradientType === 'linear' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-200">
                {t('tools.gradientGenerator.direction', 'Direction')}
              </label>
              <span className="text-[#0D9488] font-semibold text-lg">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0° (Right)</span>
              <span>90° (Top)</span>
              <span>180° (Left)</span>
              <span>270° (Bottom)</span>
            </div>
          </div>
        )}

        {/* Color Stops */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-200">
              {t('tools.gradientGenerator.colorStops', 'Color Stops')}
            </label>
            <button
              onClick={addColorStop}
              className="flex items-center gap-2 px-3 py-1 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('tools.gradientGenerator.addStop', 'Add Stop')}
            </button>
          </div>

          {colorStops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-gray-600"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) =>
                      updateColorStop(stop.id, 'position', Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 text-center mt-1">{t('tools.gradientGenerator.position', 'Position %')}</p>
                </div>

                <button
                  onClick={() => removeColorStop(stop.id)}
                  disabled={colorStops.length <= 2}
                  className={`p-2 rounded-lg transition-colors ${
                    colorStops.length <= 2
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={colorStops.length <= 2 ? t('tools.gradientGenerator.minimum2StopsRequired', 'Minimum 2 stops required') : t('tools.gradientGenerator.removeStop', 'Remove stop')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CSS Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-200">{t('tools.gradientGenerator.cssCode', 'CSS Code')}</label>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme="dark"
            />
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <code className="text-sm text-gray-300 font-mono break-all">
              background: {gradientCSS};
            </code>
          </div>
          <button
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              copied
                ? 'bg-green-600 text-white' : t('tools.gradientGenerator.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                {t('tools.gradientGenerator.copiedToClipboard', 'Copied to Clipboard!')}
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t('tools.gradientGenerator.copyCssCode', 'Copy CSS Code')}
              </>
            )}
          </button>
        </div>

        {/* Preset Gradients */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-200">
            {t('tools.gradientGenerator.presetGradients', 'Preset Gradients')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_GRADIENTS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group relative h-20 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-[#0D9488] transition-colors"
                style={{
                  background:
                    preset.type === 'linear'
                      ? `linear-gradient(${preset.angle}deg, ${preset.stops
                          .map((s) => `${s.color} ${s.position}%`)
                          .join(', ')})`
                      : `radial-gradient(circle, ${preset.stops
                          .map((s) => `${s.color} ${s.position}%`)
                          .join(', ')})`,
                }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">{t('tools.gradientGenerator.tips', 'Tips')}</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>{t('tools.gradientGenerator.use23ColorStops', 'Use 2-3 color stops for best results')}</li>
            <li>{t('tools.gradientGenerator.linearGradientsFlowInA', 'Linear gradients flow in a straight line at the specified angle')}</li>
            <li>{t('tools.gradientGenerator.radialGradientsEmanateFromThe', 'Radial gradients emanate from the center outward')}</li>
            <li>{t('tools.gradientGenerator.adjustColorStopPositionsTo', 'Adjust color stop positions to control color transitions')}</li>
          </ul>
        </div>
      </div>
    </ToolContainer>
  );
};
