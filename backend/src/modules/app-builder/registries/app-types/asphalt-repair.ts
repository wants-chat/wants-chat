/**
 * Asphalt Repair App Type Definition
 *
 * Complete definition for asphalt repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASPHALT_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'asphalt-repair',
  name: 'Asphalt Repair',
  category: 'services',
  description: 'Asphalt Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "asphalt repair",
      "asphalt",
      "repair",
      "asphalt software",
      "asphalt app",
      "asphalt platform",
      "asphalt system",
      "asphalt management",
      "services asphalt"
  ],

  synonyms: [
      "Asphalt Repair platform",
      "Asphalt Repair software",
      "Asphalt Repair system",
      "asphalt solution",
      "asphalt service"
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
      "Build a asphalt repair platform",
      "Create a asphalt repair app",
      "I need a asphalt repair management system",
      "Build a asphalt repair solution",
      "Create a asphalt repair booking system"
  ],
};
