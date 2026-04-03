import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  Folder, 
  Hash,
  Grid3X3,
  Search
} from 'lucide-react';

interface Category {
  name: string;
  subcategories?: string[];
  color?: string;
  icon?: string;
  transactionCount?: number;
  totalAmount?: number;
}

interface CategoriesManagerProps {
  categories: Category[];
  isLoading?: boolean;
  onCreateCategory?: (category: Omit<Category, 'transactionCount' | 'totalAmount'>) => void;
  onUpdateCategory?: (oldName: string, category: Omit<Category, 'transactionCount' | 'totalAmount'>) => void;
  onDeleteCategory?: (name: string) => void;
  readOnly?: boolean;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories = [],
  isLoading = false,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  readOnly = false
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subcategories: [] as string[],
    newSubcategory: '',
    color: '#3b82f6'
  });

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
    '#6366f1', '#f43f5e', '#22c55e', '#eab308', '#a855f7'
  ];

  const defaultCategories = [
    { name: 'Food & Drink', color: '#f59e0b' },
    { name: 'Shopping', color: '#10b981' },
    { name: 'Transportation', color: '#3b82f6' },
    { name: 'Entertainment', color: '#8b5cf6' },
    { name: 'Utilities', color: '#ef4444' },
    { name: 'Housing', color: '#14b8a6' },
    { name: 'Healthcare', color: '#ec4899' },
    { name: 'Education', color: '#f97316' },
    { name: 'Personal Care', color: '#84cc16' },
    { name: 'Travel', color: '#06b6d4' },
    { name: 'Insurance', color: '#6366f1' },
    { name: 'Investments', color: '#22c55e' },
    { name: 'Debt Payment', color: '#f43f5e' },
    { name: 'Gifts & Donations', color: '#eab308' },
    { name: 'Business', color: '#a855f7' },
    { name: 'Other', color: '#6b7280' }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.subcategories && category.subcategories.some(sub => 
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      subcategories: formData.subcategories.filter(sub => sub.trim()),
      color: formData.color
    };

    if (editingCategory && onUpdateCategory) {
      onUpdateCategory(editingCategory.name, categoryData);
    } else if (onCreateCategory) {
      onCreateCategory(categoryData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subcategories: [],
      newSubcategory: '',
      color: '#3b82f6'
    });
    setEditingCategory(null);
    setIsCreateOpen(false);
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      subcategories: category.subcategories || [],
      newSubcategory: '',
      color: category.color || '#3b82f6'
    });
    setIsCreateOpen(true);
  };

  const addSubcategory = () => {
    if (formData.newSubcategory.trim() && !formData.subcategories.includes(formData.newSubcategory.trim())) {
      setFormData(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, prev.newSubcategory.trim()],
        newSubcategory: ''
      }));
    }
  };

  const removeSubcategory = (subcategory: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(sub => sub !== subcategory)
    }));
  };

  const addDefaultCategories = () => {
    defaultCategories.forEach(category => {
      if (!categories.find(cat => cat.name === category.name) && onCreateCategory) {
        onCreateCategory(category);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-xl animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Categories Management</h2>
          <p className="text-white/60">
            Organize your transactions with custom categories
          </p>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            {categories.length === 0 && (
              <Button
                variant="outline"
                onClick={addDefaultCategories}
                className="rounded-xl"
                disabled={!onCreateCategory}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Add Default Categories
              </Button>
            )}
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger>
                <Button className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Category Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Food & Drink"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-10 rounded-lg"
                      required
                    />
                  </div>

                  {/* Color Picker */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color 
                              ? 'border-gray-900 dark:border-white scale-110' 
                              : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subcategories (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add a subcategory"
                        value={formData.newSubcategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, newSubcategory: e.target.value }))}
                        className="h-9 rounded-lg flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
                      />
                      <Button
                        type="button"
                        onClick={addSubcategory}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.subcategories.map((subcategory) => (
                          <div key={subcategory} className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 px-2 py-1 rounded-lg text-sm text-white">
                            {subcategory}
                            <button
                              type="button"
                              onClick={() => removeSubcategory(subcategory)}
                              className="hover:text-red-500 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 h-10 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-lg"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 && categories.length === 0 ? (
        <Card className="rounded-xl p-12 text-center">
          <Tag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Categories Yet</h3>
          <p className="text-white/60 mb-6">
            Create categories to organize your transactions better
          </p>
          {!readOnly && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={addDefaultCategories}
                variant="outline"
                className="rounded-xl"
                disabled={!onCreateCategory}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Add Default Categories
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Category
              </Button>
            </div>
          )}
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card className="rounded-xl p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Categories Found</h3>
          <p className="text-white/60">
            No categories match your search query
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.name} className="rounded-xl hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    />
                    <h3 className="font-semibold text-white truncate">
                      {category.name}
                    </h3>
                  </div>

                  {!readOnly && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editCategory(category)}
                        className="h-7 w-7 p-0 text-white/60 hover:text-white"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {onDeleteCategory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteCategory(category.name)}
                          className="h-7 w-7 p-0 text-white/60 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                {(category.transactionCount !== undefined || category.totalAmount !== undefined) && (
                  <div className="mb-3 space-y-1">
                    {category.transactionCount !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-white/60">
                        <Hash className="h-3 w-3" />
                        {category.transactionCount} transactions
                      </div>
                    )}
                    {category.totalAmount !== undefined && (
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(category.totalAmount)}
                      </div>
                    )}
                  </div>
                )}

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Folder className="h-3 w-3" />
                      Subcategories
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 4).map((subcategory) => (
                        <Badge key={subcategory} variant="secondary" className="text-xs">
                          {subcategory}
                        </Badge>
                      ))}
                      {category.subcategories.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{category.subcategories.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* No subcategories placeholder */}
                {(!category.subcategories || category.subcategories.length === 0) && (
                  <div className="text-xs text-white/40">
                    No subcategories
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;