/**
 * Plant Nursery App Type Definition
 *
 * Complete definition for plant nursery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLANT_NURSERY_APP_TYPE: AppTypeDefinition = {
  id: 'plant-nursery',
  name: 'Plant Nursery',
  category: 'healthcare',
  description: 'Plant Nursery platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "plant nursery",
      "plant",
      "nursery",
      "plant software",
      "plant app",
      "plant platform",
      "plant system",
      "plant management",
      "healthcare plant"
  ],

  synonyms: [
      "Plant Nursery platform",
      "Plant Nursery software",
      "Plant Nursery system",
      "plant solution",
      "plant service"
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
      "Build a plant nursery platform",
      "Create a plant nursery app",
      "I need a plant nursery management system",
      "Build a plant nursery solution",
      "Create a plant nursery booking system"
  ],
};
