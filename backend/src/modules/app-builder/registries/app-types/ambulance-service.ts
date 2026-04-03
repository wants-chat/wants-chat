/**
 * Ambulance Service App Type Definition
 *
 * Complete definition for ambulance service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMBULANCE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'ambulance-service',
  name: 'Ambulance Service',
  category: 'services',
  description: 'Ambulance Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "ambulance service",
      "ambulance",
      "service",
      "ambulance software",
      "ambulance app",
      "ambulance platform",
      "ambulance system",
      "ambulance management",
      "services ambulance"
  ],

  synonyms: [
      "Ambulance Service platform",
      "Ambulance Service software",
      "Ambulance Service system",
      "ambulance solution",
      "ambulance service"
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
      "Build a ambulance service platform",
      "Create a ambulance service app",
      "I need a ambulance service management system",
      "Build a ambulance service solution",
      "Create a ambulance service booking system"
  ],
};
