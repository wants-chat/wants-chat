/**
 * Sport Training App Type Definition
 *
 * Complete definition for sport training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORT_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'sport-training',
  name: 'Sport Training',
  category: 'education',
  description: 'Sport Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "sport training",
      "sport",
      "training",
      "sport software",
      "sport app",
      "sport platform",
      "sport system",
      "sport management",
      "education sport"
  ],

  synonyms: [
      "Sport Training platform",
      "Sport Training software",
      "Sport Training system",
      "sport solution",
      "sport service"
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
      "Build a sport training platform",
      "Create a sport training app",
      "I need a sport training management system",
      "Build a sport training solution",
      "Create a sport training booking system"
  ],
};
