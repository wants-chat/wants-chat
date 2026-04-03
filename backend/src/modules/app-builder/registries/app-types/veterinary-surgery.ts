/**
 * Veterinary Surgery App Type Definition
 *
 * Complete definition for veterinary surgery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_SURGERY_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary-surgery',
  name: 'Veterinary Surgery',
  category: 'pets',
  description: 'Veterinary Surgery platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "veterinary surgery",
      "veterinary",
      "surgery",
      "veterinary software",
      "veterinary app",
      "veterinary platform",
      "veterinary system",
      "veterinary management",
      "pets veterinary"
  ],

  synonyms: [
      "Veterinary Surgery platform",
      "Veterinary Surgery software",
      "Veterinary Surgery system",
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
      "Build a veterinary surgery platform",
      "Create a veterinary surgery app",
      "I need a veterinary surgery management system",
      "Build a veterinary surgery solution",
      "Create a veterinary surgery booking system"
  ],
};
