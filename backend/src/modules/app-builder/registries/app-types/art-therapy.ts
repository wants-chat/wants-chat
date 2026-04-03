/**
 * Art Therapy App Type Definition
 *
 * Complete definition for art therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'art-therapy',
  name: 'Art Therapy',
  category: 'healthcare',
  description: 'Art Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "art therapy",
      "art",
      "therapy",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "healthcare art"
  ],

  synonyms: [
      "Art Therapy platform",
      "Art Therapy software",
      "Art Therapy system",
      "art solution",
      "art service"
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
      "Build a art therapy platform",
      "Create a art therapy app",
      "I need a art therapy management system",
      "Build a art therapy solution",
      "Create a art therapy booking system"
  ],
};
