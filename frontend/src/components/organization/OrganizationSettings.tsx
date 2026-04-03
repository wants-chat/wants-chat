/**
 * OrganizationSettings Component
 *
 * Full organization settings panel with tabs for general, members, and danger zone.
 */

import { useState, useEffect } from 'react';
import {
  Building2,
  Settings,
  Trash2,
  Loader2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  getOrganization,
  updateOrganization,
  deleteOrganization,
  leaveOrganization,
  Organization,
} from '@/services/organizationApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrganizationSettingsProps {
  organizationId: string;
  currentUserId?: string;
  onOrganizationDeleted?: () => void;
  onOrganizationLeft?: () => void;
}

export function OrganizationSettings({
  organizationId,
  onOrganizationDeleted,
  onOrganizationLeft,
}: OrganizationSettingsProps) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Check if user is owner - compare owner_id with user.id
  // Backend handles actual permissions, this is just for UI display
  const isOwner = !!(user?.id && organization?.owner_id && organization.owner_id === user.id);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const org = await getOrganization(organizationId);
        setOrganization(org);
        setName(org.name);
        setDescription(org.description || '');
      } catch (error) {
        console.error('Failed to fetch organization:', error);
        toast.error('Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  const handleSaveGeneral = async () => {
    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setSaving(true);

    try {
      const updated = await updateOrganization(organizationId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setOrganization(updated);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== organization?.name) {
      toast.error('Please type the organization name to confirm');
      return;
    }

    setDeleting(true);

    try {
      await deleteOrganization(organizationId);
      toast.success('Organization deleted successfully');
      onOrganizationDeleted?.();
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);

    try {
      await leaveOrganization(organizationId);
      toast.success('You have left the organization');
      onOrganizationLeft?.();
    } catch (error) {
      console.error('Failed to leave organization:', error);
      toast.error('Failed to leave organization');
    } finally {
      setLeaving(false);
      setShowLeaveDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12 text-gray-500">
        Organization not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{organization.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organization Settings</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            className="flex items-center gap-2 text-red-600 dark:text-red-400 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">General Settings</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-slate-700 dark:text-slate-200">Organization Name</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  placeholder="Enter organization name"
                  className="text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-description" className="text-slate-700 dark:text-slate-200">Description</Label>
                <Textarea
                  id="org-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  placeholder="What does this organization work on?"
                  rows={3}
                  className="text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>

              <Button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Irreversible actions that affect the entire organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Leave Organization (for non-owners) */}
              {!isOwner && (
                <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Leave Organization</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Remove yourself from this organization
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveDialog(true)}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    Leave Organization
                  </Button>
                </div>
              )}

              {/* Delete Organization (owners only) */}
              {isOwner && (
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50 dark:border-red-900 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium text-red-600">Delete Organization</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Permanently delete this organization and all its data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Organization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Organization Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Leave Organization</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to leave <strong>{organization.name}</strong>?
              You will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600" disabled={leaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={leaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {leaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Leave Organization'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Delete Organization</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-slate-600 dark:text-slate-400">
              <p>
                This action <strong>cannot be undone</strong>. This will
                permanently delete the organization <strong>{organization.name}</strong>{' '}
                and remove all members.
              </p>
              <p className="text-sm">
                Please type <strong>{organization.name}</strong> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type organization name to confirm"
                disabled={deleting}
                className="text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600" disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || deleteConfirmText !== organization.name}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Organization'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default OrganizationSettings;
