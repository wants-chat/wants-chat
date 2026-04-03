import React, { useState, useEffect } from 'react';
import { Video, Copy, Check, RefreshCw, Sparkles, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type VideoStyle = 'educational' | 'storytelling' | 'comedy' | 'trending' | 'tutorial' | 'lifestyle' | 'motivation' | 'challenge';
type Duration = '15' | '30' | '60' | '180';

interface ScriptSection {
  timing: string;
  visual: string;
  voiceover: string;
  textOverlay?: string;
}

interface ScriptTemplate {
  hook: string;
  sections: string[];
  cta: string;
  style: VideoStyle;
}

const scriptTemplates: Record<VideoStyle, ScriptTemplate[]> = {
  educational: [
    {
      hook: "POV: You just learned something that will change how you {topic}",
      sections: [
        "Here's the thing most people don't know about {topic}:",
        "{point_1}",
        "But wait, it gets better...",
        "{point_2}",
        "And the best part?",
        "{point_3}",
      ],
      cta: "Follow for more {category} tips!",
      style: 'educational',
    },
    {
      hook: "This {topic} hack is insane",
      sections: [
        "Let me show you something...",
        "{point_1}",
        "Most people do it wrong by...",
        "Instead, try {point_2}",
        "The result? {point_3}",
      ],
      cta: "Save this for later! More tips on my page.",
      style: 'educational',
    },
  ],
  storytelling: [
    {
      hook: "I need to tell you about what happened when I {starting_point}",
      sections: [
        "It all started when...",
        "{context}",
        "Then everything changed...",
        "{turning_point}",
        "And you won't believe what happened next...",
        "{outcome}",
      ],
      cta: "Part 2? Let me know in the comments!",
      style: 'storytelling',
    },
    {
      hook: "Story time: The {topic} that changed my life",
      sections: [
        "Okay so picture this...",
        "{context}",
        "I was literally like...",
        "And then...",
        "{turning_point}",
        "Moral of the story: {lesson}",
      ],
      cta: "Drop a comment if you relate!",
      style: 'storytelling',
    },
  ],
  comedy: [
    {
      hook: "When someone says {topic} is easy",
      sections: [
        "*acts confident*",
        "{point_1}",
        "*reality hits*",
        "{point_2}",
        "*total chaos*",
        "{point_3}",
      ],
      cta: "Tag someone who does this!",
      style: 'comedy',
    },
    {
      hook: "Me pretending to understand {topic}",
      sections: [
        "\"Oh yeah, totally get it\"",
        "*internally panicking*",
        "{point_1}",
        "*Google in background*",
        "{point_2}",
        "*somehow survives*",
      ],
      cta: "Like if this is literally you",
      style: 'comedy',
    },
  ],
  trending: [
    {
      hook: "Using {trend} to show you {topic}",
      sections: [
        "*trending audio plays*",
        "{point_1}",
        "*transition*",
        "{point_2}",
        "*final reveal*",
        "{point_3}",
      ],
      cta: "Duet this with your version!",
      style: 'trending',
    },
  ],
  tutorial: [
    {
      hook: "How to {topic} in under {duration} seconds",
      sections: [
        "Step 1: {step_1}",
        "Step 2: {step_2}",
        "Step 3: {step_3}",
        "Pro tip: {bonus_tip}",
        "And you're done!",
      ],
      cta: "Follow for more quick tutorials!",
      style: 'tutorial',
    },
    {
      hook: "Easy {topic} tutorial - SAVE THIS",
      sections: [
        "First, you'll need...",
        "{requirements}",
        "Then do this...",
        "{step_1}",
        "Finally...",
        "{step_2}",
        "That's it!",
      ],
      cta: "Comment if you want more tutorials like this!",
      style: 'tutorial',
    },
  ],
  lifestyle: [
    {
      hook: "A day in my life as a {role}",
      sections: [
        "Morning routine: {point_1}",
        "*aesthetic transition*",
        "{point_2}",
        "The highlight of my day...",
        "{point_3}",
        "And that's a wrap!",
      ],
      cta: "What's your daily routine? Comment below!",
      style: 'lifestyle',
    },
  ],
  motivation: [
    {
      hook: "This is your sign to {topic}",
      sections: [
        "Stop scrolling for a second...",
        "{point_1}",
        "You've got this because...",
        "{point_2}",
        "Remember: {point_3}",
        "Now go make it happen.",
      ],
      cta: "Save this for when you need it!",
      style: 'motivation',
    },
    {
      hook: "If you're struggling with {topic}, listen up",
      sections: [
        "I've been there...",
        "{context}",
        "Here's what I learned...",
        "{lesson}",
        "You're not alone.",
        "{point_3}",
      ],
      cta: "Share this with someone who needs it!",
      style: 'motivation',
    },
  ],
  challenge: [
    {
      hook: "Let's try the {topic} challenge!",
      sections: [
        "Here are the rules...",
        "{rule_1}",
        "3... 2... 1... GO!",
        "*attempt*",
        "{reaction}",
        "Did I do it??",
      ],
      cta: "Your turn! Duet this!",
      style: 'challenge',
    },
  ],
};

const durationTimings: Record<Duration, string[]> = {
  '15': ['0-3s', '3-8s', '8-12s', '12-15s'],
  '30': ['0-5s', '5-12s', '12-20s', '20-27s', '27-30s'],
  '60': ['0-5s', '5-15s', '15-30s', '30-45s', '45-55s', '55-60s'],
  '180': ['0-15s', '15-45s', '45-90s', '90-135s', '135-165s', '165-180s'],
};

interface AITikTokScriptToolProps {
  uiConfig?: UIConfig;
}

export const AITikTokScriptTool: React.FC<AITikTokScriptToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[]>([]);

  const [formData, setFormData] = useState({
    topic: '',
    point1: '',
    point2: '',
    point3: '',
    category: '',
    context: '',
  });

  const [videoStyle, setVideoStyle] = useState<VideoStyle>('educational');
  const [duration, setDuration] = useState<Duration>('30');

  const generateScript = () => {
    const templates = scriptTemplates[videoStyle];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const timings = durationTimings[duration];

    const topic = formData.topic || 'this amazing thing';
    const point1 = formData.point1 || 'The first key insight';
    const point2 = formData.point2 || 'The game-changing moment';
    const point3 = formData.point3 || 'The mind-blowing conclusion';
    const category = formData.category || 'helpful content';
    const context = formData.context || 'an unexpected situation';

    const replacements: Record<string, string> = {
      '{topic}': topic,
      '{point_1}': point1,
      '{point_2}': point2,
      '{point_3}': point3,
      '{category}': category,
      '{context}': context,
      '{duration}': duration,
      '{starting_point}': 'tried ' + topic,
      '{turning_point}': 'Everything clicked!',
      '{outcome}': point3,
      '{lesson}': point3,
      '{step_1}': point1,
      '{step_2}': point2,
      '{step_3}': point3,
      '{bonus_tip}': 'This makes it even better',
      '{requirements}': 'Just a few simple things',
      '{role}': 'content creator',
      '{trend}': 'this trending sound',
      '{rule_1}': 'You have to...',
      '{reaction}': '*shocked face*',
    };

    // Build script sections
    const sections: ScriptSection[] = [];

    // Hook
    let hookText = template.hook;
    Object.entries(replacements).forEach(([key, value]) => {
      hookText = hookText.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    sections.push({
      timing: timings[0] || '0-3s',
      visual: 'Hook - Face close to camera, expressive',
      voiceover: hookText,
      textOverlay: hookText.length < 50 ? hookText : undefined,
    });

    // Middle sections
    const middleTimings = timings.slice(1, -1);
    const scriptSections = template.sections.slice(0, middleTimings.length);

    scriptSections.forEach((section, index) => {
      let sectionText = section;
      Object.entries(replacements).forEach(([key, value]) => {
        sectionText = sectionText.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      sections.push({
        timing: middleTimings[index] || `${(index + 1) * 5}-${(index + 2) * 5}s`,
        visual: index % 2 === 0 ? 'Cut to demonstration/visual' : 'Talking to camera',
        voiceover: sectionText,
        textOverlay: sectionText.startsWith('*') ? sectionText.replace(/\*/g, '') : undefined,
      });
    });

    // CTA
    let ctaText = template.cta;
    Object.entries(replacements).forEach(([key, value]) => {
      ctaText = ctaText.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    sections.push({
      timing: timings[timings.length - 1] || '25-30s',
      visual: 'Point at screen / Follow gesture',
      voiceover: ctaText,
      textOverlay: ctaText,
    });

    setGeneratedScript(sections);
  };

  const getFullScriptText = () => {
    let text = `TikTok Script - ${duration}s ${videoStyle}\n`;
    text += '='.repeat(40) + '\n\n';

    generatedScript.forEach((section, index) => {
      text += `[${section.timing}]\n`;
      text += `VISUAL: ${section.visual}\n`;
      text += `VOICEOVER: "${section.voiceover}"\n`;
      if (section.textOverlay) {
        text += `TEXT OVERLAY: ${section.textOverlay}\n`;
      }
      text += '\n';
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullScriptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.topic) setFormData(prev => ({ ...prev, topic: params.topic }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const videoStyles: { value: VideoStyle; label: string; emoji: string }[] = [
    { value: 'educational', label: 'Educational', emoji: 'brain' },
    { value: 'storytelling', label: 'Storytelling', emoji: 'book' },
    { value: 'comedy', label: 'Comedy', emoji: 'laugh' },
    { value: 'trending', label: 'Trending', emoji: 'fire' },
    { value: 'tutorial', label: 'Tutorial', emoji: 'tools' },
    { value: 'lifestyle', label: 'Lifestyle', emoji: 'sparkles' },
    { value: 'motivation', label: 'Motivation', emoji: 'muscle' },
    { value: 'challenge', label: 'Challenge', emoji: 'trophy' },
  ];

  const durations: { value: Duration; label: string }[] = [
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '60 seconds' },
    { value: '180', label: '3 minutes' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-lg">
            <Video className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aITikTokScript.aiTiktokScriptGenerator', 'AI TikTok Script Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITikTokScript.createViralTiktokScriptsWith', 'Create viral TikTok scripts with timing cues')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aITikTokScript.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Video Style */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITikTokScript.videoStyle', 'Video Style')}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {videoStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setVideoStyle(style.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  videoStyle === style.value
                    ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{style.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.aITikTokScript.videoDuration', 'Video Duration')}
          </label>
          <div className="flex flex-wrap gap-2">
            {durations.map((dur) => (
              <button
                key={dur.value}
                onClick={() => setDuration(dur.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  duration === dur.value
                    ? 'bg-pink-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITikTokScript.topicSubject', 'Topic/Subject *')}</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder={t('tools.aITikTokScript.eGProductivityHacksMorning', 'e.g., productivity hacks, morning routine, cooking tips')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none`}
          />
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITikTokScript.keyPointsMoments', 'Key Points/Moments')}</label>
          <input
            type="text"
            value={formData.point1}
            onChange={(e) => setFormData({ ...formData, point1: e.target.value })}
            placeholder={t('tools.aITikTokScript.firstKeyPointOrMoment', 'First key point or moment')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none`}
          />
          <input
            type="text"
            value={formData.point2}
            onChange={(e) => setFormData({ ...formData, point2: e.target.value })}
            placeholder={t('tools.aITikTokScript.secondKeyPointOrMoment', 'Second key point or moment')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none`}
          />
          <input
            type="text"
            value={formData.point3}
            onChange={(e) => setFormData({ ...formData, point3: e.target.value })}
            placeholder={t('tools.aITikTokScript.thirdKeyPointOrPayoff', 'Third key point or payoff')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none`}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateScript}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aITikTokScript.generateScript', 'Generate Script')}
        </button>

        {/* Generated Script */}
        {generatedScript.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                Generated Script ({duration}s)
              </span>
              <button
                onClick={handleCopy}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('tools.aITikTokScript.copied', 'Copied!') : t('tools.aITikTokScript.copyScript', 'Copy Script')}
              </button>
            </div>

            <div className="space-y-3">
              {generatedScript.map((section, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      index === 0
                        ? 'bg-pink-500/20 text-pink-500'
                        : index === generatedScript.length - 1
                        ? 'bg-cyan-500/20 text-cyan-500'
                        : isDark
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {section.timing}
                    </span>
                    {index === 0 && (
                      <span className={`text-xs font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                        <Zap className="w-3 h-3 inline" /> HOOK
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITikTokScript.visual', 'VISUAL:')}</span>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{section.visual}</p>
                    </div>
                    <div>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITikTokScript.voiceover', 'VOICEOVER:')}</span>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>"{section.voiceover}"</p>
                    </div>
                    {section.textOverlay && (
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITikTokScript.textOverlay', 'TEXT OVERLAY:')}</span>
                        <p className={`text-sm italic ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{section.textOverlay}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateScript}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aITikTokScript.regenerateScript', 'Regenerate Script')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedScript.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aITikTokScript.enterYourTopicToGenerate', 'Enter your topic to generate a TikTok script')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITikTokScriptTool;
