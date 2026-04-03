import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;