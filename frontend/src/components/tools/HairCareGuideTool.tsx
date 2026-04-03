import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Droplets, Calendar, Clock, Scissors, Info, Check, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type HairType = 'straight' | 'wavy' | 'curly' | 'coily';
type HairPorosity = 'low' | 'medium' | 'high';
type ScalpType = 'oily' | 'normal' | 'dry';
type ActiveTab = 'identifier' | 'products' | 'schedule' | 'treatments' | 'trim';

interface HairProfile {
  type: HairType;
  porosity: HairPorosity;
  scalp: ScalpType;
}

interface Treatment {
  id: string;
  name: string;
  date: string;
  nextDate: string;
  frequency: number; // days
}

interface TrimRecord {
  id: string;
  date: string;
  notes: string;
}

interface HairCareGuideToolProps {
  uiConfig?: UIConfig;
}

export const HairCareGuideTool: React.FC<HairCareGuideToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('identifier');
  const [hairProfile, setHairProfile] = useState<HairProfile>({
    type: 'straight',
    porosity: 'medium',
    scalp: 'normal',
  });

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.tab && ['identifier', 'products', 'schedule', 'treatments', 'trim'].includes(params.tab)) {
        setActiveTab(params.tab as ActiveTab);
        hasChanges = true;
      }
      if (params.hairType && ['straight', 'wavy', 'curly', 'coily'].includes(params.hairType)) {
        setHairProfile(prev => ({ ...prev, type: params.hairType as HairType }));
        hasChanges = true;
      }
      if (params.porosity && ['low', 'medium', 'high'].includes(params.porosity)) {
        setHairProfile(prev => ({ ...prev, porosity: params.porosity as HairPorosity }));
        hasChanges = true;
      }
      if (params.scalpType && ['oily', 'normal', 'dry'].includes(params.scalpType)) {
        setHairProfile(prev => ({ ...prev, scalp: params.scalpType as ScalpType }));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [trimRecords, setTrimRecords] = useState<TrimRecord[]>([]);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [newTreatmentFrequency, setNewTreatmentFrequency] = useState('7');
  const [lastTrimDate, setLastTrimDate] = useState('');
  const [trimNotes, setTrimNotes] = useState('');
  const [trimFrequency, setTrimFrequency] = useState('8'); // weeks

  const hairTypes: Record<HairType, { name: string; description: string; characteristics: string[] }> = {
    straight: {
      name: 'Straight (Type 1)',
      description: 'Hair lies flat from root to tip',
      characteristics: ['Shiny', 'Can get oily quickly', 'Resistant to curling', 'Smooth texture'],
    },
    wavy: {
      name: 'Wavy (Type 2)',
      description: 'S-shaped waves, between straight and curly',
      characteristics: ['Loose waves', 'Medium texture', 'Can frizz in humidity', 'Versatile styling'],
    },
    curly: {
      name: 'Curly (Type 3)',
      description: 'Defined spiral curls',
      characteristics: ['Springy curls', 'Prone to dryness', 'Volume at roots', 'Defined pattern'],
    },
    coily: {
      name: 'Coily (Type 4)',
      description: 'Tight coils or zigzag pattern',
      characteristics: ['Very tight curls', 'Most fragile', 'Shrinkage', 'Needs moisture'],
    },
  };

  const porosityInfo: Record<HairPorosity, { name: string; test: string; care: string }> = {
    low: {
      name: 'Low Porosity',
      test: 'Hair floats on water, products sit on surface',
      care: 'Use heat when conditioning, light products, avoid protein overload',
    },
    medium: {
      name: 'Medium Porosity',
      test: 'Hair slowly sinks in water, holds styles well',
      care: 'Balanced routine, occasional deep conditioning, most products work',
    },
    high: {
      name: 'High Porosity',
      test: 'Hair sinks quickly, absorbs and loses moisture fast',
      care: 'Protein treatments, heavy creams, leave-in conditioners, seal with oils',
    },
  };

  const productRecommendations = useMemo(() => {
    const { type, porosity, scalp } = hairProfile;
    const products: { category: string; recommendations: string[] }[] = [];

    // Shampoo recommendations
    const shampoos = [];
    if (scalp === 'oily') shampoos.push('Clarifying shampoo', 'Volumizing shampoo', 'Tea tree shampoo');
    if (scalp === 'normal') shampoos.push('Gentle sulfate-free shampoo', 'Moisturizing shampoo');
    if (scalp === 'dry') shampoos.push('Hydrating shampoo', 'Co-wash', 'Cream cleanser');
    products.push({ category: 'Shampoo', recommendations: shampoos });

    // Conditioner recommendations
    const conditioners = [];
    if (type === 'straight' || type === 'wavy') {
      conditioners.push('Lightweight conditioner', 'Volumizing conditioner');
    }
    if (type === 'curly' || type === 'coily') {
      conditioners.push('Deep conditioner', 'Leave-in conditioner', 'Hair mask');
    }
    if (porosity === 'high') conditioners.push('Protein-rich conditioner');
    if (porosity === 'low') conditioners.push('Humectant-free conditioner');
    products.push({ category: 'Conditioner', recommendations: conditioners });

    // Styling products
    const styling = [];
    if (type === 'straight') styling.push('Heat protectant', 'Smoothing serum', 'Volumizing mousse');
    if (type === 'wavy') styling.push('Sea salt spray', 'Curl cream', 'Light mousse');
    if (type === 'curly') styling.push('Curl defining cream', 'Gel', 'Diffuser spray');
    if (type === 'coily') styling.push('Butter cream', 'Twist cream', 'Edge control');
    products.push({ category: 'Styling', recommendations: styling });

    // Treatments
    const treatmentProducts = [];
    if (porosity === 'high') treatmentProducts.push('Protein treatment', 'Bonding treatment');
    if (porosity === 'low') treatmentProducts.push('Clarifying treatment', 'Apple cider vinegar rinse');
    treatmentProducts.push('Scalp treatment', 'Hair oil', 'Deep conditioning mask');
    products.push({ category: 'Treatments', recommendations: treatmentProducts });

    return products;
  }, [hairProfile]);

  const washSchedule = useMemo(() => {
    const { type, scalp } = hairProfile;
    let frequency = { min: 2, max: 3, unit: 'days' };
    let tips: string[] = [];

    if (scalp === 'oily') {
      if (type === 'straight') {
        frequency = { min: 1, max: 2, unit: 'days' };
        tips = ['Use dry shampoo between washes', 'Avoid heavy products', 'Focus conditioner on ends only'];
      } else {
        frequency = { min: 2, max: 3, unit: 'days' };
        tips = ['Co-wash between shampoos', 'Use lightweight products', 'Avoid touching hair'];
      }
    } else if (scalp === 'normal') {
      if (type === 'straight' || type === 'wavy') {
        frequency = { min: 2, max: 4, unit: 'days' };
        tips = ['Adjust based on activity level', 'Use sulfate-free shampoo', 'Deep condition weekly'];
      } else {
        frequency = { min: 4, max: 7, unit: 'days' };
        tips = ['Refresh curls with water spray', 'Protect hair at night', 'Pre-poo before washing'];
      }
    } else {
      if (type === 'straight' || type === 'wavy') {
        frequency = { min: 4, max: 5, unit: 'days' };
        tips = ['Avoid hot water', 'Use hydrating products', 'Air dry when possible'];
      } else {
        frequency = { min: 7, max: 14, unit: 'days' };
        tips = ['Deep condition before and after', 'Use protective styles', 'Seal moisture with oil'];
      }
    }

    return { frequency, tips };
  }, [hairProfile]);

  const addTreatment = () => {
    if (!newTreatmentName.trim()) return;
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + parseInt(newTreatmentFrequency));

    const newTreatment: Treatment = {
      id: Date.now().toString(),
      name: newTreatmentName,
      date: today.toISOString().split('T')[0],
      nextDate: nextDate.toISOString().split('T')[0],
      frequency: parseInt(newTreatmentFrequency),
    };
    setTreatments([...treatments, newTreatment]);
    setNewTreatmentName('');
  };

  const completeTreatment = (id: string) => {
    setTreatments(treatments.map(t => {
      if (t.id === id) {
        const today = new Date();
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + t.frequency);
        return {
          ...t,
          date: today.toISOString().split('T')[0],
          nextDate: nextDate.toISOString().split('T')[0],
        };
      }
      return t;
    }));
  };

  const removeTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };

  const addTrimRecord = () => {
    if (!lastTrimDate) return;
    const newRecord: TrimRecord = {
      id: Date.now().toString(),
      date: lastTrimDate,
      notes: trimNotes,
    };
    setTrimRecords([newRecord, ...trimRecords]);
    setLastTrimDate('');
    setTrimNotes('');
  };

  const nextTrimDate = useMemo(() => {
    if (trimRecords.length === 0) return null;
    const lastTrim = new Date(trimRecords[0].date);
    const next = new Date(lastTrim);
    next.setDate(lastTrim.getDate() + parseInt(trimFrequency) * 7);
    return next;
  }, [trimRecords, trimFrequency]);

  const daysUntilTrim = useMemo(() => {
    if (!nextTrimDate) return null;
    const today = new Date();
    const diff = Math.ceil((nextTrimDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [nextTrimDate]);

  const tabs: { id: ActiveTab; name: string; icon: React.ReactNode }[] = [
    { id: 'identifier', name: 'Hair Type', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'products', name: 'Products', icon: <Droplets className="w-4 h-4" /> },
    { id: 'schedule', name: 'Wash', icon: <Calendar className="w-4 h-4" /> },
    { id: 'treatments', name: 'Treatments', icon: <Clock className="w-4 h-4" /> },
    { id: 'trim', name: 'Trim', icon: <Scissors className="w-4 h-4" /> },
  ];

  // Define export columns for CSV export
  const COLUMNS = [
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'porosity', label: 'Porosity' },
    { key: 'scalp', label: 'Scalp Type' },
    { key: 'name', label: 'Item Name' },
    { key: 'date', label: 'Date' },
    { key: 'nextDate', label: 'Next Date' },
    { key: 'frequency', label: 'Frequency (days)' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleExportCSV = () => {
    const rows = [];

    // Add hair profile data
    rows.push({
      category: 'Hair Profile',
      type: hairProfile.type,
      porosity: hairProfile.porosity,
      scalp: hairProfile.scalp,
      name: '',
      date: '',
      nextDate: '',
      frequency: '',
      notes: '',
    });

    // Add treatments
    treatments.forEach(treatment => {
      rows.push({
        category: 'Treatment',
        type: '',
        porosity: '',
        scalp: '',
        name: treatment.name,
        date: treatment.date,
        nextDate: treatment.nextDate,
        frequency: treatment.frequency,
        notes: '',
      });
    });

    // Add trim records
    trimRecords.forEach(record => {
      rows.push({
        category: 'Trim Record',
        type: '',
        porosity: '',
        scalp: '',
        name: '',
        date: record.date,
        nextDate: '',
        frequency: parseInt(trimFrequency) * 7,
        notes: record.notes,
      });
    });

    // Generate CSV
    const headers = COLUMNS.map(col => col.label).join(',');
    const csvContent = [
      headers,
      ...rows.map(row =>
        COLUMNS.map(col => {
          const value = row[col.key as keyof typeof row] ?? '';
          const escaped = String(value).includes(',') ? `"${value}"` : value;
          return escaped;
        }).join(',')
      ),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hair-care-guide-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-pink-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hairCareGuide.hairCareGuide', 'Hair Care Guide')}</h3>
                {isPrefilled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                    <Sparkles className="w-3 h-3" />
                    {t('tools.hairCareGuide.autoFilled', 'Auto-filled')}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hairCareGuide.personalizedHairCareRecommendations', 'Personalized hair care recommendations')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportCSV={handleExportCSV}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Hair Type Identifier */}
        {activeTab === 'identifier' && (
          <div className="space-y-6">
            {/* Hair Type Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hairCareGuide.selectYourHairType', 'Select Your Hair Type')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(hairTypes) as HairType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHairProfile({ ...hairProfile, type })}
                    className={`p-3 rounded-lg text-left ${hairProfile.type === type ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <div className="font-medium text-sm">{hairTypes[type].name}</div>
                    <div className={`text-xs mt-1 ${hairProfile.type === type ? 'text-pink-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {hairTypes[type].description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Type Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {hairTypes[hairProfile.type].name} Characteristics
              </h4>
              <ul className="space-y-1">
                {hairTypes[hairProfile.type].characteristics.map((char, idx) => (
                  <li key={idx} className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Check className="w-3 h-3 text-pink-500" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            {/* Porosity Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hairCareGuide.hairPorosity', 'Hair Porosity')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(porosityInfo) as HairPorosity[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setHairProfile({ ...hairProfile, porosity: p })}
                    className={`py-2 px-3 rounded-lg text-sm ${hairProfile.porosity === p ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {porosityInfo[p].name}
                  </button>
                ))}
              </div>
              <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <strong>{t('tools.hairCareGuide.test', 'Test:')}</strong> {porosityInfo[hairProfile.porosity].test}
                </p>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.hairCareGuide.care', 'Care:')}</strong> {porosityInfo[hairProfile.porosity].care}
                </p>
              </div>
            </div>

            {/* Scalp Type Selection */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hairCareGuide.scalpType', 'Scalp Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['oily', 'normal', 'dry'] as ScalpType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setHairProfile({ ...hairProfile, scalp: s })}
                    className={`py-2 px-3 rounded-lg text-sm capitalize ${hairProfile.scalp === s ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Recommendations */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Based on your <strong>{hairTypes[hairProfile.type].name}</strong>, <strong>{porosityInfo[hairProfile.porosity].name}</strong>, and <strong>{hairProfile.scalp} scalp</strong>:
              </p>
            </div>
            {productRecommendations.map((category) => (
              <div key={category.category} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {category.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.recommendations.map((rec, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wash Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hairCareGuide.recommendedWashFrequency', 'Recommended Wash Frequency')}</div>
              <div className="text-4xl font-bold text-pink-500 my-2">
                {washSchedule.frequency.min}-{washSchedule.frequency.max} {washSchedule.frequency.unit}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Based on your {hairTypes[hairProfile.type].name.toLowerCase()} hair and {hairProfile.scalp} scalp
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hairCareGuide.washDayTips', 'Wash Day Tips')}</h4>
              <ul className="space-y-2">
                {washSchedule.tips.map((tip, idx) => (
                  <li key={idx} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.hairCareGuide.remember', 'Remember:')}</strong> These are guidelines. Adjust based on your lifestyle, climate, and how your hair feels. Over-washing can strip natural oils, while under-washing can cause buildup.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Treatment Tracker */}
        {activeTab === 'treatments' && (
          <div className="space-y-4">
            {/* Add New Treatment */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hairCareGuide.addTreatment', 'Add Treatment')}</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTreatmentName}
                  onChange={(e) => setNewTreatmentName(e.target.value)}
                  placeholder={t('tools.hairCareGuide.treatmentNameEGDeep', 'Treatment name (e.g., Deep Conditioning)')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.hairCareGuide.repeatEveryDays', 'Repeat every (days)')}
                    </label>
                    <input
                      type="number"
                      value={newTreatmentFrequency}
                      onChange={(e) => setNewTreatmentFrequency(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <button
                    onClick={addTreatment}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 self-end"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Treatment List */}
            {treatments.length === 0 ? (
              <div className={`p-6 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Clock className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.hairCareGuide.noTreatmentsTrackedYet', 'No treatments tracked yet')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.hairCareGuide.addTreatmentsLikeDeepConditioning', 'Add treatments like deep conditioning, protein masks, etc.')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {treatments.map((treatment) => {
                  const isOverdue = new Date(treatment.nextDate) < new Date();
                  return (
                    <div
                      key={treatment.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${isOverdue ? 'border-l-4 border-l-orange-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {treatment.name}
                          </h5>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last: {treatment.date} | Next: {treatment.nextDate}
                          </p>
                          {isOverdue && (
                            <span className="text-xs text-orange-500 font-medium">{t('tools.hairCareGuide.overdue', 'Overdue!')}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => completeTreatment(treatment.id)}
                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"
                            title={t('tools.hairCareGuide.markAsDone', 'Mark as done')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeTreatment(treatment.id)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                            title={t('tools.hairCareGuide.remove', 'Remove')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Add Suggestions */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hairCareGuide.quickAdd', 'Quick add:')}</p>
              <div className="flex flex-wrap gap-2">
                {['Deep Conditioning', 'Protein Treatment', 'Scalp Massage', 'Hot Oil Treatment', 'Clarifying Wash'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setNewTreatmentName(suggestion)}
                    className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trim Reminder */}
        {activeTab === 'trim' && (
          <div className="space-y-4">
            {/* Next Trim Card */}
            <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Scissors className={`w-8 h-8 mx-auto mb-2 ${daysUntilTrim !== null && daysUntilTrim <= 0 ? 'text-orange-500' : 'text-pink-500'}`} />
              {nextTrimDate ? (
                <>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hairCareGuide.nextTrim', 'Next Trim')}</div>
                  <div className={`text-3xl font-bold my-1 ${daysUntilTrim !== null && daysUntilTrim <= 0 ? 'text-orange-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    {daysUntilTrim !== null && daysUntilTrim <= 0
                      ? `${Math.abs(daysUntilTrim)} days overdue`
                      : `${daysUntilTrim} days`}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {nextTrimDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hairCareGuide.noTrimRecordedYet', 'No trim recorded yet')}</div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('tools.hairCareGuide.logYourLastTrimTo', 'Log your last trim to track your schedule')}
                  </p>
                </>
              )}
            </div>

            {/* Trim Frequency */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.hairCareGuide.trimFrequencyWeeks', 'Trim Frequency (weeks)')}
              </label>
              <div className="flex gap-2">
                {[6, 8, 10, 12].map((weeks) => (
                  <button
                    key={weeks}
                    onClick={() => setTrimFrequency(weeks.toString())}
                    className={`flex-1 py-2 rounded-lg ${parseInt(trimFrequency) === weeks ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {weeks}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Trim */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hairCareGuide.logATrim', 'Log a Trim')}</h4>
              <div className="space-y-3">
                <input
                  type="date"
                  value={lastTrimDate}
                  onChange={(e) => setLastTrimDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="text"
                  value={trimNotes}
                  onChange={(e) => setTrimNotes(e.target.value)}
                  placeholder={t('tools.hairCareGuide.notesOptional', 'Notes (optional)')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={addTrimRecord}
                  disabled={!lastTrimDate}
                  className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('tools.hairCareGuide.logTrim', 'Log Trim')}
                </button>
              </div>
            </div>

            {/* Trim History */}
            {trimRecords.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hairCareGuide.trimHistory', 'Trim History')}</h4>
                {trimRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{record.date}</span>
                      {record.notes && (
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{record.notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.hairCareGuide.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>{t('tools.hairCareGuide.regularTrimsPreventSplitEnds', 'Regular trims prevent split ends from traveling up')}</li>
                    <li>6-8 weeks is ideal for short hair</li>
                    <li>10-12 weeks works for longer, healthier hair</li>
                    <li>{t('tools.hairCareGuide.trimMoreOftenIfYou', 'Trim more often if you use heat styling')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HairCareGuideTool;
