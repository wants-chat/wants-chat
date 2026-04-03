import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateWishlist = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'multipleLists' = 'grid'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const formatPrice = `(price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }`;

  const getRatingStars = `(rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={\`full-\${i}\`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-3 h-3 text-gray-300" />
        ))}
      </>
    );
  }`;

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, ShoppingCart, Trash2, Share2, Star, Package, MoveRight, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';`;

  const commonStyles = `
    .wishlist-container {
      @apply w-full;
    }

    .wishlist-header {
      @apply mb-6;
    }

    .wishlist-item {
      @apply bg-white rounded-lg overflow-hidden transition-all hover:shadow-md;
    }

    .item-image-container {
      @apply relative bg-gray-100 overflow-hidden;
    }

    .item-image {
      @apply w-full h-full object-cover;
    }

    .item-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md bg-red-500 text-white;
    }

    .out-of-stock-badge {
      @apply absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-md bg-red-500 text-white;
    }

    .item-actions {
      @apply flex gap-2;
    }

    .action-button {
      @apply p-2 rounded-full hover:bg-gray-100 transition-colors;
    }

    .price-container {
      @apply flex items-center gap-2;
    }

    .original-price {
      @apply line-through text-gray-400 text-sm;
    }

    .discount-percentage {
      @apply text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded;
    }

    .empty-state {
      @apply text-center py-16;
    }

    .empty-icon {
      @apply w-16 h-16 mx-auto mb-4 text-gray-300;
    }

    .list-card {
      @apply bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all;
    }

    .list-card.active {
      @apply ring-2 ring-blue-500;
    }
  `;

  const variants = {
    grid: `
${commonImports}

interface WishlistProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const Wishlist: React.FC<WishlistProps> = ({ ${dataName}, className, onRemoveFromWishlist, onAddToCart }) => {
  const [items, setItems] = useState<any[]>([]);

  // Fetch data using React Query (optional - falls back to localStorage)
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  // Load wishlist from localStorage on mount or use fetched data
  useEffect(() => {
    if (${dataName}) {
      setItems(Array.isArray(${dataName}) ? ${dataName} : ${dataName}?.items || []);
      return;
    }
    if (fetchedData) {
      setItems(Array.isArray(fetchedData) ? fetchedData : fetchedData?.items || []);
      return;
    }
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const parsedWishlist = JSON.parse(stored);
        setItems(parsedWishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
  }, [${dataName}, fetchedData]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [items]);

  const addToCartText = ${getField('addToCartText')} || 'Add to Cart';
  const removeText = ${getField('removeText')} || 'Remove';
  const shareWishlistText = ${getField('shareWishlistText')} || 'Share';
  const emptyWishlistTitle = ${getField('emptyWishlistTitle')} || 'Your wishlist is empty';
  const emptyWishlistDescription = ${getField('emptyWishlistDescription')} || 'Save items you love for later';
  const browseProductsText = ${getField('browseProductsText')} || 'Browse Products';
  const itemsText = ${getField('itemsText')} || 'items';

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const removeItem = (itemId: string) => {
    const item = items.find((i: any) => i.productId === itemId);
    setItems(items.filter((i: any) => i.productId !== itemId));
    toast.success(\`\${item?.name || 'Item'} removed from wishlist\`);
  };

  const addToCart = (item: any) => {
    try {
      const stored = localStorage.getItem('cart');
      let cart = stored ? JSON.parse(stored) : [];

      const existingItem = cart.find((cartItem: any) => cartItem.productId === item.productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success(\`\${item.name} added to cart!\`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const shareWishlist = () => {
    toast.info('Share functionality coming soon!');
  };

  const viewDetails = (item: any) => {
    toast.info('Viewing details for ' + item.name);
  };

  return (
    <>
<div className="wishlist-container p-6">
        <div className="wishlist-header flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{items.length} {itemsText}</p>
          </div>
          {items.length > 0 && (
            <Button onClick={shareWishlist} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              {shareWishlistText}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" />
            <h2 className="text-2xl font-semibold mb-2">{emptyWishlistTitle}</h2>
            <p className="text-gray-600 mb-6">{emptyWishlistDescription}</p>
            <Button>{browseProductsText}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item: any) => (
              <Card key={item.productId} className="wishlist-item">
                <div className="item-image-container h-64" onClick={() => viewDetails(item)}>
                  {item.discount && (
                    <Badge className="item-badge">-{item.discount}%</Badge>
                  )}
                  {!item.inStock && (
                    <Badge className="out-of-stock-badge">Out of Stock</Badge>
                  )}
                  <img
                    src={item.image || '/api/placeholder/300/300'}
                    alt={item.name}
                    className="item-image cursor-pointer hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{item.name}</h3>
                  {item.brand && (
                    <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                  )}
                  {item.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {getRatingStars(item.rating)}
                      <span className="text-sm text-gray-500 ml-1">
                        {item.rating} ({item.reviewCount})
                      </span>
                    </div>
                  )}
                  <div className="price-container mb-4">
                    <span className="text-xl font-bold">{formatPrice(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="original-price">{formatPrice(item.originalPrice)}</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addToCartText}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
    `,

    list: `
${commonImports}

interface WishlistProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const Wishlist: React.FC<WishlistProps> = ({ ${dataName}, className, onRemoveFromWishlist, onAddToCart }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const wishlistData = ${dataName} || fetchedData || {};
  const wishlist = wishlistData.wishlist || ${getField('wishlist')};

  const [items, setItems] = useState(wishlist?.items || []);

  useEffect(() => {
    if (wishlist?.items) {
      setItems(wishlist.items);
    }
  }, [wishlist]);

  const addToCartText = ${getField('addToCartText')};
  const removeText = ${getField('removeText')};
  const shareWishlistText = ${getField('shareWishlistText')};
  const viewDetailsText = ${getField('viewDetailsText')};
  const emptyWishlistTitle = ${getField('emptyWishlistTitle')};
  const emptyWishlistDescription = ${getField('emptyWishlistDescription')};
  const browseProductsText = ${getField('browseProductsText')};
  const itemsText = ${getField('itemsText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const removeItem = (itemId: number) => {
    setItems(items.filter((item: any) => item.id !== itemId));
    console.log('Removed item:', itemId);
  };

  const addToCart = (item: any) => {
    console.log('Adding to cart:', item);
  };

  const shareWishlist = () => {
    console.log('Sharing wishlist');
  };

  if (isLoading && !${dataName}) {
    return (
      <div className="wishlist-container p-6 max-w-4xl mx-auto flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className="wishlist-container p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-500">Failed to load wishlist</p>
      </div>
    );
  }

  return (
    <>
<div className="wishlist-container p-6 max-w-4xl mx-auto">
        <div className="wishlist-header flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{items.length} {itemsText}</p>
          </div>
          {items.length > 0 && (
            <Button onClick={shareWishlist} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              {shareWishlistText}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" />
            <h2 className="text-2xl font-semibold mb-2">{emptyWishlistTitle}</h2>
            <p className="text-gray-600 mb-6">{emptyWishlistDescription}</p>
            <Button>{browseProductsText}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <Card key={item.id} className="wishlist-item">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="item-image-container w-full md:w-48 h-48 bg-gray-100">
                      {item.discount && (
                        <Badge className="item-badge">-{item.discount}%</Badge>
                      )}
                      {!item.inStock && (
                        <Badge className="out-of-stock-badge">Out of Stock</Badge>
                      )}
                      <img
                        src={item.image || '/api/placeholder/300/200'}
                        alt={item.name}
                        className="item-image"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                          {item.brand && (
                            <p className="text-sm text-gray-600">{item.brand}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      {item.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {getRatingStars(item.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {item.rating} ({item.reviewCount} reviews)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="price-container mb-2">
                            <span className="text-2xl font-bold">{formatPrice(item.price)}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="original-price ml-2">{formatPrice(item.originalPrice)}</span>
                            )}
                          </div>
                          {item.addedDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              Added on {new Date(item.addedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToCart(item)}
                            disabled={!item.inStock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addToCartText}
                          </Button>
                          <Button variant="outline">
                            {viewDetailsText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
    `,

    multipleLists: `
${commonImports}

interface WishlistProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const Wishlist: React.FC<WishlistProps> = ({ ${dataName}, className, onRemoveFromWishlist, onAddToCart }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const wishlistData = ${dataName} || fetchedData || {};
  const wishlist = wishlistData.wishlist || ${getField('wishlist')};

  const [items, setItems] = useState(wishlist?.items || []);
  const [lists, setLists] = useState(wishlist?.lists || []);
  const [selectedList, setSelectedList] = useState(lists[0]?.id || 1);
  const [isCreatingList, setIsCreatingList] = useState(false);

  useEffect(() => {
    if (wishlist?.items) {
      setItems(wishlist.items);
    }
    if (wishlist?.lists) {
      setLists(wishlist.lists);
      if (!selectedList && wishlist.lists[0]) {
        setSelectedList(wishlist.lists[0].id);
      }
    }
  }, [wishlist]);

  const addToCartText = ${getField('addToCartText')};
  const removeText = ${getField('removeText')};
  const moveToListText = ${getField('moveToListText')};
  const shareWishlistText = ${getField('shareWishlistText')};
  const createListText = ${getField('createListText')};
  const itemsText = ${getField('itemsText')};
  const createdText = ${getField('createdText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const filteredItems = items.filter((item: any) => item.listId === selectedList);
  const currentList = lists.find(list => list.id === selectedList);

  const removeItem = (itemId: number) => {
    setItems(items.filter((item: any) => item.id !== itemId));
    console.log('Removed item:', itemId);
  };

  const addToCart = (item: any) => {
    console.log('Adding to cart:', item);
  };

  const moveItem = (itemId: number, targetListId: number) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, listId: targetListId } : item
    ));
    console.log('Moved item:', itemId, 'to list:', targetListId);
  };

  const shareList = (listId: number) => {
    console.log('Sharing list:', listId);
  };

  const createNewList = () => {
    console.log('Creating new list');
    setIsCreatingList(false);
  };

  if (isLoading && !${dataName}) {
    return (
      <div className="wishlist-container p-6 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className="wishlist-container p-6 text-center">
        <p className="text-red-500">Failed to load wishlists</p>
      </div>
    );
  }

  return (
    <>
<div className="wishlist-container p-6">
        <div className="wishlist-header">
          <h1 className="text-3xl font-bold mb-6">My Wishlists</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Lists Sidebar */}
          <div className="space-y-3">
            {lists.map((list: any) => (
              <Card
                key={list.id}
                className={\`list-card \${selectedList === list.id ? 'active' : ''}\`}
                onClick={() => setSelectedList(list.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{list.name}</h3>
                  {list.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                {list.description && (
                  <p className="text-sm text-gray-600 mb-2">{list.description}</p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{list.itemCount} {itemsText}</span>
                  <span>{createdText} {new Date(list.createdDate).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreatingList(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createListText}
            </Button>
          </div>

          {/* Items Grid */}
          <div className="md:col-span-3">
            {currentList && (
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{currentList.name}</h2>
                  <p className="text-gray-600">{filteredItems.length} {itemsText}</p>
                </div>
                <Button onClick={() => shareList(selectedList)} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  {shareWishlistText}
                </Button>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <Heart className="empty-icon" />
                <h2 className="text-2xl font-semibold mb-2">This list is empty</h2>
                <p className="text-gray-600">Add items to this wishlist</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item: any) => (
                  <Card key={item.id} className="wishlist-item">
                    <div className="item-image-container h-48">
                      {item.discount && (
                        <Badge className="item-badge">-{item.discount}%</Badge>
                      )}
                      {!item.inStock && (
                        <Badge className="out-of-stock-badge">Out of Stock</Badge>
                      )}
                      <img
                        src={item.image || '/api/placeholder/300/300'}
                        alt={item.name}
                        className="item-image"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 truncate">{item.name}</h3>
                      {item.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {getRatingStars(item.rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            {item.rating}
                          </span>
                        </div>
                      )}
                      <div className="price-container mb-3">
                        <span className="text-lg font-bold">{formatPrice(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="original-price">{formatPrice(item.originalPrice)}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {addToCartText}
                        </Button>
                        <div className="flex gap-2">
                          <Select onValueChange={(value) => moveItem(item.id, parseInt(value))}>
                            <SelectTrigger className="flex-1 h-8 text-xs">
                              <SelectValue placeholder={moveToListText} />
                            </SelectTrigger>
                            <SelectContent>
                              {lists
                                .filter(list => list.id !== selectedList)
                                .map((list: any) => (
                                  <SelectItem key={list.id} value={list.id.toString()}>
                                    {list.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
    `
  };

  return variants[variant] || variants.grid;
};
