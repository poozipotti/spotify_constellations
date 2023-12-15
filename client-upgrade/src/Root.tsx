import React, { PropsWithChildren } from "react";


const Root: React.FC<PropsWithChildren> = ({ children }) => {

  return (
    <div className="w-screen h-screen overflow-hidden text-foreground bg-background">
    </div>
  );
};
export default Root;
