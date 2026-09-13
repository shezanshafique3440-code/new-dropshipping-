"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  CART_STORAGE_KEY,
  addItem,
  emptyCart,
  getCartItemCount,
  getCartQuantity,
  getCartSubtotal,
  isInCart,
  parseStoredCart,
  readStoredCart,
  removeItem,
  setItemQuantity,
  writeStoredCart,
} from "@/lib/cart";
import type { CartItem, CartState, Product } from "@/types";

type CartAction =
  | { type: "hydrate"; items: readonly CartItem[] }
  | { type: "add"; product: Product; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };
    case "add":
      return {
        ...state,
        items: addItem(state.items, action.product, action.quantity),
      };
    case "setQuantity":
      return {
        ...state,
        items: setItemQuantity(state.items, action.productId, action.quantity),
      };
    case "remove":
      return { ...state, items: removeItem(state.items, action.productId) };
    case "clear":
      return { ...state, items: [] };
  }
}

export interface CartContextValue {
  items: readonly CartItem[];
  /** False until the persisted cart has been read — gate counts on this. */
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  /** Product id of the most recent addition, for the "just added" highlight. */
  lastAddedId: string | null;

  /**
   * Adds a product. `openDrawer` defaults to false: quick-adds from a grid
   * should not interrupt browsing, while the considered "Add to Cart" on a
   * product page opts in and shows the cart.
   */
  add: (
    product: Product,
    quantity?: number,
    options?: { openDrawer?: boolean },
  ) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  quantityOf: (productId: string) => number;
  has: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state for the whole app.
 *
 * Server and first client render both start from an empty, unhydrated cart, so
 * the markup always matches; the persisted cart is read in an effect after
 * mount. Every surface reads from here, so the header, drawer and cart page
 * can never disagree.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read persisted state once, after mount.
  useEffect(() => {
    dispatch({ type: "hydrate", items: readStoredCart() });
  }, []);

  // Persist on every change, but never before hydration — that would write the
  // empty initial state over a real stored cart.
  useEffect(() => {
    if (state.hydrated) {
      writeStoredCart(state.items);
    }
  }, [state.items, state.hydrated]);

  // Keep other tabs in step.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }
      dispatch({ type: "hydrate", items: parseStoredCart(event.newValue) });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(
    () => () => {
      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
      }
    },
    [],
  );

  const add = useCallback(
    (product: Product, quantity = 1, options?: { openDrawer?: boolean }) => {
      dispatch({ type: "add", product, quantity });
      setLastAddedId(product.id);
      if (options?.openDrawer) {
        setDrawerOpen(true);
      }

      if (highlightTimer.current) {
        clearTimeout(highlightTimer.current);
      }
      highlightTimer.current = setTimeout(() => setLastAddedId(null), 2600);
    },
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      itemCount: getCartItemCount(state.items),
      subtotal: getCartSubtotal(state.items),
      isDrawerOpen,
      lastAddedId,
      add,
      setQuantity: (productId, quantity) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      quantityOf: (productId) => getCartQuantity(state.items, productId),
      has: (productId) => isInCart(state.items, productId),
    }),
    [state.items, state.hydrated, isDrawerOpen, lastAddedId, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
