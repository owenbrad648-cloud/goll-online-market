import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  store_id: string;
  store_name: string;
  max_stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "cart_guest";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from database or localStorage
  const loadCart = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            product_id,
            quantity,
            products (
              id,
              name,
              price,
              image_url,
              store_id,
              stock,
              stores (name)
            )
          `)
          .eq("user_id", user.id);

        if (error) throw error;

        const cartItems: CartItem[] = (data || [])
          .filter((item: any) => item.products)
          .map((item: any) => ({
            id: item.id,
            productId: item.products.id,
            name: item.products.name,
            price: Number(item.products.price),
            quantity: item.quantity,
            image_url: item.products.image_url,
            store_id: item.products.store_id,
            store_name: item.products.stores?.name || "فروشگاه",
            max_stock: item.products.stock,
          }));

        setItems(cartItems);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      setItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Merge localStorage cart to database on login
  const mergeLocalCartToDatabase = useCallback(async () => {
    if (!user) return;

    const localCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localCart) return;

    const localItems: CartItem[] = JSON.parse(localCart);
    if (localItems.length === 0) return;

    try {
      for (const item of localItems) {
        await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              product_id: item.productId,
              quantity: item.quantity,
            },
            { onConflict: "user_id,product_id" }
          );
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Error merging cart:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      mergeLocalCartToDatabase().then(() => loadCart());
    } else {
      loadCart();
    }
  }, [user, loadCart, mergeLocalCartToDatabase]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!user && items.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const quantity = item.quantity || 1;

    if (user) {
      try {
        const existingItem = items.find((i) => i.productId === item.productId);
        
        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + quantity, item.max_stock);
          await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", existingItem.id);
          
          setItems((prev) =>
            prev.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQuantity } : i
            )
          );
        } else {
          const { data, error } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: item.productId,
              quantity,
            })
            .select()
            .single();

          if (error) throw error;

          setItems((prev) => [...prev, { ...item, id: data.id, quantity }]);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    } else {
      // Guest user - use localStorage
      setItems((prev) => {
        const existingItem = prev.find((i) => i.productId === item.productId);
        
        if (existingItem) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.max_stock) }
              : i
          );
        }
        
        return [...prev, { ...item, quantity }];
      });
    }
  };

  const removeItem = async (id: string) => {
    if (user) {
      try {
        await supabase.from("cart_items").delete().eq("id", id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.min(Math.max(1, quantity), item.max_stock);

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", id);
        
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
        setItems([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
