/**
 * Hydraulic Repair App Type Definition
 *
 * Complete definition for hydraulic repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HYDRAULIC_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'hydraulic-repair',
  name: 'Hydraulic Repair',
  category: 'services',
  description: 'Hydraulic Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "hydraulic repair",
      "hydraulic",
      "repair",
      "hydraulic software",
      "hydraulic app",
      "hydraulic platform",
      "hydraulic system",
      "hydraulic management",
      "services hydraulic"
  ],

  synonyms: [
      "Hydraulic Repair platform",
      "Hydraulic Repair software",
      "Hydraulic Repair system",
      "hydraulic solution",
      "hydraulic service"
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
      "Build a hydraulic repair platform",
      "Create a hydraulic repair app",
      "I need a hydraulic repair management system",
      "Build a hydraulic repair solution",
      "Create a hydraulic repair booking system"
  ],
};
