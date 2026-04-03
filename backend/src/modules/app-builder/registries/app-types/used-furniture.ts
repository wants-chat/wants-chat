/**
 * Used Furniture App Type Definition
 *
 * Complete definition for used furniture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_FURNITURE_APP_TYPE: AppTypeDefinition = {
  id: 'used-furniture',
  name: 'Used Furniture',
  category: 'services',
  description: 'Used Furniture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "used furniture",
      "used",
      "furniture",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "services used"
  ],

  synonyms: [
      "Used Furniture platform",
      "Used Furniture software",
      "Used Furniture system",
      "used solution",
      "used service"
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
      "Build a used furniture platform",
      "Create a used furniture app",
      "I need a used furniture management system",
      "Build a used furniture solution",
      "Create a used furniture booking system"
  ],
};
