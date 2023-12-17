import React from 'react';
export function useLocalStorage(storageKey: string) {
  const [data, setData] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    setData(localStorage.getItem(storageKey) || undefined);
  }, [storageKey]);
  React.useEffect(() => {
    if (data) {
      localStorage.setItem(storageKey, data);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [data, storageKey]);
  return [data, setData] as [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>
  ];
}
