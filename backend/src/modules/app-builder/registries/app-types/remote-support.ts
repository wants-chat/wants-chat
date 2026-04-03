/**
 * Remote Support App Type Definition
 *
 * Complete definition for remote support applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REMOTE_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'remote-support',
  name: 'Remote Support',
  category: 'services',
  description: 'Remote Support platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "remote support",
      "remote",
      "support",
      "remote software",
      "remote app",
      "remote platform",
      "remote system",
      "remote management",
      "services remote"
  ],

  synonyms: [
      "Remote Support platform",
      "Remote Support software",
      "Remote Support system",
      "remote solution",
      "remote service"
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
      "Build a remote support platform",
      "Create a remote support app",
      "I need a remote support management system",
      "Build a remote support solution",
      "Create a remote support booking system"
  ],
};
