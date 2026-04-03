/**
 * Temperature Control App Type Definition
 *
 * Complete definition for temperature control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMPERATURE_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'temperature-control',
  name: 'Temperature Control',
  category: 'services',
  description: 'Temperature Control platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "temperature control",
      "temperature",
      "control",
      "temperature software",
      "temperature app",
      "temperature platform",
      "temperature system",
      "temperature management",
      "services temperature"
  ],

  synonyms: [
      "Temperature Control platform",
      "Temperature Control software",
      "Temperature Control system",
      "temperature solution",
      "temperature service"
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
      "Build a temperature control platform",
      "Create a temperature control app",
      "I need a temperature control management system",
      "Build a temperature control solution",
      "Create a temperature control booking system"
  ],
};
