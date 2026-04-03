import React, { useState, useEffect } from 'react';
import { GraduationCap, Loader2, Copy, Check, Sparkles, ChevronDown, ChevronUp, Clock, Target, BookOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface LessonActivity {
  name: string;
  duration: string;
  description: string;
  materials?: string[];
}

interface LessonPlan {
  title: string;
  subject: string;
  gradeLevel: string;
  duration: string;
  objectives: string[];
  materials: string[];
  warmUp: LessonActivity;
  mainActivities: LessonActivity[];
  assessment: {
    type: string;
    description: string;
    criteria: string[];
  };
  closure: LessonActivity;
  differentiation: {
    forStruggling: string[];
    forAdvanced: string[];
  };
  homework?: string;
  notes?: string;
  timestamp: Date;
}

interface AILessonPlanToolProps {
  uiConfig?: UIConfig;
}

const subjects = [
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Science', value: 'science' },
  { label: 'English Language Arts', value: 'english' },
  { label: 'Social Studies', value: 'social-studies' },
  { label: 'History', value: 'history' },
  { label: 'Geography', value: 'geography' },
  { label: 'Art', value: 'art' },
  { label: 'Music', value: 'music' },
  { label: 'Physical Education', value: 'physical-education' },
  { label: 'Computer Science', value: 'computer-science' },
  { label: 'Foreign Language', value: 'foreign-language' },
];

const gradeLevels = [
  { label: 'Pre-K', value: 'pre-k' },
  { label: 'Kindergarten', value: 'kindergarten' },
  { label: '1st Grade', value: 'grade-1' },
  { label: '2nd Grade', value: 'grade-2' },
  { label: '3rd Grade', value: 'grade-3' },
  { label: '4th Grade', value: 'grade-4' },
  { label: '5th Grade', value: 'grade-5' },
  { label: '6th Grade', value: 'grade-6' },
  { label: '7th Grade', value: 'grade-7' },
  { label: '8th Grade', value: 'grade-8' },
  { label: '9th Grade', value: 'grade-9' },
  { label: '10th Grade', value: 'grade-10' },
  { label: '11th Grade', value: 'grade-11' },
  { label: '12th Grade', value: 'grade-12' },
  { label: 'College', value: 'college' },
];

const durations = [
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '60 minutes', value: '60' },
  { label: '90 minutes', value: '90' },
  { label: '2 hours', value: '120' },
];

export const AILessonPlanTool: React.FC<AILessonPlanToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [gradeLevel, setGradeLevel] = useState(gradeLevels[5]);
  const [duration, setDuration] = useState(durations[2]);
  const [objectives, setObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    objectives: true,
    materials: false,
    activities: true,
    assessment: false,
    differentiation: false,
  });

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.topic || params.text || params.content) {
        setTopic(params.topic || params.text || params.content || '');
        hasChanges = true;
      }

      if (params.subject) {
        const matched = subjects.find(s => s.value === params.subject?.toLowerCase());
        if (matched) {
          setSubject(matched);
          hasChanges = true;
        }
      }

      if (params.gradeLevel) {
        const matched = gradeLevels.find(g => g.value === params.gradeLevel?.toLowerCase());
        if (matched) {
          setGradeLevel(matched);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a lesson topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create a comprehensive lesson plan for the following:
Topic: ${topic}
Subject: ${subject.label}
Grade Level: ${gradeLevel.label}
Duration: ${duration.label}
${objectives ? `Learning Objectives: ${objectives}` : ''}

Generate a detailed lesson plan in JSON format:
{
  "title": "Lesson title",
  "subject": "${subject.label}",
  "gradeLevel": "${gradeLevel.label}",
  "duration": "${duration.label}",
  "objectives": ["Learning objective 1", "Learning objective 2", "Learning objective 3"],
  "materials": ["Material 1", "Material 2", "Material 3"],
  "warmUp": {
    "name": "Warm-up activity name",
    "duration": "5-10 minutes",
    "description": "Description of the warm-up activity",
    "materials": ["Optional materials"]
  },
  "mainActivities": [
    {
      "name": "Activity name",
      "duration": "Duration",
      "description": "Detailed description",
      "materials": ["Materials needed"]
    }
  ],
  "assessment": {
    "type": "Formative/Summative",
    "description": "How students will be assessed",
    "criteria": ["Criterion 1", "Criterion 2"]
  },
  "closure": {
    "name": "Closure activity",
    "duration": "5 minutes",
    "description": "How to wrap up the lesson"
  },
  "differentiation": {
    "forStruggling": ["Strategy 1", "Strategy 2"],
    "forAdvanced": ["Extension 1", "Extension 2"]
  },
  "homework": "Optional homework assignment",
  "notes": "Additional notes for the teacher"
}

Create a well-structured lesson plan with 2-3 main activities. Return ONLY valid JSON.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert educator and curriculum designer. Create comprehensive, structured lesson plans with clear objectives, activities, and assessments. Return content in valid JSON format only.',
        temperature: 0.7,
        maxTokens: 3000,
      });

      // Extract content and ensure it's a string
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      let plan: LessonPlan;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          plan = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        plan = {
          title: `Lesson: ${topic}`,
          subject: subject.label,
          gradeLevel: gradeLevel.label,
          duration: duration.label,
          objectives: ['Students will understand key concepts', 'Students will apply knowledge'],
          materials: ['Whiteboard', 'Handouts', 'Worksheets'],
          warmUp: {
            name: 'Introduction',
            duration: '5 minutes',
            description: 'Review previous lesson and introduce today\'s topic',
          },
          mainActivities: [
            {
              name: 'Main Activity',
              duration: '30 minutes',
              description: 'Core lesson content and activities',
              materials: ['Textbook', 'Worksheets'],
            },
          ],
          assessment: {
            type: 'Formative',
            description: 'Observation and questioning during activities',
            criteria: ['Understanding of key concepts', 'Participation'],
          },
          closure: {
            name: 'Summary',
            duration: '5 minutes',
            description: 'Review main points and preview next lesson',
          },
          differentiation: {
            forStruggling: ['Provide additional examples', 'Pair with stronger students'],
            forAdvanced: ['Provide extension activities', 'Independent research'],
          },
          timestamp: new Date(),
        };
      }

      plan.timestamp = new Date();
      setGeneratedPlan(plan);

      try {
        await api.post('/content', {
          content_type: 'text',
          title: `Lesson Plan: ${topic}`,
          content: JSON.stringify(plan),
          metadata: {
            type: 'lesson-plan',
            subject: subject.value,
            gradeLevel: gradeLevel.value,
          },
        });
      } catch (saveError) {
        console.warn('Failed to save lesson plan:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lesson plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPlanForCopy = () => {
    if (!generatedPlan) return '';

    let text = `LESSON PLAN: ${generatedPlan.title}\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += `Subject: ${generatedPlan.subject}\n`;
    text += `Grade Level: ${generatedPlan.gradeLevel}\n`;
    text += `Duration: ${generatedPlan.duration}\n\n`;

    text += `LEARNING OBJECTIVES\n${'-'.repeat(30)}\n`;
    generatedPlan.objectives.forEach((obj, idx) => {
      text += `${idx + 1}. ${obj}\n`;
    });

    text += `\nMATERIALS NEEDED\n${'-'.repeat(30)}\n`;
    generatedPlan.materials.forEach(m => {
      text += `- ${m}\n`;
    });

    text += `\nWARM-UP (${generatedPlan.warmUp.duration})\n${'-'.repeat(30)}\n`;
    text += `${generatedPlan.warmUp.name}: ${generatedPlan.warmUp.description}\n`;

    text += `\nMAIN ACTIVITIES\n${'-'.repeat(30)}\n`;
    generatedPlan.mainActivities.forEach((act, idx) => {
      text += `\n${idx + 1}. ${act.name} (${act.duration})\n`;
      text += `   ${act.description}\n`;
      if (act.materials && act.materials.length > 0) {
        text += `   Materials: ${act.materials.join(', ')}\n`;
      }
    });

    text += `\nASSESSMENT (${generatedPlan.assessment.type})\n${'-'.repeat(30)}\n`;
    text += `${generatedPlan.assessment.description}\n`;
    text += `Criteria:\n`;
    generatedPlan.assessment.criteria.forEach(c => {
      text += `- ${c}\n`;
    });

    text += `\nCLOSURE (${generatedPlan.closure.duration})\n${'-'.repeat(30)}\n`;
    text += `${generatedPlan.closure.description}\n`;

    text += `\nDIFFERENTIATION\n${'-'.repeat(30)}\n`;
    text += `For Struggling Learners:\n`;
    generatedPlan.differentiation.forStruggling.forEach(s => {
      text += `- ${s}\n`;
    });
    text += `For Advanced Learners:\n`;
    generatedPlan.differentiation.forAdvanced.forEach(a => {
      text += `- ${a}\n`;
    });

    if (generatedPlan.homework) {
      text += `\nHOMEWORK\n${'-'.repeat(30)}\n${generatedPlan.homework}\n`;
    }

    if (generatedPlan.notes) {
      text += `\nTEACHER NOTES\n${'-'.repeat(30)}\n${generatedPlan.notes}\n`;
    }

    return text;
  };

  const handleCopy = async () => {
    const text = formatPlanForCopy();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-[#0D9488]/5 dark:from-gray-800 dark:to-[#0D9488]/10 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('tools.aILessonPlan.aiLessonPlanGenerator', 'AI Lesson Plan Generator')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tools.aILessonPlan.createComprehensiveLessonPlans', 'Create comprehensive lesson plans')}
              </p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488]/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs font-medium text-[#0D9488]">{t('tools.aILessonPlan.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aILessonPlan.lessonTopic', 'Lesson Topic')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.aILessonPlan.enterTheMainTopicFor', 'Enter the main topic for your lesson (e.g., \'Introduction to Fractions\', \'The Water Cycle\')...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Subject, Grade & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aILessonPlan.subject', 'Subject')}
            </label>
            <select
              value={subject.value}
              onChange={(e) => {
                const selected = subjects.find(s => s.value === e.target.value);
                if (selected) setSubject(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {subjects.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aILessonPlan.gradeLevel', 'Grade Level')}
            </label>
            <select
              value={gradeLevel.value}
              onChange={(e) => {
                const selected = gradeLevels.find(g => g.value === e.target.value);
                if (selected) setGradeLevel(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {gradeLevels.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tools.aILessonPlan.duration', 'Duration')}
            </label>
            <select
              value={duration.value}
              onChange={(e) => {
                const selected = durations.find(d => d.value === e.target.value);
                if (selected) setDuration(selected);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all text-gray-900 dark:text-white dark:bg-gray-700"
            >
              {durations.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tools.aILessonPlan.specificLearningObjectivesOptional', 'Specific Learning Objectives (Optional)')}
          </label>
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder={t('tools.aILessonPlan.whatShouldStudentsBeAble', 'What should students be able to do by the end of the lesson?...')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.aILessonPlan.creatingLessonPlan', 'Creating Lesson Plan...')}
            </>
          ) : (
            <>
              <GraduationCap className="w-5 h-5" />
              {t('tools.aILessonPlan.generateLessonPlan', 'Generate Lesson Plan')}
            </>
          )}
        </button>

        {/* Generated Lesson Plan Display */}
        {generatedPlan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {t('tools.aILessonPlan.lessonPlan', 'Lesson Plan')}
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.aILessonPlan.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.aILessonPlan.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header Info */}
              <div className="p-4 bg-[#0D9488]/5 border-b border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  {generatedPlan.title}
                </h5>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    {generatedPlan.subject}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    {generatedPlan.gradeLevel}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {generatedPlan.duration}
                  </span>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Learning Objectives */}
                <div>
                  <button
                    onClick={() => toggleSection('objectives')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <Target className="w-4 h-4 text-[#0D9488]" />
                      {t('tools.aILessonPlan.learningObjectives', 'Learning Objectives')}
                    </span>
                    {expandedSections.objectives ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.objectives && (
                    <div className="px-4 pb-4">
                      <ul className="space-y-2">
                        {generatedPlan.objectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-[#0D9488] font-medium">{idx + 1}.</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div>
                  <button
                    onClick={() => toggleSection('materials')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{t('tools.aILessonPlan.materialsNeeded', 'Materials Needed')}</span>
                    {expandedSections.materials ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.materials && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {generatedPlan.materials.map((m, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activities */}
                <div>
                  <button
                    onClick={() => toggleSection('activities')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{t('tools.aILessonPlan.lessonActivities', 'Lesson Activities')}</span>
                    {expandedSections.activities ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.activities && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Warm-up */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-[#0D9488] uppercase">{t('tools.aILessonPlan.warmUp', 'Warm-up')}</span>
                          <span className="text-xs text-gray-500">{generatedPlan.warmUp.duration}</span>
                        </div>
                        <h6 className="font-medium text-gray-900 dark:text-white">{generatedPlan.warmUp.name}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{generatedPlan.warmUp.description}</p>
                      </div>

                      {/* Main Activities */}
                      {generatedPlan.mainActivities.map((act, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#0D9488] uppercase">Activity {idx + 1}</span>
                            <span className="text-xs text-gray-500">{act.duration}</span>
                          </div>
                          <h6 className="font-medium text-gray-900 dark:text-white">{act.name}</h6>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{act.description}</p>
                          {act.materials && act.materials.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {act.materials.map((m, mIdx) => (
                                <span key={mIdx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Closure */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-[#0D9488] uppercase">{t('tools.aILessonPlan.closure', 'Closure')}</span>
                          <span className="text-xs text-gray-500">{generatedPlan.closure.duration}</span>
                        </div>
                        <h6 className="font-medium text-gray-900 dark:text-white">{generatedPlan.closure.name}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{generatedPlan.closure.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assessment */}
                <div>
                  <button
                    onClick={() => toggleSection('assessment')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{t('tools.aILessonPlan.assessment', 'Assessment')}</span>
                    {expandedSections.assessment ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.assessment && (
                    <div className="px-4 pb-4">
                      <span className="text-xs font-medium text-[#0D9488] uppercase">{generatedPlan.assessment.type}</span>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{generatedPlan.assessment.description}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">{t('tools.aILessonPlan.criteria', 'Criteria:')}</span>
                        <ul className="mt-1 space-y-1">
                          {generatedPlan.assessment.criteria.map((c, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#0D9488] rounded-full" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Differentiation */}
                <div>
                  <button
                    onClick={() => toggleSection('differentiation')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{t('tools.aILessonPlan.differentiation', 'Differentiation')}</span>
                    {expandedSections.differentiation ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.differentiation && (
                    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase">{t('tools.aILessonPlan.forStrugglingLearners', 'For Struggling Learners')}</span>
                        <ul className="mt-2 space-y-1">
                          {generatedPlan.differentiation.forStruggling.map((s, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">- {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">{t('tools.aILessonPlan.forAdvancedLearners', 'For Advanced Learners')}</span>
                        <ul className="mt-2 space-y-1">
                          {generatedPlan.differentiation.forAdvanced.map((a, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">- {a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Homework & Notes */}
              {(generatedPlan.homework || generatedPlan.notes) && (
                <div className="p-4 bg-[#0D9488]/5 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  {generatedPlan.homework && (
                    <div>
                      <span className="text-xs font-medium text-[#0D9488] uppercase">{t('tools.aILessonPlan.homework', 'Homework')}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{generatedPlan.homework}</p>
                    </div>
                  )}
                  {generatedPlan.notes && (
                    <div>
                      <span className="text-xs font-medium text-[#0D9488] uppercase">{t('tools.aILessonPlan.teacherNotes', 'Teacher Notes')}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{generatedPlan.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedPlan && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.aILessonPlan.yourLessonPlanWillAppear', 'Your lesson plan will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILessonPlanTool;
