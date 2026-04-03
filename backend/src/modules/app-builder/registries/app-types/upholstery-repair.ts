/**
 * Upholstery Repair App Type Definition
 *
 * Complete definition for upholstery repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UPHOLSTERY_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'upholstery-repair',
  name: 'Upholstery Repair',
  category: 'services',
  description: 'Upholstery Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "upholstery repair",
      "upholstery",
      "repair",
      "upholstery software",
      "upholstery app",
      "upholstery platform",
      "upholstery system",
      "upholstery management",
      "services upholstery"
  ],

  synonyms: [
      "Upholstery Repair platform",
      "Upholstery Repair software",
      "Upholstery Repair system",
      "upholstery solution",
      "upholstery service"
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
      "Build a upholstery repair platform",
      "Create a upholstery repair app",
      "I need a upholstery repair management system",
      "Build a upholstery repair solution",
      "Create a upholstery repair booking system"
  ],
};
