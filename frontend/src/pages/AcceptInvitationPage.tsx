/**
 * AcceptInvitationPage - Handle organization invitation acceptance flow
 *
 * Route: /invite/:token
 *
 * This page handles the flow when a user clicks an invitation link from their email:
 * 1. Extracts token from URL params
 * 2. Fetches invitation details
 * 3. Displays organization info, role, inviter, expiration
 * 4. Handles various states: loading, not authenticated, wrong email, already accepted, expired
 * 5. Accept/Decline buttons with appropriate redirects
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  UserPlus,
  Shield,
  LogIn,
  Loader2,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  getRoleDisplayName,
  getRoleBadgeColor,
  type PublicInvitation,
  type AcceptInvitationResponse,
} from '@/services/organizationApi';

// ============================================
// TYPES
// ============================================

type InvitationState =
  | 'loading'
  | 'not_authenticated'
  | 'valid'
  | 'wrong_email'
  | 'expired'
  | 'invalid'
  | 'already_accepted';

// ============================================
// MAIN COMPONENT
// ============================================

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [state, setState] = useState<InvitationState>('loading');
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setState('invalid');
        setErrorMessage('Invalid invitation link. No token provided.');
        return;
      }

      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      try {
        const data = await getInvitationByToken(token);

        if (!data) {
          setState('invalid');
          setErrorMessage('This invitation does not exist or has been cancelled.');
          return;
        }

        setInvitation(data);

        // Check if invitation is valid
        if (!data.is_valid) {
          // Check if expired
          if (data.expires_at && new Date(data.expires_at) < new Date()) {
            setState('expired');
            setErrorMessage('This invitation has expired. Please request a new invitation.');
          } else {
            setState('invalid');
            setErrorMessage('This invitation is no longer valid.');
          }
          return;
        }

        // Check authentication state
        if (!isAuthenticated) {
          setState('not_authenticated');
          return;
        }

        // Check if email matches
        if (user && user.email !== data.email) {
          setState('wrong_email');
          setErrorMessage(
            `This invitation was sent to ${data.email}. You are currently logged in as ${user.email}. Please log out and sign in with the correct email address.`
          );
          return;
        }

        // Valid invitation for authenticated user with matching email
        setState('valid');
      } catch (error: any) {
        console.error('Failed to fetch invitation:', error);

        // If user is authenticated and invitation is invalid, they might have already accepted
        if (isAuthenticated) {
          setState('already_accepted');
          setErrorMessage(
            'This invitation may have already been accepted. Redirecting to your organizations...'
          );
          setTimeout(() => {
            navigate('/chat');
          }, 2000);
          return;
        }

        setState('invalid');
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            'Unable to load invitation. It may be invalid or expired.'
        );
      }
    };

    fetchInvitation();
  }, [token, isAuthenticated, user, authLoading, navigate]);

  // Handle accept invitation
  const handleAccept = async () => {
    if (!token) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      localStorage.setItem('pendingInvitation', token);
      toast.info('Please log in or create an account to accept this invitation');
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    // Verify email matches
    if (user && invitation && user.email !== invitation.email) {
      toast.error(
        `This invitation is for ${invitation.email}. Please log in with that email address.`
      );
      return;
    }

    try {
      setAccepting(true);
      const response: AcceptInvitationResponse = await acceptInvitation(token);

      toast.success('Invitation accepted! Welcome to the organization.');

      // Clear pending invitation from storage
      localStorage.removeItem('pendingInvitation');

      // Redirect to organization or chat
      setTimeout(() => {
        if (response.organization_id) {
          navigate(`/chat`); // Could navigate to org-specific page if available
        } else {
          navigate('/chat');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      const errorMsg =
        error.response?.data?.message || error.message || 'Failed to accept invitation';

      // If error suggests user needs to log in
      if (
        errorMsg.toLowerCase().includes('log in') ||
        errorMsg.toLowerCase().includes('account') ||
        errorMsg.toLowerCase().includes('unauthorized')
      ) {
        localStorage.setItem('pendingInvitation', token);
        toast.error('Please log in or create an account first');
        navigate(`/login?redirect=/invite/${token}`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setAccepting(false);
    }
  };

  // Handle decline invitation
  const handleDecline = async () => {
    if (!token) return;

    if (!confirm('Are you sure you want to decline this invitation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeclining(true);
      await declineInvitation(token);
      toast.success('Invitation declined');
      navigate('/');
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setDeclining(false);
    }
  };

  // Format expiration date
  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else if (diffDays <= 7) {
      return `Expires in ${diffDays} days`;
    } else {
      return `Expires on ${date.toLocaleDateString()}`;
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (state === 'loading' || authLoading) {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center',
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
        )}
      >
        <div className="text-center">
          <Loader2
            className={cn(
              'h-12 w-12 animate-spin mx-auto mb-4',
              theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
            )}
          />
          <p className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
            Loading invitation...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATES
  // ============================================

  if (state === 'invalid' || state === 'expired' || state === 'already_accepted') {
    const isExpired = state === 'expired';
    const isAlreadyAccepted = state === 'already_accepted';

    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center p-4',
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
        )}
      >
        <div
          className={cn(
            'w-full max-w-md rounded-2xl p-8 text-center shadow-xl',
            theme === 'dark'
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-slate-200'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              isAlreadyAccepted
                ? theme === 'dark'
                  ? 'bg-teal-500/20'
                  : 'bg-teal-100'
                : isExpired
                ? theme === 'dark'
                  ? 'bg-amber-500/20'
                  : 'bg-amber-100'
                : theme === 'dark'
                ? 'bg-red-500/20'
                : 'bg-red-100'
            )}
          >
            {isAlreadyAccepted ? (
              <CheckCircle
                className={cn(
                  'w-8 h-8',
                  theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                )}
              />
            ) : isExpired ? (
              <Clock
                className={cn(
                  'w-8 h-8',
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )}
              />
            ) : (
              <AlertTriangle
                className={cn('w-8 h-8', theme === 'dark' ? 'text-red-400' : 'text-red-600')}
              />
            )}
          </div>

          <h1
            className={cn(
              'text-2xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            {isAlreadyAccepted
              ? 'Already Accepted'
              : isExpired
              ? 'Invitation Expired'
              : 'Invalid Invitation'}
          </h1>

          <p className={cn('mb-6', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isExpired && (
              <button
                onClick={() => navigate('/contact')}
                className={cn(
                  'px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                )}
              >
                <RefreshCw className="w-5 h-5" />
                Request New Invite
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: WRONG EMAIL STATE
  // ============================================

  if (state === 'wrong_email') {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center p-4',
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
        )}
      >
        <div
          className={cn(
            'w-full max-w-md rounded-2xl p-8 text-center shadow-xl',
            theme === 'dark'
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-slate-200'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            )}
          >
            <XCircle
              className={cn('w-8 h-8', theme === 'dark' ? 'text-amber-400' : 'text-amber-600')}
            />
          </div>

          <h1
            className={cn(
              'text-2xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Wrong Account
          </h1>

          <p className={cn('mb-6', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
            {errorMessage}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                // Store token for after login
                if (token) localStorage.setItem('pendingInvitation', token);
                navigate(`/login?redirect=/invite/${token}`);
              }}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Switch Account
            </button>
            <button
              onClick={() => navigate('/')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              )}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: VALID INVITATION
  // ============================================

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      )}
    >
      <div
        className={cn(
          'w-full max-w-md rounded-2xl shadow-xl overflow-hidden',
          theme === 'dark'
            ? 'bg-slate-800/50 border border-slate-700'
            : 'bg-white border border-slate-200'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">You're Invited!</h1>
          <p className="text-teal-100">Join your team on Wants</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Organization Info */}
          <div
            className={cn(
              'p-4 rounded-xl',
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  theme === 'dark' ? 'bg-teal-500/20' : 'bg-teal-100'
                )}
              >
                {invitation?.organization_logo ? (
                  <img
                    src={invitation.organization_logo}
                    alt={invitation.organization_name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <Building2
                    className={cn(
                      'w-5 h-5',
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    )}
                  />
                )}
              </div>
              <div>
                <h3
                  className={cn(
                    'font-semibold',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {invitation?.organization_name || 'Organization'}
                </h3>
                <p
                  className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Organization
                </p>
              </div>
            </div>
          </div>

          {/* Invitation Details */}
          <div
            className={cn(
              'p-4 rounded-xl space-y-3',
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            )}
          >
            <h3
              className={cn(
                'font-semibold mb-3',
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              )}
            >
              Invitation Details
            </h3>

            {/* Role */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield
                  className={cn(
                    'w-4 h-4',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <span className={cn(theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                  Role
                </span>
              </div>
              <span
                className={cn(
                  'px-2 py-1 text-sm font-medium rounded-full capitalize',
                  invitation?.role ? getRoleBadgeColor(invitation.role) : ''
                )}
              >
                {invitation?.role ? getRoleDisplayName(invitation.role) : 'Member'}
              </span>
            </div>

            {/* Invited by */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus
                  className={cn(
                    'w-4 h-4',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}
                />
                <span className={cn(theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                  Invited by
                </span>
              </div>
              <span
                className={cn(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}
              >
                {invitation?.inviter_name || 'Team member'}
              </span>
            </div>

            {/* Expiration */}
            {invitation?.expires_at && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock
                    className={cn(
                      'w-4 h-4',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    )}
                  />
                  <span className={cn(theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                    Expires
                  </span>
                </div>
                <span
                  className={cn(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {formatExpirationDate(invitation.expires_at)}
                </span>
              </div>
            )}
          </div>

          {/* Not Authenticated Warning */}
          {state === 'not_authenticated' && (
            <div
              className={cn(
                'p-4 rounded-lg border flex items-start gap-3',
                theme === 'dark'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-50 border-amber-200'
              )}
            >
              <AlertTriangle
                className={cn(
                  'w-5 h-5 flex-shrink-0 mt-0.5',
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )}
              />
              <p
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
                )}
              >
                You need to log in or create an account to accept this invitation. Make sure to use
                the email address: <strong>{invitation?.email}</strong>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDecline}
              disabled={declining || accepting}
              className={cn(
                'flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200',
                (declining || accepting) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {declining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>Decline</span>
            </button>

            <button
              onClick={handleAccept}
              disabled={accepting || declining}
              className={cn(
                'flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2',
                (accepting || declining) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {accepting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Accepting...</span>
                </>
              ) : state === 'not_authenticated' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Log In to Accept</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Accept Invitation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            'px-6 py-4 text-center border-t',
            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          <p className={cn('text-xs', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
            By accepting this invitation, you agree to join this organization and follow their
            policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
