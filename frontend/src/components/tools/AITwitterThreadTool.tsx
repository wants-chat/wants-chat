import React, { useState, useEffect } from 'react';
import { Twitter, Copy, Check, RefreshCw, Sparkles, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

type ThreadType = 'educational' | 'story' | 'tips' | 'opinion' | 'breakdown' | 'howto' | 'listicle';
type Tone = 'professional' | 'casual' | 'witty' | 'inspirational' | 'conversational';

interface ThreadTemplate {
  hook: string;
  tweets: string[];
  closer: string;
  type: ThreadType;
}

const threadTemplates: Record<ThreadType, ThreadTemplate[]> = {
  educational: [
    {
      hook: "Most people don't understand {topic}.\n\nLet me break it down for you:",
      tweets: [
        "First, let's understand the basics.\n\n{point_1}",
        "Here's where it gets interesting:\n\n{point_2}",
        "But wait, there's more.\n\n{point_3}",
        "This is the key insight:\n\n{main_point}",
        "Common mistakes to avoid:\n\n- {mistake_1}\n- {mistake_2}\n- {mistake_3}",
      ],
      closer: "Now you understand {topic} better than 99% of people.\n\nRetweet to help others learn.\n\nFollow me for more insights on {category}.",
      type: 'educational',
    },
  ],
  story: [
    {
      hook: "{time_ago}, {starting_situation}.\n\nHere's what happened next:",
      tweets: [
        "Everything seemed normal at first.\n\n{context}",
        "Then something unexpected happened:\n\n{turning_point}",
        "I had to make a decision.\n\n{decision}",
        "The result?\n\n{result}",
        "Looking back, I learned:\n\n{lesson}",
      ],
      closer: "This experience taught me that {main_point}.\n\nHope this helps someone going through something similar.\n\nFollow for more real stories.",
      type: 'story',
    },
  ],
  tips: [
    {
      hook: "{count} {topic} tips that will change how you work:\n\n(Save this thread)",
      tweets: [
        "1/ {tip_1}\n\nWhy it works: {why_1}",
        "2/ {tip_2}\n\nWhy it works: {why_2}",
        "3/ {tip_3}\n\nWhy it works: {why_3}",
        "4/ {tip_4}\n\nWhy it works: {why_4}",
        "5/ {tip_5}\n\nWhy it works: {why_5}",
      ],
      closer: "Quick recap:\n\n1. {tip_1_short}\n2. {tip_2_short}\n3. {tip_3_short}\n4. {tip_4_short}\n5. {tip_5_short}\n\nWhich one will you try first?\n\nRT the first tweet to save this.",
      type: 'tips',
    },
  ],
  opinion: [
    {
      hook: "Unpopular opinion:\n\n{opinion}\n\nLet me explain why:",
      tweets: [
        "Most people think {common_belief}.\n\nBut here's the problem with that...",
        "The truth is:\n\n{reality}",
        "Here's what I've observed:\n\n{observation}",
        "The data supports this:\n\n{evidence}",
        "What this means for you:\n\n{implication}",
      ],
      closer: "I know this might be controversial.\n\nBut {main_point}.\n\nAgree or disagree? Let me know below.",
      type: 'opinion',
    },
  ],
  breakdown: [
    {
      hook: "I spent {time_invested} analyzing {subject}.\n\nHere's everything I learned:",
      tweets: [
        "First, some background:\n\n{background}",
        "The key insight:\n\n{key_insight}",
        "What most people miss:\n\n{missed_point}",
        "The numbers tell the story:\n\n{data}",
        "My biggest takeaway:\n\n{takeaway}",
      ],
      closer: "TL;DR:\n\n{summary}\n\nIf you found this useful, RT the first tweet.\n\nFollow for more breakdowns like this.",
      type: 'breakdown',
    },
  ],
  howto: [
    {
      hook: "How to {goal} (step-by-step guide):\n\n(Bookmark this for later)",
      tweets: [
        "Step 1: {step_1}\n\n{step_1_detail}",
        "Step 2: {step_2}\n\n{step_2_detail}",
        "Step 3: {step_3}\n\n{step_3_detail}",
        "Step 4: {step_4}\n\n{step_4_detail}",
        "Bonus tips:\n\n- {bonus_1}\n- {bonus_2}\n- {bonus_3}",
      ],
      closer: "That's the complete guide to {goal}.\n\nDid I miss anything?\n\nRT to help others.\n\nFollow for more practical guides.",
      type: 'howto',
    },
  ],
  listicle: [
    {
      hook: "{count} {subject} you need to know about:\n\n(Thread)",
      tweets: [
        "1. {item_1}\n\n{description_1}",
        "2. {item_2}\n\n{description_2}",
        "3. {item_3}\n\n{description_3}",
        "4. {item_4}\n\n{description_4}",
        "5. {item_5}\n\n{description_5}",
      ],
      closer: "That's the list!\n\nWhich one is your favorite?\n\nFollow for more curated lists on {category}.",
      type: 'listicle',
    },
  ],
};

interface AITwitterThreadToolProps {
  uiConfig?: UIConfig;
}

export const AITwitterThreadTool: React.FC<AITwitterThreadToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [generatedThread, setGeneratedThread] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    topic: '',
    mainPoint: '',
    point1: '',
    point2: '',
    point3: '',
    category: '',
  });

  const [threadType, setThreadType] = useState<ThreadType>('educational');
  const [tweetCount, setTweetCount] = useState(7);

  const generateThread = () => {
    const templates = threadTemplates[threadType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    const topic = formData.topic || 'this topic';
    const mainPoint = formData.mainPoint || 'this key insight';
    const point1 = formData.point1 || 'First key point here';
    const point2 = formData.point2 || 'Second key point here';
    const point3 = formData.point3 || 'Third key point here';
    const category = formData.category || 'this field';

    const replacements: Record<string, string> = {
      '{topic}': topic,
      '{main_point}': mainPoint,
      '{point_1}': point1,
      '{point_2}': point2,
      '{point_3}': point3,
      '{category}': category,
      '{count}': String(tweetCount - 2),
      '{time_ago}': 'Last year',
      '{starting_situation}': 'I was struggling with ' + topic,
      '{context}': 'The situation seemed straightforward',
      '{turning_point}': 'Everything changed when I realized ' + mainPoint,
      '{decision}': 'I decided to take action',
      '{result}': 'The outcome exceeded my expectations',
      '{lesson}': mainPoint,
      '{tip_1}': point1,
      '{tip_2}': point2,
      '{tip_3}': point3,
      '{tip_4}': 'Stay consistent with your efforts',
      '{tip_5}': 'Track your progress regularly',
      '{why_1}': 'It creates momentum',
      '{why_2}': 'It builds on fundamentals',
      '{why_3}': 'It compounds over time',
      '{why_4}': 'It eliminates guesswork',
      '{why_5}': 'It keeps you accountable',
      '{tip_1_short}': point1.split(' ').slice(0, 4).join(' '),
      '{tip_2_short}': point2.split(' ').slice(0, 4).join(' '),
      '{tip_3_short}': point3.split(' ').slice(0, 4).join(' '),
      '{tip_4_short}': 'Stay consistent',
      '{tip_5_short}': 'Track progress',
      '{opinion}': mainPoint,
      '{common_belief}': 'the conventional wisdom is correct',
      '{reality}': 'There\'s a better approach',
      '{observation}': 'From my experience: ' + point1,
      '{evidence}': 'The results speak for themselves',
      '{implication}': 'You should reconsider your approach',
      '{time_invested}': '100+ hours',
      '{subject}': topic,
      '{background}': 'Here\'s the context you need',
      '{key_insight}': mainPoint,
      '{missed_point}': 'Most overlook this crucial detail',
      '{data}': 'The numbers confirm this theory',
      '{takeaway}': point1,
      '{summary}': mainPoint,
      '{goal}': topic,
      '{step_1}': point1,
      '{step_2}': point2,
      '{step_3}': point3,
      '{step_4}': 'Review and refine',
      '{step_1_detail}': 'This sets the foundation',
      '{step_2_detail}': 'This builds momentum',
      '{step_3_detail}': 'This creates results',
      '{step_4_detail}': 'This ensures long-term success',
      '{bonus_1}': 'Start small and iterate',
      '{bonus_2}': 'Seek feedback early',
      '{bonus_3}': 'Document your process',
      '{item_1}': point1,
      '{item_2}': point2,
      '{item_3}': point3,
      '{item_4}': 'Another key item',
      '{item_5}': 'Final important item',
      '{description_1}': 'Why this matters for you',
      '{description_2}': 'How this can help you',
      '{description_3}': 'The impact this can have',
      '{description_4}': 'What makes this special',
      '{description_5}': 'The bottom line',
      '{mistake_1}': 'Rushing the process',
      '{mistake_2}': 'Ignoring the basics',
      '{mistake_3}': 'Not staying consistent',
    };

    // Build the thread
    const thread: string[] = [];

    // Hook
    let hook = template.hook;
    Object.entries(replacements).forEach(([key, value]) => {
      hook = hook.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    thread.push(hook);

    // Middle tweets
    const middleTweets = template.tweets.slice(0, tweetCount - 2);
    middleTweets.forEach(tweet => {
      let processed = tweet;
      Object.entries(replacements).forEach(([key, value]) => {
        processed = processed.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
      thread.push(processed);
    });

    // Closer
    let closer = template.closer;
    Object.entries(replacements).forEach(([key, value]) => {
      closer = closer.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    thread.push(closer);

    setGeneratedThread(thread);
  };

  const handleCopyTweet = (index: number) => {
    navigator.clipboard.writeText(generatedThread[index]);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const fullThread = generatedThread.map((t, i) => `${i + 1}/${generatedThread.length}\n\n${t}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullThread);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const removeTweet = (index: number) => {
    setGeneratedThread(prev => prev.filter((_, i) => i !== index));
  };

  const moveTweet = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newThread = [...generatedThread];
      [newThread[index], newThread[index - 1]] = [newThread[index - 1], newThread[index]];
      setGeneratedThread(newThread);
    } else if (direction === 'down' && index < generatedThread.length - 1) {
      const newThread = [...generatedThread];
      [newThread[index], newThread[index + 1]] = [newThread[index + 1], newThread[index]];
      setGeneratedThread(newThread);
    }
  };

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as any;
      if (params.topic) setFormData(prev => ({ ...prev, topic: params.topic }));
      if (params.mainPoint) setFormData(prev => ({ ...prev, mainPoint: params.mainPoint }));
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const threadTypes: { value: ThreadType; label: string; desc: string }[] = [
    { value: 'educational', label: 'Educational', desc: 'Teach something' },
    { value: 'story', label: 'Story', desc: 'Share an experience' },
    { value: 'tips', label: 'Tips', desc: 'Actionable advice' },
    { value: 'opinion', label: 'Opinion', desc: 'Hot takes' },
    { value: 'breakdown', label: 'Breakdown', desc: 'Deep analysis' },
    { value: 'howto', label: 'How-To', desc: 'Step-by-step' },
    { value: 'listicle', label: 'Listicle', desc: 'Curated list' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/10 dark:bg-white/10 rounded-lg">
            <Twitter className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.aITwitterThread.aiTwitterXThreadGenerator', 'AI Twitter/X Thread Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.aITwitterThread.createViralTwitterThreadsThat', 'Create viral Twitter threads that engage your audience')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.aITwitterThread.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Thread Type */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITwitterThread.threadType', 'Thread Type')}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {threadTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setThreadType(type.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  threadType === type.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className={`text-xs ${threadType === type.value ? 'text-teal-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic & Main Point */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITwitterThread.topic', 'Topic *')}</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder={t('tools.aITwitterThread.eGProductivityStartupsWriting', 'e.g., productivity, startups, writing')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITwitterThread.mainMessage', 'Main Message')}</label>
            <input
              type="text"
              value={formData.mainPoint}
              onChange={(e) => setFormData({ ...formData, mainPoint: e.target.value })}
              placeholder={t('tools.aITwitterThread.eGConsistencyBeatsTalent', 'e.g., Consistency beats talent')}
              className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.aITwitterThread.keyPoints', 'Key Points')}</label>
          <input
            type="text"
            value={formData.point1}
            onChange={(e) => setFormData({ ...formData, point1: e.target.value })}
            placeholder={t('tools.aITwitterThread.firstKeyPoint', 'First key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.point2}
            onChange={(e) => setFormData({ ...formData, point2: e.target.value })}
            placeholder={t('tools.aITwitterThread.secondKeyPoint', 'Second key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
          <input
            type="text"
            value={formData.point3}
            onChange={(e) => setFormData({ ...formData, point3: e.target.value })}
            placeholder={t('tools.aITwitterThread.thirdKeyPoint', 'Third key point')}
            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none`}
          />
        </div>

        {/* Tweet Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Thread Length: {tweetCount} tweets</label>
          <input
            type="range"
            min="5"
            max="15"
            value={tweetCount}
            onChange={(e) => setTweetCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateThread}
          className="w-full py-3 bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          {t('tools.aITwitterThread.generateThread', 'Generate Thread')}
        </button>

        {/* Generated Thread */}
        {generatedThread.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Generated Thread ({generatedThread.length} tweets)
              </span>
              <button
                onClick={handleCopyAll}
                className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  copiedIndex === -1
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copiedIndex === -1 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === -1 ? t('tools.aITwitterThread.copied', 'Copied!') : t('tools.aITwitterThread.copyAll', 'Copy All')}
              </button>
            </div>

            <div className="space-y-3">
              {generatedThread.map((tweet, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {index + 1}/{generatedThread.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveTweet(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveTweet(index, 'down')}
                        disabled={index === generatedThread.length - 1}
                        className={`p-1 rounded transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyTweet(index)}
                        className={`p-1 rounded transition-colors ${
                          copiedIndex === index
                            ? 'bg-green-500 text-white'
                            : isDark
                            ? 'hover:bg-gray-600 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-500'
                        }`}
                      >
                        {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeTweet(index)}
                        className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`whitespace-pre-line text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {tweet}
                  </p>
                  <div className={`mt-2 text-xs ${tweet.length > 280 ? 'text-red-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tweet.length}/280 characters
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateThread}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.aITwitterThread.regenerateThread', 'Regenerate Thread')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {generatedThread.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Twitter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aITwitterThread.enterYourTopicAndKey', 'Enter your topic and key points to generate a thread')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITwitterThreadTool;
