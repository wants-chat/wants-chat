import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Square, Calculator, Plus, Trash2, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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

type ProjectType = 'slab' | 'footing' | 'column' | 'stairs';
type MixType = '2500' | '3000' | '3500' | '4000' | '4500' | '5000';
type OveragePercent = 0 | 10 | 15;

interface ProjectDimensions {
  // Slab dimensions
  slabLength?: number;
  slabWidth?: number;
  slabThickness?: number;
  // Footing dimensions
  footingLength?: number;
  footingWidth?: number;
  footingDepth?: number;
  // Column dimensions
  columnDiameter?: number;
  columnHeight?: number;
  columnWidth?: number;
  columnDepth?: number;
  columnShape?: 'round' | 'square';
  // Stairs dimensions
  stairsRise?: number;
  stairsRun?: number;
  stairsWidth?: number;
  stairsNumberOfSteps?: number;
}

interface Pour {
  id: string;
  name: string;
  projectType: ProjectType;
  dimensions: ProjectDimensions;
}

interface CalculationResult {
  cubicFeet: number;
  cubicYards: number;
  cubicYardsWithOverage: number;
  bags60lb: number;
  bags80lb: number;
  weightLbs: number;
  weightTons: number;
  rebarRecommendation: string;
  meshRecommendation: string;
  estimatedCost: number;
}

interface PourResult {
  pour: Pour;
  result: CalculationResult;
}

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'slab', label: 'Concrete Slab' },
  { value: 'footing', label: 'Footing/Foundation' },
  { value: 'column', label: 'Column/Pier' },
  { value: 'stairs', label: 'Stairs' },
];

const MIX_TYPE_OPTIONS: { value: MixType; label: string; description: string }[] = [
  { value: '2500', label: '2,500 PSI', description: 'Residential driveways, patios' },
  { value: '3000', label: '3,000 PSI', description: 'General purpose, walkways' },
  { value: '3500', label: '3,500 PSI', description: 'Sidewalks, slabs with light traffic' },
  { value: '4000', label: '4,000 PSI', description: 'Garage floors, high traffic areas' },
  { value: '4500', label: '4,500 PSI', description: 'Commercial applications' },
  { value: '5000', label: '5,000 PSI', description: 'Heavy duty, structural' },
];

const OVERAGE_OPTIONS: { value: OveragePercent; label: string }[] = [
  { value: 0, label: 'No overage' },
  { value: 10, label: '10% (Recommended)' },
  { value: 15, label: '15% (Complex shapes)' },
];

// Cost per cubic yard (rough estimate)
const COST_PER_CUBIC_YARD: Record<MixType, number> = {
  '2500': 115,
  '3000': 120,
  '3500': 125,
  '4000': 135,
  '4500': 145,
  '5000': 155,
};

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Pour Name', type: 'string' },
  { key: 'projectType', header: 'Project Type', type: 'string' },
  { key: 'cubicFeet', header: 'Cubic Feet', type: 'number' },
  { key: 'cubicYards', header: 'Cubic Yards', type: 'number' },
  { key: 'cubicYardsWithOverage', header: 'Cubic Yards (with Overage)', type: 'number' },
  { key: 'bags60lb', header: '60lb Bags', type: 'number' },
  { key: 'bags80lb', header: '80lb Bags', type: 'number' },
  { key: 'weightLbs', header: 'Weight (lbs)', type: 'number' },
  { key: 'weightTons', header: 'Weight (tons)', type: 'number' },
  { key: 'estimatedCost', header: 'Estimated Cost', type: 'currency' },
  { key: 'rebarRecommendation', header: 'Rebar Recommendation', type: 'string' },
  { key: 'meshRecommendation', header: 'Mesh Recommendation', type: 'string' },
];

interface ConcreteCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const ConcreteCalculatorTool: React.FC<ConcreteCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [pours, setPours] = useState<Pour[]>([
    {
      id: '1',
      name: 'Pour 1',
      projectType: 'slab',
      dimensions: {
        slabLength: 0,
        slabWidth: 0,
        slabThickness: 4,
      },
    },
  ]);
  const [mixType, setMixType] = useState<MixType>('3000');
  const [overagePercent, setOveragePercent] = useState<OveragePercent>(10);
  const [results, setResults] = useState<PourResult[] | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        // Prefill slab dimensions from numbers array [length, width, thickness?]
        setPours([{
          id: '1',
          name: 'Pour 1',
          projectType: 'slab',
          dimensions: {
            slabLength: params.numbers[0],
            slabWidth: params.numbers[1],
            slabThickness: params.numbers[2] || 4,
          },
        }]);
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setPours([{
          id: '1',
          name: 'Pour 1',
          projectType: 'slab',
          dimensions: {
            slabLength: params.length,
            slabWidth: params.width,
            slabThickness: params.depth || 4,
          },
        }]);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPour = () => {
    const newPour: Pour = {
      id: generateId(),
      name: `Pour ${pours.length + 1}`,
      projectType: 'slab',
      dimensions: {
        slabLength: 0,
        slabWidth: 0,
        slabThickness: 4,
      },
    };
    setPours([...pours, newPour]);
  };

  const removePour = (id: string) => {
    if (pours.length > 1) {
      setPours(pours.filter((p) => p.id !== id));
    }
  };

  const updatePour = (id: string, updates: Partial<Pour>) => {
    setPours(
      pours.map((p) => {
        if (p.id === id) {
          // Reset dimensions when changing project type
          if (updates.projectType && updates.projectType !== p.projectType) {
            return {
              ...p,
              ...updates,
              dimensions: getDefaultDimensions(updates.projectType),
            };
          }
          return { ...p, ...updates };
        }
        return p;
      })
    );
  };

  const updateDimension = (id: string, key: keyof ProjectDimensions, value: number | string) => {
    setPours(
      pours.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            dimensions: {
              ...p.dimensions,
              [key]: value,
            },
          };
        }
        return p;
      })
    );
  };

  const getDefaultDimensions = (type: ProjectType): ProjectDimensions => {
    switch (type) {
      case 'slab':
        return { slabLength: 0, slabWidth: 0, slabThickness: 4 };
      case 'footing':
        return { footingLength: 0, footingWidth: 12, footingDepth: 12 };
      case 'column':
        return { columnDiameter: 12, columnHeight: 0, columnShape: 'round' };
      case 'stairs':
        return { stairsRise: 7, stairsRun: 11, stairsWidth: 36, stairsNumberOfSteps: 0 };
      default:
        return {};
    }
  };

  const calculateVolume = (pour: Pour): number => {
    const { projectType, dimensions } = pour;

    switch (projectType) {
      case 'slab': {
        const length = dimensions.slabLength || 0;
        const width = dimensions.slabWidth || 0;
        const thickness = (dimensions.slabThickness || 4) / 12; // Convert inches to feet
        return length * width * thickness;
      }
      case 'footing': {
        const length = dimensions.footingLength || 0;
        const width = (dimensions.footingWidth || 12) / 12; // Convert inches to feet
        const depth = (dimensions.footingDepth || 12) / 12; // Convert inches to feet
        return length * width * depth;
      }
      case 'column': {
        const height = dimensions.columnHeight || 0;
        if (dimensions.columnShape === 'round') {
          const radius = ((dimensions.columnDiameter || 12) / 12) / 2; // Convert inches to feet, then to radius
          return Math.PI * radius * radius * height;
        } else {
          const width = (dimensions.columnWidth || 12) / 12;
          const depth = (dimensions.columnDepth || 12) / 12;
          return width * depth * height;
        }
      }
      case 'stairs': {
        const rise = (dimensions.stairsRise || 7) / 12; // Convert inches to feet
        const run = (dimensions.stairsRun || 11) / 12;
        const width = (dimensions.stairsWidth || 36) / 12;
        const steps = dimensions.stairsNumberOfSteps || 0;
        // Simplified stairs calculation: each step as a rectangular block
        const stepVolume = rise * run * width;
        // Add landing/platform area (approximation)
        const totalVolume = stepVolume * steps;
        // Add some extra for the stringer/support
        return totalVolume * 1.2;
      }
      default:
        return 0;
    }
  };

  const getRebarRecommendation = (projectType: ProjectType, thickness: number): string => {
    switch (projectType) {
      case 'slab':
        if (thickness >= 6) {
          return '#4 rebar on 18" centers both ways';
        } else if (thickness >= 4) {
          return '#3 rebar on 24" centers both ways, or welded wire mesh';
        }
        return 'Fiber mesh additive or 6x6 welded wire mesh';
      case 'footing':
        return '#4 rebar continuous, 3 bars minimum, with stirrups every 24"';
      case 'column':
        return '#4 vertical rebar (4 minimum) with #3 ties every 12"';
      case 'stairs':
        return '#4 rebar on 12" centers in both directions';
      default:
        return 'Consult a structural engineer';
    }
  };

  const getMeshRecommendation = (projectType: ProjectType): string => {
    switch (projectType) {
      case 'slab':
        return '6x6 W1.4/W1.4 welded wire mesh (6" x 6" grid, 10 gauge)';
      case 'footing':
        return 'Not typically required - use rebar instead';
      case 'column':
        return 'Not applicable - use rebar ties';
      case 'stairs':
        return '6x6 W2.9/W2.9 welded wire mesh or rebar';
      default:
        return 'Consult a structural engineer';
    }
  };

  const calculate = () => {
    const pourResults: PourResult[] = pours.map((pour) => {
      const cubicFeet = calculateVolume(pour);
      const cubicYards = cubicFeet / 27;
      const cubicYardsWithOverage = cubicYards * (1 + overagePercent / 100);

      // One 60lb bag covers approximately 0.45 cubic feet
      // One 80lb bag covers approximately 0.6 cubic feet
      const bags60lb = Math.ceil((cubicFeet * (1 + overagePercent / 100)) / 0.45);
      const bags80lb = Math.ceil((cubicFeet * (1 + overagePercent / 100)) / 0.6);

      // Concrete weighs approximately 150 lbs per cubic foot
      const weightLbs = cubicFeet * (1 + overagePercent / 100) * 150;
      const weightTons = weightLbs / 2000;

      const thickness = pour.dimensions.slabThickness || pour.dimensions.footingDepth || 4;
      const rebarRecommendation = getRebarRecommendation(pour.projectType, thickness);
      const meshRecommendation = getMeshRecommendation(pour.projectType);

      const estimatedCost = cubicYardsWithOverage * COST_PER_CUBIC_YARD[mixType];

      return {
        pour,
        result: {
          cubicFeet,
          cubicYards,
          cubicYardsWithOverage,
          bags60lb,
          bags80lb,
          weightLbs,
          weightTons,
          rebarRecommendation,
          meshRecommendation,
          estimatedCost,
        },
      };
    });

    setResults(pourResults);
  };

  const reset = () => {
    setPours([
      {
        id: '1',
        name: 'Pour 1',
        projectType: 'slab',
        dimensions: {
          slabLength: 0,
          slabWidth: 0,
          slabThickness: 4,
        },
      },
    ]);
    setMixType('3000');
    setOveragePercent(10);
    setResults(null);
  };

  const getTotalResults = (): CalculationResult | null => {
    if (!results || results.length === 0) return null;

    return results.reduce(
      (acc, { result }) => ({
        cubicFeet: acc.cubicFeet + result.cubicFeet,
        cubicYards: acc.cubicYards + result.cubicYards,
        cubicYardsWithOverage: acc.cubicYardsWithOverage + result.cubicYardsWithOverage,
        bags60lb: acc.bags60lb + result.bags60lb,
        bags80lb: acc.bags80lb + result.bags80lb,
        weightLbs: acc.weightLbs + result.weightLbs,
        weightTons: acc.weightTons + result.weightTons,
        rebarRecommendation: 'See individual pours',
        meshRecommendation: 'See individual pours',
        estimatedCost: acc.estimatedCost + result.estimatedCost,
      }),
      {
        cubicFeet: 0,
        cubicYards: 0,
        cubicYardsWithOverage: 0,
        bags60lb: 0,
        bags80lb: 0,
        weightLbs: 0,
        weightTons: 0,
        rebarRecommendation: '',
        meshRecommendation: '',
        estimatedCost: 0,
      }
    );
  };

  const getExportData = () => {
    if (!results || results.length === 0) return [];

    return results.map(({ pour, result }) => ({
      name: pour.name,
      projectType: PROJECT_TYPE_OPTIONS.find(o => o.value === pour.projectType)?.label || pour.projectType,
      cubicFeet: parseFloat(result.cubicFeet.toFixed(2)),
      cubicYards: parseFloat(result.cubicYards.toFixed(2)),
      cubicYardsWithOverage: parseFloat(result.cubicYardsWithOverage.toFixed(2)),
      bags60lb: result.bags60lb,
      bags80lb: result.bags80lb,
      weightLbs: parseFloat(result.weightLbs.toFixed(2)),
      weightTons: parseFloat(result.weightTons.toFixed(2)),
      estimatedCost: parseFloat(result.estimatedCost.toFixed(2)),
      rebarRecommendation: result.rebarRecommendation,
      meshRecommendation: result.meshRecommendation,
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    exportToCSV(data, COLUMNS, { filename: 'concrete-calculator' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    exportToExcel(data, COLUMNS, { filename: 'concrete-calculator' });
  };

  const handleExportJSON = () => {
    const data = getExportData();
    exportToJSON(data, { filename: 'concrete-calculator' });
  };

  const handleExportPDF = async () => {
    const data = getExportData();
    await exportToPDF(data, COLUMNS, {
      filename: 'concrete-calculator',
      title: 'Concrete Calculator Report',
      orientation: 'landscape',
    });
  };

  const handlePrint = () => {
    const data = getExportData();
    printData(data, COLUMNS, { title: 'Concrete Calculator Report' });
  };

  const handleCopyToClipboard = async () => {
    const data = getExportData();
    return await copyUtil(data, COLUMNS, 'tab');
  };

  const renderDimensionInputs = (pour: Pour) => {
    const { projectType, dimensions, id } = pour;

    switch (projectType) {
      case 'slab':
        return (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.lengthFt', 'Length (ft)')}
              </label>
              <input
                type="number"
                value={dimensions.slabLength || ''}
                onChange={(e) => updateDimension(id, 'slabLength', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.widthFt', 'Width (ft)')}
              </label>
              <input
                type="number"
                value={dimensions.slabWidth || ''}
                onChange={(e) => updateDimension(id, 'slabWidth', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.thicknessIn', 'Thickness (in)')}
              </label>
              <input
                type="number"
                value={dimensions.slabThickness || ''}
                onChange={(e) => updateDimension(id, 'slabThickness', parseFloat(e.target.value) || 0)}
                placeholder="4"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        );

      case 'footing':
        return (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.lengthFt2', 'Length (ft)')}
              </label>
              <input
                type="number"
                value={dimensions.footingLength || ''}
                onChange={(e) => updateDimension(id, 'footingLength', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.widthIn', 'Width (in)')}
              </label>
              <input
                type="number"
                value={dimensions.footingWidth || ''}
                onChange={(e) => updateDimension(id, 'footingWidth', parseFloat(e.target.value) || 0)}
                placeholder="12"
                min="0"
                step="1"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.depthIn', 'Depth (in)')}
              </label>
              <input
                type="number"
                value={dimensions.footingDepth || ''}
                onChange={(e) => updateDimension(id, 'footingDepth', parseFloat(e.target.value) || 0)}
                placeholder="12"
                min="0"
                step="1"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        );

      case 'column':
        return (
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.columnShape', 'Column Shape')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['round', 'square'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updateDimension(id, 'columnShape', shape)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      dimensions.columnShape === shape
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dimensions.columnShape === 'round' ? (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.concreteCalculator.diameterIn', 'Diameter (in)')}
                  </label>
                  <input
                    type="number"
                    value={dimensions.columnDiameter || ''}
                    onChange={(e) => updateDimension(id, 'columnDiameter', parseFloat(e.target.value) || 0)}
                    placeholder="12"
                    min="0"
                    step="1"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.concreteCalculator.widthIn2', 'Width (in)')}
                    </label>
                    <input
                      type="number"
                      value={dimensions.columnWidth || ''}
                      onChange={(e) => updateDimension(id, 'columnWidth', parseFloat(e.target.value) || 0)}
                      placeholder="12"
                      min="0"
                      step="1"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.concreteCalculator.depthIn2', 'Depth (in)')}
                    </label>
                    <input
                      type="number"
                      value={dimensions.columnDepth || ''}
                      onChange={(e) => updateDimension(id, 'columnDepth', parseFloat(e.target.value) || 0)}
                      placeholder="12"
                      min="0"
                      step="1"
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </>
              )}
              <div className={dimensions.columnShape === 'round' ? '' : 'col-span-2'}>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.concreteCalculator.heightFt', 'Height (ft)')}
                </label>
                <input
                  type="number"
                  value={dimensions.columnHeight || ''}
                  onChange={(e) => updateDimension(id, 'columnHeight', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>
        );

      case 'stairs':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.riseIn', 'Rise (in)')}
              </label>
              <input
                type="number"
                value={dimensions.stairsRise || ''}
                onChange={(e) => updateDimension(id, 'stairsRise', parseFloat(e.target.value) || 0)}
                placeholder="7"
                min="0"
                step="0.25"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.runIn', 'Run (in)')}
              </label>
              <input
                type="number"
                value={dimensions.stairsRun || ''}
                onChange={(e) => updateDimension(id, 'stairsRun', parseFloat(e.target.value) || 0)}
                placeholder="11"
                min="0"
                step="0.25"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.widthIn3', 'Width (in)')}
              </label>
              <input
                type="number"
                value={dimensions.stairsWidth || ''}
                onChange={(e) => updateDimension(id, 'stairsWidth', parseFloat(e.target.value) || 0)}
                placeholder="36"
                min="0"
                step="1"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.concreteCalculator.numberOfSteps', 'Number of Steps')}
              </label>
              <input
                type="number"
                value={dimensions.stairsNumberOfSteps || ''}
                onChange={(e) => updateDimension(id, 'stairsNumberOfSteps', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="1"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const totalResults = getTotalResults();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488] rounded-lg">
                  <Square className="w-6 h-6 text-white" />
                </div>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  {t('tools.concreteCalculator.concreteCalculator', 'Concrete Calculator')}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {results && results.length > 0 && (
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
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {showInfo && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                  This calculator estimates the amount of concrete needed for various projects.
                  Always add 10-15% overage for waste, spillage, and uneven surfaces.
                  For ready-mix concrete, order in full or half-yard increments.
                </p>
              </div>
            )}

            {/* Pours List */}
            <div className="space-y-4">
              {pours.map((pour, index) => (
                <div
                  key={pour.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={pour.name}
                      onChange={(e) => updatePour(pour.id, { name: e.target.value })}
                      className={`text-lg font-semibold bg-transparent border-none outline-none ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    />
                    {pours.length > 1 && (
                      <button
                        onClick={() => removePour(pour.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('tools.concreteCalculator.projectType', 'Project Type')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PROJECT_TYPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updatePour(pour.id, { projectType: option.value })}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              pour.projectType === option.value
                                ? 'bg-[#0D9488] text-white'
                                : theme === 'dark'
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {renderDimensionInputs(pour)}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Pour Button */}
            <button
              onClick={addPour}
              className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
              }`}
            >
              <Plus className="w-5 h-5" />
              {t('tools.concreteCalculator.addAnotherPour', 'Add Another Pour')}
            </button>

            {/* Mix Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.concreteCalculator.concreteMixStrength', 'Concrete Mix Strength')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MIX_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMixType(option.value)}
                    className={`py-3 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      mixType === option.value
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className={`text-xs mt-1 ${mixType === option.value ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overage Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.concreteCalculator.overagePercentage', 'Overage Percentage')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {OVERAGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOveragePercent(option.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      overagePercent === option.value
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={calculate}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {t('tools.concreteCalculator.calculate', 'Calculate')}
              </button>
              <button
                onClick={reset}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.concreteCalculator.reset', 'Reset')}
              </button>
            </div>

            {/* Results */}
            {results && results.length > 0 && (
              <div className="space-y-4">
                {/* Total Summary */}
                {totalResults && (
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.concreteCalculator.bg0d948810', 'bg-[#0D9488]/10')
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.concreteCalculator.totalConcreteNeeded', 'Total Concrete Needed')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.concreteCalculator.cubicYards2', 'Cubic Yards')}
                        </div>
                        <div className="text-3xl font-bold text-[#0D9488]">
                          {totalResults.cubicYardsWithOverage.toFixed(2)}
                        </div>
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          ({totalResults.cubicYards.toFixed(2)} + {overagePercent}%)
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.concreteCalculator.60lbBags', '60lb Bags')}
                        </div>
                        <div className="text-3xl font-bold text-blue-500">
                          {totalResults.bags60lb}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.concreteCalculator.80lbBags', '80lb Bags')}
                        </div>
                        <div className="text-3xl font-bold text-blue-500">
                          {totalResults.bags80lb}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.concreteCalculator.estCost', 'Est. Cost')}
                        </div>
                        <div className="text-3xl font-bold text-green-500">
                          ${totalResults.estimatedCost.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.concreteCalculator.totalWeight', 'Total Weight:')}
                        </span>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {totalResults.weightLbs.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs ({totalResults.weightTons.toFixed(2)} tons)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Pour Results */}
                {results.length > 1 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.concreteCalculator.individualPourDetails', 'Individual Pour Details')}
                    </h3>
                    <div className="space-y-3">
                      {results.map(({ pour, result }) => (
                        <div
                          key={pour.id}
                          className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {pour.name}
                            </span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {PROJECT_TYPE_OPTIONS.find(o => o.value === pour.projectType)?.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.concreteCalculator.cubicYards', 'Cubic Yards:')}</span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {result.cubicYardsWithOverage.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>60lb Bags: </span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {result.bags60lb}
                              </span>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('tools.concreteCalculator.cost', 'Cost:')}</span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${result.estimatedCost.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reinforcement Recommendations */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.concreteCalculator.reinforcementRecommendations', 'Reinforcement Recommendations')}
                  </h3>
                  <div className="space-y-4">
                    {results.map(({ pour, result }) => (
                      <div key={pour.id}>
                        <div className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {pour.name} ({PROJECT_TYPE_OPTIONS.find(o => o.value === pour.projectType)?.label})
                        </div>
                        <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div><strong>{t('tools.concreteCalculator.rebar', 'Rebar:')}</strong> {result.rebarRecommendation}</div>
                          <div><strong>{t('tools.concreteCalculator.wireMesh', 'Wire Mesh:')}</strong> {result.meshRecommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mix Recommendation */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Selected Mix: {MIX_TYPE_OPTIONS.find(o => o.value === mixType)?.label}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {MIX_TYPE_OPTIONS.find(o => o.value === mixType)?.description}
                  </p>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.concreteCalculator.concreteCoverageReference', 'Concrete Coverage Reference')}
              </h3>
              <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex justify-between">
                  <span>1 cubic yard covers:</span>
                  <span className="font-medium">80 sq ft at 4" thick</span>
                </div>
                <div className="flex justify-between">
                  <span>60lb bag covers:</span>
                  <span className="font-medium">0.45 cubic feet</span>
                </div>
                <div className="flex justify-between">
                  <span>80lb bag covers:</span>
                  <span className="font-medium">0.60 cubic feet</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tools.concreteCalculator.concreteWeight', 'Concrete weight:')}</span>
                  <span className="font-medium">~150 lbs/cubic foot</span>
                </div>
              </div>
              <p className={`text-xs mt-3 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.concreteCalculator.notePricesAreEstimatesAnd', 'Note: Prices are estimates and vary by location. Always consult local suppliers for accurate pricing.')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConcreteCalculatorTool;
