/**
 * Travel Management App Type Definition
 *
 * Complete definition for travel management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'travel-management',
  name: 'Travel Management',
  category: 'services',
  description: 'Travel Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "travel management",
      "travel",
      "management",
      "travel software",
      "travel app",
      "travel platform",
      "travel system",
      "services travel"
  ],

  synonyms: [
      "Travel Management platform",
      "Travel Management software",
      "Travel Management system",
      "travel solution",
      "travel service"
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
      "Build a travel management platform",
      "Create a travel management app",
      "I need a travel management management system",
      "Build a travel management solution",
      "Create a travel management booking system"
  ],
};
