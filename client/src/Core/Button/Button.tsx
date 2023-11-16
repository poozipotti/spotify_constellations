import React, { PropsWithChildren } from "react";

export const Button: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <button
      className={`
        border border-primary-light  
        text-primary-light
        uppercase 
        p-2 px-6
      `}
    >
      {children}
    </button>
  );
};
