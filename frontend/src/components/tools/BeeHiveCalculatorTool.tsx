import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Droplets, Calendar, ClipboardCheck, Ruler, Info, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BeeHiveCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculatorTab = 'planner' | 'yield' | 'space' | 'equipment' | 'seasonal' | 'inspection';

interface SeasonalTask {
  month: string;
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
}

interface EquipmentItem {
  name: string;
  quantity: number;
  essential: boolean;
  category: 'hive' | 'protective' | 'tools' | 'harvesting';
}

export const BeeHiveCalculatorTool: React.FC<BeeHiveCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [activeTab, setActiveTab] = useState<CalculatorTab>('planner');
  const [hiveCount, setHiveCount] = useState('2');
  const [hiveType, setHiveType] = useState<'langstroth' | 'topbar' | 'warre'>('langstroth');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [region, setRegion] = useState<'temperate' | 'subtropical' | 'tropical'>('temperate');
  const [checkedEquipment, setCheckedEquipment] = useState<Set<string>>(new Set());
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [inspectionFrequency, setInspectionFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('biweekly');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.hiveCount) setHiveCount(String(prefillData.hiveCount));
      if (prefillData.hiveType) setHiveType(prefillData.hiveType as 'langstroth' | 'topbar' | 'warre');
      if (prefillData.experienceLevel) setExperienceLevel(prefillData.experienceLevel as 'beginner' | 'intermediate' | 'advanced');
      if (prefillData.region) setRegion(prefillData.region as 'temperate' | 'subtropical' | 'tropical');
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const hiveTypes = {
    langstroth: {
      name: 'Langstroth',
      honeyYield: 30, // lbs per hive per season average
      spacePerHive: 16, // sq ft
      description: 'Most common, modular design, easy to expand',
    },
    topbar: {
      name: 'Top Bar',
      honeyYield: 20,
      spacePerHive: 20,
      description: 'Natural comb, less heavy lifting, good for beginners',
    },
    warre: {
      name: 'Warre',
      honeyYield: 25,
      spacePerHive: 12,
      description: 'Vertical, mimics natural hive, minimal intervention',
    },
  };

  const regionalModifiers = {
    temperate: { yieldMod: 1.0, seasonLength: 6, name: 'Temperate' },
    subtropical: { yieldMod: 1.3, seasonLength: 9, name: 'Subtropical' },
    tropical: { yieldMod: 1.5, seasonLength: 12, name: 'Tropical' },
  };

  const calculations = useMemo(() => {
    const count = parseInt(hiveCount) || 0;
    const config = hiveTypes[hiveType];
    const regionConfig = regionalModifiers[region];

    // Honey yield calculations
    const baseYield = config.honeyYield * count;
    const adjustedYield = baseYield * regionConfig.yieldMod;
    const minYield = adjustedYield * 0.6;
    const maxYield = adjustedYield * 1.4;

    // Space calculations
    const hiveSpace = config.spacePerHive * count;
    const workingSpace = count * 25; // Additional working space around hives
    const totalSpace = hiveSpace + workingSpace;

    // Recommended hives based on experience
    const recommendedHives = {
      beginner: 2,
      intermediate: 5,
      advanced: 10,
    };

    // Time investment per week (hours)
    const timePerHive = {
      beginner: 2,
      intermediate: 1.5,
      advanced: 1,
    };
    const weeklyTime = count * timePerHive[experienceLevel];

    return {
      hiveCount: count,
      honeyYieldMin: Math.round(minYield),
      honeyYieldAvg: Math.round(adjustedYield),
      honeyYieldMax: Math.round(maxYield),
      honeyYieldKg: Math.round(adjustedYield * 0.453592),
      hiveSpace: Math.round(hiveSpace),
      workingSpace: Math.round(workingSpace),
      totalSpace: Math.round(totalSpace),
      totalSpaceMeters: (totalSpace * 0.0929).toFixed(1),
      recommendedHives: recommendedHives[experienceLevel],
      weeklyTime: weeklyTime.toFixed(1),
      seasonLength: regionConfig.seasonLength,
    };
  }, [hiveCount, hiveType, experienceLevel, region]);

  const equipmentList: EquipmentItem[] = useMemo(() => {
    const count = parseInt(hiveCount) || 1;
    return [
      // Hive components
      { name: 'Complete Hive Bodies', quantity: count, essential: true, category: 'hive' },
      { name: 'Honey Supers', quantity: count * 2, essential: true, category: 'hive' },
      { name: 'Frames with Foundation', quantity: count * 20, essential: true, category: 'hive' },
      { name: 'Inner Covers', quantity: count, essential: true, category: 'hive' },
      { name: 'Outer Covers', quantity: count, essential: true, category: 'hive' },
      { name: 'Bottom Boards', quantity: count, essential: true, category: 'hive' },
      { name: 'Entrance Reducers', quantity: count, essential: true, category: 'hive' },
      { name: 'Queen Excluders', quantity: count, essential: false, category: 'hive' },
      // Protective gear
      { name: 'Bee Suit or Jacket', quantity: 1, essential: true, category: 'protective' },
      { name: 'Beekeeping Gloves', quantity: 2, essential: true, category: 'protective' },
      { name: 'Veil', quantity: 1, essential: true, category: 'protective' },
      { name: 'Ankle Straps', quantity: 1, essential: false, category: 'protective' },
      // Tools
      { name: 'Smoker', quantity: 1, essential: true, category: 'tools' },
      { name: 'Hive Tool', quantity: 2, essential: true, category: 'tools' },
      { name: 'Bee Brush', quantity: 1, essential: true, category: 'tools' },
      { name: 'Frame Grip', quantity: 1, essential: false, category: 'tools' },
      { name: 'Feeders', quantity: count, essential: true, category: 'tools' },
      // Harvesting
      { name: 'Honey Extractor', quantity: 1, essential: false, category: 'harvesting' },
      { name: 'Uncapping Knife', quantity: 1, essential: false, category: 'harvesting' },
      { name: 'Strainer/Filter', quantity: 1, essential: false, category: 'harvesting' },
      { name: 'Honey Buckets', quantity: 2, essential: false, category: 'harvesting' },
    ];
  }, [hiveCount]);

  const seasonalTasks: SeasonalTask[] = [
    { month: 'January', tasks: ['Monitor hive weight', 'Check ventilation', 'Emergency feeding if needed', 'Order equipment for spring'], priority: 'low' },
    { month: 'February', tasks: ['Inspect on warm days (50F+)', 'Check food stores', 'Clean equipment', 'Assemble new frames'], priority: 'medium' },
    { month: 'March', tasks: ['First thorough inspection', 'Check queen health', 'Reverse hive bodies', 'Start feeding if needed'], priority: 'high' },
    { month: 'April', tasks: ['Add supers', 'Monitor for swarm signs', 'Split strong colonies', 'Install package bees'], priority: 'high' },
    { month: 'May', tasks: ['Weekly swarm checks', 'Add more supers', 'Requeen if needed', 'Monitor mite levels'], priority: 'high' },
    { month: 'June', tasks: ['Main honey flow', 'Add supers as needed', 'Monitor queen laying', 'Check for pests'], priority: 'high' },
    { month: 'July', tasks: ['Harvest spring honey', 'Keep water available', 'Watch for robbing', 'Mite treatment if needed'], priority: 'high' },
    { month: 'August', tasks: ['Second harvest possible', 'Reduce entrances', 'Combine weak colonies', 'Feed if needed'], priority: 'high' },
    { month: 'September', tasks: ['Fall mite treatment', 'Feed for winter', 'Remove empty supers', 'Assess colony strength'], priority: 'high' },
    { month: 'October', tasks: ['Finish feeding', 'Mouse guards', 'Reduce entrances', 'Wrap hives (cold regions)'], priority: 'medium' },
    { month: 'November', tasks: ['Final winterizing', 'Minimal inspections', 'Check tilting/ventilation', 'Clean stored equipment'], priority: 'low' },
    { month: 'December', tasks: ['Monitor from outside', 'Clear dead bees from entrance', 'Plan for next year', 'Read beekeeping books'], priority: 'low' },
  ];

  const getInspectionSchedule = () => {
    const count = parseInt(hiveCount) || 1;
    const today = new Date();
    const schedule = [];
    const intervalDays = inspectionFrequency === 'weekly' ? 7 : inspectionFrequency === 'biweekly' ? 14 : 30;

    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + (i * intervalDays));
      schedule.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        hives: `All ${count} hive${count > 1 ? 's' : ''}`,
        duration: `${Math.ceil(count * 15)} - ${Math.ceil(count * 25)} min`,
        tasks: [
          'Check queen presence/laying pattern',
          'Assess food stores',
          'Look for signs of disease',
          'Check for swarm cells',
          'Monitor space needs',
        ],
      });
    }
    return schedule;
  };

  const toggleEquipment = (name: string) => {
    const newChecked = new Set(checkedEquipment);
    if (newChecked.has(name)) {
      newChecked.delete(name);
    } else {
      newChecked.add(name);
    }
    setCheckedEquipment(newChecked);
  };

  const getEquipmentByCategory = (category: EquipmentItem['category']) => {
    return equipmentList.filter((item) => item.category === category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'low':
        return isDark ? 'text-green-400' : 'text-green-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const tabs: { id: CalculatorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'planner', label: 'Hive Planner', icon: <Bug className="w-4 h-4" /> },
    { id: 'yield', label: 'Honey Yield', icon: <Droplets className="w-4 h-4" /> },
    { id: 'space', label: 'Space', icon: <Ruler className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'seasonal', label: 'Seasonal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'inspection', label: 'Inspections', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg"><Bug className="w-5 h-5 text-amber-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.beeHiveCalculator.beehiveCalculator', 'Beehive Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.beeHiveCalculator.planYourApiaryWithConfidence', 'Plan your apiary with confidence')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.beeHiveCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm ${activeTab === tab.id ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Common Inputs */}
        {(activeTab === 'planner' || activeTab === 'yield' || activeTab === 'space' || activeTab === 'equipment') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.beeHiveCalculator.numberOfHives', 'Number of Hives')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={hiveCount}
                onChange={(e) => setHiveCount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.beeHiveCalculator.hiveType', 'Hive Type')}
              </label>
              <select
                value={hiveType}
                onChange={(e) => setHiveType(e.target.value as typeof hiveType)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {Object.entries(hiveTypes).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Planner Tab */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.beeHiveCalculator.experienceLevel', 'Experience Level')}
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="beginner">{t('tools.beeHiveCalculator.beginner02Years', 'Beginner (0-2 years)')}</option>
                  <option value="intermediate">{t('tools.beeHiveCalculator.intermediate25Years', 'Intermediate (2-5 years)')}</option>
                  <option value="advanced">{t('tools.beeHiveCalculator.advanced5Years', 'Advanced (5+ years)')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.beeHiveCalculator.climateRegion', 'Climate Region')}
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as typeof region)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="temperate">{t('tools.beeHiveCalculator.temperate', 'Temperate')}</option>
                  <option value="subtropical">{t('tools.beeHiveCalculator.subtropical', 'Subtropical')}</option>
                  <option value="tropical">{t('tools.beeHiveCalculator.tropical', 'Tropical')}</option>
                </select>
              </div>
            </div>

            {/* Hive Type Info */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{hiveTypes[hiveType].name} Hive</h4>
                <span className="text-amber-500 font-bold">~{hiveTypes[hiveType].honeyYield} lbs/hive</span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {hiveTypes[hiveType].description}
              </p>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.recommendedHives', 'Recommended Hives')}</div>
                <div className="text-3xl font-bold text-amber-500">{calculations.recommendedHives}</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.beeHiveCalculator.forYourExperience', 'for your experience')}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.weeklyTime', 'Weekly Time')}</div>
                <div className="text-3xl font-bold text-amber-500">{calculations.weeklyTime}h</div>
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.beeHiveCalculator.estimatedCommitment', 'estimated commitment')}</div>
              </div>
            </div>

            {parseInt(hiveCount) > calculations.recommendedHives && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                <div className="flex items-start gap-2">
                  <Info className={`w-4 h-4 mt-0.5 text-yellow-500`} />
                  <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {t('tools.beeHiveCalculator.youVeSelectedMoreHives', 'You\'ve selected more hives than recommended for your experience level. Consider starting smaller and expanding as you gain confidence.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Yield Tab */}
        {activeTab === 'yield' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.beeHiveCalculator.climateRegion2', 'Climate Region')}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as typeof region)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="temperate">Temperate (~6 month season)</option>
                <option value="subtropical">Subtropical (~9 month season)</option>
                <option value="tropical">{t('tools.beeHiveCalculator.tropicalYearRound', 'Tropical (year-round)')}</option>
              </select>
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.estimatedAnnualHoneyYield', 'Estimated Annual Honey Yield')}</div>
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} my-2`}>
                {calculations.honeyYieldAvg} lbs
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ({calculations.honeyYieldKg} kg)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.lowEstimate', 'Low Estimate')}</div>
                <div className="text-xl font-bold text-red-400">{calculations.honeyYieldMin} lbs</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.average', 'Average')}</div>
                <div className="text-xl font-bold text-amber-500">{calculations.honeyYieldAvg} lbs</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.highEstimate', 'High Estimate')}</div>
                <div className="text-xl font-bold text-green-400">{calculations.honeyYieldMax} lbs</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.beeHiveCalculator.factorsAffectingYield', 'Factors affecting yield:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Local flora and forage availability</li>
                    <li>- Weather conditions during nectar flow</li>
                    <li>- Colony health and strength</li>
                    <li>- Beekeeping practices and management</li>
                    <li>- Leave 60-80 lbs per hive for winter stores</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Space Tab */}
        {activeTab === 'space' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-amber-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.beeHiveCalculator.hiveFootprint', 'Hive Footprint')}</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">{calculations.hiveSpace} sq ft</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(calculations.hiveSpace * 0.0929).toFixed(1)} sq m
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.beeHiveCalculator.workingSpace', 'Working Space')}</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{calculations.workingSpace} sq ft</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(calculations.workingSpace * 0.0929).toFixed(1)} sq m
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.beeHiveCalculator.totalSpaceRequired', 'Total Space Required')}</div>
              <div className="text-4xl font-bold text-amber-500">{calculations.totalSpace} sq ft</div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {calculations.totalSpaceMeters} sq meters
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.beeHiveCalculator.siteRequirements', 'Site requirements:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Morning sun exposure is ideal</li>
                    <li>- Face entrances away from strong winds</li>
                    <li>- Ensure water source within 1/4 mile</li>
                    <li>- Keep 3-4 feet between hives</li>
                    <li>- Provide windbreaks in cold climates</li>
                    <li>- Check local ordinances for setback rules</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('tools.beeHiveCalculator.checklistProgress', 'Checklist Progress')}</span>
                <span className="text-amber-500 font-bold">
                  {checkedEquipment.size} / {equipmentList.length}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${(checkedEquipment.size / equipmentList.length) * 100}%` }}
                />
              </div>
            </div>

            {(['hive', 'protective', 'tools', 'harvesting'] as const).map((category) => (
              <div key={category} className="space-y-2">
                <h4 className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {category === 'hive' ? 'Hive Components' : category === 'protective' ? 'Protective Gear' : category === 'tools' ? t('tools.beeHiveCalculator.tools', 'Tools') : t('tools.beeHiveCalculator.harvestingEquipment', 'Harvesting Equipment')}
                </h4>
                <div className="space-y-1">
                  {getEquipmentByCategory(category).map((item) => (
                    <button
                      key={item.name}
                      onClick={() => toggleEquipment(item.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {checkedEquipment.has(item.name) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'} flex-shrink-0`} />
                      )}
                      <div className="flex-1">
                        <span className={`${checkedEquipment.has(item.name) ? 'line-through opacity-50' : ''} ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {item.name}
                        </span>
                        {item.essential && (
                          <span className="ml-2 text-xs text-amber-500 font-medium">{t('tools.beeHiveCalculator.essential', 'Essential')}</span>
                        )}
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>x{item.quantity}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seasonal Tab */}
        {activeTab === 'seasonal' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.beeHiveCalculator.seasonalTaskCalendar', 'Seasonal Task Calendar')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.beeHiveCalculator.clickOnAMonthTo', 'Click on a month to see detailed tasks for Northern Hemisphere beekeeping')}
              </p>
            </div>

            <div className="space-y-2">
              {seasonalTasks.map((month) => (
                <div key={month.month} className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === month.month ? null : month.month)}
                    className={`w-full flex items-center justify-between p-3 text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{month.month}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(month.priority)} ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {month.priority} activity
                      </span>
                    </div>
                    {expandedMonth === month.month ? (
                      <ChevronUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </button>
                  {expandedMonth === month.month && (
                    <div className={`px-3 pb-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <ul className="mt-3 space-y-2">
                        {month.tasks.map((task, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="text-amber-500">-</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection Tab */}
        {activeTab === 'inspection' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.beeHiveCalculator.inspectionFrequency', 'Inspection Frequency')}
              </label>
              <div className="flex gap-2">
                {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setInspectionFrequency(freq)}
                    className={`flex-1 py-2 rounded-lg capitalize ${inspectionFrequency === freq ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.beeHiveCalculator.numberOfHives2', 'Number of Hives')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={hiveCount}
                onChange={(e) => setHiveCount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.beeHiveCalculator.upcomingInspections', 'Upcoming Inspections')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on {inspectionFrequency} schedule for {hiveCount} hive{parseInt(hiveCount) !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              {getInspectionSchedule().map((inspection, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{inspection.date}</span>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{inspection.duration}</span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {inspection.hives}
                  </div>
                  {idx === 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.beeHiveCalculator.checklist', 'Checklist:')}</div>
                      <ul className="space-y-1">
                        {inspection.tasks.map((task, taskIdx) => (
                          <li key={taskIdx} className={`text-xs flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Circle className="w-3 h-3" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.beeHiveCalculator.inspectionBestPractices', 'Inspection best practices:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Inspect on calm, sunny days above 60F/15C</li>
                    <li>- Work from the side, not in front of entrance</li>
                    <li>- Keep inspections under 15-20 minutes per hive</li>
                    <li>- Record observations in a hive journal</li>
                    <li>- Reduce frequency during winter months</li>
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

export default BeeHiveCalculatorTool;
