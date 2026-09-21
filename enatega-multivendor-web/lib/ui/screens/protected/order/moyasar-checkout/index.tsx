"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useConfig } from "@/lib/context/configuration/configuration.context";
import useToast from "@/lib/hooks/useToast";
import { onUseLocalStorage } from "@/lib/utils/methods/local-storage";
import { MOYASAR_ALLOWED_CURRENCIES } from "@/lib/utils/constants/currencies";
import { PENDING_MOYASAR_ORDER_ID_KEY } from "@/lib/ui/screens/protected/order/moyasar-order-recovery";

const MOYASAR_JS_URL = "https://cdn.moyasar.com/mpf/1.19.0/moyasar.js";
const MOYASAR_CSS_URL = "https://cdn.moyasar.com/mpf/1.19.0/moyasar.css";
const MOYASAR_SCRIPT_ID = "moyasar-mpf-script";
const MOYASAR_STYLE_ID = "moyasar-mpf-style";

interface IMoyasarOrderDetails {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  publishableKey: string;
  callbackUrl: string;
}

interface IMoyasarPayment {
  id: string;
  status: string;
}

// The hosted form is vanilla JS loaded from Moyasar's CDN; it isn't typed,
// so this is the minimal shape this screen actually calls.
interface IMoyasarGlobal {
  init: (config: {
    element: string;
    amount: number;
    currency: string;
    description: string;
    publishable_api_key: string;
    callback_url: string;
    methods: string[];
    metadata: Record<string, string>;
    on_completed?: (payment: IMoyasarPayment) => void | Promise<void>;
    on_failure?: (error: unknown) => void;
  }) => void;
}

declare global {
  interface Window {
    Moyasar?: IMoyasarGlobal;
  }
}

let moyasarAssetsPromise: Promise<void> | null = null;

function loadMoyasarAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window is not available"));
  }
  if (window.Moyasar) {
    return Promise.resolve();
  }
  if (moyasarAssetsPromise) {
    return moyasarAssetsPromise;
  }

  moyasarAssetsPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById(MOYASAR_STYLE_ID)) {
      const link = document.createElement("link");
      link.id = MOYASAR_STYLE_ID;
      link.rel = "stylesheet";
      link.href = MOYASAR_CSS_URL;
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(
      MOYASAR_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Moyasar payment form")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MOYASAR_SCRIPT_ID;
    script.src = MOYASAR_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Moyasar payment form"));
    document.body.appendChild(script);
  });

  return moyasarAssetsPromise;
}

export default function MoyasarCheckoutScreen() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { SERVER_URL } = useConfig();
  const { showToast } = useToast();

  const orderId = searchParams.get("id");
  const hasFailed = searchParams.get("error") === "1";

  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "error">(
    "loading",
  );
  const [orderDetails, setOrderDetails] = useState<IMoyasarOrderDetails | null>(
    null,
  );

  const formInitializedRef = useRef(false);
  const failureToastShownRef = useRef(false);

  useEffect(() => {
    if (hasFailed && !failureToastShownRef.current) {
      failureToastShownRef.current = true;
      showToast({
        type: "error",
        title: t("moyasar_payment_failed_title"),
        message: t("moyasar_payment_failed_toast"),
      });
    }
  }, [hasFailed, showToast, t]);

  useEffect(() => {
    if (!orderId) {
      setStatus("not-found");
      return;
    }

    let isCancelled = false;

    const fetchOrderDetails = async () => {
      try {
        const url = new URL("moyasar/order-details", SERVER_URL);
        url.searchParams.set("id", orderId);
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = (await response.json()) as IMoyasarOrderDetails;
        if (!isCancelled) {
          setOrderDetails(data);
          setStatus("ready");
        }
      } catch {
        if (!isCancelled) {
          setStatus("not-found");
        }
      }
    };

    void fetchOrderDetails();

    return () => {
      isCancelled = true;
    };
  }, [orderId, SERVER_URL]);

  const onCompletedPayment = useCallback(
    async (payment: IMoyasarPayment) => {
      if (!orderDetails) return;
      try {
        const url = new URL("moyasar/on-completed", SERVER_URL);
        await fetch(url.toString(), {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            orderId: orderDetails.orderId,
            paymentId: payment.id,
          }),
        });
      } catch {
        // Best-effort only: the callback redirect and the payment_paid
        // webhook are the authoritative confirmations, this just gives us
        // a head start on reconciliation if the browser never returns.
      }
    },
    [orderDetails, SERVER_URL],
  );

  useEffect(() => {
    if (status !== "ready" || !orderDetails || formInitializedRef.current) {
      return;
    }

    let isCancelled = false;

    loadMoyasarAssets()
      .then(() => {
        if (isCancelled || formInitializedRef.current || !window.Moyasar) return;
        formInitializedRef.current = true;

        onUseLocalStorage(
          "save",
          PENDING_MOYASAR_ORDER_ID_KEY,
          orderDetails.orderId,
        );

        window.Moyasar.init({
          element: ".mysr-form",
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          description: orderDetails.description,
          publishable_api_key: orderDetails.publishableKey,
          callback_url: orderDetails.callbackUrl,
          methods: ["creditcard"],
          metadata: {orderId: orderDetails.orderId},
          on_completed: onCompletedPayment,
          on_failure: (error) => {
            showToast({
              type: "error",
              title: t("moyasar_payment_failed_title"),
              message:
                typeof error === "string" && error
                  ? error
                  : t("moyasar_payment_failed_toast"),
            });
          },
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setStatus("error");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [status, orderDetails, onCompletedPayment, showToast, t]);

  const isTestMode = orderDetails?.publishableKey?.startsWith("pk_test_");
  const currencyInfo = orderDetails
    ? MOYASAR_ALLOWED_CURRENCIES.find(
        (c) => c.currency === orderDetails.currency,
      )
    : undefined;
  const displayAmount =
    orderDetails && currencyInfo
      ? (orderDetails.amount / currencyInfo.multiplier).toFixed(2)
      : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("moyasar_checkout_title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("moyasar_checkout_subtitle")}
        </p>

        {displayAmount && orderDetails ? (
          <div className="mt-4 flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100">
            <span>{orderDetails.orderId}</span>
            <span>
              {displayAmount} {orderDetails.currency}
            </span>
          </div>
        ) : null}

        {isTestMode ? (
          <p className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            {t("moyasar_test_mode_notice")}
          </p>
        ) : null}

        <div className="mt-6">
          {status === "loading" ? (
            <div className="flex justify-center py-10">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-2xl text-primary-color"
              />
            </div>
          ) : null}

          {status === "not-found" ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("moyasar_order_not_found")}
            </p>
          ) : null}

          {status === "error" ? (
            <p className="py-6 text-center text-sm text-red-500">
              {t("moyasar_payment_failed_toast")}
            </p>
          ) : null}

          {/* Moyasar mounts its hosted card fields into this element. */}
          <div className="mysr-form" />
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-full border border-gray-300 dark:border-gray-600 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          onClick={() => router.replace("/order/checkout")}
        >
          {t("moyasar_back_to_checkout")}
        </button>
      </div>
    </div>
  );
}
