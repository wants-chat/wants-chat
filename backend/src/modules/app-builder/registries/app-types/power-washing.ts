/**
 * Power Washing App Type Definition
 *
 * Complete definition for power washing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POWER_WASHING_APP_TYPE: AppTypeDefinition = {
  id: 'power-washing',
  name: 'Power Washing',
  category: 'services',
  description: 'Power Washing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "power washing",
      "power",
      "washing",
      "power software",
      "power app",
      "power platform",
      "power system",
      "power management",
      "services power"
  ],

  synonyms: [
      "Power Washing platform",
      "Power Washing software",
      "Power Washing system",
      "power solution",
      "power service"
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
      "Build a power washing platform",
      "Create a power washing app",
      "I need a power washing management system",
      "Build a power washing solution",
      "Create a power washing booking system"
  ],
};
