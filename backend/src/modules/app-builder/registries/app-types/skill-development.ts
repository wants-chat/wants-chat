/**
 * Skill Development App Type Definition
 *
 * Complete definition for skill development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKILL_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'skill-development',
  name: 'Skill Development',
  category: 'services',
  description: 'Skill Development platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "skill development",
      "skill",
      "development",
      "skill software",
      "skill app",
      "skill platform",
      "skill system",
      "skill management",
      "services skill"
  ],

  synonyms: [
      "Skill Development platform",
      "Skill Development software",
      "Skill Development system",
      "skill solution",
      "skill service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a skill development platform",
      "Create a skill development app",
      "I need a skill development management system",
      "Build a skill development solution",
      "Create a skill development booking system"
  ],
};
