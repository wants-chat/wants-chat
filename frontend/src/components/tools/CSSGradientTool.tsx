import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Copy, Check, RefreshCw, Plus, Trash2, Sparkles, Save, Loader2 } from 'lucide-react';
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
import { api } from '../../lib/api';

interface CSSGradientToolProps {
  uiConfig?: UIConfig;
}

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'color', header: 'Color', type: 'string' },
  { key: 'position', header: 'Position (%)', type: 'number' },
];

export const CSSGradientTool: React.FC<CSSGradientToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        gradientType?: 'linear' | 'radial' | 'conic';
        angle?: number;
        colorStops?: ColorStop[];
      };

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.gradientType) setGradientType(params.gradientType);
        if (params.angle !== undefined) setAngle(params.angle);
        if (params.colorStops && params.colorStops.length >= 2) {
          setColorStops(params.colorStops);
        }
      }

      if (params.gradientType) {
        setGradientType(params.gradientType);
        setIsPrefilled(true);
      }
    } else if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.gradientType) setGradientType(data.gradientType as 'linear' | 'radial' | 'conic');
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const presets = [
    { name: 'Sunset', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
    { name: 'Ocean', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
    { name: 'Forest', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
    { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
    { name: 'Aurora', stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 50 }, { color: '#7c3aed', position: 100 }] },
    { name: 'Midnight', stops: [{ color: '#232526', position: 0 }, { color: '#414345', position: 100 }] },
    { name: 'Rainbow', stops: [{ color: '#ff0000', position: 0 }, { color: '#ffff00', position: 25 }, { color: '#00ff00', position: 50 }, { color: '#00ffff', position: 75 }, { color: '#ff00ff', position: 100 }] },
  ];

  const gradientCSS = useMemo(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${stopsStr})`;
      case 'radial':
        return `radial-gradient(circle, ${stopsStr})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
  }, [gradientType, angle, colorStops]);

  const fullCSS = `background: ${gradientCSS};`;

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addColorStop = () => {
    const positions = colorStops.map((s) => s.position);
    const newPosition = positions.length > 0
      ? Math.round((Math.min(...positions) + Math.max(...positions)) / 2)
      : 50;

    setColorStops([
      ...colorStops,
      { id: Date.now().toString(), color: '#ffffff', position: newPosition },
    ]);
  };

  const updateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(colorStops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((s) => s.id !== id));
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setColorStops(preset.stops.map((s, i) => ({ id: Date.now().toString() + i, ...s })));
  };

  const randomize = () => {
    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColorStops([
      { id: '1', color: randomColor(), position: 0 },
      { id: '2', color: randomColor(), position: 100 },
    ]);
    setAngle(Math.floor(Math.random() * 360));
  };

  // Export handlers
  const exportData = colorStops.map(({ id, ...rest }) => rest);

  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'css-gradient' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'css-gradient' });
  };

  const handleExportJSON = () => {
    const dataWithMetadata = {
      gradientType,
      angle,
      colorStops: exportData,
      cssOutput: gradientCSS,
      fullCSS,
    };
    exportToJSON([dataWithMetadata], { filename: 'css-gradient', includeMetadata: true });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'css-gradient',
      title: 'CSS Gradient Configuration',
      subtitle: `Type: ${gradientType}, Angle: ${angle}°`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, { title: 'CSS Gradient Configuration' });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil([{ css: fullCSS, type: gradientType, angle, colors: exportData.length }],
      [{ key: 'css', header: 'CSS Code' }]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      // Create a canvas to render the gradient as an image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');

      // Create gradient
      let gradient: CanvasGradient;
      const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);

      if (gradientType === 'linear') {
        const radians = (angle - 90) * Math.PI / 180;
        const x1 = 200 + Math.cos(radians + Math.PI) * 200;
        const y1 = 100 + Math.sin(radians + Math.PI) * 100;
        const x2 = 200 + Math.cos(radians) * 200;
        const y2 = 100 + Math.sin(radians) * 100;
        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      } else if (gradientType === 'radial') {
        gradient = ctx.createRadialGradient(200, 100, 0, 200, 100, 150);
      } else {
        // Conic gradient approximation using linear
        const radians = (angle - 90) * Math.PI / 180;
        const x1 = 200 + Math.cos(radians + Math.PI) * 200;
        const y1 = 100 + Math.sin(radians + Math.PI) * 100;
        const x2 = 200 + Math.cos(radians) * 200;
        const y2 = 100 + Math.sin(radians) * 100;
        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      }

      sortedStops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 200);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });

      const formData = new FormData();
      formData.append('file', blob, `gradient-${gradientType}-${Date.now()}.png`);
      formData.append('toolId', 'css-gradient');
      formData.append('metadata', JSON.stringify({
        toolId: 'css-gradient',
        gradientType,
        angle,
        colorStops,
        cssOutput: gradientCSS,
        fullCSS,
      }));

      const result = await api.post('/content/upload', formData);

      if (result.success) {
        // Call onSaveCallback if provided
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save gradient');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Palette className="w-5 h-5 text-pink-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cSSGradient.cssGradientGenerator', 'CSS Gradient Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cSSGradient.createBeautifulCssGradients', 'Create beautiful CSS gradients')}</p>
            </div>
          </div>
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

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-pink-900/20 border border-pink-800' : 'bg-pink-50 border border-pink-200'}`}>
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className={`text-sm ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
            {t('tools.cSSGradient.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Preview */}
        <div
          ref={previewRef}
          className="h-48 rounded-xl shadow-inner"
          style={{ background: gradientCSS }}
        />

        {/* Gradient Type */}
        <div className="flex gap-2">
          {(['linear', 'radial', 'conic'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setGradientType(type)}
              className={`flex-1 py-2 rounded-lg capitalize ${gradientType === type ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Angle (for linear and conic) */}
        {(gradientType === 'linear' || gradientType === 'conic') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {gradientType === 'linear' ? t('tools.cSSGradient.direction', 'Direction') : t('tools.cSSGradient.start', 'Start')} Angle
              </label>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex gap-2">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className={`flex-1 py-1 text-xs rounded ${angle === a ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Stops */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cSSGradient.colorStops', 'Color Stops')}</h4>
            <button
              onClick={addColorStop}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {colorStops.map((stop) => (
            <div key={stop.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                className={`w-24 px-3 py-2 rounded-lg border text-sm font-mono ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => updateColorStop(stop.id, 'position', parseInt(e.target.value))}
                  className="flex-1 accent-pink-500"
                />
                <span className={`w-12 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stop.position}%</span>
              </div>
              <button
                onClick={() => removeColorStop(stop.id)}
                disabled={colorStops.length <= 2}
                className={`p-2 rounded-lg ${colorStops.length <= 2 ? 'opacity-30' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cSSGradient.presets', 'Presets')}</h4>
            <button
              onClick={randomize}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <RefreshCw className="w-4 h-4" /> Random
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
                style={{
                  background: `linear-gradient(90deg, ${preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`,
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                }}
              >
                <span className="text-white drop-shadow">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CSS Output */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cSSGradient.cssCode', 'CSS Code')}</h4>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tools.cSSGradient.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('tools.cSSGradient.saveToLibrary', 'Save to Library')}
                  </>
                )}
              </button>
              <button
                onClick={copyCSS}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.cSSGradient.copied', 'Copied!') : t('tools.cSSGradient.copy', 'Copy')}
              </button>
            </div>
          </div>
          <code className={`block text-sm font-mono p-3 rounded-lg ${isDark ? 'bg-gray-900 text-pink-400' : 'bg-white text-pink-600'} break-all`}>
            {fullCSS}
          </code>
        </div>
      </div>
    </div>
  );
};

export default CSSGradientTool;
