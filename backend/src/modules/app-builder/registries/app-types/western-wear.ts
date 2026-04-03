/**
 * Western Wear App Type Definition
 *
 * Complete definition for western wear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WESTERN_WEAR_APP_TYPE: AppTypeDefinition = {
  id: 'western-wear',
  name: 'Western Wear',
  category: 'services',
  description: 'Western Wear platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "western wear",
      "western",
      "wear",
      "western software",
      "western app",
      "western platform",
      "western system",
      "western management",
      "services western"
  ],

  synonyms: [
      "Western Wear platform",
      "Western Wear software",
      "Western Wear system",
      "western solution",
      "western service"
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
      "Build a western wear platform",
      "Create a western wear app",
      "I need a western wear management system",
      "Build a western wear solution",
      "Create a western wear booking system"
  ],
};
