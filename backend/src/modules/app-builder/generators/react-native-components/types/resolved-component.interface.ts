export interface FieldMapping {
  targetField: string;  // The field name to use in generated code
  sourceField: string;  // The actual field found in data
  fallback?: any;       // Fallback value if field not found
}

import { UIStyleVariant } from '../../../interfaces/app-builder.types';

export interface ResolvedComponent {
  componentType: string;
  dataSource: string;
  fieldMappings: FieldMapping[];
  warnings: string[];
  // Original component data for dynamic form generation
  data?: {
    entity?: string;
    fields?: Array<{
      name: string;
      type: string;
      required?: boolean;
    }>;
  };
  title?: string;
  props?: Record<string, any>;
  // UI style configuration for dynamic styling
  uiStyle?: UIStyleVariant;
  // Component actions (for forms with serverFunction routes)
  actions?: Array<{
    id: string;
    type: string;
    trigger?: string;
    serverFunction?: {
      id: string;
      name: string;
      httpMethod: string;
      route: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
}
