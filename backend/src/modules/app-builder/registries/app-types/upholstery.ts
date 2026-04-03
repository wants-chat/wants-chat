/**
 * Upholstery App Type Definition
 *
 * Complete definition for upholstery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UPHOLSTERY_APP_TYPE: AppTypeDefinition = {
  id: 'upholstery',
  name: 'Upholstery',
  category: 'services',
  description: 'Upholstery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "upholstery",
      "upholstery software",
      "upholstery app",
      "upholstery platform",
      "upholstery system",
      "upholstery management",
      "services upholstery"
  ],

  synonyms: [
      "Upholstery platform",
      "Upholstery software",
      "Upholstery system",
      "upholstery solution",
      "upholstery service"
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
      "Build a upholstery platform",
      "Create a upholstery app",
      "I need a upholstery management system",
      "Build a upholstery solution",
      "Create a upholstery booking system"
  ],
};
