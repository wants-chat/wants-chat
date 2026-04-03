/**
 * Trolley Tour App Type Definition
 *
 * Complete definition for trolley tour applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TROLLEY_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'trolley-tour',
  name: 'Trolley Tour',
  category: 'services',
  description: 'Trolley Tour platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trolley tour",
      "trolley",
      "tour",
      "trolley software",
      "trolley app",
      "trolley platform",
      "trolley system",
      "trolley management",
      "services trolley"
  ],

  synonyms: [
      "Trolley Tour platform",
      "Trolley Tour software",
      "Trolley Tour system",
      "trolley solution",
      "trolley service"
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
      "Build a trolley tour platform",
      "Create a trolley tour app",
      "I need a trolley tour management system",
      "Build a trolley tour solution",
      "Create a trolley tour booking system"
  ],
};
