import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/landing/Header';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';

interface AIToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  children: React.ReactNode;
}

export const AIToolLayout: React.FC<AIToolLayoutProps> = ({
  title,
  description,
  icon,
  iconColor,
  iconBgColor,
  children,
}) => {
  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-2 pb-2 overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4 text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div
              className={`p-4 rounded-2xl ${iconBgColor} ${iconColor}`}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-white/70">{description}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </div>
    </div>
  );
};

export default AIToolLayout;
