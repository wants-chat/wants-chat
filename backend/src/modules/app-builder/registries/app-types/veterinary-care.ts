/**
 * Veterinary Care App Type Definition
 *
 * Complete definition for veterinary care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary-care',
  name: 'Veterinary Care',
  category: 'pets',
  description: 'Veterinary Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "veterinary care",
      "veterinary",
      "care",
      "veterinary software",
      "veterinary app",
      "veterinary platform",
      "veterinary system",
      "veterinary management",
      "pets veterinary"
  ],

  synonyms: [
      "Veterinary Care platform",
      "Veterinary Care software",
      "Veterinary Care system",
      "veterinary solution",
      "veterinary service"
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
      "patient-records",
      "prescriptions",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "insurance-billing",
      "payments",
      "reminders",
      "lab-results",
      "immunizations"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'pets',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a veterinary care platform",
      "Create a veterinary care app",
      "I need a veterinary care management system",
      "Build a veterinary care solution",
      "Create a veterinary care booking system"
  ],
};
