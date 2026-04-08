import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { getMyOrganizations, Organization, syncOrganizationFromOnboarding } from '../../services/organizationApi';
import { CreateOrganizationDialog } from '../organization/CreateOrganizationDialog';
import {
  Building2,
  User,
  Users,
  Settings,
  ChevronDown,
  Check,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';

export const AuthenticatedHeader: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Organization state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [hoveredOrg, setHoveredOrg] = useState<Organization | null>(null);
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);

  // Ref for click outside
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  // Load organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        // First sync from onboarding if exists
        await syncOrganizationFromOnboarding();

        // Then fetch all organizations
        const orgs = await getMyOrganizations();
        setOrganizations(orgs);

        // Auto-select first org if none selected
        if (orgs.length > 0 && !selectedOrganization) {
          // Check localStorage for previously selected org
          const savedOrgId = localStorage.getItem('selectedOrganizationId');
          const savedOrg = orgs.find(o => o.id === savedOrgId);
          if (savedOrg) {
            setSelectedOrganization(savedOrg);
          }
        }
      } catch (error) {
        console.error('Failed to load organizations:', error);
      }
    };

    loadOrganizations();
  }, []);

  // Save selected org to localStorage
  useEffect(() => {
    if (selectedOrganization) {
      localStorage.setItem('selectedOrganizationId', selectedOrganization.id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  }, [selectedOrganization]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
        setHoveredOrg(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationCreated = (newOrg: Organization) => {
    setOrganizations(prev => [...prev, newOrg]);
    setSelectedOrganization(newOrg);
  };

  return (
    <>
      <header className={cn(
        "flex items-center justify-between px-4 py-2 border-b shrink-0 z-10",
        theme === 'dark' ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-slate-200 bg-white'
      )}>
        {/* Left: Logo + Organization Dropdown */}
        <div className="flex items-center gap-4">
          {/* Wants Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/chat')}
          >
            <img src="/assets/logo.png" alt="Wants" className="w-8 h-8" />
            <span className={cn(
              "text-lg font-semibold hidden sm:block",
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}>Wants</span>
          </div>

          {/* Divider */}
          <div className={cn(
            "w-px h-6",
            theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-200'
          )} />

          {/* Organization Dropdown */}
          <div className="relative" ref={orgDropdownRef}>
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                theme === 'dark'
                  ? 'hover:bg-[#2a2a2a] text-slate-300'
                  : 'hover:bg-slate-100 text-slate-700'
              )}
            >
              {selectedOrganization ? (
                <>
                  <Building2 className="w-4 h-4 text-[#0D9488]" />
                  <span className="text-sm font-medium">{selectedOrganization.name}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium">{t('authenticatedHeader.personal')}</span>
                </>
              )}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>

            {/* Organization Dropdown Menu - Two Panel Layout */}
            {showOrgDropdown && (
              <div
                className={cn(
                  "absolute top-full left-0 mt-1 rounded-lg shadow-lg border z-50 flex",
                  theme === 'dark'
                    ? 'bg-[#2a2a2a] border-[#3a3a3a]'
                    : 'bg-white border-slate-200'
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Left Panel - Organizations List */}
                <div className="w-64 p-2 border-r border-slate-200 dark:border-[#3a3a3a]">
                  {/* Personal Option */}
                  <button
                    onClick={() => {
                      setSelectedOrganization(null);
                      setHoveredOrg(null);
                      setShowOrgDropdown(false);
                    }}
                    onMouseEnter={() => setHoveredOrg(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                      !selectedOrganization
                        ? (theme === 'dark' ? 'bg-[#0D9488]/20 text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]')
                        : (theme === 'dark' ? 'hover:bg-[#3a3a3a] text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                    )}
                  >
                    <User className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t('authenticatedHeader.personal')}</div>
                    </div>
                    {!selectedOrganization && (
                      <Check className="w-4 h-4 text-[#0D9488]" />
                    )}
                  </button>

                  {/* Organizations */}
                  {organizations.length > 0 && (
                    <>
                      <div className={cn(
                        "px-3 py-1.5 text-xs font-medium uppercase tracking-wider mt-2",
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                      )}>
                        {t('authenticatedHeader.organizations')}
                      </div>
                      {organizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setSelectedOrganization(org);
                            setShowOrgDropdown(false);
                          }}
                          onMouseEnter={() => setHoveredOrg(org)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                            selectedOrganization?.id === org.id
                              ? (theme === 'dark' ? 'bg-[#0D9488]/20 text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]')
                              : hoveredOrg?.id === org.id
                                ? (theme === 'dark' ? 'bg-[#3a3a3a] text-slate-200' : 'bg-slate-100 text-slate-800')
                                : (theme === 'dark' ? 'hover:bg-[#3a3a3a] text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                          )}
                        >
                          <Building2 className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{org.name}</div>
                            <div className={cn(
                              "text-xs capitalize",
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
                            )}>{org.current_user_role || org.userRole || t('authenticatedHeader.member')}</div>
                          </div>
                          {selectedOrganization?.id === org.id && (
                            <Check className="w-4 h-4 text-[#0D9488]" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Create New Organization */}
                  <div className={cn(
                    "mt-2 pt-2 border-t",
                    theme === 'dark' ? 'border-[#3a3a3a]' : 'border-slate-200'
                  )}>
                    <button
                      onClick={() => {
                        setShowOrgDropdown(false);
                        setShowCreateOrgDialog(true);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        theme === 'dark'
                          ? 'hover:bg-[#3a3a3a] text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">{t('authenticatedHeader.createOrganization')}</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel - Org Actions (only when org is selected/hovered) */}
                {(hoveredOrg || selectedOrganization) && (
                  <div className="w-48 p-2">
                    <div className={cn(
                      "px-3 py-1.5 text-xs font-medium uppercase tracking-wider",
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    )}>
                      {t('authenticatedHeader.quickActions')}
                    </div>
                    <button
                      onClick={() => {
                        const orgToNavigate = hoveredOrg || selectedOrganization;
                        if (orgToNavigate) {
                          setShowOrgDropdown(false);
                          navigate(`/organization/${orgToNavigate.id}/members`);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        theme === 'dark'
                          ? 'hover:bg-[#3a3a3a] text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      )}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{t('authenticatedHeader.members')}</span>
                    </button>
                    <button
                      onClick={() => {
                        const orgToNavigate = hoveredOrg || selectedOrganization;
                        if (orgToNavigate) {
                          setShowOrgDropdown(false);
                          navigate(`/organization/${orgToNavigate.id}/settings`);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        theme === 'dark'
                          ? 'hover:bg-[#3a3a3a] text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      )}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">{t('authenticatedHeader.settings')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content Library Icon */}
          <button
            onClick={() => navigate('/content')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === 'dark'
                ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-[#0D9488]'
                : 'hover:bg-slate-100 text-slate-500 hover:text-[#0D9488]'
            )}
            title={t('authenticatedHeader.contentLibrary')}
          >
            <FolderOpen className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Language */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="header" showLabel={true} showFlag={true} />
        </div>
      </header>

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        isOpen={showCreateOrgDialog}
        onClose={() => setShowCreateOrgDialog(false)}
        onOrganizationCreated={handleOrganizationCreated}
      />
    </>
  );
};

export default AuthenticatedHeader;
