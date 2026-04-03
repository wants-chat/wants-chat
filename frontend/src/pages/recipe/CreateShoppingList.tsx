import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, X, Package2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { recipeService } from '../../services/recipeService';
import { toast } from '../../components/ui/use-toast';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
  estimated_price?: number;
  completed?: boolean;
  notes?: string;
  recipe_ids?: string[];
}

const CreateShoppingList: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [store, setStore] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [estimatedTotal, setEstimatedTotal] = useState<number | undefined>();
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<ShoppingItem>({
    name: '',
    quantity: '',
    category: '',
    estimated_price: undefined,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    'meat',
    'vegetables', 
    'fruits',
    'dairy',
    'grains',
    'pantry',
    'spices',
    'beverages',
    'frozen',
    'bakery',
    'snacks',
    'other'
  ];

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddItem = () => {
    if (currentItem.name.trim() && currentItem.quantity.trim()) {
      const newItem: ShoppingItem = {
        ...currentItem,
        category: currentItem.category || 'other',
        completed: false
      };
      
      setItems([...items, newItem]);
      setCurrentItem({
        name: '',
        quantity: '',
        category: '',
        estimated_price: undefined,
        notes: ''
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ShoppingItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a shopping list name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const shoppingListData = {
        name: name.trim(),
        description: description.trim() || undefined,
        items,
        store: store.trim() || undefined,
        estimated_total: estimatedTotal || calculateTotal(),
        tags,
        metadata: {}
      };

      await recipeService.createShoppingList(shoppingListData);
      
      toast({
        title: 'Success',
        description: 'Shopping list created successfully!'
      });

      navigate('/recipe-builder');
    } catch (error) {
      console.error('Failed to create shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shopping list. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="rounded-full h-10 w-10 p-0 bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
                title="Back to Shopping Lists"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <ShoppingBag className="h-8 w-8 text-teal-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Create Shopping List
                </h1>
                <p className="text-sm text-white/60">
                  Organize your grocery shopping
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <GlassCard hover={false}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                <p className="text-sm text-white/60">Enter the basic details for your shopping list</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/80">List Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Weekly Groceries"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store" className="text-white/80">Store (optional)</Label>
                    <Input
                      id="store"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      placeholder="e.g., Whole Foods, Walmart"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white/80">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this shopping list..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-white/80">Tags (optional)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag and press Enter"
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Button type="button" size="sm" onClick={handleAddTag} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} className="flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-400"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Add Items */}
            <GlassCard hover={false}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Add Items</h2>
                <p className="text-sm text-white/60">Add items to your shopping list</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Label htmlFor="item-name" className="text-white/80">Item Name</Label>
                  <Input
                    id="item-name"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    placeholder="e.g., Chicken breast"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity" className="text-white/80">Quantity</Label>
                  <Input
                    id="item-quantity"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                    placeholder="e.g., 2 lbs"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <Label htmlFor="item-category" className="text-white/80">Category</Label>
                  <Select
                    value={currentItem.category}
                    onValueChange={(value) => setCurrentItem({...currentItem, category: value})}
                  >
                    <SelectTrigger id="item-category" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30">
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-white/10 focus:bg-white/10">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-price" className="text-white/80">Price ($)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    value={currentItem.estimated_price || ''}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      estimated_price: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddItem} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Notes for current item */}
              <div>
                <Label htmlFor="item-notes" className="text-white/80">Notes (optional)</Label>
                <Input
                  id="item-notes"
                  value={currentItem.notes || ''}
                  onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                  placeholder="Any additional notes for this item..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </GlassCard>

            {/* Items List */}
            {items.length > 0 && (
              <GlassCard hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Items ({items.length})</h2>
                  <span className="text-lg font-bold text-teal-400">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                      <Package2 className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm text-white/60">{item.quantity}</p>
                        </div>
                        <div>
                          <Badge className="text-xs bg-white/10 text-white/70 border border-white/20">
                            {item.category}
                          </Badge>
                        </div>
                        <div>
                          {item.estimated_price && (
                            <p className="text-sm font-medium text-teal-400">
                              ${item.estimated_price.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div>
                          {item.notes && (
                            <p className="text-sm text-white/50 truncate">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="flex-shrink-0 text-white/60 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Summary & Actions */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-white/60">
                    {items.length} items • Estimated total: <span className="text-teal-400 font-medium">${calculateTotal().toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/recipe-builder')}
                  className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Shopping List'}
                </Button>
              </div>
            </GlassCard>
        </div>
      </main>
      </div>
    </div>
  );
};

export default CreateShoppingList;