/**
 * Tech Repair App Type Definition
 *
 * Complete definition for tech repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECH_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'tech-repair',
  name: 'Tech Repair',
  category: 'services',
  description: 'Tech Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tech repair",
      "tech",
      "repair",
      "tech software",
      "tech app",
      "tech platform",
      "tech system",
      "tech management",
      "services tech"
  ],

  synonyms: [
      "Tech Repair platform",
      "Tech Repair software",
      "Tech Repair system",
      "tech solution",
      "tech service"
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
      "Build a tech repair platform",
      "Create a tech repair app",
      "I need a tech repair management system",
      "Build a tech repair solution",
      "Create a tech repair booking system"
  ],
};
