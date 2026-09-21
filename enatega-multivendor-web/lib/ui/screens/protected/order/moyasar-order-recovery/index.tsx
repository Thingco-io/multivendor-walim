"use client";

import useUser from "@/lib/hooks/useUser";
import { onUseLocalStorage } from "@/lib/utils/methods/local-storage";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const COUPON_STORAGE_KEY = "applied_coupon";
const COUPON_TEXT_STORAGE_KEY = "coupon_text";
const COUPON_APPLIED_STORAGE_KEY = "is_coupon_applied";
const COUPON_RESTAURANT_KEY = "coupon_restaurant_id";
export const PENDING_MOYASAR_ORDER_ID_KEY = "pending_moyasar_order_id";

/**
 * Unlike Stripe, the Moyasar server-side callback already verifies payment
 * and creates the order before redirecting the browser straight to
 * /order/[id]/tracking, so there's no async webhook race to poll for here.
 * This just clears the cart/coupon once that landing actually happens,
 * mirroring what the checkout screen does synchronously for COD/PAYPAL -
 * deferred until here so an abandoned or failed card payment doesn't lose
 * the customer's cart.
 */
export default function MoyasarOrderRecovery() {
  const pathname = usePathname();
  const { clearCart } = useUser();
  const hasCleanedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasCleanedRef.current) return;

    const pendingOrderId = onUseLocalStorage(
      "get",
      PENDING_MOYASAR_ORDER_ID_KEY,
    );
    if (!pendingOrderId || !pathname.includes("/tracking")) return;

    hasCleanedRef.current = true;
    onUseLocalStorage("delete", COUPON_STORAGE_KEY);
    onUseLocalStorage("delete", COUPON_TEXT_STORAGE_KEY);
    onUseLocalStorage("delete", COUPON_APPLIED_STORAGE_KEY);
    onUseLocalStorage("delete", COUPON_RESTAURANT_KEY);
    onUseLocalStorage("delete", PENDING_MOYASAR_ORDER_ID_KEY);
    void clearCart();
  }, [pathname, clearCart]);

  return null;
}
