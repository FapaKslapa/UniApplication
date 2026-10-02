"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("Timeout SW")), ms);
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(linkId: string) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { hiddenSubjects } = useAppStore();

  const subscribeMutation = api.notifications.subscribe.useMutation();
  const unsubscribeMutation = api.notifications.unsubscribe.useMutation();
  const updateFiltersMutation =
    api.notifications.updateAllFilters.useMutation();

  const checkSubscription = useCallback(async () => {
    try {
      if (!("serviceWorker" in navigator)) return;
      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        5000,
      );
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (e) {
      console.error("Check subscription failed:", e);
    }
  }, []);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
    if ("Notification" in window) {
      checkSubscription();
    }
  }, [checkSubscription]);

  useEffect(() => {
    if (isSubscribed && hiddenSubjects.length > 0) {
      updateFiltersMutation.mutate({ filters: hiddenSubjects });
    }
  }, [isSubscribed, hiddenSubjects, updateFiltersMutation.mutate]);

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) return;

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") return;

      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        5000,
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJSON = subscription.toJSON();
      if (subJSON.endpoint && subJSON.keys?.p256dh && subJSON.keys?.auth) {
        await subscribeMutation.mutateAsync({
          linkId,
          filters: hiddenSubjects,
          subscription: {
            endpoint: subJSON.endpoint,
            keys: {
              p256dh: subJSON.keys.p256dh,
              auth: subJSON.keys.auth,
            },
          },
        });
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        5000,
      );
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      await unsubscribeMutation.mutateAsync({ linkId });
      setIsSubscribed(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, isSupported, subscribe, unsubscribe };
}
