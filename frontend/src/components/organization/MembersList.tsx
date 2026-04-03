/**
 * MembersList Component
 *
 * Displays and manages organization members with role management.
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  MoreVertical,
  Shield,
  ShieldCheck,
  User,
  Eye,
  Crown,
  Loader2,
  UserMinus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  OrganizationMember,
  OrganizationRole,
} from '@/services/organizationApi';
import { toast } from 'sonner';

interface MembersListProps {
  organizationId: string;
  currentUserRole: OrganizationRole;
  currentUserId: string;
}

export function MembersList({
  organizationId,
  currentUserRole,
  currentUserId,
}: MembersListProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  const fetchMembers = async () => {
    try {
      const data = await getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load organization members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const handleRoleChange = async (
    memberId: string,
    newRole: OrganizationRole
  ) => {
    setActionLoading(memberId);

    try {
      await updateMemberRole(organizationId, memberId, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setActionLoading(memberToRemove.id);

    try {
      await removeMember(organizationId, memberToRemove.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      toast.success('Member removed from organization');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    } finally {
      setActionLoading(null);
      setMemberToRemove(null);
    }
  };

  const getRoleIcon = (role: OrganizationRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <User className="w-4 h-4 text-gray-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeVariant = (role: OrganizationRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      case 'viewer':
        return 'outline';
    }
  };

  const roleLabels: Record<OrganizationRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h3 className="font-medium text-slate-900 dark:text-white">Organization Members ({members.length})</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchMembers}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Members List */}
      <div className="border rounded-lg divide-y border-slate-200 dark:border-slate-700 divide-slate-200 dark:divide-slate-700">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const canManageThisMember =
            canManageMembers &&
            !isCurrentUser &&
            member.role !== 'owner' &&
            (isOwner || member.role !== 'admin');

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium">
                    {member.user?.fullName?.[0]?.toUpperCase() ||
                      member.user?.email?.[0]?.toUpperCase() ||
                      '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                      {member.user?.fullName || 'Unknown User'}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {member.user?.email || 'No email'}
                  </p>
                </div>
              </div>

              {/* Role & Actions */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={getRoleBadgeVariant(member.role)}
                  className="flex items-center gap-1"
                >
                  {getRoleIcon(member.role)}
                  {roleLabels[member.role]}
                </Badge>

                {canManageThisMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={actionLoading === member.id}
                      >
                        {actionLoading === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {isOwner && member.role !== 'admin' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'admin')}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2 text-blue-500" />
                          Make Admin
                        </DropdownMenuItem>
                      )}

                      {member.role !== 'member' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'member')}
                        >
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          Make Member
                        </DropdownMenuItem>
                      )}

                      {member.role !== 'viewer' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'viewer')}
                        >
                          <Eye className="w-4 h-4 mr-2 text-gray-400" />
                          Make Viewer
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => setMemberToRemove(member)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No organization members yet</p>
          </div>
        )}
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Remove Organization Member</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to remove{' '}
              <strong>
                {memberToRemove?.user?.fullName || memberToRemove?.user?.email}
              </strong>{' '}
              from the organization? They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600" disabled={actionLoading !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={actionLoading !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MembersList;
