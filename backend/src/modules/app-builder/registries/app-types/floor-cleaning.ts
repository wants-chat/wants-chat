/**
 * Floor Cleaning App Type Definition
 *
 * Complete definition for floor cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOOR_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'floor-cleaning',
  name: 'Floor Cleaning',
  category: 'services',
  description: 'Floor Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "floor cleaning",
      "floor",
      "cleaning",
      "floor software",
      "floor app",
      "floor platform",
      "floor system",
      "floor management",
      "services floor"
  ],

  synonyms: [
      "Floor Cleaning platform",
      "Floor Cleaning software",
      "Floor Cleaning system",
      "floor solution",
      "floor service"
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
      "Build a floor cleaning platform",
      "Create a floor cleaning app",
      "I need a floor cleaning management system",
      "Build a floor cleaning solution",
      "Create a floor cleaning booking system"
  ],
};
