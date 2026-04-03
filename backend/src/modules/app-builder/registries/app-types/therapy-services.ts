/**
 * Therapy Services App Type Definition
 *
 * Complete definition for therapy services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THERAPY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'therapy-services',
  name: 'Therapy Services',
  category: 'healthcare',
  description: 'Therapy Services platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "therapy services",
      "therapy",
      "services",
      "therapy software",
      "therapy app",
      "therapy platform",
      "therapy system",
      "therapy management",
      "healthcare therapy"
  ],

  synonyms: [
      "Therapy Services platform",
      "Therapy Services software",
      "Therapy Services system",
      "therapy solution",
      "therapy service"
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
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a therapy services platform",
      "Create a therapy services app",
      "I need a therapy services management system",
      "Build a therapy services solution",
      "Create a therapy services booking system"
  ],
};
