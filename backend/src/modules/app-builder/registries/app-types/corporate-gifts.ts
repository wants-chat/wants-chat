/**
 * Corporate Gifts App Type Definition
 *
 * Complete definition for corporate gifts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CORPORATE_GIFTS_APP_TYPE: AppTypeDefinition = {
  id: 'corporate-gifts',
  name: 'Corporate Gifts',
  category: 'services',
  description: 'Corporate Gifts platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "corporate gifts",
      "corporate",
      "gifts",
      "corporate software",
      "corporate app",
      "corporate platform",
      "corporate system",
      "corporate management",
      "services corporate"
  ],

  synonyms: [
      "Corporate Gifts platform",
      "Corporate Gifts software",
      "Corporate Gifts system",
      "corporate solution",
      "corporate service"
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
      "Build a corporate gifts platform",
      "Create a corporate gifts app",
      "I need a corporate gifts management system",
      "Build a corporate gifts solution",
      "Create a corporate gifts booking system"
  ],
};
