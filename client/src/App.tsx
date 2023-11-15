import React, { PropsWithChildren } from "react";
import * as Login from "./Login";
import { SpotifyTree } from "./SpotifyTree";
import { Loader } from "./Core/Loader";

const App: React.FC = () => {
  const { data: IsLoggedIn, isLoading: isLoginLoading } = Login.useIsLoggedIn();
  return (
    <div className="w-screen h-screen overflow-hidden text-foreground bg-background">
      <Loader isLoading={isLoginLoading}>
        {IsLoggedIn ? <SpotifyTree /> : <Login.Login />}
      </Loader>
    </div>
  );
};
export default App;
