import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Pin,
  PinOff,
  Trash2,
  Loader2,
  Tag,
  Palette,
  Share2,
  Copy,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/landing/Header';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { notesApi, Note, CreateNoteData, UpdateNoteData } from '@/lib/api/notes-api';
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

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Note | null>(null);

  // Load note if editing
  useEffect(() => {
    if (!isNew && id) {
      loadNote(id);
    }
  }, [id, isNew]);

  // Track changes
  useEffect(() => {
    if (isNew) {
      setHasChanges(title.length > 0 || content.length > 0);
    } else if (originalData) {
      const changed =
        title !== originalData.title ||
        content !== (originalData.content || '') ||
        color !== originalData.color ||
        isPinned !== originalData.isPinned ||
        JSON.stringify(tags) !== JSON.stringify(originalData.tags || []);
      setHasChanges(changed);
    }
  }, [title, content, color, isPinned, tags, originalData, isNew]);

  const loadNote = async (noteId: string) => {
    try {
      setLoading(true);
      const note = await notesApi.getNoteById(noteId);
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#FFFFFF');
      setIsPinned(note.isPinned || false);
      setTags(note.tags || []);
      setOriginalData(note);
    } catch (error) {
      console.error('Failed to load note:', error);
      toast.error('Failed to load note');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setSaving(true);

      if (isNew) {
        const data: CreateNoteData = {
          title: title.trim(),
          content: content.trim(),
          color,
          isPinned,
          tags,
        };
        const newNote = await notesApi.createNote(data);
        toast.success('Note created');
        navigate(`/notes/${newNote.id}`);
      } else if (id) {
        const data: UpdateNoteData = {
          title: title.trim(),
          content: content.trim(),
          color,
          isPinned,
          tags,
        };
        await notesApi.updateNote(id, data);
        toast.success('Note saved');
        setHasChanges(false);
        setOriginalData({
          ...originalData!,
          title: title.trim(),
          content: content.trim(),
          color,
          isPinned,
          tags,
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async () => {
    if (isNew) {
      setIsPinned(!isPinned);
      return;
    }

    try {
      const updated = await notesApi.togglePin(id!);
      setIsPinned(updated.isPinned);
      toast.success(updated.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;

    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await notesApi.deleteNote(id);
      toast.success('Note deleted');
      navigate('/notes');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleShare = async () => {
    const text = `${title}\n\n${content}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
      }
    } catch (error) {
      // User cancelled sharing
    }
  };

  const handleCopy = async () => {
    const text = `${title}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  const textColor = getContrastColor(color);

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={async () => {
              if (hasChanges) {
                const confirmed = await confirm({
                  title: 'Unsaved Changes',
                  message: 'You have unsaved changes. Discard them?',
                  confirmText: 'Discard',
                  cancelText: 'Cancel',
                  variant: 'warning',
                });
                if (confirmed) {
                  navigate('/notes');
                }
              } else {
                navigate('/notes');
              }
            }}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {/* Color Picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="border-white/20 bg-white/10"
                style={{ backgroundColor: color }}
              >
                <Palette className="w-4 h-4" style={{ color: textColor }} />
              </Button>

              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-12 z-50 p-3 bg-slate-800 rounded-lg shadow-xl border border-white/20"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setColor(c.value);
                          setShowColorPicker(false);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          color === c.value ? 'border-white ring-2 ring-amber-500' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Pin Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleTogglePin}
              className={`border-white/20 ${isPinned ? 'bg-amber-500/20' : 'bg-white/10'}`}
            >
              {isPinned ? (
                <Pin className="w-4 h-4 text-amber-400" />
              ) : (
                <PinOff className="w-4 h-4 text-white" />
              )}
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="border-white/20 bg-white/10"
            >
              <Share2 className="w-4 h-4 text-white" />
            </Button>

            {/* Copy */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="border-white/20 bg-white/10"
            >
              <Copy className="w-4 h-4 text-white" />
            </Button>

            {/* Delete */}
            {!isNew && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            )}

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </motion.div>

        {/* Note Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className="overflow-hidden shadow-xl"
            style={{ backgroundColor: color }}
          >
            <CardContent className="p-6">
              {/* Title */}
              <Input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 px-0 mb-4"
                style={{ color: textColor }}
              />

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-black/10 hover:bg-black/20 cursor-pointer"
                    style={{ color: textColor }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}

                {showTagInput ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      placeholder="Tag name..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTag();
                        if (e.key === 'Escape') setShowTagInput(false);
                      }}
                      className="h-7 w-24 text-sm bg-black/10 border-none"
                      style={{ color: textColor }}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleAddTag}
                    >
                      <Check className="w-4 h-4" style={{ color: textColor }} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setShowTagInput(false)}
                    >
                      <X className="w-4 h-4" style={{ color: textColor }} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTagInput(true)}
                    className="h-7 px-2"
                    style={{ color: textColor }}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Add tag
                  </Button>
                )}
              </div>

              {/* Content */}
              <Textarea
                placeholder="Start writing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] border-none bg-transparent focus-visible:ring-0 px-0 resize-none text-base"
                style={{ color: textColor }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Metadata */}
        {originalData && (
          <div className="mt-4 text-center text-sm text-white/40">
            Created {new Date(originalData.createdAt).toLocaleString()} ·
            Last updated {new Date(originalData.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
