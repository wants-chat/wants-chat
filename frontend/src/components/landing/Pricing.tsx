import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: {
    text: string;
    included: boolean;
  }[];
  highlighted?: boolean;
  badge?: string;
  icon: React.ElementType;
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: {
        monthly: 0,
        yearly: 0
      },
      currency: '$',
      icon: RocketLaunchIcon,
      features: [
        { text: 'Access to 2 apps', included: true },
        { text: 'Basic features', included: true },
        { text: 'Web access', included: true },
        { text: 'Mobile app access', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Cross-app sync', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For serious productivity lovers',
      price: {
        monthly: 9,
        yearly: 90
      },
      currency: '$',
      icon: StarIcon,
      highlighted: true,
      badge: 'Most Popular',
      features: [
        { text: 'Access to all 12 apps', included: true },
        { text: 'Advanced features unlocked', included: true },
        { text: 'Mobile + Web access', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Cross-app integration', included: true }
      ]
    }
  ];

  const yearlyDiscount = 20;

  return (
    <section id="pricing" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -50, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 70, 0],
          y: [0, -40, 0],
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
            <LocalOfferIcon className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Simple Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            Choose Your Plan
          </h2>

          <p className="text-lg text-white/70 mb-8">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Yearly
              <span className={`ml-2 text-xs font-semibold ${billingCycle === 'yearly' ? 'text-emerald-200' : 'text-teal-400'}`}>
                Save {yearlyDiscount}%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            const currentPrice = plan.price[billingCycle];
            const isYearly = billingCycle === 'yearly';

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: plan.highlighted ? 1.02 : 1.05 }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-400/50 scale-105 shadow-2xl shadow-teal-500/20'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold shadow-lg">
                      <AutoAwesomeIcon className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                      : 'bg-white/10'
                  }`}>
                    {React.createElement(Icon, { className: "h-7 w-7 text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  {isYearly && plan.price.yearly > 0 ? (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-white">
                          {plan.currency}{(plan.price.yearly / 12).toFixed(2)}
                        </span>
                        <span className="text-white/60">/mo</span>
                      </div>
                      <p className="text-sm text-white/60 mt-2">
                        <span className="line-through">${(plan.price.monthly * 12).toFixed(2)}</span>
                        <span className="ml-2 text-green-400 font-medium">${plan.price.yearly.toFixed(2)}/year</span>
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">
                        {plan.currency}{plan.price.monthly > 0 ? plan.price.monthly.toFixed(2) : '0'}
                      </span>
                      <span className="text-white/60">/mo</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CloseIcon className="h-5 w-5 text-white/30 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-white' : 'text-white/40 line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                  size="lg"
                >
                  {plan.price.monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Features */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-lg font-semibold mb-8 text-white">All plans include:</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: CheckIcon, text: 'Free 14-day trial' },
              { icon: CheckIcon, text: 'No credit card required' },
              { icon: CheckIcon, text: 'Cancel anytime' },
              { icon: CheckIcon, text: 'Free migration help' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 justify-center">
                <item.icon className="h-5 w-5 text-green-400" />
                <span className="text-sm text-white/70">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-white/60 mb-4">
            Have questions about our pricing?
          </p>
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
          >
            View Pricing FAQ
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
