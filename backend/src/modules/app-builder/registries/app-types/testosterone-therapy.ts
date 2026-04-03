/**
 * Testosterone Therapy App Type Definition
 *
 * Complete definition for testosterone therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TESTOSTERONE_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'testosterone-therapy',
  name: 'Testosterone Therapy',
  category: 'healthcare',
  description: 'Testosterone Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "testosterone therapy",
      "testosterone",
      "therapy",
      "testosterone software",
      "testosterone app",
      "testosterone platform",
      "testosterone system",
      "testosterone management",
      "healthcare testosterone"
  ],

  synonyms: [
      "Testosterone Therapy platform",
      "Testosterone Therapy software",
      "Testosterone Therapy system",
      "testosterone solution",
      "testosterone service"
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
      "Build a testosterone therapy platform",
      "Create a testosterone therapy app",
      "I need a testosterone therapy management system",
      "Build a testosterone therapy solution",
      "Create a testosterone therapy booking system"
  ],
};
