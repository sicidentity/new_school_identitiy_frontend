import React from 'react';

// TypeScript polyfill for useEffectEvent
export function useEffectEvent<T extends (...args: Array<unknown>) => unknown>(callback: T): T {
  const ref = React.useRef(callback);
  
  React.useEffect(() => {
    ref.current = callback;
  });
  
  return React.useCallback(
    ((...args: Parameters<T>): ReturnType<T> => 
      ref.current(...args) as ReturnType<T>
    ) as T,
    []
  );
}

// Create a named export object that matches the expected structure
const useEffectEventModule = {
  useEffectEvent
};

export default useEffectEventModule;