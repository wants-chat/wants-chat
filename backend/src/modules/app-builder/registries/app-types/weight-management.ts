/**
 * Weight Management App Type Definition
 *
 * Complete definition for weight management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEIGHT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'weight-management',
  name: 'Weight Management',
  category: 'services',
  description: 'Weight Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "weight management",
      "weight",
      "management",
      "weight software",
      "weight app",
      "weight platform",
      "weight system",
      "services weight"
  ],

  synonyms: [
      "Weight Management platform",
      "Weight Management software",
      "Weight Management system",
      "weight solution",
      "weight service"
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
      "Build a weight management platform",
      "Create a weight management app",
      "I need a weight management management system",
      "Build a weight management solution",
      "Create a weight management booking system"
  ],
};
