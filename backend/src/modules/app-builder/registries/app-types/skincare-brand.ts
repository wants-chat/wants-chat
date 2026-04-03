/**
 * Skincare Brand App Type Definition
 *
 * Complete definition for skincare brand applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKINCARE_BRAND_APP_TYPE: AppTypeDefinition = {
  id: 'skincare-brand',
  name: 'Skincare Brand',
  category: 'healthcare',
  description: 'Skincare Brand platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "skincare brand",
      "skincare",
      "brand",
      "skincare software",
      "skincare app",
      "skincare platform",
      "skincare system",
      "skincare management",
      "healthcare skincare"
  ],

  synonyms: [
      "Skincare Brand platform",
      "Skincare Brand software",
      "Skincare Brand system",
      "skincare solution",
      "skincare service"
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
      "Build a skincare brand platform",
      "Create a skincare brand app",
      "I need a skincare brand management system",
      "Build a skincare brand solution",
      "Create a skincare brand booking system"
  ],
};
