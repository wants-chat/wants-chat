import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import { api } from '../lib/api';
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  User,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Heart,
  Lightbulb,
  MessageSquare,
  Save,
  X,
} from 'lucide-react';

interface Memory {
  id: string;
  content: string;
  category: 'preference' | 'fact' | 'instruction' | 'context';
  source: 'auto' | 'manual';
  isActive: boolean;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomInstructions {
  customInstructions: string;
  aboutUser: string;
  responsePreferences: string;
  enableMemories: boolean;
  enablePersonalization: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  preference: Heart,
  fact: User,
  instruction: Settings,
  context: MessageSquare,
};

const categoryColors: Record<string, string> = {
  preference: 'text-pink-500 bg-pink-500/10',
  fact: 'text-blue-500 bg-blue-500/10',
  instruction: 'text-purple-500 bg-purple-500/10',
  context: 'text-orange-500 bg-orange-500/10',
};

const MemoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({ content: '', category: 'fact' });
  const [instructions, setInstructions] = useState<CustomInstructions>({
    customInstructions: '',
    aboutUser: '',
    responsePreferences: '',
    enableMemories: true,
    enablePersonalization: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMemories();
    fetchInstructions();
  }, []);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/memories');
      // API returns { data: [...], meta: {...} } directly
      setMemories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructions = async () => {
    try {
      const response = await api.get('/user/instructions');
      // API returns { data: {...} } directly
      if (response.data) {
        setInstructions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch instructions:', error);
    }
  };

  const createMemory = async () => {
    if (!newMemory.content.trim()) return;

    try {
      setIsSaving(true);
      await api.post('/memories', newMemory);
      await fetchMemories();
      setNewMemory({ content: '', category: 'fact' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create memory:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMemory = async (id: string, updates: Partial<Memory>) => {
    try {
      await api.put(`/memories/${id}`, updates);
      await fetchMemories();
      setEditingMemory(null);
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await api.delete(`/memories/${id}`);
      setMemories(memories.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const saveInstructions = async () => {
    try {
      setIsSaving(true);
      await api.put('/user/instructions', instructions);
      setShowInstructionsModal(false);
    } catch (error) {
      console.error('Failed to save instructions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || memory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['preference', 'fact', 'instruction', 'context'];
  const memoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = memories.filter(m => m.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn(
      "flex h-full",
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-slate-50'
    )}>
      <AppSidebar activePage="memories" />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl font-bold",
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    {t('memories.title')}
                  </h1>
                  <p className={cn(
                    "mt-1 text-sm",
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {t('memories.subtitle', { count: memories.length })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Memory Toggle */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl",
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white border border-slate-200'
              )}>
                <span className={cn(
                  "text-xs font-medium",
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}>{t('memories.memoryToggle')}</span>
                <button
                  onClick={() => {
                    const newValue = !instructions.enableMemories;
                    setInstructions({ ...instructions, enableMemories: newValue });
                    api.put('/user/instructions', { ...instructions, enableMemories: newValue });
                  }}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors",
                    instructions.enableMemories
                      ? 'bg-[#0D9488]'
                      : theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-300'
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    instructions.enableMemories ? 'left-5' : 'left-0.5'
                  )} />
                </button>
              </div>

              <button
                onClick={() => setShowInstructionsModal(true)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                )}
              >
                <Settings className="w-4 h-4" />
                {t('memories.customInstructions')}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white text-sm font-medium hover:from-[#14B8A6] hover:to-[#0D9488] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('memories.addMemory')}
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className={cn(
            "mb-6 p-4 rounded-xl border flex items-start gap-3",
            theme === 'dark'
              ? 'bg-[#0D9488]/10 border-[#0D9488]/20'
              : 'bg-teal-50 border-teal-200'
          )}>
            <Lightbulb className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
            <div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              )}>
                {t('memories.infoBanner')}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "flex-1 relative",
            )}>
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              )} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('memories.search.placeholder')}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all",
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-slate-500 focus:border-[#0D9488]'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488]'
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  !selectedCategory
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                      ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                )}
              >
                {t('memories.categories.all')}
              </button>
              {categories.map(cat => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                      selectedCategory === cat
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                          ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{cat}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      selectedCategory === cat
                        ? 'bg-white/20'
                        : theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-100'
                    )}>
                      {memoryCounts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memories List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin" />
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className={cn(
              "text-center py-20 rounded-2xl border",
              theme === 'dark' ? 'bg-[#2a2a2a] border-[#3a3a3a]' : 'bg-white border-slate-200'
            )}>
              <Brain className={cn(
                "w-16 h-16 mx-auto mb-4",
                theme === 'dark' ? 'text-slate-600' : 'text-slate-300'
              )} />
              <h3 className={cn(
                "text-lg font-medium mb-2",
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              )}>
                {searchQuery ? t('memories.search.noResults') : t('memories.empty.title')}
              </h3>
              <p className={cn(
                "text-sm mb-6",
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}>
                {searchQuery
                  ? t('memories.search.noResultsHint')
                  : t('memories.empty.subtitle')
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0D9488] text-white text-sm font-medium hover:bg-[#0F766E] transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('memories.empty.addFirst')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map(memory => {
                const Icon = categoryIcons[memory.category] || Info;
                const isEditing = editingMemory?.id === memory.id;

                return (
                  <div
                    key={memory.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      theme === 'dark'
                        ? 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#444]'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        categoryColors[memory.category]
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <textarea
                            value={editingMemory.content}
                            onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                            className={cn(
                              "w-full p-2 rounded-lg border text-sm resize-none",
                              theme === 'dark'
                                ? 'bg-[#1a1a1a] border-[#3a3a3a] text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            )}
                            rows={3}
                          />
                        ) : (
                          <p className={cn(
                            "text-sm",
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          )}>
                            {memory.content}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            categoryColors[memory.category]
                          )}>
                            {memory.category}
                          </span>
                          <span className={cn(
                            "text-xs",
                            theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                          )}>
                            {memory.source === 'auto' ? t('memories.source.auto') : t('memories.source.manual')}
                          </span>
                          <span className={cn(
                            "text-xs",
                            theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                          )}>
                            {t('memories.useCount', { count: memory.useCount })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => updateMemory(memory.id, { content: editingMemory.content })}
                              className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] transition-all"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingMemory(null)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark'
                                  ? 'bg-[#3a3a3a] text-slate-300 hover:bg-[#444]'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              )}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingMemory(memory)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark'
                                  ? 'hover:bg-[#3a3a3a] text-slate-400 hover:text-white'
                                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                              )}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMemory(memory.id)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark'
                                  ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                                  : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                              )}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={cn(
            "w-full max-w-md mx-4 rounded-2xl p-6",
            theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn(
                "text-xl font-semibold",
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              )}>
                {t('memories.modal.addTitle')}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-slate-100'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('memories.modal.category')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewMemory({ ...newMemory, category: cat })}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 capitalize",
                          newMemory.category === cat
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                              ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('memories.modal.content')}
                </label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  placeholder={t('memories.modal.contentPlaceholder')}
                  className={cn(
                    "w-full p-3 rounded-xl border text-sm resize-none outline-none transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-slate-500 focus:border-[#0D9488]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488]'
                  )}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {t('memories.modal.cancel')}
                </button>
                <button
                  onClick={createMemory}
                  disabled={!newMemory.content.trim() || isSaving}
                  className="px-4 py-2.5 rounded-xl bg-[#0D9488] text-white text-sm font-medium hover:bg-[#0F766E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('memories.modal.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={cn(
            "w-full max-w-2xl mx-4 rounded-2xl p-6 max-h-[90vh] overflow-y-auto",
            theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn(
                "text-xl font-semibold",
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              )}>
                {t('memories.instructions.title')}
              </h2>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-slate-100'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* About User */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('memories.instructions.aboutUser.label')}
                </label>
                <textarea
                  value={instructions.aboutUser}
                  onChange={(e) => setInstructions({ ...instructions, aboutUser: e.target.value })}
                  placeholder={t('memories.instructions.aboutUser.placeholder')}
                  className={cn(
                    "w-full p-3 rounded-xl border text-sm resize-none outline-none transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-slate-500 focus:border-[#0D9488]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488]'
                  )}
                  rows={4}
                />
              </div>

              {/* Response Preferences */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('memories.instructions.responsePreferences.label')}
                </label>
                <textarea
                  value={instructions.responsePreferences}
                  onChange={(e) => setInstructions({ ...instructions, responsePreferences: e.target.value })}
                  placeholder={t('memories.instructions.responsePreferences.placeholder')}
                  className={cn(
                    "w-full p-3 rounded-xl border text-sm resize-none outline-none transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-slate-500 focus:border-[#0D9488]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488]'
                  )}
                  rows={4}
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {t('memories.instructions.customInstructions.label')}
                </label>
                <textarea
                  value={instructions.customInstructions}
                  onChange={(e) => setInstructions({ ...instructions, customInstructions: e.target.value })}
                  placeholder={t('memories.instructions.customInstructions.placeholder')}
                  className={cn(
                    "w-full p-3 rounded-xl border text-sm resize-none outline-none transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-slate-500 focus:border-[#0D9488]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488]'
                  )}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {t('memories.modal.cancel')}
                </button>
                <button
                  onClick={saveInstructions}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-[#0D9488] text-white text-sm font-medium hover:bg-[#0F766E] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('memories.instructions.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
