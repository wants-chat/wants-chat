/**
 * Asian Grocery App Type Definition
 *
 * Complete definition for asian grocery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASIAN_GROCERY_APP_TYPE: AppTypeDefinition = {
  id: 'asian-grocery',
  name: 'Asian Grocery',
  category: 'services',
  description: 'Asian Grocery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "asian grocery",
      "asian",
      "grocery",
      "asian software",
      "asian app",
      "asian platform",
      "asian system",
      "asian management",
      "services asian"
  ],

  synonyms: [
      "Asian Grocery platform",
      "Asian Grocery software",
      "Asian Grocery system",
      "asian solution",
      "asian service"
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
      "Build a asian grocery platform",
      "Create a asian grocery app",
      "I need a asian grocery management system",
      "Build a asian grocery solution",
      "Create a asian grocery booking system"
  ],
};
