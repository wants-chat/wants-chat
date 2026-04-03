/**
 * Strength Training App Type Definition
 *
 * Complete definition for strength training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRENGTH_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'strength-training',
  name: 'Strength Training',
  category: 'education',
  description: 'Strength Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "strength training",
      "strength",
      "training",
      "strength software",
      "strength app",
      "strength platform",
      "strength system",
      "strength management",
      "education strength"
  ],

  synonyms: [
      "Strength Training platform",
      "Strength Training software",
      "Strength Training system",
      "strength solution",
      "strength service"
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
      "Build a strength training platform",
      "Create a strength training app",
      "I need a strength training management system",
      "Build a strength training solution",
      "Create a strength training booking system"
  ],
};
