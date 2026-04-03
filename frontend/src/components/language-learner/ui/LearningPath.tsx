import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle, Circle, Star, BookOpen, Target, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import ProgressRing from './ProgressRing';

interface Skill {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basics' | 'grammar' | 'vocabulary' | 'conversation' | 'culture';
  level: number;
  totalLessons: number;
  completedLessons: number;
  xpReward: number;
  isLocked: boolean;
  prerequisiteIds: string[];
  estimatedTime: number; // in minutes
}

interface LearningPathProps {
  skills: Skill[];
  currentLevel: number;
  totalXP: number;
  onSkillSelect?: (skillId: string) => void;
  onStartLesson?: (skillId: string) => void;
  className?: string;
}

const LearningPath: React.FC<LearningPathProps> = ({
  skills,
  currentLevel,
  totalXP,
  onSkillSelect,
  onStartLesson,
  className = ''
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'path' | 'grid'>('path');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-blue-500';
      case 'grammar': return 'bg-purple-500';
      case 'vocabulary': return 'bg-emerald-500';
      case 'conversation': return 'bg-orange-500';
      case 'culture': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-5 w-5" />;
      case 'grammar': return <Target className="h-5 w-5" />;
      case 'vocabulary': return <Zap className="h-5 w-5" />;
      case 'conversation': return <TrendingUp className="h-5 w-5" />;
      case 'culture': return <Star className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  const getSkillProgress = (skill: Skill) => {
    return skill.totalLessons > 0 
      ? Math.round((skill.completedLessons / skill.totalLessons) * 100)
      : 0;
  };

  const handleSkillClick = (skillId: string) => {
    setSelectedSkill(skillId);
    onSkillSelect?.(skillId);
  };

  const renderSkillCard = (skill: Skill) => {
    const progress = getSkillProgress(skill);
    const isCompleted = progress === 100;
    const isInProgress = progress > 0 && progress < 100;

    return (
      <Card
        key={skill.id}
        className={`relative transition-all duration-300 cursor-pointer hover:shadow-lg ${
          skill.isLocked ? 'opacity-60' : ''
        } ${selectedSkill === skill.id ? 'ring-2 ring-[#47bdff]' : ''}`}
        onClick={() => !skill.isLocked && handleSkillClick(skill.id)}
      >
        {skill.isLocked && (
          <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 rounded-lg flex items-center justify-center z-10">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(skill.category)} bg-opacity-10`}>
                <div className={`${getCategoryColor(skill.category)} bg-opacity-100 text-white p-1 rounded`}>
                  {getCategoryIcon(skill.category)}
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">{skill.title}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  Level {skill.level}
                </Badge>
              </div>
            </div>
            {isCompleted && (
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {skill.description}
          </p>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{skill.completedLessons}/{skill.totalLessons} lessons</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-400">
                  <Trophy className="h-4 w-4 inline mr-1 text-yellow-500" />
                  {skill.xpReward} XP
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <Circle className="h-4 w-4 inline mr-1" />
                  {skill.estimatedTime} min
                </span>
              </div>
            </div>

            {/* Action Button */}
            {!skill.isLocked && (
              <Button
                size="sm"
                className="w-full"
                variant={isCompleted ? "outline" : isInProgress ? "default" : "secondary"}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartLesson?.(skill.id);
                }}
              >
                {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPathView = () => {
    const skillsByLevel = skills.reduce((acc, skill) => {
      if (!acc[skill.level]) {
        acc[skill.level] = [];
      }
      acc[skill.level].push(skill);
      return acc;
    }, {} as Record<number, Skill[]>);

    return (
      <div className="space-y-12">
        {Object.entries(skillsByLevel)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, levelSkills]) => (
            <div key={level} className="relative">
              {/* Level Header */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <div className="px-4">
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    Level {level}
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelSkills.map(renderSkillCard)}
              </div>

              {/* Connecting Line */}
              {Number(level) < Math.max(...skills.map(s => s.level)) && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700" 
                     style={{ bottom: '-3rem' }} />
              )}
            </div>
          ))}
      </div>
    );
  };

  const renderGridView = () => {
    const categories = ['basics', 'grammar', 'vocabulary', 'conversation', 'culture'];
    
    return (
      <div className="space-y-8">
        {categories.map(category => {
          const categorySkills = skills.filter(s => s.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(category)} bg-opacity-10 mr-3`}>
                  <div className={`${getCategoryColor(category)} bg-opacity-100 text-white p-1 rounded`}>
                    {getCategoryIcon(category)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                <Badge variant="secondary" className="ml-3">
                  {categorySkills.length} skills
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map(renderSkillCard)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Learning Path</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Complete skills to unlock new lessons and earn XP
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <ProgressRing
                  progress={(skills.filter(s => getSkillProgress(s) === 100).length / skills.length) * 100}
                  size={80}
                  strokeWidth={6}
                  showPercentage={false}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Overall Progress
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#47bdff]">{totalXP}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{currentLevel}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          <Button
            variant={viewMode === 'path' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('path')}
          >
            Path View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Category View
          </Button>
        </div>
      </div>

      {/* Skills Display */}
      {viewMode === 'path' ? renderPathView() : renderGridView()}
    </div>
  );
};

export default LearningPath;