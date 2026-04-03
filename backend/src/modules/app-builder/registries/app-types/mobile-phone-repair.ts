/**
 * Mobile Phone Repair App Type Definition
 *
 * Complete definition for mobile phone repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_PHONE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-phone-repair',
  name: 'Mobile Phone Repair',
  category: 'services',
  description: 'Mobile Phone Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "mobile phone repair",
      "mobile",
      "phone",
      "repair",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "services mobile"
  ],

  synonyms: [
      "Mobile Phone Repair platform",
      "Mobile Phone Repair software",
      "Mobile Phone Repair system",
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
      "Build a mobile phone repair platform",
      "Create a mobile phone repair app",
      "I need a mobile phone repair management system",
      "Build a mobile phone repair solution",
      "Create a mobile phone repair booking system"
  ],
};
