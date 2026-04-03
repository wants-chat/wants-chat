import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiCalendarToday,
  mdiFire
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { useFitnessProfile } from '../../../hooks/fitness/useFitnessProfile';

interface ProfileHeaderProps {}

const ProfileHeader: React.FC<ProfileHeaderProps> = () => {
  const { user: authUser } = useAuth();
  const { data: fitnessProfile } = useFitnessProfile();

  // Early return if no auth user
  if (!authUser) {
    return null;
  }

  const getFitnessLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Intermediate':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calculate data from API responses
  const userName = authUser.name || 'User';
  const profileImage = authUser.avatarUrl;
  const activityLevel = fitnessProfile?.activityLevel || 'moderate';
  const joinDate = new Date(authUser.createdAt);
  const totalDaysActive = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Map activity level to fitness level
  const getFitnessLevel = (activity: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
    switch (activity) {
      case 'low': return 'Beginner';
      case 'moderate': return 'Intermediate'; 
      case 'high': return 'Advanced';
      default: return 'Intermediate';
    }
  };
  
  const fitnessLevel = getFitnessLevel(activityLevel);

  return (
    <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Compact Avatar Section */}
        <div className="relative">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/20">
            <AvatarImage src={profileImage} alt={userName} />
            <AvatarFallback className="text-lg font-bold bg-teal-500/20 text-teal-400">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Compact Profile Info */}
        <div className="flex-1 w-full sm:w-auto space-y-2">
          {/* Name */}
          <div className="flex items-center justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-white">{userName}</h2>
          </div>

          {/* Compact Stats Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm">
            <Badge className={`px-2 py-1 text-xs ${getFitnessLevelColor(fitnessLevel)}`}>
              {fitnessLevel}
            </Badge>
            <div className="flex items-center gap-1 text-white/60">
              <Icon path={mdiFire} size={0.6} className="text-orange-400" />
              <span className="text-xs sm:text-sm">{totalDaysActive} days active</span>
            </div>
            <div className="flex items-center gap-1 text-white/60">
              <Icon path={mdiCalendarToday} size={0.6} className="text-teal-400" />
              <span className="text-xs sm:text-sm">Since {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;