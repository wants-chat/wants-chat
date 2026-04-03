/**
 * Tribute Band App Type Definition
 *
 * Complete definition for tribute band applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRIBUTE_BAND_APP_TYPE: AppTypeDefinition = {
  id: 'tribute-band',
  name: 'Tribute Band',
  category: 'services',
  description: 'Tribute Band platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tribute band",
      "tribute",
      "band",
      "tribute software",
      "tribute app",
      "tribute platform",
      "tribute system",
      "tribute management",
      "services tribute"
  ],

  synonyms: [
      "Tribute Band platform",
      "Tribute Band software",
      "Tribute Band system",
      "tribute solution",
      "tribute service"
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
      "Build a tribute band platform",
      "Create a tribute band app",
      "I need a tribute band management system",
      "Build a tribute band solution",
      "Create a tribute band booking system"
  ],
};
