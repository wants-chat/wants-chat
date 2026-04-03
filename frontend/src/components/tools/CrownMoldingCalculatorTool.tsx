import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ruler, CornerUpRight, CornerDownLeft, Scissors, Info, Calculator, Package, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type MoldingLength = 8 | 12 | 16;
type WallAngle = 90 | 135 | 45;

interface MiterAngle {
  angle: number;
  description: string;
  sawSetting: string;
}

interface CrownMoldingCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const CrownMoldingCalculatorTool: React.FC<CrownMoldingCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [roomPerimeter, setRoomPerimeter] = useState('48');
  const [insideCorners, setInsideCorners] = useState('4');
  const [outsideCorners, setOutsideCorners] = useState('0');
  const [moldingLength, setMoldingLength] = useState<MoldingLength>(8);
  const [wasteFactor, setWasteFactor] = useState('10');
  const [wallAngle, setWallAngle] = useState<WallAngle>(90);
  const [springAngle, setSpringAngle] = useState('38');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setRoomPerimeter(params.numbers[0].toString());
        if (params.numbers[1]) {
          setInsideCorners(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      } else if (params.length) {
        setRoomPerimeter(params.length.toString());
        setIsPrefilled(true);
      } else if (params.amount) {
        setRoomPerimeter(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const moldingLengths: { value: MoldingLength; label: string }[] = [
    { value: 8, label: '8 ft' },
    { value: 12, label: '12 ft' },
    { value: 16, label: '16 ft' },
  ];

  const wallAngles: { value: WallAngle; label: string; description: string }[] = [
    { value: 90, label: '90°', description: 'Standard square corner' },
    { value: 135, label: '135°', description: 'Common bay window angle' },
    { value: 45, label: '45°', description: 'Sharp corner' },
  ];

  const getMiterAngle = (wallAngle: number, springAngle: number): MiterAngle => {
    // For crown molding, the miter angle depends on both wall angle and spring angle
    // Standard formula: miter = arctan(sin(spring) / tan(wall/2))
    const springRad = (springAngle * Math.PI) / 180;
    const halfWallRad = ((wallAngle / 2) * Math.PI) / 180;

    const miterRad = Math.atan(Math.sin(springRad) / Math.tan(halfWallRad));
    const miterDeg = (miterRad * 180) / Math.PI;

    // Bevel angle: arctan(cos(spring) * tan(wall/2))
    const bevelRad = Math.atan(Math.cos(springRad) * Math.tan(halfWallRad));
    const bevelDeg = (bevelRad * 180) / Math.PI;

    let description = '';
    let sawSetting = '';

    if (wallAngle === 90) {
      description = 'Standard 90° corner';
      sawSetting = `Miter: ${miterDeg.toFixed(1)}° | Bevel: ${bevelDeg.toFixed(1)}°`;
    } else if (wallAngle === 135) {
      description = '135° corner (bay window)';
      sawSetting = `Miter: ${miterDeg.toFixed(1)}° | Bevel: ${bevelDeg.toFixed(1)}°`;
    } else {
      description = `${wallAngle}° corner`;
      sawSetting = `Miter: ${miterDeg.toFixed(1)}° | Bevel: ${bevelDeg.toFixed(1)}°`;
    }

    return {
      angle: miterDeg,
      description,
      sawSetting,
    };
  };

  const calculations = useMemo(() => {
    const perimeter = parseFloat(roomPerimeter) || 0;
    const inside = parseInt(insideCorners) || 0;
    const outside = parseInt(outsideCorners) || 0;
    const waste = parseFloat(wasteFactor) || 10;
    const spring = parseFloat(springAngle) || 38;

    // Calculate total linear feet needed with waste factor
    const totalWithWaste = perimeter * (1 + waste / 100);

    // Calculate pieces needed
    const piecesNeeded = Math.ceil(totalWithWaste / moldingLength);

    // Extra pieces for corners (scarf joints, mistakes)
    const cornerAllowance = Math.ceil((inside + outside) * 0.5);

    // Total pieces recommended
    const totalPieces = piecesNeeded + cornerAllowance;

    // Calculate miter angles
    const miterInfo = getMiterAngle(wallAngle, spring);

    // Cost estimation (average $2-5 per linear foot for standard crown)
    const estimatedCostLow = perimeter * 2;
    const estimatedCostHigh = perimeter * 5;

    return {
      perimeter: perimeter.toFixed(1),
      totalWithWaste: totalWithWaste.toFixed(1),
      piecesNeeded,
      cornerAllowance,
      totalPieces,
      totalCorners: inside + outside,
      insideCorners: inside,
      outsideCorners: outside,
      miterAngle: miterInfo.angle.toFixed(1),
      miterDescription: miterInfo.description,
      sawSetting: miterInfo.sawSetting,
      estimatedCostLow: estimatedCostLow.toFixed(0),
      estimatedCostHigh: estimatedCostHigh.toFixed(0),
      moldingLengthFt: moldingLength,
    };
  }, [roomPerimeter, insideCorners, outsideCorners, moldingLength, wasteFactor, wallAngle, springAngle]);

  const copingTips = [
    'Cope inside corners for a tighter, more professional fit',
    'Cut the coped piece at 90° first, then back-cut with a coping saw',
    'Use a pencil to highlight the profile edge before coping',
    'Test fit frequently and adjust as needed',
    'Miter outside corners - coping is for inside corners only',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg"><Ruler className="w-5 h-5 text-indigo-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.crownMoldingCalculator', 'Crown Molding Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.crownMoldingCalculator.calculateMaterialsAndMiterAngles', 'Calculate materials and miter angles')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.crownMoldingCalculator.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Room Perimeter Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.crownMoldingCalculator.roomPerimeterFeet', 'Room Perimeter (feet)')}
          </label>
          <input
            type="number"
            value={roomPerimeter}
            onChange={(e) => setRoomPerimeter(e.target.value)}
            placeholder={t('tools.crownMoldingCalculator.enterTotalWallLength', 'Enter total wall length')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.crownMoldingCalculator.measureAllWallsWhereMolding', 'Measure all walls where molding will be installed')}
          </p>
        </div>

        {/* Corner Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <CornerDownLeft className="w-4 h-4 inline mr-1" />
              {t('tools.crownMoldingCalculator.insideCorners2', 'Inside Corners')}
            </label>
            <div className="flex gap-2">
              {[0, 2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setInsideCorners(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(insideCorners) === n ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={insideCorners}
              onChange={(e) => setInsideCorners(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <CornerUpRight className="w-4 h-4 inline mr-1" />
              {t('tools.crownMoldingCalculator.outsideCorners2', 'Outside Corners')}
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setOutsideCorners(n.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm ${parseInt(outsideCorners) === n ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={outsideCorners}
              onChange={(e) => setOutsideCorners(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Molding Length Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.crownMoldingCalculator.moldingLength', 'Molding Length')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {moldingLengths.map((length) => (
              <button
                key={length.value}
                onClick={() => setMoldingLength(length.value)}
                className={`py-3 px-4 rounded-lg text-sm font-medium ${moldingLength === length.value ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {length.label}
              </button>
            ))}
          </div>
        </div>

        {/* Waste Factor */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Waste Factor: {wasteFactor}%
          </label>
          <input
            type="range"
            min="5"
            max="25"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(e.target.value)}
            className="w-full accent-indigo-500"
          />
          <div className={`flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>5% (Experienced)</span>
            <span>15% (Standard)</span>
            <span>25% (Beginner)</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-indigo-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.piecesNeeded', 'Pieces Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-indigo-500">{calculations.totalPieces}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.piecesNeeded} base + {calculations.cornerAllowance} extra
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.totalLength', 'Total Length')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.totalWithWaste} ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Including {wasteFactor}% waste
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.materialSummary', 'Material Summary')}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.crownMoldingCalculator.roomPerimeter', 'Room Perimeter:')}</span> {calculations.perimeter} ft
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.crownMoldingCalculator.totalCorners', 'Total Corners:')}</span> {calculations.totalCorners}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.crownMoldingCalculator.insideCorners', 'Inside Corners:')}</span> {calculations.insideCorners}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.crownMoldingCalculator.outsideCorners', 'Outside Corners:')}</span> {calculations.outsideCorners}
            </div>
            <div className={`col-span-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">{t('tools.crownMoldingCalculator.estCost', 'Est. Cost:')}</span> ${calculations.estimatedCostLow} - ${calculations.estimatedCostHigh} (material only)
            </div>
          </div>
        </div>

        {/* Miter Angle Calculator */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-indigo-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.miterAngleCalculator', 'Miter Angle Calculator')}</h4>
          </div>

          <div className="space-y-4">
            {/* Wall Angle Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.crownMoldingCalculator.wallCornerAngle', 'Wall Corner Angle')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {wallAngles.map((angle) => (
                  <button
                    key={angle.value}
                    onClick={() => setWallAngle(angle.value)}
                    className={`py-2 px-3 rounded-lg text-sm ${wallAngle === angle.value ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    <div className="font-medium">{angle.label}</div>
                    <div className={`text-xs ${wallAngle === angle.value ? 'text-indigo-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {angle.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spring Angle */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Spring Angle: {springAngle}°
              </label>
              <input
                type="range"
                min="30"
                max="52"
                value={springAngle}
                onChange={(e) => setSpringAngle(e.target.value)}
                className="w-full accent-indigo-500"
              />
              <div className={`flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>30° (Older homes)</span>
                <span>38° (Standard)</span>
                <span>52° (Large profiles)</span>
              </div>
            </div>

            {/* Calculated Angles */}
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {calculations.miterDescription}
              </div>
              <div className={`text-lg font-bold text-indigo-500`}>
                {calculations.sawSetting}
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.crownMoldingCalculator.setYourCompoundMiterSaw', 'Set your compound miter saw to these angles for accurate cuts')}
              </p>
            </div>
          </div>
        </div>

        {/* Coping Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Scissors className={`w-5 h-5 mt-0.5 text-indigo-500`} />
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.crownMoldingCalculator.copingTipsForInsideCorners', 'Coping Tips for Inside Corners')}</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {copingTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.crownMoldingCalculator.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Always buy 10-15% extra for waste and mistakes</li>
                <li>• Test cuts on scrap pieces before cutting good stock</li>
                <li>• For long walls, plan seams (scarf joints) in less visible areas</li>
                <li>• Acclimate molding in the room 24-48 hours before installation</li>
                <li>• Mark the wall side on each piece to avoid cutting errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrownMoldingCalculatorTool;
