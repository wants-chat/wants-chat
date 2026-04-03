/**
 * Outdoor Furniture App Type Definition
 *
 * Complete definition for outdoor furniture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTDOOR_FURNITURE_APP_TYPE: AppTypeDefinition = {
  id: 'outdoor-furniture',
  name: 'Outdoor Furniture',
  category: 'services',
  description: 'Outdoor Furniture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "outdoor furniture",
      "outdoor",
      "furniture",
      "outdoor software",
      "outdoor app",
      "outdoor platform",
      "outdoor system",
      "outdoor management",
      "services outdoor"
  ],

  synonyms: [
      "Outdoor Furniture platform",
      "Outdoor Furniture software",
      "Outdoor Furniture system",
      "outdoor solution",
      "outdoor service"
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
      "Build a outdoor furniture platform",
      "Create a outdoor furniture app",
      "I need a outdoor furniture management system",
      "Build a outdoor furniture solution",
      "Create a outdoor furniture booking system"
  ],
};
