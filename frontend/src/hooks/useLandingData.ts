import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface LandingApp {
  id: string;
  name: string;
  icon: string;
  link: string;
  description: string;
  color: string;
}

interface LandingCategory {
  category: string;
  apps: LandingApp[];
}

interface LandingHero {
  title: string;
  subtitle: string;
  features: string[];
}

interface LandingStats {
  totalUsers: string;
  activeFeatures: string;
  dataProcessed: string;
  satisfaction: string;
}

interface LandingFeature {
  title: string;
  description: string;
  icon: string;
}

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended: boolean;
}

interface LandingPageData {
  hero: LandingHero;
  apps: LandingCategory[];
  stats: LandingStats;
  features: LandingFeature[];
  pricing: PricingPlan[];
}

export const useLandingData = () => {
  const [data, setData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const data = await api.request('/landing/data');
        setData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch landing page data:', err);
        setError(err.message || 'Failed to load landing page data');
        // Set default data as fallback
        setData({
          hero: {
            title: 'Your Complete Life Management System',
            subtitle: 'Manage health, fitness, finance, and more in one place',
            features: [
              'AI-Powered Insights',
              'Real-time Tracking',
              'Personalized Recommendations',
              'Privacy-First Approach'
            ]
          },
          apps: [
            {
              category: 'Finance & Nutrition',
              apps: [
                {
                  id: 'money-management',
                  name: 'Money Management',
                  icon: 'AttachMoney',
                  link: '/expense-tracker',
                  description: 'Track expenses and manage budgets',
                  color: '#10b981'
                },
                {
                  id: 'nutrition-tracker',
                  name: 'AI Nutrition Tracker',
                  icon: 'Restaurant',
                  link: '/calories-tracker',
                  description: 'Track calories and nutrition with AI',
                  color: '#f97316'
                }
              ]
            },
            {
              category: 'Fitness & Health',
              apps: [
                {
                  id: 'workout-planner',
                  name: 'AI Workout Planner',
                  icon: 'FitnessCenter',
                  link: '/fitness',
                  description: 'Personalized workout plans',
                  color: '#3b82f6'
                },
                {
                  id: 'health-fitness',
                  name: 'Health & Fitness',
                  icon: 'Favorite',
                  link: '/health',
                  description: 'Track health metrics and records',
                  color: '#ec4899'
                }
              ]
            },
            {
              category: 'Mental Wellness',
              apps: [
                {
                  id: 'meditation-guide',
                  name: 'AI Meditation Guide',
                  icon: 'SelfImprovement',
                  link: '/meditation',
                  description: 'Guided meditation sessions',
                  color: '#a855f7'
                },
                {
                  id: 'mental-health',
                  name: 'AI Mental Health Journal',
                  icon: 'Psychology',
                  link: '/mental-health',
                  description: 'Track mood and mental wellness',
                  color: '#14b8a6'
                }
              ]
            },
            {
              category: 'Travel Planning',
              apps: [
                {
                  id: 'travel-planner',
                  name: 'AI Travel Planner',
                  icon: 'FlightTakeoff',
                  link: '/travel-planner',
                  description: 'Plan trips with AI assistance',
                  color: '#0ea5e9'
                },
                {
                  id: 'expense-tracker-travel',
                  name: 'Expense Tracker',
                  icon: 'Receipt',
                  link: '/expense-tracker',
                  description: 'Track travel expenses',
                  color: '#6366f1'
                }
              ]
            }
          ],
          stats: {
            totalUsers: '10,000+',
            activeFeatures: '12',
            dataProcessed: '1M+',
            satisfaction: '98%'
          },
          features: [
            {
              title: 'All-in-One Platform',
              description: 'Manage every aspect of your life from a single dashboard',
              icon: 'Dashboard'
            },
            {
              title: 'AI-Powered',
              description: 'Get intelligent insights and recommendations',
              icon: 'AutoAwesome'
            },
            {
              title: 'Privacy First',
              description: 'Your data is encrypted and never shared',
              icon: 'Lock'
            },
            {
              title: 'Real-time Sync',
              description: 'Access your data from any device, anywhere',
              icon: 'Sync'
            }
          ],
          pricing: [
            {
              name: 'Free',
              price: 0,
              period: 'forever',
              features: [
                'Basic health tracking',
                'Up to 3 fitness plans',
                'Budget tracking',
                'Limited AI features'
              ],
              recommended: false
            },
            {
              name: 'Starter',
              price: 5,
              period: 'month',
              features: [
                'Access to 5 apps of choice',
                '10 AI requests per day',
                'Cloud sync across devices',
                'Email support'
              ],
              recommended: false
            },
            {
              name: 'Pro',
              price: 10,
              period: 'month',
              features: [
                'Access to all 70+ apps',
                '20 AI requests per day',
                'Priority email support',
                'Export to PDF/CSV'
              ],
              recommended: true
            },
            {
              name: 'Premium',
              price: 25,
              period: 'month',
              features: [
                'Everything in Pro',
                '100 AI requests per day',
                'Family sharing (5 members)',
                'Priority support for all'
              ],
              recommended: false
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return { data, loading, error };
};

export default useLandingData;