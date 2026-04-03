/**
 * Maternity App Type Definition
 *
 * Complete definition for maternity applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATERNITY_APP_TYPE: AppTypeDefinition = {
  id: 'maternity',
  name: 'Maternity',
  category: 'services',
  description: 'Maternity platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "maternity",
      "maternity software",
      "maternity app",
      "maternity platform",
      "maternity system",
      "maternity management",
      "services maternity"
  ],

  synonyms: [
      "Maternity platform",
      "Maternity software",
      "Maternity system",
      "maternity solution",
      "maternity service"
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
      "Build a maternity platform",
      "Create a maternity app",
      "I need a maternity management system",
      "Build a maternity solution",
      "Create a maternity booking system"
  ],
};
