/**
 * Aromatherapy App Type Definition
 *
 * Complete definition for aromatherapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AROMATHERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'aromatherapy',
  name: 'Aromatherapy',
  category: 'healthcare',
  description: 'Aromatherapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "aromatherapy",
      "aromatherapy software",
      "aromatherapy app",
      "aromatherapy platform",
      "aromatherapy system",
      "aromatherapy management",
      "healthcare aromatherapy"
  ],

  synonyms: [
      "Aromatherapy platform",
      "Aromatherapy software",
      "Aromatherapy system",
      "aromatherapy solution",
      "aromatherapy service"
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
      "Build a aromatherapy platform",
      "Create a aromatherapy app",
      "I need a aromatherapy management system",
      "Build a aromatherapy solution",
      "Create a aromatherapy booking system"
  ],
};
