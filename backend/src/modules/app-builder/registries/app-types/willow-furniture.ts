/**
 * Willow Furniture App Type Definition
 *
 * Complete definition for willow furniture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILLOW_FURNITURE_APP_TYPE: AppTypeDefinition = {
  id: 'willow-furniture',
  name: 'Willow Furniture',
  category: 'services',
  description: 'Willow Furniture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "willow furniture",
      "willow",
      "furniture",
      "willow software",
      "willow app",
      "willow platform",
      "willow system",
      "willow management",
      "services willow"
  ],

  synonyms: [
      "Willow Furniture platform",
      "Willow Furniture software",
      "Willow Furniture system",
      "willow solution",
      "willow service"
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
      "Build a willow furniture platform",
      "Create a willow furniture app",
      "I need a willow furniture management system",
      "Build a willow furniture solution",
      "Create a willow furniture booking system"
  ],
};
