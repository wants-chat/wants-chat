/**
 * Zero Waste App Type Definition
 *
 * Complete definition for zero waste applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZERO_WASTE_APP_TYPE: AppTypeDefinition = {
  id: 'zero-waste',
  name: 'Zero Waste',
  category: 'services',
  description: 'Zero Waste platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zero waste",
      "zero",
      "waste",
      "zero software",
      "zero app",
      "zero platform",
      "zero system",
      "zero management",
      "services zero"
  ],

  synonyms: [
      "Zero Waste platform",
      "Zero Waste software",
      "Zero Waste system",
      "zero solution",
      "zero service"
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
      "Build a zero waste platform",
      "Create a zero waste app",
      "I need a zero waste management system",
      "Build a zero waste solution",
      "Create a zero waste booking system"
  ],
};
