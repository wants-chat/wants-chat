import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface PersonalInfoProps {
  isEditing: boolean;
  profile: {
    name: string;
    email: string;
    age: number;
    height: number;
    gender: string;
    activityLevel: string;
    currentWeight: number;
    targetWeight: number;
  };
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
  onChange: (field: string, value: string | number) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  isEditing,
  profile,
  onSave,
  onCancel,
  onChange
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(profile);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="p-6 bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-white/60">Age</p>
            <p className="font-medium text-white">{profile.age} years</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Height</p>
            <p className="font-medium text-white">{profile.height} cm</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Gender</p>
            <p className="font-medium text-white capitalize">{profile.gender}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Activity Level</p>
            <p className="font-medium text-white capitalize">{profile.activityLevel.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Current Weight</p>
            <p className="font-medium text-white">
              {profile.currentWeight && profile.currentWeight > 0 ? `${profile.currentWeight.toFixed(1)} kg` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60">Target Weight</p>
            <p className="font-medium text-white">
              {profile.targetWeight && profile.targetWeight > 0 ? `${profile.targetWeight.toFixed(1)} kg` : 'Not set'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Edit Personal Information</h3>
      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="text-white/80">Age</Label>
            <Input
              id="age"
              type="number"
              min="10"
              max="120"
              value={profile.age || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onChange('age', isNaN(value) ? 0 : value);
              }}
              placeholder="Enter age"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-white/80">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min="100"
              max="250"
              value={profile.height || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onChange('height', isNaN(value) ? 0 : value);
              }}
              placeholder="Enter height in cm"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="gender" className="text-white/80">Gender</Label>
          <Select value={profile.gender} onValueChange={(value) => onChange('gender', value)}>
            <SelectTrigger id="gender" className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="male" className="text-white hover:bg-white/10">Male</SelectItem>
              <SelectItem value="female" className="text-white hover:bg-white/10">Female</SelectItem>
              <SelectItem value="other" className="text-white hover:bg-white/10">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="activity" className="text-white/80">Activity Level</Label>
          <Select value={profile.activityLevel} onValueChange={(value) => onChange('activityLevel', value)}>
            <SelectTrigger id="activity" className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-teal-800/90 border-teal-400/30">
              <SelectItem value="sedentary" className="text-white hover:bg-white/10">Sedentary</SelectItem>
              <SelectItem value="lightly_active" className="text-white hover:bg-white/10">Lightly Active</SelectItem>
              <SelectItem value="moderately_active" className="text-white hover:bg-white/10">Moderately Active</SelectItem>
              <SelectItem value="very_active" className="text-white hover:bg-white/10">Very Active</SelectItem>
              <SelectItem value="extremely_active" className="text-white hover:bg-white/10">Extremely Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-weight" className="text-white/80">Current Weight (kg)</Label>
            <Input
              id="current-weight"
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={profile.currentWeight || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onChange('currentWeight', isNaN(value) ? 0 : value);
              }}
              placeholder="Enter current weight"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="target-weight" className="text-white/80">Target Weight (kg)</Label>
            <Input
              id="target-weight"
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={profile.targetWeight || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onChange('targetWeight', isNaN(value) ? 0 : value);
              }}
              placeholder="Enter target weight"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
            Save Changes
          </Button>
          <Button onClick={onCancel} className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfo;