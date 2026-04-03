import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Package, Check, X, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { recipeService } from '../../services/recipeService';
import { toast } from '../../components/ui/use-toast';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';

const ShoppingLists: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedListDetail, setSelectedListDetail] = useState<any>(null);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const loadShoppingLists = async () => {
    setLoading(true);
    try {
      const response = await recipeService.getShoppingLists({ limit: 20 });

      // Backend returns { data: ShoppingList[], total, page, limit, total_pages }
      // Extract the data array from the paginated response
      const lists = Array.isArray(response)
        ? response
        : response?.data || [];

      setShoppingLists(lists);
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
      setShoppingLists([]);
      toast({
        title: 'Failed to load shopping lists',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName) return;

    try {
      await recipeService.createShoppingList({
        name: newListName,
        description: newListDescription,
        items: []
      });
      toast({ title: 'Shopping list created successfully' });
      setCreateDialogOpen(false);
      setNewListName('');
      setNewListDescription('');
      loadShoppingLists();
    } catch (error) {
      toast({ title: 'Failed to create shopping list', variant: 'destructive' });
    }
  };

  const handleViewList = async (list: any) => {
    try {
      const fullList = await recipeService.getShoppingList(list.id);
      console.log('Full list response:', fullList);
      setSelectedListDetail(fullList);
      setListDialogOpen(true);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
      toast({ 
        title: 'Failed to load shopping list', 
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteList = async (listId: string) => {
    const confirmed = await confirm({
      title: 'Delete Shopping List',
      message: 'Are you sure you want to delete this shopping list?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      await recipeService.deleteShoppingList(listId);
      toast({ title: 'Shopping list deleted' });
      loadShoppingLists();
    } catch (error) {
      toast({ title: 'Failed to delete shopping list', variant: 'destructive' });
    }
  };

  const handleAddItem = async () => {
    if (!selectedListDetail || !newItemName || !newItemQuantity) return;

    try {
      const updated = await recipeService.addItemToShoppingList(selectedListDetail.id, {
        name: newItemName,
        quantity: newItemQuantity,
        category: newItemCategory || 'Other'
      });
      setSelectedListDetail(updated);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCategory('');
      toast({ title: 'Item added successfully' });
      loadShoppingLists();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    if (!selectedListDetail || !itemId) return;

    try {
      const updated = await recipeService.toggleShoppingListItem(
        selectedListDetail.id,
        itemId,
        !completed
      );
      setSelectedListDetail(updated);
      loadShoppingLists();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({
        title: 'Failed to update item',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedListDetail || !itemId) return;

    try {
      const updated = await recipeService.removeItemFromShoppingList(
        selectedListDetail.id,
        itemId
      );
      setSelectedListDetail(updated);
      loadShoppingLists();
      toast({ title: 'Item removed' });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: 'Failed to remove item',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const getCompletionPercentage = (list: any) => {
    try {
      // Handle different data structures for completion
      if (list?.completion_percentage !== undefined) {
        return typeof list.completion_percentage === 'number' ? list.completion_percentage : 0;
      }
      
      if (!list?.items || !Array.isArray(list.items) || list.items.length === 0) return 0;
      
      const completed = list.items.filter((item: any) => item?.completed === true).length;
      return Math.round((completed / list.items.length) * 100);
    } catch (error) {
      console.error('Error calculating completion percentage:', error);
      return 0;
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/recipe-builder')}
                  className="text-white/60 hover:text-white"
                >
                  ← Back
                </button>
                <ShoppingBag className="h-8 w-8 text-teal-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Shopping Lists</h1>
                  <p className="text-sm text-white/60">Manage your grocery shopping</p>
                </div>
              </div>
              <Button onClick={() => navigate('/recipe-builder/shopping/new')} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : Array.isArray(shoppingLists) && shoppingLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shoppingLists.map(list => {
                if (!list || !list.id) return null;
                const completion = getCompletionPercentage(list);
                return (
                  <GlassCard key={list.id} className="cursor-pointer" glow onClick={() => handleViewList(list)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{list.name}</h3>
                        {list.description && (
                          <p className="mt-1 text-sm text-white/60">{list.description}</p>
                        )}
                      </div>
                      {completion === 100 && (
                        <Check className="h-5 w-5 text-teal-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Items:</span>
                        <span className="font-medium text-white">{list.total_items || list.items?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Completed:</span>
                        <span className="font-medium text-white">{completion}%</span>
                      </div>
                      {list.store && list.store !== 'string' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Store:</span>
                          <span className="font-medium text-white">{list.store}</span>
                        </div>
                      )}
                      <div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                               style={{width: `${completion}%`}}></div>
                        </div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewList(list);
                          }}
                        >
                          View Items
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
              );
            })}
            </div>
          ) : (
            <GlassCard className="max-w-md mx-auto" hover={false}>
              <div className="text-center py-6">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-lg font-semibold mb-2 text-white">No shopping lists yet</h3>
                <p className="text-white/60 mb-6">
                  Create your first shopping list to start organizing your grocery trips
                </p>
                <Button onClick={() => navigate('/recipe-builder/shopping/new')} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </Button>
              </div>
            </GlassCard>
          )}
        </main>
      </div>

      {/* Create List Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create Shopping List</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new shopping list to organize your groceries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-white/80">List Name</Label>
              <Input
                id="name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Weekly Groceries"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white/80">Description (optional)</Label>
              <Textarea
                id="description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Add notes about this shopping list..."
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={handleCreateList} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shopping List Detail Dialog */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedListDetail?.name}</DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedListDetail?.description || 'Manage your shopping list items'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Add new item */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-base font-semibold text-white mb-4">Add New Item</h3>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 min-w-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Input
                  placeholder="Quantity"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-32 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Input
                  placeholder="Category"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-32 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Button onClick={handleAddItem} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">Add</Button>
              </div>
            </div>

            {/* Items list */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-base font-semibold text-white mb-4">Items</h3>
              <div className="space-y-2">
                {selectedListDetail?.items && Array.isArray(selectedListDetail.items) ? selectedListDetail.items.map((item: any, index: number) => (
                  <div key={item.id || `item-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Checkbox
                      checked={item.completed || false}
                      onCheckedChange={() => item.id && handleToggleItem(item.id, item.completed)}
                      className="border-white/40 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <div className="flex-1">
                      <span className={item.completed ? 'line-through text-white/40' : 'text-white'}>
                        {item.name}
                      </span>
                      <span className="ml-2 text-sm text-white/50">
                        {item.quantity}
                      </span>
                      {item.category && (
                        <span className="ml-2 text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => item.id && handleRemoveItem(item.id)}
                      disabled={!item.id}
                      className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )) : (
                  <p className="text-center text-white/50 py-4">No items in this list yet</p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Progress</span>
                <span className="text-white font-medium">{getCompletionPercentage(selectedListDetail)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                     style={{width: `${getCompletionPercentage(selectedListDetail)}%`}}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setListDialogOpen(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingLists;