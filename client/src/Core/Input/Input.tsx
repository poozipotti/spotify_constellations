import React, { ChangeEventHandler, PropsWithChildren } from "react";

export const Input: React.FC<
  PropsWithChildren<{
    onChange?: ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    stretch?: boolean;
    isLoading?: boolean;
    value?: string;
    defaultValue?: string;
    secondary?: boolean;
  }>
> = ({
  defaultValue,
  value,
  isLoading,
  children,
  onChange,
  placeholder,
  stretch,
  secondary,
}) => {
  return (
    <input
      defaultValue={defaultValue}
      className={`
        border ${secondary ? "border-foreground" : " border-primary-light"}
        bg-transparent
        ${secondary ? "text-foreground" : " text-primary-light"}
        placeholder:text-gray-300
        p-2
        z-10
        ${secondary ? "" : "drop-shadow-md"}
        ${stretch ? "w-full" : ""}
      `}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    >
      {isLoading ? (
        <div className={`flex justify-center w-full`}>
          <div className="h-6 w-6 border-b-2 border-t-2 rounded-full animate-spin border-primary-light" />
        </div>
      ) : (
        children
      )}
    </input>
  );
};
