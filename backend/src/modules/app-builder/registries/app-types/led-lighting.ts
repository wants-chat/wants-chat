/**
 * Led Lighting App Type Definition
 *
 * Complete definition for led lighting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LED_LIGHTING_APP_TYPE: AppTypeDefinition = {
  id: 'led-lighting',
  name: 'Led Lighting',
  category: 'services',
  description: 'Led Lighting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "led lighting",
      "led",
      "lighting",
      "led software",
      "led app",
      "led platform",
      "led system",
      "led management",
      "services led"
  ],

  synonyms: [
      "Led Lighting platform",
      "Led Lighting software",
      "Led Lighting system",
      "led solution",
      "led service"
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
      "Build a led lighting platform",
      "Create a led lighting app",
      "I need a led lighting management system",
      "Build a led lighting solution",
      "Create a led lighting booking system"
  ],
};
