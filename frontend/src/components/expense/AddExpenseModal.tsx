import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import {
  Close,
  LocalCafe,
  ShoppingCart,
  DirectionsCar,
  Movie,
  Phone,
  Home,
  LocalGasStation,
  Restaurant,
  School,
  LocalHospital,
  Category
} from '@mui/icons-material';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'Food & Drink', label: 'Food & Drink', icon: <LocalCafe className="h-5 w-5" />, bg: 'bg-orange-50' },
    { value: 'Shopping', label: 'Shopping', icon: <ShoppingCart className="h-5 w-5" />, bg: 'bg-green-50' },
    { value: 'Transportation', label: 'Transportation', icon: <DirectionsCar className="h-5 w-5" />, bg: 'bg-blue-50' },
    { value: 'Entertainment', label: 'Entertainment', icon: <Movie className="h-5 w-5" />, bg: 'bg-purple-50' },
    { value: 'Utilities', label: 'Utilities', icon: <Phone className="h-5 w-5" />, bg: 'bg-yellow-50' },
    { value: 'Housing', label: 'Housing', icon: <Home className="h-5 w-5" />, bg: 'bg-indigo-50' },
    { value: 'Fuel', label: 'Fuel', icon: <LocalGasStation className="h-5 w-5" />, bg: 'bg-red-50' },
    { value: 'Dining', label: 'Dining', icon: <Restaurant className="h-5 w-5" />, bg: 'bg-pink-50' },
    { value: 'Education', label: 'Education', icon: <School className="h-5 w-5" />, bg: 'bg-cyan-50' },
    { value: 'Healthcare', label: 'Healthcare', icon: <LocalHospital className="h-5 w-5" />, bg: 'bg-emerald-50' },
    { value: 'Other', label: 'Other', icon: <Category className="h-5 w-5" />, bg: 'bg-gray-50' }
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Check'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category || !formData.paymentMethod) {
      return;
    }

    const selectedCategory = categories.find(cat => cat.value === formData.category);
    
    const newExpense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      category: formData.category,
      description: formData.description,
      paymentMethod: formData.paymentMethod as any,
      icon: React.cloneElement(selectedCategory?.icon || <Category className="h-6 w-6" />, {
        className: "h-6 w-6",
        style: { color: '#47bdff' }
      }),
      backgroundColor: selectedCategory?.bg || 'bg-gray-50'
    };

    onSave(newExpense);
    
    // Reset form
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      paymentMethod: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Add New Expense</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <Close className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Expense Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Coffee, Groceries"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="e.g., Starbucks, Weekly groceries"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpenseModal;