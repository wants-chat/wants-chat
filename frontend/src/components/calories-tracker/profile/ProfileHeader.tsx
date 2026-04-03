import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiAccount, mdiCamera, mdiPencil } from '@mdi/js';

interface ProfileHeaderProps {
  name: string;
  email: string;
  photo?: string;
  joinDate: Date;
  dietPlan: string;
  isEditing: boolean;
  onEdit: () => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  photo,
  joinDate,
  dietPlan,
  isEditing,
  onEdit,
  onPhotoUpload
}) => {
  // Safely format the join date
  const formatJoinDate = (date: Date) => {
    try {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };
  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-400/30 flex items-center justify-center overflow-hidden">
            {photo ? (
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Icon path={mdiAccount} size={2} className="text-teal-400" />
            )}
          </div>
          <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full cursor-pointer hover:from-teal-600 hover:to-cyan-600 transition-colors">
            <Icon path={mdiCamera} size={0.6} className="text-white" />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoUpload}
            />
          </label>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{name || 'User'}</h2>
            {!isEditing && (
              <Button size="sm" onClick={onEdit} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                <Icon path={mdiPencil} size={0.7} />
              </Button>
            )}
          </div>
          <p className="text-white/60 mb-3">{email || 'No email provided'}</p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/10 text-white/80 border border-white/20">
              Member since {formatJoinDate(joinDate)}
            </Badge>
            {dietPlan && (
              <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30">
                {dietPlan}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;