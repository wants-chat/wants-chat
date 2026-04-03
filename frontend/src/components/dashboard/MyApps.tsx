import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useDashboardData } from '../../hooks';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Map icon names to icon components
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'AttachMoney': AttachMoneyIcon,
    'Restaurant': RestaurantIcon,
    'FitnessCenter': FitnessCenterIcon,
    'Favorite': FavoriteIcon,
    'SelfImprovement': SelfImprovementIcon,
    'Psychology': PsychologyIcon,
    'FlightTakeoff': FlightTakeoffIcon,
    'Receipt': ReceiptIcon,
  };
  return iconMap[iconName] || AttachMoneyIcon;
};

const MyApps: React.FC = () => {
  const navigate = useNavigate();
  const dashboardData = useDashboardData();

  return (
    <div className="mt-12">
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            My Apps
          </CardTitle>
          <CardDescription className="text-white/60">
            Quick access to your most frequently used applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-white/20 rounded animate-pulse" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="h-20 bg-white/20 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.quickAccessApps?.map((category: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <h3 className="font-semibold text-white text-sm">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.apps.map((app: any, appIdx: number) => {
                      const IconComponent = getIconComponent(app.icon);
                      return (
                        <button
                          key={appIdx}
                          onClick={() => navigate(app.link)}
                          className={`w-full p-4 rounded-xl bg-gradient-to-br ${app.bgColor} hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-white text-left group`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{app.name}</p>
                            </div>
                            <ArrowForwardIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApps;
