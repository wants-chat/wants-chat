/**
 * Gate Installation App Type Definition
 *
 * Complete definition for gate installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GATE_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'gate-installation',
  name: 'Gate Installation',
  category: 'services',
  description: 'Gate Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "gate installation",
      "gate",
      "installation",
      "gate software",
      "gate app",
      "gate platform",
      "gate system",
      "gate management",
      "services gate"
  ],

  synonyms: [
      "Gate Installation platform",
      "Gate Installation software",
      "Gate Installation system",
      "gate solution",
      "gate service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a gate installation platform",
      "Create a gate installation app",
      "I need a gate installation management system",
      "Build a gate installation solution",
      "Create a gate installation booking system"
  ],
};
