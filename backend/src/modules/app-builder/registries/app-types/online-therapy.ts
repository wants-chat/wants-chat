/**
 * Online Therapy App Type Definition
 *
 * Complete definition for online therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'online-therapy',
  name: 'Online Therapy',
  category: 'healthcare',
  description: 'Online Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "online therapy",
      "online",
      "therapy",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "healthcare online"
  ],

  synonyms: [
      "Online Therapy platform",
      "Online Therapy software",
      "Online Therapy system",
      "online solution",
      "online service"
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
      "Build a online therapy platform",
      "Create a online therapy app",
      "I need a online therapy management system",
      "Build a online therapy solution",
      "Create a online therapy booking system"
  ],
};
