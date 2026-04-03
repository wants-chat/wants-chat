import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Globe, Clock, Check, AlertTriangle, Info, Sparkles, DollarSign, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface VisaRequirement {
  type: 'visa-free' | 'visa-on-arrival' | 'evisa' | 'visa-required';
  duration: string;
  notes: string;
  cost?: string;
  processingTime?: string;
}

interface Country {
  code: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
];

// Mock visa requirement data (simplified for demonstration)
const getVisaRequirement = (from: string, to: string): VisaRequirement => {
  // Same country
  if (from === to) {
    return { type: 'visa-free', duration: 'N/A', notes: 'No visa required for domestic travel' };
  }

  // Visa-free countries for US passport holders
  const usVisaFree = ['UK', 'CA', 'DE', 'FR', 'JP', 'KR', 'SG', 'IT', 'ES', 'NL', 'CH', 'MX', 'TH', 'MY'];
  const usEVisa = ['AU', 'IN', 'TR'];
  const usVisaOnArrival = ['ID', 'AE', 'EG'];

  // Visa-free countries for UK passport holders
  const ukVisaFree = ['US', 'CA', 'DE', 'FR', 'JP', 'KR', 'SG', 'IT', 'ES', 'NL', 'CH', 'MX', 'TH', 'MY', 'AE'];
  const ukEVisa = ['AU', 'IN', 'TR', 'VN'];

  // EU Schengen visa-free for each other
  const schengen = ['DE', 'FR', 'IT', 'ES', 'NL', 'CH'];

  // Check combinations
  if (from === 'US') {
    if (usVisaFree.includes(to)) {
      return {
        type: 'visa-free',
        duration: to === 'JP' ? '90 days' : to === 'UK' ? '6 months' : '90 days',
        notes: 'US passport holders can visit visa-free for tourism.',
      };
    }
    if (usVisaOnArrival.includes(to)) {
      return {
        type: 'visa-on-arrival',
        duration: '30 days',
        notes: 'Visa available on arrival at the airport.',
        cost: '$35-50',
      };
    }
    if (usEVisa.includes(to)) {
      return {
        type: 'evisa',
        duration: to === 'AU' ? '1 year (multiple entry)' : '30-90 days',
        notes: 'Apply online before travel.',
        cost: '$20-75',
        processingTime: '1-5 business days',
      };
    }
  }

  if (from === 'UK') {
    if (ukVisaFree.includes(to)) {
      return {
        type: 'visa-free',
        duration: '90 days',
        notes: 'UK passport holders can visit visa-free for tourism.',
      };
    }
    if (ukEVisa.includes(to)) {
      return {
        type: 'evisa',
        duration: '30-90 days',
        notes: 'Apply online before travel.',
        cost: '$25-100',
        processingTime: '1-5 business days',
      };
    }
  }

  if (schengen.includes(from) && schengen.includes(to)) {
    return {
      type: 'visa-free',
      duration: 'Unlimited (freedom of movement)',
      notes: 'Free movement within Schengen Area for EU citizens.',
    };
  }

  // Countries that typically require visa for most
  const strictVisa = ['CN', 'RU', 'NG', 'PK'];
  if (strictVisa.includes(to) || strictVisa.includes(from)) {
    return {
      type: 'visa-required',
      duration: 'Varies (30-90 days)',
      notes: 'Visa required before travel. Apply at embassy or consulate.',
      cost: '$100-200',
      processingTime: '5-15 business days',
    };
  }

  // Default for developing countries visiting developed
  const developed = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'SG', 'IT', 'ES', 'NL', 'CH'];
  const developing = ['IN', 'BD', 'PK', 'NG', 'PH', 'VN', 'ID'];

  if (developing.includes(from) && developed.includes(to)) {
    return {
      type: 'visa-required',
      duration: '30-90 days',
      notes: 'Visa required before travel. May require interview.',
      cost: '$100-200',
      processingTime: '10-30 business days',
    };
  }

  // Default visa on arrival for tourism between Asian countries
  const asean = ['TH', 'VN', 'ID', 'MY', 'PH', 'SG'];
  if (asean.includes(from) && asean.includes(to)) {
    return {
      type: 'visa-free',
      duration: '14-30 days',
      notes: 'ASEAN visa exemption for member countries.',
    };
  }

  // Default case
  return {
    type: 'evisa',
    duration: '30 days',
    notes: 'Check official government website for latest requirements.',
    cost: '$50-100',
    processingTime: '3-7 business days',
  };
};

interface VisaCheckerToolProps {
  uiConfig?: UIConfig;
}

export const VisaCheckerTool: React.FC<VisaCheckerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [passportCountry, setPassportCountry] = useState<string>('US');
  const [destinationCountry, setDestinationCountry] = useState<string>('JP');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showResult, setShowResult] = useState(true);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.passport || params.from || params.nationality) {
        const code = String(params.passport || params.from || params.nationality).toUpperCase();
        if (COUNTRIES.find(c => c.code === code)) {
          setPassportCountry(code);
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

  const visaRequirement = useMemo(() => {
    if (!showResult) return null;
    return getVisaRequirement(passportCountry, destinationCountry);
  }, [passportCountry, destinationCountry, showResult]);

  const getTypeColor = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free': return 'text-green-500';
      case 'visa-on-arrival': return 'text-blue-500';
      case 'evisa': return 'text-yellow-500';
      case 'visa-required': return 'text-red-500';
    }
  };

  const getTypeBgColor = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free': return isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200';
      case 'visa-on-arrival': return isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200';
      case 'evisa': return isDark ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
      case 'visa-required': return isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200';
    }
  };

  const getTypeIcon = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free': return <Check className="w-6 h-6 text-green-500" />;
      case 'visa-on-arrival': return <Clock className="w-6 h-6 text-blue-500" />;
      case 'evisa': return <Globe className="w-6 h-6 text-yellow-500" />;
      case 'visa-required': return <FileText className="w-6 h-6 text-red-500" />;
    }
  };

  const getTypeLabel = (type: VisaRequirement['type']) => {
    switch (type) {
      case 'visa-free': return 'Visa Free';
      case 'visa-on-arrival': return 'Visa on Arrival';
      case 'evisa': return 'e-Visa Required';
      case 'visa-required': return 'Visa Required';
    }
  };

  const passportCountryName = COUNTRIES.find(c => c.code === passportCountry)?.name || passportCountry;
  const destinationCountryName = COUNTRIES.find(c => c.code === destinationCountry)?.name || destinationCountry;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.visaChecker.visaRequirementsChecker', 'Visa Requirements Checker')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.visaChecker.checkVisaRequirementsBasedOn', 'Check visa requirements based on your passport')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.visaChecker.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Country Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FileText className="w-4 h-4 inline mr-1" />
                  {t('tools.visaChecker.yourPassportCountry', 'Your Passport Country')}
                </label>
                <select
                  value={passportCountry}
                  onChange={(e) => {
                    setPassportCountry(e.target.value);
                    setShowResult(true);
                  }}
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
                  {t('tools.visaChecker.destinationCountry', 'Destination Country')}
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => {
                    setDestinationCountry(e.target.value);
                    setShowResult(true);
                  }}
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

            {/* Results */}
            {visaRequirement && (
              <div className="space-y-4">
                {/* Main Result Card */}
                <div className={`p-6 rounded-xl border ${getTypeBgColor(visaRequirement.type)}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                      {getTypeIcon(visaRequirement.type)}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${getTypeColor(visaRequirement.type)}`}>
                        {getTypeLabel(visaRequirement.type)}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {passportCountryName} passport to {destinationCountryName}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                        <Clock className="w-4 h-4" /> Maximum Stay
                      </div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {visaRequirement.duration}
                      </div>
                    </div>

                    {visaRequirement.cost && (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                          <DollarSign className="w-4 h-4" /> Estimated Cost
                        </div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {visaRequirement.cost}
                        </div>
                      </div>
                    )}

                    {visaRequirement.processingTime && (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                          <Calendar className="w-4 h-4" /> Processing Time
                        </div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {visaRequirement.processingTime}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-white/30'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {visaRequirement.notes}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.visaChecker.generalRequirementsChecklist', 'General Requirements Checklist')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      'Valid passport (6+ months validity)',
                      'Proof of return/onward travel',
                      'Proof of accommodation',
                      'Sufficient funds for stay',
                      'Travel insurance (recommended)',
                      'Completed application form',
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning for visa required */}
                {visaRequirement.type === 'visa-required' && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'} flex items-start gap-3`}>
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                        {t('tools.visaChecker.visaApplicationRequired', 'Visa Application Required')}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        You must apply for a visa before traveling. Apply well in advance as processing times can vary.
                        Contact the embassy or consulate for the most accurate information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium mb-1">{t('tools.visaChecker.importantDisclaimer', 'Important Disclaimer')}</p>
                <p>
                  This information is for reference only and may not reflect the latest visa policies.
                  Requirements change frequently. Always verify with the official embassy or consulate
                  website before making travel plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaCheckerTool;
