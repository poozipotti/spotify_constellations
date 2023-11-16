import React, { PropsWithChildren } from "react";

type props = {
  onClick?: () => void;
};
export const Button: React.FC<PropsWithChildren<props>> = ({
  children,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
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
