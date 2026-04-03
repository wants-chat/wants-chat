/**
 * Taxi Service App Type Definition
 *
 * Complete definition for taxi service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAXI_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'taxi-service',
  name: 'Taxi Service',
  category: 'services',
  description: 'Taxi Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "taxi service",
      "taxi",
      "service",
      "taxi software",
      "taxi app",
      "taxi platform",
      "taxi system",
      "taxi management",
      "services taxi"
  ],

  synonyms: [
      "Taxi Service platform",
      "Taxi Service software",
      "Taxi Service system",
      "taxi solution",
      "taxi service"
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
      "Build a taxi service platform",
      "Create a taxi service app",
      "I need a taxi service management system",
      "Build a taxi service solution",
      "Create a taxi service booking system"
  ],
};
