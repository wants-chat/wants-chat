import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Check, Download, ExternalLink } from 'lucide-react';

const AppStoreBadges: React.FC = () => {
  const mobileFeatures = [
    'AI assistant on the go',
    'Offline tool access',
    'Push notifications',
    'Native performance',
  ];

  const webFeatures = [
    'Full AI capabilities',
    'Cross-platform sync',
    'No installation needed',
    'Works everywhere',
  ];

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background - matching login page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
            Available Everywhere
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Wants</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Access Wants on any device - mobile, tablet, or desktop
          </p>
        </motion.div>

        {/* App Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Mobile App Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-emerald-500/50 transition-all duration-500">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Wants Mobile</h3>
                  <p className="text-emerald-400 text-sm">Available Now</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                Take Wants with you wherever you go. Chat with AI, use tools, and get things done on the move with our native mobile app.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {mobileFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Google Play Badge */}
              <div className="space-y-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.wants.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/badge block"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black rounded-xl p-4 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-0.5">GET IT ON</div>
                      <div className="text-lg font-bold text-white">Google Play</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover/badge:text-emerald-400 transition-colors" />
                  </motion.div>
                </a>

                {/* App Store - Coming Soon */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex items-center gap-4 opacity-60">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-0.5">COMING SOON ON</div>
                    <div className="text-lg font-bold text-white">App Store</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Web App Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-cyan-500/50 transition-all duration-500">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Wants Web</h3>
                  <p className="text-cyan-400 text-sm">Use Anywhere</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                Access the full power of Wants directly from your browser. No installation required, works on any device with internet access.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {webFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Launch Web App Button */}
              <a
                href="https://wants.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl p-4 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                >
                  <Globe className="w-6 h-6 text-white" />
                  <span className="text-lg font-bold text-white">Launch Wants</span>
                  <ExternalLink className="w-5 h-5 text-white" />
                </motion.div>
              </a>

              {/* Browser Compatibility */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="text-sm text-gray-400 mb-3">Works on:</div>
                <div className="flex flex-wrap gap-2">
                  {['Chrome', 'Firefox', 'Safari', 'Edge'].map((browser) => (
                    <span
                      key={browser}
                      className="px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800 text-white/80 text-sm"
                    >
                      {browser}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900/50 border border-gray-800">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-400">Your data syncs seamlessly across all platforms</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppStoreBadges;
