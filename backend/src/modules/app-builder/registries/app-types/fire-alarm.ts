/**
 * Fire Alarm App Type Definition
 *
 * Complete definition for fire alarm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_ALARM_APP_TYPE: AppTypeDefinition = {
  id: 'fire-alarm',
  name: 'Fire Alarm',
  category: 'services',
  description: 'Fire Alarm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fire alarm",
      "fire",
      "alarm",
      "fire software",
      "fire app",
      "fire platform",
      "fire system",
      "fire management",
      "services fire"
  ],

  synonyms: [
      "Fire Alarm platform",
      "Fire Alarm software",
      "Fire Alarm system",
      "fire solution",
      "fire service"
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
      "Build a fire alarm platform",
      "Create a fire alarm app",
      "I need a fire alarm management system",
      "Build a fire alarm solution",
      "Create a fire alarm booking system"
  ],
};
