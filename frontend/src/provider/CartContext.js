"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import cartService from "@/services/cart.service";

const CartContext = createContext(null);

const emptyCart = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [cartBadge, setCartBadge] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();

      if (data && Array.isArray(data.items)) {
        setCart(data);
        setCartBadge(data.totalItems || 0);
      } else {
        setCart(emptyCart);
        setCartBadge(0);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart(emptyCart);
      setCartBadge(0);
    }
  }, []);

  useEffect(() => {
    const clearCartState = () => {
      setCart(emptyCart);
      setCartBadge(0);
    };

    const handleAuthLogin = () => {
      refreshCart();
    };

    window.addEventListener("auth:login", handleAuthLogin);
    window.addEventListener("auth:logout", clearCartState);

    return () => {
      window.removeEventListener("auth:login", handleAuthLogin);
      window.removeEventListener("auth:logout", clearCartState);
    };
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);

    try {
      const updated = await cartService.addItem(productId, quantity);

      if (!updated) {
        return {
          success: false,
          requiresLogin: true,
          message: "Please login to add items to cart.",
        };
      }

      setCart(updated);
      setCartBadge(updated.totalItems || 0);

      return {
        success: true,
        cart: updated,
      };
    } catch (error) {
      console.error("Failed to add item to cart:", error);

      return {
        success: false,
        requiresLogin: error?.status === 401,
        message:
          error?.status === 401
            ? "Please login to add items to cart."
            : error?.message || "Failed to add item to cart.",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updated = await cartService.updateQuantity(itemId, quantity);

      if (!updated) {
        return {
          success: false,
          requiresLogin: true,
        };
      }

      setCart(updated);
      setCartBadge(updated.totalItems || 0);

      return {
        success: true,
        cart: updated,
      };
    } catch (error) {
      console.error("Failed to update cart quantity:", error);

      return {
        success: false,
        requiresLogin: error?.status === 401,
        message:
          error?.status === 401
            ? "Please login to update your cart."
            : error?.message || "Failed to update cart quantity.",
      };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updated = await cartService.removeItem(itemId);

      if (!updated) {
        return {
          success: false,
          requiresLogin: true,
        };
      }

      setCart(updated);
      setCartBadge(updated.totalItems || 0);

      return {
        success: true,
        cart: updated,
      };
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      return {
        success: false,
        requiresLogin: error?.status === 401,
        message:
          error?.status === 401
            ? "Please login to modify your cart."
            : error?.message || "Failed to remove cart item.",
      };
    }
  };

  const clearCart = async () => {
    try {
      const updated = await cartService.clearCart();

      if (!updated) {
        setCart(emptyCart);
        setCartBadge(0);

        return {
          success: false,
          requiresLogin: true,
        };
      }

      const newCart =
        updated && Array.isArray(updated.items) ? updated : emptyCart;

      setCart(newCart);
      setCartBadge(newCart.totalItems || 0);

      return {
        success: true,
        cart: newCart,
      };
    } catch (error) {
      console.error("Failed to clear cart:", error);

      return {
        success: false,
        requiresLogin: error?.status === 401,
        message:
          error?.status === 401
            ? "Please login to clear your cart."
            : error?.message || "Failed to clear cart.",
      };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartBadge,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
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
