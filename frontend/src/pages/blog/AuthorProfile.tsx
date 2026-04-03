import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { AuthorProfile as AuthorProfileType, BlogPost } from '../../types/blog';
import { SEO } from '../../components/SEO';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import BlogCard from '../../components/blog/BlogCard';
import { User, Globe, Twitter, Github, Linkedin, Heart, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

const AuthorProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<AuthorProfileType | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await api.get(`/blog/authors/${userId}`);
        const data = response.data || response;
        setProfile({
          id: data.id,
          userId: data.user_id || data.userId,
          displayName: data.display_name || data.displayName,
          bio: data.bio,
          avatarUrl: data.avatar_url || data.avatarUrl,
          website: data.website,
          socialLinks: data.social_links || data.socialLinks || {},
          postsCount: data.posts_count ?? data.postsCount ?? 0,
          totalLikes: data.total_likes ?? data.totalLikes ?? 0,
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        });
      } catch (error) {
        console.error('Failed to fetch author profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;

      setPostsLoading(true);
      try {
        const response = await api.get(`/blog/authors/${userId}/posts?page=${page}&limit=9`);
        const data = response.data || response;
        setPosts(data.data || []);
        setTotalPages(data.total_pages || data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch author posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, page]);

  const isOwnProfile = currentUser?.id === userId;

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

  if (!profile) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
          <GlassCard className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-white/40 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Author Not Found</h2>
            <p className="text-white/60">The author profile you're looking for doesn't exist.</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${profile.displayName || 'Author'} | Wants AI Blog`}
        description={profile.bio || `View posts by ${profile.displayName || 'this author'}`}
        url={`/blog/author/${userId}`}
      />
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <main className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
          {/* Profile Header */}
          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center overflow-hidden border-4 border-white/20">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || 'Author'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.displayName || 'Anonymous Author'}
                </h1>
                {profile.bio && (
                  <p className="text-white/70 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      title="Website"
                    >
                      <Globe className="w-5 h-5 text-white/80" />
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 rounded-full hover:bg-sky-500/20 transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-5 h-5 text-white/80" />
                    </a>
                  )}
                  {profile.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5 text-white/80" />
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 rounded-full hover:bg-blue-600/20 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-white/80" />
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <span className="text-white font-semibold">{profile.postsCount}</span>
                    <span className="text-white/60">Posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">{profile.totalLikes}</span>
                    <span className="text-white/60">Likes</span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                {isOwnProfile && (
                  <div className="mt-4">
                    <Link to="/blog/profile/edit">
                      <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Posts Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Posts by {profile.displayName || 'Author'}</h2>

            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <GlassCard className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-white/40 mb-4" />
                <p className="text-white/60">No posts published yet.</p>
              </GlassCard>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link key={post.id} to={`/blog/details/${post.id}`}>
                      <BlogCard post={post} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="ghost"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border border-white/20 text-white hover:bg-white/10"
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-white/60">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border border-white/20 text-white hover:bg-white/10"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthorProfile;
