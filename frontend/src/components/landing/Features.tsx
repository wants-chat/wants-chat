import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  Activity, 
  Heart, 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Target,
  ArrowRight
} from 'lucide-react';
import { Feature } from '../../types';

const Features: React.FC = () => {
  const navigate = useNavigate();
  
  const features: Feature[] = [
    {
      icon: Activity,
      title: 'Fitness',
      description: 'Track your workouts, exercise routines, and fitness progress',
      link: '/fitness',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: Heart,
      title: 'Health',
      description: 'Monitor your health metrics, medications, and medical records',
      link: '/health',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      icon: Brain,
      title: 'Knowledge Base',
      description: 'Build your personal wiki and note-taking system',
      link: null,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-purple-950/20',
    },
    {
      icon: TrendingUp,
      title: 'Habit Tracking',
      description: 'Monitor and build positive habits with visual progress tracking',
      link: null,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: DollarSign,
      title: 'Finance Manager',
      description: 'Track expenses, budgets, and financial goals',
      link: null,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set, track, and achieve your personal and professional goals',
      link: null,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    }
  ];

  const handleFeatureClick = (link: string | null) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <section id="features" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 10s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
            Features
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto text-white/70">
            Everything you need to manage your life effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`
                  group relative bg-white/10 backdrop-blur-sm rounded-2xl p-8
                  border border-white/20
                  transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20
                  ${feature.link ? 'cursor-pointer hover:scale-105 hover:border-white/40' : 'hover:shadow-lg'}
                `}
                onClick={() => handleFeatureClick(feature.link)}
              >
                {/* Icon Container */}
                <div className={`
                  inline-flex p-3 rounded-lg bg-white/10 mb-6
                `}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="mb-6 text-white/70">
                  {feature.description}
                </p>

                {/* Action Button/Link */}
                {feature.link ? (
                  <div className="flex items-center text-teal-400 font-medium group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <span className="text-sm text-white/60">
                    Coming Soon
                  </span>
                )}

                {/* Hover Effect Overlay */}
                {feature.link && (
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg mb-6 text-white/70">
            Ready to transform your life management?
          </p>
          <Link to="/login">
            <Button size="lg" className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;