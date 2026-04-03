import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, ArrowRight, Sparkles, Zap, Globe, Code, Smartphone, Server,
  Workflow, Brain, Camera, Scan, Link2, ChevronDown, ChevronRight,
  Calculator, Type, Lock, Repeat, Clock, Image, PenTool, Palette,
  Briefcase, Megaphone, Heart, Activity, DollarSign, ChefHat, Home,
  Flower2, Car, PawPrint, Plane, Star, GraduationCap, Music, Scissors,
  Gamepad2, CheckSquare, Building2, UserCheck, Cloud, Stethoscope,
  Factory, Truck, Zap as ZapIcon, Church, Baby, ExternalLink, Filter,
  Grid3X3, List, X, Play, Rocket, Target, Eye, FileText, Mail, Share2,
  Terminal, Database, Layers, Box, Shield, Settings, Users
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { useTools, ToolData, ToolCategory } from '../hooks/useTools';

// ============================================
// CATEGORY EMOJI MAPPING
// ============================================
const categoryEmojis: Record<string, string> = {
  'text-tools': '📝',
  'encoding': '🔐',
  'calculators': '🧮',
  'converters': '🔄',
  'generators': '✨',
  'date-time': '⏰',
  'image-tools': '🖼️',
  'ai-writing': '✍️',
  'ai-creative': '🎨',
  'ai-business': '💼',
  'ai-marketing': '📣',
  'developer': '👨‍💻',
  'health-wellness': '💚',
  'fitness-sports': '🏃',
  'finance': '💰',
  'cooking': '👨‍🍳',
  'home-diy': '🏠',
  'gardening': '🌱',
  'automotive': '🚗',
  'pet-care': '🐾',
  'travel': '✈️',
  'lifestyle': '⭐',
  'education': '🎓',
  'music': '🎵',
  'crafts': '✂️',
  'entertainment': '🎮',
  'productivity': '✅',
  'business': '🏢',
  'professional': '👔',
  'weather': '🌤️',
  'healthcare': '🏥',
  'manufacturing': '🏭',
  'logistics': '🚚',
  'energy-utilities': '⚡',
  'religious': '⛪',
  'childcare': '👶',
};

// ============================================
// ICON COMPONENT MAPPING
// ============================================
const iconComponents: Record<string, React.ElementType> = {
  type: Type,
  lock: Lock,
  calculator: Calculator,
  repeat: Repeat,
  sparkles: Sparkles,
  clock: Clock,
  image: Image,
  'pen-tool': PenTool,
  palette: Palette,
  briefcase: Briefcase,
  megaphone: Megaphone,
  code: Code,
  heart: Heart,
  activity: Activity,
  'dollar-sign': DollarSign,
  'chef-hat': ChefHat,
  home: Home,
  flower: Flower2,
  car: Car,
  'paw-print': PawPrint,
  plane: Plane,
  star: Star,
  'graduation-cap': GraduationCap,
  music: Music,
  scissors: Scissors,
  'gamepad-2': Gamepad2,
  'check-square': CheckSquare,
  'building-2': Building2,
  'user-check': UserCheck,
  cloud: Cloud,
  stethoscope: Stethoscope,
  factory: Factory,
  truck: Truck,
  zap: ZapIcon,
  church: Church,
  baby: Baby,
};

// ============================================
// AI BROWSER SUPERPOWERS - AVAILABLE NOW
// ============================================
const aiBrowserFeatures = [
  {
    icon: Workflow,
    title: "Visual Workflow Automation",
    description: "Build automation flows visually with 500+ app connectors. Zapier/n8n alternative built-in.",
    color: "from-orange-500 to-amber-500",
    tag: "FluxTurn Integration"
  },
  {
    icon: Link2,
    title: "URL Detection + Auto-Summarize",
    description: "Paste any URL - we detect it, fetch content, and provide instant summaries with key insights.",
    color: "from-blue-500 to-cyan-500",
    tag: "AI Browser"
  },
  {
    icon: Camera,
    title: "Screenshot & Page Analysis",
    description: "Take screenshots, analyze pages, extract data, and understand any visual content with AI.",
    color: "from-violet-500 to-purple-500",
    tag: "Visual AI"
  },
  {
    icon: Globe,
    title: "Research Mode (Deep Web Search)",
    description: "Multi-source research with citations. Search academic papers, news, and real-time data.",
    color: "from-emerald-500 to-teal-500",
    tag: "Deep Research"
  },
  {
    icon: Brain,
    title: "Multi-Model AI Chat",
    description: "Switch between 30+ AI models instantly - GPT-4o, Claude, Gemini, DeepSeek, Llama and more.",
    color: "from-pink-500 to-rose-500",
    tag: "30+ Models"
  },
  {
    icon: Image,
    title: "AI Image Generation",
    description: "Create stunning images with FLUX Pro, DALL-E 3, Stable Diffusion XL - all the best image models.",
    color: "from-fuchsia-500 to-pink-500",
    tag: "Image AI"
  },
  {
    icon: Play,
    title: "AI Video Generation",
    description: "Generate videos with Runway, Pika, and other leading video AI models. Text-to-video in seconds.",
    color: "from-red-500 to-orange-500",
    tag: "Video AI"
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description: "Upload PDFs, docs, spreadsheets - AI extracts insights, summarizes, and answers questions.",
    color: "from-amber-500 to-yellow-500",
    tag: "Doc AI"
  },
  {
    icon: Code,
    title: "Code Generation & Review",
    description: "Generate, explain, debug, and review code in any language. Full-stack development assistant.",
    color: "from-green-500 to-emerald-500",
    tag: "Code AI"
  },
  {
    icon: Database,
    title: "Data Extraction & Analysis",
    description: "Extract structured data from any source. Tables, forms, receipts - AI understands it all.",
    color: "from-cyan-500 to-blue-500",
    tag: "Data AI"
  },
  {
    icon: Mail,
    title: "Email & Communication AI",
    description: "Draft emails, messages, and responses. Professional tone, any language, instant results.",
    color: "from-indigo-500 to-violet-500",
    tag: "Writing AI"
  },
  {
    icon: Shield,
    title: "Privacy-First Processing",
    description: "Your data stays secure. Local processing options, encrypted storage, GDPR compliant.",
    color: "from-slate-500 to-gray-500",
    tag: "Security"
  },
];

// ============================================
// UNIQUE CAPABILITIES
// ============================================
const uniqueCapabilities = [
  {
    icon: Terminal,
    title: "One Prompt → Full Backend",
    description: "Generate complete Hono.js APIs with PostgreSQL, authentication, and business logic from natural language.",
    color: "from-green-500 to-emerald-500",
    example: "\"Build me a REST API for a todo app with user auth\""
  },
  {
    icon: Code,
    title: "One Prompt → React Frontend",
    description: "Create beautiful React components with Tailwind CSS, responsive design, and state management.",
    color: "from-blue-500 to-indigo-500",
    example: "\"Create a dashboard with charts and data tables\""
  },
  {
    icon: Smartphone,
    title: "One Prompt → Mobile Apps",
    description: "Generate React Native apps for iOS and Android with native components and navigation.",
    color: "from-pink-500 to-rose-500",
    example: "\"Build a fitness tracker app with workout logging\""
  },
  {
    icon: Database,
    title: "One Prompt → Full-Stack",
    description: "Complete full-stack applications - frontend, backend, database, and deployment config.",
    color: "from-amber-500 to-orange-500",
    example: "\"Create a booking system for a salon business\""
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
const ToolsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch tools from backend API (single source of truth)
  const { tools: allTools, categories: toolCategories, loading: toolsLoading } = useTools();

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let result = allTools;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        tool =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, ToolData[]> = {};
    filteredTools.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });
    return grouped;
  }, [filteredTools]);

  // Get category count
  const getCategoryCount = (categoryId: string) => {
    return allTools.filter(t => t.category === categoryId).length;
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle tool click
  const handleToolClick = (toolId: string) => {
    navigate(`/chat?tool=${toolId}`);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  // Expand all categories on search
  useEffect(() => {
    if (searchQuery) {
      setExpandedCategories(new Set(Object.keys(toolsByCategory)));
    }
  }, [searchQuery, toolsByCategory]);

  return (
    <>
      <SEO
        title={t('tools.pageTitle')}
        description={t('tools.pageDescription')}
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">{t('tools.exploreAllTools')}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">{t('tools.heroTitle')}</span> {t('tools.heroSubtitle')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-400 max-w-3xl mx-auto mb-8"
              >
                {t('tools.heroDescription')}
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-8 mb-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">1000+</div>
                  <div className="text-sm text-gray-500">{t('tools.statsContextualTools')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{toolCategories.length}</div>
                  <div className="text-sm text-gray-500">{t('tools.statsCategories')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">500+</div>
                  <div className="text-sm text-gray-500">{t('tools.statsWorkflowConnectors')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400">30+</div>
                  <div className="text-sm text-gray-500">{t('tools.statsAiModels')}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* AI BROWSER SUPERPOWERS - RIGHT AFTER HERO */}
        {/* ============================================ */}
        <section className="py-16 bg-gray-900/50 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">{t('tools.aiBrowserSuperpowers')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t('tools.advancedAiCapabilities')} <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{t('tools.capabilities')}</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {t('tools.aiBrowserDescription')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {aiBrowserFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate('/chat')}
                  className="relative bg-gray-900/80 border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-violet-500/50 hover:bg-gray-800/50 transition-all cursor-pointer"
                >
                  {/* Available Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                      {t('tools.live')}
                    </span>
                  </div>

                  <div className={`w-11 h-11 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-violet-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>

                  {/* Tag */}
                  <div className="mt-3">
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs font-medium rounded">
                      {feature.tag}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* UNIQUE CAPABILITIES - ONE PROMPT → APP */}
        {/* ============================================ */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{t('tools.nobodyElseHasThis')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t('tools.onePrompt')} <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('tools.fullStackApps')}</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {t('tools.onePromptDescription')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {uniqueCapabilities.map((cap, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${cap.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cap.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{cap.description}</p>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <code className="text-xs text-emerald-400">{cap.example}</code>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SEARCH AND FILTERS */}
        {/* ============================================ */}
        <section className="sticky top-16 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tools.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1 border border-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-500">
                {filteredTools.length} {t('tools.tools')}
                {selectedCategory && (
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="ml-2 text-emerald-400 hover:underline"
                  >
                    {t('tools.clearFilter')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* MAIN CONTENT - TOOLS BY CATEGORY */}
        {/* ============================================ */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Sidebar - Categories */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-40 bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    {t('tools.categories')}
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        !selectedCategory ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>📦</span>
                        {t('tools.allTools')}
                      </span>
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{allTools.length}</span>
                    </button>
                    {toolCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === category.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{categoryEmojis[category.id] || '📁'}</span>
                          <span className="truncate">{category.name}</span>
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {getCategoryCount(category.id)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {/* Category Pills - Mobile */}
                <div className="lg:hidden mb-6 overflow-x-auto pb-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        !selectedCategory ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      All ({allTools.length})
                    </button>
                    {toolCategories.slice(0, 8).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                          selectedCategory === cat.id ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {categoryEmojis[cat.id]} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tools Grid/List */}
                {selectedCategory ? (
                  // Single category view
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">{categoryEmojis[selectedCategory]}</span>
                        {toolCategories.find(c => c.id === selectedCategory)?.name}
                        <span className="text-lg text-gray-500">({filteredTools.length})</span>
                      </h2>
                      <p className="text-gray-400 mt-1">
                        {toolCategories.find(c => c.id === selectedCategory)?.description}
                      </p>
                    </div>

                    <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                      {filteredTools.map((tool, idx) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          viewMode={viewMode}
                          index={idx}
                          onClick={() => handleToolClick(tool.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // All categories view
                  <div className="space-y-8">
                    {toolCategories.map((category) => {
                      const categoryTools = toolsByCategory[category.id] || [];
                      if (categoryTools.length === 0) return null;

                      const isExpanded = expandedCategories.has(category.id) || searchQuery;
                      const displayTools = isExpanded ? categoryTools : categoryTools.slice(0, 6);

                      return (
                        <div key={category.id} className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                          {/* Category Header */}
                          <button
                            onClick={() => !searchQuery && toggleCategory(category.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{categoryEmojis[category.id] || '📁'}</span>
                              <div className="text-left">
                                <h3 className="text-lg font-semibold">{category.name}</h3>
                                <p className="text-sm text-gray-500">{category.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
                                {categoryTools.length} tools
                              </span>
                              {!searchQuery && (
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </button>

                          {/* Category Tools */}
                          <div className="px-6 pb-6">
                            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                              {displayTools.map((tool, idx) => (
                                <ToolCard
                                  key={tool.id}
                                  tool={tool}
                                  viewMode={viewMode}
                                  index={idx}
                                  onClick={() => handleToolClick(tool.id)}
                                />
                              ))}
                            </div>

                            {/* Show More */}
                            {!isExpanded && categoryTools.length > 6 && (
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="mt-4 w-full py-2 text-center text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2"
                              >
                                {t('tools.showMore', { count: categoryTools.length - 6 })} <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No Results */}
                {filteredTools.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">{t('tools.noToolsFound')}</h3>
                    <p className="text-gray-400 mb-4">{t('tools.noToolsDescription')}</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        handleCategorySelect(null);
                      }}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                    >
                      {t('tools.clearAllFilters')}
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CTA SECTION */}
        {/* ============================================ */}
        <section className="py-16 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('tools.ctaTitle')}
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {t('tools.ctaDescription')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                {t('tools.startFreeNow')} <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all"
              >
                <Play className="w-5 h-5" /> {t('tools.tryDemo')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// ============================================
// TOOL CARD COMPONENT
// ============================================
interface ToolCardProps {
  tool: ToolData;
  viewMode: 'grid' | 'list';
  index: number;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, viewMode, index, onClick }) => {
  const { t } = useTranslation();
  const emoji = categoryEmojis[tool.category] || '🔧';

  if (viewMode === 'list') {
    return (
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all text-left group"
      >
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium group-hover:text-emerald-400 transition-colors">{tool.title}</h4>
          <p className="text-sm text-gray-500 truncate">{tool.description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="w-full p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium group-hover:text-emerald-400 transition-colors line-clamp-1">{tool.title}</h4>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{tool.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end text-xs text-gray-600 group-hover:text-emerald-400 transition-colors">
        {t('tools.useTool')} <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
};

export default ToolsPage;
