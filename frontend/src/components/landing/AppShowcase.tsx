import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Code2, BarChart3, Search, GraduationCap, PenTool,
  CalendarDays, Wrench, FileText, Workflow, Globe,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { Button } from '../ui/button';

const showcaseSlides = [
  {
    id: 'chat',
    title: 'AI Chat',
    subtitle: 'That Actually Does Things',
    description: 'Not just answers — Wants executes tasks, builds apps, analyzes data, and helps you get real work done.',
    icon: MessageSquare,
    features: ['Natural Conversations', 'Task Execution', 'Context Awareness', 'Multi-turn Memory'],
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    bgGradient: 'from-slate-900 via-teal-900/50 to-slate-900',
  },
  {
    id: 'app-builder',
    title: 'App Builder',
    subtitle: 'Create Full Apps from Text',
    description: 'Describe what you want, and Wants generates complete applications with UI, logic, and database.',
    icon: Code2,
    features: ['Natural Language to App', 'Full-Stack Generation', 'Live Preview', 'Deploy Instantly'],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-slate-900 via-violet-900/30 to-slate-900',
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    subtitle: 'Charts, SQL, and Insights',
    description: 'Upload any data and get instant visualizations, SQL queries, and actionable insights.',
    icon: BarChart3,
    features: ['Auto Visualizations', 'SQL Generation', 'Pattern Detection', 'Export Reports'],
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgGradient: 'from-slate-900 via-emerald-900/30 to-slate-900',
  },
  {
    id: 'research',
    title: 'Deep Research',
    subtitle: 'Multi-Source Fact-Checked',
    description: 'Research any topic with comprehensive reports from multiple sources, with citations and fact-checking.',
    icon: Search,
    features: ['Multi-Source Research', 'Fact Verification', 'Citation Links', 'Summary Reports'],
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    bgGradient: 'from-slate-900 via-blue-900/30 to-slate-900',
  },
  {
    id: 'learning',
    title: 'Interactive Learning',
    subtitle: 'AI Tutor for Any Subject',
    description: 'Learn anything with personalized tutoring, quizzes, explanations, and progress tracking.',
    icon: GraduationCap,
    features: ['Personalized Lessons', 'Interactive Quizzes', 'Progress Tracking', 'Any Subject'],
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    bgGradient: 'from-slate-900 via-amber-900/30 to-slate-900',
  },
  {
    id: 'writing',
    title: 'Writing Assistant',
    subtitle: 'Emails, Essays, Reports',
    description: 'Get help writing anything — emails, essays, reports, code documentation, and more.',
    icon: PenTool,
    features: ['Multiple Formats', 'Tone Adjustment', 'Grammar & Style', 'Templates'],
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    bgGradient: 'from-slate-900 via-rose-900/30 to-slate-900',
  },
  {
    id: 'planning',
    title: 'Planning & Organization',
    subtitle: 'Schedules, Goals, Projects',
    description: 'Plan your day, set goals, manage projects, and stay organized with AI assistance.',
    icon: CalendarDays,
    features: ['Smart Scheduling', 'Goal Tracking', 'Project Management', 'Reminders'],
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    bgGradient: 'from-slate-900 via-cyan-900/30 to-slate-900',
  },
  {
    id: 'tools',
    title: '1000+ Smart Tools',
    subtitle: 'Contextual UI That Adapts',
    description: 'Access over 1000 tools that appear exactly when you need them, with smart contextual UI.',
    icon: Wrench,
    features: ['Context-Aware', 'Auto-Suggestions', 'Every Industry', 'Always Expanding'],
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    bgGradient: 'from-slate-900 via-orange-900/30 to-slate-900',
  },
  {
    id: 'files',
    title: 'File Actions',
    subtitle: 'Process Any File',
    description: 'Convert, analyze, extract data, compress, and transform any file format with AI.',
    icon: FileText,
    features: ['Format Conversion', 'Data Extraction', 'Compression', 'Batch Processing'],
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    bgGradient: 'from-slate-900 via-purple-900/30 to-slate-900',
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    subtitle: 'Multi-Step Task Chains',
    description: 'Automate complex workflows by chaining multiple actions together with natural language.',
    icon: Workflow,
    features: ['Multi-Step Chains', 'Conditional Logic', 'Scheduled Tasks', 'Integrations'],
    gradient: 'from-teal-500 via-emerald-500 to-cyan-500',
    bgGradient: 'from-slate-900 via-teal-900/30 to-slate-900',
  },
  {
    id: 'web',
    title: 'Web Actions',
    subtitle: 'Screenshot, Summarize, Extract',
    description: 'Take screenshots, summarize web pages, extract data from URLs, and browse intelligently.',
    icon: Globe,
    features: ['Page Screenshots', 'Content Summarization', 'Data Extraction', 'Link Analysis'],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-slate-900 via-blue-900/30 to-slate-900',
  },
];

const AppShowcase: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
  };

  const slide = showcaseSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <section
      className="py-20 bg-gray-950 relative overflow-hidden transition-all duration-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background - matching login page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
            Explore AI Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            11 Ways Wants{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Gets Things Done
            </span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-800"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mx-auto md:mx-0 mb-6 shadow-lg`}
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.title}</h3>
                  <p className={`text-xl bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent font-semibold mb-4`}>
                    {slide.subtitle}
                  </p>
                  <p className="text-gray-400 text-lg">{slide.description}</p>
                </div>

                <div className="space-y-4">
                  {slide.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${slide.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full bg-gray-900/50 border-gray-800 text-white hover:bg-gray-800/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex gap-2">
            {showcaseSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? `w-8 bg-gradient-to-r ${slide.gradient}`
                    : 'w-2 bg-gray-700 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full bg-gray-900/50 border-gray-800 text-white hover:bg-gray-800/50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mt-4 text-white/60">
          {currentSlide + 1} / {showcaseSlides.length}
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
