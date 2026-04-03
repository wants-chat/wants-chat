/**
 * Physical Medicine App Type Definition
 *
 * Complete definition for physical medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHYSICAL_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'physical-medicine',
  name: 'Physical Medicine',
  category: 'services',
  description: 'Physical Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "physical medicine",
      "physical",
      "medicine",
      "physical software",
      "physical app",
      "physical platform",
      "physical system",
      "physical management",
      "services physical"
  ],

  synonyms: [
      "Physical Medicine platform",
      "Physical Medicine software",
      "Physical Medicine system",
      "physical solution",
      "physical service"
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
      "Build a physical medicine platform",
      "Create a physical medicine app",
      "I need a physical medicine management system",
      "Build a physical medicine solution",
      "Create a physical medicine booking system"
  ],
};
