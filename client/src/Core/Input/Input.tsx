import React, { ChangeEventHandler, PropsWithChildren } from "react";

export const Input: React.FC<
  PropsWithChildren<{
    onChange: ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
  }>
> = ({ children, onChange, placeholder }) => {
  return (
    <input
      className={`
        border border-primary-light  
        bg-transparent
        text-primary-light
        placeholder:text-gray-300
        p-2
        z-10
        drop-shadow-md
      `}
      onChange={onChange}
      placeholder={placeholder}
    >
      {children}
    </input>
  );
};
