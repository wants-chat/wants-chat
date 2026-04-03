/**
 * Vital Records App Type Definition
 *
 * Complete definition for vital records applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VITAL_RECORDS_APP_TYPE: AppTypeDefinition = {
  id: 'vital-records',
  name: 'Vital Records',
  category: 'services',
  description: 'Vital Records platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vital records",
      "vital",
      "records",
      "vital software",
      "vital app",
      "vital platform",
      "vital system",
      "vital management",
      "services vital"
  ],

  synonyms: [
      "Vital Records platform",
      "Vital Records software",
      "Vital Records system",
      "vital solution",
      "vital service"
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
      "Build a vital records platform",
      "Create a vital records app",
      "I need a vital records management system",
      "Build a vital records solution",
      "Create a vital records booking system"
  ],
};
