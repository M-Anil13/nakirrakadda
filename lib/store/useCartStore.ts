import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: Record<string, any>;
}

export interface CartState {
  items: CartItem[];
  selectedAddressId: string | null;
  coupon: { code: string; discount: number } | null;
  subtotal: number;
  gst: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  total: number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedAddress: (addressId: string | null) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  updatePricing: (gst: number, packagingFee: number, deliveryFee: number, discount: number) => void;
}

const calculateTotals = (items: CartItem[], gst: number, packagingFee: number, deliveryFee: number, discount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = (subtotal * gst) / 100;
  const total = subtotal + gstAmount + packagingFee + deliveryFee - discount;

  return {
    subtotal,
    gst: gstAmount,
    packagingFee,
    deliveryFee,
    discount,
    total,
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedAddressId: null,
      coupon: null,
      subtotal: 0,
      gst: 0,
      packagingFee: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.menuItemId === item.menuItemId);
          let updatedItems;

          if (existingItem) {
            updatedItems = state.items.map((i) =>
              i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            updatedItems = [...state.items, item];
          }

          const { subtotal, gst: gstAmount, packagingFee, deliveryFee, discount } = calculateTotals(
            updatedItems,
            state.gst > 0 ? (state.gst / (state.subtotal || 1)) * 100 : 18,
            state.packagingFee,
            state.deliveryFee,
            state.discount
          );

          return {
            items: updatedItems,
            subtotal,
            gst: gstAmount,
            total: subtotal + gstAmount + packagingFee + deliveryFee - discount,
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => {
          const updatedItems = state.items.filter((i) => i.id !== cartItemId);
          const { subtotal, gst: gstAmount, packagingFee, deliveryFee, discount } = calculateTotals(
            updatedItems,
            state.gst > 0 ? (state.gst / (state.subtotal || 1)) * 100 : 18,
            state.packagingFee,
            state.deliveryFee,
            state.discount
          );

          return {
            items: updatedItems,
            subtotal,
            gst: gstAmount,
            total: subtotal + gstAmount + packagingFee + deliveryFee - discount,
          };
        });
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return state.removeItem(cartItemId), state;
          }

          const updatedItems = state.items.map((i) =>
            i.id === cartItemId ? { ...i, quantity } : i
          );
          const { subtotal, gst: gstAmount, packagingFee, deliveryFee, discount } = calculateTotals(
            updatedItems,
            state.gst > 0 ? (state.gst / (state.subtotal || 1)) * 100 : 18,
            state.packagingFee,
            state.deliveryFee,
            state.discount
          );

          return {
            items: updatedItems,
            subtotal,
            gst: gstAmount,
            total: subtotal + gstAmount + packagingFee + deliveryFee - discount,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          selectedAddressId: null,
          coupon: null,
          subtotal: 0,
          gst: 0,
          packagingFee: 0,
          deliveryFee: 0,
          discount: 0,
          total: 0,
        });
      },

      setSelectedAddress: (addressId) => {
        set({ selectedAddressId: addressId });
      },

      applyCoupon: (code, discount) => {
        set((state) => {
          const newDiscount = Math.min(discount, state.subtotal);
          const newTotal = state.subtotal + state.gst + state.packagingFee + state.deliveryFee - newDiscount;
          return {
            coupon: { code, discount: newDiscount },
            discount: newDiscount,
            total: newTotal,
          };
        });
      },

      removeCoupon: () => {
        set((state) => {
          const newTotal = state.subtotal + state.gst + state.packagingFee + state.deliveryFee;
          return {
            coupon: null,
            discount: 0,
            total: newTotal,
          };
        });
      },

      updatePricing: (gst, packagingFee, deliveryFee, discount) => {
        set((state) => {
          const gstAmount = (state.subtotal * gst) / 100;
          const newTotal = state.subtotal + gstAmount + packagingFee + deliveryFee - discount;
          return {
            gst: gstAmount,
            packagingFee,
            deliveryFee,
            discount,
            total: newTotal,
          };
        });
      },
    }),
    {
      name: "cart-store",
    }
  )
);
