import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Crown,
  Check,
  Clock,
  Trash2,
  Mail,
  LogOut,
  Sparkles,
  Shield,
  Cloud,
  Headphones,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useFamilyMembers,
  useFamilyMembership,
  useInviteFamilyMember,
  useRemoveFamilyMember,
  useLeaveFamilyMembership,
} from '@/lib/api/family-api';
import { useSubscription } from '@/lib/api/billing-api';
import { toast } from 'sonner';

const PREMIUM_FEATURES = [
  { icon: <Sparkles className="w-5 h-5" />, text: 'Access to all 70+ apps' },
  { icon: <Shield className="w-5 h-5" />, text: '100 AI requests per day' },
  { icon: <Cloud className="w-5 h-5" />, text: 'Cloud sync across devices' },
  { icon: <Headphones className="w-5 h-5" />, text: 'Priority support' },
];

const FamilyMembership: React.FC = () => {
  const navigate = useNavigate();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: familyMembers, isLoading: membersLoading, refetch: refetchMembers } = useFamilyMembers();
  const { data: membershipStatus, isLoading: membershipLoading } = useFamilyMembership();

  const inviteMutation = useInviteFamilyMember();
  const removeMutation = useRemoveFamilyMember();
  const leaveMutation = useLeaveFamilyMembership();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const isPremium = subscription?.plan === 'premium';
  const isFamilyMember = membershipStatus?.isFamilyMember || false;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
      });
      toast.success('Invitation sent successfully!');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteName('');
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMutation.mutateAsync(memberId);
      toast.success('Member removed');
      setShowRemoveDialog(null);
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      toast.success('Left family membership');
      setShowLeaveDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave family');
    }
  };

  const isLoading = subLoading || membersLoading || membershipLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Family Member View (non-owner who is part of a family)
  if (isFamilyMember && membershipStatus?.membership) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Family Membership</h1>
                <p className="text-white/60 text-sm">You're part of a family plan</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Status Card */}
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-green-500/20">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">Family Member</h2>
                  <p className="text-green-300">Premium access active</p>
                  {membershipStatus.membership.acceptedAt && (
                    <p className="text-white/40 text-sm mt-1">
                      Joined {new Date(membershipStatus.membership.acceptedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Premium Features Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {PREMIUM_FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="text-purple-400">{feature.icon}</div>
                    <span className="text-white text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leave Button */}
          <Button
            variant="outline"
            onClick={() => setShowLeaveDialog(true)}
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Family Membership
          </Button>
        </div>

        {/* Leave Confirmation Dialog */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Leave Family Membership?</DialogTitle>
              <DialogDescription className="text-white/60">
                You will lose access to Premium features. You can rejoin if the owner invites
                you again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? 'Leaving...' : 'Leave Family'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Owner View (Premium users who can manage family)
  if (isPremium) {
    const members = familyMembers?.members || [];
    const maxMembers = familyMembers?.maxMembers || 5;
    const remainingSlots = familyMembers?.remainingSlots || 5;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white">Family Membership</h1>
                  <p className="text-white/60 text-sm">
                    Share your Premium with family
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Stats Card */}
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-purple-500/20">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Family Members</h2>
                    <p className="text-white/60">
                      {members.length} of {maxMembers} slots used
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{remainingSlots}</p>
                  <p className="text-white/40 text-sm">slots available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Members</CardTitle>
              {remainingSlots > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No family members yet</p>
                  <p className="text-white/40 text-sm mt-1">
                    Invite up to {maxMembers} family members to share your Premium
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 font-bold">
                            {(member.memberName || member.memberEmail).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {member.memberName || member.memberEmail}
                          </p>
                          {member.memberName && (
                            <p className="text-white/40 text-sm">{member.memberEmail}</p>
                          )}
                          {member.acceptedAt && (
                            <p className="text-white/40 text-xs">
                              Joined {new Date(member.acceptedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            member.status === 'accepted'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }
                        >
                          {member.status === 'accepted' ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/40">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-white/10">
                            <DropdownMenuItem
                              onClick={() => setShowRemoveDialog(member.id)}
                              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-3">How it works</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  Invite family members by email
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  If they have an account, they're added automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">3.</span>
                  If not, they'll get Premium when they sign up with that email
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">4.</span>
                  Each member gets full Premium access
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Invite Family Member
              </DialogTitle>
              <DialogDescription className="text-white/60">
                They'll get full Premium access to all 70+ apps
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="family@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Name (optional)</Label>
                <Input
                  placeholder="Family member's name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Confirmation Dialog */}
        <Dialog open={!!showRemoveDialog} onOpenChange={() => setShowRemoveDialog(null)}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Remove Family Member?</DialogTitle>
              <DialogDescription className="text-white/60">
                They will lose access to Premium features immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowRemoveDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showRemoveDialog && handleRemove(showRemoveDialog)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? 'Removing...' : 'Remove Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Non-Premium View (upgrade prompt)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Family Membership</h1>
              <p className="text-white/60 text-sm">Premium feature</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-purple-500/20 w-fit mx-auto mb-6">
              <Crown className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Share your subscription with up to 5 family members. Everyone gets full
              access to all Premium features.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
              {PREMIUM_FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-left">
                  <div className="text-purple-400">{feature.icon}</div>
                  <span className="text-white text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate('/billing')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-8"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyMembership;
