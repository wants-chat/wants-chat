import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
            {isLast ? (
              <div className="flex items-center space-x-2 text-white font-medium">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </div>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ) : item.href ? (
              <Link
                to={item.href}
                className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 text-white/60">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
