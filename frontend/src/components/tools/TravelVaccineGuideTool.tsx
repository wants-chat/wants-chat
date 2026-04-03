import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Syringe, Clock, FileText, Shield, AlertTriangle, Info, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Region = 'africa' | 'asia' | 'southamerica' | 'centralamerica' | 'middleeast' | 'oceania' | 'europe';

interface VaccineInfo {
  name: string;
  required: boolean;
  timing: string;
  description: string;
  validity?: string;
}

interface RegionConfig {
  name: string;
  vaccines: VaccineInfo[];
  healthTips: string[];
  documents: string[];
}

interface TravelVaccineGuideToolProps {
  uiConfig?: UIConfig;
}

export const TravelVaccineGuideTool: React.FC<TravelVaccineGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedRegion, setSelectedRegion] = useState<Region>('asia');
  const [travelDate, setTravelDate] = useState('');
  const [showAllVaccines, setShowAllVaccines] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.region) {
        setSelectedRegion(params.region as Region);
        hasChanges = true;
      }
      if (params.travelDate) {
        setTravelDate(params.travelDate);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const regions: Record<Region, RegionConfig> = {
    africa: {
      name: 'Africa',
      vaccines: [
        { name: 'Yellow Fever', required: true, timing: '10 days before travel', description: 'Required for entry to many African countries', validity: 'Lifetime' },
        { name: 'Hepatitis A', required: true, timing: '2-4 weeks before travel', description: 'Protects against contaminated food and water', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: true, timing: '6 months before travel', description: 'Protects against blood-borne infection', validity: 'Lifetime' },
        { name: 'Typhoid', required: true, timing: '2 weeks before travel', description: 'Protects against contaminated food and water', validity: '2-3 years' },
        { name: 'Meningitis', required: false, timing: '2 weeks before travel', description: 'Recommended for sub-Saharan Africa during dry season', validity: '5 years' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Recommended for rural areas with animal contact', validity: 'Varies' },
        { name: 'Malaria Prevention', required: true, timing: 'Before, during, and after travel', description: 'Antimalarial medication required for most regions', validity: 'N/A' },
        { name: 'Cholera', required: false, timing: '1-2 weeks before travel', description: 'Consider for areas with outbreaks', validity: '2 years' },
      ],
      healthTips: [
        'Use insect repellent with DEET and sleep under mosquito nets',
        'Drink only bottled or purified water',
        'Avoid ice and raw foods from street vendors',
        'Carry a basic medical kit with antimalarials',
        'Wear long sleeves and pants at dusk and dawn',
      ],
      documents: [
        'International Certificate of Vaccination (Yellow Card)',
        'Valid passport with 6+ months validity',
        'Travel health insurance documentation',
        'Prescription copies for any medications',
        'Doctor letter for medical conditions',
      ],
    },
    asia: {
      name: 'Asia',
      vaccines: [
        { name: 'Hepatitis A', required: true, timing: '2-4 weeks before travel', description: 'Essential for all travelers to Asia', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: true, timing: '6 months before travel', description: 'Recommended for extended stays', validity: 'Lifetime' },
        { name: 'Typhoid', required: true, timing: '2 weeks before travel', description: 'Protects against contaminated food and water', validity: '2-3 years' },
        { name: 'Japanese Encephalitis', required: false, timing: '1 month before travel', description: 'Recommended for rural areas and long stays', validity: 'Varies by age' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Consider for rural travel and animal contact', validity: 'Varies' },
        { name: 'Malaria Prevention', required: false, timing: 'Before, during, and after travel', description: 'Required for certain regions like Southeast Asia', validity: 'N/A' },
        { name: 'Cholera', required: false, timing: '1-2 weeks before travel', description: 'Consider for areas with active outbreaks', validity: '2 years' },
      ],
      healthTips: [
        'Be cautious with street food - eat hot, freshly cooked items',
        'Stay hydrated but use bottled water only',
        'Protect against mosquitoes in tropical areas',
        'Carry hand sanitizer and use frequently',
        'Be aware of air quality in major cities',
      ],
      documents: [
        'Valid passport with 6+ months validity',
        'Vaccination records',
        'Travel health insurance',
        'Visa documentation if required',
        'Copies of prescriptions',
      ],
    },
    southamerica: {
      name: 'South America',
      vaccines: [
        { name: 'Yellow Fever', required: true, timing: '10 days before travel', description: 'Required for Amazon region and many countries', validity: 'Lifetime' },
        { name: 'Hepatitis A', required: true, timing: '2-4 weeks before travel', description: 'Essential for all travelers', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: true, timing: '6 months before travel', description: 'Recommended for extended stays', validity: 'Lifetime' },
        { name: 'Typhoid', required: true, timing: '2 weeks before travel', description: 'Protects against food and water contamination', validity: '2-3 years' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Consider for adventure travel and rural areas', validity: 'Varies' },
        { name: 'Malaria Prevention', required: false, timing: 'Before, during, and after travel', description: 'Required for Amazon and certain lowland areas', validity: 'N/A' },
        { name: 'Dengue Awareness', required: false, timing: 'N/A', description: 'No vaccine widely available - use mosquito prevention', validity: 'N/A' },
      ],
      healthTips: [
        'Use insect repellent consistently in tropical areas',
        'Avoid tap water and ice in drinks',
        'Be cautious with altitude sickness in Andes regions',
        'Protect against sun exposure near the equator',
        'Carry diarrhea medication',
      ],
      documents: [
        'Yellow Fever Certificate for certain countries',
        'Valid passport with required validity',
        'Travel insurance with medical evacuation',
        'Copies of all vaccinations',
        'Emergency contact information',
      ],
    },
    centralamerica: {
      name: 'Central America & Caribbean',
      vaccines: [
        { name: 'Hepatitis A', required: true, timing: '2-4 weeks before travel', description: 'Essential for all travelers', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: false, timing: '6 months before travel', description: 'Recommended for extended stays', validity: 'Lifetime' },
        { name: 'Typhoid', required: true, timing: '2 weeks before travel', description: 'Recommended for most destinations', validity: '2-3 years' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Consider for rural and adventure travel', validity: 'Varies' },
        { name: 'Malaria Prevention', required: false, timing: 'Before, during, and after travel', description: 'Required for some rural lowland areas', validity: 'N/A' },
        { name: 'Dengue/Zika Awareness', required: false, timing: 'N/A', description: 'Use mosquito prevention measures', validity: 'N/A' },
      ],
      healthTips: [
        'Use EPA-registered insect repellent',
        'Stay in accommodations with screens or AC',
        'Drink bottled or purified water',
        'Apply sunscreen and stay hydrated',
        'Be aware of hurricane season (June-November)',
      ],
      documents: [
        'Valid passport',
        'Proof of travel insurance',
        'Vaccination record card',
        'Return flight documentation',
        'Hotel reservations',
      ],
    },
    middleeast: {
      name: 'Middle East',
      vaccines: [
        { name: 'Hepatitis A', required: true, timing: '2-4 weeks before travel', description: 'Recommended for most countries', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: false, timing: '6 months before travel', description: 'Consider for extended stays', validity: 'Lifetime' },
        { name: 'Typhoid', required: false, timing: '2 weeks before travel', description: 'Recommended for some destinations', validity: '2-3 years' },
        { name: 'Meningitis', required: true, timing: '2 weeks before travel', description: 'Required for Hajj/Umrah pilgrims to Saudi Arabia', validity: '5 years' },
        { name: 'Polio', required: false, timing: 'Check current requirements', description: 'May be required from certain countries', validity: 'Varies' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Consider for rural areas', validity: 'Varies' },
      ],
      healthTips: [
        'Stay hydrated in hot desert climates',
        'Respect local dress codes and customs',
        'Be aware of heat-related illness risks',
        'Carry prescription medications in original packaging',
        'Check air quality advisories',
      ],
      documents: [
        'Valid passport with significant validity',
        'Visa documentation',
        'Meningitis certificate for Saudi Arabia',
        'Travel insurance',
        'Medical documentation if needed',
      ],
    },
    oceania: {
      name: 'Oceania & Pacific Islands',
      vaccines: [
        { name: 'Hepatitis A', required: false, timing: '2-4 weeks before travel', description: 'Recommended for some Pacific islands', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: false, timing: '6 months before travel', description: 'Consider for extended stays', validity: 'Lifetime' },
        { name: 'Typhoid', required: false, timing: '2 weeks before travel', description: 'Recommended for some destinations', validity: '2-3 years' },
        { name: 'Japanese Encephalitis', required: false, timing: '1 month before travel', description: 'Consider for some Pacific destinations', validity: 'Varies' },
        { name: 'Dengue Awareness', required: false, timing: 'N/A', description: 'Use mosquito prevention in tropical areas', validity: 'N/A' },
      ],
      healthTips: [
        'Apply reef-safe sunscreen regularly',
        'Stay hydrated in tropical climates',
        'Be aware of marine hazards when swimming',
        'Use mosquito protection in tropical islands',
        'Check for any current health advisories',
      ],
      documents: [
        'Valid passport',
        'Electronic travel authorization (for Australia/NZ)',
        'Travel insurance with water activities coverage',
        'Vaccination records if required',
        'Return flight proof',
      ],
    },
    europe: {
      name: 'Europe',
      vaccines: [
        { name: 'Routine Vaccinations', required: true, timing: 'Keep up to date', description: 'MMR, Tetanus, Diphtheria, Pertussis', validity: 'Per standard schedule' },
        { name: 'Hepatitis A', required: false, timing: '2-4 weeks before travel', description: 'Consider for Eastern Europe', validity: 'Lifetime with booster' },
        { name: 'Hepatitis B', required: false, timing: '6 months before travel', description: 'Consider for extended stays', validity: 'Lifetime' },
        { name: 'Tick-Borne Encephalitis', required: false, timing: '1 month before travel', description: 'Consider for forested areas in Central/Eastern Europe', validity: '3-5 years' },
        { name: 'Rabies', required: false, timing: '1 month before travel', description: 'Consider for extensive outdoor activities', validity: 'Varies' },
      ],
      healthTips: [
        'Obtain European Health Insurance Card if applicable',
        'Be aware of tick risks in forested areas',
        'Check for any current health advisories',
        'Carry any prescription medications with documentation',
        'Know local emergency numbers',
      ],
      documents: [
        'Valid passport',
        'EHIC or travel insurance',
        'Schengen visa if required',
        'Prescription documentation',
        'European emergency number: 112',
      ],
    },
  };

  const config = regions[selectedRegion];

  const weeksUntilTravel = useMemo(() => {
    if (!travelDate) return null;
    const today = new Date();
    const travel = new Date(travelDate);
    const diffTime = travel.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  }, [travelDate]);

  const vaccineStatus = useMemo(() => {
    if (!weeksUntilTravel) return null;

    return config.vaccines.map(vaccine => {
      let status: 'ok' | 'warning' | 'urgent' = 'ok';
      let message = '';

      // Parse timing to get weeks needed
      const timingMatch = vaccine.timing.match(/(\d+)\s*(weeks?|months?|days?)/i);
      if (timingMatch) {
        const value = parseInt(timingMatch[1]);
        const unit = timingMatch[2].toLowerCase();
        let weeksNeeded = value;

        if (unit.startsWith('month')) {
          weeksNeeded = value * 4;
        } else if (unit.startsWith('day')) {
          weeksNeeded = Math.ceil(value / 7);
        }

        if (weeksUntilTravel < weeksNeeded) {
          if (weeksUntilTravel < weeksNeeded / 2) {
            status = 'urgent';
            message = 'May be too late - consult doctor immediately';
          } else {
            status = 'warning';
            message = 'Schedule appointment soon';
          }
        } else {
          message = 'Sufficient time available';
        }
      }

      return { ...vaccine, status, message };
    });
  }, [config.vaccines, weeksUntilTravel]);

  const displayVaccines = showAllVaccines
    ? (vaccineStatus || config.vaccines)
    : (vaccineStatus || config.vaccines).filter(v => v.required);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Plane className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.travelVaccineGuide.travelVaccineGuide', 'Travel Vaccine Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.travelVaccineGuide.vaccinationRequirementsAndHealthTips', 'Vaccination requirements and health tips by destination')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.travelVaccineGuide.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Region Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.travelVaccineGuide.selectDestinationRegion', 'Select Destination Region')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(regions) as Region[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`py-2 px-3 rounded-lg text-sm ${selectedRegion === r ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {regions[r].name}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Date */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.travelVaccineGuide.travelDateOptional', 'Travel Date (optional)')}
          </label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          {weeksUntilTravel !== null && (
            <p className={`text-sm ${weeksUntilTravel < 4 ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {weeksUntilTravel <= 0 ? 'Travel date is today or in the past' : `${weeksUntilTravel} week${weeksUntilTravel !== 1 ? 's' : ''} until travel`}
            </p>
          )}
        </div>

        {/* Vaccines Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-teal-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Vaccinations for {config.name}</h4>
            </div>
            <button
              onClick={() => setShowAllVaccines(!showAllVaccines)}
              className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
            >
              {showAllVaccines ? t('tools.travelVaccineGuide.showRequiredOnly', 'Show Required Only') : t('tools.travelVaccineGuide.showAll', 'Show All')}
            </button>
          </div>

          <div className="space-y-2">
            {displayVaccines.map((vaccine, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  vaccine.required
                    ? isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'
                    : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{vaccine.name}</span>
                      {vaccine.required && (
                        <span className="px-2 py-0.5 text-xs bg-teal-500 text-white rounded-full">{t('tools.travelVaccineGuide.required', 'Required')}</span>
                      )}
                      {'status' in vaccine && vaccine.status === 'urgent' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {'status' in vaccine && vaccine.status === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                      {'status' in vaccine && vaccine.status === 'ok' && weeksUntilTravel && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {vaccine.description}
                    </p>
                    <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span className="font-medium">{t('tools.travelVaccineGuide.timing', 'Timing:')}</span> {vaccine.timing}
                      {vaccine.validity && <span className="ml-3"><span className="font-medium">{t('tools.travelVaccineGuide.valid', 'Valid:')}</span> {vaccine.validity}</span>}
                    </div>
                    {'message' in vaccine && vaccine.message && weeksUntilTravel && (
                      <p className={`text-sm mt-1 ${
                        vaccine.status === 'urgent' ? 'text-red-500' :
                        vaccine.status === 'warning' ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {vaccine.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Health Tips for {config.name}</h4>
          </div>
          <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.healthTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-teal-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Document Requirements */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.travelVaccineGuide.documentRequirements', 'Document Requirements')}</h4>
          </div>
          <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.documents.map((doc, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.travelVaccineGuide.importantDisclaimer', 'Important Disclaimer:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• This is general guidance only - requirements change frequently</li>
                <li>• Always consult a travel medicine specialist or your doctor</li>
                <li>• Check official government travel advisories before departure</li>
                <li>• Individual health needs may require additional vaccinations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelVaccineGuideTool;
