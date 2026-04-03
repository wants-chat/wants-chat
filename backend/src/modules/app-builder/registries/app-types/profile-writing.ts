/**
 * Profile Writing App Type Definition
 *
 * Complete definition for profile writing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROFILE_WRITING_APP_TYPE: AppTypeDefinition = {
  id: 'profile-writing',
  name: 'Profile Writing',
  category: 'services',
  description: 'Profile Writing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "profile writing",
      "profile",
      "writing",
      "profile software",
      "profile app",
      "profile platform",
      "profile system",
      "profile management",
      "services profile"
  ],

  synonyms: [
      "Profile Writing platform",
      "Profile Writing software",
      "Profile Writing system",
      "profile solution",
      "profile service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a profile writing platform",
      "Create a profile writing app",
      "I need a profile writing management system",
      "Build a profile writing solution",
      "Create a profile writing booking system"
  ],
};
