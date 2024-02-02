import { PropsWithChildren, forwardRef } from "react";

type props = {
  onClick?: () => void;
  hideBorder?: boolean;
  isLoading?: boolean;
  hidden?: boolean;
  disabled?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<props>>(
  ({ disabled, hidden, children, onClick, hideBorder, isLoading }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`
        ${
          hideBorder
            ? ""
            : disabled
            ? "border border-gray-800 p-2 px-6"
            : "border border-primary-light p-2 px-6"
        }

        ${hidden ? "hidden" : ""}
        ${disabled ? "text-gray-800" : "text-primary-light"}
        uppercase 
        ${disabled ? "" : "drop-shadow-lg"}
        
      `}
      >
        {isLoading ? (
          <div className={`flex justify-center w-full`}>
            <div className="h-6 w-6 border-b-2 border-t-2 rounded-full animate-spin border-primary-light" />
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
