import React, { ReactNode } from "react";

export const Loader: React.FC<{
  isLoading: boolean;
  children?: ReactNode;
  className?: string;
}> = ({ children, isLoading, className }) => {
  if (isLoading) {
    return (
      <div className={`flex justify-center w-full ${className} p-4`}>
        <div className="h-6 w-6 border-b-2 border-double rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
};
