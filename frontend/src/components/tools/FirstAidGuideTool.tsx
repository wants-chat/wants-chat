import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Phone, AlertTriangle, CheckCircle, Info, Shield, Activity, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type EmergencyType = 'choking' | 'bleeding' | 'burns' | 'fractures' | 'heartattack' | 'stroke' | 'seizure' | 'poisoning';

interface EmergencyConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  call911: boolean;
  steps: string[];
  warnings: string[];
}

interface FirstAidGuideToolProps {
  uiConfig?: UIConfig;
}

export const FirstAidGuideTool: React.FC<FirstAidGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType>('choking');
  const [activeTab, setActiveTab] = useState<'guide' | 'cpr' | 'kit' | 'when911'>('guide');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Emergency type can be prefilled from text content
      if (params.texts && params.texts.length > 0) {
        const emergencyText = params.texts[0].toLowerCase();
        const validTypes: EmergencyType[] = ['choking', 'bleeding', 'burns', 'fractures', 'heartattack', 'stroke', 'seizure', 'poisoning'];
        if (validTypes.includes(emergencyText as EmergencyType)) {
          setSelectedEmergency(emergencyText as EmergencyType);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const emergencies: Record<EmergencyType, EmergencyConfig> = {
    choking: {
      name: 'Choking',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-500',
      call911: true,
      steps: [
        'Ask "Are you choking?" - if they can\'t speak or cough, act immediately',
        'Stand behind the person and wrap your arms around their waist',
        'Make a fist with one hand and place it above the navel',
        'Grasp your fist with your other hand',
        'Give quick, upward thrusts (Heimlich maneuver)',
        'Repeat until object is expelled or person becomes unconscious',
        'If unconscious, begin CPR and call 911',
      ],
      warnings: [
        'For infants: Use back blows and chest thrusts instead',
        'For pregnant women: Use chest thrusts instead of abdominal thrusts',
        'Never perform blind finger sweeps',
      ],
    },
    bleeding: {
      name: 'Severe Bleeding',
      icon: <Activity className="w-4 h-4" />,
      color: 'text-red-600',
      call911: true,
      steps: [
        'Call 911 for severe bleeding',
        'Apply direct pressure with a clean cloth or bandage',
        'If blood soaks through, add more layers without removing the first',
        'Elevate the injured area above heart level if possible',
        'Apply pressure to the nearest pressure point if bleeding continues',
        'Keep the person warm and calm',
        'Do not remove any embedded objects',
      ],
      warnings: [
        'Do not apply a tourniquet unless trained and as last resort',
        'Avoid direct contact with blood - use gloves if available',
        'Watch for signs of shock: pale skin, rapid breathing, confusion',
      ],
    },
    burns: {
      name: 'Burns',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-orange-500',
      call911: false,
      steps: [
        'Remove the person from the heat source',
        'Cool the burn under cool (not cold) running water for 10-20 minutes',
        'Remove jewelry or tight items near the burn before swelling',
        'Cover with a sterile, non-stick bandage',
        'Do not break blisters',
        'Take over-the-counter pain relievers if needed',
        'Seek medical help for large or severe burns',
      ],
      warnings: [
        'Never use ice, butter, or toothpaste on burns',
        'Do not remove clothing stuck to the burn',
        'Call 911 for burns covering large areas, face, or joints',
      ],
    },
    fractures: {
      name: 'Fractures',
      icon: <Shield className="w-4 h-4" />,
      color: 'text-purple-500',
      call911: false,
      steps: [
        'Keep the injured area still - do not try to realign',
        'Apply ice wrapped in cloth to reduce swelling',
        'Immobilize the area above and below the suspected fracture',
        'Use a splint or padding to prevent movement',
        'Check circulation below the injury (pulse, color, sensation)',
        'Elevate if possible without causing more pain',
        'Seek medical attention immediately',
      ],
      warnings: [
        'Do not move if spinal injury is suspected',
        'Do not straighten a misaligned bone',
        'Call 911 for open fractures or suspected spinal injuries',
      ],
    },
    heartattack: {
      name: 'Heart Attack',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-red-500',
      call911: true,
      steps: [
        'Call 911 immediately',
        'Have the person sit or lie down in a comfortable position',
        'Loosen any tight clothing',
        'Give aspirin (325mg) if not allergic and conscious',
        'If prescribed, help them take nitroglycerin',
        'Begin CPR if the person becomes unresponsive',
        'Use AED if available and trained',
      ],
      warnings: [
        'Do not leave the person alone',
        'Do not give anything to eat or drink except aspirin',
        'Symptoms may differ in women: back pain, nausea, fatigue',
      ],
    },
    stroke: {
      name: 'Stroke',
      icon: <Activity className="w-4 h-4" />,
      color: 'text-blue-500',
      call911: true,
      steps: [
        'Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911',
        'Note the time symptoms started',
        'Keep the person calm and still',
        'Do not give food or water (swallowing may be impaired)',
        'Lay them on their side if vomiting or unconscious',
        'Loosen any restrictive clothing',
        'Stay with them until emergency services arrive',
      ],
      warnings: [
        'Time is critical - every minute counts',
        'Do not give aspirin (it could worsen bleeding strokes)',
        'Do not let them "sleep it off" - stroke is an emergency',
      ],
    },
    seizure: {
      name: 'Seizure',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-yellow-500',
      call911: false,
      steps: [
        'Clear the area of hard or sharp objects',
        'Place something soft under their head',
        'Do NOT restrain the person or put anything in their mouth',
        'Time the seizure',
        'Turn them on their side after convulsions stop',
        'Stay with them until fully conscious',
        'Speak calmly and reassure them',
      ],
      warnings: [
        'Call 911 if seizure lasts more than 5 minutes',
        'Call 911 if person is pregnant, diabetic, or injured',
        'Never try to hold the person down',
      ],
    },
    poisoning: {
      name: 'Poisoning',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-green-600',
      call911: true,
      steps: [
        'Call Poison Control: 1-800-222-1222 (US)',
        'Identify the substance if possible',
        'Do NOT induce vomiting unless instructed',
        'If on skin, remove contaminated clothing and rinse',
        'If inhaled, move to fresh air immediately',
        'Save the container or sample for emergency responders',
        'Monitor breathing and consciousness',
      ],
      warnings: [
        'Do not give anything by mouth unless directed',
        'Keep the person calm',
        'Call 911 if unconscious, having seizures, or difficulty breathing',
      ],
    },
  };

  const firstAidKit = [
    { item: 'Adhesive bandages (various sizes)', essential: true },
    { item: 'Sterile gauze pads and rolls', essential: true },
    { item: 'Medical tape', essential: true },
    { item: 'Elastic bandages (ACE wrap)', essential: true },
    { item: 'Scissors and tweezers', essential: true },
    { item: 'Disposable gloves', essential: true },
    { item: 'Antiseptic wipes/solution', essential: true },
    { item: 'Antibiotic ointment', essential: false },
    { item: 'Hydrocortisone cream', essential: false },
    { item: 'Pain relievers (aspirin, ibuprofen)', essential: true },
    { item: 'Instant cold packs', essential: false },
    { item: 'CPR face shield/mask', essential: true },
    { item: 'Emergency blanket', essential: false },
    { item: 'Flashlight with batteries', essential: false },
    { item: 'First aid manual', essential: true },
  ];

  const when911 = [
    'Difficulty breathing or shortness of breath',
    'Chest pain or pressure lasting more than a few minutes',
    'Severe bleeding that won\'t stop',
    'Signs of stroke (FAST: Face, Arms, Speech, Time)',
    'Loss of consciousness',
    'Severe allergic reaction (anaphylaxis)',
    'Poisoning or overdose',
    'Severe burns (large area, face, or deep)',
    'Suspected spinal injury',
    'Seizures lasting more than 5 minutes',
    'Choking that cannot be relieved',
    'Drowning',
    'Electrical injuries',
    'Severe head or neck injuries',
  ];

  const cprSteps = [
    { step: 1, title: 'Check Responsiveness', description: 'Tap shoulders and shout "Are you okay?"' },
    { step: 2, title: 'Call for Help', description: 'Call 911 or have someone call. Get an AED if available.' },
    { step: 3, title: 'Open Airway', description: 'Tilt head back and lift chin to open the airway.' },
    { step: 4, title: 'Check Breathing', description: 'Look, listen, and feel for breathing for no more than 10 seconds.' },
    { step: 5, title: 'Begin Compressions', description: 'Place heel of hand on center of chest. Push hard and fast (2 inches deep, 100-120/min).' },
    { step: 6, title: 'Give Breaths', description: 'After 30 compressions, give 2 rescue breaths (if trained). Each breath should last 1 second.' },
    { step: 7, title: 'Continue CPR', description: 'Repeat cycles of 30 compressions and 2 breaths until help arrives or person responds.' },
  ];

  const currentEmergency = emergencies[selectedEmergency];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg"><Heart className="w-5 h-5 text-red-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.firstAidGuide', 'First Aid Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.firstAidGuide.emergencyInstructionsAndSafetyTips', 'Emergency instructions and safety tips')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'guide' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.firstAidGuide.guide', 'Guide')}
          </button>
          <button
            onClick={() => setActiveTab('cpr')}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'cpr' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.firstAidGuide.cpr', 'CPR')}
          </button>
          <button
            onClick={() => setActiveTab('kit')}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'kit' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.firstAidGuide.kit', 'Kit')}
          </button>
          <button
            onClick={() => setActiveTab('when911')}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${activeTab === 'when911' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            911
          </button>
        </div>

        {/* Emergency Guide Tab */}
        {activeTab === 'guide' && (
          <>
            {/* Emergency Type Selection */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(emergencies) as EmergencyType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedEmergency(type)}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm ${selectedEmergency === type ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {emergencies[type].name}
                </button>
              ))}
            </div>

            {/* Emergency Info Card */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className={currentEmergency.color}>{currentEmergency.icon}</span>
                  {currentEmergency.name}
                </h4>
                {currentEmergency.call911 && (
                  <span className="flex items-center gap-1 text-red-500 font-bold text-sm">
                    <Phone className="w-4 h-4" /> Call 911
                  </span>
                )}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.stepByStepInstructions', 'Step-by-Step Instructions')}</h5>
              <div className="space-y-2">
                {currentEmergency.steps.map((step, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.importantWarnings', 'Important Warnings')}</h5>
                  <ul className="space-y-1">
                    {currentEmergency.warnings.map((warning, index) => (
                      <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CPR Tab */}
        {activeTab === 'cpr' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.cprQuickGuide', 'CPR Quick Guide')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.firstAidGuide.cardiopulmonaryResuscitationForUnresponsiveAdults', 'Cardiopulmonary Resuscitation for unresponsive adults. Call 911 first!')}
              </p>
            </div>

            <div className="space-y-3">
              {cprSteps.map((item) => (
                <div key={item.step} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h5>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>30:2</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.firstAidGuide.30Compressions2Breaths', '30 Compressions : 2 Breaths')}
              </div>
              <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('tools.firstAidGuide.push2InchesDeepAt', 'Push 2 inches deep at 100-120 compressions per minute')}
              </div>
            </div>
          </>
        )}

        {/* First Aid Kit Tab */}
        {activeTab === 'kit' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.firstAidKitChecklist', 'First Aid Kit Checklist')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.firstAidGuide.essentialItemsForYourHome', 'Essential items for your home, car, or travel first aid kit')}
              </p>
            </div>

            <div className="space-y-2">
              {firstAidKit.map((item, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 ${item.essential ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.item}</span>
                  {item.essential && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                      {t('tools.firstAidGuide.essential', 'Essential')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* When to Call 911 Tab */}
        {activeTab === 'when911' && (
          <>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-red-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.firstAidGuide.whenToCall911', 'When to Call 911')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.firstAidGuide.callEmergencyServicesImmediatelyFor', 'Call emergency services immediately for any of these conditions')}
              </p>
            </div>

            <div className="space-y-2">
              {when911.map((condition, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{condition}</span>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <Phone className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>911</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.firstAidGuide.emergencyServicesUs', 'Emergency Services (US)')}
              </div>
              <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('tools.firstAidGuide.poisonControl1800222', 'Poison Control: 1-800-222-1222')}
              </div>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.firstAidGuide.disclaimer', 'Disclaimer:')}</strong>
              <p className="mt-1">
                This guide is for informational purposes only and is not a substitute for professional medical training or advice.
                Always call emergency services for serious injuries or medical emergencies. Consider taking a certified first aid
                and CPR course for hands-on training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstAidGuideTool;
