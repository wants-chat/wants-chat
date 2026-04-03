/**
 * Mobile Rv Repair App Type Definition
 *
 * Complete definition for mobile rv repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_RV_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-rv-repair',
  name: 'Mobile Rv Repair',
  category: 'services',
  description: 'Mobile Rv Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "mobile rv repair",
      "mobile",
      "repair",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "services mobile"
  ],

  synonyms: [
      "Mobile Rv Repair platform",
      "Mobile Rv Repair software",
      "Mobile Rv Repair system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile rv repair platform",
      "Create a mobile rv repair app",
      "I need a mobile rv repair management system",
      "Build a mobile rv repair solution",
      "Create a mobile rv repair booking system"
  ],
};
