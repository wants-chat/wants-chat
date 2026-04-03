/**
 * Waste Disposal App Type Definition
 *
 * Complete definition for waste disposal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WASTE_DISPOSAL_APP_TYPE: AppTypeDefinition = {
  id: 'waste-disposal',
  name: 'Waste Disposal',
  category: 'services',
  description: 'Waste Disposal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "waste disposal",
      "waste",
      "disposal",
      "waste software",
      "waste app",
      "waste platform",
      "waste system",
      "waste management",
      "services waste"
  ],

  synonyms: [
      "Waste Disposal platform",
      "Waste Disposal software",
      "Waste Disposal system",
      "waste solution",
      "waste service"
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
      "Build a waste disposal platform",
      "Create a waste disposal app",
      "I need a waste disposal management system",
      "Build a waste disposal solution",
      "Create a waste disposal booking system"
  ],
};
