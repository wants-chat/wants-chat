// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { AuthorProfile, SocialLinks } from '../../types/blog';
import { SEO } from '../../components/SEO';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/sonner';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User, Globe, Twitter, Github, Linkedin, Instagram, Facebook, Loader2, Save } from 'lucide-react';

const EditAuthorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: '',
    github: '',
    linkedin: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/blog/user/profile');
        const data = response.data || response;

        setDisplayName(data.display_name || data.displayName || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || data.avatarUrl || '');
        setWebsite(data.website || '');
        setSocialLinks({
          twitter: data.social_links?.twitter || data.socialLinks?.twitter || '',
          github: data.social_links?.github || data.socialLinks?.github || '',
          linkedin: data.social_links?.linkedin || data.socialLinks?.linkedin || '',
          instagram: data.social_links?.instagram || data.socialLinks?.instagram || '',
          facebook: data.social_links?.facebook || data.socialLinks?.facebook || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Set defaults if profile doesn't exist
        setDisplayName(user?.name || '');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/blog/user/profile', {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        website,
        social_links: socialLinks,
      });

      toast.success('Profile updated successfully!');
      navigate(`/blog/author/${user?.id}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Edit Profile | Wants AI Blog"
        description="Edit your author profile"
        url="/blog/profile/edit"
        noindex={true}
      />
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <main className="container mx-auto max-w-3xl px-4 py-8 relative z-10">
          <GlassCard>
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white/60 hover:text-teal-400 transition-colors rounded-lg hover:bg-white/10"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-white">Edit Author Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center overflow-hidden border-4 border-white/20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-white/5 border-white/20"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell readers about yourself..."
                    className="w-full min-h-[120px] rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                    maxLength={500}
                  />
                  <p className="text-xs text-white/50 mt-1">{bio.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Avatar URL
                  </label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-avatar.jpg"
                    className="bg-white/5 border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Personal Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="border-t border-white/20 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Twitter className="w-4 h-4 inline mr-2" />
                      Twitter / X
                    </label>
                    <Input
                      value={socialLinks.twitter || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/yourusername"
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Github className="w-4 h-4 inline mr-2" />
                      GitHub
                    </label>
                    <Input
                      value={socialLinks.github || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/yourusername"
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Linkedin className="w-4 h-4 inline mr-2" />
                      LinkedIn
                    </label>
                    <Input
                      value={socialLinks.linkedin || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Instagram className="w-4 h-4 inline mr-2" />
                      Instagram
                    </label>
                    <Input
                      value={socialLinks.instagram || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="https://instagram.com/yourusername"
                      className="bg-white/5 border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Facebook className="w-4 h-4 inline mr-2" />
                      Facebook
                    </label>
                    <Input
                      value={socialLinks.facebook || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/yourusername"
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="border border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Profile
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </main>
      </div>
    </>
  );
};

export default EditAuthorProfile;