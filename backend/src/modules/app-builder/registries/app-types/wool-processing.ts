/**
 * Wool Processing App Type Definition
 *
 * Complete definition for wool processing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOOL_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'wool-processing',
  name: 'Wool Processing',
  category: 'services',
  description: 'Wool Processing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wool processing",
      "wool",
      "processing",
      "wool software",
      "wool app",
      "wool platform",
      "wool system",
      "wool management",
      "services wool"
  ],

  synonyms: [
      "Wool Processing platform",
      "Wool Processing software",
      "Wool Processing system",
      "wool solution",
      "wool service"
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
      "Build a wool processing platform",
      "Create a wool processing app",
      "I need a wool processing management system",
      "Build a wool processing solution",
      "Create a wool processing booking system"
  ],
};
