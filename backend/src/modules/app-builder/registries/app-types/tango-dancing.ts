/**
 * Tango Dancing App Type Definition
 *
 * Complete definition for tango dancing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TANGO_DANCING_APP_TYPE: AppTypeDefinition = {
  id: 'tango-dancing',
  name: 'Tango Dancing',
  category: 'services',
  description: 'Tango Dancing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tango dancing",
      "tango",
      "dancing",
      "tango software",
      "tango app",
      "tango platform",
      "tango system",
      "tango management",
      "services tango"
  ],

  synonyms: [
      "Tango Dancing platform",
      "Tango Dancing software",
      "Tango Dancing system",
      "tango solution",
      "tango service"
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
      "Build a tango dancing platform",
      "Create a tango dancing app",
      "I need a tango dancing management system",
      "Build a tango dancing solution",
      "Create a tango dancing booking system"
  ],
};
