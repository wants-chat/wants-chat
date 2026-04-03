/**
 * Quick Print App Type Definition
 *
 * Complete definition for quick print applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUICK_PRINT_APP_TYPE: AppTypeDefinition = {
  id: 'quick-print',
  name: 'Quick Print',
  category: 'services',
  description: 'Quick Print platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "quick print",
      "quick",
      "print",
      "quick software",
      "quick app",
      "quick platform",
      "quick system",
      "quick management",
      "services quick"
  ],

  synonyms: [
      "Quick Print platform",
      "Quick Print software",
      "Quick Print system",
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
      "Build a quick print platform",
      "Create a quick print app",
      "I need a quick print management system",
      "Build a quick print solution",
      "Create a quick print booking system"
  ],
};
