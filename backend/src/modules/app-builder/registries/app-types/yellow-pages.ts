/**
 * Yellow Pages App Type Definition
 *
 * Complete definition for yellow pages applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YELLOW_PAGES_APP_TYPE: AppTypeDefinition = {
  id: 'yellow-pages',
  name: 'Yellow Pages',
  category: 'services',
  description: 'Yellow Pages platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yellow pages",
      "yellow",
      "pages",
      "yellow software",
      "yellow app",
      "yellow platform",
      "yellow system",
      "yellow management",
      "services yellow"
  ],

  synonyms: [
      "Yellow Pages platform",
      "Yellow Pages software",
      "Yellow Pages system",
      "yellow solution",
      "yellow service"
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
      "Build a yellow pages platform",
      "Create a yellow pages app",
      "I need a yellow pages management system",
      "Build a yellow pages solution",
      "Create a yellow pages booking system"
  ],
};
