import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Truck, Plane, Ship, Package, Sparkles, Calendar, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DeliveryTimeEstimatorToolProps {
  uiConfig?: UIConfig;
}

type ShippingMode = 'ground' | 'express' | 'air' | 'sea';
type ServiceLevel = 'economy' | 'standard' | 'priority' | 'overnight';

interface ShippingOption {
  mode: ShippingMode;
  service: ServiceLevel;
  name: string;
  icon: React.ReactNode;
  baseTime: number; // days
  distanceFactor: number; // additional days per 1000 miles
  cost: string;
}

export const DeliveryTimeEstimatorTool: React.FC<DeliveryTimeEstimatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originCountry, setOriginCountry] = useState('US');
  const [destCountry, setDestCountry] = useState('US');
  const [originCity, setOriginCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [distance, setDistance] = useState('500');
  const [shipDate, setShipDate] = useState(new Date().toISOString().split('T')[0]);
  const [packageType, setPackageType] = useState<'document' | 'parcel' | 'freight'>('parcel');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        setIsPrefilled(true);
      }
      if (params.origin !== undefined) {
        setOriginCity(String(params.origin));
        setIsPrefilled(true);
      }
      if (params.destination !== undefined) {
        setDestCity(String(params.destination));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
  ];

  const isDomestic = originCountry === destCountry;
  const isIntercontinental =
    (originCountry === 'US' && ['CN', 'JP', 'AU', 'IN', 'UK', 'DE', 'FR'].includes(destCountry)) ||
    (['CN', 'JP', 'AU', 'IN'].includes(originCountry) && ['US', 'CA', 'MX', 'UK', 'DE', 'FR'].includes(destCountry));

  const shippingOptions: ShippingOption[] = useMemo(() => {
    const options: ShippingOption[] = [];

    if (isDomestic) {
      options.push(
        { mode: 'ground', service: 'economy', name: 'Ground Economy', icon: <Truck className="w-4 h-4" />, baseTime: 5, distanceFactor: 2, cost: '$' },
        { mode: 'ground', service: 'standard', name: 'Ground Standard', icon: <Truck className="w-4 h-4" />, baseTime: 3, distanceFactor: 1.5, cost: '$$' },
        { mode: 'express', service: 'priority', name: 'Express Priority', icon: <Truck className="w-4 h-4" />, baseTime: 2, distanceFactor: 0.5, cost: '$$$' },
        { mode: 'air', service: 'overnight', name: 'Next Day Air', icon: <Plane className="w-4 h-4" />, baseTime: 1, distanceFactor: 0, cost: '$$$$' },
      );
    } else if (isIntercontinental) {
      options.push(
        { mode: 'sea', service: 'economy', name: 'Ocean Freight', icon: <Ship className="w-4 h-4" />, baseTime: 25, distanceFactor: 5, cost: '$' },
        { mode: 'air', service: 'economy', name: 'Air Economy', icon: <Plane className="w-4 h-4" />, baseTime: 10, distanceFactor: 2, cost: '$$' },
        { mode: 'air', service: 'standard', name: 'Air Standard', icon: <Plane className="w-4 h-4" />, baseTime: 5, distanceFactor: 1, cost: '$$$' },
        { mode: 'air', service: 'priority', name: 'Air Express', icon: <Plane className="w-4 h-4" />, baseTime: 3, distanceFactor: 0.5, cost: '$$$$' },
      );
    } else {
      options.push(
        { mode: 'ground', service: 'economy', name: 'Ground Economy', icon: <Truck className="w-4 h-4" />, baseTime: 7, distanceFactor: 3, cost: '$' },
        { mode: 'ground', service: 'standard', name: 'Ground Standard', icon: <Truck className="w-4 h-4" />, baseTime: 5, distanceFactor: 2, cost: '$$' },
        { mode: 'air', service: 'standard', name: 'Air Standard', icon: <Plane className="w-4 h-4" />, baseTime: 3, distanceFactor: 1, cost: '$$$' },
        { mode: 'air', service: 'priority', name: 'Air Express', icon: <Plane className="w-4 h-4" />, baseTime: 2, distanceFactor: 0.5, cost: '$$$$' },
      );
    }

    return options;
  }, [isDomestic, isIntercontinental]);

  const calculations = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    const shipDateObj = new Date(shipDate);

    const results = shippingOptions.map(option => {
      let days = option.baseTime + Math.floor(dist / 1000) * option.distanceFactor;

      // Add customs clearance time for international
      if (!isDomestic) {
        days += 1; // 1 day for customs
      }

      // Calculate delivery date (excluding weekends for ground)
      let deliveryDate = new Date(shipDateObj);
      let businessDays = Math.ceil(days);

      if (option.mode === 'ground') {
        let addedDays = 0;
        while (addedDays < businessDays) {
          deliveryDate.setDate(deliveryDate.getDate() + 1);
          const dayOfWeek = deliveryDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
          }
        }
      } else {
        deliveryDate.setDate(deliveryDate.getDate() + businessDays);
      }

      // Format range
      const minDays = Math.max(1, Math.floor(days * 0.8));
      const maxDays = Math.ceil(days * 1.2);

      return {
        ...option,
        estimatedDays: days,
        minDays,
        maxDays,
        deliveryDate,
        deliveryDateStr: deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
      };
    });

    return results.sort((a, b) => a.estimatedDays - b.estimatedDays);
  }, [shippingOptions, distance, shipDate, isDomestic]);

  const getDeliveryColor = (days: number) => {
    if (days <= 2) return 'text-green-500';
    if (days <= 5) return 'text-teal-500';
    if (days <= 10) return 'text-amber-500';
    return 'text-orange-500';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.deliveryTimeEstimator.deliveryTimeEstimator', 'Delivery Time Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.deliveryTimeEstimator.estimateShippingTimesForDifferent', 'Estimate shipping times for different service levels')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.deliveryTimeEstimator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Origin and Destination */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.deliveryTimeEstimator.origin', 'Origin')}
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder={t('tools.deliveryTimeEstimator.cityOptional', 'City (optional)')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.deliveryTimeEstimator.destination', 'Destination')}
            </label>
            <select
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              placeholder={t('tools.deliveryTimeEstimator.cityOptional2', 'City (optional)')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Distance and Ship Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.deliveryTimeEstimator.estimatedDistanceMiles', 'Estimated Distance (miles)')}
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.deliveryTimeEstimator.shipDate', 'Ship Date')}
            </label>
            <input
              type="date"
              value={shipDate}
              onChange={(e) => setShipDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Package Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {t('tools.deliveryTimeEstimator.packageType', 'Package Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'document', label: 'Document', desc: 'Envelopes, papers' },
              { value: 'parcel', label: 'Parcel', desc: 'Small packages' },
              { value: 'freight', label: 'Freight', desc: 'Large shipments' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setPackageType(type.value as typeof packageType)}
                className={`py-3 px-3 rounded-lg text-sm transition-colors ${packageType === type.value ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium">{type.label}</div>
                <div className={`text-xs ${packageType === type.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Route Info */}
        <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {!isDomestic && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {isDomestic ? 'Domestic Shipment' : isIntercontinental ? t('tools.deliveryTimeEstimator.internationalIntercontinental', 'International (Intercontinental)') : t('tools.deliveryTimeEstimator.internationalShipment', 'International Shipment')}
            {!isDomestic && ' - Customs clearance may add 1-3 days'}
          </span>
        </div>

        {/* Shipping Options */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.deliveryTimeEstimator.deliveryEstimates', 'Delivery Estimates')}
          </label>
          {calculations.map((option, index) => (
            <div
              key={`${option.mode}-${option.service}`}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${index === 0 ? 'ring-2 ring-teal-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    {option.icon}
                  </div>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {option.name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.minDays}-{option.maxDays} business days
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getDeliveryColor(option.estimatedDays)}`}>
                    {option.deliveryDateStr}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {option.cost}
                  </div>
                </div>
              </div>
              {index === 0 && (
                <div className="mt-2 text-xs text-teal-500 font-medium">{t('tools.deliveryTimeEstimator.fastestOption', 'Fastest Option')}</div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-medium mb-1">{t('tools.deliveryTimeEstimator.deliveryTimeFactors', 'Delivery Time Factors')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('tools.deliveryTimeEstimator.actualTimesMayVaryBased', 'Actual times may vary based on carrier and weather conditions')}</li>
              <li>{t('tools.deliveryTimeEstimator.internationalShipmentsRequireCustomsClearance', 'International shipments require customs clearance')}</li>
              <li>{t('tools.deliveryTimeEstimator.holidaysMayExtendDeliveryTimes', 'Holidays may extend delivery times')}</li>
              <li>{t('tools.deliveryTimeEstimator.remoteAreasMayRequireAdditional', 'Remote areas may require additional transit time')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTimeEstimatorTool;
