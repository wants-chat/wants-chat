/**
 * Mobile Welding App Type Definition
 *
 * Complete definition for mobile welding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_WELDING_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-welding',
  name: 'Mobile Welding',
  category: 'services',
  description: 'Mobile Welding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mobile welding",
      "mobile",
      "welding",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "services mobile"
  ],

  synonyms: [
      "Mobile Welding platform",
      "Mobile Welding software",
      "Mobile Welding system",
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a mobile welding platform",
      "Create a mobile welding app",
      "I need a mobile welding management system",
      "Build a mobile welding solution",
      "Create a mobile welding booking system"
  ],
};
