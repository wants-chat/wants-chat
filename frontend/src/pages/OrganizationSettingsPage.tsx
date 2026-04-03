/**
 * OrganizationSettingsPage
 *
 * Page wrapper for organization settings with navigation and layout.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrganizationSettings } from '@/components/organization/OrganizationSettings';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';

export default function OrganizationSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleOrganizationDeleted = () => {
    navigate('/chat');
  };

  const handleOrganizationLeft = () => {
    navigate('/chat');
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Organization Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage organization details and members
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <OrganizationSettings
            organizationId={orgId}
            currentUserId={user?.id || ''}
            onOrganizationDeleted={handleOrganizationDeleted}
            onOrganizationLeft={handleOrganizationLeft}
          />
        </main>
      </div>
    </div>
  );
}
