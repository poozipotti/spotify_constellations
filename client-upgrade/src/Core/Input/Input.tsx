import React, { ChangeEventHandler, PropsWithChildren } from "react";

export const Input: React.FC<
  PropsWithChildren<{
    onChange: ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
  }>
> = ({ children, onChange,placeholder }) => {
  return (
    <input
      className={`
        border border-primary-light  
        bg-transparent
        text-primary-light
        placeholder:text-gray-300
        p-2
        z-10
      `}
      onChange={onChange}

      placeholder={placeholder}

      style={{
        filter:  "drop-shadow(0px 0px 5px rgba(134,239,172,.5))",
      }}
    >
      {children}
    </input>
  );
};
