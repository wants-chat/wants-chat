/**
 * Vision Therapy App Type Definition
 *
 * Complete definition for vision therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISION_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'vision-therapy',
  name: 'Vision Therapy',
  category: 'healthcare',
  description: 'Vision Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "vision therapy",
      "vision",
      "therapy",
      "vision software",
      "vision app",
      "vision platform",
      "vision system",
      "vision management",
      "healthcare vision"
  ],

  synonyms: [
      "Vision Therapy platform",
      "Vision Therapy software",
      "Vision Therapy system",
      "vision solution",
      "vision service"
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
      "Build a vision therapy platform",
      "Create a vision therapy app",
      "I need a vision therapy management system",
      "Build a vision therapy solution",
      "Create a vision therapy booking system"
  ],
};
