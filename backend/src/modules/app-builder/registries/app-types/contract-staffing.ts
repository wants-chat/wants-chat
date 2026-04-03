/**
 * Contract Staffing App Type Definition
 *
 * Complete definition for contract staffing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONTRACT_STAFFING_APP_TYPE: AppTypeDefinition = {
  id: 'contract-staffing',
  name: 'Contract Staffing',
  category: 'services',
  description: 'Contract Staffing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "contract staffing",
      "contract",
      "staffing",
      "contract software",
      "contract app",
      "contract platform",
      "contract system",
      "contract management",
      "services contract"
  ],

  synonyms: [
      "Contract Staffing platform",
      "Contract Staffing software",
      "Contract Staffing system",
      "contract solution",
      "contract service"
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
      "Build a contract staffing platform",
      "Create a contract staffing app",
      "I need a contract staffing management system",
      "Build a contract staffing solution",
      "Create a contract staffing booking system"
  ],
};
