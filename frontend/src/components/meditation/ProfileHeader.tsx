import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Camera, Pencil, Settings, Download, Flame, Calendar } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';
import { Card } from '../ui/card';

interface ProfileHeaderProps {
  userData: {
    name: string;
    email: string;
    memberSince: string;
    currentStreak: number;
    level: number;
    xp: number;
    nextLevelXp: number;
    profileImage?: string;
  };
  profileImage?: string;
  onProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  profileImage,
  onProfileImageChange
}) => {
  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar with Photo Upload */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/30 overflow-hidden">
            {profileImage || userData.profileImage ? (
              <img
                src={profileImage || userData.profileImage}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon path={mdiMeditation} size={2} className="text-teal-400" />
              </div>
            )}
          </div>

          {/* Photo Upload Overlay */}
          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="p-2 bg-white/30 backdrop-blur-sm rounded-full">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </label>
          </div>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onProfileImageChange}
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-2 w-full">
          {/* Name and Edit */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{userData.name}</h2>
            <Button
              size="sm"
              className="h-6 w-6 p-0 bg-transparent hover:bg-white/10"
            >
              <Pencil className="h-4 w-4 text-teal-400" />
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
            <Badge className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 border-teal-500/30">
              Level {userData.level}
            </Badge>
            <div className="flex items-center gap-1 text-white/60">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>{userData.currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-1 text-white/60">
              <Calendar className="h-4 w-4 text-teal-400" />
              <span>Since {userData.memberSince}</span>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Level Progress</span>
              <span className="font-medium text-teal-400">{Math.round((userData.xp / userData.nextLevelXp) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 self-start sm:self-center">
          <Button size="sm" className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="sm" className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};