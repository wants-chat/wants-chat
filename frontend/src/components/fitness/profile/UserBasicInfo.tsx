import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiAccount,
  mdiCalendar,
  mdiGenderMale,
  mdiGenderFemale,
  mdiPencil,
  mdiCheck,
  mdiClose
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { UserFitnessProfile } from '../../../types/fitness';

interface UserBasicInfoProps {
  profile: UserFitnessProfile;
  onUpdateProfile?: (updates: Partial<UserFitnessProfile>) => void;
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    age: profile.age,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    fitnessGoal: profile.fitnessGoal,
    workoutLocation: profile.workoutLocation
  });

  const handleSave = () => {
    onUpdateProfile?.(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      fitnessGoal: profile.fitnessGoal,
      workoutLocation: profile.workoutLocation
    });
    setIsEditing(false);
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return mdiGenderMale;
      case 'female': return mdiGenderFemale;
      default: return mdiAccount;
    }
  };

  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (Little/no exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (2x/day, intense)' }
  ];

  const fitnessGoals = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'gain_muscle', label: 'Gain Muscle' },
    { value: 'maintain', label: 'Maintain Current Weight' },
    { value: 'improve_fitness', label: 'Improve Overall Fitness' }
  ];

  const workoutLocations = [
    { value: 'gym', label: 'Gym Only' },
    { value: 'home', label: 'Home Only' },
    { value: 'both', label: 'Both Gym & Home' }
  ];

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiAccount} size={1} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
        </div>

        {!isEditing ? (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400"
          >
            <Icon path={mdiPencil} size={0.7} className="mr-2 text-teal-400" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              <Icon path={mdiCheck} size={0.7} className="mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleCancel} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Icon path={mdiClose} size={0.7} className="mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
            <Icon path={mdiCalendar} size={0.6} />
            Age
          </label>
          {isEditing ? (
            <Input
              type="number"
              value={editedProfile.age}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                age: parseInt(e.target.value) || 0
              })}
              min="13"
              max="100"
            />
          ) : (
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-lg font-semibold text-white">{profile.age} years</span>
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60 flex items-center gap-2">
            <Icon path={getGenderIcon(profile.gender)} size={0.6} />
            Gender
          </label>
          {isEditing ? (
            <Select
              value={editedProfile.gender}
              onValueChange={(value) =>
                setEditedProfile({ ...editedProfile, gender: value as 'male' | 'female' | 'other' })
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-lg font-semibold text-white">{formatLabel(profile.gender)}</span>
            </div>
          )}
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">
            Activity Level
          </label>
          {isEditing ? (
            <Select
              value={editedProfile.activityLevel}
              onValueChange={(value) =>
                setEditedProfile({ ...editedProfile, activityLevel: value as typeof profile.activityLevel })
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-lg font-semibold text-white">
                {activityLevels.find(l => l.value === profile.activityLevel)?.label || formatLabel(profile.activityLevel)}
              </span>
            </div>
          )}
        </div>

        {/* Fitness Goal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">
            Primary Goal
          </label>
          {isEditing ? (
            <Select
              value={editedProfile.fitnessGoal}
              onValueChange={(value) =>
                setEditedProfile({ ...editedProfile, fitnessGoal: value as typeof profile.fitnessGoal })
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fitnessGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-lg font-semibold text-white">
                {fitnessGoals.find(g => g.value === profile.fitnessGoal)?.label || formatLabel(profile.fitnessGoal)}
              </span>
            </div>
          )}
        </div>

        {/* Workout Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">
            Workout Location
          </label>
          {isEditing ? (
            <Select
              value={editedProfile.workoutLocation}
              onValueChange={(value) =>
                setEditedProfile({ ...editedProfile, workoutLocation: value as typeof profile.workoutLocation })
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workoutLocations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-lg font-semibold text-white">
                {workoutLocations.find(l => l.value === profile.workoutLocation)?.label || formatLabel(profile.workoutLocation)}
              </span>
            </div>
          )}
        </div>

        {/* Profile Updated Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">
            Last Updated
          </label>
          <div className="p-3 bg-white/10 rounded-lg border border-white/10">
            <span className="text-lg font-semibold text-white">
              {profile.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserBasicInfo;