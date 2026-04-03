import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hotel, Calendar, Users, DollarSign, Percent, Calculator, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface HotelCostToolProps {
  uiConfig?: UIConfig;
}

export const HotelCostTool: React.FC<HotelCostToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [nightlyRate, setNightlyRate] = useState<string>('150');
  const [numberOfNights, setNumberOfNights] = useState<string>('3');
  const [numberOfRooms, setNumberOfRooms] = useState<string>('1');
  const [taxRate, setTaxRate] = useState<string>('12');
  const [resortFee, setResortFee] = useState<string>('25');
  const [parkingPerDay, setParkingPerDay] = useState<string>('0');
  const [breakfastPerDay, setBreakfastPerDay] = useState<string>('0');
  const [otherFees, setOtherFees] = useState<string>('0');
  const [discount, setDiscount] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('USD');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.nightlyRate || params.rate) {
        setNightlyRate(String(params.nightlyRate || params.rate));
        hasChanges = true;
      }
      if (params.nights || params.numberOfNights) {
        setNumberOfNights(String(params.nights || params.numberOfNights));
        hasChanges = true;
      }
      if (params.rooms || params.numberOfRooms) {
        setNumberOfRooms(String(params.rooms || params.numberOfRooms));
        hasChanges = true;
      }
      if (params.taxRate) {
        setTaxRate(String(params.taxRate));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  const calculations = useMemo(() => {
    const rate = parseFloat(nightlyRate) || 0;
    const nights = parseInt(numberOfNights) || 0;
    const rooms = parseInt(numberOfRooms) || 1;
    const tax = parseFloat(taxRate) || 0;
    const resort = parseFloat(resortFee) || 0;
    const parking = parseFloat(parkingPerDay) || 0;
    const breakfast = parseFloat(breakfastPerDay) || 0;
    const other = parseFloat(otherFees) || 0;
    const disc = parseFloat(discount) || 0;

    // Base room cost
    const roomSubtotal = rate * nights * rooms;

    // Apply discount
    const discountAmount = (roomSubtotal * disc) / 100;
    const discountedRoomTotal = roomSubtotal - discountAmount;

    // Calculate taxes on room rate
    const taxAmount = (discountedRoomTotal * tax) / 100;

    // Additional fees (per night per room)
    const resortFeesTotal = resort * nights * rooms;
    const parkingTotal = parking * nights;
    const breakfastTotal = breakfast * nights * rooms;

    // Calculate totals
    const additionalFeesTotal = resortFeesTotal + parkingTotal + breakfastTotal + other;
    const grandTotal = discountedRoomTotal + taxAmount + additionalFeesTotal;

    const averagePerNight = nights > 0 ? grandTotal / nights : 0;
    const averagePerRoom = rooms > 0 ? grandTotal / rooms : 0;

    return {
      roomSubtotal,
      discountAmount,
      discountedRoomTotal,
      taxAmount,
      resortFeesTotal,
      parkingTotal,
      breakfastTotal,
      additionalFeesTotal,
      grandTotal,
      averagePerNight,
      averagePerRoom,
    };
  }, [nightlyRate, numberOfNights, numberOfRooms, taxRate, resortFee, parkingPerDay, breakfastPerDay, otherFees, discount]);

  const formatCurrency = (amount: number): string => {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hotelCost.hotelTotalCostCalculator', 'Hotel Total Cost Calculator')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.hotelCost.calculateYourCompleteHotelStay', 'Calculate your complete hotel stay cost including taxes and fees')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.hotelCost.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Currency Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.hotelCost.currency', 'Currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="USD">{t('tools.hotelCost.usdUsDollar', 'USD - US Dollar')}</option>
                <option value="EUR">{t('tools.hotelCost.eurEuro', 'EUR - Euro')}</option>
                <option value="GBP">{t('tools.hotelCost.gbpBritishPound', 'GBP - British Pound')}</option>
                <option value="CAD">{t('tools.hotelCost.cadCanadianDollar', 'CAD - Canadian Dollar')}</option>
                <option value="AUD">{t('tools.hotelCost.audAustralianDollar', 'AUD - Australian Dollar')}</option>
                <option value="JPY">{t('tools.hotelCost.jpyJapaneseYen', 'JPY - Japanese Yen')}</option>
              </select>
            </div>

            {/* Basic Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.hotelCost.nightlyRate', 'Nightly Rate')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('tools.hotelCost.numberOfNights', 'Number of Nights')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfNights}
                  onChange={(e) => setNumberOfNights(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.hotelCost.numberOfRooms', 'Number of Rooms')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Taxes & Discounts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Percent className="w-4 h-4 inline mr-1" />
                  {t('tools.hotelCost.taxRate', 'Tax Rate (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Percent className="w-4 h-4 inline mr-1" />
                  {t('tools.hotelCost.discount', 'Discount (%)')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Additional Fees */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.hotelCost.additionalFeesPerNightPer', 'Additional Fees (per night per room unless noted)')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hotelCost.resortFacilityFee', 'Resort/Facility Fee')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={resortFee}
                    onChange={(e) => setResortFee(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hotelCost.parkingPerNightTotal', 'Parking (per night total)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={parkingPerDay}
                    onChange={(e) => setParkingPerDay(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hotelCost.breakfastPerNightPerRoom', 'Breakfast (per night per room)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={breakfastPerDay}
                    onChange={(e) => setBreakfastPerDay(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.hotelCost.otherFeesOneTime', 'Other Fees (one-time)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={otherFees}
                    onChange={(e) => setOtherFees(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-[#0D9488]" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.hotelCost.costBreakdown', 'Cost Breakdown')}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.roomSubtotal', 'Room Subtotal')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.roomSubtotal)}</span>
                </div>

                {calculations.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatCurrency(calculations.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.roomTotalAfterDiscount', 'Room Total (after discount)')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.discountedRoomTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Taxes ({taxRate}%)</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.taxAmount)}</span>
                </div>

                {calculations.resortFeesTotal > 0 && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.resortFees', 'Resort Fees')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.resortFeesTotal)}</span>
                  </div>
                )}

                {calculations.parkingTotal > 0 && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.parking', 'Parking')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.parkingTotal)}</span>
                  </div>
                )}

                {calculations.breakfastTotal > 0 && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.breakfast', 'Breakfast')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(calculations.breakfastTotal)}</span>
                  </div>
                )}

                {parseFloat(otherFees) > 0 && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.hotelCost.otherFees', 'Other Fees')}</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatCurrency(parseFloat(otherFees))}</span>
                  </div>
                )}

                <div className={`border-t pt-3 ${isDark ? 'border-teal-700' : 'border-teal-200'}`}>
                  <div className="flex justify-between">
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hotelCost.grandTotal', 'Grand Total')}</span>
                    <span className="text-2xl font-bold text-[#0D9488]">{formatCurrency(calculations.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotelCost.averagePerNight', 'Average per Night')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.averagePerNight)}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.hotelCost.averagePerRoom', 'Average per Room')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.averagePerRoom)}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium mb-1">{t('tools.hotelCost.moneySavingTips', 'Money-Saving Tips:')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('tools.hotelCost.bookDirectlyWithHotelsFor', 'Book directly with hotels for best rate guarantees')}</li>
                  <li>{t('tools.hotelCost.checkForAaaAarpOr', 'Check for AAA, AARP, or corporate discounts')}</li>
                  <li>{t('tools.hotelCost.compareTotalCostsIncludingAll', 'Compare total costs including all fees, not just room rates')}</li>
                  <li>{t('tools.hotelCost.considerStayingSlightlyOutsideTourist', 'Consider staying slightly outside tourist areas for lower rates')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCostTool;
