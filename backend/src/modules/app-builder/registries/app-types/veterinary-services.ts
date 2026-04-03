/**
 * Veterinary Services App Type Definition
 *
 * Complete definition for veterinary services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary-services',
  name: 'Veterinary Services',
  category: 'pets',
  description: 'Veterinary Services platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "veterinary services",
      "veterinary",
      "services",
      "veterinary software",
      "veterinary app",
      "veterinary platform",
      "veterinary system",
      "veterinary management",
      "pets veterinary"
  ],

  synonyms: [
      "Veterinary Services platform",
      "Veterinary Services software",
      "Veterinary Services system",
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
      "Build a veterinary services platform",
      "Create a veterinary services app",
      "I need a veterinary services management system",
      "Build a veterinary services solution",
      "Create a veterinary services booking system"
  ],
};
