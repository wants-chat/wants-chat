import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Grid3X3,
  Sparkles,
  Send,
  Check,
} from 'lucide-react';
import { useTools, ToolData, ToolCategory } from '../../hooks/useTools';

interface ToolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolRequestModal: React.FC<ToolRequestModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [email, setEmail] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch tools from backend API (single source of truth)
  const { tools: allTools, categories: toolCategories } = useTools();

  // Calculate total tools count
  const totalToolsCount = allTools.length;

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let tools = [...allTools];

    if (selectedCategory) {
      tools = tools.filter((tool) => tool.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tools = tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description?.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
      );
    }

    return tools;
  }, [selectedCategory, searchQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !toolDescription.trim()) return;

    setIsSubmitting(true);

    // Simulate API call - in production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowRequestForm(false);
      setEmail('');
      setToolDescription('');
    }, 2000);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory(null);
      setShowRequestForm(false);
      setEmail('');
      setToolDescription('');
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 xl:inset-20 bg-gray-950 rounded-2xl border border-gray-800 z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header - Combined with Request Tool */}
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Title and count */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Grid3X3 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">All Tools</h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                    {totalToolsCount} tools available
                  </span>
                </div>

                {/* Center: Request text and button */}
                <div className="hidden lg:flex items-center gap-4 flex-1 justify-end mr-4">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">Can't find what you need?</span>{' '}
                    <span className="text-emerald-400">Request a contextual UI and we'll deliver it within a short period to your email.</span>
                  </p>
                  <motion.button
                    onClick={() => setShowRequestForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    Request a Tool
                  </motion.button>
                </div>

                {/* Right: Close button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Mobile: Request section */}
              <div className="lg:hidden mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  <span className="text-white font-medium">Can't find what you need?</span>{' '}
                  <span className="text-emerald-400">Request a tool</span>
                </p>
                <motion.button
                  onClick={() => setShowRequestForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium text-xs hover:from-emerald-600 hover:to-cyan-600 transition-all whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3" />
                  Request
                </motion.button>
              </div>
            </div>

            {/* Request Form Modal Overlay */}
            <AnimatePresence>
              {showRequestForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-4"
                  onClick={() => setShowRequestForm(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Request a Tool</h3>
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                      Describe the tool you need and we'll build it for you within a short period.
                    </p>

                    {submitSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-6"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                          <Check className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-1">Request Submitted!</h4>
                        <p className="text-gray-400 text-sm text-center">
                          We'll review your request and get back to you soon.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">
                            Your Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">
                            Tool Name & Description
                          </label>
                          <textarea
                            value={toolDescription}
                            onChange={(e) => setToolDescription(e.target.value)}
                            placeholder="e.g., Crypto Portfolio Tracker that shows real-time prices..."
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors resize-none"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting || !email.trim() || !toolDescription.trim()}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit Request
                            </>
                          )}
                        </motion.button>
                      </form>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar - Categories */}
              <div className="w-64 border-r border-gray-800 overflow-y-auto hidden md:block">
                <div className="p-4 space-y-1">
                  {/* All Tools */}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      selectedCategory === null
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-sm font-medium">All Tools</span>
                    <span className="ml-auto text-xs text-gray-500">{totalToolsCount}</span>
                  </button>

                  {/* Divider */}
                  <div className="my-3 border-t border-gray-800" />

                  {/* Categories */}
                  {toolCategories.map((category) => {
                    const count = allTools.filter(t => t.category === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-medium truncate">{category.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content - Tools Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Mobile Category Dropdown */}
                <div className="md:hidden mb-4">
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">All Tools ({totalToolsCount})</option>
                    {toolCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({allTools.filter(t => t.category === cat.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    {filteredTools.length === totalToolsCount
                      ? `Showing all ${totalToolsCount} tools`
                      : `Showing ${filteredTools.length} of ${totalToolsCount} tools`}
                  </p>
                </div>

                {/* Tools Grid */}
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredTools.map((tool) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-emerald-500/10">
                          <span className="text-emerald-400">⚡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white text-sm truncate">
                              {tool.title}
                            </h3>
                            {tool.type.includes('ai') && (
                              <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {tool.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No tools found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">
                      We couldn't find any tools matching "{searchQuery}". Try a different search or request a new tool.
                    </p>
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-600 transition-colors"
                    >
                      Request This Tool
                    </button>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolRequestModal;
