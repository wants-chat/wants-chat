/**
 * Organic Grocery App Type Definition
 *
 * Complete definition for organic grocery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORGANIC_GROCERY_APP_TYPE: AppTypeDefinition = {
  id: 'organic-grocery',
  name: 'Organic Grocery',
  category: 'services',
  description: 'Organic Grocery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "organic grocery",
      "organic",
      "grocery",
      "organic software",
      "organic app",
      "organic platform",
      "organic system",
      "organic management",
      "services organic"
  ],

  synonyms: [
      "Organic Grocery platform",
      "Organic Grocery software",
      "Organic Grocery system",
      "organic solution",
      "organic service"
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
      "Build a organic grocery platform",
      "Create a organic grocery app",
      "I need a organic grocery management system",
      "Build a organic grocery solution",
      "Create a organic grocery booking system"
  ],
};
