import React, { PropsWithChildren } from "react";

type props = {
  onClick?: () => void;
  hideBorder?: boolean;
};
export const Button: React.FC<PropsWithChildren<props>> = ({
  children,
  onClick,
  hideBorder,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        ${hideBorder ? "" : "border border-primary-light p-2 px-6"}
        text-primary-light
        uppercase 
        
      `}
    >
      {children}
    </button>
  );
};
