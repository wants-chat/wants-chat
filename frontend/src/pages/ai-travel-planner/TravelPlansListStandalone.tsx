import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import TravelPlannerHeader from '../../components/ai-travel-planner/TravelPlannerHeader';
import TravelPlansListPage from './TravelPlansListPage';
import {
  getDestinationImage,
  generateSampleItinerary,
  generateSampleHotels,
} from './utils';
import type {
  TravelPlan,
  Notification,
  FilterState,
} from '../../types/ai-travel-planner';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';

const TravelPlansListStandalone: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const confirmation = useConfirmation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    filterTag: 'all',
    filterFavorites: 'all',
    sortBy: 'created',
  });

  // Sample travel plans
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([
    {
      id: '1',
      destination: 'Paris, France',
      budget: 3000,
      currency: 'USD',
      duration: 5,
      startDate: '2024-04-15',
      endDate: '2024-04-20',
      created: '2024-01-15',
      totalEstimatedCost: 2850,
      tags: ['Romantic', 'Culture', 'Food'],
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      itinerary: [],
      hotels: [],
    },
    {
      id: '2',
      destination: 'Tokyo, Japan',
      budget: 4500,
      currency: 'USD',
      duration: 7,
      startDate: '2024-05-10',
      endDate: '2024-05-17',
      created: '2024-01-20',
      totalEstimatedCost: 4200,
      tags: ['Adventure', 'Culture', 'Technology'],
      isFavorite: false,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
      itinerary: [],
      hotels: [],
    },
    {
      id: '3',
      destination: 'Bali, Indonesia',
      budget: 2000,
      currency: 'USD',
      duration: 10,
      startDate: '2024-06-01',
      endDate: '2024-06-11',
      created: '2024-02-05',
      totalEstimatedCost: 1800,
      tags: ['Relaxation', 'Beach', 'Spiritual'],
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      itinerary: [],
      hotels: [],
    },
    {
      id: '4',
      destination: 'New York, USA',
      budget: 3500,
      currency: 'USD',
      duration: 4,
      startDate: '2024-03-15',
      endDate: '2024-03-19',
      created: '2024-01-10',
      totalEstimatedCost: 3300,
      tags: ['Urban', 'Shopping', 'Entertainment'],
      isFavorite: false,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
      itinerary: [],
      hotels: [],
    },
  ]);

  // Check for generated plan and load notifications on mount
  useEffect(() => {
    const generatedPlan = localStorage.getItem('generatedTravelPlan');
    if (generatedPlan) {
      const planData = JSON.parse(generatedPlan);
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(planData.duration));

      const newPlan: TravelPlan = {
        id: Date.now().toString(),
        destination: planData.destination,
        budget: parseFloat(planData.budget),
        currency: 'USD',
        duration: parseInt(planData.duration),
        startDate: planData.startDate || startDate,
        endDate: planData.startDate
          ? new Date(
              new Date(planData.startDate).getTime() +
                (parseInt(planData.duration) - 1) * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0]
          : endDate.toISOString().split('T')[0],
        created: new Date().toISOString().split('T')[0],
        totalEstimatedCost: parseFloat(planData.budget) * 0.95,
        tags: [planData.travelStyle || 'General'],
        isFavorite: false,
        image: getDestinationImage(planData.destination),
        itinerary: generateSampleItinerary(
          parseInt(planData.duration),
          startDate,
          planData.destination,
        ),
        hotels: generateSampleHotels(planData.destination),
      };

      setTravelPlans((prev) => [newPlan, ...prev]);
      localStorage.removeItem('generatedTravelPlan');
      // Navigate to the new plan detail
      navigate(`/travel-planner/plan/${newPlan.id}`);
    }

    // Load and check notifications
    loadNotifications();
  }, [navigate]);

  // Check notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('travelNotifications') || '[]');
    const now = new Date();

    // Filter notifications that should be shown now
    const activeNotifications = storedNotifications
      .filter((notification: any) => {
        const triggerDate = new Date(notification.triggerDate);
        const timeDiff = triggerDate.getTime() - now.getTime();
        // Show notification if trigger time has passed and within last 7 days
        return timeDiff <= 0 && timeDiff > -7 * 24 * 60 * 60 * 1000;
      })
      .sort(
        (a: any, b: any) => new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime(),
      );

    setNotifications(activeNotifications);
  };

  const markNotificationAsRead = (notificationId: string) => {
    const storedNotifications = JSON.parse(localStorage.getItem('travelNotifications') || '[]');
    const updatedNotifications = storedNotifications.map((notification: any) =>
      notification.id === notificationId ? { ...notification, read: true } : notification,
    );
    localStorage.setItem('travelNotifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const clearAllNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('travelNotifications') || '[]');
    const updatedNotifications = storedNotifications.map((notification: any) => ({
      ...notification,
      read: true,
    }));
    localStorage.setItem('travelNotifications', JSON.stringify(updatedNotifications));
    setNotifications([]);
  };

  const handleToggleFavorite = (planId: string) => {
    setTravelPlans(
      travelPlans.map((plan) =>
        plan.id === planId ? { ...plan, isFavorite: !plan.isFavorite } : plan,
      ),
    );
  };

  const handleDeletePlan = async (planId: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Travel Plan',
      message: 'Are you sure you want to delete this travel plan? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      setTravelPlans(travelPlans.filter((plan) => plan.id !== planId));
      toast.success('Travel plan deleted successfully');
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSelectPlan = (plan: TravelPlan) => {
    navigate(`/travel-planner/plan/${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <TravelPlannerHeader
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab="plans"
        setActiveTab={(tab) => {
          if (tab === 'stats') {
            navigate('/travel-planner');
          }
        }}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationRef={notificationRef}
        markNotificationAsRead={markNotificationAsRead}
        clearAllNotifications={clearAllNotifications}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TravelPlansListPage
          travelPlans={travelPlans}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectPlan={handleSelectPlan}
          onDeletePlan={handleDeletePlan}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default TravelPlansListStandalone;