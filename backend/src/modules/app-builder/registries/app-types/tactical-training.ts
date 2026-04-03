/**
 * Tactical Training App Type Definition
 *
 * Complete definition for tactical training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TACTICAL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'tactical-training',
  name: 'Tactical Training',
  category: 'education',
  description: 'Tactical Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "tactical training",
      "tactical",
      "training",
      "tactical software",
      "tactical app",
      "tactical platform",
      "tactical system",
      "tactical management",
      "education tactical"
  ],

  synonyms: [
      "Tactical Training platform",
      "Tactical Training software",
      "Tactical Training system",
      "tactical solution",
      "tactical service"
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
          "name": "Instructor",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Student",
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
      "course-management",
      "enrollment",
      "calendar",
      "certificates",
      "notifications"
  ],

  optionalFeatures: [
      "lms",
      "assignments",
      "payments",
      "attendance",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a tactical training platform",
      "Create a tactical training app",
      "I need a tactical training management system",
      "Build a tactical training solution",
      "Create a tactical training booking system"
  ],
};
