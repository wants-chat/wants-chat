import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundEffectsProps {
  variant?: 'default' | 'subtle' | 'intense';
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ variant = 'default' }) => {
  const getOpacity = () => {
    switch (variant) {
      case 'subtle': return { orb: 0.15, particle: 0.3 };
      case 'intense': return { orb: 0.35, particle: 0.8 };
      default: return { orb: 0.25, particle: 0.5 };
    }
  };

  const opacity = getOpacity();

  return (
    <>
      {/* Fixed background with animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(20, 184, 166, ${opacity.orb}) 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(6, 182, 212, ${opacity.orb}) 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute -bottom-40 left-1/2 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(16, 185, 129, ${opacity.orb * 0.8}) 0%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
          animate={{
            x: [-100, 100, -100],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Side light beams */}
        <motion.div
          className="absolute top-0 left-0 w-1 h-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(20, 184, 166, 0.4), transparent)',
            filter: 'blur(15px)',
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleX: [1, 15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-0 right-0 w-1 h-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.4), transparent)',
            filter: 'blur(15px)',
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleX: [1, 15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-teal-400"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px rgba(20, 184, 166, 0.8)',
            }}
            animate={{
              y: [-20, -100, -20],
              x: [0, 50, 0],
              opacity: [0, opacity.particle, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
    </>
  );
};

export default BackgroundEffects;
