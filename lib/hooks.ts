import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((val: T) => T)) => void] {
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      const init = initialValueRef.current;
      return init instanceof Function ? init() : init;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item);
      const init = initialValueRef.current;
      const fallback = init instanceof Function ? init() : init;
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      const init = initialValueRef.current;
      return init instanceof Function ? init() : init;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setStoredValue(readValue());
  }

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue];
}

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useUserId(): string {
  const [userId] = useLocalStorage<string>("userId", generateUserId);
  return userId;
}
