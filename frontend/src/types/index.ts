// Feature types
export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link: string | null;
  color: string;
  bgColor: string;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Navigation types
export interface NavLink {
  label: string;
  href: string;
}

// Button props extension
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}