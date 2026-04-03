/**
 * Print Advertising App Type Definition
 *
 * Complete definition for print advertising applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_ADVERTISING_APP_TYPE: AppTypeDefinition = {
  id: 'print-advertising',
  name: 'Print Advertising',
  category: 'services',
  description: 'Print Advertising platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "print advertising",
      "print",
      "advertising",
      "print software",
      "print app",
      "print platform",
      "print system",
      "print management",
      "services print"
  ],

  synonyms: [
      "Print Advertising platform",
      "Print Advertising software",
      "Print Advertising system",
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
      "Build a print advertising platform",
      "Create a print advertising app",
      "I need a print advertising management system",
      "Build a print advertising solution",
      "Create a print advertising booking system"
  ],
};
