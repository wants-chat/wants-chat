import React from 'react';
import Header from '../components/landing/Header';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {/* Landing Page Header Only */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};