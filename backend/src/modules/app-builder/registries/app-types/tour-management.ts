/**
 * Tour Management App Type Definition
 *
 * Complete definition for tour management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUR_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'tour-management',
  name: 'Tour Management',
  category: 'services',
  description: 'Tour Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tour management",
      "tour",
      "management",
      "tour software",
      "tour app",
      "tour platform",
      "tour system",
      "services tour"
  ],

  synonyms: [
      "Tour Management platform",
      "Tour Management software",
      "Tour Management system",
      "tour solution",
      "tour service"
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
      "Build a tour management platform",
      "Create a tour management app",
      "I need a tour management management system",
      "Build a tour management solution",
      "Create a tour management booking system"
  ],
};
