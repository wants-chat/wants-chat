/**
 * Tennis Court App Type Definition
 *
 * Complete definition for tennis court applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENNIS_COURT_APP_TYPE: AppTypeDefinition = {
  id: 'tennis-court',
  name: 'Tennis Court',
  category: 'services',
  description: 'Tennis Court platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tennis court",
      "tennis",
      "court",
      "tennis software",
      "tennis app",
      "tennis platform",
      "tennis system",
      "tennis management",
      "services tennis"
  ],

  synonyms: [
      "Tennis Court platform",
      "Tennis Court software",
      "Tennis Court system",
      "tennis solution",
      "tennis service"
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
      "Build a tennis court platform",
      "Create a tennis court app",
      "I need a tennis court management system",
      "Build a tennis court solution",
      "Create a tennis court booking system"
  ],
};
