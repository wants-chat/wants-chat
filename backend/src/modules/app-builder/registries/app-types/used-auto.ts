/**
 * Used Auto App Type Definition
 *
 * Complete definition for used auto applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USED_AUTO_APP_TYPE: AppTypeDefinition = {
  id: 'used-auto',
  name: 'Used Auto',
  category: 'automotive',
  description: 'Used Auto platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "used auto",
      "used",
      "auto",
      "used software",
      "used app",
      "used platform",
      "used system",
      "used management",
      "automotive used"
  ],

  synonyms: [
      "Used Auto platform",
      "Used Auto software",
      "Used Auto system",
      "used solution",
      "used service"
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
      "service-scheduling",
      "appointments",
      "parts-catalog",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "vehicle-history",
      "payments",
      "reviews",
      "inventory",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a used auto platform",
      "Create a used auto app",
      "I need a used auto management system",
      "Build a used auto solution",
      "Create a used auto booking system"
  ],
};
