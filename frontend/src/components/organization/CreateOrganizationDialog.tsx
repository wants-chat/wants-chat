/**
 * CreateOrganizationDialog Component
 *
 * Dialog to create a new organization/team.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { createOrganization, Organization } from '@/services/organizationApi';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (org: Organization) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrganizationDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('createOrganization.enterName'));
      return;
    }

    setLoading(true);

    try {
      const newOrg = await createOrganization({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      toast.success(t('createOrganization.createdSuccess'));
      onCreated(newOrg);

      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error(t('createOrganization.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{t('createOrganization.title')}</DialogTitle>
              <DialogDescription>
                {t('createOrganization.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">{t('createOrganization.nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('createOrganization.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
                className="text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">{t('createOrganization.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('createOrganization.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className="text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t('createOrganization.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('createOrganization.creating')}
                </>
              ) : (
                t('createOrganization.createOrganization')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrganizationDialog;
