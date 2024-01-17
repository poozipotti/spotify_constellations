import React, { ChangeEventHandler, PropsWithChildren } from "react";

export const Input: React.FC<
  PropsWithChildren<{
    onChange: ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
    stretch?: boolean;
  }>
> = ({ children, onChange, placeholder, stretch }) => {
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
        ${stretch ? "w-full" : ""}
      `}
      onChange={onChange}
      placeholder={placeholder}
    >
      {children}
    </input>
  );
};
