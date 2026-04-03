/**
 * PendingInvitations Component
 *
 * Shows pending invitations for the current user to accept/decline.
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Building2,
  Check,
  X,
  Loader2,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getMyPendingInvitations,
  acceptInvitation,
  declineInvitation,
  OrganizationInvitation,
} from '@/services/organizationApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PendingInvitationsProps {
  onInvitationAccepted?: () => void;
}

export function PendingInvitations({
  onInvitationAccepted,
}: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const data = await getMyPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (invitationId: string) => {
    setActionLoading(invitationId);

    try {
      await acceptInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success('You have joined the team!');
      onInvitationAccepted?.();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setActionLoading(invitationId);

    try {
      await declineInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success('Invitation declined');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      toast.error('Failed to decline invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const roleLabels = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (invitations.length === 0) {
    return null; // Don't show if no pending invitations
  }

  return (
    <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-teal-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {invitations.length}
            </span>
          </div>
          <CardTitle className="text-lg">Team Invitations</CardTitle>
        </div>
        <CardDescription>
          You have pending invitations to join teams
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {invitation.organization?.name || 'Unknown Team'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">
                    {roleLabels[invitation.role]}
                  </Badge>
                  <span>
                    Invited{' '}
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
                onClick={() => handleDecline(invitation.id)}
                disabled={actionLoading === invitation.id}
              >
                {actionLoading === invitation.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.id)}
                disabled={actionLoading === invitation.id}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {actionLoading === invitation.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default PendingInvitations;
