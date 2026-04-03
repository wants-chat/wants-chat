/**
 * Quick Lube App Type Definition
 *
 * Complete definition for quick lube applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUICK_LUBE_APP_TYPE: AppTypeDefinition = {
  id: 'quick-lube',
  name: 'Quick Lube',
  category: 'services',
  description: 'Quick Lube platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "quick lube",
      "quick",
      "lube",
      "quick software",
      "quick app",
      "quick platform",
      "quick system",
      "quick management",
      "services quick"
  ],

  synonyms: [
      "Quick Lube platform",
      "Quick Lube software",
      "Quick Lube system",
      "quick solution",
      "quick service"
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
      "Build a quick lube platform",
      "Create a quick lube app",
      "I need a quick lube management system",
      "Build a quick lube solution",
      "Create a quick lube booking system"
  ],
};
