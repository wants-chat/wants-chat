/**
 * Print Design App Type Definition
 *
 * Complete definition for print design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'print-design',
  name: 'Print Design',
  category: 'services',
  description: 'Print Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "print design",
      "print",
      "design",
      "print software",
      "print app",
      "print platform",
      "print system",
      "print management",
      "services print"
  ],

  synonyms: [
      "Print Design platform",
      "Print Design software",
      "Print Design system",
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
      "Build a print design platform",
      "Create a print design app",
      "I need a print design management system",
      "Build a print design solution",
      "Create a print design booking system"
  ],
};
