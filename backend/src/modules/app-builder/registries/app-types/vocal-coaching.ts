/**
 * Vocal Coaching App Type Definition
 *
 * Complete definition for vocal coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOCAL_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'vocal-coaching',
  name: 'Vocal Coaching',
  category: 'professional-services',
  description: 'Vocal Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "vocal coaching",
      "vocal",
      "coaching",
      "vocal software",
      "vocal app",
      "vocal platform",
      "vocal system",
      "vocal management",
      "consulting vocal"
  ],

  synonyms: [
      "Vocal Coaching platform",
      "Vocal Coaching software",
      "Vocal Coaching system",
      "vocal solution",
      "vocal service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a vocal coaching platform",
      "Create a vocal coaching app",
      "I need a vocal coaching management system",
      "Build a vocal coaching solution",
      "Create a vocal coaching booking system"
  ],
};
