/**
 * Profile Page Generator
 *
 * Generates a React profile page that fetches user data from /api/v1/auth/me
 * and allows users to view and edit their profile.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateProfilePage(resolved?: ResolvedComponent): string {
  const dataSource = resolved?.dataSource || 'users';

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'user';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'user';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved?.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/auth/me';
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'user';

  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { User, Mail, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';

interface ProfileProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Profile({ ${dataName}: propData, className }: ProfileProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
  });

  // Fetch user profile data
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}', 'profile'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        const userData = Array.isArray(response) ? response[0] : (response?.data || response || {});

        // Initialize form data when user data is fetched
        if (userData) {
          setFormData({
            name: userData.name || userData.raw_user_meta_data?.name || userData.email?.split('@')[0] || '',
            email: userData.email || '',
            bio: userData.bio || userData.raw_user_meta_data?.bio || '',
            avatar_url: userData.avatar_url || userData.raw_user_meta_data?.avatar_url || '',
          });
        }

        return userData;
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Fallback to auth context user
        if (authUser) {
          setFormData({
            name: authUser.name || authUser.email?.split('@')[0] || '',
            email: authUser.email || '',
            bio: authUser.bio || '',
            avatar_url: authUser.avatar_url || '',
          });
          return authUser;
        }
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || authUser || {};

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put<any>('/auth/profile', {
        name: data.name,
        bio: data.bio,
        avatar_url: data.avatar_url,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response?.success || response?.data?.success) {
        // Update localStorage
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const updatedUser = {
            ...userData,
            name: formData.name,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
          };
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
        toast.success('Profile updated successfully');
        setEditMode(false);
        queryClient.invalidateQueries({ queryKey: ['${entity}', 'profile'] });
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    },
    onError: (error: any) => {
      console.error('Failed to update profile:', error);
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    updateProfileMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
              {!editMode && (
                <Button onClick={() => setEditMode(true)} variant="outline">
                  Edit Profile
                </Button>
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

                {editMode && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        if (${dataName}) {
                          setFormData({
                            name: ${dataName}.raw_user_meta_data?.name || ${dataName}.raw_user_meta_data?.full_name || ${dataName}.email?.split('@')[0] || '',
                            email: ${dataName}.email || '',
                            bio: ${dataName}.raw_user_meta_data?.bio || '',
                            avatar_url: ${dataName}.raw_user_meta_data?.avatar_url || '',
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
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
                  {${dataName}?.created_at
                    ? new Date(${dataName}.created_at).toLocaleDateString('en-US', {
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
                  {${dataName}?.last_sign_in_at
                    ? new Date(${dataName}.last_sign_in_at).toLocaleDateString('en-US', {
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
}
