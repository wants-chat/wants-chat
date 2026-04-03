/**
 * Agility Training App Type Definition
 *
 * Complete definition for agility training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGILITY_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'agility-training',
  name: 'Agility Training',
  category: 'education',
  description: 'Agility Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "agility training",
      "agility",
      "training",
      "agility software",
      "agility app",
      "agility platform",
      "agility system",
      "agility management",
      "education agility"
  ],

  synonyms: [
      "Agility Training platform",
      "Agility Training software",
      "Agility Training system",
      "agility solution",
      "agility service"
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
      "Build a agility training platform",
      "Create a agility training app",
      "I need a agility training management system",
      "Build a agility training solution",
      "Create a agility training booking system"
  ],
};
