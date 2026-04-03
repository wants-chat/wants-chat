import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  ArrowLeft,
  Trash2,
  ChevronRight,
  FileText,
  Mail,
  MessageSquare,
  Hash,
  Video,
  ClipboardList,
  BookOpen,
  Scale,
  Calculator,
  TrendingUp,
  Mic,
  Volume2,
  Languages,
  Image,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { aiToolsService, AIGeneration } from '../../services/aiToolsService';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

// Tool type to icon mapping
const toolIcons: Record<string, React.ReactNode> = {
  'resume': <FileText className="w-5 h-5" />,
  'cover-letter': <Mail className="w-5 h-5" />,
  'email': <Mail className="w-5 h-5" />,
  'social-captions': <MessageSquare className="w-5 h-5" />,
  'hashtags': <Hash className="w-5 h-5" />,
  'video-script': <Video className="w-5 h-5" />,
  'meeting-notes': <ClipboardList className="w-5 h-5" />,
  'study-notes': <BookOpen className="w-5 h-5" />,
  'contract-analysis': <Scale className="w-5 h-5" />,
  'legal-document': <FileText className="w-5 h-5" />,
  'tax-calculator': <Calculator className="w-5 h-5" />,
  'investment-advice': <TrendingUp className="w-5 h-5" />,
  'text-to-speech': <Volume2 className="w-5 h-5" />,
  'speech-to-text': <Mic className="w-5 h-5" />,
  'translate': <Languages className="w-5 h-5" />,
  'generate-image': <Image className="w-5 h-5" />,
};

// Tool type to display name
const toolNames: Record<string, string> = {
  'resume': 'Resume Builder',
  'cover-letter': 'Cover Letter',
  'email': 'Email Composer',
  'social-captions': 'Social Captions',
  'hashtags': 'Hashtag Generator',
  'video-script': 'Video Script',
  'meeting-notes': 'Meeting Notes',
  'study-notes': 'Study Notes',
  'contract-analysis': 'Contract Analyzer',
  'legal-document': 'Legal Document',
  'tax-calculator': 'Tax Calculator',
  'investment-advice': 'Investment Advisor',
  'text-to-speech': 'Text to Speech',
  'speech-to-text': 'Speech to Text',
  'translate': 'Translator',
  'generate-image': 'Image Generator',
};

const AIToolsHistory: React.FC = () => {
  const { confirm } = useConfirm();
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; toolType?: string } = { page, limit };
      if (filterType !== 'all') {
        params.toolType = filterType;
      }
      const result = await aiToolsService.getHistory(params);
      setGenerations(result.data);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filterType]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Generation',
      message: 'Are you sure you want to delete this generation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await aiToolsService.deleteGeneration(id);
      setGenerations(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filteredGenerations = searchQuery
    ? generations.filter(g =>
        toolNames[g.toolType]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(g.inputData).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : generations;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link
          to="/ai-tools"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Tools
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Generation History</h1>
            <p className="text-white/60 mt-1">View and manage your AI generations</p>
          </div>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search generations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          {/* Filter by type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Types</option>
              {Object.entries(toolNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredGenerations.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No generations yet</h3>
            <p className="text-white/60 mb-6">Start using AI tools to see your history here</p>
            <Link
              to="/ai-tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Explore AI Tools
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-3">
              {filteredGenerations.map((generation, idx) => (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg flex-shrink-0">
                      {toolIcons[generation.toolType] || <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white">
                          {toolNames[generation.toolType] || generation.toolType}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          generation.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : generation.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {generation.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">
                        {typeof generation.inputData === 'object'
                          ? Object.values(generation.inputData).filter(v => typeof v === 'string').slice(0, 2).join(' - ')
                          : String(generation.inputData)
                        }
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                        <span>{formatDate(generation.createdAt)}</span>
                        {generation.tokensUsed && (
                          <span>{generation.tokensUsed} tokens</span>
                        )}
                        {generation.processingTime && (
                          <span>{generation.processingTime}ms</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(generation.id)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white/60">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIToolsHistory;
