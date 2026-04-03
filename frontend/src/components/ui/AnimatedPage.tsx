import React from 'react';
import { motion, Variants } from 'framer-motion';

export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedSection: React.FC<AnimatedPageProps> = ({ children, className = "" }) => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export const AnimatedItem: React.FC<AnimatedPageProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCard: React.FC<AnimatedPageProps & { whileHover?: boolean }> = ({ 
  children, 
  className = "",
  whileHover = true 
}) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={whileHover ? { scale: 1.02 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};