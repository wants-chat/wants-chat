/**
 * Leadership Training App Type Definition
 *
 * Complete definition for leadership training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEADERSHIP_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'leadership-training',
  name: 'Leadership Training',
  category: 'education',
  description: 'Leadership Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "leadership training",
      "leadership",
      "training",
      "leadership software",
      "leadership app",
      "leadership platform",
      "leadership system",
      "leadership management",
      "education leadership"
  ],

  synonyms: [
      "Leadership Training platform",
      "Leadership Training software",
      "Leadership Training system",
      "leadership solution",
      "leadership service"
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
      "Build a leadership training platform",
      "Create a leadership training app",
      "I need a leadership training management system",
      "Build a leadership training solution",
      "Create a leadership training booking system"
  ],
};
