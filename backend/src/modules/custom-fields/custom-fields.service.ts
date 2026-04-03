import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'textarea'
  | 'currency'
  | 'email'
  | 'phone'
  | 'url'
  | 'color'
  | 'rating';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldOptions {
  // For select/multiselect
  options?: FieldOption[];
  // For number/currency
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  // For text/textarea
  minLength?: number;
  maxLength?: number;
  // For rating
  maxRating?: number;
}

export interface ValidationRules {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: string; // Custom validation function as string
}

export interface CustomFieldDefinition {
  id: string;
  user_id: string;
  tool_id: string;
  field_name: string;
  field_key: string;
  field_type: FieldType;
  field_options: FieldOptions;
  default_value: any;
  is_required: boolean;
  is_searchable: boolean;
  is_sortable: boolean;
  display_order: number;
  placeholder: string | null;
  help_text: string | null;
  validation_rules: ValidationRules;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomFieldDto {
  field_name: string;
  field_key: string;
  field_type: FieldType;
  field_options?: FieldOptions;
  default_value?: any;
  is_required?: boolean;
  is_searchable?: boolean;
  is_sortable?: boolean;
  display_order?: number;
  placeholder?: string;
  help_text?: string;
  validation_rules?: ValidationRules;
}

export interface UpdateCustomFieldDto {
  field_name?: string;
  field_type?: FieldType;
  field_options?: FieldOptions;
  default_value?: any;
  is_required?: boolean;
  is_searchable?: boolean;
  is_sortable?: boolean;
  display_order?: number;
  placeholder?: string;
  help_text?: string;
  validation_rules?: ValidationRules;
  is_active?: boolean;
}

@Injectable()
export class CustomFieldsService {
  private readonly logger = new Logger(CustomFieldsService.name);

  constructor(private db: DatabaseService) {}

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Create a new custom field definition
   */
  async createCustomField(
    userId: string,
    toolId: string,
    dto: CreateCustomFieldDto,
  ): Promise<CustomFieldDefinition> {
    // Validate field key format
    if (!/^[a-z][a-z0-9_]*$/.test(dto.field_key)) {
      throw new BadRequestException(
        'field_key must start with a letter and contain only lowercase letters, numbers, and underscores',
      );
    }

    // Check if field key already exists for this tool
    const existing = await this.db.findOne<CustomFieldDefinition>(
      'custom_field_definitions',
      {
        user_id: userId,
        tool_id: toolId,
        field_key: dto.field_key,
      },
    );

    if (existing) {
      throw new BadRequestException(
        `Field with key "${dto.field_key}" already exists for this tool`,
      );
    }

    // Get max display order
    const maxOrderResult = await this.db.query<{ max_order: number }>(`
      SELECT COALESCE(MAX(display_order), 0) as max_order
      FROM custom_field_definitions
      WHERE user_id = $1 AND tool_id = $2
    `, [userId, toolId]);

    const displayOrder = dto.display_order ?? (maxOrderResult.rows[0]?.max_order || 0) + 1;

    const field = await this.db.insert<CustomFieldDefinition>(
      'custom_field_definitions',
      {
        user_id: userId,
        tool_id: toolId,
        field_name: dto.field_name,
        field_key: dto.field_key,
        field_type: dto.field_type,
        field_options: dto.field_options || {},
        default_value: dto.default_value !== undefined ? JSON.stringify(dto.default_value) : null,
        is_required: dto.is_required ?? false,
        is_searchable: dto.is_searchable ?? true,
        is_sortable: dto.is_sortable ?? true,
        display_order: displayOrder,
        placeholder: dto.placeholder || null,
        help_text: dto.help_text || null,
        validation_rules: dto.validation_rules || {},
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    );

    this.logger.log(`Created custom field "${dto.field_key}" for tool "${toolId}"`);

    return this.parseField(field);
  }

  /**
   * Get all custom fields for a tool
   */
  async getCustomFields(
    userId: string,
    toolId: string,
    includeInactive: boolean = false,
  ): Promise<CustomFieldDefinition[]> {
    const conditions: Record<string, any> = {
      user_id: userId,
      tool_id: toolId,
    };

    if (!includeInactive) {
      conditions.is_active = true;
    }

    const fields = await this.db.findMany<CustomFieldDefinition>(
      'custom_field_definitions',
      conditions,
      { orderBy: 'display_order', order: 'ASC' },
    );

    return fields.map(f => this.parseField(f));
  }

  /**
   * Get a single custom field
   */
  async getCustomField(
    userId: string,
    toolId: string,
    fieldId: string,
  ): Promise<CustomFieldDefinition | null> {
    const field = await this.db.findOne<CustomFieldDefinition>(
      'custom_field_definitions',
      {
        id: fieldId,
        user_id: userId,
        tool_id: toolId,
      },
    );

    return field ? this.parseField(field) : null;
  }

  /**
   * Update a custom field
   */
  async updateCustomField(
    userId: string,
    toolId: string,
    fieldId: string,
    dto: UpdateCustomFieldDto,
  ): Promise<CustomFieldDefinition | null> {
    const existing = await this.getCustomField(userId, toolId, fieldId);
    if (!existing) return null;

    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (dto.field_name !== undefined) updateData.field_name = dto.field_name;
    if (dto.field_type !== undefined) updateData.field_type = dto.field_type;
    if (dto.field_options !== undefined) updateData.field_options = dto.field_options;
    if (dto.default_value !== undefined) {
      updateData.default_value = JSON.stringify(dto.default_value);
    }
    if (dto.is_required !== undefined) updateData.is_required = dto.is_required;
    if (dto.is_searchable !== undefined) updateData.is_searchable = dto.is_searchable;
    if (dto.is_sortable !== undefined) updateData.is_sortable = dto.is_sortable;
    if (dto.display_order !== undefined) updateData.display_order = dto.display_order;
    if (dto.placeholder !== undefined) updateData.placeholder = dto.placeholder;
    if (dto.help_text !== undefined) updateData.help_text = dto.help_text;
    if (dto.validation_rules !== undefined) updateData.validation_rules = dto.validation_rules;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const [updated] = await this.db.update<CustomFieldDefinition>(
      'custom_field_definitions',
      { id: fieldId, user_id: userId, tool_id: toolId },
      updateData,
    );

    return updated ? this.parseField(updated) : null;
  }

  /**
   * Delete a custom field
   */
  async deleteCustomField(
    userId: string,
    toolId: string,
    fieldId: string,
  ): Promise<boolean> {
    const count = await this.db.delete('custom_field_definitions', {
      id: fieldId,
      user_id: userId,
      tool_id: toolId,
    });
    return count > 0;
  }

  /**
   * Reorder custom fields
   */
  async reorderCustomFields(
    userId: string,
    toolId: string,
    fieldOrders: Array<{ id: string; order: number }>,
  ): Promise<void> {
    await this.db.transaction(async (client) => {
      for (const { id, order } of fieldOrders) {
        await client.query(
          `UPDATE custom_field_definitions
           SET display_order = $1, updated_at = NOW()
           WHERE id = $2 AND user_id = $3 AND tool_id = $4`,
          [order, id, userId, toolId],
        );
      }
    });
  }

  // ============================================
  // Field Value Operations
  // ============================================

  /**
   * Validate a value against a custom field definition
   */
  validateFieldValue(field: CustomFieldDefinition, value: any): {
    valid: boolean;
    error?: string;
  } {
    // Required check
    if (field.is_required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: `${field.field_name} is required` };
    }

    // Skip further validation if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    // Type-specific validation
    switch (field.field_type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, error: 'Invalid email format' };
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          return { valid: false, error: 'Invalid URL format' };
        }
        break;

      case 'number':
      case 'currency':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: 'Must be a number' };
        }
        if (field.field_options?.min !== undefined && value < field.field_options.min) {
          return { valid: false, error: `Minimum value is ${field.field_options.min}` };
        }
        if (field.field_options?.max !== undefined && value > field.field_options.max) {
          return { valid: false, error: `Maximum value is ${field.field_options.max}` };
        }
        break;

      case 'select':
        const validOptions = field.field_options?.options?.map(o => o.value) || [];
        if (!validOptions.includes(value)) {
          return { valid: false, error: 'Invalid option selected' };
        }
        break;

      case 'multiselect':
        if (!Array.isArray(value)) {
          return { valid: false, error: 'Must be an array' };
        }
        const validMultiOptions = field.field_options?.options?.map(o => o.value) || [];
        for (const v of value) {
          if (!validMultiOptions.includes(v)) {
            return { valid: false, error: `Invalid option: ${v}` };
          }
        }
        break;

      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return { valid: false, error: 'Must be a string' };
        }
        if (field.validation_rules?.minLength && value.length < field.validation_rules.minLength) {
          return { valid: false, error: `Minimum length is ${field.validation_rules.minLength}` };
        }
        if (field.validation_rules?.maxLength && value.length > field.validation_rules.maxLength) {
          return { valid: false, error: `Maximum length is ${field.validation_rules.maxLength}` };
        }
        if (field.validation_rules?.pattern) {
          const regex = new RegExp(field.validation_rules.pattern);
          if (!regex.test(value)) {
            return { valid: false, error: 'Invalid format' };
          }
        }
        break;

      case 'date':
      case 'datetime':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, error: 'Invalid date format' };
        }
        break;

      case 'checkbox':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'Must be a boolean' };
        }
        break;

      case 'rating':
        if (typeof value !== 'number' || value < 0) {
          return { valid: false, error: 'Must be a positive number' };
        }
        const maxRating = field.field_options?.maxRating || 5;
        if (value > maxRating) {
          return { valid: false, error: `Maximum rating is ${maxRating}` };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Apply default values to a data item
   */
  applyDefaults(
    fields: CustomFieldDefinition[],
    item: Record<string, any>,
  ): Record<string, any> {
    const result = { ...item };

    for (const field of fields) {
      if (result[field.field_key] === undefined && field.default_value !== null) {
        result[field.field_key] = field.default_value;
      }
    }

    return result;
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Copy custom fields from one tool to another
   */
  async copyCustomFields(
    userId: string,
    sourceToolId: string,
    targetToolId: string,
  ): Promise<CustomFieldDefinition[]> {
    const sourceFields = await this.getCustomFields(userId, sourceToolId);
    const createdFields: CustomFieldDefinition[] = [];

    for (const field of sourceFields) {
      const newField = await this.createCustomField(userId, targetToolId, {
        field_name: field.field_name,
        field_key: field.field_key,
        field_type: field.field_type,
        field_options: field.field_options,
        default_value: field.default_value,
        is_required: field.is_required,
        is_searchable: field.is_searchable,
        is_sortable: field.is_sortable,
        display_order: field.display_order,
        placeholder: field.placeholder || undefined,
        help_text: field.help_text || undefined,
        validation_rules: field.validation_rules,
      });
      createdFields.push(newField);
    }

    return createdFields;
  }

  /**
   * Export custom field definitions as JSON
   */
  async exportCustomFields(
    userId: string,
    toolId: string,
  ): Promise<{
    toolId: string;
    fields: Omit<CreateCustomFieldDto, 'display_order'>[];
    exportedAt: string;
  }> {
    const fields = await this.getCustomFields(userId, toolId);

    return {
      toolId,
      fields: fields.map(f => ({
        field_name: f.field_name,
        field_key: f.field_key,
        field_type: f.field_type,
        field_options: f.field_options,
        default_value: f.default_value,
        is_required: f.is_required,
        is_searchable: f.is_searchable,
        is_sortable: f.is_sortable,
        placeholder: f.placeholder || undefined,
        help_text: f.help_text || undefined,
        validation_rules: f.validation_rules,
      })),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import custom field definitions from JSON
   */
  async importCustomFields(
    userId: string,
    toolId: string,
    fields: CreateCustomFieldDto[],
    replaceExisting: boolean = false,
  ): Promise<{ created: number; skipped: number; errors: string[] }> {
    const result = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    if (replaceExisting) {
      // Delete existing fields
      await this.db.delete('custom_field_definitions', {
        user_id: userId,
        tool_id: toolId,
      });
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      try {
        await this.createCustomField(userId, toolId, {
          ...field,
          display_order: i + 1,
        });
        result.created++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          result.skipped++;
        } else {
          result.errors.push(`Field "${field.field_key}": ${error.message}`);
        }
      }
    }

    return result;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private parseField(field: CustomFieldDefinition): CustomFieldDefinition {
    return {
      ...field,
      field_options: typeof field.field_options === 'string'
        ? JSON.parse(field.field_options)
        : field.field_options || {},
      default_value: field.default_value
        ? (typeof field.default_value === 'string'
          ? JSON.parse(field.default_value)
          : field.default_value)
        : null,
      validation_rules: typeof field.validation_rules === 'string'
        ? JSON.parse(field.validation_rules)
        : field.validation_rules || {},
    };
  }
}
