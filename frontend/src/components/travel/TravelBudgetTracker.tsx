import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Save, 
  X, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Home,
  Car,
  UtensilsCrossed,
  Camera,
  ShoppingBag,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { TravelPlan } from '../../services/travelService';

interface TravelBudgetTrackerProps {
  plan: TravelPlan;
  onUpdate: (updatedPlan: TravelPlan) => void;
  className?: string;
}

interface ExpenseEntry {
  id: string;
  category: keyof TravelPlan['budget']['categories'];
  amount: number;
  description: string;
  date: Date;
  location?: string;
  receipt?: string;
}

const TravelBudgetTracker: React.FC<TravelBudgetTrackerProps> = ({
  plan,
  onUpdate,
  className = ''
}) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetData, setBudgetData] = useState(plan.budget || {
    total: 0,
    currency: 'USD',
    spent: 0,
    categories: {
      accommodation: 0,
      transportation: 0,
      food: 0,
      activities: 0,
      shopping: 0,
      other: 0
    }
  });

  const [addingExpense, setAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<ExpenseEntry>>({
    category: 'food',
    amount: 0,
    description: '',
    date: new Date(),
    location: ''
  });

  // Expenses should come from API - initialize as empty
  const [expenses] = useState<ExpenseEntry[]>([]);

  const categoryIcons = {
    accommodation: <Home className="h-4 w-4" />,
    transportation: <Car className="h-4 w-4" />,
    food: <UtensilsCrossed className="h-4 w-4" />,
    activities: <Camera className="h-4 w-4" />,
    shopping: <ShoppingBag className="h-4 w-4" />,
    other: <MoreHorizontal className="h-4 w-4" />
  };

  const categoryColors = {
    accommodation: 'bg-blue-500',
    transportation: 'bg-green-500',
    food: 'bg-orange-500',
    activities: 'bg-purple-500',
    shopping: 'bg-pink-500',
    other: 'bg-gray-500'
  };

  // Calculate budget analytics
  const budgetAnalytics = useMemo(() => {
    const totalBudget = budgetData.total;
    const totalSpent = budgetData.spent || 0;
    const remaining = totalBudget - totalSpent;
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Calculate category spending
    const categorySpending = Object.entries(budgetData.categories).map(([category, budgetAmount]) => {
      const categoryExpenses = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const percentage = budgetAmount > 0 ? (categoryExpenses / budgetAmount) * 100 : 0;
      
      return {
        category,
        budgetAmount,
        spent: categoryExpenses,
        remaining: budgetAmount - categoryExpenses,
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });

    const dailyBudget = totalBudget > 0 ? totalBudget / plan.duration : 0;
    const dailySpent = totalSpent / plan.duration;
    
    return {
      totalBudget,
      totalSpent,
      remaining,
      spentPercentage,
      categorySpending,
      dailyBudget,
      dailySpent,
      isOverBudget: remaining < 0
    };
  }, [budgetData, expenses, plan.duration]);

  const handleSaveBudget = () => {
    const updatedPlan = { ...plan, budget: budgetData };
    onUpdate(updatedPlan);
    setEditingBudget(false);
  };

  const handleAddExpense = () => {
    // In a real app, this would save to the backend
    console.log('Adding expense:', newExpense);
    
    // Reset form
    setNewExpense({
      category: 'food',
      amount: 0,
      description: '',
      date: new Date(),
      location: ''
    });
    setAddingExpense(false);
  };

  const getBudgetStatusColor = (status: 'good' | 'warning' | 'over') => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'over': return 'text-red-400';
    }
  };

  const getBudgetStatusIcon = (status: 'good' | 'warning' | 'over') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'over': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {budgetAnalytics.totalBudget} {budgetData.currency}
                </p>
                <p className="text-xs text-white/60">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {budgetAnalytics.totalSpent} {budgetData.currency}
                </p>
                <p className="text-xs text-white/60">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                budgetAnalytics.isOverBudget
                  ? 'bg-red-500/20'
                  : 'bg-green-500/20'
              }`}>
                {budgetAnalytics.isOverBudget ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${
                  budgetAnalytics.isOverBudget ? 'text-red-400' : 'text-white'
                }`}>
                  {budgetAnalytics.remaining} {budgetData.currency}
                </p>
                <p className="text-xs text-white/60">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(budgetAnalytics.spentPercentage)}%
                </p>
                <p className="text-xs text-white/60">Budget Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Progress</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingBudget(!editingBudget)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {editingBudget ? 'Cancel' : 'Edit Budget'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(budgetAnalytics.spentPercentage)}% used</span>
            </div>
            <Progress 
              value={budgetAnalytics.spentPercentage} 
              className={`h-3 ${budgetAnalytics.spentPercentage > 100 ? '[&>div]:bg-red-500' : ''}`}
            />
          </div>

          {/* Edit Budget Form */}
          {editingBudget && (
            <div className="p-4 border rounded bg-white/10 backdrop-blur-xl border-white/20 space-y-4">
              <h4 className="font-semibold text-white">Edit Budget Categories</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total-budget">Total Budget</Label>
                  <Input
                    id="total-budget"
                    type="number"
                    value={budgetData.total}
                    onChange={(e) => setBudgetData(prev => ({ 
                      ...prev, 
                      total: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={budgetData.currency}
                    onChange={(e) => setBudgetData(prev => ({ 
                      ...prev, 
                      currency: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(budgetData.categories).map(([category, amount]) => (
                  <div key={category}>
                    <Label htmlFor={`budget-${category}`} className="capitalize">
                      {category}
                    </Label>
                    <Input
                      id={`budget-${category}`}
                      type="number"
                      value={amount}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        categories: {
                          ...prev.categories,
                          [category]: parseFloat(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveBudget}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Budget
                </Button>
                <Button variant="outline" onClick={() => setEditingBudget(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAnalytics.categorySpending.map(({ category, budgetAmount, spent, remaining, percentage, status }) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${categoryColors[category as keyof typeof categoryColors]}`} />
                        <span className="capitalize font-medium">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {spent} / {budgetAmount} {budgetData.currency}
                        </span>
                        <span className={`${getBudgetStatusColor(status)} flex items-center gap-1`}>
                          {getBudgetStatusIcon(status)}
                          <span className="text-sm">{Math.round(percentage)}%</span>
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${percentage > 100 ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Expenses</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingExpense(!addingExpense)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Expense Form */}
              {addingExpense && (
                <div className="p-4 border rounded bg-white/10 backdrop-blur-xl border-white/20 space-y-4">
                  <h4 className="font-semibold text-white">Add New Expense</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense-category">Category</Label>
                      <select
                        id="expense-category"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense(prev => ({ 
                          ...prev, 
                          category: e.target.value as keyof TravelPlan['budget']['categories']
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="accommodation">Accommodation</option>
                        <option value="transportation">Transportation</option>
                        <option value="food">Food</option>
                        <option value="activities">Activities</option>
                        <option value="shopping">Shopping</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="expense-amount">Amount</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense(prev => ({ 
                          ...prev, 
                          amount: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expense-description">Description</Label>
                    <Input
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="What was this expense for?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense-date">Date</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={newExpense.date?.toISOString().split('T')[0]}
                        onChange={(e) => setNewExpense(prev => ({ 
                          ...prev, 
                          date: new Date(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expense-location">Location</Label>
                      <Input
                        id="expense-location"
                        value={newExpense.location}
                        onChange={(e) => setNewExpense(prev => ({ 
                          ...prev, 
                          location: e.target.value 
                        }))}
                        placeholder="Where did you spend this?"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddExpense}>
                      <Save className="h-4 w-4 mr-1" />
                      Add Expense
                    </Button>
                    <Button variant="outline" onClick={() => setAddingExpense(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Expenses List */}
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${
                        categoryColors[expense.category]
                      } bg-opacity-20`}>
                        {categoryIcons[expense.category]}
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {expense.location} • {expense.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {expense.amount} {budgetData.currency}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelBudgetTracker;