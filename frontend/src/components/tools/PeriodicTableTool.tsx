import React, { useState, useMemo, useEffect } from 'react';
import { Atom, Search, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PeriodicTableToolProps {
  uiConfig?: UIConfig;
}

interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: string;
  group: number;
  period: number;
}

export const PeriodicTableTool: React.FC<PeriodicTableToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setSearch(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const elements: Element[] = [
    { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1 },
    { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'noble', group: 18, period: 1 },
    { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, category: 'alkali', group: 1, period: 2 },
    { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'alkaline', group: 2, period: 2 },
    { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2 },
    { number: 6, symbol: 'C', name: 'Carbon', mass: 12.01, category: 'nonmetal', group: 14, period: 2 },
    { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.01, category: 'nonmetal', group: 15, period: 2 },
    { number: 8, symbol: 'O', name: 'Oxygen', mass: 16.00, category: 'nonmetal', group: 16, period: 2 },
    { number: 9, symbol: 'F', name: 'Fluorine', mass: 19.00, category: 'halogen', group: 17, period: 2 },
    { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, category: 'noble', group: 18, period: 2 },
    { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, category: 'alkali', group: 1, period: 3 },
    { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.31, category: 'alkaline', group: 2, period: 3 },
    { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.98, category: 'post-transition', group: 13, period: 3 },
    { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.09, category: 'metalloid', group: 14, period: 3 },
    { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.97, category: 'nonmetal', group: 15, period: 3 },
    { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.07, category: 'nonmetal', group: 16, period: 3 },
    { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3 },
    { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.95, category: 'noble', group: 18, period: 3 },
    { number: 19, symbol: 'K', name: 'Potassium', mass: 39.10, category: 'alkali', group: 1, period: 4 },
    { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.08, category: 'alkaline', group: 2, period: 4 },
    { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.85, category: 'transition', group: 8, period: 4 },
    { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.55, category: 'transition', group: 11, period: 4 },
    { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition', group: 12, period: 4 },
    { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition', group: 11, period: 5 },
    { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition', group: 11, period: 6 },
  ];

  const categoryColors: Record<string, { bg: string; text: string }> = {
    alkali: { bg: 'bg-red-500', text: 'text-red-500' },
    alkaline: { bg: 'bg-orange-500', text: 'text-orange-500' },
    transition: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
    'post-transition': { bg: 'bg-green-500', text: 'text-green-500' },
    metalloid: { bg: 'bg-teal-500', text: 'text-teal-500' },
    nonmetal: { bg: 'bg-blue-500', text: 'text-blue-500' },
    halogen: { bg: 'bg-indigo-500', text: 'text-indigo-500' },
    noble: { bg: 'bg-purple-500', text: 'text-purple-500' },
  };

  const filteredElements = useMemo(() => {
    if (!search) return elements;
    const s = search.toLowerCase();
    return elements.filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.symbol.toLowerCase().includes(s) ||
      e.number.toString().includes(s)
    );
  }, [search, elements]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Atom className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.periodicTable.periodicTable', 'Periodic Table')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.periodicTable.exploreChemicalElements', 'Explore chemical elements')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.periodicTable.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('tools.periodicTable.searchByNameSymbolOr', 'Search by name, symbol, or number...')} className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
        </div>

        {/* Element Detail Modal */}
        {selectedElement && (
          <div className={`p-4 rounded-xl border-2 ${categoryColors[selectedElement.category].bg.replace('bg-', 'border-')} ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center ${categoryColors[selectedElement.category].bg} text-white`}>
                  <span className="text-xs">{selectedElement.number}</span>
                  <span className="text-3xl font-bold">{selectedElement.symbol}</span>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedElement.name}</h3>
                  <p className={`capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedElement.category.replace('-', ' ')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedElement(null)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div><span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.periodicTable.atomicNumber', 'Atomic Number')}</span><br/><strong className={isDark ? 'text-white' : 'text-gray-900'}>{selectedElement.number}</strong></div>
              <div><span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.periodicTable.atomicMass', 'Atomic Mass')}</span><br/><strong className={isDark ? 'text-white' : 'text-gray-900'}>{selectedElement.mass}</strong></div>
              <div><span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.periodicTable.group', 'Group')}</span><br/><strong className={isDark ? 'text-white' : 'text-gray-900'}>{selectedElement.group}</strong></div>
              <div><span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.periodicTable.period', 'Period')}</span><br/><strong className={isDark ? 'text-white' : 'text-gray-900'}>{selectedElement.period}</strong></div>
            </div>
          </div>
        )}

        {/* Elements Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {filteredElements.map((element) => (
            <button key={element.number} onClick={() => setSelectedElement(element)} className={`p-2 rounded-lg text-center transition-transform hover:scale-110 ${categoryColors[element.category].bg} text-white`}>
              <div className="text-[10px] opacity-75">{element.number}</div>
              <div className="text-lg font-bold">{element.symbol}</div>
              <div className="text-[8px] truncate">{element.name}</div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.periodicTable.elementCategories', 'Element Categories')}</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([cat, colors]) => (
              <span key={cat} className="flex items-center gap-1 text-xs">
                <span className={`w-3 h-3 rounded ${colors.bg}`}></span>
                <span className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.replace('-', ' ')}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodicTableTool;
