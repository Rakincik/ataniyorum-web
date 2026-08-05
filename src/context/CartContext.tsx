"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID for variant + addons combination
  productId: string;
  productSlug: string;
  title: string;
  image?: string;
  categoryName?: string;
  variantId: string;
  variantName: string;
  basePrice: number;
  variantPrice: number;
  addons: CartAddon[];
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ataniyorum_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Cart load error", e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ataniyorum_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, "cartItemId">) => {
    // Generate unique ID based on variantId and addon IDs
    const addonIds = newItem.addons.map(a => a.id).sort().join("-");
    const cartItemId = `${newItem.variantId}_${addonIds}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, cartItemId }];
    });

    // Automatically slide open the cart drawer when item is added!
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemSinglePrice = item.basePrice + item.variantPrice + item.addons.reduce((sum, a) => sum + a.price, 0);
      return total + (itemSinglePrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      openCart,
      closeCart,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
