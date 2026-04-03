import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Users,
  Globe,
  Award,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  Sparkles,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';

const About: React.FC = () => {
  const stats = [
    { value: '50K+', label: 'Active Users', icon: Users },
    { value: '37+', label: 'AI Tools', icon: Sparkles },
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '24/7', label: 'Support', icon: Clock }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for instant responses and smooth interactions'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level encryption to keep your personal data safe and secure'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Available on all devices, sync your data across platforms seamlessly'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized as the best life management platform by industry experts'
    }
  ];

  const achievements = [
    'AI-powered insights for better decision making',
    'Personalized recommendations based on your habits',
    'Comprehensive tracking across all life aspects',
    'Intuitive interface designed for everyone',
    'Regular updates with new features',
    'Community-driven development'
  ];

  return (
    <section id="about" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <div
        className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 9s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 11s ease-in-out infinite',
          animationDelay: '3s',
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Heart className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">About Wants AI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            Your Complete Life Management
            <span className="block mt-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Ecosystem
            </span>
          </h2>

          <p className="text-lg text-white/70">
            Wants AI is more than just an app – it's your personal operating system designed to help you
            organize, optimize, and elevate every aspect of your life through intelligent automation and insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              Why Choose Wants AI?
            </h3>

            <p className="text-white/70 mb-8">
              We've built Wants AI from the ground up with a single mission: to make life management
              effortless and enjoyable. Our platform combines cutting-edge AI technology with
              intuitive design to deliver an unparalleled user experience.
            </p>

            {/* Achievement List */}
            <div className="space-y-3 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/70">{achievement}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Floating Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">85%</p>
                  <p className="text-xs text-white/60">Productivity Increase</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Target className="h-8 w-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">3x</p>
                  <p className="text-xs text-white/60">Goals Achieved</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Clock className="h-8 w-8 text-teal-400 mb-2" />
                  <p className="text-2xl font-bold text-white">2hrs</p>
                  <p className="text-xs text-white/60">Daily Time Saved</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Heart className="h-8 w-8 text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-xs text-white/60">User Satisfaction</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-teal-400" />
                </div>
                <h4 className="font-semibold mb-2 text-white">{benefit.title}</h4>
                <p className="text-sm text-white/70">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <h3 className="text-2xl font-bold mb-4 text-white">
            Ready to Transform Your Life?
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have already revolutionized their daily routines with Wants AI.
            Start your journey today with our free trial.
          </p>
          <Button size="lg" className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
            Start Your Free Trial
            <Sparkles className="ml-2 h-5 w-5 group-hover:animate-pulse" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default About;