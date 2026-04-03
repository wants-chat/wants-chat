/**
 * AI Service
 * Handles all AI-powered features and content generation API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface AIRequest {
  type: string;
  prompt: string;
  options?: Record<string, any>;
  context?: Record<string, any>;
}

export interface AIResponse<T = any> {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: T;
  error?: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    model: string;
    confidence?: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface WorkoutRecommendation {
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Array<{
    name: string;
    sets: number;
    reps: number | string;
    description: string;
    targetMuscles: string[];
  }>;
  tips: string[];
  equipment: string[];
  calories: number;
}

export interface MealPlan {
  name: string;
  description: string;
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    description: string;
    ingredients: Array<{
      name: string;
      amount: string;
      calories: number;
    }>;
    instructions: string[];
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    prepTime: number;
    cookTime: number;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  shoppingList: Array<{
    item: string;
    quantity: string;
    category: string;
  }>;
}

export interface BudgetAdvice {
  analysis: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
    topExpenseCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  recommendations: Array<{
    category: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    potentialSavings: number;
  }>;
  optimizations: Array<{
    title: string;
    description: string;
    actionItems: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
  budgetPlan: {
    categories: Array<{
      name: string;
      recommended: number;
      current: number;
      difference: number;
    }>;
    monthlyGoals: Array<{
      goal: string;
      target: number;
      timeline: string;
    }>;
  };
}

export interface TravelItinerary {
  destination: {
    name: string;
    country: string;
    description: string;
  };
  duration: number;
  budget: {
    total: number;
    breakdown: {
      accommodation: number;
      food: number;
      activities: number;
      transportation: number;
      miscellaneous: number;
    };
  };
  itinerary: Array<{
    day: number;
    date: string;
    activities: Array<{
      time: string;
      name: string;
      description: string;
      duration: number;
      cost: number;
      location: string;
      category: string;
    }>;
  }>;
  recommendations: {
    accommodation: Array<{
      name: string;
      type: string;
      priceRange: string;
      rating: number;
      description: string;
    }>;
    restaurants: Array<{
      name: string;
      cuisine: string;
      priceRange: string;
      rating: number;
      description: string;
    }>;
    tips: string[];
    localInfo: {
      currency: string;
      language: string;
      timeZone: string;
      climate: string;
      customs: string[];
    };
  };
}

export interface MeditationProgram {
  name: string;
  description: string;
  duration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessions: Array<{
    day: number;
    title: string;
    type: 'guided' | 'breathing' | 'mindfulness' | 'body_scan' | 'loving_kindness';
    duration: number; // minutes
    instructions: string[];
    focus: string;
    benefits: string[];
  }>;
  goals: string[];
  expectedBenefits: string[];
  tips: string[];
}

export interface HealthInsights {
  analysis: {
    overallScore: number; // 1-10
    trends: Array<{
      metric: string;
      trend: 'improving' | 'stable' | 'declining';
      change: number;
      significance: 'low' | 'medium' | 'high';
    }>;
    correlations: Array<{
      metric1: string;
      metric2: string;
      correlation: number;
      insight: string;
    }>;
  };
  recommendations: Array<{
    category: 'nutrition' | 'exercise' | 'sleep' | 'stress' | 'medical';
    title: string;
    description: string;
    actionItems: string[];
    priority: 'low' | 'medium' | 'high';
    expectedImpact: string;
  }>;
  alerts: Array<{
    type: 'warning' | 'info' | 'critical';
    message: string;
    metric: string;
    value: number;
    normalRange: string;
    recommendation: string;
  }>;
  goals: Array<{
    title: string;
    target: number;
    current: number;
    timeline: string;
    steps: string[];
  }>;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title?: string;
  context: 'general' | 'health' | 'fitness' | 'finance' | 'travel' | 'meditation' | 'productivity';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    tokens: number;
    model: string;
    confidence?: number;
    sources?: string[];
  };
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  requestsByType: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
  currentMonthUsage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  limits: {
    monthlyRequests: number;
    monthlyTokens: number;
    remainingRequests: number;
    remainingTokens: number;
  };
}

class AIService {
  /**
   * Generate AI content based on type and prompt
   */
  async generateContent<T = any>(type: string, prompt: string, options?: Record<string, any>): Promise<AIResponse<T>> {
    try {
      return await api.generateContent(type, prompt, options);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_CONTENT_GENERATION_FAILED'
      );
    }
  }

  /**
   * Get AI request status and result
   */
  async getAIRequest(id: string): Promise<AIResponse> {
    try {
      return await api.request(`/ai/requests/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_REQUEST_FETCH_FAILED'
      );
    }
  }

  /**
   * Generate personalized workout recommendations
   */
  async generateWorkoutRecommendation(preferences: {
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    goals?: string[];
    duration?: number;
    equipment?: string[];
    bodyParts?: string[];
    workoutType?: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  }): Promise<WorkoutRecommendation> {
    try {
      const response = await this.generateContent<WorkoutRecommendation>(
        'workout_recommendation',
        'Generate a personalized workout recommendation',
        preferences
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_RECOMMENDATION_FAILED'
      );
    }
  }

  /**
   * Generate personalized meal plan
   */
  async generateMealPlan(preferences: {
    calorieTarget?: number;
    dietType?: 'balanced' | 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean';
    allergies?: string[];
    dislikes?: string[];
    mealCount?: number;
    cookingTime?: number;
    budget?: 'low' | 'medium' | 'high';
  }): Promise<MealPlan> {
    try {
      const response = await this.generateContent<MealPlan>(
        'meal_plan',
        'Generate a personalized meal plan',
        preferences
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEAL_PLAN_GENERATION_FAILED'
      );
    }
  }

  /**
   * Get AI-powered budget advice
   */
  async getBudgetAdvice(financialData: {
    income: number;
    expenses: Array<{ category: string; amount: number }>;
    goals?: Array<{ type: string; target: number; timeline: string }>;
    riskTolerance?: 'low' | 'medium' | 'high';
  }): Promise<BudgetAdvice> {
    try {
      const response = await this.generateContent<BudgetAdvice>(
        'budget_advice',
        'Analyze financial data and provide budget recommendations',
        financialData
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGET_ADVICE_FAILED'
      );
    }
  }

  /**
   * Generate travel itinerary
   */
  async generateTravelItinerary(preferences: {
    destination: string;
    duration: number;
    budget: number;
    travelers: number;
    interests: string[];
    travelStyle: 'budget' | 'mid-range' | 'luxury';
    pace: 'relaxed' | 'moderate' | 'packed';
  }): Promise<TravelItinerary> {
    try {
      const response = await this.generateContent<TravelItinerary>(
        'travel_itinerary',
        'Generate a detailed travel itinerary',
        preferences
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_ITINERARY_FAILED'
      );
    }
  }

  /**
   * Generate personalized meditation program
   */
  async generateMeditationProgram(preferences: {
    experience?: 'beginner' | 'intermediate' | 'advanced';
    duration?: number; // days
    focus?: 'stress' | 'sleep' | 'focus' | 'anxiety' | 'general';
    sessionLength?: number; // minutes
    style?: 'guided' | 'silent' | 'mixed';
  }): Promise<MeditationProgram> {
    try {
      const response = await this.generateContent<MeditationProgram>(
        'meditation_program',
        'Generate a personalized meditation program',
        preferences
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEDITATION_PROGRAM_FAILED'
      );
    }
  }

  /**
   * Get health insights from user data
   */
  async getHealthInsights(healthData: {
    metrics: Array<{ type: string; value: number; date: string }>;
    goals?: Array<{ type: string; target: number }>;
    lifestyle?: {
      activity: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
      sleep: number;
      stress: number;
    };
  }): Promise<HealthInsights> {
    try {
      const response = await this.generateContent<HealthInsights>(
        'health_insights',
        'Analyze health data and provide insights',
        healthData
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'HEALTH_INSIGHTS_FAILED'
      );
    }
  }

  /**
   * Start a chat conversation
   */
  async startChatConversation(context: string, initialMessage?: string): Promise<ChatConversation> {
    try {
      return await api.request('/ai/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ context, initialMessage }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CHAT_CONVERSATION_START_FAILED'
      );
    }
  }

  /**
   * Send message in chat conversation
   */
  async sendChatMessage(conversationId: string, message: string): Promise<ChatMessage> {
    try {
      return await api.request(`/ai/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CHAT_MESSAGE_SEND_FAILED'
      );
    }
  }

  /**
   * Get chat conversations
   */
  async getChatConversations(params?: { page?: number; limit?: number; context?: string }): Promise<{ data: ChatConversation[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = params ? Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ) : {};
      const response = await api.request(`/ai/chat/conversations${params ? `?${new URLSearchParams(queryParams).toString()}` : ''}`);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.conversations) {
        return {
          data: response.conversations,
          total: response.total || response.conversations.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CHAT_CONVERSATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get chat conversation by ID
   */
  async getChatConversation(id: string): Promise<ChatConversation> {
    try {
      return await api.request(`/ai/chat/conversations/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CHAT_CONVERSATION_FETCH_FAILED'
      );
    }
  }

  /**
   * Delete chat conversation
   */
  async deleteChatConversation(id: string): Promise<void> {
    try {
      await api.request(`/ai/chat/conversations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CHAT_CONVERSATION_DELETE_FAILED'
      );
    }
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(): Promise<AIUsageStats> {
    try {
      return await api.request('/ai/usage');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'AI_USAGE_STATS_FAILED'
      );
    }
  }

  /**
   * Analyze text content (sentiment, keywords, etc.)
   */
  async analyzeText(text: string, analysisType: 'sentiment' | 'keywords' | 'summary' | 'all'): Promise<{
    sentiment?: { score: number; label: 'positive' | 'negative' | 'neutral'; confidence: number };
    keywords?: Array<{ word: string; score: number; category?: string }>;
    summary?: string;
    wordCount?: number;
    readingTime?: number; // minutes
  }> {
    try {
      const response = await this.generateContent(
        'text_analysis',
        'Analyze the provided text',
        { text, analysisType }
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TEXT_ANALYSIS_FAILED'
      );
    }
  }

  /**
   * Get smart suggestions based on user data
   */
  async getSmartSuggestions(context: {
    module: 'health' | 'fitness' | 'finance' | 'travel' | 'meditation' | 'general';
    userData: Record<string, any>;
    preferences?: Record<string, any>;
  }): Promise<Array<{
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
    confidence: number;
  }>> {
    try {
      const response = await this.generateContent(
        'smart_suggestions',
        'Generate smart suggestions based on user data',
        context
      );
      return response.result!;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SMART_SUGGESTIONS_FAILED'
      );
    }
  }
}

export const aiService = new AIService();