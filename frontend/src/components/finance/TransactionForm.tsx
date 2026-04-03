import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { X, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
  type: 'expense' | 'income';
  isLoading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  type, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    paymentMethod: type === 'expense' ? 'cash' : '',
    source: type === 'income' ? '' : undefined,
    incomeCategory: type === 'income' ? 'other' : undefined,
    isRecurring: false,
    recurringFrequency: 'monthly',
    recurringInterval: '1',
    recurringEndDate: '',
    tags: [] as string[],
    newTag: '',
    taxable: type === 'income' ? false : undefined,
    currency: 'USD'
  });

  const expenseCategories = [
    'Food & Drink',
    'Shopping',
    'Transportation', 
    'Entertainment',
    'Utilities',
    'Housing',
    'Healthcare',
    'Education',
    'Personal Care',
    'Travel',
    'Insurance',
    'Investments',
    'Debt Payment',
    'Gifts & Donations',
    'Business',
    'Other'
  ];

  const incomeCategories = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment' },
    { value: 'business', label: 'Business' },
    { value: 'rental', label: 'Rental' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      return;
    }

    const transactionData: any = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date),
      currency: formData.currency,
      tags: formData.tags,
      isRecurring: formData.isRecurring
    };

    if (formData.subcategory) {
      transactionData.subcategory = formData.subcategory;
    }

    if (formData.location) {
      transactionData.location = formData.location;
    }

    if (formData.isRecurring) {
      transactionData.recurringPattern = {
        frequency: formData.recurringFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        interval: parseInt(formData.recurringInterval),
        endDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined
      };
    }

    if (type === 'expense') {
      transactionData.paymentMethod = formData.paymentMethod;
    } else {
      transactionData.source = formData.source;
      transactionData.category = formData.incomeCategory;
      transactionData.taxable = formData.taxable;
    }

    onSubmit(transactionData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      subcategory: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      paymentMethod: type === 'expense' ? 'cash' : '',
      source: type === 'income' ? '' : undefined,
      incomeCategory: type === 'income' ? 'other' : undefined,
      isRecurring: false,
      recurringFrequency: 'monthly',
      recurringInterval: '1',
      recurringEndDate: '',
      tags: [],
      newTag: '',
      taxable: type === 'income' ? false : undefined,
      currency: 'USD'
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {type === 'expense' ? 'Add New Expense' : 'Add New Income'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder={type === 'expense' ? 'e.g., Coffee, Groceries' : 'e.g., Salary, Freelance payment'}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount ($)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                {type === 'expense' ? (
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select 
                    value={formData.incomeCategory} 
                    onValueChange={(value) => handleInputChange('incomeCategory', value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select income type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Payment Method or Source */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {type === 'expense' ? 'Payment Method' : 'Income Source'}
                </Label>
                {type === 'expense' ? (
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    placeholder="e.g., Company Name, Client Name"
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="h-12 rounded-xl"
                  />
                )}
              </div>
            </div>

            {/* Location (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location (Optional)
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Starbucks, Walmart"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Income-specific: Taxable */}
            {type === 'income' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="taxable"
                  checked={formData.taxable}
                  onCheckedChange={(checked) => handleInputChange('taxable', checked)}
                />
                <Label htmlFor="taxable" className="text-sm font-medium">
                  This income is taxable
                </Label>
              </div>
            )}

            {/* Recurring Transaction */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                />
                <Label htmlFor="recurring" className="text-sm font-medium">
                  This is a recurring {type}
                </Label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Frequency</Label>
                    <Select 
                      value={formData.recurringFrequency} 
                      onValueChange={(value) => handleInputChange('recurringFrequency', value)}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interval" className="text-sm font-medium">
                      Every
                    </Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={formData.recurringInterval}
                      onChange={(e) => handleInputChange('recurringInterval', e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a tag"
                  value={formData.newTag}
                  onChange={(e) => handleInputChange('newTag', e.target.value)}
                  className="h-10 rounded-lg flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-full text-sm text-white">
                      {tag}
                      <Button
                        type="button"
                        onClick={() => removeTag(tag)}
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;