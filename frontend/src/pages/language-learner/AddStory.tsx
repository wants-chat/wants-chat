import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Save, AlertCircle, Check, Globe, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateStory } from '../../hooks/language-learner/useStories';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

interface Story {
  id: string;
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  wordsCount: number;
  difficulty: number;
  category:
    | 'fiction'
    | 'non_fiction'
    | 'news'
    | 'daily_life'
    | 'culture'
    | 'history'
    | 'science'
    | 'business'
    | 'travel'
    | 'education';
  isCompleted: boolean;
  isUnlocked: boolean;
  completionRate: number;
  rating: number;
  thumbnail: string;
  preview: string;
  vocabulary: string[];
  content: Array<{
    id: string;
    text: string;
    audioUrl: string;
    vocabulary: any[];
  }>;
}

interface StoryForm {
  title: string;
  author: string;
  content: string;
  category: Story['category'];
  level: Story['level'];
  preview: string;
}

const AddStory: React.FC = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<'spanish' | 'english'>('spanish');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createStoryMutation = useCreateStory();

  const [formData, setFormData] = useState<StoryForm>({
    title: '',
    author: '',
    content: '',
    category: 'daily_life',
    level: 'beginner',
    preview: '',
  });

  const categories = [
    { value: 'fiction', label: 'Fiction', icon: '📖' },
    { value: 'non_fiction', label: 'Non-Fiction', icon: '📰' },
    { value: 'news', label: 'News', icon: '📺' },
    { value: 'daily_life', label: 'Daily Life', icon: '🏠' },
    { value: 'culture', label: 'Culture', icon: '🎭' },
    { value: 'history', label: 'History', icon: '📜' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'education', label: 'Education', icon: '🎓' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Simple vocabulary and short sentences' },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Moderate vocabulary and complex sentences',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Rich vocabulary and sophisticated grammar',
    },
  ];

  // Detect current language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('currentLanguagelearning');
    if (savedLanguage === 'english') {
      setCurrentLanguage('english');
    } else {
      setCurrentLanguage('spanish');
    }
  }, []);

  const handleInputChange = (field: keyof StoryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Show encouraging feedback for title and content
    if (field === 'title' && value.length >= 3 && !errors.title) {
      toast.success('Great title!', {
        description: 'Your story title looks engaging.',
        duration: 2000,
      });
    }

    if (field === 'content' && value.length >= 100 && value.length % 200 === 0) {
      const wordCount = value.split(' ').filter((word) => word.trim()).length;
      toast.info(`${wordCount} words written!`, {
        description: 'Keep going - your story is taking shape.',
        duration: 2000,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Story title is required';
      toast.error('Title required', {
        description: 'Please enter a title for your story.',
        duration: 3000,
      });
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
      toast.error('Title too short', {
        description: 'Your title should be at least 3 characters long.',
        duration: 3000,
      });
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
      toast.error('Author name required', {
        description: 'Please enter the author\'s name.',
        duration: 3000,
      });
    } else if (formData.author.trim().length < 2) {
      newErrors.author = 'Author name must be at least 2 characters long';
      toast.error('Author name too short', {
        description: 'The author name should be at least 2 characters long.',
        duration: 3000,
      });
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Story content is required';
      toast.error('Story content required', {
        description: 'Please write your story content before saving.',
        duration: 3000,
      });
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'Story must be at least 50 characters long';
      toast.error('Story content too short', {
        description: `Your story needs at least 50 characters. Current: ${formData.content.trim().length}`,
        duration: 3000,
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/20 text-white/60';
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const wordCount = formData.content.split(' ').filter((word) => word.trim()).length;
      const estimatedTime = Math.ceil(wordCount / 200);
      const preview =
        formData.content.substring(0, 100) + (formData.content.length > 100 ? '...' : '');

      const storyData = {
        title: formData.title,
        author: formData.author || 'Anonymous',
        level: formData.level,
        language_code: currentLanguage === 'spanish' ? 'es' : 'en',
        category: formData.category,
        estimated_time: estimatedTime,
        words_count: wordCount,
        difficulty: formData.level === 'beginner' ? 2 : formData.level === 'intermediate' ? 3 : 4,
        thumbnail: '✨',
        preview: preview,
        content: [
          {
            type: 'text' as const,
            text: formData.content,
            translation: '',
            audio_url: '',
            metadata: {},
          },
        ],
        vocabulary: [],
        rating: 0,
        metadata: {},
      };

      try {
        await createStoryMutation.mutateAsync(storyData);
        toast.success('Story created successfully!', {
          description: `"${formData.title}" has been published and is now available for reading.`,
          duration: 4000,
        });
        setTimeout(() => {
          navigate('/language-learner/stories');
        }, 1500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create story. Please try again.';
        toast.error('Failed to create story', {
          description: errorMessage,
          duration: 5000,
        });
        setErrors({
          general: errorMessage,
        });
      }
    }
  };

  const handleCancel = () => {
    navigate('/language-learner/stories');
  };

  const wordCount = formData.content.split(' ').filter((word) => word.trim()).length;
  const estimatedTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="default" />
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/language-learner/stories')}
                className="mr-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <BookOpen className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-semibold text-white">
                Add Your Story
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center space-x-1 bg-white/10 text-white border-white/20">
                <Globe className="h-3 w-3" />
                <span>{currentLanguage === 'spanish' ? 'Spanish' : 'English'}</span>
              </Badge>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <GlassCard className="mb-8 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your {currentLanguage === 'spanish' ? 'Spanish' : 'English'} Story ✍️
          </h1>
          <p className="text-lg text-white/60">
            Share your creativity and help others learn{' '}
            {currentLanguage === 'spanish' ? 'Spanish' : 'English'} through storytelling
          </p>
        </GlassCard>


        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{errors.general}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Story Information */}
          <div className="xl:col-span-1">
            <GlassCard className="mb-8 border-l-4 border-teal-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Edit3 className="h-5 w-5 text-teal-400" />
                  Story Details
                </CardTitle>
                <CardDescription className="text-white/60">Basic information about your story</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-white/80"
                  >
                    Story Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder={`Enter your ${
                      currentLanguage === 'spanish' ? 'Spanish' : 'English'
                    } story title...`}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`mt-1 h-12 rounded-xl bg-white/5 text-white border-white/20 placeholder:text-white/40 ${
                      errors.title
                        ? 'border-red-500/50'
                        : 'focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                  />
                  {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="author"
                    className="text-sm font-semibold text-white/80"
                  >
                    Author Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="author"
                    type="text"
                    placeholder="Enter author name..."
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className={`mt-1 h-12 rounded-xl bg-white/5 text-white border-white/20 placeholder:text-white/40 ${
                      errors.author
                        ? 'border-red-500/50'
                        : 'focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                  />
                  {errors.author && <p className="text-sm text-red-400 mt-1">{errors.author}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="level"
                    className="text-sm font-semibold text-white/80"
                  >
                    Difficulty Level
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value as Story['level'])}
                  >
                    <SelectTrigger id="level" className="mt-1 h-12 rounded-xl bg-white/5 text-white border-white/20 focus:border-teal-500 focus:ring-teal-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
                      {levels.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{level.label}</span>
                            <span className="text-sm text-white/60">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="category"
                    className="text-sm font-semibold text-white/80"
                  >
                    Story Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange('category', value as Story['category'])
                    }
                  >
                    <SelectTrigger id="category" className="mt-1 h-12 rounded-xl bg-white/5 text-white border-white/20 focus:border-teal-500 focus:ring-teal-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 backdrop-blur-xl border-white/20">
                      {categories.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Story Statistics */}
                <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">
                    Story Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Words:</span>
                      <span className="text-sm font-bold text-white">
                        {wordCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">
                        Reading Time:
                      </span>
                      <span className="text-sm font-bold text-white">
                        ~{estimatedTime} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Level:</span>
                      <Badge className={getLevelColor(formData.level)}>{formData.level}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </div>

          {/* Right Column - Story Content */}
          <div className="xl:col-span-2">
            <GlassCard className="mb-8 border-l-4 border-teal-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 text-teal-400" />
                  Story Content
                </CardTitle>
                <CardDescription className="text-white/60">
                  Write your story in {currentLanguage === 'spanish' ? 'Spanish' : 'English'}. Be
                  creative and engaging!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="content"
                    className="text-sm font-semibold text-white/80"
                  >
                    Story Text <span className="text-red-400">*</span>
                  </Label>
                  <textarea
                    id="content"
                    placeholder={`Write your ${
                      currentLanguage === 'spanish' ? 'Spanish' : 'English'
                    } story here... Tell an engaging story that will help others learn the language!`}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={20}
                    className={`w-full mt-1 px-4 py-3 border-2 rounded-xl resize-none focus:outline-none focus:ring-3 bg-white/5 text-white placeholder:text-white/40 ${
                      errors.content
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/20 focus:border-teal-500 hover:border-teal-500/60 focus:ring-teal-500/15'
                    }`}
                  />
                  {errors.content && <p className="text-sm text-red-400 mt-1">{errors.content}</p>}
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.title.trim() ||
              !formData.author.trim() ||
              !formData.content.trim() ||
              createStoryMutation.isPending
            }
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {createStoryMutation.isPending ? 'Saving...' : 'Save Story'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AddStory;
