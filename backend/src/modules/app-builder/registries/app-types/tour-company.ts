/**
 * Tour Company App Type Definition
 *
 * Complete definition for tour company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOUR_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'tour-company',
  name: 'Tour Company',
  category: 'services',
  description: 'Tour Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tour company",
      "tour",
      "company",
      "tour software",
      "tour app",
      "tour platform",
      "tour system",
      "tour management",
      "services tour"
  ],

  synonyms: [
      "Tour Company platform",
      "Tour Company software",
      "Tour Company system",
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
      "Build a tour company platform",
      "Create a tour company app",
      "I need a tour company management system",
      "Build a tour company solution",
      "Create a tour company booking system"
  ],
};
