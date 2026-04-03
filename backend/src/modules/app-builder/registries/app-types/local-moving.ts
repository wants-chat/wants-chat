/**
 * Local Moving App Type Definition
 *
 * Complete definition for local moving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOCAL_MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'local-moving',
  name: 'Local Moving',
  category: 'logistics',
  description: 'Local Moving platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "local moving",
      "local",
      "moving",
      "local software",
      "local app",
      "local platform",
      "local system",
      "local management",
      "services local"
  ],

  synonyms: [
      "Local Moving platform",
      "Local Moving software",
      "Local Moving system",
      "local solution",
      "local service"
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
      "reservations",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a local moving platform",
      "Create a local moving app",
      "I need a local moving management system",
      "Build a local moving solution",
      "Create a local moving booking system"
  ],
};
