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
