/**
 * InviteMembersDialog Component
 *
 * Dialog to invite new members to an organization via email.
 */

import { useState } from 'react';
import { Mail, UserPlus, Loader2, X, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  inviteMember,
  OrganizationRole,
} from '@/services/organizationApi';
import { toast } from 'sonner';

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  onInviteSent?: () => void;
}

interface PendingInvite {
  email: string;
  role: OrganizationRole;
}

export function InviteMembersDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onInviteSent,
}: InviteMembersDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('member');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addToList = () => {
    if (!email.trim()) return;

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (pendingInvites.some((inv) => inv.email === email)) {
      toast.error('This email is already in the list');
      return;
    }

    setPendingInvites((prev) => [...prev, { email: email.trim(), role }]);
    setEmail('');
  };

  const removeFromList = (emailToRemove: string) => {
    setPendingInvites((prev) =>
      prev.filter((inv) => inv.email !== emailToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToList();
    }
  };

  const handleSendInvites = async () => {
    if (pendingInvites.length === 0) {
      toast.error('Please add at least one email to invite');
      return;
    }

    setLoading(true);

    try {
      // Send invitations one by one
      const results = await Promise.allSettled(
        pendingInvites.map((invite) =>
          inviteMember(organizationId, {
            email: invite.email,
            role: invite.role,
          })
        )
      );

      const successCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      const failCount = results.filter((r) => r.status === 'rejected').length;

      if (successCount > 0) {
        toast.success(
          `${successCount} invitation${successCount > 1 ? 's' : ''} sent successfully!`
        );
        onInviteSent?.();
      }

      if (failCount > 0) {
        toast.error(`${failCount} invitation${failCount > 1 ? 's' : ''} failed to send`);
      }

      // Clear successfully sent invites
      if (successCount === pendingInvites.length) {
        setPendingInvites([]);
        onOpenChange(false);
      } else {
        // Keep failed ones in the list
        const failedEmails = results
          .map((r, i) => (r.status === 'rejected' ? pendingInvites[i] : null))
          .filter(Boolean) as PendingInvite[];
        setPendingInvites(failedEmails);
      }
    } catch (error) {
      console.error('Failed to send invitations:', error);
      toast.error('Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setPendingInvites([]);
      setInviteLink(null);
      onOpenChange(false);
    }
  };

  const roleLabels: Record<OrganizationRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };

  const roleDescriptions: Record<OrganizationRole, string> = {
    owner: 'Full access and ownership transfer rights',
    admin: 'Manage members and settings',
    member: 'Full access to workspace features',
    viewer: 'View-only access',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-slate-900 dark:text-white">Invite Members</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Invite people to join <strong>{organizationName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-200">Email Address</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="pl-9 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as OrganizationRole)}
              >
                <SelectTrigger className="w-32 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="member" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-white data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-900 dark:data-[highlighted]:text-white">
                    <div className="text-left">
                      <div className="font-medium">Member</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-white data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-900 dark:data-[highlighted]:text-white">
                    <div className="text-left">
                      <div className="font-medium">Admin</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-white data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-900 dark:data-[highlighted]:text-white">
                    <div className="text-left">
                      <div className="font-medium">Viewer</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addToList}
                disabled={loading || !email.trim()}
                variant="outline"
                className="text-slate-700 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {roleDescriptions[role]}
            </p>
          </div>

          {/* Pending Invites List */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-200">Invitations to Send ({pendingInvites.length})</Label>
              <div className="border rounded-lg divide-y border-slate-200 dark:border-slate-700 divide-slate-200 dark:divide-slate-700 max-h-48 overflow-y-auto">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.email}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                          {invite.email}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {roleLabels[invite.role]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromList(invite.email)}
                      disabled={loading}
                      className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite Link (if generated) */}
          {inviteLink && (
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-200">Shareable Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                />
                <Button
                  variant="outline"
                  onClick={copyInviteLink}
                  className="flex-shrink-0"
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anyone with this link can join as a Member
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="text-slate-700 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendInvites}
            disabled={loading || pendingInvites.length === 0}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send {pendingInvites.length} Invitation
                {pendingInvites.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteMembersDialog;
