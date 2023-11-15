import React, { ReactNode } from "react";

export const Loader: React.FC<{ isLoading: boolean; children: ReactNode }> = ({
  children,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>loading!</p>
      </div>
    );
  }
  return <>{children}</>;
};
