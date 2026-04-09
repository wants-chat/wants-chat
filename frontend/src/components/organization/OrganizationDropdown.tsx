/**
 * OrganizationDropdown Component
 *
 * A sidebar dropdown for switching between personal workspace and organizations.
 * Matches the styling of the AppSidebar dropdown.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronDown, Plus, Check, Users, User, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  getMyOrganizations,
  Organization,
} from '@/services/organizationApi';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

interface OrganizationDropdownProps {
  /** Currently selected organization ID (null for personal) */
  currentOrgId: string | null;
  /** Callback when organization changes */
  onOrganizationChange: (orgId: string | null) => void;
  /** Optional className for styling */
  className?: string;
}

export const OrganizationDropdown: React.FC<OrganizationDropdownProps> = ({
  currentOrgId,
  onOrganizationChange,
  className,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user's organizations
  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: () => getMyOrganizations(),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOrg = currentOrgId
    ? organizations.find((org) => org.id === currentOrgId)
    : null;

  const handleOrgCreated = (newOrg: Organization) => {
    onOrganizationChange(newOrg.id);
    setShowCreateDialog(false);
    setIsOpen(false);
  };

  const handleSelectOrg = (orgId: string | null) => {
    onOrganizationChange(orgId);
    setIsOpen(false);
  };

  return (
    <>
      <div className={cn("relative", className)} ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-2",
            isOpen
              ? theme === 'dark'
                ? 'bg-[#2a2a2a] text-white'
                : 'bg-[#0D9488]/10 text-slate-900'
              : theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {currentOrg ? (
              <>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-[#0F766E]">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    {currentOrg.name}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    {currentOrg.member_count || 0} members
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                  theme === 'dark'
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                )}>
                  <User className={cn(
                    "w-4 h-4",
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  )} />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    Personal
                  </p>
                  <p className={cn(
                    "text-xs",
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    My Workspace
                  </p>
                </div>
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 flex-shrink-0 transition-transform duration-200",
              isOpen && "rotate-180",
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl border overflow-hidden z-50 backdrop-blur-xl",
            theme === 'dark'
              ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]'
              : 'bg-white/95 border-slate-200'
          )}>
            {/* Workspaces Label */}
            <div className={cn(
              "px-4 py-2 border-b",
              theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-100'
            )}>
              <span className={cn(
                "text-xs font-medium uppercase tracking-wider",
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              )}>
                Workspaces
              </span>
            </div>

            {/* Personal Workspace */}
            <button
              onClick={() => handleSelectOrg(null)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 transition-all duration-200",
                !currentOrgId
                  ? theme === 'dark'
                    ? 'bg-[#0D9488]/10'
                    : 'bg-[#0D9488]/5'
                  : theme === 'dark'
                    ? 'hover:bg-[#2a2a2a]'
                    : 'hover:bg-slate-50'
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
              )}>
                <User className={cn(
                  "w-4 h-4",
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                )} />
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-medium",
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                )}>
                  Personal
                </p>
                <p className={cn(
                  "text-xs",
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                )}>
                  My Workspace
                </p>
              </div>
              {!currentOrgId && (
                <Check className="w-4 h-4 text-[#0D9488]" />
              )}
            </button>

            {/* Loading State */}
            {orgsLoading && (
              <div className={cn(
                "px-4 py-3 flex items-center gap-3",
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              )}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading organizations...</span>
              </div>
            )}

            {/* Organizations List */}
            {!orgsLoading && organizations.length > 0 && (
              <>
                <div className={cn(
                  "h-px mx-4",
                  theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-slate-100'
                )} />
                <div className={cn(
                  "px-4 py-2",
                  theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-100'
                )}>
                  <span className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  )}>
                    Organizations
                  </span>
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 transition-all duration-200",
                      currentOrgId === org.id
                        ? theme === 'dark'
                          ? 'bg-[#0D9488]/10'
                          : 'bg-[#0D9488]/5'
                        : theme === 'dark'
                          ? 'hover:bg-[#2a2a2a]'
                          : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#0D9488] to-[#0F766E]">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      )}>
                        {org.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className={cn(
                          "w-3 h-3",
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        )} />
                        <span className={cn(
                          "text-xs",
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          {org.member_count || 0} members
                        </span>
                        {org.userRole && (
                          <span className={cn(
                            "text-xs capitalize px-1.5 py-0.5 rounded",
                            org.userRole === 'owner'
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                              : org.userRole === 'admin'
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                : theme === 'dark'
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-slate-100 text-slate-600'
                          )}>
                            {org.userRole}
                          </span>
                        )}
                      </div>
                    </div>
                    {currentOrgId === org.id && (
                      <Check className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </>
            )}

            {/* Divider */}
            <div className={cn(
              "h-px mx-3",
              theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-slate-100'
            )} />

            {/* Create New Organization */}
            <button
              onClick={() => {
                setShowCreateDialog(true);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 transition-all duration-200",
                theme === 'dark'
                  ? 'hover:bg-[#0D9488]/10 text-[#0D9488]'
                  : 'hover:bg-[#0D9488]/5 text-[#0D9488]'
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center border-2 border-dashed",
                theme === 'dark' ? 'border-[#0D9488]/50' : 'border-[#0D9488]/40'
              )}>
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Create New Organization</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleOrgCreated}
      />
    </>
  );
};

export default OrganizationDropdown;
