import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { api } from '../../lib/api';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ChevronLeft,
  BookOpen,
  Volume2,
  MessageCircle,
  Trophy,
  Target,
  Heart,
  Flame,
  Crown,
  Users,
  BarChart3,
  Globe,
  Headphones,
  Mic,
  Star,
  Languages,
  Play,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  language_code: string;
  source_language: string;
  skill: string;
  difficulty: string;
  duration_minutes: number;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonsResponse {
  data: Lesson[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const LanguageLearnerLanding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectLesson, clearSelectedLesson } = useSelectedLesson();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessons, setShowLessons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { name: 'Spanish', flag: '🇪🇸', learners: '12.5M', difficulty: 'Easy' },
    { name: 'French', flag: '🇫🇷', learners: '8.2M', difficulty: 'Medium' },
    { name: 'German', flag: '🇩🇪', learners: '6.1M', difficulty: 'Medium' },
    { name: 'Italian', flag: '🇮🇹', learners: '4.8M', difficulty: 'Easy' },
    { name: 'Portuguese', flag: '🇵🇹', learners: '3.5M', difficulty: 'Easy' },
    { name: 'Japanese', flag: '🇯🇵', learners: '5.9M', difficulty: 'Hard' },
    { name: 'Korean', flag: '🇰🇷', learners: '4.2M', difficulty: 'Hard' },
    { name: 'Chinese', flag: '🇨🇳', learners: '7.1M', difficulty: 'Very Hard' },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Bite-sized lessons that adapt to your learning style and pace',
      color: 'from-primary/10 to-primary/5 border-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: Volume2,
      title: 'Pronunciation Practice',
      description: 'AI-powered speech recognition to perfect your accent',
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      icon: MessageCircle,
      title: 'Real-world Stories',
      description: 'Learn through engaging stories and conversations',
      color: 'from-primary/10 to-primary/5 border-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: Target,
      title: 'Personalized Practice',
      description: 'Spaced repetition system that focuses on your weak areas',
      color: 'from-emerald-600/10 to-emerald-500/10 border-emerald-300',
      iconColor: 'text-emerald-700',
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn XP, maintain streaks, and compete with friends',
      color: 'from-primary/10 to-primary/5 border-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Detailed analytics to monitor your learning journey',
      color: 'from-emerald-500/10 to-emerald-600/10 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
  ];

  const learningMethods = [
    {
      icon: Headphones,
      title: 'Listen & Repeat',
      description: 'Master pronunciation with native speaker audio',
    },
    {
      icon: Mic,
      title: 'Speak & Practice',
      description: 'Build confidence with speaking exercises',
    },
    {
      icon: BookOpen,
      title: 'Read & Understand',
      description: 'Improve comprehension with interactive stories',
    },
    {
      icon: Users,
      title: 'Connect & Share',
      description: 'Practice with native speakers and learners',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'intermediate':
      case 'Medium':
        return 'text-cyan-400 bg-cyan-500/20';
      case 'advanced':
      case 'Hard':
        return 'text-orange-400 bg-orange-500/20';
      case 'Very Hard':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-white/60 bg-white/10';
    }
  };

  const fetchUserLessons = async () => {
    if (!user?.id) {
      setError('Please log in to view your lessons');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: LessonsResponse = await api.request(
        `/language/lessons?user_id=${user.id}`
      );
      setLessons(data.data);
      setShowLessons(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    console.log('handleLessonClick called with lessonId:', lessonId);
    // Use the hook to store lesson ID for persistence across language learner module
    selectLesson(lessonId);
    navigate(`/language-learner/dashboard?lesson_id=${lessonId}`);
  };

  const handleBackToLanding = () => {
    setShowLessons(false);
    setLessons([]);
    setError(null);
    // Clear selected lesson when going back to landing
    clearSelectedLesson();
  };

  if (showLessons) {
    const lessonsBreadcrumbItems = [
      { label: 'Home', href: '/dashboard' },
      { label: 'Language Learner', href: '/language-learner', onClick: handleBackToLanding },
      { label: 'Your Lessons', icon: BookOpen }
    ];

    return (
      <>
        <Header />
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={lessonsBreadcrumbItems} />
          </div>
        </div>
        <div className="min-h-screen relative">
          <BackgroundEffects variant="default" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Lessons</h1>
              <p className="text-lg text-white/60">Continue your language learning journey</p>
            </div>

          {/* Error Message */}
          {error && (
            <GlassCard className="mb-6 border-red-500/30 bg-red-500/10">
              <CardContent className="p-4">
                <p className="text-red-300">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchUserLessons} className="mt-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Try Again
                </Button>
              </CardContent>
            </GlassCard>
          )}

          {/* Lessons List */}
          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <GlassCard
                  key={lesson.id}
                  hover={true}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{lesson.title}</h3>
                          <Badge className={getDifficultyColor(lesson.difficulty)}>
                            {lesson.difficulty}
                          </Badge>
                        </div>

                        <p className="text-white/60 mb-4">{lesson.description}</p>

                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lesson.duration_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {lesson.language_code?.toUpperCase() || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {lesson.skill}
                          </div>
                        </div>

                        {lesson.tags && lesson.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {lesson.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                {tag}
                              </Badge>
                            ))}
                            {lesson.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                                +{lesson.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <ArrowRight className="h-5 w-5 text-white/40 ml-4 flex-shrink-0" />
                    </div>
                  </CardContent>
                </GlassCard>
              ))}
            </div>
          ) : (
            !error && (
              <GlassCard className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Lessons Found</h3>
                <p className="text-white/60 mb-6">
                  You don't have any lessons yet. Start by creating your first lesson or going
                  through our onboarding process.
                </p>
                <Button
                  onClick={() => navigate('/language-learner/onboarding')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  Get Started
                </Button>
              </GlassCard>
            )
          )}
        </div>
      </div>
      </>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Language Learner', icon: Languages }
  ];

  return (
    <>
      <Header />

      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="min-h-screen relative">
        <BackgroundEffects variant="default" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-teal-500/30">
              <BookOpen className="h-12 w-12 text-teal-400" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Language Learner</h1>

          <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto">
            Master any language with our scientifically-proven method. Interactive lessons,
            pronunciation practice, and real-world conversations to make learning effective and fun.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/language-learner/onboarding')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-lg px-8 py-3"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={fetchUserLessons}
              disabled={loading}
              className="text-lg px-8 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
            >
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-200">
            <Globe className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">40+</p>
            <p className="text-sm text-muted-foreground">Languages</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-200">
            <Users className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">50M+</p>
            <p className="text-sm text-muted-foreground">Learners</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-200">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">98%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-200">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">1000+</p>
            <p className="text-sm text-muted-foreground">Lessons</p>
          </Card>
        </div> */}

        {/* Popular Languages */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Language</h2>
            <p className="text-white/60">
              Start learning one of our most popular languages
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {languages.map((language) => (
              <GlassCard
                key={language.name}
                hover={true}
                onClick={() => navigate('/language-learner/onboarding')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{language.flag}</div>
                  <h3 className="font-semibold text-white mb-2">{language.name}</h3>
                  <p className="text-sm text-white/60 mb-3">{language.learners} learners</p>
                  <Badge className={`text-xs ${getDifficultyColor(language.difficulty)}`}>
                    {language.difficulty}
                  </Badge>
                </CardContent>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Our comprehensive platform combines proven learning methods with modern technology to
              make language acquisition natural and engaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                hover={true}
                gradient={true}
                onClick={() => navigate('/language-learner/onboarding')}
              >
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-500/20 rounded-lg backdrop-blur-sm">
                      <feature.icon className="h-5 w-5 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Learning Methods */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Four Skills, One Platform</h2>
            <p className="text-white/60">Develop all aspects of language proficiency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningMethods.map((method, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-teal-500/30">
                  <method.icon className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-sm text-white/60">{method.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <GlassCard className="p-8 glow text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-teal-500/30">
                <Trophy className="h-8 w-8 text-teal-400" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Your Language Journey?
              </h2>
              <p className="text-lg text-white/60 mb-6 max-w-2xl mx-auto">
                Join millions of learners who have successfully mastered new languages. Start your
                personalized journey today with our guided onboarding process.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/language-learner/onboarding')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Learning
              </Button>

              <Button size="lg" variant="outline" onClick={fetchUserLessons} disabled={loading} className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30">
                <BookOpen className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Continue Learning'}
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
    </>
  );
};

export default LanguageLearnerLanding;
