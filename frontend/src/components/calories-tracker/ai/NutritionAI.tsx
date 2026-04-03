import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import caloriesApi from '../../../services/caloriesApi';
import { useAuth } from '../../../contexts/AuthContext';
import { Skeleton } from '../../ui/skeleton';

interface NutritionRecommendation {
  id: string;
  type: 'improvement' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'calories' | 'protein' | 'carbs' | 'fat' | 'water' | 'general';
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PersonalizedInsight {
  trend: 'improving' | 'stable' | 'declining';
  message: string;
  percentage: number;
  timeframe: string;
}

interface NutritionScore {
  overall: number;
  categories: {
    calories: number;
    macros: number;
    hydration: number;
    consistency: number;
    variety: number;
  };
}

interface NutritionAIProps {
  onActionClick?: (action: string) => void;
  className?: string;
}

const NutritionAI: React.FC<NutritionAIProps> = ({ onActionClick, className }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<NutritionRecommendation[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight | null>(null);
  const [nutritionScore, setNutritionScore] = useState<NutritionScore | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (isAuthenticated) {
      fetchAIRecommendations();
    }
  }, [isAuthenticated]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      const [recommendationsData, insightsData] = await Promise.all([
        caloriesApi.getNutritionRecommendations(),
        caloriesApi.getPersonalizedInsights()
      ]);

      // Transform API data to component format
      if (recommendationsData) {
        // Ensure recommendations is an array
        const recs = Array.isArray(recommendationsData.recommendations)
          ? recommendationsData.recommendations
          : [];
        setRecommendations(recs);
        setNutritionScore(recommendationsData.nutritionScore || null);
      }

      if (insightsData) {
        setInsights(insightsData.insights || null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
      // Set empty recommendations on error
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Removed mock data function - recommendations should come from API only

  const getRecommendationIcon = (type: NutritionRecommendation['type']) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      case 'achievement':
        return <Target className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: NutritionRecommendation['type']) => {
    switch (type) {
      case 'improvement':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'warning':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'tip':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'achievement':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    }
  };

  const getImpactBadgeVariant = (impact: NutritionRecommendation['impact']): 'destructive' | 'secondary' | 'outline' => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Nutrition Assistant</h3>
              <p className="text-sm text-muted-foreground">Personalized recommendations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAIRecommendations}
            className="text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Nutrition Score */}
        {nutritionScore && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Nutrition Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(nutritionScore.overall)}`}>
                {nutritionScore.overall}%
              </span>
            </div>
            <Progress value={nutritionScore.overall} className="h-2 mb-4" />
            <div className="grid grid-cols-5 gap-2 text-xs">
              {Object.entries(nutritionScore.categories).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className={`font-medium ${getScoreColor(score)}`}>{score}%</div>
                  <div className="text-muted-foreground capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm">
                {insights.message}{' '}
                <span className={`font-semibold ${insights.trend === 'improving' ? 'text-green-600' : insights.trend === 'declining' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {insights.percentage}%
                </span>{' '}
                {insights.timeframe}
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => {
              // Validate recommendation structure to prevent rendering errors
              const title = typeof rec.title === 'string' ? rec.title : String(rec.title || 'Recommendation');
              const description = typeof rec.description === 'string' ? rec.description : String(rec.description || '');
              const impact = typeof rec.impact === 'string' ? rec.impact : 'low';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border ${rec.type === 'warning' ? 'border-orange-200 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-md ${getRecommendationColor(rec.type)}`}>
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{title}</h4>
                        <Badge variant={getImpactBadgeVariant(impact as NutritionRecommendation['impact'])} className="text-xs">
                          {impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      {rec.actionable && rec.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={rec.action.onClick}
                          className="h-8 px-3 text-primary hover:text-primary"
                        >
                          {rec.action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recommendations available at this time</p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
};

export default NutritionAI;