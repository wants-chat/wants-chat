/**
 * Herbal Medicine App Type Definition
 *
 * Complete definition for herbal medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HERBAL_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'herbal-medicine',
  name: 'Herbal Medicine',
  category: 'services',
  description: 'Herbal Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "herbal medicine",
      "herbal",
      "medicine",
      "herbal software",
      "herbal app",
      "herbal platform",
      "herbal system",
      "herbal management",
      "services herbal"
  ],

  synonyms: [
      "Herbal Medicine platform",
      "Herbal Medicine software",
      "Herbal Medicine system",
      "herbal solution",
      "herbal service"
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
      "Build a herbal medicine platform",
      "Create a herbal medicine app",
      "I need a herbal medicine management system",
      "Build a herbal medicine solution",
      "Create a herbal medicine booking system"
  ],
};
