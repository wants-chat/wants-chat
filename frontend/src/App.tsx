import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConfirmDialogProvider } from './contexts/ConfirmDialogContext';
import { PinnedToolsProvider } from './contexts/PinnedToolsContext';
import { ToolStackProvider } from './contexts/ToolStackContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProtectedLayout } from './components/auth/ProtectedLayout';
import ScrollToTop from './components/ScrollToTop';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OAuthCallback from './pages/auth/OAuthCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Public pages
import LandingPage from './pages/LandingPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ToolsPage from './pages/ToolsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ChangelogPage from './pages/ChangelogPage';
import CareersPage from './pages/CareersPage';
import BlogPage from './pages/BlogPage';

// Solution pages
import BusinessPage from './pages/solutions/BusinessPage';
import HealthcarePage from './pages/solutions/HealthcarePage';
import LegalPage from './pages/solutions/LegalPage';
import EducationPage from './pages/solutions/EducationPage';
import EnterprisePage from './pages/solutions/EnterprisePage';

// API Documentation (public)
import ApiDocsPage from './pages/ApiDocsPage';

// Legal pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import DataDeletion from './pages/legal/DataDeletion';
import SecurityPage from './pages/legal/SecurityPage';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// UI Components
import { Toaster } from './components/ui/sonner';
import { FluxezChatbot } from './components/chat/FluxezChatbot';

// Chat page (to be created)
import ChatPage from './pages/ChatPage';
import ContentGalleryPage from './pages/ContentGalleryPage';
import SettingsPage from './pages/SettingsPage';
import MemoriesPage from './pages/MemoriesPage';
import PreferencesPage from './pages/PreferencesPage';
import ProfilePage from './pages/ProfilePage';
import ApiKeysPage from './pages/ApiKeysPage';

// Onboarding page
import OnboardingPage from './pages/OnboardingPage';

// Organization invitation page
import AcceptInvitationPage from './pages/AcceptInvitationPage';

// Organization pages
import OrganizationSettingsPage from './pages/OrganizationSettingsPage';
import OrganizationMembersPage from './pages/OrganizationMembersPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ConfirmDialogProvider>
          <PinnedToolsProvider>
          <ToolStackProvider>
            <Router>
              <ScrollToTop />
              <FluxezChatbot debug={import.meta.env.DEV} />
              <div className="App">
                <Routes>
                  {/* Public Routes with Layout */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/tools" element={<ToolsPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/api-docs" element={<ApiDocsPage />} />

                    {/* Solution Routes */}
                    <Route path="/solutions/business" element={<BusinessPage />} />
                    <Route path="/solutions/healthcare" element={<HealthcarePage />} />
                    <Route path="/solutions/legal" element={<LegalPage />} />
                    <Route path="/solutions/education" element={<EducationPage />} />
                    <Route path="/solutions/enterprise" element={<EnterprisePage />} />

                    {/* Legal Routes */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/data-deletion" element={<DataDeletion />} />
                    <Route path="/security" element={<SecurityPage />} />
                  </Route>

                  {/* Auth Routes (no layout) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />

                  {/* Organization Invitation Route (no layout, handles its own auth) */}
                  <Route path="/invite/:token" element={<AcceptInvitationPage />} />

                  {/* Onboarding Route - Protected but skips onboarding check to avoid infinite redirect */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute skipOnboardingCheck>
                        <OnboardingPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes with Shared Header */}
                  <Route element={<ProtectedLayout />}>
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:conversationId" element={<ChatPage />} />
                    <Route path="/content" element={<ContentGalleryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/memories" element={<MemoriesPage />} />
                    <Route path="/preferences" element={<PreferencesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/api-keys" element={<ApiKeysPage />} />
                    <Route path="/organization/:orgId/settings" element={<OrganizationSettingsPage />} />
                    <Route path="/organization/:orgId/members" element={<OrganizationMembersPage />} />
                  </Route>
                </Routes>
              </div>
            </Router>
            <Toaster />
          </ToolStackProvider>
          </PinnedToolsProvider>
          </ConfirmDialogProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
