import React from "react";
export function useLocalStorage(storageKey: string) {
  const localStorageData = localStorage.getItem(storageKey);
  const [localStorageState, setLocalStorageState] = React.useState<
    string | undefined
  >(localStorageData || undefined);
  React.useEffect(() => {
    if (localStorageState) {
      localStorage.setItem(storageKey, localStorageState);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, localStorageState]);
  const retVal = React.useMemo<
    [string | undefined, (newData: string | undefined) => void]
  >(() => [localStorageState, setLocalStorageState], [localStorageState]);
  return retVal;
}

export function useOnScreen(ref: React.RefObject<Element | undefined>) {
  // https://stackoverflow.com/questions/45514676/react-check-if-element-is-visible-in-dom
  const [isIntersecting, setIntersecting] = React.useState(false);

  const observer = React.useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
      ),
    []
  );

  React.useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [observer, ref]);

  return isIntersecting;
}
