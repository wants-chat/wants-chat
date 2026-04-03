// ==========================================
// ORGANIZED EXPORTS - Re-exported from categorical folders
// ==========================================

// Shadcn UI Component Generators
export * from './shadcn';

// Blog & Content Components
export * from './blog';

// User & Profile Components
export * from './user';

// Authentication Components
export * from './auth';

// Help & Support Components
export * from './help';

// Error Pages
export * from './error';

// Legal & Contact
export * from './legal';

// Forms & Input Components
export * from './forms';

// Tables & Data Display
export * from './tables';

// Charts & Analytics
export * from './charts';

// Navigation & Layout
export * from './navigation';

// E-commerce Components
export * from './ecommerce';

// Social & Communication
export * from './social';

// Media Components
export * from './media';

// Modals & Overlays
export * from './modals';

// Calendar & Time
export * from './calendar';

// Widgets & Utilities
export * from './widgets';

// Common Components
export * from './common';

// ==========================================
// IMPORTS FOR COMPONENT GENERATOR MAP
// ==========================================
import * as changeCase from 'change-case';
import { ResolvedComponent } from '../../types/resolved-component.interface';

// Import from categorical folders
import {
  generateButtonComponent,
  generateCardComponent,
  generateInputComponent,
  generateLabelComponent,
  generateTableComponent,
  generateDropdownMenuComponent,
  generateTextareaComponent,
} from './shadcn';

import {
  generateAboutPageContent,
  generateBlogGridLayout,
  generateBlogList,
  generateBlogPostContent,
  generateBlogPostHeader,
  generateBlogSearchBar,
  generateAuthorBio,
  generateRelatedArticles,
  generateCategoriesWidget,
  generateTagCloudWidget,
  generateCommentSection,
  generateCommentForm,
  generateBlogCard,
  generateBlogListLayout,
} from './blog';

import {
  generateArticleSearchHelp,
  generateHelpArticlePage,
} from './help';

import {
  generateError404Page,
  generateError500Page,
  generateErrorMessage,
} from './error';

import {
  generateContactPageContent,
  generateLegalPageContent,
} from './legal';

import {
  generateUserProfile,
  generateUserManagementTable,
  generateAvatarUpload,
  generateResetPasswordForm,
} from './user';

import {
  generateFooter,
  generateCookieConsentDetailed,
} from './common';

// Placeholder component generator
export const generatePlaceholderComponent = (componentType: string, resolved: ResolvedComponent): string => {
  const componentName = componentType.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `
import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    <div className="${componentType} p-4 border rounded">
      <p className="text-gray-500">
        ${componentName} Component - Placeholder
      </p>
    </div>
  );
};

export default ${componentName};
  `.trim();
};

// Map of all component generators (currently available in app-builder)
export const componentGenerators: Record<string, (resolved: ResolvedComponent) => string> = {
  // Shadcn UI
  'button': generateButtonComponent,
  'card': generateCardComponent,
  'input': generateInputComponent,
  'label': generateLabelComponent,
  'table': generateTableComponent,
  'dropdown-menu': generateDropdownMenuComponent,
  'dropdownMenu': generateDropdownMenuComponent,
  'textarea': generateTextareaComponent,

  // Blog & Content
  'about-page-content': generateAboutPageContent,
  'aboutPageContent': generateAboutPageContent,
  'about-page': generateAboutPageContent,
  'about': generateAboutPageContent,
  'blog-grid-layout': generateBlogGridLayout,
  'blogGridLayout': generateBlogGridLayout,
  'blog-grid': generateBlogGridLayout,
  'blog-list': generateBlogList,
  'blogList': generateBlogList,
  'blog-post-content': generateBlogPostContent,
  'blogPostContent': generateBlogPostContent,
  'blog-post': generateBlogPostContent,
  'blog-post-header': generateBlogPostHeader,
  'blogPostHeader': generateBlogPostHeader,
  'blog-search-bar': generateBlogSearchBar,
  'blogSearchBar': generateBlogSearchBar,
  'blog-search': generateBlogSearchBar,
  'author-bio': generateAuthorBio,
  'authorBio': generateAuthorBio,
  'author': generateAuthorBio,
  'related-articles': generateRelatedArticles,
  'relatedArticles': generateRelatedArticles,
  'categories-widget': generateCategoriesWidget,
  'categoriesWidget': generateCategoriesWidget,
  'categories': generateCategoriesWidget,
  'tag-cloud-widget': generateTagCloudWidget,
  'tagCloudWidget': generateTagCloudWidget,
  'tag-cloud': generateTagCloudWidget,
  'comment-section': generateCommentSection,
  'commentSection': generateCommentSection,
  'comment': generateCommentSection,
  'comment-form': generateCommentForm,
  'commentForm': generateCommentForm,
  'blog-card': generateBlogCard,
  'blogCard': generateBlogCard,
  'blog-list-layout': generateBlogListLayout,
  'blogListLayout': generateBlogListLayout,

  // Help & Support
  'article-search-help': generateArticleSearchHelp,
  'articleSearchHelp': generateArticleSearchHelp,
  'help-article-page': generateHelpArticlePage,
  'helpArticlePage': generateHelpArticlePage,
  'help-article': generateHelpArticlePage,

  // Error Pages
  'error-404-page': generateError404Page,
  'error404Page': generateError404Page,
  'error-404': generateError404Page,
  '404': generateError404Page,
  'error-500-page': generateError500Page,
  'error500Page': generateError500Page,
  'error-500': generateError500Page,
  '500': generateError500Page,
  'error-message': generateErrorMessage,
  'errorMessage': generateErrorMessage,

  // Legal & Contact
  'contact-page-content': generateContactPageContent,
  'contactPageContent': generateContactPageContent,
  'contact-page': generateContactPageContent,
  'contact': generateContactPageContent,
  'legal-page-content': generateLegalPageContent,
  'legalPageContent': generateLegalPageContent,
  'legal-page': generateLegalPageContent,
  'legal': generateLegalPageContent,

  // User & Profile
  'user-profile': generateUserProfile,
  'userProfile': generateUserProfile,
  'user-management-table': generateUserManagementTable,
  'userManagementTable': generateUserManagementTable,
  'user-management': generateUserManagementTable,
  'avatar-upload': generateAvatarUpload,
  'avatarUpload': generateAvatarUpload,
  'avatar': generateAvatarUpload,
  'reset-password-form': generateResetPasswordForm,
  'resetPasswordForm': generateResetPasswordForm,
  'reset-password': generateResetPasswordForm,

  // Other
  'footer': generateFooter,
  'cookie-consent-detailed': generateCookieConsentDetailed,
  'cookieConsentDetailed': generateCookieConsentDetailed,
  'cookie-consent': generateCookieConsentDetailed,
};

// Helper to normalize component type (camelCase, snake_case → kebab-case)
function normalizeComponentType(type: string): string {
  return changeCase.kebabCase(type);
}

// Helper to get generator for a component
export function getComponentGenerator(componentType: string): ((resolved: ResolvedComponent) => string) | undefined {
  // Try exact match first
  let generator = componentGenerators[componentType];

  // If not found, try normalized (kebab-case) version
  if (!generator) {
    const normalized = normalizeComponentType(componentType);
    generator = componentGenerators[normalized];
  }

  if (typeof generator === 'function') {
    return generator;
  }

  // Return placeholder generator for unknown components
  return (resolved: ResolvedComponent) => generatePlaceholderComponent(componentType, resolved);
}
