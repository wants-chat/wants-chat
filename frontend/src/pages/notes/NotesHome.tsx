import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Grid,
  List,
  Tag,
  Loader2,
  StickyNote,
  X,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { notesApi, Note, NotesStatistics } from '@/lib/api/notes-api';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmDialogContext';

// Preset colors for notes
const NOTE_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Rose', value: '#FFE4E1' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Mint', value: '#98FF98' },
  { name: 'Sky', value: '#87CEEB' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Peach', value: '#FFDAB9' },
  { name: 'Coral', value: '#FF7F7F' },
  { name: 'Cyan', value: '#E0FFFF' },
  { name: 'Cream', value: '#FFFDD0' },
];

const NotesHome: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<NotesStatistics | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load notes
  useEffect(() => {
    loadNotes();
    loadStats();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesApi.getNotes();
      setNotes(response.notes || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await notesApi.getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => !note.isDeleted);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter((note) =>
        selectedTags.some((tag) => note.tags?.includes(tag))
      );
    }

    // Sort: pinned first, then by updated date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, selectedTags]);

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = await notesApi.togglePin(note.id);
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, isPinned: updated.isPinned } : n))
      );
      toast.success(updated.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (note: Note, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await notesApi.deleteNote(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 mb-6">
              <StickyNote className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Notes
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Capture your thoughts, ideas, and important information
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <StickyNote className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalNotes}</p>
                  <p className="text-sm text-white/60">Total Notes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Pin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pinnedNotes}</p>
                  <p className="text-sm text-white/60">Pinned</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Tag className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Object.keys(stats.tagCounts || {}).length}
                  </p>
                  <p className="text-sm text-white/60">Tags</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 ${showFilters ? 'bg-white/20' : 'bg-white/10'}`}
            >
              <Filter className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-white/20 bg-white/10"
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4 text-white" />
              ) : (
                <Grid className="w-4 h-4 text-white" />
              )}
            </Button>
            <Button
              onClick={() => navigate('/notes/new')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Tag Filters */}
        <AnimatePresence>
          {showFilters && allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-4">
                  <p className="text-sm text-white/60 mb-2">Filter by tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'border-white/30 text-white/70 hover:bg-white/10'
                        }`}
                        onClick={() => toggleTagFilter(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <StickyNote className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery || selectedTags.length > 0
                  ? 'No notes found'
                  : 'No notes yet'}
              </h3>
              <p className="text-white/60 mb-6">
                {searchQuery || selectedTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Create your first note to get started'}
              </p>
              {!searchQuery && selectedTags.length === 0 && (
                <Button
                  onClick={() => navigate('/notes/new')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/notes/${note.id}`}>
                  <Card
                    className="h-full hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    style={{
                      backgroundColor: note.color || '#FFFFFF',
                    }}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="font-semibold text-lg line-clamp-1 flex-1"
                          style={{ color: getContrastColor(note.color || '#FFFFFF') }}
                        >
                          {note.title || 'Untitled'}
                        </h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(note, e)}
                            className="p-1 rounded hover:bg-black/10"
                          >
                            {note.isPinned ? (
                              <Pin className="w-4 h-4 text-amber-600" />
                            ) : (
                              <PinOff className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteNote(note, e)}
                            className="p-1 rounded hover:bg-black/10"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p
                        className="text-sm line-clamp-4 flex-1"
                        style={{
                          color: getContrastColor(note.color || '#FFFFFF'),
                          opacity: 0.7,
                        }}
                      >
                        {note.content || 'No content'}
                      </p>

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-full bg-black/10"
                              style={{ color: getContrastColor(note.color || '#FFFFFF') }}
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span
                              className="px-2 py-0.5 text-xs rounded-full bg-black/10"
                              style={{ color: getContrastColor(note.color || '#FFFFFF') }}
                            >
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-600" />
                        )}
                        <span
                          className="text-xs ml-auto"
                          style={{
                            color: getContrastColor(note.color || '#FFFFFF'),
                            opacity: 0.5,
                          }}
                        >
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link to={`/notes/${note.id}`}>
                  <Card
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    style={{ backgroundColor: note.color || '#FFFFFF' }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {note.isPinned && (
                        <Pin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold line-clamp-1"
                          style={{ color: getContrastColor(note.color || '#FFFFFF') }}
                        >
                          {note.title || 'Untitled'}
                        </h3>
                        <p
                          className="text-sm line-clamp-1"
                          style={{
                            color: getContrastColor(note.color || '#FFFFFF'),
                            opacity: 0.7,
                          }}
                        >
                          {note.content || 'No content'}
                        </p>
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-full bg-black/10"
                              style={{ color: getContrastColor(note.color || '#FFFFFF') }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span
                        className="text-xs flex-shrink-0"
                        style={{
                          color: getContrastColor(note.color || '#FFFFFF'),
                          opacity: 0.5,
                        }}
                      >
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(note, e)}
                          className="p-1 rounded hover:bg-black/10"
                        >
                          {note.isPinned ? (
                            <Pin className="w-4 h-4 text-amber-600" />
                          ) : (
                            <PinOff className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note, e)}
                          className="p-1 rounded hover:bg-black/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NotesHome;
