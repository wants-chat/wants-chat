import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Thermometer, Droplets, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RiskLevel {
  level: string;
  minTemp: number;
  maxTemp: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  symptoms: string[];
  recommendations: string[];
  activityGuidelines: string[];
  hydrationTips: string[];
}

const RISK_LEVELS: RiskLevel[] = [
  {
    level: 'Caution',
    minTemp: 80,
    maxTemp: 90,
    color: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.5)',
    description: 'Fatigue possible with prolonged exposure and physical activity',
    symptoms: ['Fatigue', 'Muscle cramps', 'Mild discomfort'],
    recommendations: [
      'Take breaks in shaded or air-conditioned areas',
      'Wear lightweight, loose-fitting clothing',
      'Apply sunscreen frequently'
    ],
    activityGuidelines: [
      'Outdoor activities are generally safe',
      'Take regular breaks every 30-45 minutes',
      'Avoid intense exercise during peak heat hours (10am-4pm)'
    ],
    hydrationTips: [
      'Drink at least 8 oz of water every 20 minutes',
      'Avoid alcohol and caffeine',
      'Consider electrolyte drinks for extended activities'
    ]
  },
  {
    level: 'Extreme Caution',
    minTemp: 90,
    maxTemp: 103,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
    description: 'Heat cramps and heat exhaustion possible',
    symptoms: ['Heat cramps', 'Heat exhaustion', 'Heavy sweating', 'Weakness', 'Nausea'],
    recommendations: [
      'Limit outdoor activities',
      'Stay in air-conditioned environments when possible',
      'Check on elderly and at-risk individuals',
      'Never leave children or pets in vehicles'
    ],
    activityGuidelines: [
      'Reduce outdoor activity duration',
      'Take breaks every 15-20 minutes',
      'Exercise only in early morning or evening',
      'Have a buddy system for outdoor work'
    ],
    hydrationTips: [
      'Drink 8-12 oz of water every 15-20 minutes',
      'Pre-hydrate before going outdoors',
      'Use electrolyte replacement drinks',
      'Monitor urine color - aim for light yellow'
    ]
  },
  {
    level: 'Danger',
    minTemp: 103,
    maxTemp: 124,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Heat cramps and heat exhaustion likely; heat stroke possible',
    symptoms: ['Heat exhaustion', 'Heat stroke risk', 'Confusion', 'Rapid heartbeat', 'Headache'],
    recommendations: [
      'Avoid outdoor activities if possible',
      'Stay in air-conditioned buildings',
      'Check on neighbors and vulnerable individuals frequently',
      'Know the signs of heat stroke',
      'Have emergency contacts ready'
    ],
    activityGuidelines: [
      'Cancel or postpone non-essential outdoor activities',
      'If work is required, take 10-minute breaks every 20 minutes',
      'Use cooling towels and misting fans',
      'Have immediate access to shade and water'
    ],
    hydrationTips: [
      'Drink water continuously - at least 1 liter per hour',
      'Avoid sugary drinks',
      'Eat water-rich foods (watermelon, cucumbers)',
      'Use oral rehydration solutions if sweating heavily'
    ]
  },
  {
    level: 'Extreme Danger',
    minTemp: 124,
    maxTemp: 200,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    description: 'Heat stroke highly likely - LIFE THREATENING',
    symptoms: ['Heat stroke imminent', 'Loss of consciousness', 'Organ damage', 'Death possible'],
    recommendations: [
      'STAY INDOORS - This is a life-threatening situation',
      'Seek air-conditioned shelter immediately',
      'Call 911 if anyone shows signs of heat stroke',
      'Do not engage in any outdoor physical activity',
      'Check on vulnerable individuals every 30 minutes'
    ],
    activityGuidelines: [
      'NO outdoor activities whatsoever',
      'Cancel all outdoor events and work',
      'If you must go outside, limit to 5 minutes maximum',
      'Emergency workers should follow extreme heat protocols'
    ],
    hydrationTips: [
      'Maintain constant hydration even while indoors',
      'Have emergency water supply ready',
      'Use ice and cold compresses to stay cool',
      'Seek medical attention if feeling unwell'
    ]
  }
];

function calculateHeatIndex(tempF: number, humidity: number): number {
  // NWS Heat Index Formula
  // Simple formula for lower temperatures
  if (tempF < 80) {
    return tempF;
  }

  // Rothfusz regression equation
  const T = tempF;
  const R = humidity;

  let HI = -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  // Adjustments
  if (R < 13 && T >= 80 && T <= 112) {
    const adjustment = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adjustment;
  } else if (R > 85 && T >= 80 && T <= 87) {
    const adjustment = ((R - 85) / 10) * ((87 - T) / 5);
    HI += adjustment;
  }

  return Math.round(HI);
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

function getRiskLevel(heatIndexF: number): RiskLevel | null {
  for (const level of RISK_LEVELS) {
    if (heatIndexF >= level.minTemp && heatIndexF < level.maxTemp) {
      return level;
    }
  }
  if (heatIndexF < 80) {
    return null;
  }
  return RISK_LEVELS[RISK_LEVELS.length - 1];
}

interface HeatIndexToolProps {
  uiConfig?: UIConfig;
}

export function HeatIndexTool({
  uiConfig }: HeatIndexToolProps): React.ReactElement {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [temperature, setTemperature] = useState<string>('85');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setTemperature(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setTemperature(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [humidity, setHumidity] = useState<string>('65');
  const [unit, setUnit] = useState<'F' | 'C'>('F');

  const calculations = useMemo(() => {
    const tempValue = parseFloat(temperature);
    const humidityValue = parseFloat(humidity);

    if (isNaN(tempValue) || isNaN(humidityValue)) {
      return null;
    }

    if (humidityValue < 0 || humidityValue > 100) {
      return null;
    }

    const tempF = unit === 'F' ? tempValue : celsiusToFahrenheit(tempValue);
    const heatIndexF = calculateHeatIndex(tempF, humidityValue);
    const heatIndexC = fahrenheitToCelsius(heatIndexF);
    const riskLevel = getRiskLevel(heatIndexF);

    return {
      heatIndexF,
      heatIndexC,
      inputTempF: tempF,
      riskLevel,
      feelsLikeDiff: heatIndexF - tempF
    };
  }, [temperature, humidity, unit]);

  const getScalePosition = (heatIndexF: number): number => {
    const minScale = 70;
    const maxScale = 140;
    const position = ((heatIndexF - minScale) / (maxScale - minScale)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sun size={24} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: isDark ? '#f1f5f9' : '#1e293b',
                margin: 0
              }}
            >
              {t('tools.heatIndex.heatIndexCalculator', 'Heat Index Calculator')}
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: isDark ? '#94a3b8' : '#64748b',
                margin: 0
              }}
            >
              {t('tools.heatIndex.calculateTheFeelsLikeTemperature', 'Calculate the "feels like" temperature and safety recommendations')}
            </p>
          </div>
        </div>

        {isPrefilled && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '24px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(13, 148, 136, 0.2)'
            }}
          >
            <Sparkles size={16} color="#0D9488" />
            <span style={{ fontSize: '14px', color: '#0D9488', fontWeight: 500 }}>
              {t('tools.heatIndex.valueLoadedFromAiResponse', 'Value loaded from AI response')}
            </span>
          </div>
        )}

        {/* Input Section */}
        <div
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Temperature Input */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDark ? '#e2e8f0' : '#334155',
                  marginBottom: '8px'
                }}
              >
                <Thermometer size={18} color={isDark ? '#f97316' : '#ea580c'} />
                {t('tools.heatIndex.temperature', 'Temperature')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder={t('tools.heatIndex.enterTemperature', 'Enter temperature')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    outline: 'none'
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`
                  }}
                >
                  <button
                    onClick={() => setUnit('F')}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: unit === 'F'
                        ? (isDark ? '#f97316' : '#ea580c')
                        : (isDark ? '#0f172a' : '#f8fafc'),
                      color: unit === 'F'
                        ? '#ffffff'
                        : (isDark ? '#94a3b8' : '#64748b')
                    }}
                  >
                    °F
                  </button>
                  <button
                    onClick={() => setUnit('C')}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: unit === 'C'
                        ? (isDark ? '#f97316' : '#ea580c')
                        : (isDark ? '#0f172a' : '#f8fafc'),
                      color: unit === 'C'
                        ? '#ffffff'
                        : (isDark ? '#94a3b8' : '#64748b')
                    }}
                  >
                    °C
                  </button>
                </div>
              </div>
            </div>

            {/* Humidity Input */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDark ? '#e2e8f0' : '#334155',
                  marginBottom: '8px'
                }}
              >
                <Droplets size={18} color={isDark ? '#3b82f6' : '#2563eb'} />
                {t('tools.heatIndex.relativeHumidity', 'Relative Humidity (%)')}
              </label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder={t('tools.heatIndex.enterHumidity', 'Enter humidity')}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div
                style={{
                  marginTop: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: isDark ? '#334155' : '#e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, parseFloat(humidity) || 0))}%`,
                    backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {calculations && (
          <>
            {/* Heat Index Display */}
            <div
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: '8px'
                  }}
                >
                  {t('tools.heatIndex.feelsLikeTemperature', 'Feels Like Temperature')}
                </p>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 700,
                    color: calculations.riskLevel?.color || (isDark ? '#22c55e' : '#16a34a'),
                    lineHeight: 1
                  }}
                >
                  {unit === 'F' ? calculations.heatIndexF : Math.round(calculations.heatIndexC)}°{unit}
                </div>
                {calculations.feelsLikeDiff !== 0 && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: calculations.feelsLikeDiff > 0
                        ? (isDark ? '#f87171' : '#dc2626')
                        : (isDark ? '#4ade80' : '#16a34a'),
                      marginTop: '8px'
                    }}
                  >
                    {calculations.feelsLikeDiff > 0 ? '+' : ''}
                    {unit === 'F'
                      ? calculations.feelsLikeDiff
                      : Math.round(fahrenheitToCelsius(calculations.feelsLikeDiff))}° from actual temperature
                  </p>
                )}
              </div>

              {/* Visual Heat Index Scale */}
              <div style={{ marginTop: '24px' }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#334155',
                    marginBottom: '12px'
                  }}
                >
                  {t('tools.heatIndex.heatIndexScale', 'Heat Index Scale')}
                </p>
                <div
                  style={{
                    position: 'relative',
                    height: '32px',
                    borderRadius: '8px',
                    overflow: 'visible',
                    background: `linear-gradient(to right,
                      #22c55e 0%,
                      #22c55e 14.3%,
                      #EAB308 14.3%,
                      #EAB308 28.6%,
                      #F97316 28.6%,
                      #F97316 47.1%,
                      #EF4444 47.1%,
                      #EF4444 77.1%,
                      #A855F7 77.1%,
                      #A855F7 100%
                    )`
                  }}
                >
                  {/* Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${getScalePosition(calculations.heatIndexF)}%`,
                      top: '-8px',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '48px',
                      backgroundColor: isDark ? '#f1f5f9' : '#1e293b',
                      borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}
                >
                  <span>70°F</span>
                  <span>80°F</span>
                  <span>90°F</span>
                  <span>103°F</span>
                  <span>124°F</span>
                  <span>140°F+</span>
                </div>
              </div>
            </div>

            {/* Risk Level Card */}
            {calculations.riskLevel ? (
              <div
                style={{
                  backgroundColor: calculations.riskLevel.bgColor,
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: `2px solid ${calculations.riskLevel.borderColor}`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertTriangle size={28} color={calculations.riskLevel.color} />
                  <div>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: calculations.riskLevel.color,
                        margin: 0
                      }}
                    >
                      {calculations.riskLevel.level}
                    </h2>
                    <p
                      style={{
                        fontSize: '14px',
                        color: isDark ? '#e2e8f0' : '#334155',
                        margin: 0
                      }}
                    >
                      {calculations.riskLevel.description}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                <div style={{ marginBottom: '16px' }}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? '#e2e8f0' : '#334155',
                      marginBottom: '8px'
                    }}
                  >
                    {t('tools.heatIndex.possibleSymptoms', 'Possible Symptoms')}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {calculations.riskLevel.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 12px',
                          fontSize: '13px',
                          borderRadius: '20px',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          color: isDark ? '#e2e8f0' : '#334155'
                        }}
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: `2px solid ${isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.3)'}`
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Sun size={28} color="#22c55e" />
                  <div>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#22c55e',
                        margin: 0
                      }}
                    >
                      {t('tools.heatIndex.safeConditions', 'Safe Conditions')}
                    </h2>
                    <p
                      style={{
                        fontSize: '14px',
                        color: isDark ? '#e2e8f0' : '#334155',
                        margin: 0
                      }}
                    >
                      {t('tools.heatIndex.currentHeatIndexIsWithin', 'Current heat index is within safe limits. Normal outdoor activities are fine.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Recommendations */}
            {calculations.riskLevel && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* Safety Recommendations */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}
                >
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={18} color={calculations.riskLevel.color} />
                    {t('tools.heatIndex.safetyRecommendations', 'Safety Recommendations')}
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}
                  >
                    {calculations.riskLevel.recommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Activity Guidelines */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}
                >
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sun size={18} color={isDark ? '#fbbf24' : '#d97706'} />
                    {t('tools.heatIndex.activityGuidelines', 'Activity Guidelines')}
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}
                  >
                    {calculations.riskLevel.activityGuidelines.map((guideline, index) => (
                      <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hydration Tips */}
                <div
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}
                >
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Droplets size={18} color={isDark ? '#3b82f6' : '#2563eb'} />
                    {t('tools.heatIndex.hydrationReminders', 'Hydration Reminders')}
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: isDark ? '#cbd5e1' : '#475569'
                    }}
                  >
                    {calculations.riskLevel.hydrationTips.map((tip, index) => (
                      <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  margin: 0,
                  textAlign: 'center'
                }}
              >
                Heat index calculations use the National Weather Service (NWS) formula.
                The heat index is only applicable when the temperature is above 80°F (27°C)
                with humidity above 40%. Always consult local weather advisories for official guidance.
              </p>
            </div>
          </>
        )}

        {/* Invalid Input Message */}
        {!calculations && (
          <div
            style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
            }}
          >
            <Thermometer size={48} color={isDark ? '#475569' : '#94a3b8'} />
            <p
              style={{
                fontSize: '16px',
                color: isDark ? '#94a3b8' : '#64748b',
                marginTop: '16px'
              }}
            >
              {t('tools.heatIndex.enterValidTemperatureAndHumidity', 'Enter valid temperature and humidity values (0-100%) to calculate heat index.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeatIndexTool;
