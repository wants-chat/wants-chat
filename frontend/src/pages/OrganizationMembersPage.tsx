/**
 * OrganizationMembersPage
 *
 * Page for managing organization members with invite functionality.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, UserPlus, Loader2, Mail, X, RefreshCw } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MembersList } from '@/components/organization/MembersList';
import { InviteMembersDialog } from '@/components/organization/InviteMembersDialog';
import {
  getOrganization,
  getPendingInvitations,
  cancelInvitation,
  resendInvitation,
  Organization,
  OrganizationInvitation,
} from '@/services/organizationApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function OrganizationMembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<OrganizationInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
  }, [orgId]);

  const fetchOrganization = async () => {
    if (!orgId) return;

    try {
      const org = await getOrganization(orgId);
      setOrganization(org);
      // Fetch invitations if user can invite (check role OR owner_id)
      const isOwnerById = org?.owner_id === user?.id;
      const userRole = org?.userRole || org?.current_user_role || (isOwnerById ? 'owner' : 'member');
      if (userRole === 'owner' || userRole === 'admin' || isOwnerById) {
        fetchPendingInvitations();
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      toast.error('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!orgId) return;
    setInvitationsLoading(true);
    try {
      const invitations = await getPendingInvitations(orgId);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!orgId) return;
    setActionLoading(invitationId);
    try {
      await cancelInvitation(orgId, invitationId);
      setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      toast.error('Failed to cancel invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!orgId) return;
    setActionLoading(invitationId);
    try {
      await resendInvitation(orgId, invitationId);
      toast.success('Invitation resent');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error('Failed to resend invitation');
    } finally {
      setActionLoading(null);
    }
  };

  if (!orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Organization Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            The organization you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/chat')}>
            Go to Chat
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Organization Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            The organization you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate('/chat')}>
            Go to Chat
          </Button>
        </div>
      </div>
    );
  }

  // Backend handles permissions - always show Invite button (backend will reject if unauthorized)
  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {organization.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Members
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Members List */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Organization Members</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage who has access to this organization
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </CardHeader>
          <CardContent>
            <MembersList
              organizationId={orgId}
              currentUserRole={organization?.userRole || organization?.current_user_role || 'member'}
              currentUserId={user?.id || ''}
            />
          </CardContent>
        </Card>

        {/* Pending Invitations - always show, backend handles permissions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">Pending Invitations</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Invitations waiting to be accepted
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchPendingInvitations}
                disabled={invitationsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${invitationsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {invitationsLoading && pendingInvitations.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : pendingInvitations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {invitation.email}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="text-xs capitalize">
                              {invitation.role}
                            </Badge>
                            <span>
                              Sent{' '}
                              {formatDistanceToNow(new Date(invitation.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                          disabled={actionLoading === invitation.id}
                          className="text-teal-600 hover:text-teal-700"
                        >
                          {actionLoading === invitation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Resend'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={actionLoading === invitation.id}
                          className="text-red-500 hover:text-red-600"
                        >
                          {actionLoading === invitation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Invite Dialog */}
      <InviteMembersDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organizationId={orgId}
        organizationName={organization.name}
        onInviteSent={fetchPendingInvitations}
      />
    </div>
  );
}
