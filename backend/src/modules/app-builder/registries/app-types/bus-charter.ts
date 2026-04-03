/**
 * Bus Charter App Type Definition
 *
 * Complete definition for bus charter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUS_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'bus-charter',
  name: 'Bus Charter',
  category: 'services',
  description: 'Bus Charter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "bus charter",
      "bus",
      "charter",
      "bus software",
      "bus app",
      "bus platform",
      "bus system",
      "bus management",
      "services bus"
  ],

  synonyms: [
      "Bus Charter platform",
      "Bus Charter software",
      "Bus Charter system",
      "bus solution",
      "bus service"
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
      "Build a bus charter platform",
      "Create a bus charter app",
      "I need a bus charter management system",
      "Build a bus charter solution",
      "Create a bus charter booking system"
  ],
};
