/**
 * Vegetable Farm App Type Definition
 *
 * Complete definition for vegetable farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGETABLE_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'vegetable-farm',
  name: 'Vegetable Farm',
  category: 'services',
  description: 'Vegetable Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vegetable farm",
      "vegetable",
      "farm",
      "vegetable software",
      "vegetable app",
      "vegetable platform",
      "vegetable system",
      "vegetable management",
      "services vegetable"
  ],

  synonyms: [
      "Vegetable Farm platform",
      "Vegetable Farm software",
      "Vegetable Farm system",
      "vegetable solution",
      "vegetable service"
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
      "Build a vegetable farm platform",
      "Create a vegetable farm app",
      "I need a vegetable farm management system",
      "Build a vegetable farm solution",
      "Create a vegetable farm booking system"
  ],
};
