"use client";

import { useState, useEffect, useCallback } from "react";

// Convierte base64 (URL-safe) a Uint8Array para la suscripción push
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof window !== "undefined" ? window.atob(base64) : "";
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export interface PushState {
  supported: boolean;
  permission: NotificationPermission | "default";
  subscribed: boolean;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications(vapidPublicKey?: string) {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "default",
    subscribed: false,
    loading: false,
    error: null,
  });

  // Verifica soporte + estado inicial
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    const permission = supported ? Notification.permission : "default";
    setState((s) => ({ ...s, supported, permission }));

    // Verifica si ya hay suscripción activa
    if (supported && vapidPublicKey) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setState((s) => ({ ...s, subscribed: !!sub }));
        })
        .catch(() => {});
    }
  }, [vapidPublicKey]);

  const subscribe = useCallback(async () => {
    if (!state.supported || !vapidPublicKey) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // 1. Pedir permiso
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, loading: false, error: "Permiso denegado" }));
        return;
      }

      // 2. Registrar service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 3. Crear suscripción push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 4. Enviar suscripción al servidor
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) throw new Error("Error guardando suscripción");

      setState((s) => ({ ...s, subscribed: true, loading: false, permission }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : "Error" }));
    }
  }, [state.supported, vapidPublicKey]);

  return { ...state, subscribe };
}
