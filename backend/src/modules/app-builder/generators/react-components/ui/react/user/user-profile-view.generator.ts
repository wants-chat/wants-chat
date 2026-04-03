import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateUserProfileView = (
  resolved: ResolvedComponent,
  variant: 'public' | 'private' | 'editable' = 'editable'
) => {
  // For auth.users entity, generate a profile component that works with actual data
  return `import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User, Mail, Save, ArrowLeft, Edit2, X, Loader2 } from 'lucide-react';

interface UserProfileViewProps {
  data?: any;
  className?: string;
  [key: string]: any;
}

export default function UserProfileView({ data: propData, className }: UserProfileViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
  });

  // Fetch profile data from API if no prop data provided
  const { data: fetchedProfile, isLoading: loading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/profile');
        if (response.data?.success && response.data?.data?.user) {
          return response.data.data.user;
        }
        return response.data || response;
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
        return null;
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const user = propData?.user || propData?.data?.user || propData || fetchedProfile;

  const initFormData = (userData: any) => {
    setFormData({
      name: userData?.raw_user_meta_data?.name || userData?.raw_user_meta_data?.full_name || userData?.email?.split('@')[0] || '',
      email: userData?.email || '',
      bio: userData?.raw_user_meta_data?.bio || '',
      avatar_url: userData?.raw_user_meta_data?.avatar_url || '',
    });
  };

  // Initialize form data when user data changes
  useEffect(() => {
    if (user) {
      initFormData(user);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put<any>('/auth/profile', {
        name: formData.name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      });

      if (response.data?.success) {
        toast.success('Profile updated successfully');
        setEditMode(false);
        refetch();
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={\`\${className || ''}\`}>
      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
              {!editMode ? (
                <Button onClick={() => setEditMode(true)} variant="outline">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      if (user) initFormData(user);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.avatar_url} alt={formData.name} />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {getInitials(formData.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <div className="mt-4 w-full">
                    <Label htmlFor="avatar_url" className="text-sm">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{formData.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{formData.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {editMode ? (
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md min-h-[100px]">
                      <span className="text-gray-700">{formData.bio || 'No bio added yet'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Last Sign In</p>
                <p className="text-lg font-semibold">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-semibold">Sign Out</p>
                <p className="text-sm text-gray-500">Sign out from your account</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;
};
