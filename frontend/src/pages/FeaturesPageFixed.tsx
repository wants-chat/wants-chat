import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';

// Product Icons
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import TranslateIcon from '@mui/icons-material/Translate';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ArticleIcon from '@mui/icons-material/Article';

const FeaturesPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Handle scroll to section based on hash
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.substring(1); // Remove the # character
      const element = document.getElementById(elementId);
      if (element) {
        // Delay to ensure page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  const products = [
    {
      id: 'fitness-tracker',
      name: 'Fitness Tracker Pro',
      category: 'Health & Fitness',
      status: 'Available',
      routes: 8,
      icon: FitnessCenterIcon,
      color: 'from-orange-500 to-red-500',
      route: '/fitness',
      tagline: 'Transform your fitness journey with AI-powered workout planning',
      description: 'Complete fitness ecosystem with personalized onboarding, custom workout builder, real-time session tracking, BMI calculator, and comprehensive progress analytics with achievement system.',
      keyFeatures: [
        'Custom Workout Builder',
        'Real-time Session Tracking', 
        'Progress Analytics & BMI'
      ],
      technologies: ['React', 'Chart.js', 'Local Storage', 'Framer Motion', 'Responsive Design'],
      videoId: 'ScMzIvxBSi4', // Fitness app demo video
      detailedFeatures: [
        {
          title: 'Personalized Onboarding',
          description: 'Smart fitness assessment with goal-based recommendations',
          capabilities: ['Fitness assessment', 'Goal setting', 'Equipment selection', 'Experience level']
        },
        {
          title: 'Custom Workout Builder',
          description: 'Create personalized workout plans with intelligent suggestions',
          capabilities: ['Drag-drop builder', 'Exercise library', 'Auto-scheduling', 'Rest day planning']
        },
        {
          title: 'Live Workout Tracking',
          description: 'Real-time session monitoring with interactive timer',
          capabilities: ['Set completion', 'Rest timer', 'Weight tracking', 'Form tips']
        },
        {
          title: 'Progress Analytics',
          description: 'Comprehensive performance tracking with visual insights',
          capabilities: ['BMI calculator', 'Body measurements', 'Strength gains', 'Achievement badges']
        },
        {
          title: 'Exercise Database',
          description: 'Extensive library with detailed instructions and variations',
          capabilities: ['100+ exercises', 'Video guides', 'Muscle groups', 'Difficulty levels']
        }
      ],
      screenshots: []
    },
    {
      id: 'health-tracker',
      name: 'Health Tracker Pro',
      category: 'Medical & Wellness',
      status: 'Available',
      routes: 16,
      icon: LocalHospitalIcon,
      color: 'from-blue-500 to-cyan-500',
      route: '/health',
      tagline: 'Comprehensive healthcare management with specialized care modules',
      description: 'Complete health platform with medical records, prescription management, vital signs monitoring (BP, sugar, heart rate, weight), pregnancy tracking, chronic condition management, and doctor appointments.',
      keyFeatures: [
        'Medical Records & Prescriptions',
        'Pregnancy & Chronic Care',
        'Vital Signs Monitoring'
      ],
      technologies: ['React', 'Secure Storage', 'Medical Data Visualization', 'HIPAA Compliance', 'Chart.js'],
      videoId: 'QcIy9NiNbmo', // Health tracking app demo
      detailedFeatures: [
        {
          title: 'Medical Records Management',
          description: 'Secure digital storage for all health documents',
          capabilities: ['Document upload', 'Prescription storage', 'Test results', 'Medical history']
        },
        {
          title: 'Prescription Tracker',
          description: 'Smart medication management with automated reminders',
          capabilities: ['Dosage schedules', 'Refill alerts', 'Interaction warnings', 'Adherence tracking']
        },
        {
          title: 'Vital Signs Dashboard',
          description: 'Comprehensive health metrics with trend analysis',
          capabilities: ['Blood pressure tracking', 'Heart rate monitoring', 'Weight progression', 'Blood sugar levels']
        },
        {
          title: 'Specialized Care Modules',
          description: 'Dedicated tracking for specific health needs',
          capabilities: ['Pregnancy tracking', 'Chronic conditions', 'Emergency contacts', 'Care plan customization']
        },
        {
          title: 'Appointment Management',
          description: 'Complete healthcare scheduling and tracking system',
          capabilities: ['Doctor appointments', 'Visit history', 'Medical notes', 'Follow-up reminders']
        }
      ],
      screenshots: []
    },
    {
      id: 'meditation',
      name: 'Meditation & Mindfulness',
      category: 'Mental Wellness',
      status: 'Available', 
      routes: 5,
      icon: SelfImprovementIcon,
      color: 'from-teal-500 to-pink-500',
      route: '/meditation',
      tagline: 'Interactive meditation wheel with 150+ guided sessions',
      description: 'Unique circular wheel interface with 150+ guided meditations across categories like Sleep, SOS, Commute, and Work. Features breathing exercises, sleep stories, ambient sounds, and streak tracking.',
      keyFeatures: [
        '150+ Guided Meditations',
        'Breathing Exercises',
        'Streak & Progress Tracking'
      ],
      technologies: ['React', 'Audio API', 'Circular UI Components', 'Progress Analytics'],
      videoId: 'inpok4MKVLM', // Meditation app demo
      detailedFeatures: [
        {
          title: 'Interactive Meditation Wheel',
          description: 'Unique circular interface for intuitive session selection',
          capabilities: ['10 categories', 'Visual navigation', 'Quick access', 'Mood-based selection']
        },
        {
          title: '150+ Guided Sessions',
          description: 'Extensive library covering all life situations',
          capabilities: ['Sleep sessions', 'SOS calm', 'Work focus', 'Commute peace']
        },
        {
          title: 'Structured Series Programs',
          description: '6 comprehensive meditation programs',
          capabilities: ['7 Days of Calm', 'Sleep Better', 'Stress Management', 'Focus Enhancement']
        },
        {
          title: 'Advanced Progress Tracking',
          description: 'Detailed analytics with streak counting',
          capabilities: ['Session completion', 'Streak counters', 'Practice time', 'Level progression']
        }
      ],
      screenshots: []
    },
    {
      id: 'calories-tracker',
      name: 'Calories Tracker Pro',
      category: 'Health & Nutrition',
      status: 'Available',
      routes: 11,
      icon: RestaurantIcon,
      color: 'from-green-500 to-emerald-500',
      route: '/calories-tracker',
      tagline: 'Advanced nutrition tracking with intermittent fasting support',
      description: 'Complete nutrition platform with food database, barcode scanner, macro/calorie tracking, water intake monitoring, and 5 intermittent fasting plans with live timer and pause/resume functionality.',
      keyFeatures: [
        'Food Database & Barcode Scanner',
        'Intermittent Fasting Timer',
        'Macro & Calorie Tracking'
      ],
      technologies: ['React', 'Chart Visualization', 'Food API Integration', 'Timer System'],
      videoId: '9bZkp7q19f0', // Nutrition tracking demo
      detailedFeatures: [
        {
          title: 'Comprehensive Food Database',
          description: '50,000+ food items with detailed nutritional information',
          capabilities: ['Branded products', 'Restaurant menus', 'Custom food creation', 'Recipe database']
        },
        {
          title: 'Smart Macro Tracking',
          description: 'Detailed protein, carbs, and fat monitoring with visual rings',
          capabilities: ['Visual macro rings', 'Goal-based targets', 'BMR/TDEE calculation', 'Micro-nutrients']
        },
        {
          title: 'Intermittent Fasting Timer',
          description: 'Multiple fasting plans with live countdown timers',
          capabilities: ['16:8 protocol', '18:6 advanced fasting', 'OMAD support', 'Custom windows']
        },
        {
          title: 'Meal Planning System',
          description: 'Complete meal recommendations and planning tools',
          capabilities: ['Daily suggestions', 'Restaurant recommendations', 'Recipe suggestions', 'Grocery lists']
        }
      ],
      screenshots: []
    },
    {
      id: 'expense-tracker',
      name: 'Expense Tracker Pro',
      category: 'Finance & Productivity',
      status: 'Available',
      routes: 2,
      icon: AccountBalanceWalletIcon,
      color: 'from-emerald-500 to-teal-500',
      route: '/expense-tracker',
      tagline: 'Smart expense tracking with visual analytics',
      description: 'Financial management platform with expense categorization, payment method tracking, monthly budget limits, visual analytics with charts, advanced search/filtering, and CSV export for tax reporting.',
      keyFeatures: [
        'Budget Management & Alerts',
        'Visual Analytics Dashboard',
        'CSV Export for Reports'
      ],
      technologies: ['React', 'Recharts', 'CSV Export', 'Material-UI', 'Financial Analytics'],
      videoId: 'Nw-ksH3424I', // Finance tracking demo
      detailedFeatures: [
        {
          title: 'Advanced Analytics Dashboard',
          description: 'Professional financial visualization with Recharts',
          capabilities: ['Pie chart breakdowns', 'Daily spending trends', '14-day visualization', 'Category analysis']
        },
        {
          title: 'Smart Budget Management',
          description: 'Category-specific budgets with intelligent alerts',
          capabilities: ['Monthly budget setting', 'Category limits', 'Over-budget warnings', 'Progress tracking']
        },
        {
          title: 'Expense Organization',
          description: '10+ categories with smart payment method tracking',
          capabilities: ['Auto-categorization', 'Receipt management', 'Payment methods', 'Quick entry']
        },
        {
          title: 'Professional Reporting',
          description: 'Comprehensive export and analysis capabilities',
          capabilities: ['CSV export', 'Custom date ranges', 'Spending insights', 'Trend analysis']
        }
      ],
      screenshots: []
    },
    {
      id: 'travel-planner',
      name: 'AI Travel Planner',
      category: 'Travel & Lifestyle',
      status: 'Available',
      routes: 2,
      icon: FlightTakeoffIcon,
      color: 'from-indigo-500 to-teal-500',
      route: '/travel-planner',
      tagline: '3D interactive globe with AI-powered travel planning',
      description: 'Revolutionary travel planner with 3D interactive globe, AI-generated itineraries, hotel recommendations, categorized activity planning, real-time budget tracking, and comprehensive trip history management.',
      keyFeatures: [
        '3D Interactive Globe',
        'AI Itinerary Generation',
        'Smart Budget Tracking'
      ],
      technologies: ['React', 'Three.js', 'Google Maps API', 'Chart.js', 'AI Integration'],
      videoId: 'tgbNymZ7vqY', // Travel planning demo
      detailedFeatures: [
        {
          title: '3D Interactive Globe',
          description: 'Three.js powered Earth visualization with NASA imagery',
          capabilities: ['NASA Earth imagery', 'Country selection', 'Auto-rotation', 'Zoom & pan controls']
        },
        {
          title: 'AI Trip Generation',
          description: 'Smart itinerary creation for 8+ major destinations',
          capabilities: ['Paris, Tokyo, Bali, NYC', 'Budget/Luxury styles', 'Cultural experiences', 'Local recommendations']
        },
        {
          title: 'Smart Itineraries',
          description: 'Day-by-day detailed trip planning with integrations',
          capabilities: ['Activity scheduling', 'Restaurant bookings', 'Hotel recommendations', 'Google Maps integration']
        },
        {
          title: 'Travel Management',
          description: 'Complete trip organization with smart notifications',
          capabilities: ['30-day countdown', 'Budget tracking', 'Expense monitoring', 'Travel alerts']
        }
      ],
      screenshots: []
    },
    // Coming Soon Products
    {
      id: 'language-learning',
      name: 'Language Learning Hub',
      category: 'Education & Growth',
      status: 'Available',
      routes: 8,
      icon: TranslateIcon,
      color: 'from-yellow-500 to-orange-500',
      route: '/language-learner',
      tagline: 'Master new languages with AI-powered learning paths',
      description: 'Comprehensive language learning platform with personalized courses, pronunciation practice, and cultural immersion experiences.',
      keyFeatures: [
        'Multi-Language Courses',
        'AI Pronunciation Coach',
        'Cultural Immersion'
      ],
      technologies: ['React', 'Speech Recognition API', 'AI/ML Integration', 'Real-time Chat'],
      videoId: 'VQVyHJHb2kA', // Language learning demo
      detailedFeatures: [
        {
          title: 'Multi-Language Courses',
          description: 'Comprehensive learning paths for 15+ languages',
          capabilities: ['Spanish, French, German', 'Beginner to advanced', 'Cultural context', 'Native speaker content']
        },
        {
          title: 'AI Pronunciation Coach',
          description: 'Real-time speech analysis and feedback',
          capabilities: ['Voice recognition', 'Pronunciation scoring', 'Accent improvement', 'Speaking confidence']
        },
        {
          title: 'Interactive Learning Games',
          description: 'Gamified language acquisition system',
          capabilities: ['Vocabulary challenges', 'Grammar puzzles', 'Listening comprehension', 'Cultural trivia']
        }
      ],
      screenshots: []
    },
    {
      id: 'habit-tracker',
      name: 'Habit Tracker Pro',
      category: 'Personal Development',
      status: 'Available',
      routes: 4,
      icon: TrackChangesIcon,
      color: 'from-pink-500 to-rose-500',
      route: '/habit-planner',
      tagline: 'Build lasting habits with smart tracking and analytics',
      description: 'Advanced habit formation platform with streak tracking, goal setting, behavioral analytics, and personalized coaching.',
      keyFeatures: [
        'Smart Habit Creation',
        'Advanced Streak Tracking',
        'Behavioral Analytics'
      ],
      technologies: ['React', 'Push Notifications', 'Analytics Engine', 'Social Features'],
      videoId: 'UyQ4HqePqsE', // Habit tracking demo
      detailedFeatures: [
        {
          title: 'Smart Habit Creation',
          description: 'AI-powered habit suggestions and customization',
          capabilities: ['Pre-built templates', 'Custom habit creation', 'Frequency customization', 'Difficulty scaling']
        },
        {
          title: 'Advanced Streak Tracking',
          description: 'Visual streak management with recovery options',
          capabilities: ['Daily streak counters', 'Longest streak records', 'Streak freeze options', 'Recovery strategies']
        },
        {
          title: 'Behavioral Analytics',
          description: 'Deep insights into habit patterns and triggers',
          capabilities: ['Success rate analysis', 'Trigger identification', 'Pattern recognition', 'Behavioral insights']
        }
      ],
      screenshots: []
    },
    {
      id: 'recipe-builder',
      name: 'Recipe Builder Pro',
      category: 'Cooking & Nutrition',
      status: 'Available',
      routes: 4,
      icon: MenuBookIcon,
      color: 'from-yellow-500 to-orange-500',
      route: '/recipe-builder',
      tagline: 'Create & organize recipes with comprehensive dashboard and meal planning',
      description: 'Complete recipe management platform with custom recipe creator, ingredient management, shopping lists, meal planning, and AI chat assistance.',
      keyFeatures: [
        'Recipe Dashboard',
        'AI Recipe Chat',
        'Meal Planning'
      ],
      technologies: ['React', 'AI Integration', 'Local Storage', 'Meal Planning Algorithm'],
      users: '8K+',
      videoId: 'dQw4w9WgXcQ',
      detailedFeatures: [
        {
          title: 'Recipe Dashboard',
          description: 'Analytics and collection management',
          capabilities: ['Recipe analytics', 'Collection organization', 'Category management', 'Search & filter']
        },
        {
          title: 'AI Recipe Chat',
          description: 'Get recipe suggestions and cooking tips',
          capabilities: ['Recipe recommendations', 'Cooking assistance', 'Ingredient substitutions', 'Nutrition info']
        },
        {
          title: 'Meal Planning',
          description: 'Weekly meal planning and grocery lists',
          capabilities: ['Weekly plans', 'Shopping lists', 'Nutrition tracking', 'Budget management']
        }
      ],
      screenshots: []
    },
    {
      id: 'currency-converter',
      name: 'Currency Converter Pro',
      category: 'Finance & Tools',
      status: 'Available',
      routes: 1,
      icon: CurrencyExchangeIcon,
      color: 'from-cyan-500 to-cyan-500',
      route: '/currency-exchange',
      tagline: 'Real-time currency exchange with multi-currency support',
      description: 'Fast and accurate currency conversion with real-time exchange rates, conversion history, and favorite currency pairs.',
      keyFeatures: [
        'Real-time Rates',
        'Multi-currency Support',
        'Conversion History'
      ],
      technologies: ['React', 'Exchange Rate API', 'Real-time Updates', 'Local Storage'],
      videoId: 'dQw4w9WgXcQ',
      detailedFeatures: [
        {
          title: 'Real-time Exchange Rates',
          description: 'Live currency rates updated every minute',
          capabilities: ['150+ currencies', 'Auto-refresh', 'Rate alerts', 'Historical data']
        },
        {
          title: 'Conversion History',
          description: 'Track all your currency conversions',
          capabilities: ['Conversion log', 'Export to CSV', 'Date filtering', 'Amount tracking']
        }
      ],
      screenshots: []
    },
    {
      id: 'todo-manager',
      name: 'Todo Manager Pro',
      category: 'Productivity Tools',
      status: 'Available',
      routes: 1,
      icon: CheckBoxIcon,
      color: 'from-cyan-500 to-teal-500',
      route: '/todo',
      tagline: 'Task and project management made simple',
      description: 'Comprehensive task management with priorities, due dates, categories, and completion tracking with analytics.',
      keyFeatures: [
        'Task Organization',
        'Priority Management',
        'Due Date Tracking'
      ],
      technologies: ['React', 'Task Sorting', 'Notifications', 'Local Storage'],
      videoId: 'dQw4w9WgXcQ',
      detailedFeatures: [
        {
          title: 'Task Organization',
          description: 'Organize tasks with categories and tags',
          capabilities: ['Categories', 'Tags', 'Search', 'Filters']
        },
        {
          title: 'Priority Management',
          description: 'Set priorities and track important tasks',
          capabilities: ['Priority levels', 'Urgent tasks', 'Focus mode', 'Quick actions']
        },
        {
          title: 'Completion Analytics',
          description: 'Track your productivity over time',
          capabilities: ['Completion rates', 'Time tracking', 'Weekly stats', 'Progress charts']
        }
      ],
      screenshots: []
    },
    {
      id: 'blog-platform',
      name: 'Blog Platform Pro',
      category: 'Creative & Content',
      status: 'Available',
      routes: 5,
      icon: ArticleIcon,
      color: 'from-slate-500 to-gray-600',
      route: '/blog',
      tagline: 'Content creation and publishing made easy',
      description: 'Full-featured blogging platform with rich text editor, content management, community engagement, and analytics dashboard.',
      keyFeatures: [
        'Rich Text Editor',
        'Content Publishing',
        'Community Engagement'
      ],
      technologies: ['React', 'Markdown', 'Content Management', 'Analytics'],
      users: '10K+',
      videoId: 'dQw4w9WgXcQ',
      detailedFeatures: [
        {
          title: 'Rich Text Editor',
          description: 'Powerful editor with formatting options',
          capabilities: ['Markdown support', 'Media embedding', 'Code blocks', 'Custom styling']
        },
        {
          title: 'Content Publishing',
          description: 'Publish and manage your blog posts',
          capabilities: ['Draft management', 'Scheduling', 'SEO optimization', 'Categories & tags']
        },
        {
          title: 'Analytics Dashboard',
          description: 'Track your content performance',
          capabilities: ['View counts', 'Engagement metrics', 'Reader demographics', 'Popular posts']
        }
      ],
      screenshots: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-background">
      
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-8">
              <AutoAwesomeIcon className="h-4 w-4 mr-1" />
              Complete Product Suite
            </Badge>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">Our</span>
              {" "}
              <span className="text-primary">Products</span>
              <br />
              <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">Showcase</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Comprehensive showcase of our <strong className="text-primary">complete product ecosystem</strong> — featuring <strong className="text-primary">demo videos</strong>, <strong className="text-primary">detailed features</strong>, <strong className="text-primary">screenshots</strong>, and <strong className="text-primary">technology insights</strong> for all applications.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-600 dark:text-gray-300"><strong>6 Products</strong> Available Now</span>
              </div>
              <div className="flex items-center gap-2">
                <AccessTimeIcon className="h-5 w-5 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300"><strong>5 Products</strong> Coming Soon</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-teal-500" />
                <span className="text-gray-600 dark:text-gray-300"><strong>80+ Routes</strong> & Features</span>
              </div>
              <div className="flex items-center gap-2">
                <GroupIcon className="h-5 w-5 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-300"><strong>100K+</strong> Active Users</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Products Detailed Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {products.map((product) => (
              <div key={product.id} id={product.id} className="space-y-12">
                {/* Product Header - Clean and Professional */}
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    {/* Icon - Simpler design */}
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}>
                      <product.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Category badge */}
                    <Badge className="bg-primary/10 text-primary border-0 text-xs px-3 py-1">
                      {product.category}
                    </Badge>
                  </div>
                  
                  {/* Product Name - Cleaner typography */}
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {product.name}
                    </h2>
                    {/* Tagline */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                      {product.tagline}
                    </p>
                  </div>
                </div>

                {/* Main Product Row - Demo and Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  
                  {/* Left Side - Demo Area */}
                  <div>
                    <Card className="p-0 overflow-hidden shadow-lg">
                      <div className="relative h-[400px] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        {/* Demo Video Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            {/* Play Button */}
                            <button className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-6 hover:shadow-xl transition-all duration-300 group">
                              <svg className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </button>
                            
                            {/* Demo Text */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Watch Demo</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                See {product.name} in action
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        {product.status === 'Coming Soon' && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                              Coming Soon
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Right Side - Product Info */}
                  <div className="space-y-6">
                    {/* Description */}
                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Key Features - Matching Landing Page Style */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <StarIcon className="h-5 w-5 text-primary" />
                        Key Features
                      </h3>
                      <div className="space-y-3">
                        {product.keyFeatures.map((feature, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircleIcon className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</h4>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Section - Matching Landing Page Button Sizes */}
                    <div className="pt-6 space-y-4">
                      <div className="flex gap-4">
                        {product.status === 'Available' ? (
                          <Button
                            size="lg"
                            className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                            onClick={() => {
                              if (isAuthenticated) {
                                navigate(product.route);
                              } else {
                                navigate('/login');
                              }
                            }}
                          >
                            Get Started
                            <ArrowForwardIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        ) : (
                          <Button 
                            size="lg" 
                            variant="outline"
                            disabled
                            className="opacity-60"
                          >
                            Coming Soon
                            <AccessTimeIcon className="ml-2 h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Trust Indicators */}
                      {product.status === 'Available' && (
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>No credit card required</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GroupIcon className="h-4 w-4 text-blue-500" />
                            <span>{product.users} active users</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complete Feature Set - Clean Design */}
                <Card className="p-6 lg:p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Feature Set</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All capabilities of {product.name} at a glance
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {product.detailedFeatures?.map((feature, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {feature.capabilities?.map((cap, capIdx) => (
                            <Badge 
                              key={capIdx} 
                              variant="outline"
                              className="text-xs"
                            >
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )) || product.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start with any of our 6 available products today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="group bg-primary text-primary-foreground"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowForwardIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/pricing')}
              >
                View Pricing Plans
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPageFixed;