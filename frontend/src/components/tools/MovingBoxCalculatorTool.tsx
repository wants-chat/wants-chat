import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Home, Sparkles, Info, Plus, Minus, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type HomeSize = 'studio' | '1br' | '2br' | '3br' | '4br' | '5br';
type PackingStyle = 'minimal' | 'average' | 'maximalist';
type RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'livingRoom' | 'diningRoom' | 'office' | 'garage' | 'laundry';

interface RoomCount {
  type: RoomType;
  name: string;
  count: number;
}

interface MovingBoxCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const MovingBoxCalculatorTool: React.FC<MovingBoxCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeSize, setHomeSize] = useState<HomeSize>('2br');
  const [packingStyle, setPackingStyle] = useState<PackingStyle>('average');
  const [rooms, setRooms] = useState<RoomCount[]>([
    { type: 'bedroom', name: 'Bedrooms', count: 2 },
    { type: 'bathroom', name: 'Bathrooms', count: 1 },
    { type: 'kitchen', name: 'Kitchen', count: 1 },
    { type: 'livingRoom', name: 'Living Room', count: 1 },
    { type: 'diningRoom', name: 'Dining Room', count: 0 },
    { type: 'office', name: 'Home Office', count: 0 },
    { type: 'garage', name: 'Garage', count: 0 },
    { type: 'laundry', name: 'Laundry Room', count: 0 },
  ]);
  const [hasSpecialItems, setHasSpecialItems] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.homeSize) {
        setHomeSize(params.homeSize as HomeSize);
        setIsPrefilled(true);
      }
      if (params.bedrooms !== undefined) {
        setRooms(prev => prev.map(r =>
          r.type === 'bedroom' ? { ...r, count: Number(params.bedrooms) } : r
        ));
        setIsPrefilled(true);
      }
      if (params.packingStyle) {
        setPackingStyle(params.packingStyle as PackingStyle);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const homeSizes = {
    studio: { name: 'Studio', sqft: '400-600' },
    '1br': { name: '1 Bedroom', sqft: '600-900' },
    '2br': { name: '2 Bedroom', sqft: '900-1200' },
    '3br': { name: '3 Bedroom', sqft: '1200-1800' },
    '4br': { name: '4 Bedroom', sqft: '1800-2500' },
    '5br': { name: '5+ Bedroom', sqft: '2500+' },
  };

  const packingStyles = {
    minimal: { name: 'Minimalist', multiplier: 0.7, description: 'Few possessions, decluttered' },
    average: { name: 'Average', multiplier: 1, description: 'Typical household' },
    maximalist: { name: 'Collector', multiplier: 1.5, description: 'Lots of items, collections' },
  };

  // Box estimates per room type (for average style)
  const boxesPerRoom: Record<RoomType, { small: number; medium: number; large: number; wardrobe: number }> = {
    bedroom: { small: 4, medium: 6, large: 3, wardrobe: 2 },
    bathroom: { small: 2, medium: 2, large: 0, wardrobe: 0 },
    kitchen: { small: 8, medium: 10, large: 4, wardrobe: 0 },
    livingRoom: { small: 5, medium: 8, large: 4, wardrobe: 0 },
    diningRoom: { small: 4, medium: 6, large: 2, wardrobe: 0 },
    office: { small: 6, medium: 8, large: 3, wardrobe: 0 },
    garage: { small: 4, medium: 10, large: 8, wardrobe: 0 },
    laundry: { small: 2, medium: 3, large: 1, wardrobe: 0 },
  };

  const updateRoomCount = (type: RoomType, delta: number) => {
    setRooms(rooms.map(room =>
      room.type === type
        ? { ...room, count: Math.max(0, room.count + delta) }
        : room
    ));
  };

  const calculations = useMemo(() => {
    const styleMultiplier = packingStyles[packingStyle].multiplier;

    // Calculate boxes by type
    let totalSmall = 0;
    let totalMedium = 0;
    let totalLarge = 0;
    let totalWardrobe = 0;

    rooms.forEach(room => {
      if (room.count > 0) {
        const perRoom = boxesPerRoom[room.type];
        totalSmall += perRoom.small * room.count;
        totalMedium += perRoom.medium * room.count;
        totalLarge += perRoom.large * room.count;
        totalWardrobe += perRoom.wardrobe * room.count;
      }
    });

    // Apply style multiplier
    totalSmall = Math.ceil(totalSmall * styleMultiplier);
    totalMedium = Math.ceil(totalMedium * styleMultiplier);
    totalLarge = Math.ceil(totalLarge * styleMultiplier);
    totalWardrobe = Math.ceil(totalWardrobe * styleMultiplier);

    const totalBoxes = totalSmall + totalMedium + totalLarge + totalWardrobe;

    // Supplies needed
    const packingTapeRolls = Math.ceil(totalBoxes / 15); // 1 roll per 15 boxes
    const packingPaperPounds = Math.ceil(totalBoxes * 0.8); // 0.8 lbs per box
    const bubbleWrapFeet = Math.ceil(totalBoxes * 3); // 3 feet per box average

    // Cost estimates
    const boxCosts = {
      small: 1.50,
      medium: 2.50,
      large: 3.50,
      wardrobe: 12.00,
    };
    const supplyCosts = {
      tape: 4.00,
      paper: 0.50, // per pound
      bubbleWrap: 0.15, // per foot
    };

    const boxCostTotal =
      totalSmall * boxCosts.small +
      totalMedium * boxCosts.medium +
      totalLarge * boxCosts.large +
      totalWardrobe * boxCosts.wardrobe;

    const supplyCostTotal =
      packingTapeRolls * supplyCosts.tape +
      packingPaperPounds * supplyCosts.paper +
      bubbleWrapFeet * supplyCosts.bubbleWrap;

    const totalCost = boxCostTotal + supplyCostTotal;

    // Special items recommendations
    const specialBoxes = hasSpecialItems ? [
      { name: 'TV Box (flat screen)', quantity: 1, cost: 15 },
      { name: 'Mirror/Picture Boxes', quantity: 4, cost: 8 },
      { name: 'Dish Pack Box', quantity: 2, cost: 6 },
      { name: 'Mattress Bags', quantity: rooms.find(r => r.type === 'bedroom')?.count || 1, cost: 10 },
    ] : [];

    const specialItemsCost = specialBoxes.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    // Packing time estimate (hours)
    const packingHours = Math.ceil(totalBoxes * 0.25); // 15 min per box average

    return {
      boxes: {
        small: totalSmall,
        medium: totalMedium,
        large: totalLarge,
        wardrobe: totalWardrobe,
        total: totalBoxes,
      },
      supplies: {
        tape: packingTapeRolls,
        paper: packingPaperPounds,
        bubbleWrap: bubbleWrapFeet,
      },
      costs: {
        boxes: boxCostTotal,
        supplies: supplyCostTotal,
        special: specialItemsCost,
        total: totalCost + specialItemsCost,
      },
      specialBoxes,
      packingHours,
      totalRooms: rooms.reduce((sum, r) => sum + r.count, 0),
    };
  }, [rooms, packingStyle, hasSpecialItems]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Package className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingBoxCalculator.movingBoxCalculator', 'Moving Box Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingBoxCalculator.estimateBoxesNeededForYour', 'Estimate boxes needed for your move')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.movingBoxCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Home Size */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.movingBoxCalculator.homeSize', 'Home Size')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(homeSizes) as HomeSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setHomeSize(size)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  homeSize === size
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {homeSizes[size].name}
              </button>
            ))}
          </div>
        </div>

        {/* Packing Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.movingBoxCalculator.packingStyle', 'Packing Style')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(packingStyles) as PackingStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setPackingStyle(style)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  packingStyle === style
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{packingStyles[style].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {packingStyles[packingStyle].description}
          </p>
        </div>

        {/* Room Counts */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.movingBoxCalculator.roomBreakdown', 'Room Breakdown')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room) => (
              <div
                key={room.type}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{room.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateRoomCount(room.type, -1)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`w-6 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {room.count}
                  </span>
                  <button
                    onClick={() => updateRoomCount(room.type, 1)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Items */}
        <div className="space-y-2">
          <button
            onClick={() => setHasSpecialItems(!hasSpecialItems)}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${hasSpecialItems ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Truck className="w-4 h-4" />
            {t('tools.movingBoxCalculator.includeSpecialtyBoxesTvsMirrors', 'Include specialty boxes (TVs, mirrors, mattresses)')}
          </button>
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.totalBoxesNeeded', 'Total Boxes Needed')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.boxes.total}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.totalRooms} room{calculations.totalRooms !== 1 ? 's' : ''} | ~{calculations.packingHours}h to pack
          </div>
        </div>

        {/* Box Breakdown */}
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.small', 'Small')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boxes.small}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>16x12x12</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.medium', 'Medium')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boxes.medium}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>18x18x16</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.large', 'Large')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boxes.large}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>18x18x24</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.wardrobe', 'Wardrobe')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.boxes.wardrobe}</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>24x21x46</div>
          </div>
        </div>

        {/* Packing Supplies */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.movingBoxCalculator.packingSuppliesNeeded', 'Packing Supplies Needed')}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.supplies.tape}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.rollsOfTape', 'Rolls of Tape')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.supplies.paper}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.lbsPackingPaper', 'lbs Packing Paper')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.supplies.bubbleWrap}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingBoxCalculator.ftBubbleWrap', 'ft Bubble Wrap')}</div>
            </div>
          </div>
        </div>

        {/* Specialty Boxes */}
        {hasSpecialItems && calculations.specialBoxes.length > 0 && (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.movingBoxCalculator.specialtyBoxes2', 'Specialty Boxes')}
            </h4>
            <div className="space-y-2">
              {calculations.specialBoxes.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>x{item.quantity}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>${item.quantity * item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.movingBoxCalculator.estimatedSupplyCost', 'Estimated Supply Cost')}
          </h4>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.movingBoxCalculator.boxes', 'Boxes')}</span>
              <span>${calculations.costs.boxes.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>{t('tools.movingBoxCalculator.packingSupplies', 'Packing Supplies')}</span>
              <span>${calculations.costs.supplies.toFixed(2)}</span>
            </div>
            {hasSpecialItems && (
              <div className={`flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>{t('tools.movingBoxCalculator.specialtyBoxes', 'Specialty Boxes')}</span>
                <span>${calculations.costs.special.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between font-bold pt-2 border-t ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
              <span>{t('tools.movingBoxCalculator.totalEstimate', 'Total Estimate')}</span>
              <span className="text-teal-500">${calculations.costs.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.movingBoxCalculator.packingTips', 'Packing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Heavy items in small boxes, light items in large boxes</li>
                <li>- Use wardrobe boxes for hanging clothes</li>
                <li>- Pack one room at a time</li>
                <li>- Label boxes on multiple sides</li>
                <li>- Order 10-15% extra boxes just in case</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingBoxCalculatorTool;
