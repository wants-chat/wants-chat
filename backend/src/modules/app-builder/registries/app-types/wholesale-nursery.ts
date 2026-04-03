/**
 * Wholesale Nursery App Type Definition
 *
 * Complete definition for wholesale nursery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_NURSERY_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-nursery',
  name: 'Wholesale Nursery',
  category: 'healthcare',
  description: 'Wholesale Nursery platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "wholesale nursery",
      "wholesale",
      "nursery",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "healthcare wholesale"
  ],

  synonyms: [
      "Wholesale Nursery platform",
      "Wholesale Nursery software",
      "Wholesale Nursery system",
      "wholesale solution",
      "wholesale service"
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "patient-records",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "telemedicine",
      "prescriptions",
      "insurance-billing",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a wholesale nursery platform",
      "Create a wholesale nursery app",
      "I need a wholesale nursery management system",
      "Build a wholesale nursery solution",
      "Create a wholesale nursery booking system"
  ],
};
