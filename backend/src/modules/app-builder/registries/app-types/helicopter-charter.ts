/**
 * Helicopter Charter App Type Definition
 *
 * Complete definition for helicopter charter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HELICOPTER_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'helicopter-charter',
  name: 'Helicopter Charter',
  category: 'services',
  description: 'Helicopter Charter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "helicopter charter",
      "helicopter",
      "charter",
      "helicopter software",
      "helicopter app",
      "helicopter platform",
      "helicopter system",
      "helicopter management",
      "services helicopter"
  ],

  synonyms: [
      "Helicopter Charter platform",
      "Helicopter Charter software",
      "Helicopter Charter system",
      "helicopter solution",
      "helicopter service"
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
      "Build a helicopter charter platform",
      "Create a helicopter charter app",
      "I need a helicopter charter management system",
      "Build a helicopter charter solution",
      "Create a helicopter charter booking system"
  ],
};
