/**
 * Schema Interface Definitions
 *
 * Database schema is DERIVED from component field definitions.
 * This prevents AI hallucination of database structures.
 */

/**
 * Database column types (PostgreSQL)
 */
export type DbColumnType =
  | 'uuid'
  | 'varchar'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'timestamptz'
  | 'jsonb'
  | 'array';

/**
 * Column constraint types
 */
export type ColumnConstraint =
  | 'primary_key'
  | 'not_null'
  | 'unique'
  | 'default'
  | 'foreign_key'
  | 'check';

/**
 * Database column definition
 */
export interface DbColumn {
  /** Column name (snake_case) */
  name: string;

  /** Column type */
  type: DbColumnType;

  /** Type parameters (e.g., varchar(255), decimal(10,2)) */
  typeParams?: string;

  /** Constraints */
  constraints: ColumnConstraint[];

  /** Default value */
  default?: string;

  /** For foreign keys - referenced table */
  references?: {
    table: string;
    column: string;
    onDelete: 'cascade' | 'set null' | 'restrict';
    onUpdate: 'cascade' | 'set null' | 'restrict';
  };

  /** For array types - element type */
  arrayType?: DbColumnType;

  /** Comment/description */
  comment?: string;
}

/**
 * Index definition
 */
export interface DbIndex {
  /** Index name */
  name: string;

  /** Columns included */
  columns: string[];

  /** Is unique index? */
  unique: boolean;

  /** Index type */
  type?: 'btree' | 'hash' | 'gin' | 'gist';

  /** Partial index condition */
  where?: string;
}

/**
 * Table definition
 */
export interface DbTable {
  /** Table name (snake_case, plural) */
  name: string;

  /** Human-readable name */
  displayName: string;

  /** Description */
  description?: string;

  /** Columns */
  columns: DbColumn[];

  /** Indexes */
  indexes: DbIndex[];

  /** Has timestamps (created_at, updated_at)? */
  timestamps: boolean;

  /** Has soft delete (deleted_at)? */
  softDelete: boolean;

  /** Has user ownership (user_id)? */
  userOwnership: boolean;

  /** Source components (for traceability) */
  sourceComponents: string[];
}

/**
 * Relation type
 */
export type RelationType =
  | 'one-to-one'
  | 'one-to-many'
  | 'many-to-many';

/**
 * Table relation definition
 */
export interface DbRelation {
  /** Relation name */
  name: string;

  /** Relation type */
  type: RelationType;

  /** Source table */
  sourceTable: string;

  /** Source column (foreign key) */
  sourceColumn: string;

  /** Target table */
  targetTable: string;

  /** Target column (usually 'id') */
  targetColumn: string;

  /** For many-to-many - junction table */
  junctionTable?: string;

  /** On delete behavior */
  onDelete: 'cascade' | 'set null' | 'restrict';
}

/**
 * Enum type definition for database
 */
export interface DbEnum {
  /** Enum name */
  name: string;

  /** Possible values */
  values: string[];

  /** Description */
  description?: string;
}

/**
 * Complete database schema
 */
export interface DatabaseSchema {
  /** All tables */
  tables: DbTable[];

  /** All relations */
  relations: DbRelation[];

  /** All enum types */
  enums?: DbEnum[];

  /** Schema version (for migrations) */
  version: number;

  /** Generated at timestamp */
  generatedAt: string;

  /** Source app type */
  appType: string;

  /** Source features */
  features: string[];
}

/**
 * Schema derivation result
 */
export interface SchemaDeriveResult {
  /** Generated schema */
  schema: DatabaseSchema;

  /** Components that contributed to schema */
  sourceComponents: string[];

  /** Fields that had to use fallbacks */
  fallbackFields: {
    component: string;
    field: string;
    originalName: string;
    mappedTo: string;
  }[];

  /** Warnings during derivation */
  warnings: string[];
}

/**
 * Map from FieldType to DbColumnType
 */
export const FIELD_TYPE_TO_DB: Record<string, { type: DbColumnType; params?: string }> = {
  'uuid': { type: 'uuid' },
  'string': { type: 'varchar', params: '255' },
  'text': { type: 'text' },
  'integer': { type: 'integer' },
  'decimal': { type: 'decimal', params: '10,2' },
  'boolean': { type: 'boolean' },
  'date': { type: 'date' },
  'datetime': { type: 'timestamptz' },
  'json': { type: 'jsonb' },
  'array': { type: 'jsonb' },  // Arrays stored as JSONB
  'enum': { type: 'varchar', params: '50' },
  'file': { type: 'varchar', params: '500' },
  'image': { type: 'varchar', params: '500' },
  'email': { type: 'varchar', params: '255' },
  'phone': { type: 'varchar', params: '20' },
  'url': { type: 'varchar', params: '2000' },
};
