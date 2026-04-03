import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
  onClick
}) => {
  return (
    <motion.div
      className={cn(
        "bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 transition-all duration-300",
        hover && "hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer",
        glow && "shadow-lg shadow-teal-500/20",
        gradient && "bg-gradient-to-br from-white/10 to-white/5",
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "from-teal-500 to-cyan-500",
  subtitle
}) => {
  const isPositive = change && change > 0;

  return (
    <GlassCard hover={false} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-white/60">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-white/40">from last month</span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-white/40">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-r",
          color
        )}>
          <span className="text-white">{icon}</span>
        </div>
      </div>

      {/* Background decoration */}
      <div className={cn(
        "absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-r",
        color
      )} />
    </GlassCard>
  );
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions
}) => {
  return (
    <GlassCard hover={false} className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-white/60 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      <div className="relative">
        {children}
      </div>
    </GlassCard>
  );
};

interface InfoCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  color = "from-teal-500 to-cyan-500",
  children,
  onClick
}) => {
  return (
    <GlassCard hover={!!onClick} onClick={onClick ? () => onClick() : undefined}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-r flex-shrink-0",
          color
        )}>
          <span className="text-white">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
          {children}
        </div>
      </div>
    </GlassCard>
  );
};

export default GlassCard;
