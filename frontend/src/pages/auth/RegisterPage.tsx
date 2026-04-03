import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import * as organizationApi from '../../services/organizationApi';

// Helper to extract invitation token from various sources
function getInvitationToken(searchParams: URLSearchParams): string | null {
  // Check URL params: ?invite=TOKEN or ?invitation=TOKEN
  const inviteParam = searchParams.get('invite') || searchParams.get('invitation');
  if (inviteParam) return inviteParam;

  // Check redirect param for /invite/TOKEN pattern
  const redirectParam = searchParams.get('redirect');
  if (redirectParam) {
    const inviteMatch = redirectParam.match(/\/invite\/([^/?]+)/);
    if (inviteMatch) return inviteMatch[1];
  }

  // Check localStorage for pending invitation
  const pendingToken = localStorage.getItem('pendingInviteToken');
  if (pendingToken) return pendingToken;

  return null;
}

interface InvitationInfo {
  token: string;
  organizationName?: string;
  invitedEmail?: string;
  isValid: boolean;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);

  // Check for invitation token on mount
  useEffect(() => {
    const checkInvitation = async () => {
      const token = getInvitationToken(searchParams);
      if (token) {
        try {
          // Fetch invitation details to show organization name and pre-fill email
          const inviteDetails = await organizationApi.getInvitationByToken(token);
          if (inviteDetails && inviteDetails.is_valid) {
            setInvitationInfo({
              token,
              organizationName: inviteDetails.organization_name,
              invitedEmail: inviteDetails.email,
              isValid: true,
            });
            // Pre-fill email if available
            if (inviteDetails.email) {
              setEmail(inviteDetails.email);
            }
          } else {
            // Invalid or expired invitation
            setInvitationInfo({ token, isValid: false });
            toast.warning('This invitation link has expired or is invalid');
          }
        } catch (err) {
          console.warn('Failed to fetch invitation details:', err);
          // Still track the token but mark as potentially invalid
          setInvitationInfo({ token, isValid: true });
        }
      }
    };
    checkInvitation();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check email mismatch with invitation
    if (invitationInfo?.invitedEmail && email.toLowerCase() !== invitationInfo.invitedEmail.toLowerCase()) {
      setError(`Please use the invited email address: ${invitationInfo.invitedEmail}`);
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);

      // Check if there's a pending invitation to accept
      if (invitationInfo?.token && invitationInfo.isValid) {
        try {
          const result = await organizationApi.acceptInvitation(invitationInfo.token);
          // Clear the pending token from localStorage
          localStorage.removeItem('pendingInviteToken');

          toast.success(
            `Welcome to ${result.organization_name || invitationInfo.organizationName || 'the team'}!`,
            { description: `You've joined as ${result.role || 'member'}` }
          );

          // Redirect to the organization page
          if (result.organization_id) {
            navigate(`/organizations/${result.organization_id}`, { replace: true });
            return;
          }
        } catch (inviteErr: any) {
          console.error('Failed to accept invitation:', inviteErr);
          // Clear invalid token
          localStorage.removeItem('pendingInviteToken');

          // Show warning but continue - user is still registered
          toast.warning('Could not accept invitation', {
            description: inviteErr.message || 'The invitation may have expired'
          });
          // Continue to normal redirect
        }
      }

      // Navigate to chat after registration
      navigate('/chat', { replace: true });
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Create Your Wants Account</CardTitle>
            <CardDescription className="text-gray-400">
              Start your journey to a better organized life
            </CardDescription>
            {/* Invitation indicator */}
            {invitationInfo?.isValid && invitationInfo.organizationName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm">
                  Joining <span className="font-semibold">{invitationInfo.organizationName}</span>
                </span>
              </motion.div>
            )}
            {invitationInfo?.token && !invitationInfo.isValid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg flex items-center justify-center gap-2"
              >
                <span className="text-amber-400 text-sm">
                  Invitation link may be invalid or expired
                </span>
              </motion.div>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              <p className="text-sm text-gray-400 text-center">
                Already have an account?{' '}
                <Link
                  to={invitationInfo?.token ? `/login?invite=${invitationInfo.token}` : '/login'}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};