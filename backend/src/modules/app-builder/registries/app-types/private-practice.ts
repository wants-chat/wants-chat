/**
 * Private Practice App Type Definition
 *
 * Complete definition for private practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIVATE_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'private-practice',
  name: 'Private Practice',
  category: 'services',
  description: 'Private Practice platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "private practice",
      "private",
      "practice",
      "private software",
      "private app",
      "private platform",
      "private system",
      "private management",
      "services private"
  ],

  synonyms: [
      "Private Practice platform",
      "Private Practice software",
      "Private Practice system",
      "private solution",
      "private service"
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
      "Build a private practice platform",
      "Create a private practice app",
      "I need a private practice management system",
      "Build a private practice solution",
      "Create a private practice booking system"
  ],
};
