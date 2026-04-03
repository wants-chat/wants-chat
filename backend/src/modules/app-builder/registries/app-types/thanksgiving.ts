/**
 * Thanksgiving App Type Definition
 *
 * Complete definition for thanksgiving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THANKSGIVING_APP_TYPE: AppTypeDefinition = {
  id: 'thanksgiving',
  name: 'Thanksgiving',
  category: 'services',
  description: 'Thanksgiving platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "thanksgiving",
      "thanksgiving software",
      "thanksgiving app",
      "thanksgiving platform",
      "thanksgiving system",
      "thanksgiving management",
      "services thanksgiving"
  ],

  synonyms: [
      "Thanksgiving platform",
      "Thanksgiving software",
      "Thanksgiving system",
      "thanksgiving solution",
      "thanksgiving service"
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
      "Build a thanksgiving platform",
      "Create a thanksgiving app",
      "I need a thanksgiving management system",
      "Build a thanksgiving solution",
      "Create a thanksgiving booking system"
  ],
};
