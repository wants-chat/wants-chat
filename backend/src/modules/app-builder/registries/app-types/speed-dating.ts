/**
 * Speed Dating App Type Definition
 *
 * Complete definition for speed dating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPEED_DATING_APP_TYPE: AppTypeDefinition = {
  id: 'speed-dating',
  name: 'Speed Dating',
  category: 'services',
  description: 'Speed Dating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "speed dating",
      "speed",
      "dating",
      "speed software",
      "speed app",
      "speed platform",
      "speed system",
      "speed management",
      "services speed"
  ],

  synonyms: [
      "Speed Dating platform",
      "Speed Dating software",
      "Speed Dating system",
      "speed solution",
      "speed service"
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
      "Build a speed dating platform",
      "Create a speed dating app",
      "I need a speed dating management system",
      "Build a speed dating solution",
      "Create a speed dating booking system"
  ],
};
