/**
 * Print Management App Type Definition
 *
 * Complete definition for print management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'print-management',
  name: 'Print Management',
  category: 'services',
  description: 'Print Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "print management",
      "print",
      "management",
      "print software",
      "print app",
      "print platform",
      "print system",
      "services print"
  ],

  synonyms: [
      "Print Management platform",
      "Print Management software",
      "Print Management system",
      "print solution",
      "print service"
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
      "Build a print management platform",
      "Create a print management app",
      "I need a print management management system",
      "Build a print management solution",
      "Create a print management booking system"
  ],
};
