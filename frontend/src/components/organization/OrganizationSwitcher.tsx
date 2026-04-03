/**
 * OrganizationSwitcher Component
 *
 * Dropdown to switch between personal workspace and organization workspaces.
 * Displays in the sidebar/header area.
 */

import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ChevronDown,
  Plus,
  Settings,
  Check,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  getMyOrganizations,
  Organization,
} from '@/services/organizationApi';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

interface OrganizationSwitcherProps {
  /** Currently selected organization ID (null for personal) */
  currentOrgId: string | null;
  /** Callback when organization changes */
  onOrganizationChange: (orgId: string | null) => void;
  /** Optional className for styling */
  className?: string;
}

export function OrganizationSwitcher({
  currentOrgId,
  onOrganizationChange,
  className = '',
}: OrganizationSwitcherProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await getMyOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const currentOrg = currentOrgId
    ? organizations.find((org) => org.id === currentOrgId)
    : null;

  const handleOrgCreated = (newOrg: Organization) => {
    setOrganizations((prev) => [...prev, newOrg]);
    onOrganizationChange(newOrg.id);
    setShowCreateDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full justify-between px-3 py-2 h-auto ${className}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {currentOrg ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {currentOrg.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Organization
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium">Personal</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      My Workspace
                    </p>
                  </div>
                </>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">
            Workspaces
          </DropdownMenuLabel>

          {/* Personal Workspace */}
          <DropdownMenuItem
            onClick={() => onOrganizationChange(null)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Personal</p>
                <p className="text-xs text-gray-500">My Workspace</p>
              </div>
              {!currentOrgId && <Check className="w-4 h-4 text-teal-500" />}
            </div>
          </DropdownMenuItem>

          {/* Loading State */}
          {loading && (
            <DropdownMenuItem disabled>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading organizations...
            </DropdownMenuItem>
          )}

          {/* Organization List */}
          {!loading && organizations.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => onOrganizationChange(org.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{org.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {org.userRole || 'member'}
                      </p>
                    </div>
                    {currentOrgId === org.id && (
                      <Check className="w-4 h-4 text-teal-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />

          {/* Create New Organization */}
          <DropdownMenuItem
            onClick={() => setShowCreateDialog(true)}
            className="cursor-pointer text-teal-600 dark:text-teal-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Organization
          </DropdownMenuItem>

          {/* Organization Settings (if in org context) */}
          {currentOrg && (
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Organization Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleOrgCreated}
      />
    </>
  );
}

export default OrganizationSwitcher;
