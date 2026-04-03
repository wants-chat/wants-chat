/**
 * Spare Parts App Type Definition
 *
 * Complete definition for spare parts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPARE_PARTS_APP_TYPE: AppTypeDefinition = {
  id: 'spare-parts',
  name: 'Spare Parts',
  category: 'wellness',
  description: 'Spare Parts platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "spare parts",
      "spare",
      "parts",
      "spare software",
      "spare app",
      "spare platform",
      "spare system",
      "spare management",
      "wellness spare"
  ],

  synonyms: [
      "Spare Parts platform",
      "Spare Parts software",
      "Spare Parts system",
      "spare solution",
      "spare service"
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
      "pos-system",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "gallery",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a spare parts platform",
      "Create a spare parts app",
      "I need a spare parts management system",
      "Build a spare parts solution",
      "Create a spare parts booking system"
  ],
};
