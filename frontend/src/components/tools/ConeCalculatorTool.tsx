import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Triangle, Info, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ConeCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface CalculationResults {
  radius: number;
  diameter: number;
  height: number;
  slantHeight: number;
  volume: number;
  lateralSurfaceArea: number;
  totalSurfaceArea: number;
  baseArea: number;
}

const ConeCalculatorTool: React.FC<ConeCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [radius, setRadius] = useState<string>('5');
  const [height, setHeight] = useState<string>('10');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [copied, setCopied] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setRadius(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent) {
        // Try to extract radius and height pattern
        const dimensionMatch = textContent.match(/(\d+(?:\.\d+)?)\s*[xX,]\s*(\d+(?:\.\d+)?)/);
        if (dimensionMatch) {
          setRadius(dimensionMatch[1]);
          setHeight(dimensionMatch[2]);
          setIsPrefilled(true);
        } else if (!params.amount) {
          const numMatch = textContent.match(/[\d.]+/);
          if (numMatch) {
            setRadius(numMatch[0]);
            setIsPrefilled(true);
          }
        }
      }
    }
  }, [uiConfig?.params]);

  const calculateCone = (r: number, h: number): CalculationResults => {
    const slantHeight = Math.sqrt(r * r + h * h);
    const baseArea = Math.PI * r * r;
    const lateralSurfaceArea = Math.PI * r * slantHeight;
    const totalSurfaceArea = baseArea + lateralSurfaceArea;
    const volume = (1 / 3) * baseArea * h;

    return {
      radius: r,
      diameter: r * 2,
      height: h,
      slantHeight,
      volume,
      lateralSurfaceArea,
      totalSurfaceArea,
      baseArea,
    };
  };

  useEffect(() => {
    const r = parseFloat(radius);
    const h = parseFloat(height);

    if (isNaN(r) || isNaN(h) || r <= 0 || h <= 0) {
      setResults(null);
      return;
    }

    setResults(calculateCone(r, h));
  }, [radius, height]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return num.toExponential(4);
    }
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ value, label }: { value: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(value, label)}
      className={`p-1.5 rounded ${
        copied === label ? 'text-green-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {copied === label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Triangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.coneCalculator.title', 'Cone Calculator')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.coneCalculator.description', 'Calculate volume and surface area of a cone')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.coneCalculator.prefilled', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="mb-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.coneCalculator.radius', 'Radius (r)')}
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="0"
                step="any"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
                placeholder={t('tools.coneCalculator.enterRadius', 'Enter radius')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.coneCalculator.height', 'Height (h)')}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="0"
                step="any"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono text-lg`}
                placeholder={t('tools.coneCalculator.enterHeight', 'Enter height')}
              />
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {t('tools.coneCalculator.results', 'Results')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Volume */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.coneCalculator.volume', 'Volume (V = 1/3 πr²h)')}
                    </span>
                    <CopyButton value={formatNumber(results.volume)} label="volume" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.volume)} <span className="text-sm opacity-75">units³</span>
                  </div>
                </div>

                {/* Total Surface Area */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.coneCalculator.totalSurfaceArea', 'Total Surface Area')}
                    </span>
                    <CopyButton value={formatNumber(results.totalSurfaceArea)} label="totalSA" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.totalSurfaceArea)} <span className="text-sm opacity-75">units²</span>
                  </div>
                </div>

                {/* Lateral Surface Area */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lateral Surface Area (πrl)
                    </span>
                    <CopyButton value={formatNumber(results.lateralSurfaceArea)} label="lateralSA" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.lateralSurfaceArea)} <span className="text-sm opacity-75">units²</span>
                  </div>
                </div>

                {/* Base Area */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Base Area (πr²)
                    </span>
                    <CopyButton value={formatNumber(results.baseArea)} label="baseArea" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.baseArea)} <span className="text-sm opacity-75">units²</span>
                  </div>
                </div>

                {/* Slant Height */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Slant Height (l = √(r² + h²))
                    </span>
                    <CopyButton value={formatNumber(results.slantHeight)} label="slantHeight" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.slantHeight)}
                  </div>
                </div>

                {/* Diameter */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Diameter (d = 2r)
                    </span>
                    <CopyButton value={formatNumber(results.diameter)} label="diameter" />
                  </div>
                  <div className="font-mono text-xl text-[#0D9488] font-bold">
                    {formatNumber(results.diameter)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Representation */}
          {results && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Visual Representation
              </h3>
              <div className="flex justify-center">
                <svg width="200" height="220" viewBox="0 0 200 220">
                  {/* Cone body */}
                  <polygon
                    points="100,20 40,180 160,180"
                    fill={isDarkMode ? 'rgba(13, 148, 136, 0.3)' : 'rgba(13, 148, 136, 0.2)'}
                    stroke="#0D9488"
                    strokeWidth="2"
                  />
                  {/* Base ellipse */}
                  <ellipse
                    cx="100"
                    cy="180"
                    rx="60"
                    ry="20"
                    fill={isDarkMode ? 'rgba(13, 148, 136, 0.3)' : 'rgba(13, 148, 136, 0.2)'}
                    stroke="#0D9488"
                    strokeWidth="2"
                  />
                  {/* Height line */}
                  <line x1="100" y1="20" x2="100" y2="180" stroke="#0D9488" strokeWidth="2" strokeDasharray="5,5" />
                  {/* Radius line */}
                  <line x1="100" y1="180" x2="160" y2="180" stroke="#0D9488" strokeWidth="2" strokeDasharray="5,5" />
                  {/* Slant height line */}
                  <line x1="100" y1="20" x2="160" y2="180" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3,3" />
                  {/* Apex point */}
                  <circle cx="100" cy="20" r="4" fill="#0D9488" />
                  {/* Labels */}
                  <text x="90" y="105" fill={isDarkMode ? '#fff' : '#333'} fontSize="11" textAnchor="end">h</text>
                  <text x="130" y="195" fill={isDarkMode ? '#fff' : '#333'} fontSize="11" textAnchor="middle">r</text>
                  <text x="140" y="95" fill={isDarkMode ? '#14b8a6' : '#0D9488'} fontSize="10" textAnchor="middle">l</text>
                </svg>
              </div>
            </div>
          )}

          {/* Formulas */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="mb-2">
                <strong>Formulas:</strong>
              </p>
              <p className="mb-1 font-mono">Slant Height: l = √(r² + h²)</p>
              <p className="mb-1 font-mono">Volume: V = (1/3)πr²h</p>
              <p className="mb-1 font-mono">Lateral Surface Area: A<sub>L</sub> = πrl</p>
              <p className="mb-1 font-mono">Base Area: A<sub>B</sub> = πr²</p>
              <p className="mb-1 font-mono">Total Surface Area: A<sub>T</sub> = πr(r + l)</p>
              <p className="mt-2 text-xs">
                Where r = radius, h = height, l = slant height, and π (pi) ≈ 3.14159265359
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConeCalculatorTool;
