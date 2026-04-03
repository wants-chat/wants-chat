import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface AltitudeSicknessToolProps {
  uiConfig?: UIConfig;
}

type FitnessLevel = 'sedentary' | 'moderate' | 'active' | 'athlete';
type AcclimatizationDays = 0 | 1 | 2 | 3 | 4 | 5;

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export const AltitudeSicknessTool: React.FC<AltitudeSicknessToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeAltitude, setHomeAltitude] = useState('0');
  const [targetAltitude, setTargetAltitude] = useState('3000');
  const [ascentDays, setAscentDays] = useState('1');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('moderate');
  const [acclimatization, setAcclimatization] = useState<AcclimatizationDays>(0);
  const [previousAMS, setPreviousAMS] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      if (params.targetAltitude !== undefined) {
        setTargetAltitude(String(params.targetAltitude));
      }
      if (params.homeAltitude !== undefined) {
        setHomeAltitude(String(params.homeAltitude));
      }
    }
  }, [uiConfig?.params]);

  const fitnessLevels = {
    sedentary: { name: 'Sedentary', risk: 1.3, description: 'Little to no regular exercise' },
    moderate: { name: 'Moderate', risk: 1.0, description: 'Exercise 1-3 times per week' },
    active: { name: 'Active', risk: 0.9, description: 'Exercise 4-5 times per week' },
    athlete: { name: 'Athlete', risk: 0.85, description: 'High-intensity training regularly' },
  };

  const symptoms: Symptom[] = [
    { id: 'headache', name: 'Headache', severity: 'mild', description: 'Persistent or throbbing headache' },
    { id: 'nausea', name: 'Nausea/Vomiting', severity: 'moderate', description: 'Upset stomach or vomiting' },
    { id: 'fatigue', name: 'Fatigue', severity: 'mild', description: 'Unusual tiredness or weakness' },
    { id: 'dizziness', name: 'Dizziness', severity: 'mild', description: 'Lightheadedness or vertigo' },
    { id: 'insomnia', name: 'Difficulty Sleeping', severity: 'mild', description: 'Trouble falling or staying asleep' },
    { id: 'appetite', name: 'Loss of Appetite', severity: 'mild', description: 'Reduced desire to eat' },
    { id: 'shortness', name: 'Shortness of Breath', severity: 'moderate', description: 'Difficulty breathing at rest' },
    { id: 'confusion', name: 'Confusion', severity: 'severe', description: 'Disorientation or mental fog' },
    { id: 'ataxia', name: 'Loss of Coordination', severity: 'severe', description: 'Difficulty walking straight' },
    { id: 'cough', name: 'Persistent Cough', severity: 'moderate', description: 'Dry or wet cough' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const riskAssessment = useMemo(() => {
    const home = parseFloat(homeAltitude) || 0;
    const target = parseFloat(targetAltitude) || 0;
    const days = parseFloat(ascentDays) || 1;
    const altitudeGain = target - home;
    const dailyGain = altitudeGain / days;

    // Base risk calculation
    let riskScore = 0;

    // Altitude risk zones
    if (target < 2500) {
      riskScore += 5;
    } else if (target < 3000) {
      riskScore += 15;
    } else if (target < 3500) {
      riskScore += 30;
    } else if (target < 4000) {
      riskScore += 50;
    } else if (target < 4500) {
      riskScore += 70;
    } else if (target < 5000) {
      riskScore += 85;
    } else {
      riskScore += 95;
    }

    // Ascent rate penalty (recommended: 300-500m/day above 3000m)
    if (target > 2500) {
      if (dailyGain > 1000) {
        riskScore += 30;
      } else if (dailyGain > 600) {
        riskScore += 20;
      } else if (dailyGain > 400) {
        riskScore += 10;
      }
    }

    // Fitness level adjustment
    riskScore *= fitnessLevels[fitnessLevel].risk;

    // Acclimatization benefit
    riskScore *= (1 - acclimatization * 0.1);

    // Previous AMS history
    if (previousAMS) {
      riskScore *= 1.5;
    }

    // Current symptoms
    const symptomScore = Array.from(selectedSymptoms).reduce((sum, id) => {
      const symptom = symptoms.find((s) => s.id === id);
      if (!symptom) return sum;
      switch (symptom.severity) {
        case 'mild': return sum + 5;
        case 'moderate': return sum + 15;
        case 'severe': return sum + 30;
        default: return sum;
      }
    }, 0);

    riskScore += symptomScore;

    // Cap at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';
    let recommendation: string;

    if (riskScore < 20) {
      riskLevel = 'low';
      recommendation = 'Low risk of altitude sickness. Stay hydrated and monitor for symptoms.';
    } else if (riskScore < 40) {
      riskLevel = 'moderate';
      recommendation = 'Moderate risk. Consider slower ascent, stay hydrated, avoid alcohol.';
    } else if (riskScore < 60) {
      riskLevel = 'high';
      recommendation = 'High risk. Consider acclimatization stops, prophylactic medication (consult doctor).';
    } else if (riskScore < 80) {
      riskLevel = 'very-high';
      recommendation = 'Very high risk. Strong recommendation for gradual ascent, medication, and careful monitoring.';
    } else {
      riskLevel = 'extreme';
      recommendation = 'Extreme risk. Consider postponing or significantly extending acclimatization period. Consult a doctor.';
    }

    return {
      score: Math.round(riskScore),
      level: riskLevel,
      recommendation,
      altitudeGain,
      dailyGain,
      altitudeZone: target >= 5500 ? 'extreme' : target >= 4000 ? 'very-high' : target >= 3000 ? 'high' : target >= 2500 ? 'moderate' : 'low',
    };
  }, [homeAltitude, targetAltitude, ascentDays, fitnessLevel, acclimatization, previousAMS, selectedSymptoms]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'very-high': return 'text-red-500';
      case 'extreme': return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
      case 'moderate': return isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
      case 'high': return isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200';
      case 'very-high': return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
      case 'extreme': return isDark ? 'bg-red-950/30 border-red-900' : 'bg-red-100 border-red-300';
      default: return isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Mountain className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.altitudeSickness.altitudeSicknessRiskAssessment', 'Altitude Sickness Risk Assessment')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.altitudeSickness.evaluateYourAmsRiskAnd', 'Evaluate your AMS risk and get recommendations')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Altitude Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Activity className="w-4 h-4 inline mr-1" /> Home Altitude (m)
            </label>
            <input
              type="number"
              value={homeAltitude}
              onChange={(e) => setHomeAltitude(e.target.value)}
              placeholder={t('tools.altitudeSickness.eG0SeaLevel', 'e.g., 0 (sea level)')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" /> Target Altitude (m)
            </label>
            <input
              type="number"
              value={targetAltitude}
              onChange={(e) => setTargetAltitude(e.target.value)}
              placeholder="e.g., 3500"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Quick Altitude Presets */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.altitudeSickness.commonDestinations', 'Common Destinations')}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Machu Picchu', alt: 2430 },
              { name: 'Cusco', alt: 3400 },
              { name: 'La Paz', alt: 3640 },
              { name: 'Everest Base', alt: 5364 },
              { name: 'Kilimanjaro', alt: 5895 },
            ].map((dest) => (
              <button
                key={dest.name}
                onClick={() => setTargetAltitude(dest.alt.toString())}
                className={`px-3 py-1.5 rounded-lg text-sm ${parseInt(targetAltitude) === dest.alt ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {dest.name} ({dest.alt}m)
              </button>
            ))}
          </div>
        </div>

        {/* Ascent Days */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" /> Days to Reach Target
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7, 10].map((d) => (
              <button
                key={d}
                onClick={() => setAscentDays(d.toString())}
                className={`flex-1 py-2 rounded-lg text-sm ${parseInt(ascentDays) === d ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {d} {d === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>
        </div>

        {/* Fitness Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.altitudeSickness.fitnessLevel', 'Fitness Level')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(fitnessLevels) as FitnessLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setFitnessLevel(level)}
                className={`py-3 px-3 rounded-lg text-sm ${
                  fitnessLevel === level
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {fitnessLevels[level].name}
              </button>
            ))}
          </div>
        </div>

        {/* Acclimatization */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.altitudeSickness.priorAcclimatizationDaysAt2500m', 'Prior Acclimatization (days at 2500m+)')}
          </label>
          <div className="flex gap-2">
            {([0, 1, 2, 3, 4, 5] as AcclimatizationDays[]).map((d) => (
              <button
                key={d}
                onClick={() => setAcclimatization(d)}
                className={`flex-1 py-2 rounded-lg text-sm ${acclimatization === d ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Previous AMS */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={previousAMS}
              onChange={(e) => setPreviousAMS(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.altitudeSickness.previousAltitudeSicknessHistory', 'Previous altitude sickness history')}
              </span>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.altitudeSickness.haveYouExperiencedAmsHace', 'Have you experienced AMS, HACE, or HAPE before?')}
              </p>
            </div>
          </label>
        </div>

        {/* Current Symptoms */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.altitudeSickness.currentSymptomsIfAny', 'Current Symptoms (if any)')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`py-2 px-3 rounded-lg text-sm text-left ${
                  selectedSymptoms.has(symptom.id)
                    ? symptom.severity === 'severe'
                      ? 'bg-red-500 text-white'
                      : symptom.severity === 'moderate'
                      ? 'bg-orange-500 text-white'
                      : 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {symptom.name}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Assessment Result */}
        <div className={`p-6 rounded-xl text-center border ${getRiskBgColor(riskAssessment.level)}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Altitude gain: {riskAssessment.altitudeGain.toLocaleString()}m ({Math.round(riskAssessment.dailyGain)}m/day)
          </div>
          <div className={`text-5xl font-bold my-2 ${getRiskColor(riskAssessment.level)}`}>
            {riskAssessment.score}%
          </div>
          <div className={`text-lg font-medium capitalize ${getRiskColor(riskAssessment.level)}`}>
            {riskAssessment.level.replace('-', ' ')} Risk
          </div>
          <div className={`text-sm mt-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {riskAssessment.recommendation}
          </div>
        </div>

        {/* Prevention Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-4 h-4 text-teal-500" />
            {t('tools.altitudeSickness.preventionTips', 'Prevention Tips')}
          </h4>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>- Ascend gradually (max 300-500m/day above 3000m)</li>
            <li>- Stay well hydrated (3-4 liters/day)</li>
            <li>- Avoid alcohol and sedatives</li>
            <li>- Sleep at lower altitude than highest point reached</li>
            <li>- Consider Acetazolamide (Diamox) - consult doctor first</li>
            <li>- Know the symptoms and descend if they worsen</li>
          </ul>
        </div>

        {/* Warning */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>{t('tools.altitudeSickness.medicalDisclaimer', 'Medical Disclaimer:')}</strong> This tool provides general guidance only and is not a substitute for professional medical advice. Consult a healthcare provider before high-altitude travel, especially if you have cardiovascular or respiratory conditions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AltitudeSicknessTool;
