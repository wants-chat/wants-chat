import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Leaf, Sun, Snowflake, Droplets, ThermometerSun, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PlantingCalendarToolProps {
  uiConfig?: UIConfig;
}

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface PlantData {
  name: string;
  category: 'vegetable' | 'fruit' | 'herb' | 'flower';
  indoorStart: number[]; // months (0-11)
  outdoorTransplant: number[];
  directSow: number[];
  harvest: number[];
  daysToHarvest: number;
  frostTolerant: boolean;
  notes: string;
}

interface ZoneData {
  zone: string;
  lastFrostMonth: number;
  firstFrostMonth: number;
  description: string;
}

const zones: ZoneData[] = [
  { zone: '3', lastFrostMonth: 5, firstFrostMonth: 8, description: 'Very Cold (Minnesota, Montana)' },
  { zone: '4', lastFrostMonth: 4, firstFrostMonth: 9, description: 'Cold (Wisconsin, Maine)' },
  { zone: '5', lastFrostMonth: 4, firstFrostMonth: 9, description: 'Moderate Cold (Iowa, Colorado)' },
  { zone: '6', lastFrostMonth: 3, firstFrostMonth: 10, description: 'Moderate (Missouri, Virginia)' },
  { zone: '7', lastFrostMonth: 3, firstFrostMonth: 10, description: 'Mild (Oklahoma, North Carolina)' },
  { zone: '8', lastFrostMonth: 2, firstFrostMonth: 11, description: 'Warm (Texas, Georgia)' },
  { zone: '9', lastFrostMonth: 1, firstFrostMonth: 11, description: 'Hot (Florida, Arizona)' },
  { zone: '10', lastFrostMonth: 0, firstFrostMonth: 11, description: 'Tropical (South Florida, SoCal)' },
];

const plants: PlantData[] = [
  { name: 'Tomatoes', category: 'vegetable', indoorStart: [1, 2], outdoorTransplant: [4, 5], directSow: [], harvest: [6, 7, 8, 9], daysToHarvest: 70, frostTolerant: false, notes: 'Start indoors 6-8 weeks before last frost' },
  { name: 'Peppers', category: 'vegetable', indoorStart: [1, 2], outdoorTransplant: [4, 5], directSow: [], harvest: [6, 7, 8, 9], daysToHarvest: 75, frostTolerant: false, notes: 'Need warm soil (65°F+) for transplant' },
  { name: 'Lettuce', category: 'vegetable', indoorStart: [1, 2, 7, 8], outdoorTransplant: [2, 3, 8, 9], directSow: [2, 3, 8, 9], harvest: [4, 5, 9, 10], daysToHarvest: 45, frostTolerant: true, notes: 'Can succession plant every 2 weeks' },
  { name: 'Carrots', category: 'vegetable', indoorStart: [], outdoorTransplant: [], directSow: [2, 3, 4, 7, 8], harvest: [5, 6, 7, 9, 10, 11], daysToHarvest: 70, frostTolerant: true, notes: 'Direct sow only, do not transplant' },
  { name: 'Beans', category: 'vegetable', indoorStart: [], outdoorTransplant: [], directSow: [4, 5, 6], harvest: [6, 7, 8, 9], daysToHarvest: 55, frostTolerant: false, notes: 'Wait until soil is 60°F+' },
  { name: 'Cucumbers', category: 'vegetable', indoorStart: [3, 4], outdoorTransplant: [4, 5], directSow: [4, 5], harvest: [6, 7, 8, 9], daysToHarvest: 60, frostTolerant: false, notes: 'Very frost sensitive' },
  { name: 'Squash', category: 'vegetable', indoorStart: [3, 4], outdoorTransplant: [4, 5], directSow: [4, 5], harvest: [7, 8, 9], daysToHarvest: 50, frostTolerant: false, notes: 'Needs lots of space' },
  { name: 'Peas', category: 'vegetable', indoorStart: [], outdoorTransplant: [], directSow: [2, 3, 7, 8], harvest: [4, 5, 9, 10], daysToHarvest: 60, frostTolerant: true, notes: 'Plant as soon as soil can be worked' },
  { name: 'Spinach', category: 'vegetable', indoorStart: [1, 2, 8], outdoorTransplant: [2, 3, 9], directSow: [2, 3, 8, 9], harvest: [4, 5, 10, 11], daysToHarvest: 40, frostTolerant: true, notes: 'Bolts in hot weather' },
  { name: 'Broccoli', category: 'vegetable', indoorStart: [1, 2, 6, 7], outdoorTransplant: [3, 4, 8, 9], directSow: [], harvest: [5, 6, 10, 11], daysToHarvest: 80, frostTolerant: true, notes: 'Cool weather crop' },
  { name: 'Basil', category: 'herb', indoorStart: [2, 3], outdoorTransplant: [4, 5], directSow: [4, 5], harvest: [5, 6, 7, 8, 9], daysToHarvest: 30, frostTolerant: false, notes: 'Pinch flowers to encourage leaf growth' },
  { name: 'Cilantro', category: 'herb', indoorStart: [2, 3, 8], outdoorTransplant: [3, 4, 9], directSow: [3, 4, 8, 9], harvest: [4, 5, 6, 10, 11], daysToHarvest: 45, frostTolerant: true, notes: 'Bolts quickly in heat' },
  { name: 'Parsley', category: 'herb', indoorStart: [1, 2], outdoorTransplant: [3, 4], directSow: [3, 4], harvest: [5, 6, 7, 8, 9, 10], daysToHarvest: 75, frostTolerant: true, notes: 'Slow to germinate (2-3 weeks)' },
  { name: 'Strawberries', category: 'fruit', indoorStart: [], outdoorTransplant: [3, 4], directSow: [], harvest: [5, 6], daysToHarvest: 90, frostTolerant: true, notes: 'Plant in early spring for harvest next year' },
  { name: 'Zinnias', category: 'flower', indoorStart: [3, 4], outdoorTransplant: [4, 5], directSow: [4, 5], harvest: [6, 7, 8, 9], daysToHarvest: 60, frostTolerant: false, notes: 'Great for cutting gardens' },
  { name: 'Sunflowers', category: 'flower', indoorStart: [], outdoorTransplant: [], directSow: [4, 5], harvest: [7, 8, 9], daysToHarvest: 80, frostTolerant: false, notes: 'Direct sow after last frost' },
  { name: 'Marigolds', category: 'flower', indoorStart: [2, 3], outdoorTransplant: [4, 5], directSow: [4, 5], harvest: [5, 6, 7, 8, 9, 10], daysToHarvest: 50, frostTolerant: false, notes: 'Good companion plant for vegetables' },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const PlantingCalendarTool: React.FC<PlantingCalendarToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [selectedZone, setSelectedZone] = useState('6');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.zone) setSelectedZone(String(prefillData.zone));
      if (prefillData.category) setSelectedCategory(String(prefillData.category));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const zoneData = zones.find(z => z.zone === selectedZone) || zones[3];

  const adjustedPlants = useMemo(() => {
    const zoneOffset = parseInt(selectedZone) - 6;

    return plants.map(plant => {
      const adjust = (monthArr: number[]): number[] => {
        return monthArr.map(m => {
          let adjusted = m - Math.floor(zoneOffset / 2);
          if (adjusted < 0) adjusted = 0;
          if (adjusted > 11) adjusted = 11;
          return adjusted;
        });
      };

      return {
        ...plant,
        indoorStart: adjust(plant.indoorStart),
        outdoorTransplant: adjust(plant.outdoorTransplant),
        directSow: adjust(plant.directSow),
        harvest: adjust(plant.harvest),
      };
    });
  }, [selectedZone]);

  const filteredPlants = useMemo(() => {
    if (selectedCategory === 'all') return adjustedPlants;
    return adjustedPlants.filter(p => p.category === selectedCategory);
  }, [adjustedPlants, selectedCategory]);

  const getCurrentMonth = () => new Date().getMonth();

  const getCellColor = (plant: PlantData, monthIndex: number): string => {
    if (plant.indoorStart.includes(monthIndex)) return 'bg-purple-500';
    if (plant.outdoorTransplant.includes(monthIndex)) return 'bg-teal-500';
    if (plant.directSow.includes(monthIndex)) return 'bg-blue-500';
    if (plant.harvest.includes(monthIndex)) return 'bg-amber-500';
    return isDark ? 'bg-gray-700' : 'bg-gray-100';
  };

  const getCellLabel = (plant: PlantData, monthIndex: number): string => {
    if (plant.indoorStart.includes(monthIndex)) return 'I';
    if (plant.outdoorTransplant.includes(monthIndex)) return 'T';
    if (plant.directSow.includes(monthIndex)) return 'S';
    if (plant.harvest.includes(monthIndex)) return 'H';
    return '';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantingCalendar.plantingCalendar', 'Planting Calendar')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.plantingCalendar.plantingScheduleByUsdaHardiness', 'Planting schedule by USDA hardiness zone')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Zone Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <ThermometerSun className="w-4 h-4 inline mr-2 text-teal-500" />
              {t('tools.plantingCalendar.selectYourZone', 'Select Your Zone')}
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
            >
              {zones.map(z => (
                <option key={z.zone} value={z.zone}>Zone {z.zone} - {z.description}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Leaf className="w-4 h-4 inline mr-2 text-teal-500" />
              {t('tools.plantingCalendar.plantCategory', 'Plant Category')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-teal-500`}
            >
              <option value="all">{t('tools.plantingCalendar.allPlants', 'All Plants')}</option>
              <option value="vegetable">{t('tools.plantingCalendar.vegetables', 'Vegetables')}</option>
              <option value="fruit">{t('tools.plantingCalendar.fruits', 'Fruits')}</option>
              <option value="herb">{t('tools.plantingCalendar.herbs', 'Herbs')}</option>
              <option value="flower">{t('tools.plantingCalendar.flowers', 'Flowers')}</option>
            </select>
          </div>
        </div>

        {/* Zone Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Frost: <strong>{fullMonths[zoneData.lastFrostMonth]}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  First Frost: <strong>{fullMonths[zoneData.firstFrostMonth]}</strong>
                </span>
              </div>
            </div>
            <div className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'} font-medium`}>
              Growing Season: ~{(zoneData.firstFrostMonth - zoneData.lastFrostMonth + 1) * 30} days
            </div>
          </div>
        </div>

        {/* Legend */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`w-full flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.plantingCalendar.legend', 'Legend')}</span>
          {showLegend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLegend && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">I</div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantingCalendar.indoorStart', 'Indoor Start')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center text-white text-xs font-bold">T</div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantingCalendar.transplant', 'Transplant')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantingCalendar.directSow', 'Direct Sow')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantingCalendar.harvest', 'Harvest')}</span>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.plantingCalendar.plant', 'Plant')}</th>
                {months.map((month, idx) => (
                  <th
                    key={month}
                    className={`text-center py-2 px-1 text-xs ${
                      idx === getCurrentMonth()
                        ? 'bg-teal-500 text-white rounded-t'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlants.map((plant, plantIdx) => (
                <React.Fragment key={plant.name}>
                  <tr
                    className={`cursor-pointer ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} ${plantIdx % 2 === 0 ? '' : isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
                    onClick={() => setExpandedPlant(expandedPlant === plant.name ? null : plant.name)}
                  >
                    <td className={`py-2 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plant.name}</span>
                        {plant.frostTolerant && (
                          <Snowflake className="w-3 h-3 text-blue-400" title={t('tools.plantingCalendar.frostTolerant2', 'Frost tolerant')} />
                        )}
                      </div>
                    </td>
                    {months.map((_, monthIdx) => (
                      <td key={monthIdx} className="p-1">
                        <div
                          className={`w-full h-6 rounded flex items-center justify-center text-xs font-bold text-white ${getCellColor(plant, monthIdx)} ${
                            monthIdx === getCurrentMonth() ? 'ring-2 ring-teal-400' : ''
                          }`}
                        >
                          {getCellLabel(plant, monthIdx)}
                        </div>
                      </td>
                    ))}
                  </tr>
                  {expandedPlant === plant.name && (
                    <tr className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                      <td colSpan={13} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.plantingCalendar.daysToHarvest', 'Days to Harvest')}</div>
                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.daysToHarvest} days</div>
                          </div>
                          <div>
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.plantingCalendar.frostTolerance', 'Frost Tolerance')}</div>
                            <div className={`text-lg font-bold ${plant.frostTolerant ? 'text-blue-500' : 'text-red-500'}`}>
                              {plant.frostTolerant ? t('tools.plantingCalendar.frostTolerant', 'Frost Tolerant') : t('tools.plantingCalendar.frostSensitive', 'Frost Sensitive')}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.plantingCalendar.category', 'Category')}</div>
                            <div className={`text-lg font-bold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{plant.category}</div>
                          </div>
                          <div className="md:col-span-3">
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.plantingCalendar.notes', 'Notes')}</div>
                            <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{plant.notes}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Current Month Recommendations */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Droplets className="w-4 h-4 text-teal-500" />
            What to Plant This Month ({fullMonths[getCurrentMonth()]})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                {t('tools.plantingCalendar.startIndoors', 'Start Indoors')}
              </div>
              <div className="flex flex-wrap gap-1">
                {filteredPlants
                  .filter(p => p.indoorStart.includes(getCurrentMonth()))
                  .map(p => (
                    <span key={p.name} className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      {p.name}
                    </span>
                  ))
                }
                {filteredPlants.filter(p => p.indoorStart.includes(getCurrentMonth())).length === 0 && (
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.plantingCalendar.noneThisMonth', 'None this month')}</span>
                )}
              </div>
            </div>
            <div>
              <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                {t('tools.plantingCalendar.directSow2', 'Direct Sow')}
              </div>
              <div className="flex flex-wrap gap-1">
                {filteredPlants
                  .filter(p => p.directSow.includes(getCurrentMonth()))
                  .map(p => (
                    <span key={p.name} className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      {p.name}
                    </span>
                  ))
                }
                {filteredPlants.filter(p => p.directSow.includes(getCurrentMonth())).length === 0 && (
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.plantingCalendar.noneThisMonth2', 'None this month')}</span>
                )}
              </div>
            </div>
            <div>
              <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                {t('tools.plantingCalendar.readyToHarvest', 'Ready to Harvest')}
              </div>
              <div className="flex flex-wrap gap-1">
                {filteredPlants
                  .filter(p => p.harvest.includes(getCurrentMonth()))
                  .map(p => (
                    <span key={p.name} className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                      {p.name}
                    </span>
                  ))
                }
                {filteredPlants.filter(p => p.harvest.includes(getCurrentMonth())).length === 0 && (
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t('tools.plantingCalendar.noneThisMonth3', 'None this month')}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.plantingCalendar.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.plantingCalendar.clickOnAnyPlantRow', 'Click on any plant row to see more details')}</li>
                <li>{t('tools.plantingCalendar.currentMonthIsHighlightedIn', 'Current month is highlighted in the calendar')}</li>
                <li>{t('tools.plantingCalendar.snowflakeIconIndicatesFrostTolerant', 'Snowflake icon indicates frost-tolerant plants')}</li>
                <li>{t('tools.plantingCalendar.adjustForMicroclimatesSouthFacing', 'Adjust for microclimates - south-facing slopes are warmer')}</li>
                <li>{t('tools.plantingCalendar.checkLocalExtensionOfficeFor', 'Check local extension office for specific planting dates')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantingCalendarTool;
