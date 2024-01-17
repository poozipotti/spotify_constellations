import React, { PropsWithChildren } from "react";
import { DownCarat, UpCarat } from "@core/Icons";

export const SearchTray: React.FC<
  PropsWithChildren<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }>
> = ({ children, isOpen, setIsOpen }) => {
  return (
    <>
      <button
        className={
          isOpen
            ? "hidden"
            : "text-primary-light tw-w-full flex justify-end px-6 py-4"
        }
        style={{ width: "1024px", maxWidth: "100vw" }}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <UpCarat />
      </button>

      <div
        className={`
          ${isOpen ? "" : "h-0 overflow-hidden"}
          ${isOpen ? "fixed" : "hidden"}
          justify-center flex-col 
          transition-all 
          bg-background
          border border-primary-light
          drop-shadow-md
          border-b-0
        `}
        style={{
          width: "1024px",
          maxWidth: "97vw",
          height: isOpen ? "calc(100vh - 300px)" : "",
          top: "300px",
          left: "50%",
          transform: "translate(-50%,0)",
        }}
      >
        <button
          className={
            !isOpen
              ? "hidden"
              : "text-primary-light tw-w-full flex justify-end ml-auto m-2"
          }
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <DownCarat />
        </button>
        <div className="flex justify-center flex-col h-full gap-2 p-6">
          {children}
        </div>
      </div>
    </>
  );
};
