/**
 * Veteran Services App Type Definition
 *
 * Complete definition for veteran services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERAN_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'veteran-services',
  name: 'Veteran Services',
  category: 'pets',
  description: 'Veteran Services platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "veteran services",
      "veteran",
      "services",
      "veteran software",
      "veteran app",
      "veteran platform",
      "veteran system",
      "veteran management",
      "pets veteran"
  ],

  synonyms: [
      "Veteran Services platform",
      "Veteran Services software",
      "Veteran Services system",
      "veteran solution",
      "veteran service"
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
      "client-intake",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "reminders",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a veteran services platform",
      "Create a veteran services app",
      "I need a veteran services management system",
      "Build a veteran services solution",
      "Create a veteran services booking system"
  ],
};
