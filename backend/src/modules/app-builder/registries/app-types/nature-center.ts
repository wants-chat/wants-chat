/**
 * Nature Center App Type Definition
 *
 * Complete definition for nature center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NATURE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'nature-center',
  name: 'Nature Center',
  category: 'services',
  description: 'Nature Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "nature center",
      "nature",
      "center",
      "nature software",
      "nature app",
      "nature platform",
      "nature system",
      "nature management",
      "services nature"
  ],

  synonyms: [
      "Nature Center platform",
      "Nature Center software",
      "Nature Center system",
      "nature solution",
      "nature service"
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
      "Build a nature center platform",
      "Create a nature center app",
      "I need a nature center management system",
      "Build a nature center solution",
      "Create a nature center booking system"
  ],
};
