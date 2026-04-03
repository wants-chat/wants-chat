import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, RefreshCw, Copy, Check, Heart, HeartOff, Sparkles } from 'lucide-react';
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

type NameType = 'first' | 'last' | 'full' | 'username' | 'business';
type Gender = 'any' | 'male' | 'female';

const firstNamesMale = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Steven', 'Andrew', 'Joshua', 'Kevin', 'Brian', 'Edward', 'Ronald', 'Timothy',
  'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan',
  'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond',
];

const firstNamesFemale = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley',
  'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa',
  'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy',
  'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

const businessPrefixes = ['Tech', 'Digital', 'Smart', 'Cloud', 'Pro', 'Prime', 'Elite', 'Global', 'Next', 'Bright'];
const businessSuffixes = ['Labs', 'Solutions', 'Systems', 'Works', 'Hub', 'Space', 'Point', 'Logic', 'Forge', 'Wave'];

interface GeneratedName {
  name: string;
  type: string;
  timestamp: Date;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'timestamp', header: 'Generated At', type: 'date' },
];

interface NameGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const NameGeneratorTool: React.FC<NameGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [nameType, setNameType] = useState<NameType>('full');
  const [gender, setGender] = useState<Gender>('any');
  const [count, setCount] = useState(5);
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generateName = (): string => {
    const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const getFirstName = (): string => {
      if (gender === 'male') return getRandomItem(firstNamesMale);
      if (gender === 'female') return getRandomItem(firstNamesFemale);
      return getRandomItem([...firstNamesMale, ...firstNamesFemale]);
    };

    switch (nameType) {
      case 'first':
        return getFirstName();
      case 'last':
        return getRandomItem(lastNames);
      case 'full':
        return `${getFirstName()} ${getRandomItem(lastNames)}`;
      case 'username': {
        const first = getFirstName().toLowerCase();
        const num = Math.floor(Math.random() * 1000);
        const suffixes = ['_dev', '_pro', '', `${num}`, '_x', '_official'];
        return `${first}${getRandomItem(suffixes)}`;
      }
      case 'business':
        return `${getRandomItem(businessPrefixes)}${getRandomItem(businessSuffixes)}`;
      default:
        return '';
    }
  };

  const handleGenerate = () => {
    const names: GeneratedName[] = Array(count).fill(null).map(() => ({
      name: generateName(),
      type: nameType,
      timestamp: new Date(),
    }));
    setGeneratedNames(names);
  };

  const toggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter(f => f !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const text = generatedNames.map(item => item.name).join('\n');
    navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportCSV = () => {
    exportToCSV(generatedNames, COLUMNS, { filename: 'generated-names' });
  };

  const handleExportExcel = () => {
    exportToExcel(generatedNames, COLUMNS, { filename: 'generated-names' });
  };

  const handleExportJSON = () => {
    exportToJSON(generatedNames, { filename: 'generated-names' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(generatedNames, COLUMNS, {
      filename: 'generated-names',
      title: 'Generated Names',
      subtitle: 'Export of generated names',
    });
  };

  const handlePrint = () => {
    printData(generatedNames, COLUMNS, { title: 'Generated Names' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(generatedNames, COLUMNS, 'tab');
  };

  const nameTypes: { value: NameType; label: string }[] = [
    { value: 'full', label: 'Full Name' },
    { value: 'first', label: 'First Name' },
    { value: 'last', label: 'Last Name' },
    { value: 'username', label: 'Username' },
    { value: 'business', label: 'Business' },
  ];

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Name generator can prefill count if specified
      if (params.numbers && params.numbers.length > 0) {
        const prefillCount = Math.min(Math.max(1, params.numbers[0]), 20);
        setCount(prefillCount);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.nameGenerator.nameGenerator', 'Name Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.nameGenerator.generateRandomNamesForAny', 'Generate random names for any purpose')}</p>
          </div>
        </div>
        {generatedNames.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.nameGenerator.nameType', 'Name Type')}
            </label>
            <select
              value={nameType}
              onChange={(e) => setNameType(e.target.value as NameType)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {nameTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {(nameType === 'full' || nameType === 'first' || nameType === 'username') && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.nameGenerator.gender', 'Gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="any">{t('tools.nameGenerator.any', 'Any')}</option>
                <option value="male">{t('tools.nameGenerator.male', 'Male')}</option>
                <option value="female">{t('tools.nameGenerator.female', 'Female')}</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Count: {count}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <RefreshCw className="w-5 h-5" />
          {t('tools.nameGenerator.generateNames', 'Generate Names')}
        </button>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.nameGenerator.generatedNames', 'Generated Names')}
              </h4>
              <button
                onClick={copyAll}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied === 'all'
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy All
              </button>
            </div>
            <div className="grid gap-2">
              {generatedNames.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex-1">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                    <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({item.type})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(item.name)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.includes(item.name)
                          ? 'text-red-500 bg-red-500/10'
                          : isDark
                          ? 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-red-500 hover:bg-gray-200'
                      }`}
                    >
                      {favorites.includes(item.name) ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.name)}
                      className={`p-2 rounded-lg transition-colors ${
                        copied === item.name
                          ? 'bg-green-500 text-white'
                          : isDark
                          ? 'text-gray-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {copied === item.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                Favorites ({favorites.length})
              </h4>
              <button
                onClick={() => setFavorites([])}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('tools.nameGenerator.clear', 'Clear')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {favorites.map((name, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-full text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.nameGenerator.useCases', 'Use cases:')}</strong> Character names for stories, test data for development,
            business name brainstorming, username ideas, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NameGeneratorTool;
