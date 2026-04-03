/**
 * React Native Hook Generators
 *
 * Generates custom React hooks for React Native including:
 * - useDebounce
 * - useKeyboard
 * - useRefresh
 * - useStorage
 */

// ============================================
// useDebounce Hook
// ============================================

/**
 * Generate useDebounce hook for React Native
 */
export function generateUseDebounce(): string {
  return `import { useState, useEffect, useRef } from 'react';

/**
 * Hook that debounces a value by the specified delay.
 * Useful for search inputs, auto-save, and rate limiting.
 *
 * @template T - The type of value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * \`\`\`tsx
 * const [searchText, setSearchText] = useState('');
 * const debouncedSearch = useDebounce(searchText, 300);
 *
 * useEffect(() => {
 *   // This will only fire 300ms after the user stops typing
 *   fetchSearchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * \`\`\`
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function.
 * Useful when you need to debounce function calls.
 *
 * @template T - The function type
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns A debounced version of the callback
 *
 * @example
 * \`\`\`tsx
 * const debouncedSave = useDebouncedCallback((data: FormData) => {
 *   saveToServer(data);
 * }, 1000);
 *
 * // Call this as often as you like - it will only fire once per second
 * debouncedSave(formData);
 * \`\`\`
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export default useDebounce;
`;
}

// ============================================
// useKeyboard Hook
// ============================================

/**
 * Generate useKeyboard hook for React Native
 */
export function generateUseKeyboard(): string {
  return `import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform, Dimensions } from 'react-native';

/**
 * Keyboard state returned by the useKeyboard hook
 */
export interface KeyboardState {
  /** Whether the keyboard is currently visible */
  isKeyboardVisible: boolean;
  /** Height of the keyboard in pixels (0 when hidden) */
  keyboardHeight: number;
  /** Screen height minus keyboard height */
  availableHeight: number;
}

/**
 * Hook that tracks keyboard visibility and height.
 * Handles iOS and Android differences automatically.
 *
 * iOS uses keyboardWillShow/Hide for smoother animations
 * Android uses keyboardDidShow/Hide
 *
 * @returns {KeyboardState} Object containing keyboard state
 *
 * @example
 * \`\`\`tsx
 * const { isKeyboardVisible, keyboardHeight, availableHeight } = useKeyboard();
 *
 * return (
 *   <View style={{ height: availableHeight }}>
 *     {isKeyboardVisible && (
 *       <Text>Keyboard is open! Height: {keyboardHeight}px</Text>
 *     )}
 *     <TextInput placeholder="Type here..." />
 *   </View>
 * );
 * \`\`\`
 */
export function useKeyboard(): KeyboardState {
  const screenHeight = Dimensions.get('window').height;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // iOS uses 'will' events for smoother animations
    // Android uses 'did' events as 'will' events are not reliable
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    // Subscribe to keyboard events
    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    // Cleanup subscriptions on unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
    availableHeight: screenHeight - keyboardHeight,
  };
}

/**
 * Hook that dismisses the keyboard when called.
 * Useful for creating "tap to dismiss" functionality.
 *
 * @returns A function that dismisses the keyboard
 *
 * @example
 * \`\`\`tsx
 * const dismissKeyboard = useDismissKeyboard();
 *
 * return (
 *   <TouchableWithoutFeedback onPress={dismissKeyboard}>
 *     <View style={styles.container}>
 *       <TextInput placeholder="Type here..." />
 *     </View>
 *   </TouchableWithoutFeedback>
 * );
 * \`\`\`
 */
export function useDismissKeyboard() {
  return () => {
    Keyboard.dismiss();
  };
}

export default useKeyboard;
`;
}

// ============================================
// useRefresh Hook
// ============================================

/**
 * Generate useRefresh hook for React Native
 */
export function generateUseRefresh(): string {
  return `import { useState, useCallback } from 'react';

/**
 * Return type for useRefresh hook
 */
export interface UseRefreshReturn {
  /** Whether a refresh is in progress */
  refreshing: boolean;
  /** Function to call when refresh is triggered */
  onRefresh: () => Promise<void>;
}

/**
 * Hook for handling pull-to-refresh functionality.
 * Wraps an async function and manages the refreshing state.
 *
 * @param refreshFn - Async function to call on refresh
 * @returns Object with refreshing state and onRefresh handler
 *
 * @example
 * \`\`\`tsx
 * const { refreshing, onRefresh } = useRefresh(async () => {
 *   await refetch();
 * });
 *
 * return (
 *   <FlatList
 *     data={items}
 *     refreshControl={
 *       <RefreshControl
 *         refreshing={refreshing}
 *         onRefresh={onRefresh}
 *       />
 *     }
 *     renderItem={({ item }) => <ItemCard item={item} />}
 *   />
 * );
 * \`\`\`
 */
export function useRefresh(refreshFn: () => Promise<void>): UseRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFn();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFn]);

  return { refreshing, onRefresh };
}

/**
 * Hook for handling pull-to-refresh with multiple data sources.
 * Refreshes all sources in parallel.
 *
 * @param refreshFns - Array of async functions to call on refresh
 * @returns Object with refreshing state and onRefresh handler
 *
 * @example
 * \`\`\`tsx
 * const { refreshing, onRefresh } = useMultiRefresh([
 *   () => refetchUsers(),
 *   () => refetchPosts(),
 *   () => refetchComments(),
 * ]);
 * \`\`\`
 */
export function useMultiRefresh(refreshFns: Array<() => Promise<void>>): UseRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(refreshFns.map(fn => fn()));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFns]);

  return { refreshing, onRefresh };
}

export default useRefresh;
`;
}

// ============================================
// useStorage Hook
// ============================================

/**
 * Generate useStorage hook for React Native
 */
export function generateUseStorage(): string {
  return `import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Return type for useStorage hook
 */
export interface UseStorageReturn<T> {
  /** Current stored value */
  value: T;
  /** Whether the value is being loaded */
  loading: boolean;
  /** Error if loading/saving failed */
  error: Error | null;
  /** Function to update the stored value */
  setValue: (newValue: T | ((prev: T) => T)) => Promise<void>;
  /** Function to remove the stored value */
  removeValue: () => Promise<void>;
}

/**
 * Hook for persisting state to AsyncStorage.
 * Automatically syncs state between AsyncStorage and React state.
 *
 * @template T - The type of the stored value
 * @param key - The storage key
 * @param initialValue - Initial value if nothing is stored
 * @returns Object with value, loading state, and storage functions
 *
 * @example
 * \`\`\`tsx
 * const { value: theme, setValue: setTheme, loading } = useStorage<'light' | 'dark'>(
 *   'theme',
 *   'light'
 * );
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <Button onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Toggle Theme
 *   </Button>
 * );
 * \`\`\`
 */
export function useStorage<T>(key: string, initialValue: T): UseStorageReturn<T> {
  const [value, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setStoredValue(JSON.parse(storedValue));
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load from storage'));
        console.error(\`Error loading \${key} from storage:\`, e);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage
  const setValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      try {
        setError(null);
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to save to storage'));
        console.error(\`Error saving \${key} to storage:\`, e);
        throw e;
      }
    },
    [key, value]
  );

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove from storage'));
      console.error(\`Error removing \${key} from storage:\`, e);
      throw e;
    }
  }, [key, initialValue]);

  return { value, loading, error, setValue, removeValue };
}

/**
 * Hook for storing boolean values (toggles, flags).
 *
 * @param key - The storage key
 * @param initialValue - Initial value if nothing is stored
 * @returns Object with value, toggle function, and storage functions
 *
 * @example
 * \`\`\`tsx
 * const { value: isOnboarded, toggle, setValue } = useBooleanStorage('onboarded', false);
 *
 * return (
 *   <Switch value={isOnboarded} onValueChange={toggle} />
 * );
 * \`\`\`
 */
export function useBooleanStorage(key: string, initialValue: boolean = false) {
  const { value, loading, error, setValue, removeValue } = useStorage<boolean>(key, initialValue);

  const toggle = useCallback(async () => {
    await setValue(!value);
  }, [value, setValue]);

  return { value, loading, error, setValue, toggle, removeValue };
}

/**
 * Hook for storing arrays with utility functions.
 *
 * @template T - The type of array items
 * @param key - The storage key
 * @param initialValue - Initial value if nothing is stored
 * @returns Object with array value and utility functions
 *
 * @example
 * \`\`\`tsx
 * const { items, addItem, removeItem, clearItems } = useArrayStorage<string>(
 *   'favorites',
 *   []
 * );
 *
 * return (
 *   <FlatList
 *     data={items}
 *     renderItem={({ item }) => (
 *       <ListItem
 *         title={item}
 *         onDelete={() => removeItem(item)}
 *       />
 *     )}
 *   />
 * );
 * \`\`\`
 */
export function useArrayStorage<T>(key: string, initialValue: T[] = []) {
  const { value: items, loading, error, setValue, removeValue } = useStorage<T[]>(key, initialValue);

  const addItem = useCallback(
    async (item: T) => {
      await setValue([...items, item]);
    },
    [items, setValue]
  );

  const removeItem = useCallback(
    async (item: T) => {
      await setValue(items.filter(i => i !== item));
    },
    [items, setValue]
  );

  const clearItems = useCallback(async () => {
    await setValue([]);
  }, [setValue]);

  const updateItem = useCallback(
    async (index: number, item: T) => {
      const newItems = [...items];
      newItems[index] = item;
      await setValue(newItems);
    },
    [items, setValue]
  );

  return {
    items,
    loading,
    error,
    setItems: setValue,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    removeAll: removeValue,
  };
}

export default useStorage;
`;
}
