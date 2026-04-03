import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plug, Globe, Zap, AlertTriangle, Check, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface PlugType {
  type: string;
  description: string;
  grounded: boolean;
  image: string;
}

interface CountryElectrical {
  code: string;
  name: string;
  voltage: string;
  frequency: string;
  plugTypes: string[];
}

const PLUG_TYPES: Record<string, PlugType> = {
  A: { type: 'A', description: 'Two flat parallel pins', grounded: false, image: '🔌' },
  B: { type: 'B', description: 'Two flat parallel pins + grounding pin', grounded: true, image: '🔌' },
  C: { type: 'C', description: 'Two round pins (Europlug)', grounded: false, image: '🔌' },
  D: { type: 'D', description: 'Three large round pins in triangle', grounded: true, image: '🔌' },
  E: { type: 'E', description: 'Two round pins + grounding pin hole', grounded: true, image: '🔌' },
  F: { type: 'F', description: 'Two round pins + grounding clips (Schuko)', grounded: true, image: '🔌' },
  G: { type: 'G', description: 'Three rectangular pins in triangle', grounded: true, image: '🔌' },
  H: { type: 'H', description: 'Three pins in V-shape', grounded: true, image: '🔌' },
  I: { type: 'I', description: 'Two angled flat pins + grounding', grounded: true, image: '🔌' },
  J: { type: 'J', description: 'Three round pins (Swiss)', grounded: true, image: '🔌' },
  K: { type: 'K', description: 'Three round pins (Danish)', grounded: true, image: '🔌' },
  L: { type: 'L', description: 'Three round pins in a row', grounded: true, image: '🔌' },
  M: { type: 'M', description: 'Three large round pins', grounded: true, image: '🔌' },
  N: { type: 'N', description: 'Three round pins (Brazilian)', grounded: true, image: '🔌' },
  O: { type: 'O', description: 'Three round pins (Thai)', grounded: true, image: '🔌' },
};

const COUNTRIES: CountryElectrical[] = [
  { code: 'US', name: 'United States', voltage: '120V', frequency: '60Hz', plugTypes: ['A', 'B'] },
  { code: 'CA', name: 'Canada', voltage: '120V', frequency: '60Hz', plugTypes: ['A', 'B'] },
  { code: 'MX', name: 'Mexico', voltage: '127V', frequency: '60Hz', plugTypes: ['A', 'B'] },
  { code: 'UK', name: 'United Kingdom', voltage: '230V', frequency: '50Hz', plugTypes: ['G'] },
  { code: 'IE', name: 'Ireland', voltage: '230V', frequency: '50Hz', plugTypes: ['G'] },
  { code: 'DE', name: 'Germany', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'FR', name: 'France', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'E'] },
  { code: 'IT', name: 'Italy', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F', 'L'] },
  { code: 'ES', name: 'Spain', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'NL', name: 'Netherlands', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'BE', name: 'Belgium', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'E'] },
  { code: 'CH', name: 'Switzerland', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'J'] },
  { code: 'AT', name: 'Austria', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'AU', name: 'Australia', voltage: '230V', frequency: '50Hz', plugTypes: ['I'] },
  { code: 'NZ', name: 'New Zealand', voltage: '230V', frequency: '50Hz', plugTypes: ['I'] },
  { code: 'JP', name: 'Japan', voltage: '100V', frequency: '50/60Hz', plugTypes: ['A', 'B'] },
  { code: 'CN', name: 'China', voltage: '220V', frequency: '50Hz', plugTypes: ['A', 'C', 'I'] },
  { code: 'HK', name: 'Hong Kong', voltage: '220V', frequency: '50Hz', plugTypes: ['G'] },
  { code: 'SG', name: 'Singapore', voltage: '230V', frequency: '50Hz', plugTypes: ['G'] },
  { code: 'KR', name: 'South Korea', voltage: '220V', frequency: '60Hz', plugTypes: ['C', 'F'] },
  { code: 'TH', name: 'Thailand', voltage: '220V', frequency: '50Hz', plugTypes: ['A', 'B', 'C', 'O'] },
  { code: 'VN', name: 'Vietnam', voltage: '220V', frequency: '50Hz', plugTypes: ['A', 'C', 'G'] },
  { code: 'MY', name: 'Malaysia', voltage: '240V', frequency: '50Hz', plugTypes: ['G'] },
  { code: 'ID', name: 'Indonesia', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'PH', name: 'Philippines', voltage: '220V', frequency: '60Hz', plugTypes: ['A', 'B', 'C'] },
  { code: 'IN', name: 'India', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'D', 'M'] },
  { code: 'BD', name: 'Bangladesh', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'D', 'G', 'K'] },
  { code: 'AE', name: 'UAE', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'G'] },
  { code: 'SA', name: 'Saudi Arabia', voltage: '220V', frequency: '60Hz', plugTypes: ['A', 'B', 'G'] },
  { code: 'ZA', name: 'South Africa', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'M', 'N'] },
  { code: 'EG', name: 'Egypt', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'BR', name: 'Brazil', voltage: '127/220V', frequency: '60Hz', plugTypes: ['C', 'N'] },
  { code: 'AR', name: 'Argentina', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'I'] },
  { code: 'RU', name: 'Russia', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'TR', name: 'Turkey', voltage: '220V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'IL', name: 'Israel', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'H'] },
  { code: 'DK', name: 'Denmark', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'E', 'F', 'K'] },
  { code: 'SE', name: 'Sweden', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'NO', name: 'Norway', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
  { code: 'FI', name: 'Finland', voltage: '230V', frequency: '50Hz', plugTypes: ['C', 'F'] },
];

interface TravelAdapterToolProps {
  uiConfig?: UIConfig;
}

export const TravelAdapterTool: React.FC<TravelAdapterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeCountry, setHomeCountry] = useState<string>('US');
  const [destinationCountry, setDestinationCountry] = useState<string>('UK');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.homeCountry || params.from) {
        const code = String(params.homeCountry || params.from).toUpperCase();
        if (COUNTRIES.find(c => c.code === code)) {
          setHomeCountry(code);
          hasChanges = true;
        }
      }
      if (params.destination || params.to) {
        const code = String(params.destination || params.to).toUpperCase();
        if (COUNTRIES.find(c => c.code === code)) {
          setDestinationCountry(code);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const analysis = useMemo(() => {
    const home = COUNTRIES.find(c => c.code === homeCountry);
    const dest = COUNTRIES.find(c => c.code === destinationCountry);

    if (!home || !dest) return null;

    // Check plug compatibility
    const compatiblePlugs = home.plugTypes.filter(p => dest.plugTypes.includes(p));
    const needsAdapter = compatiblePlugs.length === 0;

    // Check voltage compatibility
    const homeVoltage = parseInt(home.voltage);
    const destVoltage = parseInt(dest.voltage);
    const voltageDiff = Math.abs(homeVoltage - destVoltage);
    const needsConverter = voltageDiff > 20;

    // Recommended adapter types
    const neededPlugTypes = dest.plugTypes.filter(p => !home.plugTypes.includes(p));

    return {
      home,
      dest,
      compatiblePlugs,
      needsAdapter,
      needsConverter,
      neededPlugTypes,
      voltageDiff,
    };
  }, [homeCountry, destinationCountry]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Plug className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.travelAdapter.travelAdapterFinder', 'Travel Adapter Finder')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.travelAdapter.findTheRightPowerAdapter', 'Find the right power adapter for your destination')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.travelAdapter.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Country Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t('tools.travelAdapter.yourHomeCountry', 'Your Home Country')}
                </label>
                <select
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t('tools.travelAdapter.destinationCountry', 'Destination Country')}
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {analysis && (
              <div className="space-y-4">
                {/* Compatibility Summary */}
                <div className={`p-6 rounded-xl border ${
                  !analysis.needsAdapter && !analysis.needsConverter
                    ? isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
                    : analysis.needsConverter
                    ? isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
                    : isDark ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    {!analysis.needsAdapter && !analysis.needsConverter ? (
                      <Check className="w-8 h-8 text-green-500" />
                    ) : (
                      <AlertTriangle className={`w-8 h-8 ${analysis.needsConverter ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {!analysis.needsAdapter && !analysis.needsConverter
                          ? 'Your devices are compatible!'
                          : analysis.needsConverter
                          ? t('tools.travelAdapter.adapterAndConverterNeeded', 'Adapter AND Converter needed') : t('tools.travelAdapter.adapterNeeded', 'Adapter needed')}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {analysis.home.name} to {analysis.dest.name}
                      </p>
                    </div>
                  </div>

                  {/* Electrical Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analysis.home.name}
                      </h3>
                      <div className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p><Zap className="w-4 h-4 inline mr-1" /> Voltage: {analysis.home.voltage}</p>
                        <p>Frequency: {analysis.home.frequency}</p>
                        <p>Plug Types: {analysis.home.plugTypes.join(', ')}</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {analysis.dest.name}
                      </h3>
                      <div className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p><Zap className="w-4 h-4 inline mr-1" /> Voltage: {analysis.dest.voltage}</p>
                        <p>Frequency: {analysis.dest.frequency}</p>
                        <p>Plug Types: {analysis.dest.plugTypes.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Needed Adapter Types */}
                {analysis.needsAdapter && analysis.neededPlugTypes.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Plug className="w-4 h-4 inline mr-1" />
                      {t('tools.travelAdapter.youNeedAnAdapterFor', 'You need an adapter for plug type(s):')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {analysis.neededPlugTypes.map((type) => {
                        const plugInfo = PLUG_TYPES[type];
                        return (
                          <div
                            key={type}
                            className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-600' : 'bg-white'}`}
                          >
                            <div className="text-3xl mb-2">{plugInfo?.image || '🔌'}</div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Type {type}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {plugInfo?.description}
                            </div>
                            {plugInfo?.grounded && (
                              <span className="text-xs text-green-500">{t('tools.travelAdapter.grounded', 'Grounded')}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Voltage Warning */}
                {analysis.needsConverter && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'} flex items-start gap-3`}>
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                        {t('tools.travelAdapter.voltageConverterRequired', 'Voltage Converter Required')}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        {analysis.home.name} uses {analysis.home.voltage} while {analysis.dest.name} uses {analysis.dest.voltage}.
                        Using devices without a converter may damage them or cause safety hazards.
                        Modern electronics like phone chargers and laptops often have dual-voltage (100-240V) - check your device's label.
                      </p>
                    </div>
                  </div>
                )}

                {/* Compatible Plugs */}
                {analysis.compatiblePlugs.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`flex items-center gap-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      <Check className="w-4 h-4" />
                      <span>
                        Plug type(s) {analysis.compatiblePlugs.join(', ')} will work without an adapter
                      </span>
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.travelAdapter.recommendations', 'Recommendations')}
                  </h3>
                  <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {t('tools.travelAdapter.considerAUniversalTravelAdapter', 'Consider a universal travel adapter that works in multiple countries')}
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {t('tools.travelAdapter.checkIfYourDevicesAre', 'Check if your devices are dual-voltage (100-240V) - most modern electronics are')}
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {t('tools.travelAdapter.bringAPowerStripFrom', 'Bring a power strip from home to charge multiple devices with one adapter')}
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {t('tools.travelAdapter.hairDryersAndCurlingIrons', 'Hair dryers and curling irons often need converters - consider buying locally')}
                    </li>
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
                  <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Plug types and voltage standards can vary within some countries. Always verify your specific
                    accommodation's electrical system. When in doubt, use a quality universal adapter with surge protection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelAdapterTool;
