/**
 * Tent Camping App Type Definition
 *
 * Complete definition for tent camping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENT_CAMPING_APP_TYPE: AppTypeDefinition = {
  id: 'tent-camping',
  name: 'Tent Camping',
  category: 'services',
  description: 'Tent Camping platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tent camping",
      "tent",
      "camping",
      "tent software",
      "tent app",
      "tent platform",
      "tent system",
      "tent management",
      "services tent"
  ],

  synonyms: [
      "Tent Camping platform",
      "Tent Camping software",
      "Tent Camping system",
      "tent solution",
      "tent service"
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
      "Build a tent camping platform",
      "Create a tent camping app",
      "I need a tent camping management system",
      "Build a tent camping solution",
      "Create a tent camping booking system"
  ],
};
