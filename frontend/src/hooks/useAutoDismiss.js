import { useState, useRef, useCallback, useEffect } from "react";

/**
 * State-Hook, der sich nach einer festgelegten Zeit automatisch wieder zurücksetzt.
 * Praktisch für Erfolgs-/Fehlermeldungen, die nicht dauerhaft stehen bleiben sollen.
 */
export function useAutoDismiss(initialValue = "", delay = 4000) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  const setValueWithDismiss = useCallback((newValue) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setValue(newValue);
    if (newValue) {
      timeoutRef.current = setTimeout(() => setValue(""), delay);
    }
  }, [delay]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return [value, setValueWithDismiss];
}