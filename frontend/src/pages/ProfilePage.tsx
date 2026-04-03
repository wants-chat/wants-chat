import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { ImageCropper } from '../components/ui/ImageCropper';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import {
  Camera,
  User,
  Shield,
  Loader2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Globe,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser, refreshUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update local avatar state when user changes
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || '',
    });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only send non-empty values
      const updateData: Record<string, string> = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.bio) updateData.bio = formData.bio;
      if (formData.website) updateData.website = formData.website;
      if (formData.location) updateData.location = formData.location;

      const updatedUser = await api.updateProfile(updateData);

      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create object URL for the cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropperOpen(true);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    setLoading(true);
    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      const response = await api.uploadAvatar(croppedFile);

      // Backend returns { user: { avatarUrl } }
      const newAvatarUrl = response.user?.avatarUrl || response.avatarUrl;
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        setAvatarTimestamp(Date.now());
        updateUser({ avatarUrl: newAvatarUrl });
      }

      // Refresh user to ensure we have the latest data
      if (refreshUser) {
        await refreshUser();
      }

      toast.success('Avatar updated successfully');
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
      // Clean up the object URL
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className={cn(
      'flex h-full',
      theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'
    )}>
      {/* Sidebar */}
      <AppSidebar activePage="settings" />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      {/* Main Content */}
      <div className={cn(
        'flex-1 overflow-y-auto',
        theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'
      )}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={cn(
                'text-2xl font-bold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {t('profile.title')}
              </h1>
              <p className={cn(
                'text-sm',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {t('profile.subtitle')}
              </p>
            </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              isEditing
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                  ? 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? t('profile.saveChanges') : t('profile.editProfile')}
          </button>
        </div>

        {/* Avatar & Basic Info Card */}
        <div className={cn(
          'rounded-xl p-6 mb-6',
          theme === 'dark' ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
        )}>
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden',
                theme === 'dark' ? 'bg-[#2a2a2a] text-gray-400' : 'bg-gray-100 text-gray-500'
              )}>
                {avatarUrl ? (
                  <img
                    src={`${avatarUrl}?t=${avatarTimestamp}`}
                    alt={user?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl(undefined)}
                  />
                ) : (
                  getInitials()
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={handleAvatarClick}
                    disabled={loading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center hover:bg-[#0F766E] transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.fields.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg transition-colors',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white disabled:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 disabled:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.fields.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className={cn(
                    'w-full px-3 py-2 rounded-lg cursor-not-allowed',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-400'
                  )}
                />
                <p className={cn(
                  'mt-1 text-xs',
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                )}>
                  {t('profile.fields.emailCannotChange')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={cn(
          'flex gap-1 p-1 rounded-lg mb-6',
          theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'
        )}>
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
              activeTab === 'info'
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <User className="w-4 h-4" />
            {t('profile.tabs.additionalInfo')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
              activeTab === 'security'
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Shield className="w-4 h-4" />
            {t('profile.tabs.security')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className={cn(
            'rounded-xl p-6',
            theme === 'dark' ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
          )}>
            <h3 className={cn(
              'text-lg font-semibold mb-4',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {t('profile.additionalInfo.title')}
            </h3>
            <p className={cn(
              'text-sm mb-6',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {t('profile.additionalInfo.subtitle')}
            </p>

            <div className="space-y-4">
              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.fields.bio')}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder={t('profile.fields.bioPlaceholder')}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg resize-none transition-colors',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder:text-gray-600 disabled:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 disabled:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t('profile.fields.website')}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                  className={cn(
                    'w-full px-3 py-2 rounded-lg transition-colors',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder:text-gray-600 disabled:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 disabled:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                  )}
                />
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('profile.fields.location')}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditing}
                  placeholder="City, Country"
                  className={cn(
                    'w-full px-3 py-2 rounded-lg transition-colors',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder:text-gray-600 disabled:text-gray-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 disabled:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className={cn(
              'rounded-xl p-6',
              theme === 'dark' ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-gray-200'
            )}>
              <h3 className={cn(
                'text-lg font-semibold mb-4',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {t('profile.security.title')}
              </h3>

              <div className={cn(
                'flex items-center justify-between p-4 rounded-lg',
                theme === 'dark' ? 'bg-[#0a0a0a] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'
              )}>
                <div>
                  <h4 className={cn(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {t('profile.security.changePassword.title')}
                  </h4>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {t('profile.security.changePassword.subtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    theme === 'dark'
                      ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  {t('profile.security.changePassword.update')}
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className={cn(
              'rounded-xl p-6 border-red-500/30',
              theme === 'dark' ? 'bg-[#1a1a1a] border' : 'bg-white border'
            )}>
              <h3 className="text-lg font-semibold mb-2 text-red-500 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('profile.deleteAccount.title')}
              </h3>
              <p className={cn(
                'text-sm mb-4',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {t('profile.deleteAccount.description')}
              </p>

              <div className={cn(
                'rounded-lg p-4 mb-4',
                theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
              )}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-500">{t('profile.deleteAccount.dangerZone')}</h4>
                    <p className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {t('profile.deleteAccount.warning')}
                    </p>
                    <ul className={cn(
                      'list-disc list-inside space-y-1 text-sm',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      <li>{t('profile.deleteAccount.consequences.dataDeleted')}</li>
                      <li>{t('profile.deleteAccount.consequences.loseAccess')}</li>
                      <li>{t('profile.deleteAccount.consequences.cannotUndo')}</li>
                    </ul>
                    <p className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Learn more:{' '}
                      <Link
                        to="/data-deletion"
                        className="text-[#0D9488] hover:underline inline-flex items-center gap-1"
                      >
                        Data Deletion Policy
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('profile.deleteAccount.button')}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={cn(
            'w-full max-w-md rounded-xl p-6 m-4',
            theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(
                'text-lg font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {t('profile.passwordModal.title')}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={cn(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={cn(
              'text-sm mb-4',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {t('profile.passwordModal.description')}
            </p>

            <div className="space-y-4">
              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.passwordModal.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={cn(
                      'w-full px-3 py-2 pr-10 rounded-lg',
                      theme === 'dark'
                        ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-900',
                      'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2',
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.passwordModal.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={cn(
                      'w-full px-3 py-2 pr-10 rounded-lg',
                      theme === 'dark'
                        ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-900',
                      'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2',
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={cn(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {t('profile.passwordModal.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg',
                    theme === 'dark'
                      ? 'bg-[#0a0a0a] border border-[#2a2a2a] text-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]'
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {t('profile.passwordModal.cancel')}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#0D9488] text-white hover:bg-[#0F766E] transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('profile.passwordModal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={cn(
            'w-full max-w-md rounded-xl p-6 m-4',
            theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
          )}>
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">{t('profile.deleteModal.title')}</h3>
            </div>

            <p className={cn(
              'text-sm mb-4',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {t('profile.deleteModal.description')}
            </p>

            <div className={cn(
              'rounded-lg p-4 mb-4',
              theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            )}>
              <ul className={cn(
                'list-disc list-inside space-y-1 text-sm',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                <li>{t('profile.deleteModal.consequences.dataDeleted')}</li>
                <li>{t('profile.deleteModal.consequences.conversationsRemoved')}</li>
                <li>{t('profile.deleteModal.consequences.cannotUndo')}</li>
              </ul>
            </div>

            {deleteLoading && (
              <div className={cn(
                'rounded-lg p-4 mb-4',
                theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
              )}>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-500">{t('profile.deleteModal.deleting')}</p>
                    <p className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {t('profile.deleteModal.pleaseWait')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {t('profile.deleteModal.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('profile.deleteModal.deletingButton')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('profile.deleteModal.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper */}
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            if (selectedImage) {
              URL.revokeObjectURL(selectedImage);
              setSelectedImage(null);
            }
          }}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
          cropShape="round"
          title="Crop Avatar"
        />
      )}
    </div>
  );
}
