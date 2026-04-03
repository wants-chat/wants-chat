import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Trash2, Edit2, CheckCircle, Book, Lightbulb, Droplet, Zap, Home, Wind } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface RepairGuide {
  id: number;
  category: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  tools: string[];
  steps: string[];
  completed: boolean;
  notes: string;
  timestamp: string;
}

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: Droplet, color: 'from-blue-500 to-cyan-500' },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 'carpentry', name: 'Carpentry', icon: Home, color: 'from-amber-500 to-orange-500' },
  { id: 'hvac', name: 'HVAC', icon: Wind, color: 'from-cyan-500 to-blue-500' },
  { id: 'general', name: 'General', icon: Wrench, color: 'from-teal-500 to-cyan-500' },
];

const HomeRepair: React.FC = () => {
  const { confirm } = useConfirm();
  const [guides, setGuides] = useState<RepairGuide[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<RepairGuide | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    category: 'general',
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    estimatedTime: '',
    tools: '',
    steps: '',
    notes: '',
  });

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = () => {
    const stored = localStorage.getItem('homeRepairGuides');
    if (stored) {
      setGuides(JSON.parse(stored));
    }
  };

  const saveGuides = (newGuides: RepairGuide[]) => {
    localStorage.setItem('homeRepairGuides', JSON.stringify(newGuides));
    setGuides(newGuides);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newGuide: RepairGuide = {
      id: editingGuide?.id || Date.now(),
      category: formData.category,
      title: formData.title,
      difficulty: formData.difficulty,
      estimatedTime: formData.estimatedTime,
      tools: formData.tools.split(',').map(t => t.trim()).filter(Boolean),
      steps: formData.steps.split('\n').filter(Boolean),
      completed: editingGuide?.completed || false,
      notes: formData.notes,
      timestamp: editingGuide?.timestamp || new Date().toISOString(),
    };

    if (editingGuide) {
      saveGuides(guides.map(g => (g.id === editingGuide.id ? newGuide : g)));
    } else {
      saveGuides([newGuide, ...guides]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: 'general',
      title: '',
      difficulty: 'Easy',
      estimatedTime: '',
      tools: '',
      steps: '',
      notes: '',
    });
    setShowAddModal(false);
    setEditingGuide(null);
  };

  const deleteGuide = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Repair Guide',
      message: 'Are you sure you want to delete this repair guide?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      saveGuides(guides.filter(g => g.id !== id));
    }
  };

  const toggleComplete = (id: number) => {
    saveGuides(
      guides.map(g => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const editGuide = (guide: RepairGuide) => {
    setEditingGuide(guide);
    setFormData({
      category: guide.category,
      title: guide.title,
      difficulty: guide.difficulty,
      estimatedTime: guide.estimatedTime,
      tools: guide.tools.join(', '),
      steps: guide.steps.join('\n'),
      notes: guide.notes,
    });
    setShowAddModal(true);
  };

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DIY Home Repair</h1>
          <p className="text-gray-400">Your personal collection of repair guides and how-tos</p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search repair guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-teal-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Guide
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white`
                      : 'bg-slate-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Book className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No repair guides found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
              >
                Create Your First Guide
              </button>
            </div>
          ) : (
            filteredGuides.map(guide => {
              const category = CATEGORIES.find(c => c.id === guide.category);
              const Icon = category?.icon || Wrench;

              return (
                <div
                  key={guide.id}
                  className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-teal-500/30 p-6 hover:border-teal-500/50 transition-all ${
                    guide.completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category?.color || 'from-teal-500 to-cyan-500'}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleComplete(guide.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          guide.completed
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => editGuide(guide)}
                        className="p-2 bg-slate-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteGuide(guide.id)}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{guide.title}</h3>

                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-cyan-400 bg-cyan-500/20">
                      {guide.estimatedTime}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Tools Required
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {guide.tools.slice(0, 3).map((tool, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-700/50 text-gray-300 rounded text-xs">
                          {tool}
                        </span>
                      ))}
                      {guide.tools.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700/50 text-gray-300 rounded text-xs">
                          +{guide.tools.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Steps ({guide.steps.length})</p>
                    <div className="space-y-1">
                      {guide.steps.slice(0, 2).map((step, idx) => (
                        <p key={idx} className="text-sm text-gray-400 truncate">
                          {idx + 1}. {step}
                        </p>
                      ))}
                      {guide.steps.length > 2 && (
                        <p className="text-sm text-teal-400">+{guide.steps.length - 2} more steps</p>
                      )}
                    </div>
                  </div>

                  {guide.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-gray-400">{guide.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl border border-teal-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingGuide ? 'Edit Repair Guide' : 'Add Repair Guide'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g., Fix Leaky Faucet"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Time</label>
                    <input
                      type="text"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder="e.g., 30 mins"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tools (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tools}
                    onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g., Wrench, Screwdriver, Pliers"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Steps (one per line)</label>
                  <textarea
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 min-h-[150px]"
                    placeholder="Enter each step on a new line..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="Additional tips or warnings..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
                  >
                    {editingGuide ? 'Update Guide' : 'Add Guide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeRepair;
