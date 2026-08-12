"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types/product";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string; color: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; size: string; color: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

interface CartContextType extends CartState {
  addItem: (
    product: Product,
    quantity: number,
    size: string,
    color: { name: string; hex: string; image: string }
  ) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const payloadProduct = action.payload.product;
      if (!payloadProduct || !payloadProduct.id) return state;

      const pSize = action.payload.selectedSize || "قياسي";
      const pColor = action.payload.selectedColor || {
        name: "افتراضي",
        hex: "#000000",
        image: payloadProduct.mainImage || "",
      };

      const existingIndex = state.items.findIndex(
        (item) =>
          item.product?.id === payloadProduct.id &&
          (item.selectedSize || "قياسي") === pSize &&
          (item.selectedColor?.hex || "#000000") === (pColor.hex || "#000000")
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + (action.payload.quantity || 1),
        };
        return { ...state, items: updated };
      }

      const newItem: CartItem = {
        product: payloadProduct,
        quantity: action.payload.quantity || 1,
        selectedSize: pSize,
        selectedColor: pColor,
      };

      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.product?.id === action.payload.productId &&
              (item.selectedSize || "قياسي") === (action.payload.size || "قياسي") &&
              (item.selectedColor?.hex || "#000000") === (action.payload.color || "#000000")
            )
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product?.id === action.payload.productId &&
          (item.selectedSize || "قياسي") === (action.payload.size || "قياسي") &&
          (item.selectedColor?.hex || "#000000") === (action.payload.color || "#000000")
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "nxt_cart_items_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize loaded items to ensure selectedColor and selectedSize are never missing
          const normalized: CartItem[] = parsed
            .filter((item: any) => item && item.product && item.product.id)
            .map((item: any) => ({
              product: item.product,
              quantity: item.quantity || 1,
              selectedSize: item.selectedSize || "قياسي",
              selectedColor: item.selectedColor || {
                name: "افتراضي",
                hex: "#000000",
                image: item.product.mainImage || "",
              },
            }));
          dispatch({ type: "SET_ITEMS", payload: normalized });
        }
      }
    } catch (e) {
      console.error("Cart localStorage load error:", e);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.error("Cart localStorage save error:", e);
    }
  }, [state.items]);

  const addItem = useCallback(
    (
      product: Product,
      quantity: number,
      size: string,
      color: { name: string; hex: string; image: string }
    ) => {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          product,
          quantity: quantity || 1,
          selectedSize: size || "قياسي",
          selectedColor: color || {
            name: "افتراضي",
            hex: "#000000",
            image: product?.mainImage || "",
          },
        },
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, size: string, color: string) => {
      dispatch({ type: "REMOVE_ITEM", payload: { productId, size, color } });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, color, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);

  const totalItems = state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = state.items.reduce((sum, item) => {
    const price = item.product?.salePrice ?? item.product?.price ?? 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
