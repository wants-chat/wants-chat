/**
 * Urgent Services App Type Definition
 *
 * Complete definition for urgent services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const URGENT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'urgent-services',
  name: 'Urgent Services',
  category: 'healthcare',
  description: 'Urgent Services platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "urgent services",
      "urgent",
      "services",
      "urgent software",
      "urgent app",
      "urgent platform",
      "urgent system",
      "urgent management",
      "healthcare urgent"
  ],

  synonyms: [
      "Urgent Services platform",
      "Urgent Services software",
      "Urgent Services system",
      "urgent solution",
      "urgent service"
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
      "Build a urgent services platform",
      "Create a urgent services app",
      "I need a urgent services management system",
      "Build a urgent services solution",
      "Create a urgent services booking system"
  ],
};
