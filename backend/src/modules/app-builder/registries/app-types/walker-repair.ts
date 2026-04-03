/**
 * Walker Repair App Type Definition
 *
 * Complete definition for walker repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALKER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'walker-repair',
  name: 'Walker Repair',
  category: 'services',
  description: 'Walker Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "walker repair",
      "walker",
      "repair",
      "walker software",
      "walker app",
      "walker platform",
      "walker system",
      "walker management",
      "services walker"
  ],

  synonyms: [
      "Walker Repair platform",
      "Walker Repair software",
      "Walker Repair system",
      "walker solution",
      "walker service"
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
      "Build a walker repair platform",
      "Create a walker repair app",
      "I need a walker repair management system",
      "Build a walker repair solution",
      "Create a walker repair booking system"
  ],
};
