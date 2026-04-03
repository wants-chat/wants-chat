-- Business Tools Tables Migration
-- Created: 2025-12-30
-- Description: Creates tables for data-oriented business tools
--   - Customers (Simple CRM)
--   - Expense Categories & Expenses
--   - Product Categories & Products
--   - Invoices & Line Items

-- ============================================
-- CUSTOMERS MODULE (Simple CRM) - FIRST (no dependencies)
-- ============================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- Classification
    type VARCHAR(50) DEFAULT 'customer' CHECK (type IN ('lead', 'prospect', 'customer', 'partner', 'vendor')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    source VARCHAR(100),
    tags TEXT[],

    -- Financial
    total_spent DECIMAL(12, 2) DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    outstanding_balance DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Notes
    notes TEXT,

    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer interactions/notes
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'follow_up')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100),

    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXPENSE CATEGORIES & EXPENSES MODULE
-- ============================================

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    budget_amount DECIMAL(12, 2),

    parent_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,

    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Categorization
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,

    -- Payment info
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'paypal', 'other')),

    -- Vendor/Merchant
    merchant VARCHAR(255),

    -- Date and receipt
    expense_date DATE DEFAULT CURRENT_DATE,
    receipt_url VARCHAR(500),

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    is_recurring BOOLEAN DEFAULT FALSE,
    is_tax_deductible BOOLEAN DEFAULT FALSE,

    -- Notes and tags
    notes TEXT,
    tags TEXT[],

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring expenses
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,

    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE,

    is_active BOOLEAN DEFAULT TRUE,
    auto_create BOOLEAN DEFAULT TRUE,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVENTORY MODULE (Products)
-- ============================================

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),

    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,

    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),

    -- Categorization
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,

    -- Pricing
    cost_price DECIMAL(12, 2),
    selling_price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Inventory
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER,
    unit VARCHAR(50) DEFAULT 'pcs',

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'out_of_stock')),
    is_trackable BOOLEAN DEFAULT TRUE,

    -- Media
    image_url VARCHAR(500),
    images TEXT[],

    -- Additional
    supplier_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    location VARCHAR(255),
    tags TEXT[],

    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory transactions (stock movements)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage', 'expired')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,

    unit_price DECIMAL(12, 2),
    total_amount DECIMAL(12, 2),

    reference VARCHAR(100),
    notes TEXT,

    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVOICES MODULE (depends on customers and products)
-- ============================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Invoice details
    invoice_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

    -- Client info (can link to customers table or store directly)
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,

    -- Financial
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date DATE,

    -- Additional info
    notes TEXT,
    terms TEXT,
    footer TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,

    -- Optional product link
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,

    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice payments
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE DEFAULT CURRENT_DATE,
    reference VARCHAR(100),
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_categories_user_id ON product_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_customers_name_search ON customers USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_expenses_description_search ON expenses USING gin(to_tsvector('english', description));
