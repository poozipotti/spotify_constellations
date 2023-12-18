import React from 'react';
export function useLocalStorage(storageKey: string) {
  const localStorageData =localStorage.getItem(storageKey);
  const setData = React.useCallback((newData:string) => {
    if (newData) {
      localStorage.setItem(storageKey, newData);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);
  return [localStorageData, setData] as [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>
  ];
}
