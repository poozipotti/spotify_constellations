import { PropsWithChildren, forwardRef } from "react";

type props = {
  onClick?: () => void;
  hideBorder?: boolean;
  isLoading?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<props>>(
  ({ children, onClick, hideBorder, isLoading }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={isLoading}
        className={`
        ${hideBorder ? "" : "border border-primary-light p-2 px-6"}
        text-primary-light
        uppercase 
        
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
