import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Sparkles, ArrowRight, Calendar } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Start Your Journey Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            Ready to Transform Your Life?
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-white/70">
            Join thousands of users who are already organizing and optimizing their lives with Wants AI.
            Start free today and unlock your full potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>

          {/* Trust Note */}
          <p className="text-sm text-white/60">
            No credit card required • Free forever plan available
          </p>

          {/* Trust Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-12 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-sm text-white/60">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">4.9/5</p>
              <p className="text-sm text-white/60">User Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-sm text-white/60">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-sm text-white/60">Support</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
