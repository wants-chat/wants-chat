import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Settings, Layout, TrendingUp, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your free account in seconds with email or social login',
      icon: UserPlus,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      number: '2',
      title: 'Customize',
      description: 'Set up your dashboard and select the apps you need',
      icon: Settings,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      number: '3',
      title: 'Organize',
      description: 'Add your goals, tasks, health data, and finances',
      icon: Layout,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      number: '4',
      title: 'Track & Grow',
      description: 'Monitor progress and achieve your life objectives',
      icon: TrendingUp,
      color: 'from-indigo-500 to-teal-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 80, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Layout className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Simple Process</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            How It Works
          </h2>

          <p className="text-lg text-white/70">
            Get started with Wants AI in 4 simple steps and transform your daily routine
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                {/* Connection Arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-white/30" />
                  </div>
                )}

                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full group-hover:shadow-xl group-hover:shadow-teal-500/20">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="text-white/70">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-white/60">
            Most users complete setup in under 5 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
